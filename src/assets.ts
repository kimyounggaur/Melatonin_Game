import runtimeManifest from '../reference/assets/night_thread_mobile_runtime_v1/runtime_manifest.json';
import koreanLabels from '../reference/assets/night_thread_mobile_runtime_v1/ui/labels.ko.json';

export type SceneId = 'thread-bridge' | 'crescent-greenhouse' | 'folding-room' | 'cloud-post';
export type Point = readonly [number, number];
export type CropRect = readonly [number, number, number, number];
export interface Asset {
  assetId: string; category: string; scene: string; state: string; usage: string;
  path: string; format: string; width: number; height: number; bytes: number; sha256: string;
  anchorPx?: Point; anchorNormalized?: Point; anchors?: Readonly<Record<string, Point>>;
  cropRects?: { mobile4x3: CropRect; desktop16x9: CropRect };
  pngFallbackPath?: string; pngFallbackBytes?: number; pngFallbackSha256?: string;
  releaseApproved: boolean; notationReview: string; listeningReview: string;
}
export const manifest = runtimeManifest;
export const labels = koreanLabels;
export const ASSET_BASE = '/assets/night-thread/';
export const assets = runtimeManifest.assets as unknown as readonly Asset[];
export const assetRegistry: ReadonlyMap<string, Asset> = new Map(assets.map(asset => [asset.assetId, asset]));
export const SCENE_BACKGROUND: Record<SceneId, string> = {
  'thread-bridge': 'scene_a_thread_bridge',
  'crescent-greenhouse': 'scene_b_crescent_greenhouse',
  'folding-room': 'scene_c_folding_room',
  'cloud-post': 'scene_d_cloud_post_station',
};

export function getAsset(assetId: string, highContrast = false): Asset {
  const id = highContrast && assetRegistry.has(`${assetId}_hc`) ? `${assetId}_hc` : assetId;
  const asset = assetRegistry.get(id);
  if (!asset) throw new Error(`Unknown night-thread asset: ${id}`);
  return asset;
}
export function assetUrl(assetId: string, highContrast = false): string {
  return ASSET_BASE + getAsset(assetId, highContrast).path;
}

/** Explicit anchor names win. Never replace character foot pivots with their image centers. */
export function anchorFor(asset: Asset, name?: string): Point {
  if (name && asset.anchors?.[name]) return asset.anchors[name];
  if (asset.anchorPx) return asset.anchorPx;
  if (asset.anchors) {
    const first = Object.values(asset.anchors)[0];
    if (first) return first;
  }
  return [asset.width / 2, asset.height / 2];
}
export function normalizedAnchor(asset: Asset, name?: string): Point {
  const anchor = anchorFor(asset, name);
  return [anchor[0] / asset.width, anchor[1] / asset.height];
}

export type EducationConcept = keyof typeof koreanLabels.education;
export function getEducationCard(concept: EducationConcept, advanced = false) {
  const copy = koreanLabels.education[concept];
  const candidate = `education_${concept}${advanced ? '_advanced' : ''}`;
  const assetId = assetRegistry.has(candidate) ? candidate : `education_${concept}`;
  const asset = getAsset(assetId);
  return {
    assetId, src: assetUrl(assetId), title: copy.title,
    description: advanced ? copy.advancedDescription : copy.description,
    labels: copy.labels.filter(label => advanced || !('advancedOnly' in label && label.advancedOnly)).map(label => label.text),
    previewNotice: '교육자·청음 검수 전 개발 프리뷰',
    notationReview: asset.notationReview, listeningReview: asset.listeningReview,
    releaseApproved: asset.releaseApproved,
  };
}

export class AssetLoadError extends Error {
  constructor(public readonly assetId: string, public readonly path: string) {
    super(`자산을 준비하지 못했어요: ${assetId} (${path})`);
    this.name = 'AssetLoadError';
  }
}
export interface LoadedAsset { asset: Asset; image: HTMLImageElement; selectedPath: string; fallback: boolean }
export type ImageDecoder = (src: string) => Promise<HTMLImageElement>;
export const decodeImage: ImageDecoder = async src => {
  const image = new Image();
  image.decoding = 'async';
  image.src = src;
  if (typeof image.decode === 'function') await image.decode();
  else await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = reject; });
  if (!image.naturalWidth || !image.naturalHeight) throw new Error('Image has no decoded pixels');
  return image;
};

let webpSupport: Promise<boolean> | undefined;
/** Test one tiny inline WebP, then independently fall back if an individual asset fails decode. */
export function supportsWebP(): Promise<boolean> {
  webpSupport ??= decodeImage('data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA')
    .then(image => image.naturalWidth === 1).catch(() => false);
  return webpSupport;
}

/** Only one scene profile is resident. Education diagrams are requested individually by DOM. */
export class AssetLoader {
  private loaded = new Map<string, LoadedAsset>();
  private epoch = 0;
  constructor(private readonly decoder: ImageDecoder = decodeImage, private readonly webpTest: () => Promise<boolean> = supportsWebP) {}
  get(id: string, highContrast = false): LoadedAsset | undefined { return this.loaded.get(getAsset(id, highContrast).assetId); }
  ids(): string[] { return [...this.loaded.keys()]; }
  async loadScene(scene: SceneId): Promise<void> {
    const epoch = ++this.epoch;
    const ids: readonly string[] = manifest.loadProfiles[scene].assetIds;
    const wanted = new Set(ids);
    this.releaseExcept(wanted);
    const webp = await this.webpTest();
    if (epoch !== this.epoch) return;
    // New assets remain private until the complete profile is decoded; no partial count-in.
    const staged = new Map<string, LoadedAsset>();
    const results = await Promise.allSettled(ids.filter(id => !this.loaded.has(id)).map(async id => {
      const asset = getAsset(id);
      let path = !webp && asset.pngFallbackPath ? asset.pngFallbackPath : asset.path;
      let image: HTMLImageElement;
      try { image = await this.decoder(ASSET_BASE + path); }
      catch {
        if (!asset.pngFallbackPath || path === asset.pngFallbackPath) throw new AssetLoadError(id, path);
        path = asset.pngFallbackPath;
        try { image = await this.decoder(ASSET_BASE + path); }
        catch { throw new AssetLoadError(id, path); }
      }
      if (image.naturalWidth !== asset.width || image.naturalHeight !== asset.height) {
        image.src = '';
        throw new AssetLoadError(id, path);
      }
      staged.set(id, { asset, image, selectedPath: path, fallback: path !== asset.path });
    }));
    const failure = results.find(result => result.status === 'rejected');
    if (epoch !== this.epoch || failure) {
      for (const value of staged.values()) value.image.src = '';
      if (failure?.status === 'rejected') throw failure.reason;
      return;
    }
    for (const [id, value] of staged) this.loaded.set(id, value);
  }
  private releaseExcept(wanted: Set<string>): void {
    for (const [id, value] of this.loaded) {
      if (!wanted.has(id)) { value.image.src = ''; this.loaded.delete(id); }
    }
  }
  dispose(): void { ++this.epoch; this.releaseExcept(new Set()); }
}
