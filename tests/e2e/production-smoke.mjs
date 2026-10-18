import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

// Explicit read-only verification of a supplied URL. Not selected by the local
// Playwright suite, and never deploys or changes external data.
const target=process.argv[2];
if(!target||!/^https?:\/\//.test(target))throw new Error('Supply the explicitly authorized deployment URL.');
const outputFile=path.resolve(process.argv[3]??'artifacts/browser-production-smoke.json');
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const page=await browser.newPage({viewport:{width:390,height:844}});
await page.addInitScript(()=>{window.__smokeInputs=[];for(const type of ['keydown','keyup','pointerdown','pointerup'])window.addEventListener(type,e=>window.__smokeInputs.push({type:e.type,code:e.code??null,trusted:e.isTrusted,timeStamp:e.timeStamp}));});
const errors=[];const consoleErrors=[];const badResponses=[];const failedRequests=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')consoleErrors.push({text:m.text(),location:m.location()});});
page.on('response',r=>{if(r.status()>=400)badResponses.push({status:r.status(),url:r.url()});});
page.on('requestfailed',r=>failedRequests.push({url:r.url(),failure:r.failure()}));
const action=name=>page.locator(`[data-action="${name}"]`).first();
const visible=async(locator,timeout=10_000)=>locator.waitFor({state:'visible',timeout});
const report={target,startedAt:new Date().toISOString(),browser:browser.version(),scope:'Real elapsed UI in isolated muted headless Chrome. No development getter, clock, judge calls, state injection, physical-device or acoustic-listening validation.'};
try {
  const response=await page.goto(target,{waitUntil:'networkidle'});
  report.httpStatus=response?.status();report.finalUrl=page.url();
  await visible(action('unlock'));
  report.devGetterPresent=await page.evaluate(()=>Object.hasOwn(window,'__nightThread'));
  if(report.devGetterPresent)throw new Error('Production build unexpectedly exposes development diagnostics.');
  await action('unlock').click();
  await visible(page.locator('.dream-card').first());
  if(await page.locator('.dream-card').count()!==4)throw new Error('Expected four dream scenes.');
  if(await page.locator('.dream-lessons button').count()!==9)throw new Error('Expected nine level links.');
  await action('settings').click();
  await page.locator('input[data-setting="volume"]').focus();await page.keyboard.press('Home');
  if(await page.locator('input[data-setting="volume"]').inputValue()!=='0')throw new Error('Real master volume mute failed.');
  await page.keyboard.press('Escape');
  await action('lesson:L02').click();
  await visible(page.locator('.rhythm-notation[data-level-id="L02"]'));
  const notationCount=await page.locator('g.notation-event').count();report.notationCount=notationCount;
  if(notationCount!==5)throw new Error('L02 must preserve five authored notation symbols.');
  await action('listen').click();await visible(action('practice'),25_000);
  await page.locator('#practice-speed').selectOption('1');await action('practice').click();
  await visible(page.locator('.count-number'));
  const practicePad=page.locator('#action-pad');await practicePad.focus();
  await page.locator('.count-number').waitFor({state:'hidden',timeout:10_000});
  const normalBackground=await practicePad.evaluate(el=>getComputedStyle(el).backgroundColor);
  await page.keyboard.down('Space');
  await page.waitForFunction(()=>document.querySelector('#action-pad')?.classList.contains('held'));
  await page.waitForFunction(background=>getComputedStyle(document.querySelector('#action-pad')).backgroundColor!==background,normalBackground,{timeout:2000});
  report.inputFeedback={held:true,normalBackground,heldBackground:await practicePad.evaluate(el=>getComputedStyle(el).backgroundColor),padText:await page.locator('#pad-text').innerText(),scope:'Trusted keyboard down/up changes the visible pad. Does not claim a timed Perfect/logical hold in this production smoke; those are covered by the local clock-observed input cases.'};
  await page.keyboard.up('Space');
  await page.waitForFunction(()=>!document.querySelector('#action-pad')?.classList.contains('held'));
  await page.waitForFunction(background=>getComputedStyle(document.querySelector('#action-pad')).backgroundColor===background,normalBackground,{timeout:2000});
  report.inputFeedback.released=true;
  const practiceSaved=await page.evaluate(()=>JSON.parse(localStorage.getItem('night-thread.progress.v1')??'{}'));
  if(practiceSaved.recentAttempts?.length!==0)throw new Error('Practice input must not create a standard attempt.');
  await visible(action('play'),25_000);await action('play').click();
  const pad=page.locator('#action-pad');await visible(pad);
  const geometry=await page.evaluate(()=>{const r=document.querySelector('#action-pad').getBoundingClientRect();return {viewport:[innerWidth,innerHeight],scroll:document.documentElement.scrollWidth,pad:{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}};});
  report.mobileGeometry=geometry;
  if(geometry.scroll>geometry.viewport[0]+1||geometry.pad.x<0||geometry.pad.bottom>geometry.viewport[1]+1||geometry.pad.height<72)throw new Error('Mobile game pad geometry failed.');
  await fs.mkdir(path.resolve('output/playwright'),{recursive:true});
  await page.screenshot({path:path.resolve('output/playwright/browser-production-mobile-play.png'),fullPage:true});
  await visible(page.locator('.score-number'),25_000);
  report.scoreText=await page.locator('.score-number').innerText();
  if(!/^0\s*\/\s*100$/.test(report.scoreText.trim()))throw new Error('No-input production PLAY must show exact zero out of 100.');
  report.saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('night-thread.progress.v1')??'{}'));
  if(report.saved.recentAttempts?.length!==1||report.saved.levels?.L02?.bestStandard!==0)throw new Error('Result persistence was not a single standard zero-score attempt.');
  const broken=await page.locator('img').evaluateAll(images=>images.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src));report.brokenImages=broken;
  if(broken.length)throw new Error('Some production images did not load.');
  await page.screenshot({path:path.resolve('output/playwright/browser-production-mobile-result.png'),fullPage:true});
  report.inputEvents=await page.evaluate(()=>window.__smokeInputs);
  if(!report.inputEvents.some(e=>e.type==='keydown'&&e.code==='Space'&&e.trusted)||!report.inputEvents.some(e=>e.type==='keyup'&&e.code==='Space'&&e.trusted))throw new Error('Trusted real production keyboard edges were not observed.');
  const manifest=JSON.parse(await fs.readFile(new URL('../../reference/assets/night_thread_mobile_runtime_v1/runtime_manifest.json',import.meta.url),'utf8'));
  if(manifest.assets.length!==92)throw new Error('Expected exact authored 92 assets.');
  report.assetHttp=[];
  for(let i=0;i<manifest.assets.length;i+=6) {
    const batch=await Promise.all(manifest.assets.slice(i,i+6).map(async a=>{
      const url=new URL('/assets/night-thread/'+a.path,target).href;
      const response=await page.request.get(url);const body=await response.body();
      return {assetId:a.assetId,path:a.path,status:response.status(),bytes:body.length,sha256:createHash('sha256').update(body).digest('hex'),expectedBytes:a.bytes,expectedSha256:a.sha256};
    }));
    report.assetHttp.push(...batch);
  }
  const badAssets=report.assetHttp.filter(a=>a.status!==200||a.bytes!==a.expectedBytes||a.sha256!==a.expectedSha256);
  if(badAssets.length)throw new Error(`Production asset integrity mismatch: ${badAssets.map(a=>a.assetId).join(',')}`);
  await page.reload({waitUntil:'networkidle'});await visible(action('unlock'));await action('unlock').click();
  await visible(action('lesson:L02'));
  const savedReload=await page.evaluate(()=>JSON.parse(localStorage.getItem('night-thread.progress.v1')??'{}'));
  if(JSON.stringify(savedReload.recentAttempts)!==JSON.stringify(report.saved.recentAttempts)||savedReload.levels?.L02?.bestStandard!==0)throw new Error('Production reload must preserve exactly the single attempt.');
  report.reloadPreserved=true;
  if(errors.length||consoleErrors.length||badResponses.length||failedRequests.length)throw new Error('Production page/console/resource errors observed.');
  report.outcome='passed';
} catch(error) {
  report.outcome='failed';report.error=String(error);
  await page.screenshot({path:path.resolve('output/playwright/browser-production-failure.png'),fullPage:true}).catch(()=>{});
  process.exitCode=1;
} finally {
  report.inputEvents=await page.evaluate(()=>window.__smokeInputs??[]).catch(()=>[]);
  report.errors=errors;report.consoleErrors=consoleErrors;report.badResponses=badResponses;report.failedRequests=failedRequests;report.finishedAt=new Date().toISOString();
  await fs.mkdir(path.dirname(outputFile),{recursive:true});
  await fs.writeFile(outputFile,JSON.stringify(report,null,2));
  console.log(JSON.stringify({target:report.target,outcome:report.outcome,error:report.error,score:report.scoreText,inputFeedback:report.inputFeedback,reloadPreserved:report.reloadPreserved,assetCount:report.assetHttp?.length,errors,consoleErrors,badResponses,failedRequests,report:outputFile},null,2));await browser.close();
}
