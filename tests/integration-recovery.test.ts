import { describe, expect, it } from 'vitest';
import { levels } from '../src/content';
import { compileLevel, JudgeEngine, InputOwner, ProgressStore, epochForTimestamp } from '../src/core';
import type { Attempt, CompiledNote, StorageLike } from '../src/core';
function repository() {
  const values = new Map<string, string>();
  const storage: StorageLike = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); }, removeItem: key => { values.delete(key); } };
  const store = new ProgressStore(storage); store.load(); return { store, values };
}
function perfect(judge: JudgeEngine, note: CompiledNote, sessionId: string, owner: InputOwner): void {
  const down = owner.down('keyboard:Space'); if (down) judge.ingest({ kind: down, timeSec: note.startSec, sessionId, ownerToken: 'keyboard:Space' });
  const up = owner.up('keyboard:Space'); if (up) judge.ingest({ kind: up, timeSec: note.interaction === 'hold' ? note.endSec : note.startSec + .01, sessionId, ownerToken: 'keyboard:Space' });
}
const attempt = (id: string, score: number): Attempt => ({ id, sessionId: id, levelId: 'L01', score, assisted: false, valid: true, completed: true });
describe('coordinated input, phrase recovery and reversible result storage', () => {
  it('I13: a completed four-motif physical-owner replay saves once despite duplicate completion', () => {
    const timeline = compileLevel(levels[1]!, { repeats: 4 }); const judge = new JudgeEngine(timeline, { sessionId: 'play' }); const owner = new InputOwner(); const { store } = repository();
    for (const note of timeline.notes) perfect(judge, note, 'play', owner);
    judge.advanceTo(timeline.finalizationSec + .001);
    const snapshot = judge.snapshot(); expect(snapshot.finished).toBe(true); expect(snapshot.score).toBe(100);
    const completed: Attempt = { ...attempt('play', snapshot.score), levelId: 'L02', metrics: snapshot.metrics };
    store.recordAttempt(completed); store.recordAttempt(completed);
    expect(store.state.recentAttempts).toHaveLength(1); expect(store.state.bestScoreEvidence.L02!.standard).toBe('play');
  });
  it('I04/I05: cancelling an owned hold atomically restarts its phrase and preserves earlier evidence', () => {
    const timeline = compileLevel(levels[1]!, { repeats: 4 }); const judge = new JudgeEngine(timeline, { sessionId: 'epoch-a' }); const owner = new InputOwner();
    for (const note of timeline.notes.filter(n => n.phraseIndex === 0)) perfect(judge, note, 'epoch-a', owner);
    judge.advanceTo(timeline.phrases[0]!.finalizeSec + .001);
    const hold = timeline.notes.find(n => n.phraseIndex === 1)!;
    owner.down('keyboard:Space'); judge.ingest({ kind: 'down', timeSec: hold.startSec, sessionId: 'epoch-a' });
    judge.interrupt('pointercancel'); owner.cancel();
    expect(judge.snapshot()).toMatchObject({ earned: 3, expectationCount: 3, extra: 0, completedPhrases: 1, invalidatedFrom: 1 });
    judge.resume('epoch-b');
    judge.ingest({ kind: 'down', timeSec: hold.startSec, sessionId: 'epoch-a' });
    expect(judge.snapshot().notes.find(n => n.noteId === hold.id)!.status).toBe('PENDING');
    for (const note of timeline.notes.filter(n => n.phraseIndex >= 1)) perfect(judge, note, 'epoch-b', owner);
    judge.advanceTo(timeline.finalizationSec + .001); expect(judge.snapshot()).toMatchObject({ score: 100, earned: 12, finished: true });
  });
  it('I17: a late valid release revokes the saved candidate and restores prior best evidence', () => {
    const timeline = compileLevel(levels[0]!, { repeats: 4 }); const judge = new JudgeEngine(timeline, { sessionId: 'candidate' }); const owner = new InputOwner(); const { store } = repository();
    store.recordAttempt(attempt('previous-80', 80));
    const last = timeline.notes.at(-1)!;
    for (const note of timeline.notes.slice(0, -1)) perfect(judge, note, 'candidate', owner);
    judge.ingest({ kind: 'down', timeSec: last.startSec, sessionId: 'candidate' });
    judge.advanceTo(timeline.finalizationSec + .001);
    const snapshot = judge.snapshot(); expect(snapshot.finished).toBe(true); expect(snapshot.score).toBe(94);
    store.recordAttempt(attempt('candidate', snapshot.score)); expect(store.state.levels.L01!.bestStandard).toBe(94);
    const events = judge.ingest({ kind: 'up', timeSec: last.endSec + .15, receiptSec: last.endSec + .28, sessionId: 'candidate' });
    expect(events[0]).toMatchObject({ type: 'INTERRUPT', reason: 'late_finalized_edge', phraseIndex: 3 });
    store.revokeAttempt('candidate');
    expect(store.state.levels.L01!.bestStandard).toBe(80); expect(store.state.bestScoreEvidence.L01!.standard).toBe('previous-80');
    expect(judge.snapshot().completedPhrases).toBe(3);
  });
  it('D06: timestamp routing selects the archived epoch before judging; the resume boundary belongs to the new epoch', () => {
    const epochs = [{ sessionId: 'a', startPerfMs: 1000, endPerfMs: 2000 }, { sessionId: 'b', startPerfMs: 2000, endPerfMs: null }];
    expect(epochForTimestamp(1999.9, epochs)).toBe('a'); expect(epochForTimestamp(2000, epochs)).toBe('b');
  });
});
