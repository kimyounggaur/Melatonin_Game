import type { Level, NoteEvent } from './core';

export type ComparisonKind = 'meter' | 'tempo' | 'tie';

export interface ComparisonPattern {
  id: string;
  label: string;
  revealLabel: string;
  description: string;
  level: Level;
  /** Two motif repetitions; for meter examples this is exactly two bars. */
  repeats: 2;
  /** Comparisons are demonstrations and cannot establish play/hold mastery. */
  notScored: true;
  excerpt: boolean;
}

function sourceLevel(levels: readonly Level[], id: string): Level {
  const source = levels.find(level => level.id === id);
  if (!source) throw new Error(`비교 수업에 필요한 원본 레벨이 없습니다: ${id}`);
  return structuredClone(source);
}

/** Pure comparison data; the existing AudioEngine owns playback and its clock. */
export function comparisonPatterns(levels: readonly Level[], kind: ComparisonKind): ComparisonPattern[] {
  if (kind === 'meter') {
    const a = sourceLevel(levels, 'L06');
    const b = sourceLevel(levels, 'L07');
    if (JSON.stringify(a.bars) !== JSON.stringify(b.bars) || a.quarterBpm !== b.quarterBpm) {
      throw new Error('박자 비교는 같은 여섯 8분음표와 같은 4분음표 기준 빠르기가 필요합니다.');
    }
    return [
      { id: 'meter-A', label: 'A', revealLabel: '3/4 · 둘씩 세 묶음 · 4분음표=90', description: '같은 여섯 8분음표를 둘씩 세 묶음으로 느껴요. 작은 음의 간격은 B와 같아요.', level: a, repeats: 2, notScored: true, excerpt: false },
      { id: 'meter-B', label: 'B', revealLabel: '6/8 · 셋씩 두 묶음 · 점4분음표=60', description: '같은 여섯 8분음표를 셋씩 두 묶음으로 느껴요. 이 수업에서는 큰박 둘로 느껴 봐요.', level: b, repeats: 2, notScored: true, excerpt: false },
    ];
  }

  if (kind === 'tempo') {
    const a = sourceLevel(levels, 'L08');
    const b = sourceLevel(levels, 'L09');
    if (JSON.stringify(a.bars) !== JSON.stringify(b.bars) || JSON.stringify(a.meter) !== JSON.stringify(b.meter)) {
      throw new Error('빠르기 비교는 같은 음표·쉼표·순서와 같은 박자표가 필요합니다.');
    }
    return [
      { id: 'tempo-A', label: 'A · 4분음표=72', revealLabel: '같은 한 마디 · 약 3.33초', description: '같은 편지 패턴이에요. 기준 음표는 4분음표이며, 음과 쉼의 비율은 B와 같아요.', level: a, repeats: 2, notScored: true, excerpt: false },
      { id: 'tempo-B', label: 'B · 4분음표=108', revealLabel: '같은 한 마디 · 약 2.22초', description: '같은 패턴이 1.5배 빠르게 흘러가요. 한 마디에 걸리는 시간은 A의 2/3이에요.', level: b, repeats: 2, notScored: true, excerpt: false },
    ];
  }

  // The original C5 quarter pair is preserved. The later E5 is intentionally not
  // part of the tie example; an explicit half rest fills the comparison bar.
  const tied = sourceLevel(levels, 'L02');
  const pair = tied.bars[0]?.events.slice(0, 2);
  if (!pair || pair.length !== 2 || pair.some(event => event.kind !== 'note' || event.pitchName !== 'C5' || event.notation.denominator !== 4)) {
    throw new Error('붙임줄 비교에 필요한 원본 C5 4분음표 두 개가 없습니다.');
  }
  tied.title = '붙임줄 비교 · C5 두 음의 부분 발췌';
  tied.bars = [{ events: [...pair, { id: 'comparison-rest', at: 960, ticks: 960, kind: 'rest', notation: { denominator: 2, dots: 0 } }] }];
  const separate = structuredClone(tied);
  separate.title = '붙임줄 없는 두 음 · C5 두 음의 부분 발췌';
  separate.bars[0]!.events.slice(0, 2).forEach(event => { delete (event as NoteEvent).tieGroup; });
  return [
    { id: 'tie-A', label: 'A · 붙임줄로 이은 두 음', revealLabel: '소리 시작 한 번 · 두 음의 길이를 합해 유지', description: '같은 C5 4분음표 둘의 부분 발췌예요. 중간에 새 소리가 나지 않아요. 뒤의 쉼은 비교를 위해 덧붙였어요.', level: tied, repeats: 2, notScored: true, excerpt: true },
    { id: 'tie-B', label: 'B · 붙임줄 없는 두 음', revealLabel: '소리 시작 두 번 · 각각 새로 시작', description: '같은 높이와 길이의 음을 각각 시작해요. 두 음을 부드럽게 잇는 이음줄과 동음의 길이를 더하는 붙임줄은 달라요.', level: separate, repeats: 2, notScored: true, excerpt: true },
  ];
}
