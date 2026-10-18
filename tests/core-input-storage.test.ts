import { describe, expect, it } from 'vitest';
import { epochForTimestamp, InputOwner, normalizeDOMTimestamp } from '../src/core/input';
import { initialProgress, PROGRESS_KEY, ProgressStore, validateProgress } from '../src/core/storage';
import type { Attempt, StorageLike } from '../src/core/storage';

function memoryStorage(seed: Record<string, string> = {}) {
  const values = new Map(Object.entries(seed));
  const reads: string[] = [];
  const writes: string[] = [];
  const removed: string[] = [];
  const adapter: StorageLike = {
    getItem(key) { reads.push(key); return values.get(key) ?? null; },
    setItem(key, value) { writes.push(key); values.set(key, value); },
    removeItem(key) { removed.push(key); values.delete(key); },
  };
  return { values, reads, writes, removed, adapter };
}
function attempt(id: string, score: number, options: Partial<Attempt> = {}): Attempt {
  return { id, sessionId: `session-${id}`, levelId: 'L02', score, assisted: false,
    valid: true, completed: true, ...options };
}

describe('physical ownership, toggleHold and event epochs (U22/U23/U30/U35/D10)', () => {
  it('only the first physical token owns down/up and repeat does not create a second edge', () => {
    const owner = new InputOwner();
    expect(owner.down('pointer:1')).toBe('down');
    for (let index = 0; index < 20; index++) expect(owner.down('pointer:1', { repeat: true })).toBeNull();
    expect(owner.down('pointer:2')).toBeNull();
    expect(owner.up('pointer:2')).toBeNull();
    expect(owner.owner).toBe('pointer:1');
    expect(owner.logicalDown).toBe(true);
    expect(owner.up('pointer:1')).toBe('up');
    expect(owner.held).toBe(false);
    expect(owner.logicalDown).toBe(false);
  });

  it('D10: toggleHold uses first down for onset and second down for release, with physical up rearm', () => {
    const owner = new InputOwner(true);
    expect(owner.down('keyboard:Space')).toBe('down');
    expect(owner.down('keyboard:Space', { repeat: true })).toBeNull();
    expect(owner.up('keyboard:Space')).toBeNull();
    expect(owner.held).toBe(false);
    expect(owner.logicalDown).toBe(true);
    expect(owner.down('keyboard:Space')).toBe('up');
    expect(owner.logicalDown).toBe(false);
    // The release-producing second down cannot also create an onset in the same physical press.
    expect(owner.down('keyboard:Space')).toBeNull();
    expect(owner.up('keyboard:Space')).toBeNull();
    expect(owner.down('keyboard:Space')).toBe('down');
  });

  it('normal owner up followed by lostcapture is harmless; abnormal lostcapture interrupts ownership', () => {
    const owner = new InputOwner();
    owner.down('pointer:1');
    expect(owner.lostCapture('pointer:2')).toBe(false);
    owner.up('pointer:1');
    expect(owner.lostCapture('pointer:1')).toBe(false);
    owner.down('pointer:1');
    expect(owner.lostCapture('pointer:1')).toBe(true);
    expect(owner.held).toBe(false);
    expect(owner.logicalDown).toBe(false);
  });

  it('cancel and help-mode changes clear both physical ownership and a toggled logical hold', () => {
    const owner = new InputOwner(true);
    owner.down('keyboard:Space');
    owner.up('keyboard:Space');
    owner.cancel();
    expect(owner.logicalDown).toBe(false);
    owner.down('pointer:1');
    owner.setToggleHold(false);
    expect(owner.logicalDown).toBe(false);
    expect(owner.held).toBe(false);
    expect(owner.down('pointer:2')).toBe('down');
  });

  it('epoch-based DOM timestamp normalizes against timeOrigin exactly once', () => {
    const origin = 1_790_000_000_000;
    expect(normalizeDOMTimestamp(origin + 1234.5, 1240, origin)).toBe(1234.5);
    expect(normalizeDOMTimestamp(1234.5, 1240, origin)).toBe(1234.5);
  });

  it.each([NaN, Infinity, -Infinity, 10_001])('invalid or discontinuous timestamp %s interrupts', (timestamp) => {
    expect(() => normalizeDOMTimestamp(timestamp, 5000, 1_790_000_000_000)).toThrow('TIMESTAMP_DISCONTINUITY');
  });

  it('exactly five seconds timestamp difference is accepted; beyond it is rejected', () => {
    expect(normalizeDOMTimestamp(0, 5000, 1_790_000_000_000)).toBe(0);
    expect(() => normalizeDOMTimestamp(0, 5000.001, 1_790_000_000_000)).toThrow();
  });

  it('U35: delayed edges resolve by their original timestamp instead of current resumed session', () => {
    const epochs = [
      { sessionId: 'old', startPerfMs: 1000, endPerfMs: 2000 },
      { sessionId: 'resumed', startPerfMs: 3000, endPerfMs: null },
    ];
    expect(epochForTimestamp(1500, epochs)).toBe('old');
    expect(epochForTimestamp(1999.999, epochs)).toBe('old');
    expect(epochForTimestamp(2000, epochs)).toBeNull();
    expect(epochForTimestamp(2500, epochs)).toBeNull();
    expect(epochForTimestamp(3000, epochs)).toBe('resumed');
    expect(epochForTimestamp(3500, epochs)).toBe('resumed');
    expect(epochForTimestamp(999, epochs)).toBeNull();
  });
});

describe('local progress ledger, assisted evidence and failure recovery (U39/U40/D07/D17)', () => {
  it('U39: assisted completion updates only assisted best and keeps standard evidence separate', () => {
    const storage = memoryStorage();
    const store = new ProgressStore(storage.adapter);
    store.recordAttempt(attempt('standard-80', 80));
    store.recordAttempt(attempt('assisted-90', 90, { assisted: true, assists: ['wideWindows'] }));
    expect(store.state.levels.L02).toEqual({ completed: true, bestStandard: 80, bestAssisted: 90 });
    expect(store.state.bestScoreEvidence.L02).toEqual({ standard: 'standard-80', assisted: 'assisted-90' });
    const restored = new ProgressStore(storage.adapter).load();
    expect(restored.levels.L02).toEqual(store.state.levels.L02);
  });

  it('D07: revoking the best result restores an earlier valid best and its exact evidence ID', () => {
    const storage = memoryStorage();
    const store = new ProgressStore(storage.adapter);
    store.recordAttempt(attempt('earlier-72', 72));
    store.recordAttempt(attempt('best-100', 100));
    expect(store.state.bestScoreEvidence.L02!.standard).toBe('best-100');
    expect(store.revokeAttempt('session-best-100')).toBe(true);
    expect(store.state.levels.L02!.bestStandard).toBe(72);
    expect(store.state.bestScoreEvidence.L02!.standard).toBe('earlier-72');
    expect(store.state.recentAttempts.find((item) => item.id === 'best-100')!.valid).toBe(false);
    expect(new ProgressStore(storage.adapter).load().levels.L02!.bestStandard).toBe(72);
  });

  it('a late conflict in any resumed sessionChain member revokes the whole dependent attempt', () => {
    const store = new ProgressStore(memoryStorage().adapter);
    store.recordAttempt(attempt('chained', 95, { sessionChain: ['epoch-a', 'epoch-b', 'epoch-c'] }));
    store.revokeAttempt('epoch-a');
    expect(store.state.recentAttempts[0]!.valid).toBe(false);
    expect(store.state.levels.L02).toBeUndefined();
    expect(store.state.bestScoreEvidence.L02).toBeUndefined();
  });

  it('recording the same result twice is idempotent', () => {
    const store = new ProgressStore(memoryStorage().adapter);
    const completed = attempt('once', 83);
    expect(store.recordAttempt(completed)).toBe(true);
    expect(store.recordAttempt(completed)).toBe(true);
    expect(store.state.recentAttempts).toHaveLength(1);
    expect(store.state.bestScoreEvidence.L02!.standard).toBe('once');
  });

  it('D17: an interrupted or invalid attempt cannot count as completion or best evidence', () => {
    const store = new ProgressStore(memoryStorage().adapter);
    store.recordAttempt(attempt('interrupted', 100, { completed: false }));
    store.recordAttempt(attempt('technical-invalid', 100, { valid: false }));
    expect(store.state.levels.L02).toEqual({ completed: false, bestStandard: null, bestAssisted: null });
    expect(store.state.bestScoreEvidence.L02).toEqual({ standard: null, assisted: null });
  });

  it.each(['{not-json', 'null', '{"schemaVersion":1}', '[]'])('U40: damaged storage %s backs up locally and leaves game state usable', (raw) => {
    const storage = memoryStorage({ [PROGRESS_KEY]: raw, 'another-game.progress': 'preserve-me' });
    const store = new ProgressStore(storage.adapter);
    const recovered = store.load();
    expect(validateProgress(recovered)).toBe(true);
    expect(recovered.recentAttempts).toEqual([]);
    expect(store.warning).toBeTruthy();
    expect(storage.values.get(`${PROGRESS_KEY}.backup`)).toBe(raw);
    expect(storage.values.get('another-game.progress')).toBe('preserve-me');
    expect(storage.reads).toEqual([PROGRESS_KEY]);
    expect(storage.writes.every((key) => key.startsWith(PROGRESS_KEY))).toBe(true);
    expect(store.recordAttempt(attempt('after-recovery', 88))).toBe(true);
    expect(store.state.levels.L02!.bestStandard).toBe(88);
  });

  it('U40: quota failure keeps the current result and progress available in memory with an explicit warning', () => {
    const adapter: StorageLike = {
      getItem() { return null; },
      setItem() { throw new Error('QuotaExceededError'); },
      removeItem() {},
    };
    const store = new ProgressStore(adapter);
    expect(store.recordAttempt(attempt('quota-result', 91))).toBe(false);
    expect(store.warning).toBeTruthy();
    expect(store.state.recentAttempts[0]!.score).toBe(91);
    expect(store.state.levels.L02!.bestStandard).toBe(91);
    expect(store.state.bestScoreEvidence.L02!.standard).toBe('quota-result');
  });

  it('unavailable storage and unavailable corrupt backup both recover to a usable default', () => {
    const failedRead: StorageLike = {
      getItem() { throw new Error('SecurityError'); }, setItem() {}, removeItem() {},
    };
    const unreadable = new ProgressStore(failedRead);
    expect(validateProgress(unreadable.load())).toBe(true);
    expect(unreadable.warning).toBeTruthy();
    const failedBackup: StorageLike = {
      getItem() { return '{broken'; },
      setItem() { throw new Error('QuotaExceededError'); }, removeItem() {},
    };
    const unbacked = new ProgressStore(failedBackup);
    expect(validateProgress(unbacked.load())).toBe(true);
    expect(unbacked.warning).toBeTruthy();
  });

  it('a content version change isolates old attempts as legacy while preserving device settings', () => {
    const storage = memoryStorage();
    const previous = new ProgressStore(storage.adapter, 'old-content');
    previous.updateSettings({ highContrast: true, keyCode: 'KeyF' });
    previous.setCalibration(80);
    previous.recordAttempt(attempt('old-best', 100));
    const current = new ProgressStore(storage.adapter, 'new-content');
    current.load();
    expect(current.state.contentVersion).toBe('new-content');
    expect(current.state.settings.highContrast).toBe(true);
    expect(current.state.settings.keyCode).toBe('KeyF');
    expect(current.state.calibration.inputOffsetMs).toBe(80);
    expect(current.state.levels).toEqual({});
    expect(current.state.recentAttempts).toEqual([]);
    expect(current.state.legacy).toHaveLength(1);
    expect(current.warning).toBeTruthy();
  });

  it('device reset removes only this application progress key', () => {
    const storage = memoryStorage({ 'another-game.progress': 'preserve-me' });
    const store = new ProgressStore(storage.adapter);
    store.recordAttempt(attempt('before-reset', 90));
    expect(store.reset()).toBe(true);
    expect(storage.removed).toEqual([PROGRESS_KEY]);
    expect(storage.values.get('another-game.progress')).toBe('preserve-me');
    expect(store.state).toEqual(initialProgress());
  });

  it.each([251, -251, NaN, Infinity])('invalid automatic calibration %s ms cannot change saved offset', (offset) => {
    const store = new ProgressStore(memoryStorage().adapter);
    expect(store.setCalibration(80)).toBe(true);
    const before = structuredClone(store.state.calibration);
    expect(store.setCalibration(offset)).toBe(false);
    expect(store.state.calibration).toEqual(before);
  });
});
