import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { compileLevel } from '../src/core/compiler';
import { JudgeEngine } from '../src/core/judge';
import { gradeError, makeWindows, scoreAttempt } from '../src/core/windows';
import { validateLevel } from '../src/core/validation';
import type { InputEdge, Level, NotationEvent } from '../src/core/types';

// The oracle is read from the supplied promptpack, never generated from runtime output.
// Appendix C/D/E snapshots are deliberately outside the Level schema.
const promptpack = readFileSync(new URL('../reference/promptpack.md', import.meta.url), 'utf8');
const fixtures = [...promptpack.matchAll(/```json\r?\n([\s\S]*?)```/g)]
  .map((match) => JSON.parse(match[1]!) as { fixtureKind?: string });
function fixture<T>(kind: string): T {
  const item = fixtures.find((candidate) => candidate.fixtureKind === kind);
  if (!item) throw new Error(`Missing supplied oracle: ${kind}`);
  return item as T;
}
const levels = JSON.parse(readFileSync(new URL(
  '../reference/assets/night_thread_mobile_runtime_v1/source/dream_level_examples.json',
  import.meta.url,
), 'utf8')) as Level[];
function level(id: string): Level {
  const source = levels.find((item) => item.id === id);
  if (!source) throw new Error(`Missing source level: ${id}`);
  return structuredClone(source);
}
type Golden = {
  levelId: string; barTicks: number; motifTicks: number; motifSecondsFraction: [number, number];
  scoreDenominatorPerMotif: number; scoreDenominatorPlay4: number;
  onsetMicrosecondsFromMotifStart: number[]; bigBeatTicksPerBar: number[];
  gates: { id: string; onsetTick: number; endTick: number; interaction: string; pitchMidi: number;
    sourceNotationIds: string[]; tieBoundaryTicks: number[] }[];
  rests: { sourceNotationId: string; startTick: number; endTick: number }[];
};
const goldens = fixture<{ levels: Golden[] }>('compiledLevelGolden').levels;
type Replay = { name: string; edges: { sequence: number; edge: 'down' | 'up'; atTick: number;
  ownerToken: string }[]; expectedEarned: number; expectedExtra: number; expectedScore: number };
const replayCases = fixture<{ cases: Replay[] }>('L02InputReplay').cases;
const SESSION = 'oracle-session';
const tickSec = (tick: number, bpm = 72) => tick / 480 * 60 / bpm;
function l02Judge(options: { inputOffsetMs?: number; repeats?: number } = {}) {
  const compiled = compileLevel(level('L02'), { repeats: options.repeats ?? 1 });
  const judge = new JudgeEngine(compiled, { sessionId: SESSION, inputOffsetMs: options.inputOffsetMs });
  return { compiled, judge };
}
function edge(kind: 'down' | 'up', timeSec: number, extras: Partial<InputEdge> = {}): InputEdge {
  return { kind, timeSec, receiptSec: timeSec, ownerToken: 'keyboard:Space',
    sessionId: SESSION, ...extras };
}
function runReplay(replay: Replay) {
  const { compiled, judge } = l02Judge();
  const events = replay.edges.flatMap((input) => judge.ingest(edge(input.edge, tickSec(input.atTick), {
    sequence: input.sequence, ownerToken: input.ownerToken,
  })));
  events.push(...judge.advanceTo(compiled.finalizationSec + .001));
  return { snapshot: judge.snapshot(), events };
}
function playL02Tail(judge: JudgeEngine) {
  judge.ingest(edge('down', tickSec(1440)));
  judge.ingest(edge('up', tickSec(1500)));
}
function finishL02(judge: JudgeEngine) {
  judge.advanceTo(tickSec(1920) + .5);
  return judge.snapshot();
}
function note(id: string, at: number, ticks: number, denominator: number, dots = 0): NotationEvent {
  return { id, at, ticks, kind: 'note', notation: { denominator, dots }, pitchName: 'C5', midi: 72,
    interaction: 'hold' };
}

describe('Appendix C: supplied compiler golden snapshots (U01/U07/U08/U13/U14/U25/U31/U37)', () => {
  it.each(goldens)('$levelId matches every gate, rest, tick, pitch and score denominator', (golden) => {
    const compiled = compileLevel(level(golden.levelId));
    expect(compiled.barTicks).toBe(golden.barTicks);
    expect(compiled.durationTicks).toBe(golden.motifTicks);
    expect(compiled.durationSec).toBeCloseTo(golden.motifSecondsFraction[0] / golden.motifSecondsFraction[1], 12);
    expect(compiled.expectationCount).toBe(golden.scoreDenominatorPerMotif);
    expect(compiled.notes.map((item) => ({ onsetTick: item.startTick, endTick: item.endTick,
      interaction: item.interaction, pitchMidi: item.midi, sourceNotationIds: item.sourceNotationIds,
      tieBoundaryTicks: item.tieBoundaries }))).toEqual(golden.gates.map(({ id: _id, ...gate }) => gate));
    expect(compiled.notes.map((item) => Math.round(item.startSec * 1e6)))
      .toEqual(golden.onsetMicrosecondsFromMotifStart);
    expect(compiled.rests.map((item) => ({ sourceNotationId: item.sourceNotationIds[0],
      startTick: item.startTick, endTick: item.endTick }))).toEqual(golden.rests);
    expect(compiled.beats.filter((beat) => beat.major && beat.tick < golden.barTicks).map((beat) => beat.tick))
      .toEqual(golden.bigBeatTicksPerBar);
    expect(compiled.events.filter((event) => event.type === 'ONSET').map((event) => event.tick))
      .toEqual(golden.gates.map((gate) => gate.onsetTick));
  });

  it.each(goldens)('$levelId PLAY repeats multiply the motif, never reconnect tie groups', (golden) => {
    const compiled = compileLevel(level(golden.levelId), { repeats: 4 });
    expect(compiled.durationTicks).toBe(golden.motifTicks * 4);
    expect(compiled.expectationCount).toBe(golden.scoreDenominatorPlay4);
    expect(compiled.notes).toHaveLength(golden.gates.length * 4);
    expect(compiled.phrases).toHaveLength(4);
    expect(new Set(compiled.notes.map((item) => item.occurrenceId)).size).toBe(compiled.notes.length);
    for (let repeat = 0; repeat < 4; repeat++) {
      expect(compiled.notes.filter((item) => item.phraseIndex === repeat).map((item) => item.startTick))
        .toEqual(golden.gates.map((gate) => gate.onsetTick + repeat * golden.motifTicks));
    }
  });

  it('U02/U03: notation units compile as whole/half/quarter/eighth/sixteenth and dotted values', () => {
    for (const [denominator, ticks] of [[1, 1920], [2, 960], [4, 480], [8, 240], [16, 120]]) {
      const custom = level('L01');
      custom.bars = [{ events: Array.from({ length: 1920 / ticks! }, (_, index) =>
        note(`n${index}`, index * ticks!, ticks!, denominator!)) }];
      expect(validateLevel(custom).valid).toBe(true);
      expect(compileLevel(custom).notes.map((item) => item.endTick - item.startTick))
        .toEqual(Array(1920 / ticks!).fill(ticks));
    }
    const custom = level('L01');
    custom.bars = [{ events: [note('dotted-half', 0, 1440, 2, 1), note('quarter', 1440, 480, 4)] }];
    expect(validateLevel(custom).valid).toBe(true);
    expect(compileLevel(custom).notes[0]!.endTick).toBe(1440);
    expect(compileLevel(level('L04')).notes[0]!.endTick).toBe(720);
  });

  it('U13/U37: 3/4 and 6/8 retain identical six notes but different major beat grouping', () => {
    const triple = compileLevel(level('L06'));
    const duple = compileLevel(level('L07'));
    const music = (value: typeof triple) => value.notes.map((item) =>
      [item.startTick, item.endTick, item.midi, item.interaction]);
    expect(music(triple)).toEqual(music(duple));
    expect(triple.beats.filter((item) => item.major).map((item) => item.tick)).toEqual([0, 480, 960]);
    expect(duple.beats.filter((item) => item.major).map((item) => item.tick)).toEqual([0, 720]);
    expect(duple.beats.find((item) => item.tick === 720)!.timeSec).toBe(1);
    expect(duple.effectiveQuarterBpm * 2 / 3).toBe(60);
  });

  it('U14: L09 preserves the complete L08 note/rest pattern and has exact 2/3 duration', () => {
    const slow = compileLevel(level('L08'));
    const fast = compileLevel(level('L09'));
    expect(fast.notes.map((item) => [item.startTick, item.endTick, item.midi]))
      .toEqual(slow.notes.map((item) => [item.startTick, item.endTick, item.midi]));
    expect(fast.rests.map((item) => [item.startTick, item.endTick]))
      .toEqual(slow.rests.map((item) => [item.startTick, item.endTick]));
    expect(fast.durationSec / slow.durationSec).toBeCloseTo(2 / 3, 14);
  });

  it('75% speed changes absolute seconds without expanding the standard millisecond windows', () => {
    const standard = compileLevel(level('L02'));
    const slower = compileLevel(level('L02'), { speed: .75 });
    expect(slower.durationTicks).toBe(standard.durationTicks);
    expect(slower.durationSec).toBeCloseTo(standard.durationSec / .75, 12);
    expect(slower.notes[0]!.onsetWindow).toEqual(standard.notes[0]!.onsetWindow);
    expect(slower.notes[0]!.releaseWindow).toEqual(standard.notes[0]!.releaseWindow);
  });

  it('U43: the compiler applies the wide cap to actual neighbors including repetition boundaries', () => {
    const compiled = compileLevel(level('L06'), { repeats: 2, wideWindows: true });
    expect(compiled.notes.every((item) => item.onsetWindow.lateUs === 150_000)).toBe(true);
    expect(compiled.notes[5]!.onsetWindow).toEqual(compiled.notes[6]!.onsetWindow);
    const standard = compileLevel(level('L06'), { repeats: 2 });
    expect(standard.notes.every((item) => item.onsetWindow.lateUs === 140_000)).toBe(true);
  });
});

describe('Appendix E: all supplied invalid data mutations (U04-U06/U09-U12/U36)', () => {
  type Mutation = { id: string; sourceLevel: string; patch: { op: 'add' | 'remove' | 'replace';
    path: string; value?: unknown }[]; mustIncludeErrorCodes: string[] };
  const mutations = fixture<{ cases: Mutation[] }>('invalidLevelMutations').cases;
  it.each(mutations)('$id rejects without repairing the original content', (mutation) => {
    const source = level(mutation.sourceLevel);
    const original = JSON.stringify(source);
    const invalid = structuredClone(source) as unknown as Record<string, unknown>;
    for (const patch of mutation.patch) {
      const parts = patch.path.slice(1).split('/');
      const key = parts.pop()!;
      let parent: unknown = invalid;
      for (const part of parts) parent = (parent as Record<string, unknown>)[part];
      if (patch.op === 'remove') {
        if (Array.isArray(parent)) parent.splice(Number(key), 1);
        else delete (parent as Record<string, unknown>)[key];
      } else (parent as Record<string, unknown>)[key] = structuredClone(patch.value);
    }
    const beforeValidation = JSON.stringify(invalid);
    const result = validateLevel(invalid);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining(mutation.mustIncludeErrorCodes));
    expect(JSON.stringify(invalid)).toBe(beforeValidation);
    expect(JSON.stringify(source)).toBe(original);
  });

  it('U36: a full, schema-correct rest-only scored chart is an authoring error', () => {
    const custom = level('L01');
    custom.bars = [{ events: [{ id: 'rest', at: 0, ticks: 1920, kind: 'rest',
      notation: { denominator: 1, dots: 0 } }] }];
    expect(() => compileLevel(custom)).toThrow();
  });
});

describe('Appendix C: integer microsecond boundaries (U15-U18/U43/D19)', () => {
  const boundaries = fixture<{ cases: { kind: 'onset' | 'release'; errorUs: number;
    expectedPoints: number }[] }>('judgeBoundaries').cases;
  it.each(boundaries)('$kind at $errorUs us gives $expectedPoints points', ({ kind, errorUs, expectedPoints }) => {
    expect(gradeError(errorUs / 1000, makeWindows(kind)).points).toBe(expectedPoints);
    expect(gradeError(-errorUs / 1000, makeWindows(kind)).points).toBe(expectedPoints);
  });

  const windows = fixture<{ cases: { type: 'onset' | 'release'; neighborOrHoldDurationMs: number | null;
    assistMultiplier: number; thresholdsUs: number[] }[] }>('judgeWindows').cases;
  it.each(windows)('$type cap $neighborOrHoldDurationMs ms, assist $assistMultiplier', (oracle) => {
    const window = makeWindows(oracle.type,
      oracle.neighborOrHoldDurationMs === null ? Infinity : oracle.neighborOrHoldDurationMs * .45,
      oracle.assistMultiplier === 1.35);
    expect([window.perfectUs, window.goodUs, window.lateUs]).toEqual(oracle.thresholdsUs);
    expect(gradeError(window.perfectUs / 1000, window).points).toBe(1);
    expect(gradeError((window.perfectUs + 1) / 1000, window).points).toBe(.75);
    expect(gradeError((window.lateUs + 1) / 1000, window).points).toBe(0);
  });

  it.each(fixture<{ cases: { correctedErrorMs: number; roundedAbsoluteErrorUs: number;
    expectedPoints: number }[] }>('halfMicrosecondSymmetry').cases)
  ('D19: magnitude rounding is symmetric for $correctedErrorMs ms', (oracle) => {
    const result = gradeError(oracle.correctedErrorMs, makeWindows('onset'));
    expect(result.magnitudeUs).toBe(oracle.roundedAbsoluteErrorUs);
    expect(result.points).toBe(oracle.expectedPoints);
    expect(result.direction).toBe(oracle.correctedErrorMs < 0 ? 'early' : 'late');
  });
});

describe('Appendix D: exact input replay, scoring and ownership (U19-U29/U34/U35/U38)', () => {
  it.each(goldens)('$levelId perfect PLAY4 uses every scored expectation exactly once', (golden) => {
    const compiled = compileLevel(level(golden.levelId), { repeats: 4 });
    const judge = new JudgeEngine(compiled, { sessionId: SESSION });
    const inputs = compiled.notes.flatMap((item) => [edge('down', item.startSec),
      edge('up', item.interaction === 'hold' ? item.endSec : item.startSec + .01)])
      .sort((a, b) => a.timeSec - b.timeSec || (a.kind === 'up' ? -1 : 1));
    const results = inputs.flatMap((input, index) => judge.ingest({ ...input, sequence: index + 1 }));
    results.push(...judge.advanceTo(compiled.finalizationSec + .001));
    expect(judge.snapshot().earned).toBe(golden.scoreDenominatorPlay4);
    expect(judge.snapshot().expectationCount).toBe(golden.scoreDenominatorPlay4);
    expect(judge.snapshot().score).toBe(100);
    expect(judge.snapshot().extra).toBe(0);
    expect(judge.snapshot().completedPhrases).toBe(4);
    expect(results.filter((item) => item.type === 'ONSET_RESULT')).toHaveLength(compiled.notes.length);
    expect(results.filter((item) => item.type === 'RELEASE_RESULT')).toHaveLength(
      compiled.notes.filter((item) => item.interaction === 'hold').length);
  });

  it.each(replayCases)('$name -> earned $expectedEarned, extra $expectedExtra, score $expectedScore', (replay) => {
    const { snapshot } = runReplay(replay);
    expect(snapshot.earned).toBe(replay.expectedEarned);
    expect(snapshot.extra).toBe(replay.expectedExtra);
    expect(snapshot.score).toBe(replay.expectedScore);
    expect(snapshot.expectationCount).toBe(3);
    expect(snapshot.finished).toBe(true);
  });

  it.each(fixture<{ scoreCases: { N: number; earned: number; extra: number;
    expectedScore: number }[] }>('calibrationAndScore').scoreCases)
  ('U26/U27: N=$N earned=$earned extra=$extra is $expectedScore', ({ N, earned, extra, expectedScore }) => {
    expect(scoreAttempt(earned, extra, N)).toBe(expectedScore);
  });

  it('U19/U31: release at the interior tie boundary is BROKEN and a restrike cannot repair it', () => {
    const { snapshot, events } = runReplay(replayCases.find((item) => item.name === 'tie_broken_and_restrike')!);
    expect(snapshot.notes[0]!.status).toBe('BROKEN');
    expect(snapshot.notes[0]!.onsetPoints).toBe(1);
    expect(snapshot.notes[0]!.releasePoints).toBe(0);
    expect(events.filter((event) => event.type === 'ONSET_RESULT')).toHaveLength(2);
    expect(snapshot.metrics.tieContinuousCount).toBe(0);
    expect(snapshot.metrics.tieCount).toBe(1);
  });

  it('U22/U23: repeated owner downs and another pointer cannot disturb an ACTIVE hold', () => {
    const { judge } = l02Judge();
    judge.ingest(edge('down', 0, { ownerToken: 'pointer:1' }));
    for (let index = 0; index < 20; index++) {
      expect(judge.ingest(edge('down', .1 + index / 1000, { ownerToken: 'pointer:1' }))).toEqual([]);
    }
    judge.ingest(edge('down', .3, { ownerToken: 'pointer:2' }));
    judge.ingest(edge('up', .4, { ownerToken: 'pointer:2' }));
    expect(judge.snapshot().notes[0]!.status).toBe('ACTIVE');
    judge.ingest(edge('up', tickSec(960), { ownerToken: 'pointer:1' }));
    playL02Tail(judge);
    expect(finishL02(judge).score).toBe(100);
    expect(judge.snapshot().extra).toBe(0);
  });

  it('U24: same timestamp up followed by down judges each boundary exactly once', () => {
    const compiled = compileLevel(level('L01'), { repeats: 2 });
    const judge = new JudgeEngine(compiled, { sessionId: SESSION });
    const events = [
      edge('down', 0), edge('up', tickSec(480)), edge('down', tickSec(960)),
      edge('up', tickSec(1920)), edge('down', tickSec(1920)), edge('up', tickSec(2400)),
      edge('down', tickSec(2880)), edge('up', tickSec(3840)),
    ].flatMap((input, index) => judge.ingest({ ...input, sequence: index + 1 }));
    judge.advanceTo(compiled.finalizationSec + .001);
    expect(judge.snapshot().score).toBe(100);
    expect(judge.snapshot().earned).toBe(8);
    expect(events.filter((event) => event.type === 'ONSET_RESULT')).toHaveLength(4);
    expect(events.filter((event) => event.type === 'RELEASE_RESULT')).toHaveLength(4);
  });

  it.each([80, -80])('U28/U29: raw error and equal signed offset %s ms cancel', (offset) => {
    const { judge } = l02Judge({ inputOffsetMs: offset });
    judge.ingest(edge('down', offset / 1000));
    judge.ingest(edge('up', tickSec(960) + offset / 1000));
    judge.ingest(edge('down', tickSec(1440) + offset / 1000));
    judge.ingest(edge('up', tickSec(1500) + offset / 1000));
    expect(finishL02(judge).score).toBe(100);
    expect(judge.snapshot().notes[0]!.onsetErrorMs).toBeCloseTo(0, 9);
    expect(judge.snapshot().notes[0]!.releaseErrorMs).toBeCloseTo(0, 9);
  });

  it('U34: 100 identical full event logs produce identical score, state and event order', () => {
    for (const replay of replayCases) {
      const expected = runReplay(replay);
      for (let count = 0; count < 100; count++) expect(runReplay(replay)).toEqual(expected);
    }
  });

  it('U35: an old session edge cannot consume a current pending expectation', () => {
    const { judge } = l02Judge();
    const before = judge.snapshot();
    expect(judge.ingest(edge('down', 0, { sessionId: 'invalidated-epoch' }))).toEqual([]);
    expect(judge.snapshot()).toEqual(before);
  });

  it('D06: a discarded epoch edge never remaps into the restarted phrase', () => {
    const { compiled, judge } = l02Judge({ repeats: 2 });
    for (const input of replayCases.find((item) => item.name === 'perfect')!.edges) {
      judge.ingest(edge(input.edge, tickSec(input.atTick), { sequence: input.sequence }));
    }
    judge.advanceTo(compiled.motifDurationSec + .001);
    judge.ingest(edge('down', compiled.motifDurationSec + .01));
    judge.interrupt('hidden', compiled.motifDurationSec + .1);
    judge.resume('new-epoch');
    const before = judge.snapshot();
    expect(judge.ingest(edge('down', compiled.motifDurationSec, { sequence: 99 }))).toEqual([]);
    expect(judge.snapshot()).toEqual(before);
  });

  it('duplicate transport session/sequence is ignored without scoring or ownership changes', () => {
    const { judge } = l02Judge();
    const first = edge('down', 0, { sequence: 1 });
    judge.ingest(first);
    judge.ingest(edge('up', tickSec(960), { sequence: 2 }));
    const before = judge.snapshot();
    expect(judge.ingest(first)).toEqual([]);
    expect(judge.snapshot()).toEqual(before);
  });

  it('U33: pause rolls back numerator, denominator and extra together, preserving only committed phrases', () => {
    const { compiled, judge } = l02Judge({ repeats: 2 });
    for (const input of replayCases.find((item) => item.name === 'perfect')!.edges) {
      judge.ingest(edge(input.edge, tickSec(input.atTick), { sequence: input.sequence }));
    }
    const nextStart = compiled.motifDurationSec;
    judge.advanceTo(nextStart + .001);
    judge.ingest(edge('down', nextStart + .01));
    judge.ingest(edge('up', nextStart + .02));
    judge.ingest(edge('down', nextStart + .03));
    judge.ingest(edge('up', nextStart + .04));
    expect(judge.snapshot().extra).toBe(1);
    expect(judge.interrupt('pause', nextStart + .1).some((event) => event.type === 'INTERRUPT')).toBe(true);
    const paused = judge.snapshot();
    expect(paused.invalidatedFrom).toBe(1);
    expect(paused.completedPhrases).toBe(1);
    expect(paused.earned).toBe(3);
    expect(paused.expectationCount).toBe(3);
    expect(paused.extra).toBe(0);
    expect(paused.score).toBe(100);
    expect(judge.resume('resumed-session')).toBe(1920);
    for (const input of replayCases.find((item) => item.name === 'perfect')!.edges) {
      judge.ingest(edge(input.edge, nextStart + tickSec(input.atTick), {
        sequence: input.sequence, sessionId: 'resumed-session',
      }));
    }
    judge.advanceTo(compiled.finalizationSec + .001);
    expect(judge.snapshot().expectationCount).toBe(6);
    expect(judge.snapshot().earned).toBe(6);
    expect(judge.snapshot().score).toBe(100);
  });

  it.each([.01, .3])('U38: tap up after %s s changes neither onset points nor hold mastery', (upDelay) => {
    const { judge } = l02Judge();
    judge.ingest(edge('down', 0));
    judge.ingest(edge('up', tickSec(960)));
    judge.ingest(edge('down', tickSec(1440)));
    judge.ingest(edge('up', tickSec(1440) + upDelay));
    const result = finishL02(judge);
    expect(result.score).toBe(100);
    expect(result.metrics.holdCount).toBe(1);
    expect(result.metrics.releaseInWindowCount).toBe(1);
    expect(result.notes[1]!.releasePoints).toBe(0);
  });

  it('D15: absent rest/tie/hold/re-entry samples report null, never invented 100% mastery', () => {
    const compiled = compileLevel(level('L06'));
    const judge = new JudgeEngine(compiled, { sessionId: SESSION });
    compiled.notes.forEach((item) => {
      judge.ingest(edge('down', item.startSec));
      judge.ingest(edge('up', item.startSec + .01));
    });
    judge.advanceTo(compiled.finalizationSec + .001);
    const { metrics } = judge.snapshot();
    expect(metrics.restCount).toBe(0);
    expect(metrics.restCleanRatio).toBeNull();
    expect(metrics.tieCount).toBe(0);
    expect(metrics.tieContinuousRatio).toBeNull();
    expect(metrics.holdCount).toBe(0);
    expect(metrics.releaseInWindowRatio).toBeNull();
    expect(metrics.reentryCount).toBe(0);
    expect(metrics.reentryRatio).toBeNull();
  });
});

describe('rest boundary exceptions, dispatch grace, and late recovery (U21/U32/U41/U42/U45/U46)', () => {
  it('U32: an early tap down inside its window leaves the preceding rest clean', () => {
    const { judge } = l02Judge();
    judge.ingest(edge('down', 0));
    judge.ingest(edge('up', tickSec(960)));
    judge.ingest(edge('down', tickSec(1440) - .1));
    judge.ingest(edge('up', tickSec(1500)));
    const result = finishL02(judge);
    expect(result.notes[1]!.onsetPoints).toBe(.4);
    expect(result.extra).toBe(0);
    expect(result.metrics.restCleanCount).toBe(result.metrics.restCount);
  });

  it('release +100 ms into a rest earns .75 without polluting that rest', () => {
    const { judge } = l02Judge();
    judge.ingest(edge('down', 0));
    judge.ingest(edge('up', tickSec(960) + .1));
    playL02Tail(judge);
    const result = finishL02(judge);
    expect(result.notes[0]!.releasePoints).toBe(.75);
    expect(result.metrics.restCleanCount).toBe(result.metrics.restCount);
    expect(result.extra).toBe(0);
  });

  it('U21: overhold +170 ms loses release, dirties one rest and never adds an up penalty', () => {
    const { judge } = l02Judge();
    judge.ingest(edge('down', 0));
    judge.advanceTo(tickSec(960) + .161);
    judge.ingest(edge('up', tickSec(960) + .17));
    playL02Tail(judge);
    const result = finishL02(judge);
    expect(result.notes[0]!.releasePoints).toBe(0);
    expect(result.notes[0]!.status).toBe('OVERHELD');
    expect(result.metrics.restCleanCount).toBe(result.metrics.restCount - 1);
    expect(result.extra).toBe(0);
  });

  it('U21: holding through the next onset never auto-hits it', () => {
    const { compiled, judge } = l02Judge();
    judge.ingest(edge('down', 0));
    judge.advanceTo(compiled.finalizationSec + .001);
    expect(judge.snapshot().notes[1]!.onsetPoints).toBe(0);
    expect(judge.snapshot().notes[1]!.status).toBe('MISSED');
  });

  it('U41: a +130 ms onset delivered +220 ms is accepted inside 100 ms grace', () => {
    const { judge } = l02Judge();
    judge.advanceTo(.22);
    const events = judge.ingest(edge('down', .13, { receiptSec: .22 }));
    expect(events.some((event) => event.type === 'INTERRUPT')).toBe(false);
    expect(judge.snapshot().notes[0]!.onsetPoints).toBe(.4);
  });

  it('U42: normal timestamp delivered after onset timeout rolls back the affected phrase', () => {
    const { judge } = l02Judge();
    judge.advanceTo(.25);
    const events = judge.ingest(edge('down', .13, { receiptSec: .25 }));
    expect(events.some((event) => event.type === 'INTERRUPT')).toBe(true);
    expect(judge.snapshot().invalidatedFrom).toBe(0);
    expect(judge.snapshot().earned).toBe(0);
    expect(judge.snapshot().extra).toBe(0);
  });

  it('U42: normal release delivered after release timeout rolls back onset evidence too', () => {
    const { judge } = l02Judge();
    judge.ingest(edge('down', 0));
    judge.advanceTo(tickSec(960) + .27);
    const events = judge.ingest(edge('up', tickSec(960) + .13,
      { receiptSec: tickSec(960) + .27 }));
    expect(events.some((event) => event.type === 'INTERRUPT')).toBe(true);
    expect(judge.snapshot().invalidatedFrom).toBe(0);
    expect(judge.snapshot().earned).toBe(0);
  });

  it('receipt delay >200 ms is a technical interruption without a user miss or extra', () => {
    const { judge } = l02Judge();
    const events = judge.ingest(edge('down', 0, { receiptSec: .201 }));
    expect(events.some((event) => event.type === 'INTERRUPT')).toBe(true);
    expect(judge.snapshot().invalidatedFrom).toBe(0);
    expect(judge.snapshot().earned).toBe(0);
    expect(judge.snapshot().extra).toBe(0);
  });

  it('receipt delay exactly 200 ms is accepted and keeps the original timestamp grade', () => {
    const { judge } = l02Judge();
    const events = judge.ingest(edge('down', 0, { receiptSec: .2 }));
    expect(events.some((event) => event.type === 'INTERRUPT')).toBe(false);
    expect(judge.snapshot().notes[0]!.onsetPoints).toBe(1);
  });

  it('D3: a valid late release received after RESULTS revokes completed phrase evidence', () => {
    const compiled = compileLevel(level('L01'));
    const judge = new JudgeEngine(compiled, { sessionId: SESSION });
    judge.ingest(edge('down', 0));
    judge.ingest(edge('up', tickSec(480)));
    judge.ingest(edge('down', tickSec(960)));
    judge.advanceTo(compiled.finalizationSec + .01);
    expect(judge.snapshot().finished).toBe(true);
    const events = judge.ingest(edge('up', compiled.durationSec + .13,
      { receiptSec: compiled.durationSec + .27 }));
    expect(events.some((event) => event.type === 'INTERRUPT' && event.reason === 'late_finalized_edge')).toBe(true);
    expect(judge.snapshot().finished).toBe(false);
    expect(judge.snapshot().completedPhrases).toBe(0);
    expect(judge.snapshot().earned).toBe(0);
  });

  it('D06/D07: late evidence in a preserved earlier epoch revokes that earlier phrase and its dependents', () => {
    const compiled = compileLevel(level('L01'), { repeats: 2 });
    const judge = new JudgeEngine(compiled, { sessionId: SESSION });
    judge.ingest(edge('down', 0));
    judge.ingest(edge('up', tickSec(480)));
    judge.ingest(edge('down', tickSec(960)));
    const boundary = compiled.motifDurationSec;
    judge.advanceTo(boundary + .27);
    judge.interrupt('pause', boundary + .28);
    expect(judge.snapshot().completedPhrases).toBe(1);
    judge.resume('new-epoch');
    const events = judge.ingest(edge('up', boundary + .13,
      { receiptSec: boundary + .29, sequence: 99 }));
    expect(events.some((event) => event.type === 'INTERRUPT' && event.reason === 'late_finalized_edge')).toBe(true);
    expect(judge.snapshot().invalidatedFrom).toBe(0);
    expect(judge.snapshot().earned).toBe(0);
    expect(judge.snapshot().completedPhrases).toBe(0);
  });

  it('U45: the first onset gets the same -100 ms early window at count-in end', () => {
    const { judge } = l02Judge();
    const events = judge.ingest(edge('down', -.1));
    expect(events.some((event) => event.type === 'ONSET_RESULT' && event.points === .4)).toBe(true);
    expect(judge.snapshot().notes[0]!.onsetPoints).toBe(.4);
    expect(judge.snapshot().extra).toBe(0);
  });

  it('D11: a count-in press before the early window requires physical up before the first onset', () => {
    const { judge } = l02Judge();
    expect(judge.ingest(edge('down', -.2))).toEqual([]);
    expect(judge.ingest(edge('down', 0))).toEqual([]);
    expect(judge.snapshot().notes[0]!.status).toBe('PENDING');
    judge.ingest(edge('up', .01));
    judge.ingest(edge('down', .02));
    expect(judge.snapshot().notes[0]!.onsetPoints).toBe(1);
    expect(judge.snapshot().extra).toBe(0);
  });

  it('U46: a real restrike inside an already successful tap window is EXTRA_DOWN', () => {
    const { judge } = l02Judge();
    judge.ingest(edge('down', 0));
    judge.ingest(edge('up', tickSec(960)));
    judge.ingest(edge('down', tickSec(1440)));
    judge.ingest(edge('up', tickSec(1440) + .01));
    const events = judge.ingest(edge('down', tickSec(1440) + .02));
    expect(events.some((event) => event.type === 'EXTRA_DOWN')).toBe(true);
    expect(events.some((event) => event.type === 'INTERRUPT')).toBe(false);
    expect(judge.snapshot().extra).toBe(1);
    expect(judge.snapshot().invalidatedFrom).toBeNull();
  });
});
