import {test,expect,type Page} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const action=(page:Page,name:string)=>page.locator(`[data-action="${name}"]`).first();
const status=(page:Page)=>page.evaluate(()=>window.__nightThread.status());
const errors=new WeakMap<Page,string[]>();
test.beforeEach(async({page})=>{
  await fs.mkdir(path.resolve('reports'),{recursive:true});
  await fs.mkdir(path.resolve('output/playwright'),{recursive:true});
  const list:string[]=[];errors.set(page,list);page.on('pageerror',e=>list.push(e.message));
});
test.afterEach(async({page})=>{expect(errors.get(page)??[],'No unhandled page/module errors').toEqual([]);});

async function staticMap(page:Page):Promise<void>{
  await page.goto('/');
  await expect(action(page,'unlock')).toBeVisible();
  await action(page,'map').click();
  await expect(page.locator('.dream-card')).toHaveCount(4);
}
test('WebKit Windows capability: absent Web Audio gives retry guidance and never silently enters PLAY',async({page,browser})=>{
  await page.goto('/');
  const capability=await page.evaluate(()=>({AudioContext:typeof globalThis.AudioContext,webkitAudioContext:typeof (globalThis as unknown as {webkitAudioContext?:unknown}).webkitAudioContext,userAgent:navigator.userAgent}));
  expect(capability.AudioContext).toBe('undefined');expect(capability.webkitAudioContext).toBe('undefined');
  await action(page,'unlock').click();
  await expect(page.locator('.toast')).toContainText('소리');
  const first=await status(page);expect(first.screen).toBe('home');expect(first.mode).toBeNull();
  expect(first.diagnostics.some(d=>d.event==='unlock-failed'&&d.details?.includes('web-audio-unavailable'))).toBe(true);
  await expect(action(page,'unlock')).toBeVisible();await action(page,'unlock').click();
  const retry=await status(page);expect(retry.screen).toBe('home');expect(retry.mode).toBeNull();
  expect(retry.diagnostics.filter(d=>d.event==='unlock-failed').length).toBeGreaterThanOrEqual(2);
  await page.screenshot({path:path.resolve('output/playwright/browser-webkit-audio-unavailable.png'),fullPage:true});
  await fs.writeFile(path.resolve('reports/browser-webkit-capability.json'),JSON.stringify({version:browser.version(),capability,first,retry,musicalRoutes:'not run: Windows Playwright WebKit lacks AudioContext/webkitAudioContext; native Safari and physical iPhone not tested',mockAudioContextUsed:false},null,2));
});
test('WebKit rendering: legitimate map link opens nine source-notation lessons, five viewport layouts and 200% text',async({page,browser})=>{
  await staticMap(page);const levels=[];
  for(const id of ['L01','L02','L03','L04','L05','L06','L07','L08','L09']){
    await action(page,`lesson:${id}`).click();
    await expect(page.locator(`.rhythm-notation[data-level-id="${id}"]`)).toBeVisible();
    const sourceEvents=await page.locator('g.notation-event').count();expect(sourceEvents).toBeGreaterThan(0);
    const snapshot=await status(page);expect(snapshot.mode).toBeNull();expect(snapshot.screen).toBe('lesson');
    levels.push({id,sourceEvents,meter:await page.locator('.notation-meter').innerText()});
    await action(page,'map').click();
  }
  const viewports=[];
  for(const[width,height]of[[320,568],[390,844],[768,1024],[844,390],[1366,768]]){
    await page.setViewportSize({width,height});
    const map=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));expect(map.scroll).toBeLessThanOrEqual(map.width+1);
    await page.screenshot({path:path.resolve(`output/playwright/browser-webkit-map-${width}x${height}.png`),fullPage:true});
    await action(page,'lesson:L02').click();
    await expect(page.locator('.rhythm-notation')).toBeVisible();
    const lesson=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));expect(lesson.scroll).toBeLessThanOrEqual(lesson.width+1);
    await page.screenshot({path:path.resolve(`output/playwright/browser-webkit-lesson-${width}x${height}.png`),fullPage:true});
    viewports.push({width,height,map,lesson,gameplay:'not run: Web Audio unavailable'});
    await action(page,'map').click();
  }
  await page.setViewportSize({width:390,height:844});
  const originalBodyPx=await page.evaluate(()=>parseFloat(getComputedStyle(document.body).fontSize));
  await page.addStyleTag({content:'html { font-size:200% !important; } body { font-size:1rem !important; } button,input,select,summary,p,small { font-size:inherit !important; }'});
  const enlargedBodyPx=await page.evaluate(()=>parseFloat(getComputedStyle(document.body).fontSize));expect(enlargedBodyPx).toBe(originalBodyPx*2);
  const zoom=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));expect(zoom.scroll).toBeLessThanOrEqual(zoom.width+1);
  await action(page,'settings').click();await expect(page.getByRole('dialog')).toBeVisible();
  const inputOffset=page.locator('[data-setting="inputOffsetMs"]');
  await inputOffset.fill('1000');await inputOffset.press('Tab');await expect(inputOffset).toHaveValue('250');
  const visualOffset=page.locator('[data-setting="visualOffsetMs"]');
  await visualOffset.fill('-1000');await visualOffset.press('Tab');await expect(visualOffset).toHaveValue('-250');
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.screenshot({path:path.resolve('output/playwright/browser-webkit-200percent-text.png'),fullPage:true});
  await fs.writeFile(path.resolve('reports/browser-webkit-static.json'),JSON.stringify({version:browser.version(),levels,viewports,zoom,textZoom:{originalBodyPx,enlargedBodyPx,ratio:enlargedBodyPx/originalBodyPx},manualNumberBounds:{input1000:250,visualMinus1000:-250},scope:'Actual Windows Playwright WebKit rendering and semantic UI; no musical gameplay, no physical device or native Safari claim'},null,2));
});
