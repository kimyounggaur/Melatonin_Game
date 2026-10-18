import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
  const context=await browser.newContext({viewport:{width:500,height:400}});
  const page=await context.newPage();
  await page.setContent('<button style="width:400px;height:300px;touch-action:none">Pointer protocol probe</button>');
  await page.evaluate(()=>{
    window.events=[];
    for(const type of ['pointerdown','pointerup','pointercancel']) document.addEventListener(type,e=>window.events.push({type:e.type,pointerId:e.pointerId,isPrimary:e.isPrimary,isTrusted:e.isTrusted}));
  });
  const cdp=await context.newCDPSession(page);
  const owner={id:1,x:120,y:120,radiusX:2,radiusY:2,force:1};
  const other={...owner,id:2,x:140};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[owner]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[owner,other]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[other]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  const events=await page.evaluate(()=>window.events);
  const ups=events.filter(e=>e.type==='pointerup');
  const passed=ups.length===2 && !ups[0].isPrimary && ups[1].isPrimary && events.every(e=>e.isTrusted);
  await fs.mkdir('reports',{recursive:true});
  await fs.writeFile('reports/browser-cdp-protocol.json',JSON.stringify({purpose:'Independent trusted multi-pointer CDP harness verification; no application code or AudioContext',events,passed},null,2));
  console.log(JSON.stringify({events,passed},null,2));
  if(!passed) process.exitCode=1;
} finally { await browser.close(); }
