import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { anchorFor, assetRegistry, assets, assetUrl, AssetLoader, ASSET_BASE, getAsset, getEducationCard, manifest, normalizedAnchor } from '../src/assets';
import { backgroundCrop, flowerStage, sceneLayout, selectPose } from '../src/scene';
import type { SceneFrame } from '../src/scene';

const root = resolve('public/assets/night-thread');
const sha = (path: string) => createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex');
const fakeImage = (path: string) => {
  const asset = assets.find(item => ASSET_BASE + item.path === path || ASSET_BASE + item.pngFallbackPath === path)!;
  return { naturalWidth: asset.width, naturalHeight: asset.height, src: path } as HTMLImageElement;
};

describe('delivered asset contract', () => {
  it('preserves 92 exact logical assets, 17 WebPs, 75 SVGs and 17 optional PNGs', () => {
    expect(assets).toHaveLength(92);
    expect(new Set(assets.map(asset => asset.assetId)).size).toBe(92);
    expect(assets.filter(asset => asset.format === 'image/webp')).toHaveLength(17);
    expect(assets.filter(asset => asset.format === 'image/svg+xml')).toHaveLength(75);
    expect(assets.filter(asset => asset.pngFallbackPath)).toHaveLength(17);
    for (const asset of assets) {
      expect(statSync(resolve(root, asset.path)).size, asset.assetId).toBe(asset.bytes);
      expect(sha(asset.path), asset.assetId).toBe(asset.sha256);
      if (asset.pngFallbackPath) {
        expect(statSync(resolve(root, asset.pngFallbackPath)).size).toBe(asset.pngFallbackBytes);
        expect(sha(asset.pngFallbackPath)).toBe(asset.pngFallbackSha256);
      }
    }
    expect(assets.reduce((total, asset) => total + asset.bytes, 0)).toBe(1_916_295);
  });
  it('uses derivative crops instead of master pixel rectangles', () => {
    for (const scene of ['thread-bridge', 'crescent-greenhouse', 'folding-room', 'cloud-post'] as const) {
      expect(backgroundCrop(scene, true)).toEqual([64, 0, 1024, 768]);
      expect(backgroundCrop(scene, false)).toEqual([0, 60, 1152, 648]);
    }
  });
  it('recomputes each scene transfer budget from exactly its listed files', () => {
    const expected = {
      'thread-bridge': [1_021_110, 2_526_858],
      'crescent-greenhouse': [1_564_633, 3_384_578],
      'folding-room': [989_896, 2_475_674],
      'cloud-post': [1_022_222, 2_704_965],
    };
    for (const scene of Object.keys(expected) as (keyof typeof expected)[]) {
      const profile = manifest.loadProfiles[scene];
      const entries = profile.assetIds.map(id => getAsset(id));
      expect(entries.reduce((n, asset) => n + asset.bytes, 0)).toBe(expected[scene][0]);
      expect(entries.reduce((n, asset) => n + (asset.pngFallbackBytes ?? asset.bytes), 0)).toBe(expected[scene][1]);
      expect(entries.filter(asset => asset.category === 'background')).toHaveLength(1);
      expect(entries.some(asset => asset.category === 'education')).toBe(false);
    }
  });
  it('uses each actual foot anchor, including the different Somsae demo Y', () => {
    for (const asset of assets.filter(item => item.anchorNormalized)) {
      const actual = normalizedAnchor(asset);
      // The pack stores anchorPx at four decimals and normalized metadata at six.
      // Combined independent rounding can exceed half of one millionth (demo Y).
      expect(Math.abs(actual[0] - asset.anchorNormalized![0])).toBeLessThanOrEqual(.000001);
      expect(Math.abs(actual[1] - asset.anchorNormalized![1])).toBeLessThanOrEqual(.000001);
    }
    expect(anchorFor(getAsset('character.yeoul.hold'))).toEqual([273.5566, 480.9697]);
    expect(anchorFor(getAsset('object.greenhouse.flower_open'))).toEqual([272.3317, 477.7033]);
    expect(anchorFor(getAsset('somsae_count'))).toEqual([208.2297, 350.622]);
    expect(anchorFor(getAsset('somsae_demo'))).toEqual([208.2297, 357.0526]);
    expect(normalizedAnchor(getAsset('somsae_count'))[1]).not.toBe(normalizedAnchor(getAsset('somsae_demo'))[1]);
  });
  it('retains symbol shape distinctions and equal geometric units', () => {
    const onset = readFileSync(resolve(root, getAsset('bridge_onset').path), 'utf8');
    const release = readFileSync(resolve(root, getAsset('bridge_release').path), 'utf8');
    const knot = readFileSync(resolve(root, getAsset('bridge_tie_knot').path), 'utf8');
    expect(onset).toContain('fill="#E3B85D"');
    expect(release.match(/<circle[^>]+fill="none"/g)).toHaveLength(2);
    expect(knot).not.toContain('<circle');
    const [two, one] = ['greenhouse_container_2u', 'greenhouse_container_1u'].map(id => readFileSync(resolve(root, getAsset(id).path), 'utf8'));
    expect(two).toContain('x="24" y="56" width="128" height="96"');
    expect(one).toContain('x="24" y="56" width="64" height="96"');
    expect(getAsset('greenhouse_container_2u').width).toBe(176);
    expect(getAsset('greenhouse_container_1u').width).toBe(112);
    for (const id of ['room_floor_222', 'room_floor_33']) {
      const floor = readFileSync(resolve(root, getAsset(id).path), 'utf8');
      expect(floor.match(/y="78" width="80" height="64"/g)).toHaveLength(6);
    }
  });
  it('selects high contrast without moving hit anchors', () => {
    for (const id of ['bridge_onset', 'bridge_release', 'bridge_tie_knot', 'icon_wait']) {
      expect(assetUrl(id, true)).toContain('_hc.svg');
      expect(anchorFor(getAsset(id, true))).toEqual(anchorFor(getAsset(id)));
    }
    expect(() => getAsset('bridge_missing')).toThrow('Unknown');
  });
});

describe('scene scoped decoding and fallback', () => {
  it('loads just one profile and releases old scene images', async () => {
    const decoded: string[] = [];
    const images: HTMLImageElement[] = [];
    const loader = new AssetLoader(async path => { decoded.push(path); const image = fakeImage(path); images.push(image); return image; }, async () => true);
    await loader.loadScene('thread-bridge');
    expect(loader.ids().sort()).toEqual([...manifest.loadProfiles['thread-bridge'].assetIds].sort());
    expect(decoded.some(path => path.includes('png_fallbacks'))).toBe(false);
    expect(decoded.some(path => path.includes('/education/'))).toBe(false);
    const oldBackground = loader.get('scene_a_thread_bridge')!.image;
    await loader.loadScene('crescent-greenhouse');
    expect(oldBackground.src).toBe('');
    expect(loader.get('scene_a_thread_bridge')).toBeUndefined();
    expect(loader.ids().sort()).toEqual([...manifest.loadProfiles['crescent-greenhouse'].assetIds].sort());
    expect(loader.ids().some(id => /^greenhouse_flower_/.test(id))).toBe(false);
    expect(decoded.filter(path => path.includes('yeoul_idle'))).toHaveLength(1);
    loader.dispose(); expect(loader.ids()).toEqual([]);
    expect(images.every(image => image.src === '')).toBe(true);
  });
  it('decodes PNG only when capability detection says WebP is unavailable', async () => {
    const decoded: string[] = [];
    const loader = new AssetLoader(async path => { decoded.push(path); return fakeImage(path); }, async () => false);
    await loader.loadScene('cloud-post');
    expect(decoded.some(path => path.endsWith('.webp'))).toBe(false);
    expect(loader.get('scene_d_cloud_post_station')?.fallback).toBe(true);
    expect(decoded.filter(path => path.includes('scene_d_cloud_post_station'))).toHaveLength(1);
    loader.dispose();
  });
  it('falls back for only an individually failed WebP, in order, without parallel preload', async () => {
    const decoded: string[] = [];
    const loader = new AssetLoader(async path => {
      decoded.push(path);
      if (path.endsWith('yeoul_hold.webp')) throw new Error('simulated corrupt image');
      return fakeImage(path);
    }, async () => true);
    await loader.loadScene('thread-bridge');
    expect(decoded.filter(path => path.includes('png_fallbacks'))).toEqual([ASSET_BASE + 'png_fallbacks/characters/yeoul_hold.png']);
    expect(decoded.indexOf(ASSET_BASE + 'characters/yeoul_hold.webp')).toBeLessThan(decoded.indexOf(ASSET_BASE + 'png_fallbacks/characters/yeoul_hold.png'));
    expect(loader.get('character.yeoul.hold')?.fallback).toBe(true);
    loader.dispose();
  });
  it('rejects missing and wrong-size assets before count-in and clears staged images', async () => {
    const staged: HTMLImageElement[] = [];
    const loader = new AssetLoader(async path => {
      const image = fakeImage(path); staged.push(image);
      if (path.includes('bridge_onset.')) Object.defineProperty(image, 'naturalWidth', { value: 1 });
      return image;
    }, async () => true);
    await expect(loader.loadScene('thread-bridge')).rejects.toThrow('bridge_onset');
    expect(loader.ids()).toEqual([]);
    expect(staged.every(image => image.src === '')).toBe(true);
  });
  it('does not resurrect a scene when disposed during loading', async () => {
    let finish!: (webp: boolean) => void;
    const decoded: string[] = [];
    const loader = new AssetLoader(async path => { decoded.push(path); return fakeImage(path); }, () => new Promise(resolve => { finish = resolve; }));
    const pending = loader.loadScene('thread-bridge');
    loader.dispose(); finish(true); await pending;
    expect(loader.ids()).toEqual([]);
    expect(decoded).toEqual([]);
  });
  it('skips the obsolete profile when another scene replaces it during capability detection', async () => {
    let finishFirst!: (webp: boolean) => void;
    let tests = 0;
    const decoded: string[] = [];
    const loader = new AssetLoader(async path => { decoded.push(path); return fakeImage(path); }, () => ++tests === 1 ? new Promise(resolve => { finishFirst = resolve; }) : Promise.resolve(true));
    const obsolete = loader.loadScene('thread-bridge');
    await loader.loadScene('cloud-post');
    finishFirst(true); await obsolete;
    expect(loader.ids().sort()).toEqual([...manifest.loadProfiles['cloud-post'].assetIds].sort());
    expect(decoded.some(path => path.includes('scene_a_thread_bridge') || path.includes('/bridge_'))).toBe(false);
    expect(decoded.filter(path => path.includes('yeoul_idle'))).toHaveLength(1);
    loader.dispose();
  });
});

describe('rendering clock and education review boundaries', () => {
  it('keeps the target in the central 20% and bounds backing-store DPR', () => {
    for (const [w, h] of [[320, 240], [390, 292.5], [768, 576], [600, 337.5], [1200, 675]]) {
      const layout = sceneLayout(w, h, 3);
      expect(layout.targetX / layout.width).toBeGreaterThanOrEqual(.3);
      expect(layout.targetX / layout.width).toBeLessThanOrEqual(.7);
      expect(layout.dpr).toBe(2);
    }
  });
  it('holds the same pose across an internal tie boundary in all visual modes', () => {
    const frame: SceneFrame = { tick: 479, quarterBpm: 90, phase: 'play', holding: true, notes: [{ id: 'tie', onsetTick: 0, endTick: 960, kind: 'hold', tieBoundaryTicks: [480], status: 'active' }] };
    expect(selectPose(frame)).toBe('hold');
    expect(selectPose({ ...frame, tick: 480, reducedMotion: true, highContrast: true })).toBe('hold');
    expect(selectPose({ ...frame, tick: 481 })).toBe('hold');
    expect(selectPose({ ...frame, holding: false, tick: -119 })).toBe('prepare');
  });
  it('maps the four original flowers to four progress states without creating 8 states', () => {
    expect([0, .1, .4, .7, 1].map(p => flowerStage(p))).toEqual([0, 1, 2, 3, 3]);
    expect(flowerStage(.99, true)).toBe(2);
  });
  it('preserves all education approval flags and keeps advanced tick data out of basic text', () => {
    for (const concept of ['duration', 'tie', 'dot', 'dotted_rest', 'meter', 'tempo'] as const) {
      const basic = getEducationCard(concept);
      expect(basic.releaseApproved).toBe(false);
      expect(basic.notationReview).toBe('pending'); expect(basic.listeningReview).toBe('pending');
      expect(basic.previewNotice).toContain('검수 전');
      expect(basic.src).not.toContain('_advanced');
      expect(`${basic.description} ${basic.labels.join(' ')}`).not.toContain('tick');
      const advanced = getEducationCard(concept, true);
      expect(assetRegistry.has(advanced.assetId)).toBe(true);
    }
    expect(getEducationCard('tie').labels).toContain('발췌: 완전한 두 마디가 아님');
    expect(getEducationCard('tempo').labels).toContain('위 두 줄은 리듬 표기: 음 높이는 생략');
  });
});
