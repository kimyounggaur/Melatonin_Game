import type { CompiledNote, CompiledTimeline, Grade, InputEdge, JudgeEvent, JudgeSnapshot, NoteEvidence } from './types';
import { DISPATCH_GRACE_SEC } from './compiler';
import { gradeError, median, scoreAttempt } from './windows';

const emptyEvidence = (note: CompiledNote): NoteEvidence => ({ noteId: note.id, status: 'PENDING', onsetPoints: 0, releasePoints: 0, onsetErrorMs: null, releaseErrorMs: null, final: false, reason: null, downSec: null, upSec: null });
interface Extra { phraseIndex: number; timeSec: number }
interface EpochEvidence { evidence: NoteEvidence[]; preservedBefore: number }
/** Browser independent deterministic judge. All times are transport-relative audible seconds. */
export class JudgeEngine {
  readonly timeline: CompiledTimeline;
  sessionId: string;
  private offsetMs: number;
  private evidence: NoteEvidence[];
  private extras: Extra[] = [];
  private nowSec = -Infinity;
  private ownerDown = false;
  private ownerNoteId: string | null = null;
  private ownerToken: string | null = null;
  private finalized = new Set<number>();
  private dedupe = new Set<string>();
  private archives = new Map<string, EpochEvidence>();
  private interruptedFrom: number | null = null;
  private resumedFrom = 0;
  constructor(timeline: CompiledTimeline, options: { sessionId?: string; inputOffsetMs?: number } = {}) {
    this.timeline = timeline; this.sessionId = options.sessionId ?? 'session-1'; this.offsetMs = options.inputOffsetMs ?? 0;
    this.evidence = timeline.notes.map(emptyEvidence);
  }
  private event(type: JudgeEvent['type'], note: CompiledNote | null, grade: Grade, points: number, errorMs: number | null, reason: string, phraseIndex?: number): JudgeEvent {
    return { type, expectationId: note?.id ?? '', noteId: note?.id ?? '', occurrenceId: note?.id ?? '', phraseIndex: phraseIndex ?? note?.phraseIndex ?? 0, grade, points, errorMs, reason, sessionId: this.sessionId };
  }
  private affectedPhrase(timeSec: number): number {
    return this.timeline.phrases.find(p => timeSec < p.endSec)?.index ?? this.timeline.phrases.length - 1;
  }
  private lateConflict(edge: InputEdge, evidence: NoteEvidence[]): CompiledNote | undefined {
    const corrected = edge.timeSec - this.offsetMs / 1000;
    return this.timeline.notes.find((n, i) => {
      const e = evidence[i]; if (!e?.final) return false;
      return edge.kind === 'down' && e.reason === 'onset_miss' && gradeError((corrected - n.startSec) * 1000, n.onsetWindow).points > 0
        || edge.kind === 'up' && e.reason === 'release_timeout' && gradeError((corrected - n.endSec) * 1000, n.releaseWindow).points > 0;
    });
  }
  ingest(edge: InputEdge): JudgeEvent[] {
    if (!Number.isFinite(edge.timeSec) || edge.receiptSec !== undefined && !Number.isFinite(edge.receiptSec)) return this.interrupt('invalid_timestamp');
    const sourceSession = edge.sessionId ?? this.sessionId;
    if (edge.id || edge.sequence !== undefined) {
      const key = `${sourceSession}:${edge.id ?? `sequence:${edge.sequence}`}`; if (this.dedupe.has(key)) return [];
      this.dedupe.add(key);
    }
    if (sourceSession !== this.sessionId) {
      const archived = this.archives.get(sourceSession); if (!archived) return [];
      const conflict = this.lateConflict(edge, archived.evidence);
      // Discarded epochs never modify the replayed phrase. Earlier preserved evidence remains revocable.
      if (conflict && conflict.phraseIndex < this.resumedFrom) return this.invalidate(conflict.phraseIndex, 'late_finalized_edge');
      return [];
    }
    if (this.interruptedFrom !== null) return [];
    const receipt = edge.receiptSec ?? edge.timeSec;
    if ((receipt - edge.timeSec) * 1000 > 200 + 1e-8) return this.invalidate(Math.min(this.earliestUnfinalized(), this.affectedPhrase(edge.timeSec)), 'input_dispatch_delay');
    const conflict = this.lateConflict(edge, this.evidence);
    if (conflict) return this.invalidate(conflict.phraseIndex, 'late_finalized_edge');
    if (edge.kind === 'cancel') return this.interrupt('input_cancel');
    const at = edge.timeSec - this.offsetMs / 1000;
    this.nowSec = Math.max(this.nowSec, receipt);
    if (edge.kind === 'up') {
      if (!this.ownerDown || edge.ownerToken && this.ownerToken && edge.ownerToken !== this.ownerToken) return [];
      this.ownerDown = false; this.ownerToken = null;
      const id = this.ownerNoteId; this.ownerNoteId = null;
      if (!id) return [];
      const index = this.timeline.notes.findIndex(n => n.id === id); const note = this.timeline.notes[index]!; const evidence = this.evidence[index]!;
      evidence.upSec = at;
      if (note.interaction !== 'hold' || evidence.final) return [];
      const errorMs = (at - note.endSec) * 1000;
      const result = gradeError(errorMs, note.releaseWindow);
      evidence.releaseErrorMs = errorMs; evidence.releasePoints = result.points; evidence.final = true;
      evidence.status = result.points > 0 ? 'RELEASED' : errorMs < 0 ? 'BROKEN' : 'OVERHELD';
      evidence.reason = result.points > 0 ? 'release_hit' : errorMs < 0 ? 'early_release' : 'late_release';
      return [this.event('RELEASE_RESULT', note, result.grade, result.points, errorMs, evidence.reason)];
    }
    if (this.ownerDown) return [];
    this.ownerDown = true; this.ownerToken = edge.ownerToken ?? null;
    const candidates = this.timeline.notes.map((note, index) => ({ note, index, errorMs: (at - note.startSec) * 1000 }))
      .filter(c => this.evidence[c.index]!.status === 'PENDING' && gradeError(c.errorMs, c.note.onsetWindow).points > 0)
      .sort((a, b) => Math.abs(a.errorMs) - Math.abs(b.errorMs) || a.note.startSec - b.note.startSec || a.note.id.localeCompare(b.note.id));
    const candidate = candidates[0];
    if (!candidate) {
      this.ownerNoteId = null;
      // Earlier count-in input occupies physical owner but is deliberately unscored.
      if (at < this.timeline.startTick / 480 * 60 / this.timeline.effectiveQuarterBpm) return [];
      if (at > this.timeline.startTick / 480 * 60 / this.timeline.effectiveQuarterBpm + this.timeline.durationSec) return [];
      const phraseIndex = this.affectedPhrase(at); this.extras.push({ phraseIndex, timeSec: at });
      return [this.event('EXTRA_DOWN', null, 'miss', 0, null, 'no_pending_onset', phraseIndex)];
    }
    const { note, index, errorMs } = candidate; const evidence = this.evidence[index]!; const result = gradeError(errorMs, note.onsetWindow);
    evidence.onsetPoints = result.points; evidence.onsetErrorMs = errorMs; evidence.downSec = at;
    evidence.status = note.interaction === 'hold' ? 'ACTIVE' : 'HIT'; evidence.final = note.interaction === 'tap'; evidence.reason = 'onset_hit';
    this.ownerNoteId = note.id;
    return [this.event('ONSET_RESULT', note, result.grade, result.points, errorMs, 'onset_hit')];
  }
  edge(edge: InputEdge): JudgeEvent[] { return this.ingest(edge); }
  advanceTo(nowSec: number): JudgeEvent[] {
    if (this.interruptedFrom !== null) return [];
    this.nowSec = Math.max(this.nowSec, nowSec); const events: JudgeEvent[] = [];
    // Targets/windows use corrected musical time; positive calibration means that a
    // valid physical edge can arrive later on the raw clock. Delay availability
    // only, without expanding a grade window or shortening negative-offset grace.
    const availabilityDelaySec = Math.max(0, this.offsetMs) / 1000;
    this.timeline.notes.forEach((note, i) => {
      const e = this.evidence[i]!;
      if (e.status === 'PENDING' && nowSec > note.startSec + note.onsetWindow.lateMs / 1000 + DISPATCH_GRACE_SEC + availabilityDelaySec) {
        e.status = 'MISSED'; e.final = true; e.reason = 'onset_miss';
        events.push(this.event('MISS', note, 'miss', 0, null, 'onset_miss'));
      } else if (e.status === 'ACTIVE' && nowSec > note.endSec + note.releaseWindow.lateMs / 1000 + DISPATCH_GRACE_SEC + availabilityDelaySec) {
        e.status = 'OVERHELD'; e.final = true; e.reason = 'release_timeout';
        events.push(this.event('RELEASE_RESULT', note, 'miss', 0, null, 'release_timeout'));
      }
    });
    for (const phrase of this.timeline.phrases) {
      if (!this.finalized.has(phrase.index) && nowSec > phrase.finalizeSec + availabilityDelaySec && this.timeline.notes.every((n, i) => n.phraseIndex !== phrase.index || this.evidence[i]!.final)) {
        this.finalized.add(phrase.index); events.push(this.event('PHRASE_FINAL', null, 'perfect', 0, null, 'phrase_committed', phrase.index));
      }
    }
    return events;
  }
  advance(nowSec: number): JudgeEvent[] { return this.advanceTo(nowSec); }
  private earliestUnfinalized(): number { return this.timeline.phrases.find(p => !this.finalized.has(p.index))?.index ?? this.timeline.phrases.length - 1; }
  private invalidate(from: number, reason: string): JudgeEvent[] {
    if (this.interruptedFrom !== null && from >= this.interruptedFrom) return [];
    this.archives.set(this.sessionId, { evidence: this.evidence.map(e => ({ ...e })), preservedBefore: from });
    this.interruptedFrom = from;
    this.evidence = this.evidence.map((e, i) => this.timeline.notes[i]!.phraseIndex >= from ? emptyEvidence(this.timeline.notes[i]!) : e);
    this.extras = this.extras.filter(e => e.phraseIndex < from);
    for (const p of this.timeline.phrases) if (p.index >= from) this.finalized.delete(p.index);
    this.ownerDown = false; this.ownerNoteId = null; this.ownerToken = null;
    return [this.event('INTERRUPT', null, 'miss', 0, null, reason, from)];
  }
  interrupt(reason = 'pause', atSec?: number): JudgeEvent[] {
    if (atSec !== undefined) this.nowSec = Math.max(this.nowSec, atSec);
    return this.invalidate(this.earliestUnfinalized(), reason);
  }
  resume(newSessionId: string): number {
    const from = this.interruptedFrom ?? this.earliestUnfinalized(); this.resumedFrom = from; this.sessionId = newSessionId;
    this.interruptedFrom = null; this.nowSec = this.timeline.phrases[from]!.startSec - this.timeline.barTicks / 480 * 60 / this.timeline.effectiveQuarterBpm;
    this.ownerDown = false; this.ownerNoteId = null; this.ownerToken = null;
    return this.timeline.phrases[from]!.startTick;
  }
  snapshot(): JudgeSnapshot {
    const activeBefore = this.interruptedFrom ?? Infinity;
    const includedNotes = this.timeline.notes.map((n, i) => ({ note: n, evidence: this.evidence[i]! })).filter(x => x.note.phraseIndex < activeBefore);
    const earned = includedNotes.reduce((sum, x) => sum + x.evidence.onsetPoints + x.evidence.releasePoints, 0);
    const rests = this.timeline.rests.filter(r => !r.excluded && r.phraseIndex < activeBefore && this.nowSec >= r.endSec);
    const clean = rests.filter(r => {
      if (this.extras.some(e => e.timeSec >= r.evaluationStartSec && e.timeSec < r.evaluationEndSec)) return false;
      return !includedNotes.some(({ note, evidence }) => note.interaction === 'hold' && evidence.downSec !== null && (evidence.upSec ?? this.nowSec) > Math.max(r.evaluationStartSec, note.endSec + note.releaseWindow.lateMs / 1000) && note.endSec < r.evaluationEndSec && (evidence.upSec ?? this.nowSec) > r.evaluationStartSec);
    });
    const holds = includedNotes.filter(x => x.note.interaction === 'hold'); const ties = holds.filter(x => x.note.tieBoundaries.length > 0);
    const releaseCount = holds.filter(x => x.evidence.releasePoints > 0).length;
    const tiedCount = ties.filter(x => x.evidence.onsetPoints > 0 && x.evidence.releasePoints > 0).length;
    // Distinct next onset IDs prevent consecutive authored rests from counting the same re-entry twice.
    const reentryIds = new Set(rests.map(r => r.nextOnsetId).filter((id): id is string => id !== null));
    const reentries = includedNotes.filter(x => reentryIds.has(x.note.id));
    const reentrySuccessCount = reentries.filter(x => x.evidence.onsetPoints > 0).length;
    const ratio = (n: number, d: number) => d ? n / d : null;
    const expectationCount = this.interruptedFrom === null ? this.timeline.expectationCount : this.timeline.phrases.filter(p => p.index < activeBefore).reduce((sum, p) => sum + p.expectationCount, 0);
    return { score: expectationCount ? scoreAttempt(earned, this.extras.length, expectationCount) : 0, earned, extra: this.extras.length, expectationCount,
      metrics: { restCleanCount: clean.length, restCount: rests.length, restCleanRatio: ratio(clean.length, rests.length), tieContinuousCount: tiedCount, tieCount: ties.length, tieContinuousRatio: ratio(tiedCount, ties.length), releaseInWindowCount: releaseCount, holdCount: holds.length, releaseInWindowRatio: ratio(releaseCount, holds.length), onsetMedianAbsError: median(includedNotes.filter(x => x.evidence.onsetErrorMs !== null).map(x => Math.abs(x.evidence.onsetErrorMs!))), reentrySuccessCount, reentryCount: reentries.length, reentryRatio: ratio(reentrySuccessCount, reentries.length), meterConceptCorrect: null },
      notes: this.evidence.map(e => ({ ...e })), finished: this.interruptedFrom === null && this.finalized.size === this.timeline.phrases.length && this.nowSec > this.timeline.finalizationSec + Math.max(0, this.offsetMs) / 1000,
      invalidatedFrom: this.interruptedFrom, restartTick: this.timeline.phrases[this.interruptedFrom ?? this.earliestUnfinalized()]!.startTick, completedPhrases: this.finalized.size, sessionId: this.sessionId };
  }
}
export function createJudge(timeline: CompiledTimeline, options: { sessionId?: string; inputOffsetMs?: number } = {}): JudgeEngine { return new JudgeEngine(timeline, options); }
