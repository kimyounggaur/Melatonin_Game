export const PPQ = 480 as const;
export type SceneId = 'thread-bridge' | 'crescent-greenhouse' | 'folding-room' | 'cloud-post';
export type PitchName = 'C5' | 'D5' | 'E5' | 'G5';
export type Notation = { denominator: number; dots: number };
export type RestEvent = { id: string; at: number; ticks: number; kind: 'rest'; notation: Notation };
export type NoteEvent = { id: string; at: number; ticks: number; kind: 'note'; notation: Notation; pitchName: PitchName; midi: number; interaction: 'tap' | 'hold'; tieGroup?: string };
export type NotationEvent = RestEvent | NoteEvent;
export interface Level {
  schemaVersion: 1; id: string; title: string; scene: SceneId; ppq: 480;
  meter: { n: number; d: number; groupingEighths: number[] }; quarterBpm: number;
  sourceIds: string[]; skillIds: string[];
  sequence: { countInBars: number; listenRepeats: number; listenTailBars: number; practiceRepeats: number; playRepeats: number; outroBars: number };
  bars: { events: NotationEvent[] }[];
  reviewState: 'math_checked_art_audio_review_pending';
}
export interface ValidationIssue { path: string; code: string; observed: unknown; expected: unknown; file: string }
export interface WindowSet { perfectMs: number; goodMs: number; lateMs: number; perfectUs: number; goodUs: number; lateUs: number }
export type Grade = 'perfect' | 'good' | 'near' | 'miss';
export interface CompiledNote {
  id: string; occurrenceId: string; phraseIndex: number; startTick: number; endTick: number;
  startSec: number; endSec: number; interaction: 'tap' | 'hold'; pitchName: PitchName; midi: number;
  sourceNotationIds: string[]; tieBoundaries: number[]; onsetWindow: WindowSet; releaseWindow: WindowSet;
}
export interface CompiledRest { id: string; phraseIndex: number; startTick: number; endTick: number; startSec: number; endSec: number; sourceNotationIds: string[]; evaluationStartSec: number; evaluationEndSec: number; excluded: boolean; nextOnsetId: string | null }
export interface Phrase { index: number; startTick: number; endTick: number; startSec: number; endSec: number; finalizeSec: number; expectationCount: number }
export interface BeatCue { tick: number; timeSec: number; phraseIndex: number; index: number; major: boolean; first: boolean; gain: number }
export interface MusicalEvent { type: 'ONSET' | 'GATE_END' | 'TIE_BOUNDARY' | 'REST_START' | 'REST_END' | 'BEAT'; tick: number; audioSec: number; occurrenceId: string; sourceNotationIds: string[] }
export interface CompiledTimeline { level: Level; notes: CompiledNote[]; rests: CompiledRest[]; phrases: Phrase[]; beats: BeatCue[]; events: MusicalEvent[]; durationTicks: number; durationSec: number; motifTicks: number; motifDurationSec: number; barTicks: number; expectationCount: number; speed: number; effectiveQuarterBpm: number; startTick: number; finalizationSec: number }
export interface InputEdge { kind: 'down' | 'up' | 'cancel'; timeSec: number; receiptSec?: number; id?: string; sessionId?: string; sequence?: number; ownerToken?: string }
export interface JudgeEvent { type: 'ONSET_RESULT' | 'RELEASE_RESULT' | 'MISS' | 'EXTRA_DOWN' | 'INTERRUPT' | 'PHRASE_FINAL'; expectationId: string; noteId: string; occurrenceId: string; phraseIndex: number; grade: Grade; points: number; errorMs: number | null; reason: string; sessionId: string }
export type NoteStatus = 'PENDING' | 'ACTIVE' | 'HIT' | 'RELEASED' | 'BROKEN' | 'OVERHELD' | 'MISSED';
export interface NoteEvidence { noteId: string; status: NoteStatus; onsetPoints: number; releasePoints: number; onsetErrorMs: number | null; releaseErrorMs: number | null; final: boolean; reason: string | null; downSec: number | null; upSec: number | null }
export interface Metrics { restCleanCount: number; restCount: number; restCleanRatio: number | null; tieContinuousCount: number; tieCount: number; tieContinuousRatio: number | null; releaseInWindowCount: number; holdCount: number; releaseInWindowRatio: number | null; onsetMedianAbsError: number | null; reentrySuccessCount: number; reentryCount: number; reentryRatio: number | null; meterConceptCorrect: number | null }
export interface JudgeSnapshot { score: number; earned: number; extra: number; expectationCount: number; metrics: Metrics; notes: NoteEvidence[]; finished: boolean; invalidatedFrom: number | null; restartTick: number; completedPhrases: number; sessionId: string }
