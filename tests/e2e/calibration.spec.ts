import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { CompiledNote, JudgeSnapshot } from '../../src/core/types';

type Status={screen:string;mode:string|null;epoch:number|null;audioNow:number;ready:string|null;notes:CompiledNote[];snapshot:JudgeSnapshot|null;physicalOwner:string|null;logicalHold:string|null;config:{inputOffsetMs:number};diagnostics:unknown[]};
const status=(page:Page):Promise<Status>=>page.evaluate(()=>(window as unknown as {__nightThread:{status():Status}}).__nightThread.status());
const action=(page:Page,name:string)=>page.locator(`[data-action="${name}"]`).first();
const errors=new WeakMap<Page,string[]>();
test.beforeEach(async({page})=>{const e:string[]=[];errors.set(page,e);page.on('pageerror',x=>e.push(x.message));});
test.afterEach(async({page})=>{expect(errors.get(page)).toEqual([]);});
const waitAt=(page:Page,target:number)=>page.waitForFunction(t=>(window as unknown as {__nightThread:{status():Status}}).__nightThread.status().audioNow>=t,target,{polling:'raf',timeout:15_000});

for(const offsetMs of [-250,250]) {
  test(`E12 calibration ${offsetMs}ms: real keyboard reaches first onset, every hold/release and standard 100 without changing targets`,async({page,browserName})=>{
    expect(browserName).toBe('chromium');
    await page.goto('/');
    await action(page,'unlock').click();
    await expect(page.locator('.dream-card')).toHaveCount(4);
    await action(page,'settings').click();
    await page.locator('input[data-setting="volume"]').focus();await page.keyboard.press('Home');
    await expect(page.locator('input[data-setting="volume"]')).toHaveValue('0');
    await page.locator('input[data-setting="inputOffsetMs"]').fill(String(offsetMs));
    await page.keyboard.press('Tab');
    await expect(page.locator('input[data-setting="inputOffsetMs"]')).toHaveValue(String(offsetMs));
    await page.keyboard.press('Escape');
    await action(page,'lesson:L04').click();
    await expect(page.locator('.rhythm-notation[data-level-id="L04"]')).toBeVisible();
    await action(page,'listen').click();
    await expect(action(page,'practice')).toBeVisible({timeout:20_000});
    await page.locator('#practice-speed').selectOption('1');await action(page,'practice').click();
    await expect(action(page,'play')).toBeVisible({timeout:20_000});
    await action(page,'play').click();
    await expect.poll(async()=>{const s=await status(page);return s.screen==='game'&&s.mode==='play'&&!!s.epoch;}).toBe(true);
    const play=await status(page);
    expect(play.config.inputOffsetMs).toBe(offsetMs);
    expect(play.notes).toHaveLength(8);
    expect(play.snapshot?.expectationCount).toBe(16);
    expect(play.notes[0]).toMatchObject({startSec:0,endSec:1.125,startTick:0,endTick:720});
    expect(play.notes[7]).toMatchObject({startSec:10.5,endSec:11.625});
    await page.locator('#action-pad').focus();
    const observations:unknown[]=[];
    for(const note of play.notes) {
      // Genuine keyboard events occur at raw target + offset. The application's
      // corrected time is raw-offset; its musical targets remain unchanged.
      await waitAt(page,play.epoch!+note.startSec+offsetMs/1000-.006);
      await page.keyboard.down('Space');
      await expect.poll(async()=>(await status(page)).snapshot?.notes.find(n=>n.noteId===note.id)?.status).toBe('ACTIVE');
      const down=await status(page);
      expect(down.physicalOwner).toBe('kSpace');
      await waitAt(page,play.epoch!+note.endSec+offsetMs/1000-.006);
      await page.keyboard.up('Space');
      await expect.poll(async()=>(await status(page)).snapshot?.notes.find(n=>n.noteId===note.id)?.status).toBe('RELEASED');
      observations.push({id:note.id,down,up:await status(page)});
    }
    await expect(page.locator('.score-number')).toBeVisible({timeout:10_000});
    const final=await status(page);
    expect(final.snapshot).toMatchObject({score:100,earned:16,extra:0,expectationCount:16,completedPhrases:4,finished:true});
    expect(final.physicalOwner).toBeNull();expect(final.logicalHold).toBeNull();
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('night-thread.progress.v1')??'{}'));
    expect(saved.levels.L04.bestStandard).toBe(100);
    expect(saved.recentAttempts).toHaveLength(1);
    await page.screenshot({path:path.resolve(`output/playwright/browser-calibration-${offsetMs}-result.png`),fullPage:true});
    await fs.writeFile(path.resolve(`reports/browser-calibration-${offsetMs}.json`),JSON.stringify({offsetMs,category:'Actual real-time trusted keyboard, real UI settings, read-only clock observation; no clock, judge or state injection. Isolated muted headless Chrome; not acoustic calibration or physical-device validation.',play,observations,final,saved,pageErrors:errors.get(page)},null,2));
  });
}
