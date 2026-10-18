import type { Level, ValidationIssue, NotationEvent } from './types';
import Ajv2020 from 'ajv/dist/2020';
import levelSchema from '../content/level.schema.json';
const schemaValidate = new Ajv2020({ allErrors: true, strict: true }).compile(levelSchema);
const pitchMidi: Record<string, number> = { C5: 72, D5: 74, E5: 76, G5: 79 };
const scenes = ['thread-bridge', 'crescent-greenhouse', 'folding-room', 'cloud-post'];
const skills = ['duration', 'tie', 'cross-bar-tie', 'dot', 'dotted-rest', 'simple-triple', 'compound-duple', 'tempo'];
const sequence = { countInBars: 1, listenRepeats: 2, listenTailBars: 1, practiceRepeats: 2, playRepeats: 4, outroBars: 1 };
const record = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
export function notationTicks(denominator: number, dots: number): number { return 1920 / denominator * (dots === 1 ? 1.5 : 1); }
/** Non-mutating structural + semantic validator. No sorting, repair or rounding. */
export function validateLevel(value: unknown, file = 'level.json'): { valid: boolean; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  const aliases: Record<string, string> = { BAR_SUM: 'BAR_LENGTH', AT_CONTINUITY: 'EVENT_CONTIGUITY', NOTATION_TICKS: 'DURATION_MISMATCH', PITCH_MIDI: 'PITCH_MIDI_MISMATCH', TIE_PITCH: 'TIE_PITCH_MISMATCH', TIE_CONTINUITY: 'TIE_CONTIGUITY', TIE_SINGLE: 'TIE_TOO_SHORT', TIE_HOLD: 'TIE_INTERACTION', DUPLICATE_ID: 'DUPLICATE_EVENT_ID' };
  const fail = (path: string, code: string, observed: unknown, expected: unknown) => { issues.push({ path, code: aliases[code] ?? code, observed, expected, file }); };
  if (!schemaValidate(value)) for (const error of schemaValidate.errors ?? []) fail(error.instancePath, 'SCHEMA', error.params, error.message);
  const fields = (v: Record<string, unknown>, allowed: string[], required: string[], path: string) => {
    for (const k of Object.keys(v)) if (!allowed.includes(k)) fail(`${path}/${k}`, 'UNKNOWN_FIELD', v[k], 'no additional properties');
    for (const k of required) if (!(k in v)) fail(`${path}/${k}`, 'REQUIRED', undefined, k);
  };
  if (!record(value)) { fail('', 'TYPE', value, 'object'); return { valid: false, issues }; }
  const rootFields = ['schemaVersion', 'id', 'title', 'scene', 'ppq', 'meter', 'quarterBpm', 'sourceIds', 'skillIds', 'sequence', 'bars', 'reviewState'];
  fields(value, rootFields, rootFields, '');
  if (value.schemaVersion !== 1) fail('/schemaVersion', 'CONST', value.schemaVersion, 1);
  if (value.ppq !== 480) fail('/ppq', 'PPQ', value.ppq, 480);
  if (typeof value.id !== 'string' || !/^L[0-9]{2}$/.test(value.id)) fail('/id', 'LEVEL_ID', value.id, 'L01..L09');
  if (typeof value.title !== 'string' || !value.title.length) fail('/title', 'TYPE', value.title, 'nonempty string');
  if (!scenes.includes(String(value.scene))) fail('/scene', 'SCENE', value.scene, scenes);
  if (typeof value.quarterBpm !== 'number' || !Number.isFinite(value.quarterBpm) || value.quarterBpm < 50 || value.quarterBpm > 140) fail('/quarterBpm', 'BPM', value.quarterBpm, '50..140');
  if (value.reviewState !== 'math_checked_art_audio_review_pending') fail('/reviewState', 'REVIEW_STATE', value.reviewState, 'math_checked_art_audio_review_pending');
  for (const k of ['sourceIds', 'skillIds']) {
    const a = value[k];
    if (!Array.isArray(a) || a.length < 1 || a.some(x => typeof x !== 'string') || new Set(a).size !== a.length) fail(`/${k}`, 'ARRAY', a, 'nonempty unique string array');
    if (k === 'skillIds' && Array.isArray(a) && a.some(x => !skills.includes(String(x)))) fail(`/${k}`, 'SKILL', a, skills);
  }
  if (!record(value.sequence) || JSON.stringify(Object.entries(value.sequence).sort()) !== JSON.stringify(Object.entries(sequence).sort())) fail('/sequence', 'SEQUENCE', value.sequence, sequence);
  let barTicks = 0;
  if (!record(value.meter)) fail('/meter', 'METER', value.meter, '4/4, 3/4 or 6/8');
  else {
    fields(value.meter, ['n', 'd', 'groupingEighths'], ['n', 'd', 'groupingEighths'], '/meter');
    const { n, d, groupingEighths } = value.meter;
    const expected = n === 4 && d === 4 ? [2, 2, 2, 2] : n === 3 && d === 4 ? [2, 2, 2] : n === 6 && d === 8 ? [3, 3] : null;
    if (!expected || JSON.stringify(groupingEighths) !== JSON.stringify(expected)) fail('/meter', 'METER_GROUPING', value.meter, expected);
    if (typeof n === 'number' && typeof d === 'number') barTicks = n * 4 / d * 480;
  }
  if (!Array.isArray(value.bars) || value.bars.length < 1 || value.bars.length > 8) { fail('/bars', 'BARS', value.bars, '1..8 bars'); return { valid: false, issues }; }
  const ids = new Set<string>();
  const ties = new Map<string, { event: NotationEvent; tick: number; path: string }[]>();
  value.bars.forEach((bar, bi) => {
    const bp = `/bars/${bi}`;
    if (!record(bar)) { fail(bp, 'TYPE', bar, 'object'); return; }
    fields(bar, ['events'], ['events'], bp);
    if (!Array.isArray(bar.events) || !bar.events.length) { fail(`${bp}/events`, 'EVENTS', bar.events, 'nonempty array'); return; }
    let expectedAt = 0;
    bar.events.forEach((event, ei) => {
      const ep = `${bp}/events/${ei}`;
      if (!record(event)) { fail(ep, 'TYPE', event, 'object'); return; }
      const common = ['id', 'at', 'ticks', 'kind', 'notation'];
      const noteFields = ['pitchName', 'midi', 'interaction', 'tieGroup'];
      fields(event, event.kind === 'note' ? [...common, ...noteFields] : common, event.kind === 'note' ? [...common, ...noteFields.slice(0, 3)] : common, ep);
      if (event.kind !== 'note' && event.kind !== 'rest') fail(`${ep}/kind`, 'KIND', event.kind, 'note|rest');
      if (typeof event.id !== 'string' || !event.id.length) fail(`${ep}/id`, 'EVENT_ID', event.id, 'nonempty string');
      else { if (ids.has(event.id)) fail(`${ep}/id`, 'DUPLICATE_ID', event.id, 'unique across motif'); ids.add(event.id); }
      if (!Number.isInteger(event.at) || (event.at as number) < 0) fail(`${ep}/at`, 'INTEGER_TICK', event.at, 'nonnegative integer');
      if (event.at !== expectedAt) fail(`${ep}/at`, 'AT_CONTINUITY', event.at, expectedAt);
      if (!Number.isInteger(event.ticks) || (event.ticks as number) <= 0) fail(`${ep}/ticks`, 'INTEGER_TICK', event.ticks, 'positive integer');
      if (record(event.notation)) {
        fields(event.notation, ['denominator', 'dots'], ['denominator', 'dots'], `${ep}/notation`);
        const den = Number(event.notation.denominator); const dots = Number(event.notation.dots);
        if (![1, 2, 4, 8, 16].includes(den) || typeof event.notation.denominator !== 'number' || ![0, 1].includes(dots) || typeof event.notation.dots !== 'number') fail(`${ep}/notation`, 'NOTATION', event.notation, 'denominator 1/2/4/8/16, dots 0/1');
        if (notationTicks(den, dots) !== event.ticks) fail(`${ep}/ticks`, 'NOTATION_TICKS', event.ticks, notationTicks(den, dots));
      } else fail(`${ep}/notation`, 'TYPE', event.notation, 'notation');
      if (event.kind === 'note') {
        if (!(String(event.pitchName) in pitchMidi) || pitchMidi[String(event.pitchName)] !== event.midi) fail(`${ep}/midi`, 'PITCH_MIDI', event.midi, pitchMidi[String(event.pitchName)]);
        if (event.interaction !== 'tap' && event.interaction !== 'hold') fail(`${ep}/interaction`, 'INTERACTION', event.interaction, 'tap|hold');
        if ('tieGroup' in event) {
          if (typeof event.tieGroup !== 'string' || !event.tieGroup.length) fail(`${ep}/tieGroup`, 'TIE_ID', event.tieGroup, 'nonempty string');
          else { const group = ties.get(event.tieGroup) ?? []; group.push({ event: event as unknown as NotationEvent, tick: bi * barTicks + Number(event.at), path: ep }); ties.set(event.tieGroup, group); }
        }
      }
      expectedAt += Number(event.ticks);
    });
    if (expectedAt !== barTicks) fail(`${bp}/events`, 'BAR_SUM', expectedAt, barTicks);
  });
  for (const group of ties.values()) {
    if (group.length < 2) fail(group[0]!.path, 'TIE_SINGLE', group.length, 'at least two notes');
    group.forEach((item, i) => {
      const e = item.event;
      if (e.kind !== 'note') return;
      const first = group[0]!.event;
      if (e.interaction !== 'hold') fail(item.path, 'TIE_HOLD', e.interaction, 'hold');
      if (first.kind === 'note' && (first.pitchName !== e.pitchName || first.midi !== e.midi)) fail(item.path, 'TIE_PITCH', [e.pitchName, e.midi], [first.pitchName, first.midi]);
      if (i && group[i - 1]!.tick + group[i - 1]!.event.ticks !== item.tick) fail(item.path, 'TIE_CONTINUITY', item.tick, group[i - 1]!.tick + group[i - 1]!.event.ticks);
    });
  }
  const sceneMap: Record<string, string> = { L01: scenes[0]!, L02: scenes[0]!, L03: scenes[0]!, L04: scenes[1]!, L05: scenes[1]!, L06: scenes[2]!, L07: scenes[2]!, L08: scenes[3]!, L09: scenes[3]! };
  if (typeof value.id === 'string' && sceneMap[value.id] && value.scene !== sceneMap[value.id]) fail('/scene', 'LEVEL_SCENE', value.scene, sceneMap[value.id]);
  return { valid: issues.length === 0, issues };
}
export function assertLevel(value: unknown): asserts value is Level {
  const result = validateLevel(value); if (!result.valid) throw new Error(`INVALID_LEVEL ${JSON.stringify(result.issues)}`);
}
