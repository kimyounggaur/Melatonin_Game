import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { compileLevel } from '../src/core/compiler';
import { JudgeEngine } from '../src/core/judge';
import { evaluateMastery, focusedPracticeBars } from '../src/core/mastery';
import type { JudgeSnapshot, Level, Metrics } from '../src/core/types';

const levels = JSON.parse(readFileSync(new URL(
  '../reference/assets/night_thread_mobile_runtime_v1/source/dream_level_examples.json', import.meta.url,
), 'utf8')) as Level[];
const source = (id: string) => structuredClone(levels.find((level) => level.id === id)!);
function result(score: number, metrics: Partial<Metrics> = {}, finished = true): JudgeSnapshot {
  const baseline = new JudgeEngine(compileLevel(source('L01'))).snapshot();
  return { ...baseline, score, finished, metrics: { ...baseline.metrics, ...metrics } };
}

describe('design 7.4: completion, precision and concept evidence stay distinct', () => {
  it.each([[79, 1], [80, 2], [89, 2], [90, 3]])('score %i gives %i stars at the exact standard threshold', (score, stars) => {
    expect(evaluateMastery(source('L01'), result(score!), false).stars).toBe(stars);
  });

  it('unfinished attempts receive no completion star even with a high provisional score', () => {
    expect(evaluateMastery(source('L01'), result(100, {}, false), false).stars).toBe(0);
  });

  it.each(['L02', 'L03'])('%s: three genuinely continuous ties out of PLAY4 meet the tie condition', (id) => {
    const level = source(id);
    const compiled = compileLevel(level, { repeats: 4 });
    const judge = new JudgeEngine(compiled, { sessionId: 'mastery' });
    const inputs = compiled.notes.flatMap((note) => {
      // Break only the fourth tied hold, at its internal notation boundary.
      const up = note.phraseIndex === 3 && note.tieBoundaries.length > 0
        ? note.tieBoundaries[0]! / 480 * 60 / level.quarterBpm
        : note.interaction === 'hold' ? note.endSec : note.startSec + .01;
      return [{ kind: 'down' as const, timeSec: note.startSec }, { kind: 'up' as const, timeSec: up }];
    }).sort((a, b) => a.timeSec - b.timeSec || (a.kind === 'up' ? -1 : 1));
    inputs.forEach((edge, index) => judge.ingest({ ...edge, sequence: index + 1, ownerToken: 'Space', sessionId: 'mastery' }));
    judge.advanceTo(compiled.finalizationSec + .001);
    const snapshot = judge.snapshot();
    expect(snapshot.metrics.tieCount).toBe(4);
    expect(snapshot.metrics.tieContinuousCount).toBe(3);
    expect(snapshot.metrics.tieContinuousRatio).toBe(.75);
    expect(snapshot.score).toBeGreaterThanOrEqual(90);
    expect(evaluateMastery(level, snapshot, false)).toMatchObject({ tieMastery: true, stars: 3 });
    expect(evaluateMastery(level, { ...snapshot,
      metrics: { ...snapshot.metrics, tieContinuousCount: 2, tieContinuousRatio: .5 } }, false))
      .toMatchObject({ tieMastery: false, stars: 2 });
  });

  it('L04 requires release evidence at 75%; a high onset score alone cannot award dot mastery', () => {
    const level = source('L04');
    expect(evaluateMastery(level, result(100, { releaseInWindowRatio: .75 }), false))
      .toMatchObject({ dotMastery: true, stars: 3 });
    expect(evaluateMastery(level, result(100, { releaseInWindowRatio: .749 }), false))
      .toMatchObject({ dotMastery: false, stars: 2 });
    expect(evaluateMastery(level, result(100, { releaseInWindowRatio: null }), false).dotMastery).toBe(false);
  });

  it('L05 requires both clean rests and successful re-entry at 75%', () => {
    const level = source('L05');
    expect(evaluateMastery(level, result(95, { restCleanRatio: .75, reentryRatio: .75 }), false))
      .toMatchObject({ restMastery: true, stars: 3 });
    for (const metrics of [{ restCleanRatio: .749, reentryRatio: 1 },
      { restCleanRatio: 1, reentryRatio: .749 }, { restCleanRatio: null, reentryRatio: 1 }]) {
      expect(evaluateMastery(level, result(95, metrics), false))
        .toMatchObject({ restMastery: false, stars: 2 });
    }
  });

  it.each(['L06', 'L07'])('%s: rhythm 100 cannot substitute for 3/4 concept answers', (id) => {
    const level = source(id);
    expect(evaluateMastery(level, result(100), false, 2)).toMatchObject({ meterMastery: false, stars: 2 });
    expect(evaluateMastery(level, result(100), false, null)).toMatchObject({ meterMastery: false, stars: 2 });
    expect(evaluateMastery(level, result(90), false, 3)).toMatchObject({ meterMastery: true, stars: 3 });
    expect(evaluateMastery(level, result(79), false, 4)).toMatchObject({ meterMastery: true, stars: 1 });
  });

  it('assisted completion remains available while standard precision stars and physical mastery remain separate', () => {
    const metrics = { tieContinuousRatio: 1, releaseInWindowRatio: 1, restCleanRatio: 1, reentryRatio: 1 };
    for (const id of ['L01', 'L02', 'L03', 'L04', 'L05', 'L06', 'L07']) {
      const mastery = evaluateMastery(source(id), result(100, metrics), true, 4);
      expect(mastery.stars).toBe(1);
      expect(mastery.standardEligible).toBe(false);
    }
    expect(evaluateMastery(source('L02'), result(100, metrics), true).tieMastery).toBe(false);
    expect(evaluateMastery(source('L04'), result(100, metrics), true).dotMastery).toBe(false);
    expect(evaluateMastery(source('L05'), result(100, metrics), true).restMastery).toBe(false);
  });
});

describe('design 9.3: focused practice includes the complete required tie', () => {
  it('L03 tie continuation d includes its onset in the previous bar', () => {
    const level = source('L03');
    const before = JSON.stringify(level);
    expect(focusedPracticeBars(level, ['d'])).toEqual([0, 1]);
    expect(focusedPracticeBars(level, ['c'])).toEqual([0, 1]);
    expect(JSON.stringify(level)).toBe(before);
  });

  it('an independent second-bar failure selects only that bar, with the full motif as safe fallback', () => {
    const level = source('L03');
    expect(focusedPracticeBars(level, ['f'])).toEqual([1]);
    expect(focusedPracticeBars(level, ['a', 'f'])).toEqual([0, 1]);
    expect(focusedPracticeBars(level, [])).toEqual([0, 1]);
    expect(focusedPracticeBars(level, ['unknown'])).toEqual([0, 1]);
  });
});
