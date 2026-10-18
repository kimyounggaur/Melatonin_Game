/** Web Audio owns musical time. Drawing and judging only read its clock. */
export const AUDIO_TIMING = Object.freeze({ schedulerMs: 25, lookaheadSec: .150, attackSec: .005, releaseSec: .008, safeStartSec: .003, maximumVoices: 8 });
export type ClockMethod = 'output-timestamp' | 'latency-fallback';
export type AudioBus = 'guide' | 'player' | 'metronome' | 'bgm' | 'sfx';
/** UI levels are multipliers below these mix headrooms, never raw gain values. */
export const AUDIO_BUS_HEADROOM: Readonly<Record<AudioBus, number>> = Object.freeze({ guide: .30, player: .65, metronome: .22, bgm: .10, sfx: .16 });
export const AUDIO_BUS_DEFAULT_VOLUME: Readonly<Record<AudioBus, number>> = Object.freeze({ guide: .80, player: 1, metronome: .70, bgm: .45, sfx: .60 });
type ClockContext = Pick<AudioContext, 'currentTime' | 'baseLatency'> & { outputLatency?: number; getOutputTimestamp?: () => AudioTimestamp };
export class AudioTimingError extends Error {
  constructor(public readonly reason: string) { super(reason); this.name = 'AudioTimingError'; }
}
const nonnegative = (n: number | undefined) => Number.isFinite(n) && (n ?? 0) >= 0 ? n ?? 0 : 0;
export function normalizeEventTimestamp(timestamp: number, nowPerfMs: number, timeOrigin: number): number {
  const normalized = timestamp > 1e12 ? timestamp - timeOrigin : timestamp;
  if (!Number.isFinite(normalized) || Math.abs(normalized - nowPerfMs) > 5000) throw new AudioTimingError('invalid-input-timestamp');
  return normalized;
}
export class AudioClock {
  method: ClockMethod = 'latency-fallback';
  inputOffsetMs = 0;
  private anchor: { contextSec: number; perfMs: number };
  private previous: { contextSec: number; perfMs: number } | null = null;
  constructor(private readonly context: ClockContext, private readonly perfNow: () => number = () => performance.now()) {
    this.anchor = { contextSec: context.currentTime, perfMs: perfNow() };
  }
  reset(anchor?: { contextSec?: number; perfMs?: number }): void {
    this.anchor = { contextSec: anchor?.contextSec ?? this.context.currentTime, perfMs: anchor?.perfMs ?? this.perfNow() };
    this.previous = null;
  }
  audibleAt(perfMs: number): number {
    let stamp: AudioTimestamp | undefined;
    try { stamp = this.context.getOutputTimestamp?.(); } catch { /* unsupported output path */ }
    const c = stamp?.contextTime ?? 0, p = stamp?.performanceTime ?? 0;
    const deltaMismatch = this.previous ? Math.abs(c - this.previous.contextSec - (p - this.previous.perfMs) / 1000) : 0;
    const valid = Number.isFinite(c) && Number.isFinite(p) && c > 0 && p > 0 && c <= this.context.currentTime + .1
      && Math.abs(this.perfNow() - p) <= 5000 && (!this.previous || (c >= this.previous.contextSec && p >= this.previous.perfMs && deltaMismatch <= .1));
    if (valid) {
      this.method = 'output-timestamp';
      this.previous = { contextSec: c, perfMs: p };
      return c + (perfMs - p) / 1000;
    }
    this.method = 'latency-fallback';
    return this.anchor.contextSec + (perfMs - this.anchor.perfMs) / 1000 - nonnegative(this.context.baseLatency) - nonnegative(this.context.outputLatency);
  }
  now(): number { return this.audibleAt(this.perfNow()); }
  inputAt(perfMs: number): number { return this.audibleAt(perfMs) - this.inputOffsetMs / 1000; }
  errorMs(perfMs: number, targetSec: number): number { return (this.audibleAt(perfMs) - targetSec) * 1000 - this.inputOffsetMs; }
}

export interface ScheduledAudioEvent { id: string; atSec: number; run: () => void }
/** Callbacks are delivered only in the fixed horizon; overdue notes are never burst-replayed. */
export class LookaheadScheduler {
  private events: ScheduledAudioEvent[] = [];
  private lastSec: number | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  constructor(private readonly currentTime: () => number, private readonly onInterrupted: (reason: string) => void) {}
  get pendingCount(): number { return this.events.length; }
  enqueue(event: ScheduledAudioEvent): void {
    if (!Number.isFinite(event.atSec)) throw new AudioTimingError('invalid-schedule-time');
    this.events.push(event);
    this.events.sort((a, b) => a.atSec - b.atSec || a.id.localeCompare(b.id));
  }
  cancel(id: string): void { this.events = this.events.filter(e => e.id !== id); }
  start(): void {
    this.stop(false);
    this.lastSec = this.currentTime();
    this.timer = setInterval(() => this.pump(), AUDIO_TIMING.schedulerMs);
    this.pump();
  }
  pump(): void {
    const now = this.currentTime();
    if (this.lastSec !== null && now - this.lastSec > .100 && this.events.some(e => e.atSec < now - .003)) {
      this.stop();
      this.onInterrupted('scheduler-gap');
      return;
    }
    this.lastSec = now;
    const horizon = now + AUDIO_TIMING.lookaheadSec;
    while (this.events[0] && this.events[0].atSec <= horizon) this.events.shift()!.run();
  }
  stop(clear = true): void {
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
    this.lastSec = null;
    if (clear) this.events = [];
  }
}

export interface NoteRequest {
  id: string; midi: number; startSec: number; endSec: number;
  kind?: 'demo' | 'tap' | 'hold'; bus?: AudioBus; gain?: number;
}
export interface LiveNoteRequest { id: string; midi: number; targetEndSec: number; kind: 'tap' | 'hold'; releaseWindowMs?: number; gain?: number }
export interface NoteHandle { readonly id: string; readonly startSec: number; readonly endSec: number; stop: (atSec?: number) => void }
export interface AudioDiagnostic { event: string; id?: string; contextSec: number; perfMs: number; details?: string }
interface Voice { id: string; nodes: AudioNode[]; sources: OscillatorNode[]; gain: GainNode; start: number; end: number; attack: number; level: number; releaseStart: number; released: boolean; bus: AudioBus }
export interface AudioEngineOptions { contextFactory?: () => AudioContext; perfNow?: () => number; timeOrigin?: number; onInterrupted?: (reason: string) => void }
export class AudioEngine {
  clock: AudioClock | null = null;
  scheduler: LookaheadScheduler | null = null;
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private buses: Partial<Record<AudioBus, GainNode>> = {};
  private busVolumes: Record<AudioBus, number> = { ...AUDIO_BUS_DEFAULT_VOLUME };
  private voices = new Map<string, Voice>();
  private handles = new Map<string, NoteHandle>();
  private cleanupTimers = new Set<ReturnType<typeof setTimeout>>();
  private diagnostics: AudioDiagnostic[] = [];
  private active = false;
  private volume = .35;
  private muted = false;
  private sequence = 0;
  private inputOffsetMs = 0;
  private readonly perfNow: () => number;
  private readonly stateChange = () => { if (this.active && this.context?.state !== 'running') this.interrupt('audio-not-running'); };
  private readonly sinkChange = () => { if (this.active) this.interrupt('audio-route-change'); };
  constructor(private readonly options: AudioEngineOptions = {}) { this.perfNow = options.perfNow ?? (() => performance.now()); }
  get running(): boolean { return this.context?.state === 'running'; }
  get playing(): boolean { return this.active; }
  get mappingMethod(): ClockMethod { return this.clock?.method ?? 'latency-fallback'; }
  get voiceCount(): number { return this.voices.size; }
  get pendingCount(): number { return this.scheduler?.pendingCount ?? 0; }
  getDiagnostics(): readonly AudioDiagnostic[] { this.pruneDiagnostics(); return this.diagnostics.map(d => ({ ...d })); }
  private record(event: string, id?: string, details?: string): void {
    this.diagnostics.push({ event, id, contextSec: this.contextTime(), perfMs: this.perfNow(), details });
    this.pruneDiagnostics();
  }
  private pruneDiagnostics(): void { const since = this.perfNow() - 300000; this.diagnostics = this.diagnostics.filter(d => d.perfMs >= since).slice(-4096); }
  async unlock(): Promise<boolean> {
    try {
      if (!this.context || this.context.state === 'closed') {
        const factory = this.options.contextFactory ?? (() => {
          const Constructor = globalThis.AudioContext ?? (globalThis as typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (!Constructor) throw new AudioTimingError('web-audio-unavailable');
          return new Constructor({ latencyHint: 'interactive' });
        });
        this.context = factory();
        this.master = this.context.createGain();
        this.master.gain.value = this.muted ? 0 : this.volume;
        this.master.connect(this.context.destination);
        for (const bus of Object.keys(AUDIO_BUS_HEADROOM) as AudioBus[]) {
          const node = this.context.createGain(); node.gain.value = AUDIO_BUS_HEADROOM[bus] * this.busVolumes[bus]; node.connect(this.master); this.buses[bus] = node;
        }
        this.clock = new AudioClock(this.context, this.perfNow);
        this.clock.inputOffsetMs = this.inputOffsetMs;
        this.scheduler = new LookaheadScheduler(() => this.contextTime(), reason => this.interrupt(reason));
        this.context.addEventListener('statechange', this.stateChange);
        this.context.addEventListener('sinkchange', this.sinkChange);
        if (typeof navigator !== 'undefined') navigator.mediaDevices?.addEventListener('devicechange', this.sinkChange);
      }
      await this.context.resume();
      if (this.context.state !== 'running') { this.record('unlock-failed'); return false; }
      this.clock?.reset();
      this.record('unlocked');
      return true;
    } catch (error) { this.record('unlock-failed', undefined, String(error)); return false; }
  }
  start(anchor?: { contextSec?: number; perfMs?: number }): void {
    if (!this.context || this.context.state !== 'running') throw new AudioTimingError('audio-not-running');
    this.clock?.reset(anchor);
    const t = this.contextTime();
    this.master?.gain.cancelScheduledValues(t);
    this.master?.gain.setValueAtTime(this.muted ? 0 : this.volume, t);
    this.active = true;
    this.scheduler?.start();
  }
  contextTime(): number { return this.context?.currentTime ?? 0; }
  now(): number { return this.clock?.now() ?? 0; }
  performanceToAudioTime(perfMs: number): number { if (!this.clock) throw new AudioTimingError('audio-not-unlocked'); return this.clock.audibleAt(perfMs); }
  inputTime(perfMs: number): number { if (!this.clock) throw new AudioTimingError('audio-not-unlocked'); return this.clock.inputAt(perfMs); }
  eventTimeStampToPerf(timestamp: number): number {
    try { return normalizeEventTimestamp(timestamp, this.perfNow(), this.options.timeOrigin ?? performance.timeOrigin); }
    catch (error) { this.interrupt('invalid-input-timestamp'); throw error; }
  }
  setInputOffsetMs(ms: number): void {
    if (!Number.isFinite(ms) || Math.abs(ms) > 250) throw new AudioTimingError('invalid-input-offset');
    this.inputOffsetMs = ms;
    if (this.clock) this.clock.inputOffsetMs = ms;
  }
  setVolume(volume: number): void { this.volume = Math.max(0, Math.min(1, volume)); this.applyVolume(); }
  setMuted(muted: boolean): void { this.muted = muted; this.applyVolume(); }
  setBusVolume(bus: AudioBus, volume: number): void {
    if (!Number.isFinite(volume)) throw new AudioTimingError('invalid-bus-volume');
    this.busVolumes[bus] = Math.max(0, Math.min(1, volume));
    const node = this.buses[bus];
    if (!node) return;
    const at = this.contextTime();
    node.gain.cancelScheduledValues(at);
    node.gain.setValueAtTime(node.gain.value, at);
    node.gain.linearRampToValueAtTime(AUDIO_BUS_HEADROOM[bus] * this.busVolumes[bus], at + AUDIO_TIMING.releaseSec);
  }
  getBusVolume(bus: AudioBus): number { return this.busVolumes[bus]; }
  private applyVolume(): void {
    const t = this.contextTime();
    this.master?.gain.cancelScheduledValues(t);
    this.master?.gain.setValueAtTime(this.master.gain.value, t);
    this.master?.gain.linearRampToValueAtTime(this.muted ? 0 : this.volume, t + .008);
  }
  enqueue(event: ScheduledAudioEvent): void { if (!this.active) throw new AudioTimingError('transport-not-started'); this.scheduler?.enqueue(event); }
  scheduleNote(request: NoteRequest): NoteHandle | null {
    if (!this.active || !this.context || request.endSec <= request.startSec) return null;
    if (this.handles.has(request.id)) return this.handles.get(request.id)!;
    const handle: NoteHandle = { id: request.id, startSec: request.startSec, endSec: request.endSec, stop: at => this.release(request.id, at) };
    this.handles.set(request.id, handle);
    this.enqueue({ id: request.id, atSec: request.startSec, run: () => {
      const now = this.contextTime();
      if (request.startSec < now - .003) { this.interrupt('unscheduled-note'); return; }
      this.createVoice(request.id, request.midi, Math.max(request.startSec, now), request.endSec, request.bus ?? (request.kind === 'demo' ? 'guide' : 'player'), request.gain ?? .5);
    } });
    return handle;
  }
  liveNote(request: LiveNoteRequest): NoteHandle | null {
    if (!this.active || !this.context) return null;
    const start = this.contextTime() + AUDIO_TIMING.safeStartSec;
    const end = request.kind === 'hold' ? request.targetEndSec + (request.releaseWindowMs ?? 160) / 1000 : request.targetEndSec;
    if (end <= start) { this.record('late-note-suppressed', request.id, `targetEnd=${request.targetEndSec}`); return null; }
    const handle: NoteHandle = { id: request.id, startSec: start, endSec: end, stop: at => this.release(request.id, at) };
    this.handles.set(request.id, handle);
    this.createVoice(request.id, request.midi, start, end, 'player', request.gain ?? .5);
    this.record('live-note', request.id, `targetEnd=${request.targetEndSec};actualStart=${start}`);
    return handle;
  }
  private createVoice(id: string, midi: number, start: number, end: number, bus: AudioBus, level: number, wood = false): void {
    const context = this.context, destination = this.buses[bus];
    if (!context || !destination || end <= start) return;
    if (this.voices.has(id)) return;
    if (this.voices.size >= AUDIO_TIMING.maximumVoices) { this.record('voice-budget', id); this.handles.delete(id); return; }
    const duration = end - start, attack = Math.min(.005, duration * .4), release = Math.min(.008, duration - attack);
    const amp = context.createGain(), weak = context.createGain();
    const fundamental = context.createOscillator(), triangle = context.createOscillator();
    fundamental.type = 'sine'; triangle.type = 'triangle';
    const frequency = 440 * 2 ** ((midi - 69) / 12);
    fundamental.frequency.setValueAtTime(wood ? 190 : frequency, start);
    triangle.frequency.setValueAtTime(wood ? 340 : frequency, start);
    if (wood) { fundamental.frequency.exponentialRampToValueAtTime(80, end); triangle.frequency.exponentialRampToValueAtTime(130, end); }
    weak.gain.value = wood ? .12 : .075;
    fundamental.connect(amp); triangle.connect(weak); weak.connect(amp); amp.connect(destination);
    amp.gain.setValueAtTime(0, start);
    amp.gain.linearRampToValueAtTime(level, start + attack);
    amp.gain.setValueAtTime(level, end - release);
    amp.gain.linearRampToValueAtTime(0, end);
    const voice: Voice = { id, nodes: [fundamental, triangle, weak, amp], sources: [fundamental, triangle], gain: amp, start, end, attack, level, releaseStart: end - release, released: false, bus };
    this.voices.set(id, voice);
    fundamental.onended = () => this.disposeVoice(voice);
    fundamental.start(start); triangle.start(start);
    fundamental.stop(end); triangle.stop(end);
    this.record('attack', id, `start=${start};end=${end};bus=${bus}`);
  }
  pulse(atSec: number, accent = false, kind: 'beat' | 'subdivision' = 'beat'): void {
    const id = `pulse-${this.sequence++}`;
    this.enqueue({ id, atSec, run: () => {
      if (atSec < this.contextTime() - .003) { this.interrupt('unscheduled-pulse'); return; }
      this.createVoice(id, 48, Math.max(atSec, this.contextTime()), Math.max(atSec, this.contextTime()) + (accent ? .045 : .030), 'metronome', accent ? .55 : kind === 'subdivision' ? .16 : .31, true);
    } });
  }
  drone(startSec: number, endSec: number): NoteHandle | null { return this.scheduleNote({ id: `drone-${this.sequence++}`, midi: 48, startSec, endSec, bus: 'bgm', gain: .25 }); }
  release(id: string, atSec = this.contextTime()): void {
    const voice = this.voices.get(id);
    this.scheduler?.cancel(id);
    this.handles.delete(id);
    if (!voice || voice.released) return;
    const at = Math.max(this.contextTime(), atSec);
    if (at >= voice.end) return;
    const stopAt = Math.min(at + AUDIO_TIMING.releaseSec, voice.end);
    const elapsed = Math.max(0, at - voice.start);
    const level = at >= voice.releaseStart ? voice.level * Math.max(0, (voice.end - at) / (voice.end - voice.releaseStart)) : voice.level * Math.min(1, elapsed / voice.attack);
    voice.gain.gain.cancelScheduledValues(at);
    voice.gain.gain.setValueAtTime(level, at);
    voice.gain.gain.linearRampToValueAtTime(0, stopAt);
    for (const source of voice.sources) { try { source.stop(stopAt); } catch { /* node already ended */ } }
    voice.end = stopAt; voice.released = true;
    this.record('release', id, `at=${at};stop=${stopAt}`);
  }
  private disposeVoice(voice: Voice): void {
    for (const node of voice.nodes) { try { node.disconnect(); } catch { /* disconnect is idempotent */ } }
    voice.sources[0]!.onended = null;
    if (this.voices.get(voice.id) === voice) { this.voices.delete(voice.id); this.handles.delete(voice.id); }
  }
  private interrupt(reason: string): void { if (!this.active) return; this.record('interrupted', undefined, reason); this.stop(); this.options.onInterrupted?.(reason); }
  stop(): void {
    this.active = false; this.scheduler?.stop(); this.handles.clear();
    const now = this.contextTime(), end = now + AUDIO_TIMING.releaseSec;
    this.master?.gain.cancelScheduledValues(now);
    this.master?.gain.setValueAtTime(this.master.gain.value, now);
    this.master?.gain.linearRampToValueAtTime(0, end);
    const stopped = [...this.voices.values()];
    // Fade each voice too: an immediate new transport must not cancel the old
    // transport's release when it restores the shared master gain.
    for (const voice of stopped) {
      const stopAt = Math.min(end, voice.end);
      if (stopAt > now) {
        const elapsed = Math.max(0, now - voice.start);
        const level = now >= voice.releaseStart ? voice.level * Math.max(0, (voice.end - now) / (voice.end - voice.releaseStart)) : voice.level * Math.min(1, elapsed / voice.attack);
        voice.gain.gain.cancelScheduledValues(now);
        voice.gain.gain.setValueAtTime(level, now);
        voice.gain.gain.linearRampToValueAtTime(0, stopAt);
      }
      for (const source of voice.sources) { try { source.stop(Math.max(now, stopAt)); } catch { /* node already ended */ } }
    }
    if (stopped.length) {
      const timer = setTimeout(() => { for (const voice of stopped) this.disposeVoice(voice); this.cleanupTimers.delete(timer); }, 12);
      this.cleanupTimers.add(timer);
    }
  }
  reset(): void { this.stop(); this.clock?.reset(); }
  async destroy(): Promise<void> {
    this.stop();
    for (const timer of this.cleanupTimers) clearTimeout(timer);
    this.cleanupTimers.clear();
    for (const voice of [...this.voices.values()]) this.disposeVoice(voice);
    this.context?.removeEventListener('statechange', this.stateChange);
    this.context?.removeEventListener('sinkchange', this.sinkChange);
    if (typeof navigator !== 'undefined') navigator.mediaDevices?.removeEventListener('devicechange', this.sinkChange);
    for (const bus of Object.values(this.buses)) bus.disconnect();
    this.master?.disconnect();
    await this.context?.close();
    this.context = null; this.master = null; this.clock = null; this.scheduler = null; this.buses = {};
  }
}

export function median(values: readonly number[]): number {
  if (!values.length) throw new AudioTimingError('empty-median');
  const sorted = [...values].sort((a, b) => a - b), center = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[center]! : (sorted[center - 1]! + sorted[center]!) / 2;
}
export interface CalibrationSummary { complete: boolean; offsetMs: number | null; madMs: number | null; stable: boolean; applicable: boolean; missing: number; duplicates: number; errorsMs: (number | null)[] }
export function calibrationSummary(errorsMs: readonly (number | null)[], duplicates = 0): CalibrationSummary {
  const retained = errorsMs.slice(4, 16), missing = 12 - retained.filter(e => e !== null && Number.isFinite(e)).length;
  if (missing !== 0 || retained.length !== 12) return { complete: false, offsetMs: null, madMs: null, stable: false, applicable: false, missing, duplicates, errorsMs: [...errorsMs] };
  const errors = retained as number[], offsetMs = median(errors), madMs = median(errors.map(e => Math.abs(e - offsetMs)));
  return { complete: true, offsetMs, madMs, stable: madMs <= 45, applicable: madMs <= 45 && Math.abs(offsetMs) <= 250, missing: 0, duplicates, errorsMs: [...errorsMs] };
}
/** A reaction-based optional calibration, never a claim of physical latency measurement. */
export class CalibrationController {
  readonly beatSec: number;
  readonly countInTimes: number[];
  readonly clickTimes: number[];
  private errors: (number | null)[] = Array<number | null>(16).fill(null);
  private duplicates = 0;
  constructor(startSec: number, bpm = 80) {
    this.beatSec = 60 / bpm;
    this.countInTimes = Array.from({ length: 4 }, (_, i) => startSec + i * this.beatSec);
    this.clickTimes = Array.from({ length: 16 }, (_, i) => startSec + (i + 4) * this.beatSec);
  }
  accept(audibleSec: number): { index: number; errorMs: number; duplicate: boolean } | null {
    const index = this.clickTimes.reduce((best, t, i) => Math.abs(t - audibleSec) < Math.abs(this.clickTimes[best]! - audibleSec) ? i : best, 0);
    const errorMs = (audibleSec - this.clickTimes[index]!) * 1000;
    if (Math.abs(errorMs) > 300) return null;
    if (this.errors[index] !== null) { this.duplicates++; return { index, errorMs, duplicate: true }; }
    this.errors[index] = errorMs;
    return { index, errorMs, duplicate: false };
  }
  summary(): CalibrationSummary { return calibrationSummary(this.errors, this.duplicates); }
}
