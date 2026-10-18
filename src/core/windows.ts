import type { Grade, WindowSet } from './types';

/** Compare magnitude once in integer microseconds. Preserve error sign separately. D19. */
export function makeWindows(kind: 'onset' | 'release', capMs = Infinity, wide = false): WindowSet {
  const base = kind === 'onset' ? [45, 90, 140] : [60, 110, 160];
  const maximum = base[2]!;
  const lateMs = Math.min(maximum * (wide ? 1.35 : 1), capMs);
  const perfectMs = base[0]! / maximum * lateMs;
  const goodMs = base[1]! / maximum * lateMs;
  return { perfectMs, goodMs, lateMs, perfectUs: Math.round(perfectMs * 1000), goodUs: Math.round(goodMs * 1000), lateUs: Math.round(lateMs * 1000) };
}
export function gradeError(errorMs: number, window: WindowSet): { grade: Grade; points: number; magnitudeUs: number; direction: 'early' | 'late' | 'exact' } {
  const magnitudeUs = Math.round(Math.abs(errorMs) * 1000);
  const direction = errorMs < 0 ? 'early' : errorMs > 0 ? 'late' : 'exact';
  if (magnitudeUs <= window.perfectUs) return { grade: 'perfect', points: 1, magnitudeUs, direction };
  if (magnitudeUs <= window.goodUs) return { grade: 'good', points: .75, magnitudeUs, direction };
  if (magnitudeUs <= window.lateUs) return { grade: 'near', points: .4, magnitudeUs, direction };
  return { grade: 'miss', points: 0, magnitudeUs, direction };
}
export function scoreAttempt(earned: number, extra: number, expectationCount: number): number {
  if (!Number.isFinite(expectationCount) || expectationCount <= 0) throw new Error('EMPTY_SCORED_CHART');
  return Math.round(100 * Math.min(1, Math.max(0, (earned - .25 * Math.min(extra, expectationCount)) / expectationCount)));
}
export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b); const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}
