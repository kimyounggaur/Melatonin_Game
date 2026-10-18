import type { Metrics } from './types';
export const PROGRESS_KEY = 'night-thread.progress.v1';
export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
export interface GameSettings { keyCode: 'Space' | 'KeyF' | 'KeyJ' | 'Enter'; highContrast: boolean; reducedMotion: boolean; toggleHold: boolean; wideWindows: boolean; practiceSpeed: .75 | 1; guide: boolean; showCounts: boolean; visualOffsetMs: number; volume: number; clickVolume: number; guideVolume: number; bgmVolume: number; sfxVolume: number; vibration: boolean }
export interface Attempt { id: string; sessionId: string; levelId: string; score: number; assisted: boolean; valid: boolean; completed: boolean; metrics?: Metrics; sessionChain?: string[]; contentVersion?: string; assists?: string[]; createdAt?: string }
export interface LevelProgress { completed: boolean; bestStandard: number | null; bestAssisted: number | null }
export interface Progress { schemaVersion: 1; contentVersion: string; settings: GameSettings; calibration: { inputOffsetMs: number; revision: number }; levels: Record<string, LevelProgress>; recentAttempts: Attempt[]; bestScoreEvidence: Record<string, { standard: string | null; assisted: string | null }>; lastLessonId: string | null; legacy?: unknown[] }
export const DEFAULT_SETTINGS: GameSettings = { keyCode: 'Space', highContrast: false, reducedMotion: false, toggleHold: false, wideWindows: false, practiceSpeed: .75, guide: false, showCounts: false, visualOffsetMs: 0, volume: .45, clickVolume: .7, guideVolume: .8, bgmVolume: .45, sfxVolume: .6, vibration: false };
export function initialProgress(contentVersion = '1.0.0'): Progress { return { schemaVersion: 1, contentVersion, settings: { ...DEFAULT_SETTINGS }, calibration: { inputOffsetMs: 0, revision: 0 }, levels: {}, recentAttempts: [], bestScoreEvidence: {}, lastLessonId: null }; }
const isRecord = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
function validAttempt(v: unknown): v is Attempt {
  if (!isRecord(v)) return false;
  return typeof v.id === 'string' && typeof v.sessionId === 'string' && typeof v.levelId === 'string' && /^L0[1-9]$/.test(v.levelId) && typeof v.score === 'number' && Number.isFinite(v.score) && v.score >= 0 && v.score <= 100 && typeof v.assisted === 'boolean' && typeof v.valid === 'boolean' && typeof v.completed === 'boolean';
}
export function validateProgress(v: unknown): v is Progress {
  if (!isRecord(v) || v.schemaVersion !== 1 || typeof v.contentVersion !== 'string' || !isRecord(v.settings) || !isRecord(v.calibration) || !isRecord(v.levels) || !isRecord(v.bestScoreEvidence) || !Array.isArray(v.recentAttempts) || !v.recentAttempts.every(validAttempt)) return false;
  const s = v.settings;
  if (!['Space', 'KeyF', 'KeyJ', 'Enter'].includes(String(s.keyCode)) || ![.75, 1].includes(Number(s.practiceSpeed))) return false;
  if (['highContrast', 'reducedMotion', 'toggleHold', 'wideWindows', 'guide', 'showCounts'].some(k => typeof s[k] !== 'boolean')) return false;
  if (typeof s.visualOffsetMs !== 'number' || !Number.isFinite(s.visualOffsetMs) || typeof s.volume !== 'number' || s.volume < 0 || s.volume > 1) return false;
  const c = v.calibration;
  return typeof c.inputOffsetMs === 'number' && Number.isFinite(c.inputOffsetMs) && Math.abs(c.inputOffsetMs) <= 250 && Number.isInteger(c.revision) && (c.revision as number) >= 0 && (v.lastLessonId === null || typeof v.lastLessonId === 'string');
}
/** Local-only reversible ledger. Never reads or clears another application's keys. */
export class ProgressStore {
  state: Progress;
  warning: string | null = null;
  private storage: StorageLike;
  private contentVersion: string;
  constructor(storage: StorageLike, contentVersion = '1.0.0') { this.storage = storage; this.contentVersion = contentVersion; this.state = initialProgress(contentVersion); }
  load(): Progress {
    let raw: string | null = null;
    try {
      raw = this.storage.getItem(PROGRESS_KEY); if (raw === null) return this.state;
      const parsed: unknown = JSON.parse(raw);
      if (!validateProgress(parsed)) throw new Error('INVALID_PROGRESS');
      if (parsed.contentVersion !== this.contentVersion) {
        this.state = initialProgress(this.contentVersion); this.state.settings = { ...parsed.settings }; this.state.calibration = { ...parsed.calibration };
        this.state.legacy = [...(parsed.legacy ?? []), parsed]; this.warning = '콘텐츠가 바뀌어 이전 기록을 별도로 보관했어요.';
      } else this.state = structuredClone(parsed);
      this.recompute();
    } catch {
      if (raw !== null) { try { this.storage.setItem(`${PROGRESS_KEY}.backup`, raw); } catch { /* Current play remains available if backup also fails. */ } }
      this.state = initialProgress(this.contentVersion); this.warning = '저장 기록을 읽지 못했어요. 이번 게임은 계속할 수 있어요.';
    }
    return this.state;
  }
  read(): Progress { return this.state; }
  save(): boolean {
    const copy = structuredClone(this.state);
    if (!validateProgress(copy)) { this.warning = '기록 검증에 실패했어요. 결과는 이 화면에 유지돼요.'; return false; }
    try { this.storage.setItem(PROGRESS_KEY, JSON.stringify(copy)); return true; }
    catch { this.warning = '이 브라우저에 저장하지 못했어요. 이번 게임은 계속할 수 있어요.'; return false; }
  }
  recordAttempt(attempt: Attempt): boolean {
    if (!validAttempt(attempt)) { this.warning = '시도 기록 형식이 올바르지 않아요.'; return false; }
    if (this.state.recentAttempts.some(a => a.id === attempt.id)) return true;
    this.state.recentAttempts.push({ ...structuredClone(attempt), contentVersion: attempt.contentVersion ?? this.contentVersion });
    this.state.lastLessonId = attempt.levelId; this.recompute(); return this.save();
  }
  record(attempt: Attempt): boolean { return this.recordAttempt(attempt); }
  revokeAttempt(id: string): boolean {
    for (const attempt of this.state.recentAttempts) if (attempt.id === id || attempt.sessionId === id || attempt.sessionChain?.includes(id)) attempt.valid = false;
    this.recompute(); return this.save();
  }
  revoke(id: string): boolean { return this.revokeAttempt(id); }
  private recompute(): void {
    this.state.levels = {}; this.state.bestScoreEvidence = {};
    for (const attempt of this.state.recentAttempts) {
      if (!attempt.valid || attempt.contentVersion && attempt.contentVersion !== this.contentVersion) continue;
      const progress = this.state.levels[attempt.levelId] ?? { completed: false, bestStandard: null, bestAssisted: null };
      const evidence = this.state.bestScoreEvidence[attempt.levelId] ?? { standard: null, assisted: null };
      if (attempt.completed) {
        progress.completed = true;
        const key = attempt.assisted ? 'bestAssisted' : 'bestStandard'; const mode = attempt.assisted ? 'assisted' : 'standard';
        if (progress[key] === null || attempt.score > progress[key]!) { progress[key] = attempt.score; evidence[mode] = attempt.id; }
      }
      this.state.levels[attempt.levelId] = progress; this.state.bestScoreEvidence[attempt.levelId] = evidence;
    }
  }
  updateSettings(patch: Partial<GameSettings>): boolean { this.state.settings = { ...this.state.settings, ...patch }; return this.save(); }
  setCalibration(inputOffsetMs: number): boolean {
    if (!Number.isFinite(inputOffsetMs) || Math.abs(inputOffsetMs) > 250) return false;
    this.state.calibration = { inputOffsetMs, revision: this.state.calibration.revision + 1 }; return this.save();
  }
  /** Call only after the UI's explicit reset confirmation. */
  reset(): boolean { this.state = initialProgress(this.contentVersion); try { this.storage.removeItem(PROGRESS_KEY); return true; } catch { this.warning = '저장 초기화를 완료하지 못했어요.'; return false; } }
}
