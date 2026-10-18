import { anchorFor, AssetLoader, getAsset, SCENE_BACKGROUND } from './assets';
import type { CropRect, SceneId } from './assets';

export interface SceneNote {
  id: string; onsetTick: number; endTick: number; kind: 'tap' | 'hold' | 'rest';
  tieBoundaryTicks?: readonly number[]; status?: 'pending' | 'active' | 'success' | 'miss';
}
export type ScenePose = 'idle' | 'prepare' | 'press' | 'hold' | 'release' | 'miss';
export interface SceneFrame {
  tick: number; quarterBpm: number;
  phase: 'idle' | 'count-in' | 'listen' | 'practice' | 'play' | 'paused' | 'outro' | 'result';
  holding: boolean; pose?: ScenePose; notes?: readonly SceneNote[];
  meter?: readonly [number, number]; grouping?: readonly number[];
  reducedMotion?: boolean; highContrast?: boolean;
  lastFeedback?: 'success' | 'miss' | null;
  /** Judge feedback position in this same transport, not a separate wall clock. */
  feedbackTick?: number;
  /** Hide meter grouping only for the explicitly selected listening-only quiz mode. */
  showGrouping?: boolean;
}
export interface SceneLayout { width: number; height: number; targetX: number; targetY: number; portrait: boolean; dpr: number }
export function sceneLayout(width: number, height: number, dpr = 1): SceneLayout {
  const portrait = width / height < 1.5;
  return { width: 1000, height: portrait ? 750 : 562.5, targetX: 520, targetY: portrait ? 398 : 296, portrait, dpr: Math.min(2, Math.max(1, dpr)) };
}
export function backgroundCrop(scene: SceneId, portrait: boolean): CropRect {
  const crops = getAsset(SCENE_BACKGROUND[scene]).cropRects;
  if (!crops) throw new Error('Scene background has no runtime crop');
  return portrait ? crops.mobile4x3 : crops.desktop16x9;
}
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const modulo = (n: number, d: number) => ((n % d) + d) % d;
export function flowerStage(progress: number, failed = false): 0 | 1 | 2 | 3 {
  return (failed ? Math.min(2, Math.floor(clamp(progress, 0, 1) * 3)) : Math.min(3, Math.ceil(clamp(progress, 0, 1) * 3))) as 0 | 1 | 2 | 3;
}
/** Identical elapsed time gives identical poses; tie boundaries are deliberately absent. */
export function selectPose(frame: SceneFrame): ScenePose {
  if (frame.pose) return frame.pose;
  if (frame.phase === 'paused') return 'idle';
  const feedbackAgeMs = frame.feedbackTick === undefined ? Infinity : (frame.tick - frame.feedbackTick) / 480 * 60000 / frame.quarterBpm;
  if (frame.lastFeedback === 'miss' && feedbackAgeMs >= 0 && feedbackAgeMs < 160) return 'miss';
  if (frame.holding) return feedbackAgeMs >= 0 && feedbackAgeMs < 80 ? 'press' : 'hold';
  const current = frame.notes?.find(note => note.kind === 'hold' && note.status === 'success' && frame.tick >= note.endTick && frame.tick - note.endTick < frame.quarterBpm / 60000 * 480 * 120);
  if (current) return 'release';
  const next = frame.notes?.find(note => note.kind !== 'rest' && note.onsetTick >= frame.tick && note.onsetTick - frame.tick <= 120);
  return next ? 'prepare' : 'idle';
}

/** Draw-only adapter. The audio master clock and judge own every musical decision. */
export class DreamScene {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly loader = new AssetLoader();
  private scene: SceneId = 'thread-bridge';
  private ready = false;
  private epoch = 0;
  private layout: SceneLayout = sceneLayout(400, 300);
  private hc = false;
  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('이 브라우저에서는 장면을 그릴 수 없어요.');
    this.ctx = ctx;
    canvas.setAttribute('aria-hidden', 'true');
  }
  async setScene(scene: SceneId): Promise<void> {
    if (this.scene === scene && this.ready) return;
    const epoch = ++this.epoch;
    this.ready = false;
    this.scene = scene;
    await this.loader.loadScene(scene);
    if (epoch === this.epoch) this.ready = true;
  }
  loadedAssetIds(): string[] { return this.loader.ids(); }
  assetDiagnostics() { return this.loader.ids().map(id => ({ id, selectedPath: this.loader.get(id)?.selectedPath, fallback: this.loader.get(id)?.fallback })); }
  dispose(): void { this.ready = false; ++this.epoch; this.loader.dispose(); }
  render(frame: SceneFrame): void {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width || this.canvas.clientWidth || 400);
    const height = Math.max(1, rect.height || this.canvas.clientHeight || width * .75);
    this.layout = sceneLayout(width, height, typeof devicePixelRatio === 'number' ? devicePixelRatio : 1);
    const pixelWidth = Math.round(width * this.layout.dpr), pixelHeight = Math.round(height * this.layout.dpr);
    if (this.canvas.width !== pixelWidth || this.canvas.height !== pixelHeight) { this.canvas.width = pixelWidth; this.canvas.height = pixelHeight; }
    const { ctx } = this;
    this.hc = frame.highContrast ?? false;
    ctx.setTransform(pixelWidth / this.layout.width, 0, 0, pixelHeight / this.layout.height, 0, 0);
    ctx.fillStyle = '#142A35'; ctx.fillRect(0, 0, 1000, this.layout.height);
    if (!this.ready) return;
    const background = this.loader.get(SCENE_BACKGROUND[this.scene]);
    const crop = backgroundCrop(this.scene, this.layout.portrait);
    if (background) ctx.drawImage(background.image, ...crop, 0, 0, 1000, this.layout.height);
    // Local shading preserves the artwork and leaves bright objects legible at small sizes.
    const shade = ctx.createLinearGradient(0, 0, 0, this.layout.height);
    shade.addColorStop(0, this.hc ? '#07111a88' : '#07111a22'); shade.addColorStop(1, this.hc ? '#07111aaa' : '#07111a33');
    ctx.fillStyle = shade; ctx.fillRect(0, 0, 1000, this.layout.height);
    if (this.scene === 'thread-bridge') this.threadBridge(frame);
    else if (this.scene === 'crescent-greenhouse') this.greenhouse(frame);
    else if (this.scene === 'folding-room') this.foldingRoom(frame);
    else this.cloudPost(frame);
    this.characters(frame);
    this.feedback(frame);
  }

  private draw(id: string, x: number, y: number, scale = 1, anchor?: string, alpha = 1, angle = 0): void {
    const item = this.loader.get(id, this.hc);
    if (!item) return;
    const pivot = anchorFor(item.asset, anchor);
    this.ctx.save(); this.ctx.globalAlpha = alpha; this.ctx.translate(x, y); this.ctx.rotate(angle);
    this.ctx.drawImage(item.image, -pivot[0] * scale, -pivot[1] * scale, item.asset.width * scale, item.asset.height * scale);
    this.ctx.restore();
  }
  private circle(x: number, y: number, radius: number, filled = false, color = '#E3B85D'): void {
    this.ctx.save(); this.ctx.strokeStyle = this.hc ? '#ffffff' : color; this.ctx.fillStyle = this.hc ? '#ffffff' : color;
    this.ctx.lineWidth = this.hc ? 5 : 3; this.ctx.beginPath(); this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    if (filled) this.ctx.fill(); else this.ctx.stroke(); this.ctx.restore();
  }
  private line(x1: number, y1: number, x2: number, y2: number, color = '#E3B85D', width = 3): void {
    this.ctx.strokeStyle = this.hc ? '#ffffff' : color; this.ctx.lineWidth = width;
    this.ctx.beginPath(); this.ctx.moveTo(x1, y1); this.ctx.lineTo(x2, y2); this.ctx.stroke();
  }
  private activeNote(frame: SceneFrame): SceneNote | undefined {
    return frame.notes?.find(note => note.onsetTick <= frame.tick && note.endTick > frame.tick);
  }
  private upcoming(frame: SceneFrame): SceneNote | undefined {
    return frame.notes?.find(note => note.kind !== 'rest' && note.endTick >= frame.tick && note.onsetTick - frame.tick <= 960);
  }
  private threadBridge(frame: SceneFrame): void {
    const { targetX: x, targetY: y, height } = this.layout;
    const barTicks = (frame.meter?.[0] ?? 4) * 4 / (frame.meter?.[1] ?? 4) * 480;
    const beat = Math.floor(modulo(frame.tick, barTicks) / 480);
    for (let i = 0; i < 4; i++) this.draw(i === beat && frame.phase !== 'idle' ? 'bridge_lantern_active' : 'bridge_lantern_idle', 365 + i * 95, y - 118, .48, 'hang');
    this.draw('bridge_spool', 145, y + 42, .66, 'ribbonExit');
    // Stop before the target interior as well as before moving release markers.
    this.line(145, y + 42, x - 38, y + 5, frame.holding ? '#65A69A' : '#E3B85D99', frame.holding ? 5 : 2);
    // The barline is a layer behind the continuous ribbon and is never an input edge.
    for (let b = Math.max(1, Math.floor((frame.tick - 480) / barTicks)); b * barTicks < frame.tick + 1700; b++) {
      const bx = x + (b * barTicks - frame.tick) * .25;
      if (bx > 50 && bx < 960) this.draw('bridge_bar_pillar', bx, y, .62, 'barline', .8);
    }
    this.draw('bridge_needle_eye', x, y, .95, 'hit');
    const notes = frame.notes?.filter(note => note.kind !== 'rest' && note.endTick > frame.tick - 420 && note.onsetTick < frame.tick + 1000).slice(0, 3) ?? [];
    for (const note of notes) {
      const onsetX = x + (note.onsetTick - frame.tick) * .25;
      const endX = x + (note.endTick - frame.tick) * .25;
      const failed = note.status === 'miss';
      if (note.kind === 'hold') {
        const left = Math.max(0, onsetX), right = Math.min(1000, endX - 22);
        // Clip at release inner radius, so no ribbon pixels run behind its empty center.
        this.ctx.save(); this.ctx.beginPath(); this.ctx.rect(left, y - 18, Math.max(0, right - left), 36); this.ctx.clip();
        if (failed) this.draw('bridge_ribbon_broken', Math.max(left, x), y, .9, 'break');
        else {
          const tile = this.loader.get('bridge_ribbon_tile');
          if (tile) for (let tx = onsetX; tx < right; tx += 120) this.ctx.drawImage(tile.image, tx, y - 30, 120, 60);
        }
        this.ctx.restore();
        for (const boundary of note.tieBoundaryTicks ?? []) {
          const bx = x + (boundary - frame.tick) * .25;
          if (bx > 0 && bx < 1000) this.draw('bridge_tie_knot', bx, y, .64, 'boundary', failed ? .5 : 1);
        }
        if (endX > 0 && endX < 980) this.draw('bridge_release', endX, y, .72, 'hit', failed ? .55 : 1);
      }
      if (onsetX > 0 && onsetX < 980) this.draw('bridge_onset', onsetX, y, .72, 'hit', failed ? .55 : 1);
    }
    const next = this.upcoming(frame);
    if (next?.kind === 'hold') this.holdGauge(next, frame, 340, height - 112, 380);
    else if (!notes.length) {
      this.circle(x, y, 23, false, '#F3E8C9');
      if (frame.phase !== 'idle') this.draw('icon_wait', 810, height - 105, .9, 'center');
    }
  }

  /** Static full-length preview remains visible from onset even when a scrolling end was distant. */
  private holdGauge(note: SceneNote, frame: SceneFrame, startX: number, y: number, maxWidth: number): void {
    const units = Math.max(1, (note.endTick - note.onsetTick) / 240);
    const cell = Math.min(58, maxWidth / units), width = cell * units;
    const progress = clamp((frame.tick - note.onsetTick) / (note.endTick - note.onsetTick), 0, 1);
    this.ctx.save(); this.ctx.fillStyle = '#10232ee6'; this.ctx.strokeStyle = this.hc ? '#ffffff' : '#E3B85D'; this.ctx.lineWidth = 2;
    this.ctx.fillRect(startX - 24, y - 31, width + 48, 62); this.ctx.strokeRect(startX - 24, y - 31, width + 48, 62);
    // Gap before end marker preserves its transparent center.
    this.line(startX + 10, y, startX + width - 18, y, '#E3B85D66', 7);
    if (frame.holding || frame.phase === 'listen') this.line(startX + 10, y, startX + Math.max(10, width * progress - 18), y, '#65A69A', 9);
    for (let i = 1; i < units; i++) this.line(startX + i * cell, y - 11, startX + i * cell, y + 11, '#E3B85D88', 2);
    this.circle(startX, y, 11, true); this.circle(startX + width, y, 16);
    for (const boundary of note.tieBoundaryTicks ?? []) {
      const bx = startX + (boundary - note.onsetTick) / (note.endTick - note.onsetTick) * width;
      this.draw('bridge_tie_knot', bx, y, .45, 'boundary');
    }
    this.ctx.restore();
  }
  private greenhouse(frame: SceneFrame): void {
    const { targetX: x, targetY: y, height } = this.layout;
    const active = this.activeNote(frame), next = this.upcoming(frame);
    const resting = active?.kind === 'rest';
    const hold = active?.kind === 'hold' ? active : undefined;
    const demo = frame.phase === 'listen';
    const progress = hold ? clamp((frame.tick - hold.onsetTick) / (hold.endTick - hold.onsetTick), 0, 1) : 0;
    const stage = hold && (frame.holding || demo) ? flowerStage(progress, hold.status === 'miss') : 0;
    const pose = ['closed', 'opening_1', 'opening_2', 'open'][stage];
    this.draw(`object.greenhouse.flower_${pose}`, x, y + 140, .78);
    // One shared scale: 128×96 liquid and 64×96 liquid remain exactly 2:1.
    const containerScale = .78;
    this.draw('greenhouse_container_2u', 280, y + 144, containerScale, 'base');
    this.draw('greenhouse_container_1u', 760, y + 144, containerScale, 'base');
    if (resting) {
      this.draw('greenhouse_rest_cover', x, y + 5, .82, 'target');
      this.draw('icon_wait', x, y - 95, .7, 'center');
    }
    const barTicks = (frame.meter?.[0] ?? 4) * 4 / (frame.meter?.[1] ?? 4) * 480;
    const count = Math.round(barTicks / 240);
    const currentUnit = Math.floor(modulo(frame.tick, barTicks) / 240);
    for (let i = 0; i < count; i++) {
      const cx = 500 + (i - (count - 1) / 2) * 58;
      this.draw(i === currentUnit && frame.phase !== 'idle' ? 'greenhouse_dew_active' : 'greenhouse_dew_idle', cx, y - 230, .56, 'center', resting && i < 3 ? .68 : 1);
    }
    if (next?.kind === 'hold') {
      this.draw('greenhouse_time_strip_3u', 500 - 96 * .95, height - 100, .95, 'start');
      // A separate non-flashing cursor progresses uniformly over the equal three cells.
      this.circle(500 - 91 + progress * 182, height - 100, 9, true, '#F3E8C9');
    } else if (next?.kind === 'tap') {
      const until = next.onsetTick - frame.tick;
      const cy = y - clamp(until / 960, 0, 1) * 100;
      this.circle(x, cy, 18, true);
    }
    if (!resting) this.circle(x, y, 28);
  }
  private foldingRoom(frame: SceneFrame): void {
    const { targetX: x, targetY: y, height } = this.layout;
    const compound = frame.grouping?.[0] === 3 || frame.meter?.[1] === 8;
    const suffix = compound ? '33' : '222';
    const unit = Math.floor(modulo(frame.tick, 1440) / 240);
    const groupSize = compound ? 3 : 2;
    const activeGroup = Math.floor(unit / groupSize);
    const floorScale = 1.22;
    const start = 205, fy = y + 80;
    const idle = frame.phase === 'idle' || frame.phase === 'result';
    // The floor already includes its grouped curves. Do not superimpose another
    // complete bracket/hinge set and accidentally show 4 or 6 large groups.
    if (idle && frame.showGrouping !== false) this.draw(`room_floor_${suffix}`, start, fy, floorScale, 'floorOrigin');
    else if (frame.showGrouping !== false) this.draw(`room_brackets_${suffix}`, start, fy - 12, floorScale, 'floorOrigin');
    for (let i = 0; i < 6; i++) {
      const cx = start + (i + .5) * 80 * floorScale;
      const current = i === unit && frame.phase !== 'idle';
      const movingGroup = Math.floor(i / groupSize) === activeGroup && frame.showGrouping !== false;
      const fold = !frame.reducedMotion && movingGroup ? Math.sin(modulo(frame.tick, groupSize * 240) / (groupSize * 240) * Math.PI) : 0;
      const lift = fold * 12;
      if (!idle || frame.showGrouping === false) this.draw(current ? 'room_tile_active' : 'room_tile_idle', cx, fy + 33 - lift, floorScale, 'center', 1, -fold * .025);
    }
    this.circle(x, y - 8, 30);
    for (const note of (frame.notes ?? []).filter(note => note.kind !== 'rest' && note.onsetTick >= frame.tick - 160 && note.onsetTick < frame.tick + 960).slice(0, 4)) {
      const nx = x + (note.onsetTick - frame.tick) * .3;
      this.circle(nx, y - 8, 17, true, note.status === 'miss' ? '#D77467' : '#E3B85D');
    }
    // Group indicators follow 2+2+2 or 3+3; six underlying units stay unchanged.
    if (frame.showGrouping !== false) {
      for (let i = 0; i < 6 / groupSize; i++) this.circle(440 + i * 65, height - 78, i === activeGroup ? 11 : 7, i === activeGroup);
    }
  }
  private cloudPost(frame: SceneFrame): void {
    const { targetX: x, targetY: y, height } = this.layout;
    this.draw('post_counter', x, y + 16, 1.0, 'window');
    const notes = (frame.notes ?? []).filter(note => note.kind !== 'rest' && note.onsetTick > frame.tick - 390 && note.onsetTick < frame.tick + 1000).slice(0, 3);
    for (const note of notes) {
      const age = frame.tick - note.onsetTick;
      const success = note.status === 'success' || (frame.phase === 'listen' && age >= 0);
      const phaseMs = age / 480 * 60000 / frame.quarterBpm;
      const id = success ? phaseMs < 120 ? 'post_letter_folded' : 'post_letter_success_star' : 'post_letter_idle';
      const nx = success ? x : x + (note.onsetTick - frame.tick) * .35;
      const ny = y - (success && !frame.reducedMotion ? clamp(phaseMs - 120, 0, 250) * .15 : 0);
      this.draw(id, nx, ny, .48, id === 'post_letter_success_star' ? 'center' : 'hit', note.status === 'miss' ? .4 : 1);
    }
    this.circle(x, y, 34);
    const barTick = modulo(frame.tick, 1920);
    for (let i = 0; i < 4; i++) {
      const current = Math.floor(barTick / 480) === i;
      this.circle(405 + i * 64, height - 98, current ? 11 : 7, current);
    }
    const active = this.activeNote(frame);
    if (active?.kind === 'rest') this.draw('icon_wait', 760, y + 110, .7, 'center');
  }
  private characters(frame: SceneFrame): void {
    const { height, portrait } = this.layout;
    const pose = selectPose(frame);
    const active = frame.phase !== 'idle' && frame.phase !== 'paused' && frame.phase !== 'result';
    const sway = !frame.reducedMotion && active ? Math.sin(frame.tick / 480 * Math.PI) * .009 : 0;
    const squash = !frame.reducedMotion && pose === 'press' ? .014 : 0;
    const base = height - 28;
    this.ctx.save(); this.ctx.translate(110, base); this.ctx.scale(1 + squash, 1 - squash);
    this.draw(`character.yeoul.${pose}`, 0, 0, portrait ? .70 : .61, undefined, 1, sway);
    this.ctx.restore();
    const next = this.upcoming(frame);
    const prepare = next && next.onsetTick >= frame.tick && next.onsetTick - frame.tick <= 120;
    const bird = frame.phase === 'count-in' ? 'somsae_count' : frame.phase === 'listen' || prepare ? 'somsae_demo' : 'somsae_encourage';
    // Each pose's individual anchorPx includes demo's distinct foot Y.
    this.draw(bird, 865, base - 4, portrait ? .46 : .39, undefined, 1, frame.reducedMotion ? 0 : prepare ? -.075 : sway * .7);
  }
  private feedback(frame: SceneFrame): void {
    if (!frame.lastFeedback) return;
    // Callers may own the feedback lifetime and simply clear lastFeedback.
    const age = frame.feedbackTick === undefined ? 0 : (frame.tick - frame.feedbackTick) / 480 * 60000 / frame.quarterBpm;
    if (age < 0 || age > 350) return;
    this.draw(`feedback_knot_${frame.lastFeedback}`, 520, this.layout.targetY - 85, .48, 'center', age < 200 ? 1 : (350 - age) / 150);
  }
}
