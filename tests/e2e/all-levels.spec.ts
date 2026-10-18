import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { CompiledNote, JudgeSnapshot, Level } from '../../src/core/types';
import type { Progress } from '../../src/core/storage';

const levels = JSON.parse(readFileSync(new URL('../../src/content/levels.json', import.meta.url), 'utf8')) as Level[];
// Independent acceptance values: hold onset/release each count once; a tie is
// one continuous note. L02 has its own full-session case in night-thread.spec.ts.
const cases = [
  { id: 'L01', expectationCount: 16, notesPerMotif: 2 },
  { id: 'L03', expectationCount: 16, notesPerMotif: 2 },
  { id: 'L04', expectationCount: 16, notesPerMotif: 2 },
  { id: 'L05', expectationCount: 20, notesPerMotif: 4 },
  { id: 'L06', expectationCount: 24, notesPerMotif: 6 },
  { id: 'L07', expectationCount: 24, notesPerMotif: 6 },
  { id: 'L08', expectationCount: 16, notesPerMotif: 4 },
  { id: 'L09', expectationCount: 16, notesPerMotif: 4 },
] as const;

type AudioDiagnostic = { event: string; id?: string; contextSec: number; perfMs: number; details?: string };
type ObservedStatus = {
  screen: string; selectedId: string; mode: string | null; epoch: number | null;
  audioNow: number; contextTime: number; countStart: number; paused: boolean;
  ready: string | null; physicalOwner: string | null; logicalHold: string | null;
  focusBars: number[] | null;
  notes: CompiledNote[]; snapshot: JudgeSnapshot | null; diagnostics: AudioDiagnostic[];
  config: { volume: number; guide: boolean; showBeat: boolean; toggleHold: boolean; wideWindows: boolean };
};
type Evidence = Record<string, unknown> & { levelId: string; startedAt: string; startedWallMs: number };
const pageErrors = new WeakMap<Page, string[]>();
const evidence = new WeakMap<Page, Evidence>();
const artifact = (id: string) => path.resolve('output/playwright', `browser-chromium-${id}-result.png`);
const report = (id: string) => path.resolve('reports', `browser-all-levels-${id}.json`);
const action = (page: Page, name: string) => page.locator(`[data-action="${name}"]`).first();
// Read-only application observability. These tests never set the clock, call a
// judge/scoring method, or change application state from page.evaluate().
const status = (page: Page): Promise<ObservedStatus> => page.evaluate(() =>
  (window as unknown as { __nightThread: { status(): ObservedStatus } }).__nightThread.status());
const savedProgress = (page: Page): Promise<Progress> => page.evaluate(() =>
  JSON.parse(localStorage.getItem('night-thread.progress.v1') ?? '{}') as Progress);

async function waitRun(page: Page, mode: string): Promise<ObservedStatus> {
  await expect.poll(async () => {
    const s = await status(page);
    return s.screen === 'game' && s.mode === mode && s.epoch !== null && s.epoch > 0 && !s.paused;
  }).toBe(true);
  return status(page);
}
async function waitAt(page: Page, absoluteAudioSec: number, timeout = 45_000): Promise<void> {
  await page.waitForFunction(target =>
    (window as unknown as { __nightThread: { status(): ObservedStatus } }).__nightThread.status().audioNow >= target,
  absoluteAudioSec, { polling: 'raf', timeout });
}
function expectRepetitions(s: ObservedStatus, repeats: number, notesPerMotif: number): void {
  expect(s.notes).toHaveLength(repeats * notesPerMotif);
  expect([...new Set(s.notes.map(n => n.phraseIndex))]).toEqual(Array.from({ length: repeats }, (_, i) => i));
  for (let i = 0; i < repeats; i++) expect(s.notes.filter(n => n.phraseIndex === i)).toHaveLength(notesPerMotif);
  expect(s.physicalOwner).toBeNull();
  expect(s.logicalHold).toBeNull();
  expect(s.config).toMatchObject({ volume: 0, guide: false, showBeat: false, toggleHold: false, wideWindows: false });
}

test.beforeEach(async ({ page }) => {
  await fs.mkdir(path.resolve('output/playwright'), { recursive: true });
  await fs.mkdir(path.resolve('reports'), { recursive: true });
  const errors: string[] = [];
  pageErrors.set(page, errors);
  page.on('pageerror', e => errors.push(e.message));
});
test.afterEach(async ({ page }, info) => {
  const errors = pageErrors.get(page) ?? [];
  const record = evidence.get(page);
  if (record) {
    const lastObserved = page.isClosed() ? null : await status(page).catch(() => null);
    await fs.writeFile(report(record.levelId), JSON.stringify({
      ...record, finishedAt: new Date().toISOString(), elapsedWallSec: (Date.now() - record.startedWallMs) / 1000,
      outcome: errors.length ? 'failed-pageerror' : info.status, expectedStatus: info.expectedStatus,
      errors: info.errors.map(e => e.message), pageErrors: errors, lastObserved,
    }, null, 2));
  }
  expect(errors, 'No unhandled page/module errors during the entire level flow').toEqual([]);
});

test.describe('E01 E14: remaining eight complete real-time Chrome sessions', () => {
  test.describe.configure({ mode: 'default', timeout: 180_000 });
  for (const c of cases) {
    test(`${c.id}: LISTEN 2 + tail -> practice 100% 2 -> PLAY 4 + OUTRO -> one zero-score result`, async ({ page, browser, browserName }, info) => {
      expect(browserName).toBe('chromium');
      const level = levels.find(l => l.id === c.id)!;
      expect(level).toBeDefined();
      const barSec = level.meter.n * 4 / level.meter.d * 60 / level.quarterBpm;
      const motifSec = barSec * level.bars.length;
      const record: Evidence = {
        levelId: c.id, startedAt: new Date().toISOString(), startedWallMs: Date.now(),
        category: 'Real elapsed-time isolated headless Chrome session; master volume muted through real settings. No clock mocking, scoring invocation, or state injection. Not physical-device, acoustic-listening, or educator validation.',
        browser: { name: browserName, version: browser.version(), project: info.project.name, baseURL: info.project.use.baseURL },
        oracle: { expectationCount: c.expectationCount, notesPerMotif: c.notesPerMotif, barSec, motifSec, listenRepeats: 2, listenTailBars: 1, practiceSpeed: 1, practiceRepeats: 2, playRepeats: 4, outroBars: 1 },
      };
      evidence.set(page, record);

      await page.goto('/');
      await expect(action(page, 'unlock')).toBeVisible();
      await action(page, 'unlock').click();
      await expect(page.locator('.dream-card')).toHaveCount(4);
      // Keyboard Home changes the real range control; no browser/global audio
      // state injection and no sound is played into the shared workspace.
      await action(page, 'settings').click();
      await page.locator('input[data-setting="volume"]').focus();
      await page.keyboard.press('Home');
      await expect(page.locator('input[data-setting="volume"]')).toHaveValue('0');
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      expect((await savedProgress(page)).recentAttempts).toEqual([]);
      await action(page, `lesson:${c.id}`).click();
      await expect(page.locator(`.rhythm-notation[data-level-id="${c.id}"]`)).toBeVisible();
      await expect.poll(async () => (await status(page)).selectedId).toBe(c.id);

      await action(page, 'listen').click();
      const listen = await waitRun(page, 'listen');
      record.listenStart = listen;
      expectRepetitions(listen, 2, c.notesPerMotif);
      expect(listen.snapshot).toBeNull();
      expect(listen.epoch! - listen.countStart).toBeCloseTo(barSec, 5);
      // Finishing the two motifs must retain the full one-bar LISTEN tail.
      await waitAt(page, listen.epoch! + motifSec * 2 + .05);
      await expect(action(page, 'practice')).toHaveCount(0);
      record.listenTail = await status(page);
      await expect(action(page, 'practice')).toBeVisible({ timeout: Math.ceil((barSec + 10) * 1000) });
      const afterListen = await status(page);
      record.afterListen = afterListen;
      expect(afterListen.ready).toBe('practice');
      expect(afterListen.snapshot).toBeNull();
      expect(afterListen.audioNow - listen.epoch!).toBeGreaterThanOrEqual(motifSec * 2 + barSec - .03);
      const listenAttacks = afterListen.diagnostics.filter(d => d.event === 'attack' && d.id?.startsWith('demo-') && d.contextSec >= listen.countStart - .2);
      expect(listenAttacks).toHaveLength(c.notesPerMotif * 2);
      expect((await savedProgress(page)).recentAttempts).toEqual([]);

      await page.locator('#practice-speed').selectOption('1');
      await expect(page.locator('#practice-speed')).toHaveValue('1');
      await action(page, 'practice').click();
      const practice = await waitRun(page, 'practice');
      record.practiceStart = practice;
      expectRepetitions(practice, 2, c.notesPerMotif);
      expect(practice.snapshot?.expectationCount).toBe(c.expectationCount / 2);
      expect(practice.epoch! - practice.countStart).toBeCloseTo(barSec, 5);
      // The same note times at 100% prove that practice did not stay at 75%.
      expect(practice.notes.map(n => [n.startSec, n.endSec])).toEqual(listen.notes.map(n => [n.startSec, n.endSec]));
      await page.waitForFunction(() =>
        (window as unknown as { __nightThread: { status(): ObservedStatus } }).__nightThread.status().ready === 'play',
      undefined, { polling: 'raf', timeout: Math.ceil((motifSec * 2 + barSec + 12) * 1000) });
      await expect(action(page, 'play')).toBeVisible();
      const afterPractice = await status(page);
      record.afterPractice = afterPractice;
      expect(afterPractice.ready).toBe('play');
      expect(afterPractice.snapshot).toMatchObject({ finished: true, score: 0, earned: 0, extra: 0, completedPhrases: 2, expectationCount: c.expectationCount / 2 });
      expect(afterPractice.audioNow - practice.epoch!).toBeGreaterThanOrEqual(motifSec * 2 - .03);
      expect(afterPractice.audioNow - practice.epoch!, 'Practice closes after motif/finalization, without an extra OUTRO bar').toBeLessThan(motifSec * 2 + .8);
      expect((await savedProgress(page)).recentAttempts).toEqual([]);

      await action(page, 'play').click();
      const play = await waitRun(page, 'play');
      record.playStart = play;
      expectRepetitions(play, 4, c.notesPerMotif);
      expect(play.snapshot?.expectationCount).toBe(c.expectationCount);
      expect(play.epoch! - play.countStart).toBeCloseTo(barSec, 5);
      await expect(page.locator('.result-page')).toHaveCount(0);
      await waitAt(page, play.epoch! + motifSec * 4 + .05);
      await expect(page.locator('.result-page')).toHaveCount(0);
      await expect.poll(async () => (await status(page)).snapshot?.finished, { timeout: 5_000 }).toBe(true);
      const outro = await status(page);
      record.playOutro = outro;
      expect(outro.screen).toBe('game');
      expect(outro.paused).toBe(false);
      await expect(page.locator('.score-number')).toBeVisible({ timeout: Math.ceil((barSec + 10) * 1000) });
      const finished = await status(page);
      record.result = finished;
      expect(finished.screen).toBe('result');
      expect(finished.audioNow - play.epoch!).toBeGreaterThanOrEqual(motifSec * 4 + barSec - .03);
      expect(finished.snapshot).toMatchObject({ finished: true, score: 0, earned: 0, extra: 0, expectationCount: c.expectationCount, completedPhrases: 4, invalidatedFrom: null });
      expect(finished.physicalOwner).toBeNull();
      expect(finished.logicalHold).toBeNull();
      const playAttacks = finished.diagnostics.filter(d => d.event === 'attack' && d.contextSec >= play.countStart - .2);
      const demoOrGuideAttacks = playAttacks.filter(d => d.id?.startsWith('demo-') || d.details?.includes('bus=guide'));
      const playerAttacks = playAttacks.filter(d => d.details?.includes('bus=player'));
      expect(demoOrGuideAttacks).toHaveLength(0);
      expect(playerAttacks).toHaveLength(0);
      record.playAttackCounts = { all: playAttacks.length, demoOrGuide: demoOrGuideAttacks.length, player: playerAttacks.length };
      await expect(page.locator('.score-number')).toContainText('0');
      const saved = await savedProgress(page);
      record.saved = saved;
      expect(saved.levels[c.id]).toEqual({ completed: true, bestStandard: 0, bestAssisted: null });
      expect(saved.recentAttempts).toHaveLength(1);
      expect(saved.recentAttempts[0]).toMatchObject({ levelId: c.id, score: 0, valid: true, assisted: false, completed: true, sessionId: finished.snapshot!.sessionId });
      expect(saved.recentAttempts[0]!.sessionChain).toEqual([finished.snapshot!.sessionId]);
      await page.screenshot({ path: artifact(c.id), fullPage: true });
      record.screenshot = artifact(c.id);

      if(c.id==='L03') {
        await page.locator('.education-card > summary').click();
        await expect(page.locator('#education-host img')).toHaveAttribute('src',/education_tie\.svg$/);
        await expect(page.locator('#education-host .preview')).toBeVisible();
        await action(page,'education-advanced').click();
        await expect(page.locator('#education-host img')).toHaveAttribute('src',/education_tie_advanced\.svg$/);
        await action(page,'education-basic').click();
        await expect(page.locator('#education-host img')).toHaveAttribute('src',/education_tie\.svg$/);
        await page.locator('.education-card > summary').click();
        await expect(page.locator('#education-host img')).toHaveCount(0);
        await expect(action(page,'focused-practice')).toContainText('75%');
        await action(page,'focused-practice').click();
        const focused=await waitRun(page,'practice');
        expect(focused.focusBars).toEqual([0,1]);
        expect(focused.notes).toHaveLength(4);
        expect(focused.snapshot?.expectationCount).toBe(8);
        expect(focused.epoch!-focused.countStart).toBeCloseTo(barSec/.75,5);
        expect(focused.notes.map(n=>n.sourceNotationIds)).toEqual([['c','d'],['f'],['c','d'],['f']]);
        expect(focused.notes[0]).toMatchObject({startTick:1440,endTick:2880,tieBoundaries:[1920]});
        expect((await savedProgress(page)).recentAttempts).toEqual(saved.recentAttempts);
        await page.waitForFunction(()=>
          (window as unknown as {__nightThread:{status():ObservedStatus}}).__nightThread.status().ready==='retry',
        undefined,{polling:'raf',timeout:35_000});
        const focusReview=await status(page);
        expect(focusReview.snapshot).toMatchObject({finished:true,score:0,expectationCount:8,completedPhrases:2});
        expect(focusReview.audioNow-focused.epoch!).toBeGreaterThanOrEqual(motifSec*2/.75-.03);
        expect(focusReview.audioNow-focused.epoch!).toBeLessThan(motifSec*2/.75+.8);
        await expect(page.locator('#ready-host')).toContainText('이 부분 연습 완료');
        await expect(action(page,'lesson-return')).toBeVisible();
        const afterFocused=await savedProgress(page);
        expect(afterFocused.recentAttempts).toEqual(saved.recentAttempts);
        expect(afterFocused.levels).toEqual(saved.levels);
        await page.screenshot({path:path.resolve('output/playwright/browser-chromium-L03-focused-review.png'),fullPage:true});
        await action(page,'lesson-return').click();
        await expect(page.locator('.rhythm-notation[data-level-id="L03"]')).toBeVisible();
        await expect(page.locator('.notation-barline')).toHaveCount(3);
        expect((await status(page)).screen).toBe('lesson');
        record.focused={focused,focusReview,afterFocused,canonicalLessonRestored:true,ledgerUnchanged:true,educationBasicAdvanced:true};
      }

      // A real navigation and reload preserve exactly the one PLAY attempt;
      // LISTEN, practice, OUTRO, and displaying the result add no extra entry.
      await action(page, 'map').click();
      await expect(page.locator('.dream-card')).toHaveCount(4);
      await page.reload();
      await expect(action(page, 'unlock')).toBeVisible();
      await action(page, 'unlock').click();
      await expect(action(page, `lesson:${c.id}`)).toHaveClass(/done/);
      const afterReload = await savedProgress(page);
      record.savedAfterReload = afterReload;
      expect(afterReload.recentAttempts).toEqual(saved.recentAttempts);
      expect(afterReload.levels[c.id]).toEqual(saved.levels[c.id]);
      expect(new Set(afterReload.recentAttempts.map(a => a.id)).size).toBe(1);
      expect(pageErrors.get(page)).toEqual([]);
    });
  }
});
