import { describe, expect, it } from 'vitest';
import { levels } from '../src/content';
import { compileLevel, JudgeEngine } from '../src/core';
const l02 = levels.find(level => level.id === 'L02')!;
function calibrated(offsetMs: number, id = 'L02') {
  const timeline = compileLevel(levels.find(level => level.id === id)!);
  return { timeline, judge: new JudgeEngine(timeline, { sessionId: 'calibrated', inputOffsetMs: offsetMs }) };
}
describe('calibrated input deadlines and unshifted musical targets', () => {
  it('keeps +250ms calibrated onset pending until its physical input can arrive', () => {
    const { timeline, judge } = calibrated(250);
    const target = timeline.notes[0]!.startSec;
    judge.advanceTo(target + .241);
    expect(judge.snapshot().notes[0]!.status).toBe('PENDING');
    const events = judge.ingest({ kind: 'down', timeSec: target + .250, receiptSec: target + .250 });
    expect(events).toContainEqual(expect.objectContaining({ type: 'ONSET_RESULT', points: 1, errorMs: 0 }));
    expect(judge.snapshot().invalidatedFrom).toBeNull();
    expect(timeline.notes[0]!.startSec).toBe(target);
  });
  it('keeps the same +140ms musical window and 100ms dispatch grace after +250ms correction', () => {
    const { judge } = calibrated(250);
    judge.advanceTo(.480);
    const events = judge.ingest({ kind: 'down', timeSec: .390, receiptSec: .480 });
    expect(events).toContainEqual(expect.objectContaining({ type: 'ONSET_RESULT', points: .4 }));
    expect(events.some(event => event.type === 'INTERRUPT')).toBe(false);
  });
  it('does not time out an active +250ms calibrated hold release at the uncompensated deadline', () => {
    const { timeline, judge } = calibrated(250);
    const hold = timeline.notes[0]!;
    judge.ingest({ kind: 'down', timeSec: hold.startSec + .250 });
    judge.advanceTo(hold.endSec + .261);
    expect(judge.snapshot().notes[0]!.status).toBe('ACTIVE');
    const events = judge.ingest({ kind: 'up', timeSec: hold.endSec + .400, receiptSec: hold.endSec + .490 });
    expect(events).toContainEqual(expect.objectContaining({ type: 'RELEASE_RESULT', points: .4 }));
    expect(judge.snapshot().invalidatedFrom).toBeNull();
  });
  it.each([-250, 250])('scores a timestamp-ordered perfect motif at offset %ims with frame advances before each physical edge', offsetMs => {
    const { timeline, judge } = calibrated(offsetMs);
    for (const note of timeline.notes) {
      const down = note.startSec + offsetMs / 1000;
      judge.advanceTo(down - .001);
      judge.ingest({ kind: 'down', timeSec: down, receiptSec: down });
      const up = (note.interaction === 'hold' ? note.endSec : note.startSec + .01) + offsetMs / 1000;
      judge.advanceTo(up - .001);
      judge.ingest({ kind: 'up', timeSec: up, receiptSec: up });
    }
    judge.advanceTo(timeline.finalizationSec + Math.max(0, offsetMs) / 1000 + .001);
    expect(judge.snapshot()).toMatchObject({ finished: true, score: 100, earned: 3, invalidatedFrom: null });
  });
  it.each([-250, 250])('still reaches an unassisted zero-point completed no-input result at offset %ims', offsetMs => {
    const { timeline, judge } = calibrated(offsetMs);
    judge.advanceTo(timeline.finalizationSec + Math.max(0, offsetMs) / 1000 + .001);
    expect(judge.snapshot()).toMatchObject({ score: 0, earned: 0, finished: true, invalidatedFrom: null });
  });
  it('never shifts the compiled note targets or scoring windows to apply calibration', () => {
    const chart = compileLevel(l02); const original = JSON.stringify(chart);
    for (const offsetMs of [-250, 250]) { const judge = new JudgeEngine(chart, { inputOffsetMs: offsetMs }); judge.ingest({ kind: 'down', timeSec: offsetMs / 1000 }); }
    expect(JSON.stringify(chart)).toBe(original);
  });
  it('waits for the calibrated last release closing deadline before PHRASE_FINAL and finished', () => {
    const { timeline, judge } = calibrated(250, 'L01');
    for (const note of timeline.notes) {
      judge.ingest({ kind: 'down', timeSec: note.startSec + .250 });
      judge.ingest({ kind: 'up', timeSec: note.endSec + .250 });
    }
    const before = judge.advanceTo(timeline.finalizationSec + .001);
    expect(before.some(event => event.type === 'PHRASE_FINAL')).toBe(false);
    expect(judge.snapshot()).toMatchObject({ finished: false, score: 100 });
    const after = judge.advanceTo(timeline.finalizationSec + .251);
    expect(after).toContainEqual(expect.objectContaining({ type: 'PHRASE_FINAL' }));
    expect(judge.snapshot()).toMatchObject({ finished: true, score: 100 });
  });
  it('still rolls back a valid calibrated timestamp after the shifted timeout has finalized', () => {
    const { judge } = calibrated(250);
    judge.advanceTo(.491);
    const events = judge.ingest({ kind: 'down', timeSec: .390, receiptSec: .500 });
    expect(events).toContainEqual(expect.objectContaining({ type: 'INTERRUPT', reason: 'late_finalized_edge' }));
  });
  it('preserves the raw dispatch delay limit even with +250ms calibration', () => {
    const { judge } = calibrated(250);
    const events = judge.ingest({ kind: 'down', timeSec: .250, receiptSec: .451 });
    expect(events).toContainEqual(expect.objectContaining({ type: 'INTERRUPT', reason: 'input_dispatch_delay' }));
  });
});
