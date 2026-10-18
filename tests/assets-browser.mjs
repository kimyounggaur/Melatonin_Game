import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const base = process.env.BAMSIL_ASSET_URL || 'http://127.0.0.1:5287';
const output = path.resolve('output/playwright/assets');
await mkdir(output, { recursive: true });
const browserTemp = path.join(output, 'tmp');
await mkdir(browserTemp, { recursive: true });
process.env.TEMP = browserTemp; process.env.TMP = browserTemp;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
const page = await context.newPage();
const browserErrors = [];
page.on('requestfailed', request => browserErrors.push({ url: request.url(), failure: request.failure() }));
page.on('response', response => { if (response.status() >= 400) browserErrors.push({ url: response.url(), status: response.status() }); });
page.on('console', message => { if (message.type() === 'error') browserErrors.push({ console: message.text() }); });
await page.route('**/asset-check.html', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><meta charset="utf-8"><style>html,body{margin:0;background:#142a35}canvas{display:block;width:100vw;aspect-ratio:4/3}@media(orientation:landscape){canvas{aspect-ratio:16/9}}</style><canvas id="scene"></canvas></html>' }));
await page.goto(base + '/asset-check.html');
const results = [];
const screenshots = [];
const check = (name, condition, details) => { results.push({ name, passed: !!condition, details }); if (!condition) throw new Error(`${name}: ${JSON.stringify(details)}`); };
try {
  const codecs = await page.evaluate(async () => {
    const { assets, assetUrl, supportsWebP } = await import('/src/assets.ts');
    const decodes = await Promise.all(assets.filter(asset => asset.format === 'image/webp').map(async asset => {
      const image = new Image(); image.src = assetUrl(asset.assetId); await image.decode();
      const result = { id: asset.assetId, width: image.naturalWidth, height: image.naturalHeight, correct: image.naturalWidth === asset.width && image.naturalHeight === asset.height };
      image.src = ''; return result;
    }));
    return { capability: await supportsWebP(), decodes };
  });
  check('actual WebP browser decode: 17 primary files', codecs.decodes.length === 17 && codecs.decodes.every(x => x.correct), codecs);
  check('inline capability decode agrees with real WebP support', codecs.capability, codecs.capability);
  const scenes = ['thread-bridge', 'crescent-greenhouse', 'folding-room', 'cloud-post'];
  for (const [width, height] of [[390, 844], [844, 390]]) {
    await page.setViewportSize({ width, height });
    for (const scene of scenes) {
      const result = await page.evaluate(async ({ scene }) => {
        const { DreamScene } = await import('/src/scene.ts');
        const { manifest, SCENE_BACKGROUND } = await import('/src/assets.ts');
        window.dreamScene?.dispose();
        const canvas = document.getElementById('scene');
        const renderer = new DreamScene(canvas); window.dreamScene = renderer;
        await renderer.setScene(scene);
        const notes = scene === 'thread-bridge'
          ? [{ id: 'tied', onsetTick: 0, endTick: 960, kind: 'hold', tieBoundaryTicks: [480], status: 'active' }, { id: 'next', onsetTick: 1440, endTick: 1680, kind: 'tap', status: 'pending' }]
          : scene === 'crescent-greenhouse'
            ? [{ id: 'dot', onsetTick: 0, endTick: 720, kind: 'hold', status: 'active' }]
            : Array.from({ length: scene === 'folding-room' ? 6 : 4 }, (_, i) => ({ id: String(i), onsetTick: i * (scene === 'folding-room' ? 240 : 480), endTick: i * (scene === 'folding-room' ? 240 : 480) + 240, kind: 'tap', status: i === 0 ? 'success' : 'pending' }));
        renderer.render({ tick: scene === 'thread-bridge' ? 480 : 150, quarterBpm: 90, phase: 'play', holding: scene === 'thread-bridge' || scene === 'crescent-greenhouse', notes, meter: scene === 'folding-room' ? [6, 8] : [4, 4], grouping: scene === 'folding-room' ? [3, 3] : undefined });
        const rect = canvas.getBoundingClientRect();
        const pixel = canvas.getContext('2d').getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1).data;
        return { ids: renderer.loadedAssetIds(), diagnostics: renderer.assetDiagnostics(), expected: manifest.loadProfiles[scene].assetIds, background: SCENE_BACKGROUND[scene], width: rect.width, height: rect.height, backingWidth: canvas.width, dpr: window.devicePixelRatio, alpha: pixel[3] };
      }, { scene });
      check(`${scene}/${width}: exact current profile, real decoded primary files`, result.ids.length === result.expected.length && result.expected.every(id => result.ids.includes(id)) && result.diagnostics.every(x => !x.fallback), result);
      check(`${scene}/${width}: 4:3 or 16:9 canvas and capped DPR`, Math.abs(result.width / result.height - (width < height ? 4 / 3 : 16 / 9)) < .01 && result.backingWidth === Math.round(result.width * 2), { width: result.width, height: result.height, backingWidth: result.backingWidth, dpr: result.dpr });
      check(`${scene}/${width}: rendered opaque pixels`, result.alpha === 255, result.alpha);
      const file = path.join(output, `${scene}-${width}.png`); await page.locator('canvas').screenshot({ path: file }); screenshots.push(file);
    }
  }
  const hollow = await page.evaluate(async () => {
    window.dreamScene?.dispose();
    const { DreamScene } = await import('/src/scene.ts');
    const canvas = document.getElementById('scene');
    const renderer = new DreamScene(canvas); window.dreamScene = renderer;
    await renderer.setScene('thread-bridge');
    const ctx = canvas.getContext('2d');
    return [0, 480, 959, 960].map(tick => {
      const baseFrame = { tick, quarterBpm: 90, phase: 'play', holding: true };
      renderer.render(baseFrame);
      const x = (520 + (960 - tick) * .25) * canvas.width / 1000;
      const y = 296 * canvas.height / 562.5;
      const offsets = [-8, 0, 8].map(dx => dx * canvas.width / 1000);
      const before = offsets.map(dx => [...ctx.getImageData(Math.round(x + dx), Math.round(y), 1, 1).data]);
      renderer.render({ ...baseFrame, notes: [{ id: 'hold', onsetTick: 0, endTick: 960, kind: 'hold', tieBoundaryTicks: [480], status: 'active' }] });
      const after = offsets.map(dx => [...ctx.getImageData(Math.round(x + dx), Math.round(y), 1, 1).data]);
      return { tick, unchangedInnerPixels: JSON.stringify(before) === JSON.stringify(after), before, after };
    });
  });
  check('release hole stays clear of ribbon pixels before and at target arrival', hollow.every(x => x.unchangedInnerPixels), hollow);
  // Force only one real WebP URL to fail; its PNG alone must be requested afterward.
  const fallbackContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const fallbackPage = await fallbackContext.newPage();
  await fallbackPage.route('**/asset-check.html', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><canvas id="scene"></canvas>' }));
  await fallbackPage.route('**/characters/yeoul_hold.webp', route => route.abort('failed'));
  await fallbackPage.goto(base + '/asset-check.html');
  const fallback = await fallbackPage.evaluate(async () => {
    const { DreamScene } = await import('/src/scene.ts');
    const renderer = new DreamScene(document.getElementById('scene')); window.dreamScene = renderer;
    await renderer.setScene('thread-bridge');
    return renderer.assetDiagnostics();
  });
  check('individual WebP network/decode failure selects one real PNG', fallback.filter(x => x.fallback).length === 1 && fallback.find(x => x.id === 'character.yeoul.hold')?.selectedPath === 'png_fallbacks/characters/yeoul_hold.png', fallback);
  await fallbackContext.close();
  await page.evaluate(() => window.dreamScene?.dispose());
} catch (error) {
  results.push({ name: 'unexpected browser exception', passed: false, details: String(error) });
} finally {
  const report = { date: new Date().toISOString(), browser: 'headless Google Chrome via Playwright; dedicated workspace temporary profile', runtime: await browser.version(), physicalDevice: 'not run', listening: 'not run', results, screenshots, browserErrors };
  await writeFile('reports/assets-browser.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passed: results.filter(x => x.passed).length, total: results.length, report: 'reports/assets-browser.json', screenshots }, null, 2));
  await browser.close();
  if (results.some(x => !x.passed)) process.exitCode = 1;
}
