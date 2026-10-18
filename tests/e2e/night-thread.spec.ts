import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Level } from '../../src/core/types';

const levels = JSON.parse(readFileSync(new URL('../../src/content/levels.json', import.meta.url), 'utf8')) as Level[];

type NoteEvidence = { noteId: string; status: string; onsetPoints?: number; releasePoints?: number };
type Status = {
  screen: string; selectedId: string; mode: string | null; epoch: number | null; audioNow: number; contextTime: number;
  snapshot: { score: number; earned: number; extra: number; expectationCount: number; finished: boolean; restartTick: number; completedPhrases: number; notes: NoteEvidence[]; sessionId: string } | null;
  paused: boolean; ready: string | null; physicalOwner: string | null; logicalHold: string | null; restartSec: number; countStart: number;
  notes: { id: string; interaction: string; startSec: number; endSec: number; startTick: number; endTick: number }[];
  diagnostics: { event: string; id?: string; contextSec: number; perfMs: number; details?: string }[];
  config: { key: string; highContrast: boolean; reducedMotion: boolean; toggleHold: boolean };
  voices: number; pending: number; mappingMethod: string;
};
declare global { interface Window { __nightThread: { status(): Status }; __browserInputLog: {type:string;pointerId:number;pointerType:string;isPrimary:boolean;trusted:boolean;timeStamp:number}[] } }

const artifact = (name: string) => path.resolve('output/playwright', name);
const report = (name: string) => path.resolve('reports', `browser-${name}.json`);
const status = (page: Page): Promise<Status> => page.evaluate(() => window.__nightThread.status());
const action = (page: Page, name: string) => page.locator(`[data-action="${name}"]`).first();
const pageErrors = new WeakMap<Page,string[]>();

test.beforeAll(async({browser,browserName},info)=>{
  await fs.mkdir(path.resolve('reports'),{recursive:true});
  await fs.writeFile(report(`engine-${info.project.name}`),JSON.stringify({browserName,version:browser.version(),node:process.version,headless:true,isolatedContext:true,baseURL:info.project.use.baseURL,physicalListening:false,observedAt:new Date().toISOString()},null,2));
});

async function openMap(page: Page): Promise<void> {
  await page.goto('/');
  await expect(action(page, 'unlock')).toBeVisible();
  await action(page, 'unlock').click();
  await expect(page.locator('h1')).toHaveText('오늘은 어떤 꿈을 이을까요?');
  // The scheduling/clock tests do not require acoustic output. Mute using the
  // real settings control so this isolated browser does not disturb other work.
  await action(page,'settings').click();
  await page.locator('input[data-setting="volume"]').focus();
  await page.keyboard.press('Home');
  await expect(page.locator('input[data-setting="volume"]')).toHaveValue('0');
  await page.keyboard.press('Escape');
}
async function openLesson(page: Page, id: string): Promise<void> {
  await action(page, `lesson:${id}`).click();
  await expect(page.locator(`.rhythm-notation[data-level-id="${id}"]`)).toBeVisible();
  await expect.poll(async () => (await status(page)).selectedId).toBe(id);
}
async function waitRun(page: Page, mode: string): Promise<Status> {
  // During resume, ensureAudio() still exposes the previous paused run; then
  // mountScene() exposes a new run with zero epoch until it is armed. Require
  // both unpaused and armed, before reading the fresh count-in snapshot.
  await expect.poll(async () => { const s=await status(page);return s.mode === mode && s.epoch !== null && s.epoch > 0 && s.countStart > 0 && !s.paused && s.screen === 'game'; }).toBe(true);
  return status(page);
}
async function waitAt(page: Page, absoluteAudioSec: number): Promise<void> {
  await page.waitForFunction(target => window.__nightThread.status().audioNow >= target, absoluteAudioSec, { polling: 'raf', timeout: 30_000 });
}
async function startPlayPath(page: Page): Promise<void> {
  await action(page, 'listen').click();
  await waitRun(page, 'listen');
  await expect(action(page, 'practice')).toBeVisible({ timeout: 25_000 });
  await page.locator('#practice-speed').selectOption('1');
  await action(page, 'practice').click();
  await waitRun(page, 'practice');
  await expect(action(page, 'play')).toBeVisible({ timeout: 25_000 });
  await action(page, 'play').click();
  await waitRun(page, 'play');
}
async function noHorizontalScroll(page: Page): Promise<void> {
  const sizes = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  expect(sizes.document, JSON.stringify(sizes)).toBeLessThanOrEqual(sizes.viewport + 1);
  expect(sizes.body, JSON.stringify(sizes)).toBeLessThanOrEqual(sizes.viewport + 1);
}

test.beforeEach(async ({ page }) => {
  await fs.mkdir(artifact(''), { recursive: true });
  await fs.mkdir(path.resolve('reports'), { recursive: true });
  const errors: string[] = [];
  pageErrors.set(page,errors);
  page.on('pageerror', e => errors.push(e.message));
  page.on('close', () => { if(errors.length) console.error('Browser page errors:', errors); });
  await page.addInitScript(()=>{
    window.__browserInputLog=[];
    for(const type of ['pointerdown','pointerup','pointercancel','lostpointercapture']) document.addEventListener(type,event=>{
      const e=event as PointerEvent;
      window.__browserInputLog.push({type:e.type,pointerId:e.pointerId,pointerType:e.pointerType,isPrimary:e.isPrimary,trusted:e.isTrusted,timeStamp:e.timeStamp});
    },true);
  });
});

test.afterEach(async ({page}, info) => {
  if(info.status!==info.expectedStatus && !page.isClosed()) {
    const observed=await page.evaluate(()=>({status:window.__nightThread?.status(),inputLog:window.__browserInputLog})).catch(()=>null);
    await fs.writeFile(report(`failure-${info.project.name}-${info.testId.replace(/[^a-zA-Z0-9_-]/g,'_')}`),JSON.stringify(observed,null,2));
  }
  expect(pageErrors.get(page)??[],'No unhandled page/module errors').toEqual([]);
});

test('E01 E08 E09: nine lessons expose exact source notation, pitch, ties, grouping and tempo', async ({ page, browserName }) => {
  await openMap(page);
  await expect(action(page,'settings')).toHaveAccessibleName('설정 열기');
  await expect(page.locator('.dream-card')).toHaveCount(4);
  const captures = [];
  for (const level of levels) {
    await openLesson(page, level.id);
    const figure = page.locator(`.rhythm-notation[data-level-id="${level.id}"]`);
    const authored = level.bars.flatMap((b, bi) => b.events.map(e => ({ id:e.id, at:bi * level.meter.n * 4 / level.meter.d * 480 + e.at, kind:e.kind, dots:e.notation.dots })));
    const shown = await figure.locator('g.notation-event').evaluateAll(nodes => nodes.map(n => ({id:n.getAttribute('data-source-notation-id'),at:Number(n.getAttribute('data-start-tick')),kind:n.getAttribute('data-kind'),dots:Number(n.getAttribute('data-dots'))})));
    expect(shown).toEqual(authored);
    await expect(figure.locator('.notation-meter')).toContainText(level.meter.groupingEighths.join('+'));
    await expect(figure.locator('.notation-meter')).toContainText(level.meter.d === 8 ? `점4분음표=${level.quarterBpm / 1.5}` : `4분음표=${level.quarterBpm}`);
    if(['L02','L03'].includes(level.id)) await expect(figure.locator('.notation-tie')).toHaveCount(1);
    await figure.locator('summary').click();
    await expect(figure.locator('.notation-prose')).toContainText('C5');
    captures.push({levelId:level.id,events:shown,meter:await figure.locator('.notation-meter').innerText()});
    await noHorizontalScroll(page);
    await action(page, 'map').click();
  }
  await fs.writeFile(report(`nine-levels-${browserName}`), JSON.stringify(captures,null,2));
});

test('E06: five viewport layouts, readable 200% text, keyboard settings and semantic controls', async ({ page, browserName }) => {
  await openMap(page);
  const matrix = [];
  for (const [width,height] of [[320,568],[390,844],[768,1024],[844,390],[1366,768]]) {
    await page.setViewportSize({width,height});
    await noHorizontalScroll(page);
    await page.screenshot({path:artifact(`browser-${browserName}-map-${width}x${height}.png`),fullPage:true});
    await openLesson(page,'L02');
    await noHorizontalScroll(page);
    await page.screenshot({path:artifact(`browser-${browserName}-lesson-${width}x${height}.png`),fullPage:true});
    await action(page,'listen').click();
    await waitRun(page,'listen');
    const pad=page.locator('#action-pad');
    await expect(pad).toBeVisible();
    const bounds=await pad.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.height).toBeGreaterThanOrEqual(72);
    expect(bounds!.width).toBeGreaterThanOrEqual(72);
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(width+1);
    expect(bounds!.y,`action pad must stay visible at ${width}x${height}`).toBeGreaterThanOrEqual(0);
    expect(bounds!.y+bounds!.height,`action pad must stay visible at ${width}x${height}`).toBeLessThanOrEqual(height+1);
    await expect(action(page,'pause')).toHaveAccessibleName('일시정지');
    const countText=await page.locator('.count-number').innerText();
    expect(Number(countText)).toBeLessThanOrEqual(4);
    await noHorizontalScroll(page);
    await page.screenshot({path:artifact(`browser-${browserName}-game-${width}x${height}.png`),fullPage:true});
    matrix.push({width,height,pad:bounds});
    await action(page,'map').click();
  }
  await page.setViewportSize({width:390,height:844});
  const originalBodyPx=await page.evaluate(()=>parseFloat(getComputedStyle(document.body).fontSize));
  await page.addStyleTag({content:'html { font-size:200% !important; } body { font-size:1rem !important; } button, input, select, summary, p, small { font-size:inherit !important; }'});
  const enlargedBodyPx=await page.evaluate(()=>parseFloat(getComputedStyle(document.body).fontSize));
  expect(enlargedBodyPx).toBe(originalBodyPx*2);
  await noHorizontalScroll(page);
  await action(page,'settings').click();
  const dialog=page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.locator('select[data-setting="key"]').selectOption('KeyF');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect.poll(async()=>(await status(page)).config.key).toBe('KeyF');
  await page.screenshot({path:artifact(`browser-${browserName}-200percent-text.png`),fullPage:true});
  await fs.writeFile(report(`viewport-matrix-${browserName}`),JSON.stringify({matrix,textZoom:{originalBodyPx,enlargedBodyPx,ratio:enlargedBodyPx/originalBodyPx}},null,2));
});

test('E01 E14: real-time L02 listen → practice → PLAY no-input earns zero and emits no lead/player attacks', async ({ page, browserName }) => {
  const errors: string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await openMap(page);await openLesson(page,'L02');
  await action(page,'listen').click();const listen=await waitRun(page,'listen');
  await expect(action(page,'practice')).toBeVisible({timeout:25_000});
  const afterListen=await status(page);
  expect(afterListen.snapshot).toBeNull();
  expect(afterListen.diagnostics.filter(d=>d.event==='attack'&&d.id?.startsWith('demo-'))).toHaveLength(4);
  await page.locator('#practice-speed').selectOption('1');
  await action(page,'practice').click();await waitRun(page,'practice');
  await expect(action(page,'play')).toBeVisible({timeout:25_000});
  await action(page,'play').click();const play=await waitRun(page,'play');
  await expect(page.locator('.result-page')).toHaveCount(0);
  await waitAt(page,play.epoch!+play.notes.at(-1)!.endSec+.01);
  await expect(page.locator('.result-page')).toHaveCount(0);
  await expect(page.locator('.score-number')).toBeVisible({timeout:15_000});
  const finished=await status(page);
  expect(finished.snapshot?.finished).toBe(true);expect(finished.snapshot?.score).toBe(0);
  expect(finished.snapshot?.expectationCount).toBe(12);expect(finished.snapshot?.completedPhrases).toBe(4);
  const inPlay=finished.diagnostics.filter(d=>d.contextSec>=play.countStart && d.event==='attack');
  expect(inPlay.filter(d=>d.id?.startsWith('demo-')||d.details?.includes('bus=guide'))).toHaveLength(0);
  expect(inPlay.filter(d=>d.details?.includes('bus=player'))).toHaveLength(0);
  await expect(page.locator('.score-number')).toContainText('0');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('night-thread.progress.v1')??'{}'));
  expect(saved.levels.L02).toMatchObject({completed:true,bestStandard:0,bestAssisted:null});
  expect(saved.recentAttempts).toHaveLength(1);
  expect(saved.recentAttempts[0]).toMatchObject({levelId:'L02',score:0,valid:true,assisted:false});
  expect(errors).toEqual([]);
  await page.screenshot({path:artifact(`browser-${browserName}-L02-no-input-result.png`),fullPage:true});
  await fs.writeFile(report(`L02-no-input-${browserName}`),JSON.stringify({category:`Real-time isolated headless ${browserName}; physical audio muted; not acoustic or device latency measurement`,listenStart:listen.epoch,playStart:play.epoch,result:finished,saved},null,2));
});

test('E02 E03 E04: trusted keyboard and pointer hold/release, secondary owner ignored, pause/resume fresh count-in', async ({ page, context, browserName }) => {
  // Retained Firefox runs show variable Node transport, and a 70ms lead was
  // too early once warm. Use the fixed final 30ms command lead; musical time,
  // inputOffset=0, scoring windows and exact 100-point expectations stay fixed.
  const commandLeadSec=browserName==='firefox'?.030:.006;
  await openMap(page);await openLesson(page,'L02');await startPlayPath(page);
  const initial=await status(page);const first=initial.notes[0]!;
  await page.locator('#action-pad').focus();
  await waitAt(page,initial.epoch!+first.startSec-commandLeadSec);
  await page.keyboard.down('Space');
  await expect.poll(async()=>(await status(page)).snapshot?.notes[0]?.status).toBe('ACTIVE');
  const owner=await status(page);expect(owner.physicalOwner).toBe('kSpace');
  await page.keyboard.down('Space'); // repeated physical key produces repeat=true
  await page.keyboard.up('KeyF');
  expect((await status(page)).physicalOwner).toBe('kSpace');
  await waitAt(page,initial.epoch!+first.endSec-commandLeadSec);await page.keyboard.up('Space');
  await expect.poll(async()=>(await status(page)).snapshot?.notes[0]?.status).toBe('RELEASED');
  expect((await status(page)).snapshot?.extra).toBe(0);
  await action(page,'pause').click();await expect(action(page,'resume')).toBeVisible();
  const paused=await status(page);expect(paused.paused).toBe(true);expect(paused.physicalOwner).toBeNull();
  await action(page,'resume').click();const resumed=await waitRun(page,'play');
  expect(resumed.paused).toBe(false);expect(resumed.epoch).not.toBe(initial.epoch);
  expect(resumed.audioNow-resumed.epoch!).toBeLessThan(resumed.restartSec);
  expect(resumed.snapshot?.earned).toBe(0);
  await page.keyboard.up('Space');
  await page.locator('#action-pad').scrollIntoViewIfNeeded();
  const box=await page.locator('#action-pad').boundingBox();
  const point={id:1,x:box!.x+box!.width/2,y:box!.y+box!.height/2,radiusX:2,radiusY:2,force:1};
  const cdp=browserName==='chromium'?await context.newCDPSession(page):null;
  if(!cdp) await page.mouse.move(point.x,point.y);
  await waitAt(page,resumed.epoch!+first.startSec-commandLeadSec);
  if(cdp) await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
  else await page.mouse.down();
  await expect.poll(async()=>(await status(page)).snapshot?.notes[0]?.status).toBe('ACTIVE');
  const beforeSecond=await status(page);
  if(cdp) {
    const point2={...point,id:2,x:point.x+20};
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point,point2]});
    // In installed Chrome, a partial touchEnd names the released contact,
    // rather than remaining contacts. The independent protocol probe records
    // trusted secondary-up before owner-up for this exact sequence.
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[point2]});
  } else { await page.keyboard.down('KeyF'); await page.keyboard.up('KeyF'); }
  const afterSecond=await status(page);
  expect(afterSecond.physicalOwner).toBe(beforeSecond.physicalOwner);
  expect(afterSecond.snapshot?.notes[0]?.status).toBe('ACTIVE');expect(afterSecond.snapshot?.extra).toBe(0);
  await page.mouse.move(1,1); // unrelated pointer movement must not release touch owner
  await waitAt(page,resumed.epoch!+first.endSec-commandLeadSec);
  if(cdp) await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  else await page.mouse.up();
  await expect.poll(async()=>(await status(page)).snapshot?.notes[0]?.status).toBe('RELEASED');
  expect((await status(page)).paused).toBe(false);
  const afterRelease=await status(page);
  await page.locator('#action-pad').focus();
  for(const note of resumed.notes.slice(1)) {
    await waitAt(page,resumed.epoch!+note.startSec-commandLeadSec);
    await page.keyboard.down('Space');
    if(note.interaction==='hold') await waitAt(page,resumed.epoch!+note.endSec-commandLeadSec);
    await page.keyboard.up('Space');
  }
  await expect(page.locator('.score-number')).toBeVisible({timeout:15_000});
  const final=await status(page);
  expect(final.snapshot?.earned).toBe(12);expect(final.snapshot?.score).toBe(100);expect(final.snapshot?.extra).toBe(0);
  await page.screenshot({path:artifact(`browser-${browserName}-L02-positive-result.png`),fullPage:true});
  const inputLog=await page.evaluate(()=>window.__browserInputLog);
  expect(inputLog.filter(e=>e.type==='pointerdown'||e.type==='pointerup').every(e=>e.trusted)).toBe(true);
  if(cdp) {
    const touchUps=inputLog.filter(e=>e.type==='pointerup'&&e.pointerType==='touch');
    expect(touchUps).toHaveLength(2);
    expect(touchUps[0]!.isPrimary).toBe(false);expect(touchUps[1]!.isPrimary).toBe(true);
  }
  await fs.writeFile(report(`input-owner-pause-${browserName}`),JSON.stringify({category:browserName==='chromium'?'Browser trusted keyboard + CDP multitouch controls; not physical device testing':'Browser trusted keyboard + mouse capture; multitouch not run because this browser has no CDP touch interface',commandLeadSec,initial,owner,paused,resumed,beforeSecond,afterSecond,afterRelease,final,inputLog},null,2));
});

test('E05: real browser screen orientation change interrupts and user resume starts a fresh count-in', async ({ page, context }) => {
  await openMap(page);await openLesson(page,'L03');await action(page,'listen').click();
  const before=await waitRun(page,'listen');
  const cdp=await context.newCDPSession(page);
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true,screenOrientation:{type:'portraitPrimary',angle:0}});
  await expect(action(page,'resume')).toBeVisible();
  expect((await status(page)).paused).toBe(true);
  await action(page,'resume').click();const after=await waitRun(page,'listen');
  expect(after.epoch).not.toBe(before.epoch);expect(after.audioNow-after.epoch!).toBeLessThan(0);
  await noHorizontalScroll(page);
  await page.screenshot({path:artifact('browser-orientation-resumed.png'),fullPage:true});
  await fs.writeFile(report('orientation'),JSON.stringify({before,after,note:'CDP emulated orientation change; real phone rotation remains not run'},null,2));
});
