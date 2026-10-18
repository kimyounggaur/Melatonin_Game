import rawLevels from './levels.json';
import type { Level } from '../core/types';
import { assertLevel } from '../core/validation';
export const levels: Level[] = rawLevels.map(value => { assertLevel(value); return value; });
export const campaignOrder = ['L01', 'L02', 'L03', 'L04', 'L06', 'L07', 'L05', 'L08', 'L09'];
export const campaign = campaignOrder.map((id, index) => ({ id, recommendedPrevious: campaignOrder[index - 1] ?? null, locked: false }));
export function getLevel(id: string): Level { const level = levels.find(l => l.id === id); if (!level) throw new Error(`UNKNOWN_LEVEL ${id}`); return level; }
