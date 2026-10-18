import { afterEach, describe, expect, it, vi } from 'vitest';
import { AUDIO_TIMING, AUDIO_BUS_DEFAULT_VOLUME, AUDIO_BUS_HEADROOM, AudioClock, AudioEngine, CalibrationController, LookaheadScheduler, calibrationSummary, normalizeEventTimestamp } from '../src/audio';

class FakeParam {
  value = 1;
  events: { type: string; value: number; at: number }[] = [];
  setValueAtTime(value: number, at: number) { this.events.push({ type: 'set', value, at }); return this; }
  linearRampToValueAtTime(value: number, at: number) { this.events.push({ type: 'linear', value, at }); return this; }
  exponentialRampToValueAtTime(value: number, at: number) { this.events.push({ type: 'exponential', value, at }); return this; }
  cancelScheduledValues(at: number) { this.events = this.events.filter(e => e.at < at); return this; }
}
class FakeNode {
  disconnected = false;
  gain = new FakeParam();
  connect() { return this; }
  disconnect() { this.disconnected = true; }
}
class FakeOscillator extends FakeNode {
  type = 'sine';
  frequency = new FakeParam();
  startTimes: number[] = [];
  stopTimes: number[] = [];
  onended: (() => void) | null = null;
  start(at: number) { this.startTimes.push(at); }
  stop(at: number) { this.stopTimes.push(at); }
}
class FakeContext extends EventTarget {
  currentTime = 10;
  baseLatency = .01;
  outputLatency = .02;
  state: AudioContextState = 'running';
  destination = new FakeNode();
  gains: FakeNode[] = [];
  oscillators: FakeOscillator[] = [];
  refuseResume = false;
  stamp = { contextTime: 9.97, performanceTime: 1000 };
  createGain() { const gain = new FakeNode(); this.gains.push(gain); return gain; }
  createOscillator() { const osc = new FakeOscillator(); this.oscillators.push(osc); return osc; }
  getOutputTimestamp() { return this.stamp; }
  async resume() { if (this.refuseResume) throw new Error('blocked'); this.state = 'running'; }
  async close() { this.state = 'closed'; }
  asAudio() { return this as unknown as AudioContext; }
}

afterEach(() => { vi.useRealTimers(); });

describe('three clock mappings and timestamp normalization', () => {
  it('U30: output mapping does not subtract base/output latency again', () => {
    const context = new FakeContext();
    const clock = new AudioClock(context.asAudio(), () => 1000);
    expect(clock.audibleAt(1080)).toBeCloseTo(10.05, 10);
    expect(clock.method).toBe('output-timestamp');
    clock.inputOffsetMs = 80;
    expect(clock.errorMs(1080, 9.97)).toBeCloseTo(0, 9);
    clock.inputOffsetMs = -80;
    expect(clock.errorMs(920, 9.97)).toBeCloseTo(0, 9);
  });
  it('D09: unsupported/zero output pair uses anchored time minus latency exactly once', () => {
    const context = new FakeContext(); context.stamp = { contextTime: 0, performanceTime: 0 };
    const clock = new AudioClock(context.asAudio(), () => 1000);
    expect(clock.audibleAt(1100)).toBeCloseTo(10.07, 10);
    expect(clock.method).toBe('latency-fallback');
  });
  it('rejects discontinuous output pairs and reanchors after a new transport', () => {
    const context = new FakeContext(), clock = new AudioClock(context.asAudio(), () => 1000);
    expect(clock.now()).toBeCloseTo(9.97);
    context.stamp = { contextTime: 8, performanceTime: 1000 };
    expect(clock.now()).toBeCloseTo(9.97);
    expect(clock.method).toBe('latency-fallback');
    clock.reset();
    expect(clock.now()).toBe(8);
    expect(clock.method).toBe('output-timestamp');
  });
  it('normalizes epoch DOM timestamps and rejects timestamps more than five seconds away', () => {
    const origin = 1720000000000;
    expect(normalizeEventTimestamp(origin + 1234, 1250, origin)).toBe(1234);
    expect(normalizeEventTimestamp(1234, 1250, origin)).toBe(1234);
    expect(() => normalizeEventTimestamp(1, 6000, origin)).toThrow('invalid-input-timestamp');
  });
});

describe('fixed lookahead scheduling', () => {
  it('uses the 25ms / 150ms contract, independent of rendering fps', () => {
    vi.useFakeTimers();
    expect(AUDIO_TIMING.schedulerMs).toBe(25); expect(AUDIO_TIMING.lookaheadSec).toBe(.15);
    for (const fps of [15, 30, 60]) {
      let now = 0; const at: number[] = [], interrupted = vi.fn();
      const scheduler = new LookaheadScheduler(() => now, interrupted);
      scheduler.enqueue({ id: 'a', atSec: .2, run: () => at.push(.2) });
      scheduler.enqueue({ id: 'b', atSec: 1.25, run: () => at.push(1.25) });
      scheduler.start();
      // Draw timestamps can vary; the independent audio scheduler remains 25ms.
      for (let t = 0; t < 1.4; t += .025) { now = t; scheduler.pump(); void fps; }
      expect(at).toEqual([.2, 1.25]); expect(interrupted).not.toHaveBeenCalled(); scheduler.stop();
    }
  });
  it('I03: a >100ms gap with an overdue unscheduled event interrupts without catch-up sound', () => {
    vi.useFakeTimers(); let now = 0; const play = vi.fn(), interrupted = vi.fn();
    const scheduler = new LookaheadScheduler(() => now, interrupted);
    scheduler.enqueue({ id: 'lost', atSec: .3, run: play }); scheduler.start();
    now = .4; scheduler.pump();
    expect(interrupted).toHaveBeenCalledWith('scheduler-gap'); expect(play).not.toHaveBeenCalled(); expect(scheduler.pendingCount).toBe(0);
  });
  it('a long gap without a missed note does not invent a failure', () => {
    vi.useFakeTimers(); let now = 0; const interrupted = vi.fn();
    const scheduler = new LookaheadScheduler(() => now, interrupted); scheduler.start(); now = 1; scheduler.pump();
    expect(interrupted).not.toHaveBeenCalled(); scheduler.stop();
  });
});

async function engineFixture() {
  vi.useFakeTimers(); const context = new FakeContext(), interrupted = vi.fn();
  const engine = new AudioEngine({ contextFactory: () => context.asAudio(), perfNow: () => 1000, onInterrupted: interrupted });
  expect(await engine.unlock()).toBe(true); engine.start();
  return { context, engine, interrupted };
}

describe('synthesized gates and interruption cleanup', () => {
  it('applies recommended per-bus defaults within the original mix headroom', async () => {
    const { engine, context } = await engineFixture();
    const buses = ['guide', 'player', 'metronome', 'bgm', 'sfx'] as const;
    buses.forEach((bus, i) => {
      expect(engine.getBusVolume(bus)).toBe(AUDIO_BUS_DEFAULT_VOLUME[bus]);
      expect(context.gains[i + 1]!.gain.value).toBeCloseTo(AUDIO_BUS_HEADROOM[bus] * AUDIO_BUS_DEFAULT_VOLUME[bus]);
    });
    engine.setBusVolume('metronome', 1);
    expect(context.gains[3]!.gain.events.at(-1)).toEqual({ type: 'linear', value: .22, at: 10.008 });
    engine.setBusVolume('metronome', -1); expect(engine.getBusVolume('metronome')).toBe(0);
    engine.setBusVolume('guide', 2); expect(engine.getBusVolume('guide')).toBe(1);
    expect(() => engine.setBusVolume('sfx', NaN)).toThrow('invalid-bus-volume');
    await engine.destroy();
  });
  it('retains bus settings made before the user unlocks audio', async () => {
    const context = new FakeContext();
    const engine = new AudioEngine({ contextFactory: () => context.asAudio() });
    engine.setBusVolume('metronome', .5); engine.setBusVolume('bgm', 0);
    expect(await engine.unlock()).toBe(true);
    expect(context.gains[3]!.gain.value).toBe(.11); expect(context.gains[4]!.gain.value).toBe(0);
    await engine.destroy();
  });
  it('I01 / L02: a merged tie attacks once and has no new nodes at its middle', async () => {
    const { engine, context } = await engineFixture();
    engine.scheduleNote({ id: 'L02-tie', midi: 72, startSec: 10.1, endSec: 11.1, kind: 'demo' });
    engine.scheduler!.pump(); const count = context.oscillators.length;
    expect(count).toBe(2); // one sine + weak triangle make one voice / attack
    context.currentTime = 10.6; engine.scheduler!.pump();
    expect(context.oscillators.length).toBe(count);
    expect(engine.getDiagnostics().filter(e => e.event === 'attack')).toHaveLength(1);
    expect(context.oscillators[0]!.stopTimes).toEqual([11.1]);
    await engine.destroy();
  });
  it('PLAY without input has zero pitched player/guide voices', async () => {
    const { engine, context } = await engineFixture(); engine.pulse(10.1, true); engine.scheduler!.pump();
    expect(engine.getDiagnostics().filter(e => e.event === 'attack' && /bus=(player|guide)/.test(e.details ?? ''))).toHaveLength(0);
    expect(context.oscillators).toHaveLength(2); await engine.destroy();
  });
  it('U44 / D20: late tap keeps the fixed target end including compressed envelope', async () => {
    const { engine, context } = await engineFixture();
    const handle = engine.liveNote({ id: 'late', midi: 76, kind: 'tap', targetEndSec: 10.007 });
    expect(handle?.startSec).toBe(10.003); expect(handle?.endSec).toBe(10.007);
    expect(context.oscillators[0]!.stopTimes).toEqual([10.007]);
    const envelope = context.gains.at(-2)!.gain.events; // amp then weak
    expect(envelope.filter(e => e.type === 'linear' && e.value === 0).at(-1)?.at).toBe(10.007);
    context.currentTime = 11;
    expect(engine.liveNote({ id: 'past', midi: 76, kind: 'tap', targetEndSec: 10.9 })).toBeNull();
    expect(engine.getDiagnostics().some(e => e.event === 'late-note-suppressed')).toBe(true);
    await engine.destroy();
  });
  it('U19 / U21: hold ends at real up, with a forced cap independent of dispatch grace', async () => {
    const { engine, context } = await engineFixture();
    engine.liveNote({ id: 'hold', midi: 72, kind: 'hold', targetEndSec: 12, releaseWindowMs: 160 });
    expect(context.oscillators[0]!.stopTimes).toEqual([12.16]);
    context.currentTime = 10.5; engine.release('hold');
    expect(context.oscillators[0]!.stopTimes.at(-1)).toBeCloseTo(10.508, 10);
    expect(context.oscillators[0]!.stopTimes.at(-1)).toBeLessThan(12);
    await engine.destroy();
  });
  it('caps an up near maximum end and never adds release beyond that end', async () => {
    const { engine, context } = await engineFixture();
    engine.liveNote({ id: 'hold', midi: 72, kind: 'hold', targetEndSec: 12, releaseWindowMs: 160 });
    context.currentTime = 12.157; engine.release('hold');
    expect(context.oscillators[0]!.stopTimes.at(-1)).toBe(12.16); await engine.destroy();
  });
  it('immediate restart keeps the interrupted voice fade and never extends a tap end', async () => {
    const { engine, context } = await engineFixture();
    engine.liveNote({ id: 'tap', midi: 76, kind: 'tap', targetEndSec: 10.02 });
    context.currentTime = 10.017;
    engine.stop(); engine.start();
    expect(context.oscillators[0]!.stopTimes.at(-1)).toBe(10.02);
    const envelope = context.gains.at(-2)!.gain.events;
    expect(envelope.at(-1)).toEqual({ type: 'linear', value: 0, at: 10.02 });
    vi.advanceTimersByTime(15); expect(engine.voiceCount).toBe(0); await engine.destroy();
  });
  it('I08: twenty pause/retry cycles leave no voices, queued callbacks, or source nodes connected', async () => {
    const { engine, context } = await engineFixture();
    for (let n = 0; n < 20; n++) {
      engine.liveNote({ id: `hold-${n}`, midi: 72, kind: 'hold', targetEndSec: 12 });
      engine.scheduleNote({ id: `future-${n}`, midi: 74, startSec: 13, endSec: 14 });
      engine.stop(); vi.advanceTimersByTime(15);
      expect(engine.voiceCount).toBe(0); expect(engine.pendingCount).toBe(0); engine.start();
    }
    expect(context.oscillators.every(o => o.disconnected)).toBe(true); await engine.destroy();
  });
  it('I10: failed resume cannot start silent transport', async () => {
    const context = new FakeContext(); context.refuseResume = true; context.state = 'suspended';
    const engine = new AudioEngine({ contextFactory: () => context.asAudio() });
    expect(await engine.unlock()).toBe(false); expect(() => engine.start()).toThrow('audio-not-running'); await engine.destroy();
  });
  it('unexpected non-running audio interrupts once and closes all gates', async () => {
    const { engine, context, interrupted } = await engineFixture();
    engine.liveNote({ id: 'hold', midi: 72, kind: 'hold', targetEndSec: 12 });
    context.state = 'suspended'; context.dispatchEvent(new Event('statechange')); context.dispatchEvent(new Event('statechange'));
    expect(interrupted).toHaveBeenCalledTimes(1); expect(engine.playing).toBe(false);
    vi.advanceTimersByTime(15); expect(engine.voiceCount).toBe(0); await engine.destroy();
  });
});

describe('optional reaction-based calibration', () => {
  it('C06: excludes first four measured clicks and calculates median 80 / MAD 4.5', () => {
    const s = calibrationSummary([999, 999, 999, 999, 60, 70, 75, 78, 80, 80, 80, 82, 84, 85, 90, 100]);
    expect(s.offsetMs).toBe(80); expect(s.madMs).toBe(4.5); expect(s.applicable).toBe(true);
  });
  it('MAD45 accepted; >45, offset >250, and missing retained sample cannot be applied', () => {
    expect(calibrationSummary([0, 0, 0, 0, ...Array(6).fill(-45), ...Array(6).fill(45)]).applicable).toBe(true);
    expect(calibrationSummary([0, 0, 0, 0, ...Array(6).fill(-45.1), ...Array(6).fill(45.1)]).applicable).toBe(false);
    expect(calibrationSummary(Array(16).fill(251)).applicable).toBe(false);
    expect(calibrationSummary([...Array(15).fill(80), null]).complete).toBe(false);
  });
  it('4 count-in + 16 clicks at 80BPM, one input per click ±300ms; duplicate never replaces sample', () => {
    const calibration = new CalibrationController(10);
    expect(calibration.countInTimes).toEqual([10, 10.75, 11.5, 12.25]);
    expect(calibration.clickTimes).toHaveLength(16); expect(calibration.clickTimes[0]).toBe(13);
    expect(calibration.accept(13.08)?.errorMs).toBeCloseTo(80);
    expect(calibration.accept(13.09)?.duplicate).toBe(true);
    expect(calibration.accept(13.4)).toBeNull();
    for (let i = 1; i < 16; i++) calibration.accept(calibration.clickTimes[i]! + .08);
    expect(calibration.summary().offsetMs).toBeCloseTo(80); expect(calibration.summary().duplicates).toBe(1);
  });
});
