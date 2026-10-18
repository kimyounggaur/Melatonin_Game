import { afterEach, describe, expect, it, vi } from 'vitest';
import { AudioEngine } from '../src/audio';
import { compileLevel } from '../src/core/compiler';
import { JudgeEngine } from '../src/core/judge';
import { getLevel } from '../src/content';
import type { CompiledTimeline, JudgeEvent } from '../src/core/types';

class Param {
  value = 1;
  setValueAtTime() { return this; }
  linearRampToValueAtTime() { return this; }
  exponentialRampToValueAtTime() { return this; }
  cancelScheduledValues() { return this; }
}
class Node {
  gain = new Param(); frequency = new Param(); type = 'sine'; disconnected = false;
  end = Infinity; ended = false; onended: (() => void) | null = null;
  connect() { return this; } disconnect() { this.disconnected = true; }
  start() {} stop(at: number) { this.end = at; }
}
class SimulatedContext extends EventTarget {
  currentTime = 10; baseLatency = .01; outputLatency = .02;
  state: AudioContextState = 'running'; destination = new Node(); sources: Node[] = [];
  createGain() { return new Node(); }
  createOscillator() { const source = new Node(); this.sources.push(source); return source; }
  getOutputTimestamp() { return { contextTime: this.currentTime - .03, performanceTime: this.currentTime * 1000 }; }
  async resume() { this.state = 'running'; } async close() { this.state = 'closed'; }
  advanceTo(seconds: number) {
    this.currentTime = seconds;
    for (const source of this.sources) if (!source.ended && source.end <= seconds) { source.ended = true; source.onended?.(); }
  }
  audioContext() { return this as unknown as AudioContext; }
}
async function setup() {
  vi.useFakeTimers();
  const context = new SimulatedContext(), interrupted = vi.fn();
  const audio = new AudioEngine({ contextFactory: () => context.audioContext(), perfNow: () => context.currentTime * 1000, onInterrupted: interrupted });
  expect(await audio.unlock()).toBe(true); audio.start();
  return { audio, context, interrupted };
}
function processAudio(events: JudgeEvent[], compiled: CompiledTimeline, audio: AudioEngine, origin: number) {
  for (const event of events) {
    const note = compiled.notes.find(n => n.id === event.noteId);
    if (event.type === 'ONSET_RESULT' && event.points > 0 && note) audio.liveNote({ id: note.id, midi: note.midi, kind: note.interaction, targetEndSec: origin + note.endSec, releaseWindowMs: note.releaseWindow.lateMs });
    if (event.type === 'RELEASE_RESULT' && note) audio.release(note.id);
  }
}
afterEach(() => vi.useRealTimers());

describe('compiler / judge / audio adapter contracts used by the game', () => {
  it('I01: L02 compiled tie yields one attack and one end across every demo repeat', async () => {
    const { audio, context, interrupted } = await setup(), compiled = compileLevel(getLevel('L02'), { repeats: 2 });
    const origin = audio.contextTime() + .25;
    for (const note of compiled.notes) audio.scheduleNote({ id: `demo:${note.id}`, midi: note.midi, startSec: origin + note.startSec, endSec: origin + note.endSec, kind: 'demo' });
    for (let at = context.currentTime; at < origin + compiled.durationSec + .1; at += .025) { context.advanceTo(at); audio.scheduler!.pump(); }
    const attacks = audio.getDiagnostics().filter(d => d.event === 'attack');
    expect(attacks).toHaveLength(4); expect(attacks.every(a => a.details?.includes('bus=guide'))).toBe(true);
    for (const note of compiled.notes) {
      const attack = attacks.find(a => a.id === `demo:${note.id}`)!;
      expect(attack.details).toContain(`start=${origin + note.startSec};end=${origin + note.endSec}`);
    }
    expect(interrupted).not.toHaveBeenCalled(); expect(audio.voiceCount).toBe(0); await audio.destroy();
  });
  it('L03 tie stays one voice across its barline; early up produces BROKEN and immediate audio release', async () => {
    const { audio, context } = await setup(), compiled = compileLevel(getLevel('L03'));
    const judge = new JudgeEngine(compiled), origin = 10.25, note = compiled.notes.find(n => n.tieBoundaries.length)!;
    context.advanceTo(origin + note.startSec + .03);
    processAudio(judge.ingest({ kind: 'down', timeSec: audio.now() - origin, receiptSec: audio.now() - origin }), compiled, audio, origin);
    const voices = audio.voiceCount, sources = context.sources.length;
    context.advanceTo(origin + note.tieBoundaries[0]! / 480 * 60 / compiled.effectiveQuarterBpm + .03);
    expect(audio.voiceCount).toBe(voices); expect(context.sources.length).toBe(sources);
    const early = judge.ingest({ kind: 'up', timeSec: audio.now() - origin, receiptSec: audio.now() - origin });
    expect(early[0]?.reason).toBe('early_release');
    processAudio(early, compiled, audio, origin);
    expect(context.sources[0]!.end).toBeCloseTo(context.currentTime + .008, 10);
    expect(context.sources[0]!.end).toBeLessThan(origin + note.endSec);
    context.advanceTo(context.currentTime + .01); expect(audio.voiceCount).toBe(0); await audio.destroy();
  });
  it('PLAY no-input creates no lead, including onset misses and release timeouts', async () => {
    const { audio, context } = await setup(), compiled = compileLevel(getLevel('L02'), { repeats: 4 });
    const judge = new JudgeEngine(compiled), origin = 10.25;
    processAudio(judge.advanceTo(compiled.finalizationSec + .001), compiled, audio, origin);
    expect(judge.snapshot().finished).toBe(true); expect(context.sources).toHaveLength(0); await audio.destroy();
  });
  it('positive input offset is applied once by judge; raw receipt mapping still records actual delivery delay', async () => {
    const { audio, context } = await setup(), compiled = compileLevel(getLevel('L02'));
    const origin = 10.25, judge = new JudgeEngine(compiled, { inputOffsetMs: 80 });
    audio.setInputOffsetMs(80); // UI keeps this profile too; the adapter deliberately reads raw audible time.
    context.advanceTo(origin + .08 + .03);
    const perf = context.currentTime * 1000;
    const events = judge.ingest({ kind: 'down', timeSec: audio.performanceToAudioTime(perf) - origin, receiptSec: audio.now() - origin });
    expect(events[0]?.points).toBe(1); expect(events[0]?.errorMs).toBeCloseTo(0, 8);
    processAudio(events, compiled, audio, origin);
    expect(audio.voiceCount).toBe(1); expect(context.sources[0]!.end).toBeCloseTo(origin + compiled.notes[0]!.endSec + .16);
    await audio.destroy();
  });
  it('overhold audio expires at release-window end while judge continues waiting its 100ms dispatch grace', async () => {
    const { audio, context } = await setup(), compiled = compileLevel(getLevel('L02'));
    const origin = 10.25, judge = new JudgeEngine(compiled), note = compiled.notes[0]!;
    context.advanceTo(origin + .03);
    processAudio(judge.ingest({ kind: 'down', timeSec: 0, receiptSec: 0 }), compiled, audio, origin);
    const maxEnd = origin + note.endSec + note.releaseWindow.lateMs / 1000;
    context.advanceTo(maxEnd + .001);
    expect(audio.voiceCount).toBe(0);
    expect(judge.advanceTo(note.endSec + note.releaseWindow.lateMs / 1000 + .001).some(e => e.type === 'RELEASE_RESULT')).toBe(false);
    const timeout = judge.advanceTo(note.endSec + note.releaseWindow.lateMs / 1000 + .101);
    expect(timeout.some(e => e.type === 'RELEASE_RESULT' && e.reason === 'release_timeout')).toBe(true);
    await audio.destroy();
  });
});
