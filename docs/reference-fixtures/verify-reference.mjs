import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const fixtureRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(fixtureRoot, '..', '..');
const read = (p) => fs.readFileSync(path.resolve(projectRoot, p));
const json = (p) => JSON.parse(read(p).toString('utf8'));
const hash = (data) => crypto.createHash('sha256').update(data).digest('hex');
const canonical = (value) => JSON.stringify(value, (_, v) => v && !Array.isArray(v) && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]])) : v);
const checks = [];
const assert = (id, actual, expected) => { const pass = canonical(actual) === canonical(expected); checks.push({id, pass, actual, expected}); if (!pass) throw new Error(`${id}: ${canonical(actual)} != ${canonical(expected)}`); };
const manifest = json('docs/reference-fixtures/manifest.json');
for (const entry of manifest.files) {
  assert(`source/parsed/${entry.sourceFile}`, json(`docs/reference-fixtures/${entry.sourceFile}`), json(`docs/reference-fixtures/${entry.parsedFile}`));
  assert(`excerpt-hash/${entry.sourceFile}`, hash(read(`docs/reference-fixtures/${entry.sourceFile}`)), entry.sourceSha256);
}
const fixture = (kind) => json(`docs/reference-fixtures/${manifest.files.find((e) => e.source === 'reference/promptpack.md' && e.fixtureKind === kind).sourceFile}`);
const schema = fixture('level-schema');
const levels = fixture('level-array');
const designSchema = json('docs/reference-fixtures/design-01-level-schema.source.json');
assert('schema/design-promptpack-object-equality', schema, designSchema);
for (let i = 0; i < levels.length; i++) assert(`levels/design-promptpack/${levels[i].id}`, json(`docs/reference-fixtures/design-${String(i + 2).padStart(2, '0')}-object.source.json`), levels[i]);
const golden = fixture('compiledLevelGolden');
const summaries = [];
for (const level of levels) {
  const expected = golden.levels.find((g) => g.levelId === level.id);
  const barTicks = level.meter.n * 4 * 480 / level.meter.d;
  const notes = [];
  const rests = [];
  const ids = new Set();
  for (const [bar, { events }] of level.bars.entries()) {
    let at = 0;
    for (const event of events) {
      assert(`${level.id}/${event.id}/at`, event.at, at);
      assert(`${level.id}/${event.id}/duration`, event.ticks, (1920 / event.notation.denominator) * (event.notation.dots ? 1.5 : 1));
      assert(`${level.id}/${event.id}/unique`, ids.has(event.id), false);
      ids.add(event.id);
      const absolute = { ...event, at: bar * barTicks + event.at };
      if (event.kind === 'note') notes.push(absolute);
      else rests.push({sourceNotationId: event.id, startTick: absolute.at, endTick: absolute.at + event.ticks});
      at += event.ticks;
    }
    assert(`${level.id}/bar-${bar}/ticks`, at, barTicks);
  }
  const gates = [];
  for (const note of notes) {
    const previous = gates.at(-1);
    if (note.tieGroup && previous?.tieGroup === note.tieGroup) {
      assert(`${level.id}/${note.id}/tie-contiguous`, previous.endTick, note.at);
      assert(`${level.id}/${note.id}/tie-midi`, previous.pitchMidi, note.midi);
      previous.tieBoundaryTicks.push(note.at);
      previous.endTick = note.at + note.ticks;
      previous.sourceNotationIds.push(note.id);
    } else {
      gates.push({id: `${level.id}:${note.id}`, onsetTick: note.at, endTick: note.at + note.ticks, interaction: note.interaction, pitchMidi: note.midi, sourceNotationIds: [note.id], tieBoundaryTicks: [], tieGroup: note.tieGroup});
    }
  }
  const cleanGates = gates.map(({tieGroup, ...g}) => g);
  const motifTicks = level.bars.length * barTicks;
  const N = gates.reduce((sum, g) => sum + (g.interaction === 'hold' ? 2 : 1), 0);
  const bigBeatTicksPerBar = [];
  let groupStart = 0;
  for (const group of level.meter.groupingEighths) { bigBeatTicksPerBar.push(groupStart); groupStart += group * 240; }
  assert(`${level.id}/golden-bar`, barTicks, expected.barTicks);
  assert(`${level.id}/golden-motif`, motifTicks, expected.motifTicks);
  assert(`${level.id}/golden-seconds-fraction`, motifTicks / 480 * 60 / level.quarterBpm, expected.motifSecondsFraction[0] / expected.motifSecondsFraction[1]);
  assert(`${level.id}/golden-N`, N, expected.scoreDenominatorPerMotif);
  assert(`${level.id}/golden-N-play`, N * 4, expected.scoreDenominatorPlay4);
  assert(`${level.id}/golden-gates`, cleanGates, expected.gates);
  assert(`${level.id}/golden-rests`, rests, expected.rests);
  assert(`${level.id}/golden-big-beats`, bigBeatTicksPerBar, expected.bigBeatTicksPerBar);
  assert(`${level.id}/golden-onset-us`, gates.map((g) => Math.round(g.onsetTick / 480 * 60 / level.quarterBpm * 1e6)), expected.onsetMicrosecondsFromMotifStart);
  summaries.push({levelId: level.id, barTicks, motifTicks, motifSeconds: motifTicks / 480 * 60 / level.quarterBpm, N, playN: N * 4, gateCount: gates.length, restCount: rests.length, bigBeatTicksPerBar});
}
const assetRoot = 'reference/assets/night_thread_mobile_runtime_v1';
const runtime = json(`${assetRoot}/runtime_manifest.json`);
for (const asset of runtime.assets) {
  const buffer = read(`${assetRoot}/${asset.path}`);
  assert(`asset/${asset.assetId}/bytes`, buffer.length, asset.bytes);
  assert(`asset/${asset.assetId}/sha256`, hash(buffer), asset.sha256);
  if (asset.pngFallbackPath) {
    const fallback = read(`${assetRoot}/${asset.pngFallbackPath}`);
    assert(`fallback/${asset.assetId}/bytes`, fallback.length, asset.pngFallbackBytes);
    assert(`fallback/${asset.assetId}/sha256`, hash(fallback), asset.pngFallbackSha256);
  }
}
assert('assets/logical-count', runtime.assets.length, 92);
assert('assets/webp-count', runtime.assets.filter((a) => a.format === 'image/webp').length, 17);
assert('assets/svg-count', runtime.assets.filter((a) => a.format === 'image/svg+xml').length, 75);
assert('assets/primary-bytes', runtime.assets.reduce((sum, a) => sum + a.bytes, 0), 1916295);
assert('assets/unapproved-preserved', runtime.assets.filter((a) => a.releaseApproved === false).length, 92);
const sources = [
 ['reference/design.md', '6a4b3db31f6288bde3924c4dc21bb64d49c12f518cc77c0d33404f55a654eedb'],
 ['reference/mobile-assets.zip', '67478bb9a7c96454cd0946aee9d1134c880c0c40ffb75a5eaa4052ef583c44ec'],
 [`${assetRoot}/runtime_manifest.json`, '2c916a9a196990a1e9ddb2c61436733473879448301bc1f34af02b2d1582eb56'],
 ['docs/reference-fixtures/promptpack-01-level-schema.source.json', '412439879271fae832933059a490f74d6eae0848faa7fb2e3ac05cc6b0128c5a'],
 ['docs/reference-fixtures/promptpack-02-level-array.source.json', 'd7b608c79ca28214329607b1ea4773d6c810b269f2ce23ccfb9e18a1e1c2c6ce'],
];
for (const [file, expected] of sources) assert(`source-hash/${file}`, hash(read(file)), expected);
const report = {scope: 'Static independent source/oracle consistency only; does not test game implementation, browser decoding, physical audio, devices, or educator approval.', sourcePromptpackSha256: hash(read('reference/promptpack.md')), checks: checks.length, passed: checks.filter((c) => c.pass).length, failed: checks.filter((c) => !c.pass).length, jsonBlockCount: manifest.files.length, levelSummaries: summaries, assetApproval: { releaseApprovedFalse: 92, humanReview: 'pending' }, details: checks.map(({id, pass}) => ({id, pass}))};
fs.writeFileSync(path.join(fixtureRoot, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({...report, details: undefined}, null, 2));
