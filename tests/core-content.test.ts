import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { levels, campaignOrder } from '../src/content';
import schema from '../src/content/level.schema.json';
import { validateLevel } from '../src/core/validation';
import { compileLevel } from '../src/core/compiler';
const read = (path: string): unknown => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
describe('canonical content validation command', () => {
  it('preserves the complete supplied array, schema and pending review state', () => {
    expect(levels).toEqual(read('../reference/assets/night_thread_mobile_runtime_v1/source/dream_level_examples.json'));
    expect(schema).toEqual(read('../docs/reference-fixtures/promptpack-01-level-schema.source.json'));
    expect(levels).toHaveLength(9);
  });
  it.each(levels)('$id validates without mutations, matches its individual source and compiles PLAY4', level => {
    const before = JSON.stringify(level);
    expect(validateLevel(level, `${level.id}.json`)).toEqual({ valid: true, issues: [] });
    expect(level).toEqual(read(`../src/content/levels/${level.id}.json`));
    const timeline = compileLevel(level, { repeats: 4 });
    expect(timeline.phrases).toHaveLength(4); expect(timeline.expectationCount).toBeGreaterThan(0);
    expect(JSON.stringify(level)).toBe(before);
  });
  it('keeps the recommended route without score locks and preserves the paired patterns', () => {
    expect(campaignOrder).toEqual(['L01', 'L02', 'L03', 'L04', 'L06', 'L07', 'L05', 'L08', 'L09']);
    expect(levels[5]!.bars).toEqual(levels[6]!.bars); expect(levels[7]!.bars).toEqual(levels[8]!.bars);
  });
});
