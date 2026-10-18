import type { JudgeSnapshot, Level } from './types';
export interface MasteryResult { conceptCondition: boolean; standardEligible: boolean; stars: number; tieMastery: boolean | null; dotMastery: boolean | null; restMastery: boolean | null; meterMastery: boolean | null }
/** Rhythm score, physical hold skill, rest skill and non-timed concepts remain distinct. */
export function evaluateMastery(level: Level, snapshot: JudgeSnapshot, assisted: boolean, meterCorrect: number | null = null): MasteryResult {
  const m = snapshot.metrics;
  const ties = level.skillIds.some(s => s === 'tie' || s === 'cross-bar-tie');
  const dot = level.id === 'L04'; const rest = level.id === 'L05'; const meter = level.id === 'L06' || level.id === 'L07';
  const tieMastery = ties ? !assisted && m.tieContinuousRatio !== null && m.tieContinuousRatio >= .75 : null;
  const dotMastery = dot ? !assisted && m.releaseInWindowRatio !== null && m.releaseInWindowRatio >= .75 : null;
  const restMastery = rest ? !assisted && m.restCleanRatio !== null && m.restCleanRatio >= .75 && m.reentryRatio !== null && m.reentryRatio >= .75 : null;
  const meterMastery = meter ? meterCorrect !== null && meterCorrect >= 3 : null;
  const conceptCondition = ties ? tieMastery === true : dot ? dotMastery === true : rest ? restMastery === true : meter ? meterMastery === true : true;
  const stars = snapshot.finished ? 1 + Number(!assisted && snapshot.score >= 80) + Number(!assisted && snapshot.score >= 90 && conceptCondition) : 0;
  return { conceptCondition, standardEligible: !assisted, stars, tieMastery, dotMastery, restMastery, meterMastery };
}
export function focusedPracticeBars(level: Level, failedSourceIds: string[]): number[] {
  const chosen = new Set<number>(); const tieGroups = new Set<string>();
  level.bars.forEach((bar, bi) => bar.events.forEach(e => {
    if (failedSourceIds.includes(e.id)) { chosen.add(bi); if (e.kind === 'note' && e.tieGroup) tieGroups.add(e.tieGroup); }
  }));
  level.bars.forEach((bar, bi) => bar.events.forEach(e => { if (e.kind === 'note' && e.tieGroup && tieGroups.has(e.tieGroup)) chosen.add(bi); }));
  if (!chosen.size) return level.bars.map((_, i) => i);
  const min = Math.min(...chosen); const max = Math.max(...chosen);
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}
