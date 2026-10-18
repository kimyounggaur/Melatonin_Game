import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio']});
try {
  const context=await browser.newContext({viewport:{width:1366,height:768}});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5286');
  await page.locator('[data-action="unlock"]').click();
  await page.locator('[data-action="settings"]').click();
  await page.locator('[data-setting="volume"]').focus();await page.keyboard.press('Home');await page.keyboard.press('Escape');
  await page.locator('[data-action="lesson:L02"]').first().click();
  await page.locator('[data-action="listen"]').click();
  await page.waitForFunction(()=>window.__nightThread.status().epoch>0);
  const pad=page.locator('#action-pad');await pad.hover();
  const observed=await pad.evaluate(el=>{const style=getComputedStyle(el);const b=el.getBoundingClientRect();return {background:style.backgroundColor,color:style.color,label:el.innerText,rect:{x:b.x,y:b.y,width:b.width,height:b.height},viewport:{width:innerWidth,height:innerHeight}};});
  const luminance=s=>{const channels=s.match(/[\d.]+/g).slice(0,3).map(Number).map(n=>n/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;};
  const a=luminance(observed.background),b=luminance(observed.color);const ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  const passed=ratio>=4.5&&observed.rect.y+observed.rect.height<=observed.viewport.height&&errors.length===0;
  await fs.mkdir('output/playwright',{recursive:true});await fs.mkdir('reports',{recursive:true});
  await page.screenshot({path:'output/playwright/browser-chromium-hover-control.png',fullPage:true});
  await fs.writeFile('reports/browser-hover.json',JSON.stringify({observed,contrastRatio:ratio,errors,passed,scope:'Actual browser hover style and viewport geometry; not a complete accessibility audit'},null,2));
  console.log(JSON.stringify({observed,contrastRatio:ratio,errors,passed},null,2));if(!passed)process.exitCode=1;
} finally {await browser.close();}
