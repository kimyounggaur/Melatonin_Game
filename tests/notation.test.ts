import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Level } from '../src/core';
import { compileLevel, validateLevel } from '../src/core';
import { EDUCATION_REVIEW_NOTICE, LESSONS, METER_QUIZ, METER_QUIZ_REQUIRED_CORRECT, createMeterQuiz } from '../src/lessons';
import { renderNotation } from '../src/notation';
import { comparisonPatterns } from '../src/comparisons';

// Music fixtures are the supplied source data, not renderer-derived snapshots.
const supplied = JSON.parse(readFileSync(new URL('../public/assets/night-thread/source/dream_level_examples.json', import.meta.url), 'utf8')) as Level[];
const level = (id: string): Level => structuredClone(supplied.find(item => item.id === id)!);
const events = (html: string): string[] => [...html.matchAll(/<g class="notation-event[^\"]*"[^>]*>/g)].map(match => match[0]);
const attr = (html: string, key: string): string => html.match(new RegExp(`${key}="([^\"]*)"`))?.[1] ?? '';
const textContent = (html: string): string => html.replace(/<svg\b[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ');

describe('source-driven accessible rhythm notation', () => {
  it.each(supplied)('$id retains every source note and rest, without modifying data', source => {
    const before = JSON.stringify(source);
    const html = renderNotation(source);
    const glyphs = events(html);
    expect(glyphs.map(glyph => attr(glyph, 'data-source-notation-id')))
      .toEqual(source.bars.flatMap(bar => bar.events.map(event => event.id)));
    expect(glyphs.map(glyph => attr(glyph, 'data-kind')))
      .toEqual(source.bars.flatMap(bar => bar.events.map(event => event.kind)));
    expect(JSON.stringify(source)).toBe(before);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('<summary>악보를 글로 읽기</summary>');
    expect(html).toContain(EDUCATION_REVIEW_NOTICE);
    expect(textContent(html)).not.toMatch(/tick|틱|480|720|960|1920/i);
  });

  it('L02 draws the two original quarter notes, a single tie curve, and the separate E5 eighth', () => {
    const html = renderNotation(level('L02'));
    const glyphs = events(html);
    expect(glyphs).toHaveLength(5);
    expect(glyphs.slice(0, 2).map(glyph => attr(glyph, 'data-denominator'))).toEqual(['4', '4']);
    expect(html.match(/class="notation-tie"/g)).toHaveLength(1);
    expect(html).toContain('data-tie-group="t1" data-source-notation-ids="a b"');
    expect(glyphs[3]).toContain('data-pitch="E5"');
    expect(textContent(html)).toContain('다시 누르지 않고 계속 유지해요');
    expect(html.match(/class="notehead"/g)).toHaveLength(3);
  });

  it('L03 retains the real two bars, the cross-bar quarter-to-half tie, and independent E5', () => {
    const html = renderNotation(level('L03'));
    const glyphs = events(html);
    expect(glyphs).toHaveLength(6);
    expect(glyphs[2]).toContain('data-denominator="4"');
    expect(glyphs[3]).toContain('data-denominator="2"');
    expect(glyphs[2]).toContain('data-bar-index="0"');
    expect(glyphs[3]).toContain('data-bar-index="1"');
    expect(html).toContain('data-tie-group="t2" data-source-notation-ids="c d"');
    expect(html.match(/class="notation-barline"/g)).toHaveLength(3);
    expect(glyphs[5]).toContain('data-pitch="E5"');
    expect(textContent(html)).toContain('2마디');
    expect(LESSONS.L03!.resultHint).toContain('부분 발췌');
  });

  it('quarter and half use distinct glyphs and exactly 1:2 horizontal duration widths', () => {
    const html = renderNotation(level('L01'));
    expect(events(html).map(glyph => Number(attr(glyph, 'data-duration-width')))).toEqual([120, 120, 240]);
    expect(html).toContain('fill="var(--notation-paper, #F3E8C9)"');
    expect(html.match(/class="note-stem"/g)).toHaveLength(2);
    expect(html).not.toContain('class="note-flag"');
  });

  it('L04 has two dotted quarter glyphs, eighth rests, and proportional 3:1 time widths', () => {
    const html = renderNotation(level('L04'));
    expect(events(html).map(glyph => [attr(glyph, 'data-kind'), attr(glyph, 'data-denominator'), attr(glyph, 'data-dots')]))
      .toEqual([['note', '4', '1'], ['rest', '8', '0'], ['note', '4', '1'], ['rest', '8', '0']]);
    expect(events(html).map(glyph => Number(attr(glyph, 'data-duration-width')))).toEqual([180, 60, 180, 60]);
    expect(html.match(/class="augmentation-dot"/g)).toHaveLength(2);
    expect(html.match(/class="rest-glyph rest-8"/g)).toHaveLength(2);
  });

  it('L05 represents two dotted quarter rests as rests while retaining the dotted G5 hold', () => {
    const html = renderNotation(level('L05'));
    const glyphs = events(html);
    expect([glyphs[0], glyphs[5]].map(glyph => [attr(glyph!, 'data-kind'), attr(glyph!, 'data-denominator'), attr(glyph!, 'data-dots')]))
      .toEqual([['rest', '4', '1'], ['rest', '4', '1']]);
    expect(glyphs[4]).toContain('data-pitch="G5"');
    expect(html.match(/class="augmentation-dot"/g)).toHaveLength(3);
    expect(textContent(html)).toContain('박과 반주는 계속될 수 있어요');
  });

  it('L06/L07 preserve the same six equal-spaced eighths and change only 2+2+2 versus 3+3 grouping', () => {
    const triple = renderNotation(level('L06'));
    const duple = renderNotation(level('L07'));
    const positions = (html: string) => events(html).map(glyph => Number(attr(glyph, 'data-x')));
    expect(positions(triple)).toEqual([86, 166, 246, 326, 406, 486]);
    expect(positions(duple)).toEqual(positions(triple));
    expect(events(triple).map(glyph => attr(glyph, 'data-duration-width'))).toEqual(Array(6).fill('80'));
    const groups = (html: string) => [...html.matchAll(/<g class="notation-group"[^>]*>/g)].map(match => Number(attr(match[0], 'data-eighth-count')));
    expect(groups(triple)).toEqual([2, 2, 2]);
    expect(groups(duple)).toEqual([3, 3]);
    expect(triple.match(/class="notation-beam"/g)).toHaveLength(3);
    expect(duple.match(/class="notation-beam"/g)).toHaveLength(2);
    expect(textContent(triple)).toContain('4분음표=90');
    expect(textContent(duple)).toContain('점4분음표=60');
  });

  it('does not beam alternating notes across rests', () => {
    const html = renderNotation(level('L08'));
    expect(html).not.toContain('class="notation-beam"');
    expect(html.match(/class="note-flag"/g)).toHaveLength(4);
  });

  it('activeTick uses the original source interval and does not create an extra tie attack', () => {
    const atStart = renderNotation(level('L02'), 0);
    const atBoundary = renderNotation(level('L02'), 480);
    const active = (html: string) => events(html).filter(glyph => glyph.includes(' is-active'));
    expect(active(atStart).map(glyph => attr(glyph, 'data-source-notation-id'))).toEqual(['a']);
    expect(active(atBoundary).map(glyph => attr(glyph, 'data-source-notation-id'))).toEqual(['b']);
    expect(atBoundary.match(/class="notation-tie"/g)).toHaveLength(1);
    expect(events(atBoundary)).toHaveLength(events(atStart).length);
  });

  it('escapes source content before insertion into HTML attributes and DOM prose', () => {
    const source = level('L01');
    source.title = '<img src=x onerror=alert(1)>';
    source.bars[0]!.events[0]!.id = '" onclick="alert(1)';
    const html = renderNotation(source);
    expect(html).not.toContain('<img');
    expect(html).not.toContain(' onclick="');
    expect(html).toContain('&lt;img');
    expect(html).toContain('&quot; onclick=&quot;');
  });
});

describe('fixed Korean MVP lesson copy', () => {
  it('covers exactly nine supplied levels with canonical scenes and six base education assets', () => {
    expect(Object.keys(LESSONS).sort()).toEqual(['L01', 'L02', 'L03', 'L04', 'L05', 'L06', 'L07', 'L08', 'L09']);
    expect([...new Set(Object.values(LESSONS).map(lesson => lesson.sceneName))].sort())
      .toEqual(['구름 우체역', '반달 온실', '실빛다리', '접히는 방']);
    expect([...new Set(Object.values(LESSONS).map(lesson => lesson.educationAssetId))].sort())
      .toEqual(['education_dot', 'education_dotted_rest', 'education_duration', 'education_meter', 'education_tempo', 'education_tie']);
    for (const lesson of Object.values(LESSONS)) {
      expect(lesson.nextExercise.length).toBeGreaterThan(15);
      expect(lesson.quiz.options.length).toBeGreaterThanOrEqual(2);
      expect(lesson.quiz.options[lesson.quiz.answer]).toBeTruthy();
      expect(lesson.quiz.explanation.length).toBeGreaterThan(15);
      expect(Object.values(lesson).filter(value => typeof value === 'string').join(' ')).not.toMatch(/tick|틱/i);
    }
  });

  it('preserves the musical transfer answers independently from rhythm scores', () => {
    const answer = (id: string) => LESSONS[id]!.quiz.options[LESSONS[id]!.quiz.answer];
    expect(answer('L02')).toBe('붙임줄로 이은 두 음표');
    expect(answer('L04')).toBe('4분음표 길이');
    expect(answer('L05')).toBe('내가 맡은 꽃의 소리');
    expect(answer('L06')).toBe('둘씩 세 묶음');
    expect(answer('L07')).toBe('셋씩 두 묶음');
    expect(answer('L09')).toBe('2/3');
    expect(LESSONS.L06!.resultHint).toContain('별개');
    expect(LESSONS.L07!.resultHint).toContain('시각 도움');
    expect(EDUCATION_REVIEW_NOTICE).toContain('검수 대기');
  });
});

describe('four untimed meter concept questions', () => {
  it('uses the supplied 3/4, 6/8, 6/8, 3/4 sequence, with two-bar anonymous cues', () => {
    expect(METER_QUIZ.map(question => question.id)).toEqual(['Q1', 'Q2', 'Q3', 'Q4']);
    expect(METER_QUIZ.map(question => question.levelId)).toEqual(['L06', 'L07', 'L07', 'L06']);
    expect(METER_QUIZ.map(question => question.answer)).toEqual([0, 1, 1, 0]);
    expect(METER_QUIZ_REQUIRED_CORRECT).toBe(3);
    for (const question of METER_QUIZ) {
      const source = level(question.levelId);
      const cue = compileLevel(source, { repeats: question.repeats });
      expect(cue.durationTicks).toBe(2880);
      expect(cue.notes).toHaveLength(12);
      expect(question.question).not.toMatch(/3\/4|6\/8|90|60|초 이내|제한시간/);
      expect(question.options).toEqual(['둘씩 세 묶음', '셋씩 두 묶음']);
      expect(question.revealLabel).toContain(question.levelId === 'L06' ? '4분음표=90' : '점4분음표=60');
    }
  });

  it('reproduces a stored shuffle seed and preserves each cue, answer, explanation, and source ID together', () => {
    const first = createMeterQuiz(4211);
    expect(createMeterQuiz(4211)).toEqual(first);
    expect(first.map(question => question.id).sort()).toEqual(['Q1', 'Q2', 'Q3', 'Q4']);
    for (const question of first) expect(question).toEqual(METER_QUIZ.find(source => source.id === question.id));
    expect(createMeterQuiz()).toEqual(METER_QUIZ);
    first[0]!.options[0] = 'changed locally';
    expect(METER_QUIZ.every(question => question.options[0] === '둘씩 세 묶음')).toBe(true);
    expect(() => createMeterQuiz(Number.NaN)).toThrow(RangeError);
  });
});

describe('pure comparison playback data', () => {
  it('meter comparison keeps six equal-spaced pitches at the same speed and three versus two big beats', () => {
    const examples = comparisonPatterns(supplied, 'meter');
    expect(examples.map(example => example.label)).toEqual(['A', 'B']);
    expect(examples.map(example => example.level.id)).toEqual(['L06', 'L07']);
    expect(examples[0]!.level.bars).toEqual(examples[1]!.level.bars);
    const cues = examples.map(example => compileLevel(example.level, { repeats: example.repeats }));
    expect(cues.map(cue => cue.durationSec)).toEqual([4, 4]);
    expect(cues[0]!.notes.map(note => [note.startTick, note.midi])).toEqual(cues[1]!.notes.map(note => [note.startTick, note.midi]));
    expect(cues.map(cue => cue.beats.filter(beat => beat.major).length)).toEqual([6, 4]);
    expect(examples[0]!.revealLabel).toContain('4분음표=90');
    expect(examples[1]!.revealLabel).toContain('점4분음표=60');
  });

  it('tempo comparison plays the complete same note/rest pattern at explicit quarter=72/108 with 2/3 time', () => {
    const examples = comparisonPatterns(supplied, 'tempo');
    expect(examples.map(example => example.label)).toEqual(['A · 4분음표=72', 'B · 4분음표=108']);
    expect(examples[0]!.level.bars).toEqual(examples[1]!.level.bars);
    const cues = examples.map(example => compileLevel(example.level, { repeats: example.repeats }));
    expect(cues.map(cue => cue.notes.length)).toEqual([8, 8]);
    expect(cues[1]!.durationSec / cues[0]!.durationSec).toBeCloseTo(2 / 3, 14);
    expect(cues[0]!.notes.map(note => [note.startTick, note.endTick, note.midi])).toEqual(cues[1]!.notes.map(note => [note.startTick, note.endTick, note.midi]));
    expect(cues[0]!.rests.map(rest => [rest.startTick, rest.endTick])).toEqual(cues[1]!.rests.map(rest => [rest.startTick, rest.endTick]));
  });

  it('tie comparison marks its partial excerpt and has one versus two C5 sound starts per motif', () => {
    const before = JSON.stringify(supplied);
    const examples = comparisonPatterns(supplied, 'tie');
    expect(examples.map(example => example.excerpt)).toEqual([true, true]);
    expect(examples.every(example => example.level.title.includes('부분 발췌'))).toBe(true);
    for (const example of examples) expect(validateLevel(example.level).valid).toBe(true);
    const cues = examples.map(example => compileLevel(example.level));
    expect(cues.map(cue => cue.notes.length)).toEqual([1, 2]);
    expect(cues[0]!.notes[0]!.sourceNotationIds).toEqual(['a', 'b']);
    expect(cues[0]!.notes[0]!.startTick).toBe(0);
    expect(cues[0]!.notes[0]!.endTick).toBe(960);
    expect(cues[1]!.notes.map(note => [note.startTick, note.endTick, note.midi])).toEqual([[0, 480, 72], [480, 960, 72]]);
    expect(examples.every(example => example.notScored && example.repeats === 2)).toBe(true);
    expect(JSON.stringify(supplied)).toBe(before);
  });

  it('does not mutate source data and rejects a mismatched pair instead of presenting a false comparison', () => {
    const before = JSON.stringify(supplied);
    const returned = comparisonPatterns(supplied, 'tempo');
    returned[0]!.level.bars[0]!.events[0]!.ticks = 99;
    expect(JSON.stringify(supplied)).toBe(before);
    const changed = structuredClone(supplied);
    changed.find(source => source.id === 'L07')!.bars[0]!.events[0]!.ticks = 99;
    expect(() => comparisonPatterns(changed, 'meter')).toThrow('같은 여섯');
    expect(() => comparisonPatterns([], 'tempo')).toThrow('원본 레벨');
  });
});
