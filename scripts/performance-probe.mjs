import { chromium } from '@playwright/test';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const cwd = process.cwd();
const output = path.resolve('output/playwright/performance');
await mkdir(path.join(output, 'tmp'), { recursive: true });
process.env.TEMP = path.join(output, 'tmp'); process.env.TMP = path.join(output, 'tmp');
const manifest = JSON.parse(await readFile('reference/assets/night_thread_mobile_runtime_v1/runtime_manifest.json', 'utf8'));
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
const transitionIds = Array.from({ length: 20 }, (_, i) => ['L02', 'L04', 'L06', 'L08'][i % 4]);
const failures = [];
const percent = (values, q) => values.length ? [...values].sort((a, b) => a - b)[Math.min(values.length - 1, Math.floor(values.length * q))] : null;
const sum = values => values.reduce((a, b) => a + b, 0);

async function waitCanvas(page, expectedScreen) {
  await page.waitForFunction(screen => {
    const status = window.__nightThread?.status();
    const canvas = document.querySelector('canvas');
    return !!canvas && canvas.width > 300 && (!status || status.screen === screen && status.assetDiagnostics.length > 0);
  }, expectedScreen, { timeout: 15000 });
}
async function resourceSummary(page) {
  return page.evaluate(() => {
    const entries = [...performance.getEntriesByType('navigation'), ...performance.getEntriesByType('resource')];
    const resources = entries.filter(entry => entry.name.startsWith(location.origin)).map(entry => ({
      path: new URL(entry.name).pathname, type: entry.initiatorType ?? 'navigation',
      transferSize: entry.transferSize ?? 0, encodedBodySize: entry.encodedBodySize ?? 0,
      decodedBodySize: entry.decodedBodySize ?? 0, durationMs: entry.duration,
    }));
    const total = key => resources.reduce((n, entry) => n + entry[key], 0);
    return { requests: resources.length, transferBytesIncludingResponseHeaders: total('transferSize'), encodedBodyBytes: total('encodedBodySize'), decodedBodyBytes: total('decodedBodySize'), resources };
  });
}
async function sampleFrames(page, milliseconds = 5000) {
  const raw = await page.evaluate(duration => new Promise(resolve => {
    const start = performance.now(), stamps = [], voices = [], frameAssets = [];
    function sample(now) {
      stamps.push(now);
      if (stamps.length % 15 === 0) {
        const state = window.__nightThread?.status();
        if (state) { voices.push(state.voices); frameAssets.push(state.assetDiagnostics.length); }
      }
      if (now - start < duration) requestAnimationFrame(sample);
      else resolve({ startMs: start, endMs: now, timestamps: stamps, voices, assetCounts: frameAssets,
        longTasks: (window.__performanceLongTasks ?? []).filter(task => task.startTime >= start && task.startTime < now),
        memory: performance.memory ? { usedJSHeapSize: performance.memory.usedJSHeapSize, totalJSHeapSize: performance.memory.totalJSHeapSize, jsHeapSizeLimit: performance.memory.jsHeapSizeLimit } : null,
        inspector: !!window.__nightThread,
      });
    }
    requestAnimationFrame(sample);
  }), milliseconds);
  const intervals = raw.timestamps.slice(1).map((time, i) => time - raw.timestamps[i]);
  const mean = sum(intervals) / intervals.length;
  return {
    durationMs: raw.endMs - raw.startMs, sampledFrames: intervals.length,
    meanFrameIntervalMs: mean, p50FrameIntervalMs: percent(intervals, .5), p95FrameIntervalMs: percent(intervals, .95), maxFrameIntervalMs: Math.max(...intervals),
    estimatedFramesPerSecondFromMean: 1000 / mean, intervalsOver33_34Ms: intervals.filter(value => value > 33.34).length,
    longTaskCount: raw.longTasks.length, longTasks: raw.longTasks,
    inspectorAvailable: raw.inspector, observedMaxVoices: raw.voices.length ? Math.max(...raw.voices) : null,
    observedAssetCounts: [...new Set(raw.assetCounts)], approximateJSHeap: raw.memory,
    note: 'Desktop headless requestAnimationFrame measurements while local game renderer and audio scheduler run; sampled inspector counters only every 15 frames. Shared-host load affects these figures. JS heap is not GPU/decoded-image memory.',
  };
}

async function probe(label, url) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  await context.addInitScript(() => {
    window.__performanceLongTasks = [];
    try { new PerformanceObserver(list => { for (const task of list.getEntries()) window.__performanceLongTasks.push({ startTime: task.startTime, durationMs: task.duration }); }).observe({ type: 'longtask', buffered: true }); } catch {}
  });
  const page = await context.newPage();
  const exceptions = [], networkFailures = [], encodings = [];
  page.on('pageerror', error => exceptions.push(String(error)));
  page.on('requestfailed', request => networkFailures.push({ url: request.url(), failure: request.failure() }));
  page.on('response', response => {
    if (response.url().endsWith('.js') || response.url().endsWith('.css')) encodings.push({ path: new URL(response.url()).pathname, contentEncoding: response.headers()['content-encoding'] ?? 'identity (uncompressed HTTP response)' });
  });
  const began = new Date().toISOString();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await waitCanvas(page, 'home');
  const homeResources = await resourceSummary(page);
  const homeFrames = await sampleFrames(page, 5000);
  await page.locator('[data-action="unlock"]').click();
  await page.locator('.dream-grid').waitFor(); await waitCanvas(page, 'map');
  const mapResources = await resourceSummary(page);
  await page.locator('[data-action="lesson:L02"]').first().click();
  await page.locator('.lesson-description').waitFor(); await waitCanvas(page, 'lesson');
  const lessonResources = await resourceSummary(page);
  await page.locator('[data-action="listen"]').click();
  await page.locator('#action-pad').waitFor(); await waitCanvas(page, 'game');
  const listenFrames = await sampleFrames(page, 5000);
  const listenResources = await resourceSummary(page);
  const liveStatus = await page.evaluate(() => { const status = window.__nightThread?.status(); return status ? { screen: status.screen, mode: status.mode, voices: status.voices, pending: status.pending, assetIds: status.assetDiagnostics.map(item => item.id), audioNow: status.audioNow, epoch: status.epoch, mappingMethod: status.mappingMethod } : null; });
  await page.screenshot({ path: path.join(output, `${label}-L02-listen.png`), fullPage: true });

  const transitions = [];
  for (let i = 0; i < transitionIds.length; i++) {
    await page.locator('[data-action="map"]').first().click();
    await page.locator('.dream-grid').waitFor(); await waitCanvas(page, 'map');
    const id = transitionIds[i], scene = manifest.levelSceneBindings[id];
    await page.locator(`[data-action="lesson:${id}"]`).first().click();
    await page.locator('.lesson-description').waitFor(); await waitCanvas(page, 'lesson');
    const state = await page.evaluate(() => {
      const s = window.__nightThread?.status();
      return s ? { screen: s.screen, selectedId: s.selectedId, assetIds: s.assetDiagnostics.map(item => item.id).sort(), voices: s.voices, pending: s.pending } : null;
    });
    const expected = [...manifest.loadProfiles[scene].assetIds].sort();
    const exactProfile = state ? JSON.stringify(state.assetIds) === JSON.stringify(expected) : null;
    transitions.push({ transition: i + 1, level: id, scene, assetCount: state?.assetIds.length ?? null, exactCurrentProfile: exactProfile, voices: state?.voices ?? null, pending: state?.pending ?? null, assetIds: state?.assetIds ?? null });
    if (state && (!exactProfile || state.voices > 8)) failures.push(`${label} transition ${i + 1}: stale profile or voice limit`);
  }
  const endResources = await resourceSummary(page);
  const result = { label, url, began, viewport: { width: 390, height: 844, deviceScaleFactor: 3, canvasDprCap: 2 },
    phases: { home: { resources: homeResources, frameSample: homeFrames }, map: { resources: mapResources }, L02Lesson: { resources: lessonResources }, L02Listen: { resources: listenResources, frameSample: listenFrames, developmentInspectorStatus: liveStatus } },
    longTasksWholeRun: await page.evaluate(() => window.__performanceLongTasks),
    transitions, finalResources: endResources, contentEncodings: encodings, exceptions, networkFailures,
    firstPlayableUnder8MillionBytes: listenResources.transferBytesIncludingResponseHeaders < 8_000_000,
    profileAccumulation: liveStatus ? transitions.every(item => item.exactCurrentProfile) ? '20/20 exact scene profiles; no accumulation observed in registry' : 'failed' : 'production inspector intentionally absent; not directly observable here; development run and asset loader tests provide profile evidence',
  };
  if (exceptions.length || networkFailures.length) failures.push(`${label}: unexpected browser or network errors`);
  if (listenFrames.observedMaxVoices !== null && listenFrames.observedMaxVoices > 8) failures.push(`${label}: max voices exceeded 8`);
  await context.close();
  return result;
}

async function diskFiles(folder) {
  const result = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) result.push(...await diskFiles(file));
    else result.push({ path: path.relative(cwd, file).replaceAll('\\', '/'), bytes: (await stat(file)).size });
  }
  return result;
}

const report = { date: new Date().toISOString(), browser: await browser.version(), environment: 'Desktop headless Google Chrome on shared Windows host; no physical mobile device, direct listening, GPU profiling, or network throttling', runs: [], buildOutput: [], failures };
try {
  report.buildOutput = (await diskFiles(path.resolve('dist/assets'))).filter(file => !file.path.includes('/night-thread/'));
  report.runs.push(await probe('production', process.env.NIGHT_THREAD_PRODUCTION_URL ?? 'http://127.0.0.1:4286'));
  report.runs.push(await probe('development', process.env.NIGHT_THREAD_DEVELOPMENT_URL ?? 'http://127.0.0.1:5286'));
} catch (error) { failures.push(String(error)); }
finally {
  await browser.close();
  await writeFile('reports/performance.json', JSON.stringify(report, null, 2));
  const lines = [
    '# P22 로컬 성능 측정', '',
    `측정: ${report.date}. Chrome ${report.browser}. ${report.environment}.`, '',
    '실제 UI에서 홈 → 소리 켜기 → 꿈 지도 → L02 수업 → 듣기를 진행했다. 별도 headless Chrome 임시 프로필을 사용했고 다른 게임·사용자 브라우저는 조작하지 않았다.', '',
    '| 실행 | 첫 playable 누적 HTTP 전송 bytes | 홈 mean / p95 / max ms | L02 듣기 mean / p95 / max ms | 듣기 long tasks | 관측 max voices |',
    '|---|---:|---|---|---:|---:|',
    ...report.runs.map(run => { const h = run.phases.home.frameSample, p = run.phases.L02Listen.frameSample, f = x => x.toFixed(2); return `| ${run.label} | ${run.phases.L02Listen.resources.transferBytesIncludingResponseHeaders.toLocaleString('en-US')} | ${f(h.meanFrameIntervalMs)} / ${f(h.p95FrameIntervalMs)} / ${f(h.maxFrameIntervalMs)} | ${f(p.meanFrameIntervalMs)} / ${f(p.p95FrameIntervalMs)} / ${f(p.maxFrameIntervalMs)} | ${p.longTaskCount} | ${p.observedMaxVoices ?? 'production getter 없음'} |`; }),
    '',
    ...report.runs.map(run => `- ${run.label}: 8,000,000B 초기 전송 목표 ${run.firstPlayableUnder8MillionBytes ? '통과' : '실패'}. ${run.profileAccumulation}.`), '',
    'Resource Timing의 transferSize는 응답 헤더를 포함하며, encodedBodySize/decodedBodySize와 개별 URL은 JSON에 남겼다. Vite preview의 실제 HTTP content-encoding도 기록했다. build가 출력하는 gzip 크기는 추정치이고 localhost preview가 identity로 제공했다면 그 수치를 압축 실측 전송량으로 부르지 않는다. 개발 서버의 ES module/AJV 요청 수치는 production 빌드와 구별한다.', '',
    '각 프레임 표본은 약 5초다. requestAnimationFrame 간격과 longtask를 측정했으며 화면 픽셀 GPU 렌더 시간·실제 터치 지연을 측정한 것은 아니다. 성능 수치는 이 공유 데스크톱의 headless 실행 결과이며 iPhone/Android나 브라우저별 보증이 아니다. performance.memory가 있으면 JS heap만 기록하며, 이 값으로 디코드 이미지/GPU 메모리 상한을 주장하지 않는다.', '',
    '20회 장면 전환은 L02→L04→L06→L08을 다섯 번 순환했다. development getter로 각 전환 뒤 현재 loadProfile의 정확한 ID 집합과 voice 수를 읽었다. production에서 개발 getter가 제거된 것은 의도된 경계이므로 profile 증거는 development와 기존 자산 로더 단위·브라우저 검증을 함께 사용한다.', '',
    `실행 오류: ${failures.length ? failures.join('; ') : '없음'}.`, '',
    '재실행: `npm run build`, `npm run preview`, 별도 `npm run dev` 후 `node scripts/performance-probe.mjs`. 결과 JSON: `reports/performance.json`; 화면: `output/playwright/performance/`.',
  ];
  await writeFile('reports/performance.md', lines.join('\n'));
  console.log(JSON.stringify({ runs: report.runs.map(run => ({ label: run.label, transferBytes: run.phases.L02Listen.resources.transferBytesIncludingResponseHeaders, p95ListenFrameMs: run.phases.L02Listen.frameSample.p95FrameIntervalMs, transitions: run.transitions.length, accumulation: run.profileAccumulation })), failures, report: 'reports/performance.json' }, null, 2));
  if (failures.length) process.exitCode = 1;
}
