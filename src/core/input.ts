export type LogicalEdge = 'down' | 'up';
/** Physical owner is separate from audio gate life and from toggle logical hold. */
export class InputOwner {
  owner: string | null = null;
  toggleHold = false;
  private logicalHeld = false;
  private tapOwner = false;
  get held(): boolean { return this.owner !== null; }
  get logicalDown(): boolean { return this.logicalHeld; }
  constructor(toggleHold = false) { this.toggleHold = toggleHold; }
  down(token: string, options: { repeat?: boolean } = {}): LogicalEdge | null {
    if (options.repeat || this.owner !== null) return null;
    this.owner = token;
    if (!this.toggleHold) { this.logicalHeld = true; return 'down'; }
    this.logicalHeld = !this.logicalHeld; return this.logicalHeld ? 'down' : 'up';
  }
  up(token: string): LogicalEdge | null {
    if (this.owner !== token) return null;
    this.owner = null;
    if (this.tapOwner) { this.tapOwner = false; this.logicalHeld = false; return 'up'; }
    if (this.toggleHold) return null;
    this.logicalHeld = false; return 'up';
  }
  lostCapture(token: string): boolean { if (this.owner !== token) return false; this.cancel(); return true; }
  /** A matched tap (or unmatched down) does not open a virtual toggle hold. Physical up still rearms. */
  completeTap(): void { if (this.owner !== null) { this.tapOwner = true; this.logicalHeld = false; } }
  cancel(): void { this.owner = null; this.logicalHeld = false; this.tapOwner = false; }
  setToggleHold(value: boolean): void { this.cancel(); this.toggleHold = value; }
}
export function normalizeDOMTimestamp(timestamp: number, receiptMs: number, timeOrigin: number): number {
  const normalized = timestamp > 1e12 ? timestamp - timeOrigin : timestamp;
  if (!Number.isFinite(normalized) || Math.abs(receiptMs - normalized) > 5000) throw new Error('TIMESTAMP_DISCONTINUITY');
  return normalized;
}
export interface TransportEpoch { sessionId: string; startPerfMs: number; endPerfMs: number | null }
export function epochForTimestamp(performanceMs: number, epochs: TransportEpoch[]): string | null {
  return [...epochs].reverse().find(epoch => performanceMs >= epoch.startPerfMs && (epoch.endPerfMs === null || performanceMs < epoch.endPerfMs))?.sessionId ?? null;
}
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || typeof (target as Element).closest !== 'function') return false;
  return (target as Element).closest('input, textarea, select, [contenteditable="true"], [role="dialog"]') !== null;
}
