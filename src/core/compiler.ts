import type { CompiledNote, CompiledRest, CompiledTimeline, Level, MusicalEvent, Phrase, BeatCue } from './types';
import { assertLevel } from './validation';
import { makeWindows } from './windows';
export const DISPATCH_GRACE_SEC = .1;
export function tickToSeconds(tick: number, quarterBpm: number, speed = 1): number { return tick / 480 * 60 / (quarterBpm * speed); }
export function secondsToTick(seconds: number, quarterBpm: number, speed = 1): number { return seconds * quarterBpm * speed / 60 * 480; }
export interface CompileOptions { repeats?: number; speed?: number; wideWindows?: boolean; startTick?: number; phase?: string }
export function compileLevel(level: Level, options: CompileOptions = {}): CompiledTimeline {
  assertLevel(level);
  const { repeats = 1, speed = 1, wideWindows = false, startTick = 0, phase = 'PLAY' } = options;
  if (!Number.isInteger(repeats) || repeats < 1 || repeats > 16 || ![.75, 1].includes(speed) || !Number.isInteger(startTick)) throw new Error('INVALID_COMPILE_OPTIONS');
  const sec = (tick: number) => tickToSeconds(tick, level.quarterBpm, speed);
  const barTicks = level.meter.n * 4 / level.meter.d * 480;
  const motifTicks = level.bars.length * barTicks;
  const notes: CompiledNote[] = []; const rests: CompiledRest[] = []; const phrases: Phrase[] = []; const beats: BeatCue[] = [];
  for (let repetition = 0; repetition < repeats; repetition++) {
    const origin = startTick + repetition * motifTicks;
    const tieMap = new Map<string, CompiledNote>();
    for (let bi = 0; bi < level.bars.length; bi++) {
      for (const event of level.bars[bi]!.events) {
        const at = origin + bi * barTicks + event.at; const end = at + event.ticks;
        const id = `${level.id}:${phase}:${repetition}:${event.id}`;
        if (event.kind === 'rest') {
          rests.push({ id, phraseIndex: repetition, startTick: at, endTick: end, startSec: sec(at), endSec: sec(end), sourceNotationIds: [event.id], evaluationStartSec: sec(at), evaluationEndSec: sec(end), excluded: false, nextOnsetId: null });
        } else {
          const previous = event.tieGroup ? tieMap.get(event.tieGroup) : undefined;
          if (previous) { previous.tieBoundaries.push(at); previous.endTick = end; previous.endSec = sec(end); previous.sourceNotationIds.push(event.id); }
          else {
            const note: CompiledNote = { id, occurrenceId: id, phraseIndex: repetition, startTick: at, endTick: end, startSec: sec(at), endSec: sec(end), interaction: event.interaction, pitchName: event.pitchName, midi: event.midi, sourceNotationIds: [event.id], tieBoundaries: [], onsetWindow: makeWindows('onset'), releaseWindow: makeWindows('release') };
            notes.push(note); if (event.tieGroup) tieMap.set(event.tieGroup, note);
          }
        }
      }
      const majorStarts = new Set<number>(); let groupAt = 0;
      for (const size of level.meter.groupingEighths) { majorStarts.add(groupAt); groupAt += size * 240; }
      for (let step = 0; step < barTicks; step += 240) {
        const tick = origin + bi * barTicks + step; const major = majorStarts.has(step); const first = step === 0;
        beats.push({ tick, timeSec: sec(tick), phraseIndex: repetition, index: step / 240, major, first, gain: first ? .8 : major ? .55 : .3 });
      }
    }
    phrases.push({ index: repetition, startTick: origin, endTick: origin + motifTicks, startSec: sec(origin), endSec: sec(origin + motifTicks), finalizeSec: sec(origin + motifTicks), expectationCount: 0 });
  }
  notes.forEach((note, i) => {
    const previous = notes[i - 1]; const next = notes[i + 1];
    const gapMs = Math.min(previous ? (note.startSec - previous.startSec) * 1000 : Infinity, next ? (next.startSec - note.startSec) * 1000 : Infinity);
    note.onsetWindow = makeWindows('onset', .45 * gapMs, wideWindows);
    note.releaseWindow = makeWindows('release', .45 * (note.endSec - note.startSec) * 1000, wideWindows);
    const p = phrases[note.phraseIndex]!; p.expectationCount += note.interaction === 'hold' ? 2 : 1;
    p.finalizeSec = Math.max(p.finalizeSec, note.startSec + note.onsetWindow.lateMs / 1000 + DISPATCH_GRACE_SEC, note.interaction === 'hold' ? note.endSec + note.releaseWindow.lateMs / 1000 + DISPATCH_GRACE_SEC : 0);
  });
  rests.forEach(rest => {
    const previous = [...notes].reverse().find(n => n.endSec <= rest.startSec);
    const next = notes.find(n => n.startSec >= rest.endSec);
    if (previous?.interaction === 'hold') rest.evaluationStartSec = Math.max(rest.startSec, previous.endSec + previous.releaseWindow.lateMs / 1000);
    if (next) { rest.evaluationEndSec = Math.min(rest.endSec, next.startSec - next.onsetWindow.lateMs / 1000); rest.nextOnsetId = next.id; }
    rest.excluded = rest.evaluationEndSec <= rest.evaluationStartSec;
  });
  const expectationCount = phrases.reduce((sum, p) => sum + p.expectationCount, 0);
  if (!expectationCount) throw new Error('EMPTY_SCORED_CHART');
  const events: MusicalEvent[] = [];
  for (const note of notes) {
    events.push({ type: 'ONSET', tick: note.startTick, audioSec: note.startSec, occurrenceId: note.id, sourceNotationIds: note.sourceNotationIds }, { type: 'GATE_END', tick: note.endTick, audioSec: note.endSec, occurrenceId: note.id, sourceNotationIds: note.sourceNotationIds });
    for (const tick of note.tieBoundaries) events.push({ type: 'TIE_BOUNDARY', tick, audioSec: sec(tick), occurrenceId: note.id, sourceNotationIds: note.sourceNotationIds });
  }
  for (const rest of rests) events.push({ type: 'REST_START', tick: rest.startTick, audioSec: rest.startSec, occurrenceId: rest.id, sourceNotationIds: rest.sourceNotationIds }, { type: 'REST_END', tick: rest.endTick, audioSec: rest.endSec, occurrenceId: rest.id, sourceNotationIds: rest.sourceNotationIds });
  for (const beat of beats) events.push({ type: 'BEAT', tick: beat.tick, audioSec: beat.timeSec, occurrenceId: `${level.id}:${phase}:${beat.phraseIndex}:beat:${beat.tick}`, sourceNotationIds: [] });
  events.sort((a, b) => a.tick - b.tick);
  return { level, notes, rests, phrases, beats, events, durationTicks: repeats * motifTicks, durationSec: sec(repeats * motifTicks), motifTicks, motifDurationSec: sec(motifTicks), barTicks, expectationCount, speed, effectiveQuarterBpm: level.quarterBpm * speed, startTick, finalizationSec: Math.max(...phrases.map(p => p.finalizeSec)) };
}
export function phasePlan(level: Level) {
  const barTicks = level.meter.n * 4 / level.meter.d * 480; const motifTicks = barTicks * level.bars.length;
  return { countInTicks: barTicks, listenTicks: motifTicks * 2, listenTailTicks: barTicks, practiceTicks: motifTicks * 2, playTicks: motifTicks * 4, outroTicks: barTicks };
}
