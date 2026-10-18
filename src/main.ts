import './style.css';
import './layout-fixes.css';
import { AudioEngine, CalibrationController } from './audio';
import { DreamScene, type SceneNote } from './scene';
import { assetUrl, SCENE_BACKGROUND, getEducationCard, type SceneId } from './assets';
import { compileLevel, JudgeEngine, evaluateMastery, focusedPracticeBars, type Level, type CompiledTimeline, type JudgeSnapshot, type JudgeEvent } from './core';
import { levels, campaignOrder } from './content';
import { LESSONS, METER_QUIZ } from './lessons';
import { comparisonPatterns } from './comparisons';
import { renderNotation } from './notation';
import { ProgressStore } from './core/storage';

type Mode = 'listen' | 'practice' | 'play';
type Screen = 'home' | 'map' | 'lesson' | 'game' | 'result' | 'calibration';
type Settings = { key: string; reducedMotion: boolean; highContrast: boolean; toggleHold: boolean; wideWindows: boolean; guide: boolean; showBeat: boolean; visualOffsetMs: number; inputOffsetMs: number; volume: number; clickVolume:number; guideVolume:number; bgmVolume:number; sfxVolume:number; vibration:boolean };
const defaults: Settings = { key:'Space', reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches, highContrast:false, toggleHold:false, wideWindows:false, guide:false, showBeat:false, visualOffsetMs:0, inputOffsetMs:0, volume:.65, clickVolume:.7,guideVolume:.8,bgmVolume:.45,sfxVolume:.6,vibration:false };
const root = document.querySelector<HTMLDivElement>('#app')!;
const store = new ProgressStore({getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value),removeItem:key=>localStorage.removeItem(key)});
const progress = store.load();
let settings: Settings = {...defaults, ...progress.settings,key:progress.settings.keyCode,showBeat:progress.settings.showCounts,inputOffsetMs:progress.calibration.inputOffsetMs};
try{if(!localStorage.getItem('night-thread.progress.v1'))settings.reducedMotion=defaults.reducedMotion;}catch{settings.reducedMotion=defaults.reducedMotion;}
let screen: Screen = 'home';
let selected = levels.find(l=>l.id === progress.lastLessonId) ?? levels[0];
let renderer: DreamScene | null = null;
let raf = 0, runSerial = 0, sequence = 0;
let ready: 'practice' | 'play' | 'retry' | null = null;
let calibration: CalibrationController | null = null;
let calibrationEnd = 0;
let physicalOwner: string | null = null, logicalHold: string | null = null, keyRearm = false;
const physicallyHeld=new Set<string>(), rearmBlocked=new Set<string>();
let lastPose: 'press'|'release'|'miss'|'idle' = 'idle', feedbackAt = 0;
let modalReturn: HTMLElement | null = null;
let meterAnswers:Record<number,number>={};
let comparisonGeneration=0;
type Run={mode:Mode; compiled:CompiledTimeline; judge:JudgeEngine|null; epoch:number; countStart:number; paused:boolean; pauseReason:string; speed:number; restartSec:number; attemptId:string; resultSaved:boolean; outroStart:number|null; sessionIds:string[];config:Settings;focusBars:number[]|null};
let session: Run | null = null;
const inputEpochs:{perfStart:number;perfEnd:number;audibleAnchor:number;epoch:number;sessionId:string;run:Run}[]=[];
const audio = new AudioEngine({ onInterrupted: reason => interrupt(reason) });
audio.setVolume(settings.volume);
audio.setInputOffsetMs(settings.inputOffsetMs);
function applyMix():void {audio.setBusVolume('metronome',settings.clickVolume);audio.setBusVolume('guide',settings.guideVolume);audio.setBusVolume('bgm',settings.bgmVolume);audio.setBusVolume('sfx',settings.sfxVolume);}
applyMix();
const names: Record<SceneId,string> = {'thread-bridge':'실빛다리','crescent-greenhouse':'반달 온실','folding-room':'접히는 방','cloud-post':'구름 우체역'};
const scenes = Object.keys(names) as SceneId[];
const levelById = (id:string) => levels.find(l=>l.id===id)!;
const $ = <T extends HTMLElement=HTMLElement>(selector:string) => root.querySelector<T>(selector);
const esc = (s:string) => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const announce = (text:string) => { const live=document.getElementById('status-live'); if(live)live.textContent=text; };
function button(label:string,action:string,cls=''):string {const name=action==='settings'?'설정 열기':action==='pause'?'일시정지':action==='close'?'대화상자 닫기':null;return `<button class="${cls}" data-action="${action}"${name?` aria-label="${name}"`:''}>${label}</button>`;}
function topbar():string {return `<header class="topbar"><a href="#" class="brand" data-action="map" aria-label="밤실 공방 꿈 지도"><span class="brand-mark" aria-hidden="true">✳</span><span class="brand-title">밤실 공방</span></a><div class="top-actions"><span class="sound-indicator">${audio.running?'소리 준비됨':'소리와 함께하는 작은 꿈'}</span>${button('⚙','settings','icon-button')}</div></header>`;}
function footer():string {return `<footer class="footer"><span>NIGHT THREAD WORKSHOP · 꿈을 잇는 리듬</span><span>이 기기에만 저장 · 교육자·청음 검수 전 내부 프리뷰</span></footer>`;}
function stopView():void {cancelAnimationFrame(raf);renderer?.dispose();renderer=null;}
function pruneEpochs():void {while(inputEpochs.length>32||inputEpochs[0]&&performance.now()-inputEpochs[0].perfStart>300000)inputEpochs.shift();}
function closeEpochs():void {const now=performance.now();for(const e of inputEpochs)if(e.perfEnd===Infinity)e.perfEnd=now;pruneEpochs();}
function shell(html:string):void {closeEpochs();comparisonGeneration++;stopView();root.innerHTML=`${html}<div class="sr-only" role="status" aria-live="polite" id="status-live"></div>`;root.classList.toggle('high-contrast',settings.highContrast);root.classList.toggle('reduced-motion',settings.reducedMotion);window.scrollTo(0,0);}
async function mountScene(canvas:HTMLCanvasElement,scene:SceneId):Promise<boolean> {
  const current = new DreamScene(canvas);renderer=current;canvas.addEventListener('contextlost',()=>interrupt('canvas-context-lost'));
  try {await current.setScene(scene);if(renderer!==current)return false;return true;}catch(e){if(renderer===current){toast('그림을 불러오지 못했어요. 다시 준비할 수 있습니다.');canvas.closest('.hero-art,.lesson-visual,.stage,.intro-art')?.insertAdjacentHTML('beforeend',`<div class="ready-panel"><div class="ready-card"><h2>그림을 다시 준비할게요</h2><p>${esc(String(e))}</p>${button('다시 불러오기','reload','primary')}${button('꿈 지도로','map')}</div></div>`);}return false;}
}
function idleDraw():void {if(!renderer||screen==='game')return;renderer.render({tick:audio.running?audio.now()*160:0,quarterBpm:72,phase:'idle',holding:false,reducedMotion:settings.reducedMotion,highContrast:settings.highContrast});raf=requestAnimationFrame(idleDraw);}
async function home():Promise<void> {
  audio.stop();session=null;screen='home';ready=null;
  shell(`${topbar()}<main class="page"><div class="intro"><div class="intro-copy"><div class="eyebrow">A LITTLE RHYTHM, A LITTLE DREAM</div><h1>한 올의 리듬으로<br>꿈을 이어 볼까요.</h1><p>누르고, 이어 누르고, 제때 놓고.<br>네 개의 작은 꿈에서 음악의 길이와<br>쉼, 박자와 빠르기를 만나세요.</p><p class="note-line">솜새의 연주를 먼저 들어 보세요.<br>서두르지 않아도 괜찮아요. 연습은 언제든 다시.</p>${button('소리 켜고 꿈에 들어가기　↗','unlock','primary')}<small>터치 또는 Space · 이어폰 권장 · 볼륨은 편안하게</small></div><div class="intro-art"><canvas aria-label="실빛다리에서 기다리는 여울과 솜새"></canvas></div></div>${footer()}</main>`);
  if(await mountScene($('canvas') as HTMLCanvasElement,'thread-bridge'))idleDraw();
}
async function map():Promise<void> {
  audio.stop();session=null;screen='map';ready=null;physicalOwner=null;logicalHold=null;
  const nextId=campaignOrder.find(id=>!progress.levels[id]?.completed) ?? campaignOrder[0];
  const next=levelById(nextId);
  shell(`${topbar()}<main class="page"><header class="page-header"><div><div class="eyebrow">YOUR DREAM JOURNAL</div><h1>오늘은 어떤 꿈을 이을까요?</h1></div><p>작은 맥박에 귀를 기울여 보세요.<br>한 번의 누름이, 하나의 풍경이 됩니다.</p></header><section class="map-hero"><div class="hero-art"><canvas aria-label="오늘의 꿈, ${names[next.scene]}"></canvas><div class="art-caption"><span>✦</span> 소리와 움직임이 만나는 곳</div></div><div class="hero-copy"><div class="eyebrow">${progress.levels[next.id]?.completed?'다시 만나고 싶은 꿈':'다음으로 이어 볼 꿈'} · ${next.id}</div><h2>${next.title}</h2><div class="lesson-meta"><span>${names[next.scene]}</span><i>·</i><span>${next.meter.n}/${next.meter.d} 박자</span></div><p>${LESSONS[next.id].concept}</p>${button('이 꿈 이어가기　→',`lesson:${next.id}`,'primary')}<small>먼저 듣고 · 충분히 연습하고 · 나만의 연주로</small></div></section><div class="section-title"><h2>네 개의 꿈, 아홉 번의 발견</h2><span>순서대로 또는 마음이 가는 곳부터</span></div><section class="dream-grid" aria-label="꿈 지도">${scenes.map((s,i)=>`<article class="dream-card"><div class="dream-image"><img src="${assetUrl(SCENE_BACKGROUND[s])}" alt="" loading="lazy"><span class="dream-number">0${i+1}</span></div><div class="dream-body"><h3>${names[s]}</h3><p>${['길이를 잇는 황금빛 실','한 점으로 피어나는 꽃','같은 여섯 걸음, 다른 묶음','빠르기가 바뀌는 편지'][i]}</p><div class="dream-lessons">${levels.filter(l=>l.scene===s).map(l=>`<button data-action="lesson:${l.id}" class="${progress.levels[l.id]?.completed?'done':''}" aria-label="${l.id} ${l.title}">${l.id}${progress.levels[l.id]?.completed?' ✓':''}</button>`).join('')}</div></div></article>`).join('')}</section>${footer()}</main>`);
  if(await mountScene($('canvas') as HTMLCanvasElement,next.scene))idleDraw();
  announce('꿈 지도. 네 장면의 아홉 수업을 자유롭게 선택할 수 있어요.');
}
function tempo(level:Level):string {return level.meter.d===8?`점4분음표 = ${level.quarterBpm/1.5}`:`4분음표 = ${level.quarterBpm}`;}
async function lesson(id:string):Promise<void> {
  audio.stop();session=null;selected=levelById(id);screen='lesson';ready=null;
  progress.lastLessonId=id;saveSettings();
  const l=selected,c=LESSONS[id],index=campaignOrder.indexOf(id),previous=campaignOrder.slice(0,index).filter(p=>!progress.levels[p]?.completed);
  shell(`${topbar()}<main class="page"><div class="back-row">${button('← 꿈 지도','map','text-button')}<span class="badge">${id} · ${l.meter.n}/${l.meter.d} · ${tempo(l)}</span></div><div class="lesson-layout"><div class="lesson-visual"><canvas aria-label="${names[l.scene]} 수업 미리보기"></canvas><div class="notation-area">${renderNotation(l)}</div></div><section class="lesson-description"><div class="eyebrow">${names[l.scene]} · ${c.eyebrow}</div><h2>${l.title}</h2><p>${c.concept}</p><p>${c.instruction}</p>${previous.length?`<small>추천 순서에서는 ${previous.at(-1)}을 먼저 만나요. 지금 이 수업부터 시작해도 괜찮아요.</small>`:''}<div class="flow-steps"><span><b>01</b> 먼저 듣기</span><span><b>02</b> 함께 연습</span><span><b>03</b> 나의 연주</span></div>${button('솜새의 연주 듣기　▷','listen','primary')}${button('소리 없이 개념 살펴보기','concept','text-button')}<small>시연은 점수로 기록되지 않아요. 듣기를 마친 뒤 직접 시작할 수 있어요.</small></section></div>${footer()}</main>`);
  if(await mountScene($('canvas') as HTMLCanvasElement,l.scene))idleDraw();
  announce(`${l.title}. ${c.instruction}`);
}
async function ensureAudio():Promise<boolean> {if(await audio.unlock()){audio.setVolume(settings.volume);audio.setInputOffsetMs(settings.inputOffsetMs);return true;}toast('소리를 켜지 못했어요. 소리 켜기를 다시 눌러 주세요.');return false;}
async function start(mode:Mode,speed=1,resume=false,focusBars:number[]|null=null):Promise<void> {
  if(rearmBlocked.size){toast('이전에 눌렀던 키나 손가락을 놓은 뒤 다시 이어 주세요.');return;}
  if(!await ensureAudio())return;
  let previous=session;
  audio.stop();physicalOwner=null;logicalHold=null;keyRearm=false;
  screen='game';ready=null;
  const config=resume&&previous?previous.config:{...settings};
  const actualFocus=resume&&previous?previous.focusBars:focusBars;
  const chartLevel=actualFocus?{...selected,bars:actualFocus.map(index=>selected.bars[index])}:selected;
  const count=resume&&previous?previous.compiled:compileLevel(chartLevel,{repeats:mode==='play'?4:2,speed:mode==='listen'?1:speed,wideWindows:config.wideWindows});
  const sid=`session-${++runSerial}`;
  const judge=mode==='listen'?null:resume&&previous?.judge?previous.judge:new JudgeEngine(count,{sessionId:sid,inputOffsetMs:config.inputOffsetMs});
  let restartSec=0;
  if(resume&&judge){const restart=judge.snapshot().restartTick;restartSec=restart/480*60/count.effectiveQuarterBpm;judge.resume(sid);}
  const attemptId=resume&&previous?previous.attemptId:crypto.randomUUID();
  session={mode,compiled:count,judge,epoch:0,countStart:0,paused:false,pauseReason:'',speed,restartSec,attemptId,resultSaved:false,outroStart:null,sessionIds:resume&&previous?[...previous.sessionIds,sid]:[sid],config,focusBars:actualFocus};
  shell(`${topbar()}<main class="play-screen"><header class="play-hud"><div class="play-title"><small>${mode==='listen'?'먼저 듣기':mode==='practice'?'함께 연습':'나의 연주'}</small>${names[selected.scene]} · ${selected.title}</div><div class="knots" aria-label="${mode==='play'?'네 번의 연주':'두 번의 연습'}">${Array.from({length:mode==='play'?4:2},()=>'<span class="knot"></span>').join('')}</div>${button('Ⅱ','pause','icon-button')}</header><div class="game-layout"><div class="stage"><canvas aria-label="${names[selected.scene]} 리듬 장면"></canvas><div class="stage-overlay"><div id="stage-message" class="stage-message">꿈을 준비하고 있어요…</div></div><div id="ready-host"></div></div><div class="action-container"><button class="action-pad" id="action-pad" aria-label="누르기와 놓기 연주 영역"><span class="action-circle" aria-hidden="true"></span><span id="pad-text">누르기</span></button><small>${settings.key==='Space'?'Space':settings.key.replace('Key','')} 또는 터치${config.toggleHold?' · 한 번씩 눌러 시작 / 놓기':''}</small></div></div><div class="stage-legend"><span>● 누르기</span><span>━ 이어 누르기</span><span>○ 놓기</span><span>┄ 기다리기</span></div></main>`);
  const active=session;
  if(!await mountScene($('canvas') as HTMLCanvasElement,selected.scene)||session!==active||active.paused||!audio.running||document.hidden)return;
  audio.start();
  const countDuration=count.barTicks/480*60/count.effectiveQuarterBpm;
  active.countStart=audio.contextTime()+.25;
  active.epoch=active.countStart+countDuration-restartSec;
  const perfStart=performance.now();inputEpochs.push({perfStart,perfEnd:Infinity,audibleAnchor:audio.performanceToAudioTime(perfStart),epoch:active.epoch,sessionId:sid,run:active});
  pruneEpochs();
  const beginTick=restartSec/60*count.effectiveQuarterBpm*480;
  for(let t=-count.barTicks;t<0;t+=240){const big=selected.meter.groupingEighths.reduce<number[]>((a,g)=>[...a,a.at(-1)!+g*240],[0]).slice(0,-1);const inBar=t+count.barTicks;audio.pulse(active.epoch+restartSec+t/480*60/count.effectiveQuarterBpm,inBar===0,big.includes(inBar)?'beat':'subdivision');}
  for(const cue of count.beats.filter(b=>b.tick>=beginTick)){audio.pulse(active.epoch+cue.timeSec,cue.first,cue.major?'beat':'subdivision');}
  if(mode==='listen'||(mode==='practice'&&config.guide))for(const note of count.notes.filter(n=>n.startSec>=restartSec)){audio.scheduleNote({id:`demo-${sid}-${note.id}`,midi:note.midi,startSec:active.epoch+note.startSec,endSec:active.epoch+note.endSec,kind:'demo',gain:mode==='practice'?.18:.55});}
  for(const phrase of count.phrases.filter(p=>p.startSec>=restartSec)){audio.drone(active.epoch+phrase.startSec,active.epoch+phrase.endSec);}
  if(mode==='listen'){for(let t=0;t<count.barTicks;t+=240)audio.pulse(active.epoch+count.durationSec+t/480*60/count.effectiveQuarterBpm,t===0,'subdivision');}
  bindPad();announce(mode==='listen'?'솜새의 연주를 들어 보세요.':'한 마디를 센 뒤 시작해요.');
  frame();
}
function process(events:JudgeEvent[]):void {
  const s=session;if(!s)return;
  for(const e of events){
    if(e.type==='INTERRUPT'){if(s.resultSaved){store.revoke(s.attemptId);s.resultSaved=false;}interrupt(e.reason,true);return;}
    const note=s.compiled.notes.find(n=>n.id===e.noteId||n.id===e.expectationId);
    if(e.type==='ONSET_RESULT'&&e.points>0&&note){audio.liveNote({id:note.id,midi:note.midi,targetEndSec:s.epoch+note.endSec,kind:note.interaction,releaseWindowMs:note.releaseWindow.lateMs});lastPose='press';feedbackAt=audio.now();if(note.interaction==='hold')logicalHold=note.id;if(settings.vibration)navigator.vibrate?.(12);}
    if(e.type==='RELEASE_RESULT'){if(note)audio.release(note.id);logicalHold=null;lastPose=e.points>0?'release':'miss';feedbackAt=audio.now();}
    if(e.type==='MISS'||e.type==='EXTRA_DOWN'){lastPose='miss';feedbackAt=audio.now();}
  }
}
function edge(kind:'down'|'up',timestamp:number):void {
  const s=session;
  if(screen==='calibration'){if(kind==='down'&&calibration){try{calibration.accept(audio.performanceToAudioTime(audio.eventTimeStampToPerf(timestamp)));}catch{toast('시각을 읽지 못했어요. 보정을 다시 시작해 주세요.');}}return;}
  try{
    const perf=audio.eventTimeStampToPerf(timestamp);
    pruneEpochs();const origin=inputEpochs.findLast(e=>perf>=e.perfStart&&perf<e.perfEnd);
    if(origin&&origin.run.judge&&(origin.run!==s||origin.perfEnd!==Infinity||screen==='result'||origin.run.paused)){
      const historicalTime=origin.audibleAnchor+(perf-origin.perfStart)/1000-origin.epoch;
      const events=origin.run.judge.ingest({kind,timeSec:historicalTime,receiptSec:historicalTime+(performance.now()-perf)/1000,id:`edge-${sequence++}`,sessionId:origin.sessionId});
      const conflict=events.find(e=>e.type==='INTERRUPT');
      if(conflict){if(origin.run.resultSaved||progress.recentAttempts.some(a=>a.id===origin.run.attemptId&&a.valid)){store.revoke(origin.run.attemptId);origin.run.resultSaved=false;}if(s?.judge===origin.run.judge){screen='game';s.paused=false;interrupt(conflict.reason,true);}else toast('전달이 늦은 입력이 확인되어 해당 연주 기록을 철회했어요. 다시 연습할 수 있습니다.');}return;
    }
    if(!s||s.paused||ready||screen!=='game')return;
    const timeSec=audio.performanceToAudioTime(perf)-s.epoch,receiptSec=audio.now()-s.epoch;
    if(s.mode==='listen'){lastPose=kind==='down'?'press':'release';feedbackAt=audio.now();return;}
    if(timeSec-s.config.inputOffsetMs/1000 < s.restartSec-(s.compiled.notes.find(n=>n.startSec>=s.restartSec)?.onsetWindow.lateMs??140)/1000)return;
    if(s.config.toggleHold){if(kind==='up'&&logicalHold)return;if(kind==='down'&&logicalHold){process(s.judge!.ingest({kind:'up',timeSec,receiptSec,id:`edge-${sequence++}`,sessionId:s.judge!.snapshot().sessionId}));return;}}
    process(s.judge!.ingest({kind,timeSec,receiptSec,id:`edge-${sequence++}`,sessionId:s.judge!.snapshot().sessionId,sequence}));
  }catch{interrupt('invalid-input-timestamp');}
}
function bindPad():void {
  const pad=$<HTMLButtonElement>('#action-pad');if(!pad)return;
  pad.addEventListener('pointerdown',e=>{if(physicalOwner)return;physicalOwner=`p${e.pointerId}`;pad.setPointerCapture(e.pointerId);pad.classList.add('held');e.preventDefault();edge('down',e.timeStamp);});
  pad.addEventListener('pointerup',e=>{if(physicalOwner!==`p${e.pointerId}`)return;physicalOwner=null;pad.classList.remove('held');edge('up',e.timeStamp);if(pad.hasPointerCapture(e.pointerId))pad.releasePointerCapture(e.pointerId);});
  pad.addEventListener('pointercancel',e=>{if(physicalOwner===`p${e.pointerId}`)interrupt('pointercancel');});
  pad.addEventListener('lostpointercapture',e=>{if(physicalOwner===`p${e.pointerId}`)interrupt('lost-pointer-capture');});
}
function sceneNotes(s:NonNullable<typeof session>,snapshot:JudgeSnapshot|null):SceneNote[] {return [...s.compiled.notes.map(n=>{const evidence=snapshot?.notes.find(e=>e.noteId===n.id);return {id:n.id,onsetTick:n.startTick,endTick:n.endTick,kind:n.interaction,tieBoundaryTicks:n.tieBoundaries,status:evidence?evidence.status==='PENDING'?'pending':evidence.status==='ACTIVE'?'active':['HIT','RELEASED'].includes(evidence.status)?'success':'miss':'pending'} as SceneNote;}),...s.compiled.rests.map(r=>({id:r.id,onsetTick:r.startTick,endTick:r.endTick,kind:'rest' as const}))];}
function frame():void {
  const s=session;if(!s||screen!=='game'||!renderer)return;
  if(s.paused||ready){renderer.render({tick:Math.max(0,s.restartSec)/60*s.compiled.effectiveQuarterBpm*480,quarterBpm:s.compiled.effectiveQuarterBpm,phase:s.paused?'paused':'idle',holding:false,notes:sceneNotes(s,s.judge?.snapshot()??null),reducedMotion:settings.reducedMotion,highContrast:settings.highContrast});return;}
  const relative=audio.now()-s.epoch;
  const visual=(relative+s.config.visualOffsetMs/1000)/60*s.compiled.effectiveQuarterBpm*480;
  const countIn=relative<s.restartSec;
  if(s.judge&&relative>=s.restartSec-.2)process(s.judge.advanceTo(relative));
  if(s.paused)return;
  const snapshot=s.judge?.snapshot()??null;
  const message=$('#stage-message');
  const barSec=s.compiled.barTicks/480*60/s.compiled.effectiveQuarterBpm;
  let phase:Mode|'count-in'|'outro'=countIn?'count-in':s.mode;
  if(countIn){const remain=s.restartSec-relative,beat=selected.meter.d===8?720:480,beatSec=beat/480*60/s.compiled.effectiveQuarterBpm;const n=Math.min(selected.meter.d===8?2:selected.meter.n,Math.max(1,Math.ceil(remain/beatSec)));if(message)message.innerHTML=`<span class="count-number">${n}</span><span class="sub">${s.mode==='listen'?'솜새의 연주가 시작돼요':'한 마디를 함께 세어요'}</span>`;}
  else if(s.mode==='listen'&&relative>=s.compiled.durationSec){if(message)message.innerHTML='여운을 들으며 기다려요<span class="sub">작은 맥박은 계속 이어져요</span>';}
  else if(s.outroStart!==null){phase='outro';if(message)message.innerHTML='꿈의 매듭을 묶고 있어요<span class="sub">마지막 여운까지 함께</span>';}
  else if(message){if(s.mode==='practice'&&audio.now()-feedbackAt<.7&&lastPose!=='idle'){message.innerHTML=lastPose==='miss'?'괜찮아요, 다음 맥박으로':lastPose==='release'?'○ 잘 놓았어요':'● 이어가요';message.style.visibility='visible';}else if(settings.showBeat){const beat=selected.meter.d===8?720:480;message.textContent=String(Math.floor(Math.max(0,visual)%s.compiled.barTicks/beat)+1);message.style.visibility='visible';}else message.style.visibility='hidden';}
  if(message&&(countIn||s.outroStart!==null||relative>=s.compiled.durationSec&&s.mode==='listen'))message.style.visibility='visible';
  const holding=snapshot?.notes.some(n=>n.status==='ACTIVE')??false;
  renderer.render({tick:visual,quarterBpm:s.compiled.effectiveQuarterBpm,phase,holding,pose:audio.now()-feedbackAt<.08&&lastPose==='press'?'press':holding?'hold':audio.now()-feedbackAt<.35?lastPose:countIn?'prepare':undefined,notes:sceneNotes(s,snapshot),meter:[selected.meter.n,selected.meter.d],grouping:selected.meter.groupingEighths,reducedMotion:settings.reducedMotion,highContrast:settings.highContrast,feedbackTick:visual-(audio.now()-feedbackAt)/60*s.compiled.effectiveQuarterBpm*480,lastFeedback:audio.now()-feedbackAt<.35?lastPose==='miss'?'miss':'success':null});
  const pad=$('#action-pad');pad?.classList.toggle('release',holding);const padText=$('#pad-text');if(padText)padText.textContent=holding?s.config.toggleHold?'한 번 더 눌러 놓기':'이어 누르기 · 빈 원에서 놓기':'누르기';
  const phrase=Math.min(s.compiled.phrases.length-1,Math.floor(Math.max(0,relative)/s.compiled.motifDurationSec));root.querySelectorAll('.knot').forEach((k,i)=>k.classList.toggle('active',i<=phrase&&!countIn));
  if(s.mode==='listen'&&relative>=s.compiled.durationSec+barSec){audio.stop();showReady('practice');return;}
  if(s.mode!=='listen'&&snapshot?.finished&&relative>=s.compiled.durationSec){if(s.mode==='practice'){audio.stop();if(s.focusBars)showFocusedReview();else showReady('play');return;}if(s.outroStart===null){s.outroStart=relative;const at=audio.contextTime()+.05;audio.drone(at,at+barSec);announce('연주를 마쳤어요. 마지막 여운을 기다려요.');}else if(relative>=s.outroStart+barSec){audio.stop();result();return;}}
  raf=requestAnimationFrame(frame);
}
function showReady(next:'practice'|'play'|'retry'):void {
  closeEpochs();ready=next;const host=$('#ready-host');if(!host)return;
  const title=next==='practice'?'이제, 손끝으로 이어 볼까요?':next==='play'?'나만의 연주를 남길 시간':'다시 이어 볼까요?';
  host.innerHTML=`<div class="ready-panel"><section class="ready-card"><div class="eyebrow">${next==='practice'?'솜새의 시연 완료':'연습 완료'}</div><h2>${title}</h2><p>${next==='practice'?LESSONS[selected.id].practiceHint:'같은 모티프를 네 번 이어갑니다. 누르지 않으면 정답 선율은 들리지 않아요.'}</p>${next==='practice'?`<div class="options-row"><label>연습 속도 <select id="practice-speed"><option value="0.75">원곡의 75%</option><option value="1">원곡의 100%</option></select></label></div>`:''}${button(next==='practice'?'연습 시작 · 2회':'이제 해보기 · 4회',next==='practice'?'practice':'play','primary')}${button(next==='practice'?'한 번 더 듣기':'조금 더 연습하기',next==='practice'?'listen':'practice','text-button')}${button('꿈 지도','map','text-button')}</section></div>`;announce(title);host.querySelector<HTMLButtonElement>('.primary')?.focus();
}
function interrupt(reason:string,already=false):void {
  if(screen==='calibration'){
    audio.stop();cancelAnimationFrame(raf);calibration=null;
    showModal(`<h2>보정을 잠시 멈췄어요</h2><p style="margin:20px 0">소리나 화면이 바뀌었어요. 편안할 때 처음부터 다시 맞춰 주세요.</p>${button('다시 맞추기','calibrate','primary')}${button('그대로 꿈 지도로','map')}`);return;
  }
  const s=session;if(!s||screen!=='game'||s.paused||ready)return;
  if(!already)s.judge?.interrupt(reason,Math.max(0,audio.now()-s.epoch));
  for(const token of physicallyHeld)rearmBlocked.add(token);
  audio.stop();s.paused=true;s.pauseReason=reason;physicalOwner=null;logicalHold=null;keyRearm=true;cancelAnimationFrame(raf);
  closeEpochs();
  const host=$('#ready-host');if(host)host.innerHTML=`<div class="ready-panel"><section class="ready-card"><div class="eyebrow">잠시 쉬어 가요</div><h2>꿈은 여기서 기다릴게요</h2><p>${reason==='user-pause'?'편안할 때 다시 이어 주세요.':'화면이나 소리가 바뀌어 잠시 멈췄어요. 지금 프레이즈는 다시 시작해요.'}</p><small>이미 마친 매듭은 남기고, 한 마디를 새로 센 뒤 이어갑니다. 눌렀던 손을 먼저 놓아 주세요.</small>${button('이어하기','resume','primary')}${button('처음부터 다시','restart')}${button('꿈 지도로','map','text-button')}</section></div>`;
  if(!host)showModal(`<h2>전달이 늦은 입력을 확인했어요</h2><p style="margin:20px 0">해당 연주와 최고점 근거를 철회했어요. 영향을 받은 프레이즈부터 한 마디를 새로 세고 다시 이어갈 수 있어요.</p>${button('이어하기','resume','primary')}${button('꿈 지도로','map')}`);
  announce('일시정지. 지금 프레이즈를 새 카운트인 뒤 다시 시작합니다.');
}
function assisted():boolean {const c=session?.config??settings;return c.toggleHold||c.wideWindows||c.guide||c.showBeat;}
function result():void {
  const s=session;if(!s?.judge)return;
  const snap=s.judge.snapshot();if(!snap.finished)return;
  screen='result';physicalOwner=null;logicalHold=null;
  const metric=snap.metrics;
  meterAnswers={};
  if(!s.resultSaved){store.record({id:s.attemptId,sessionId:s.judge.snapshot().sessionId,levelId:selected.id,score:snap.score,assisted:assisted(),assists:['toggleHold','wideWindows','guide','showBeat'].filter(k=>s.config[k as keyof Settings]===true),valid:true,metrics:metric,completed:true,sessionChain:s.sessionIds});s.resultSaved=true;}
  const inputEpoch=inputEpochs.findLast(e=>e.run===s);if(inputEpoch)inputEpoch.perfEnd=performance.now();
  const percent=(n:number|null)=>n===null?'해당 없음':`${Math.round(n*100)}%`;
  const c=LESSONS[selected.id];const standard=!assisted();
  const stars=evaluateMastery(selected,snap,!standard).stars;
  shell(`${topbar()}<main class="result-page"><header class="result-header"><div class="result-seal" aria-hidden="true">✧</div><div class="eyebrow">${names[selected.scene]} · ${selected.id}</div><h2>하나의 꿈을 이었어요.</h2><p class="muted">${selected.title}</p></header><section class="score-card"><span class="badge ${standard?'':'assisted'}">${standard?'기본 연주':'도움과 함께한 연주'}</span><div class="score-number">${snap.score}<span> / 100</span></div><div class="stars" aria-label="별 ${stars}개">${'✦'.repeat(stars)}${'✧'.repeat(3-stars)}</div><small>네 번의 연주를 끝까지 마쳤어요.</small><div class="metrics"><div class="metric"><strong>${percent(metric.releaseInWindowRatio)}</strong><small>${s.config.toggleHold?'놓기 타이밍 · 탭 보조':'제때 놓기'}</small></div><div class="metric"><strong>${percent(metric.restCleanRatio)}</strong><small>기다린 쉼</small></div><div class="metric"><strong>${metric.onsetMedianAbsError===null?'—':Math.round(metric.onsetMedianAbsError)+'ms'}</strong><small>시작 오차 중앙값</small></div></div></section><section class="result-exercise"><h3>다음엔 이렇게 이어 보세요</h3><p>${snap.score>=90?c.resultHint:metric.releaseInWindowRatio!==null&&metric.releaseInWindowRatio<.75?'황금빛 실을 끝까지 이어 누르다가, 빈 원이 오는 순간 놓아 보세요.':metric.restCleanRatio!==null&&metric.restCleanRatio<.75?'쉼에는 손을 놓고 작은 맥박을 세어 보세요. 소리가 쉬어도 시간은 이어져요.':c.resultHint}</p><small>${standard?'기본 연주 근거로 저장됩니다.':`도움 기록: ${[s.config.toggleHold?'시작·끝 탭':'',s.config.wideWindows?'넓은 판정':'',s.config.guide?'정답 가이드':'',s.config.showBeat?'큰박 숫자':''].filter(Boolean).join(' · ')}. 기본 최고점과 별도로 저장됩니다.`}</small>${store.warning?`<p class="warning">저장이 어려워요. 현재 결과는 그대로 볼 수 있습니다.</p>`:''}</section>${quizHtml()}<details class="result-exercise"><summary>내 연주 자세히 보기</summary><p>붙임줄 유지 ${percent(metric.tieContinuousRatio)} · 다시 들어오기 ${percent(metric.reentryRatio)}</p><small>평가 ${snap.expectationCount}개 · 얻은 계수 ${snap.earned.toFixed(2)} · 추가 누름 ${snap.extra}회. 쉼은 점수 분모에 포함하지 않습니다.</small></details><details class="education-card"><summary>그림으로 개념 돌아보기</summary><div id="education-host"></div></details><div class="result-actions">${button('다음 꿈 이어가기　→','next','primary')}${button('이 부분 연습 · 원곡의 75%','focused-practice','secondary')}</div>${button('← 꿈 지도','map','text-button')}${footer()}</main>`);
  $('.education-card')?.addEventListener('toggle',e=>{const d=e.currentTarget as HTMLDetailsElement;const host=$('#education-host');if(!host)return;if(d.open)renderEducation();else host.innerHTML='';});
  announce(`연주를 마쳤어요. ${snap.score}점. ${standard?'기본 연주':'도움과 함께한 연주'}로 기록했어요.`);
}
async function startFocused():Promise<void> {
  const s=session;if(!s?.judge)return;
  const snap=s.judge.snapshot();
  const failedIds=s.compiled.notes.filter(n=>{const e=snap.notes.find(e=>e.noteId===n.id);return e?.onsetPoints===0||n.interaction==='hold'&&e?.releasePoints===0;}).flatMap(n=>n.sourceNotationIds);
  const bars=s.focusBars??focusedPracticeBars(selected,failedIds);
  await start('practice',.75,false,bars);
  announce(`원래 수업의 ${bars.map(i=>i+1).join('·')}마디를 두 번 연습해요. 기본 최고점은 바뀌지 않아요.`);
}
function showFocusedReview():void {
  const s=session;if(!s?.judge)return;closeEpochs();ready='retry';
  const host=$('#ready-host');if(!host)return;
  host.innerHTML=`<div class="ready-panel"><section class="ready-card"><div class="eyebrow">이 부분 연습 완료 · 원곡의 75%</div><h2>한 번 더 이어도 괜찮아요.</h2><p>원래 수업의 ${s.focusBars!.map(i=>i+1).join('·')}마디를 두 번 연습했어요. 붙임줄은 처음부터 끝까지 함께 가져왔어요.</p><small>연습 점수 ${s.judge.snapshot().score}점 · 원래 레벨의 최고점과 완료 기록에는 반영하지 않습니다.</small>${button('같은 부분 다시 연습 · 75%','focused-practice','primary')}${button('원래 수업으로 돌아가기','lesson-return')}${button('꿈 지도','map','text-button')}</section></div>`;
  announce('이 부분 연습을 마쳤어요. 다시 연습하거나 원래 수업으로 돌아갈 수 있어요.');
}
function educationConcept(){return selected.id==='L05'?'dotted_rest':selected.id==='L04'?'dot':['L06','L07'].includes(selected.id)?'meter':['L08','L09'].includes(selected.id)?'tempo':selected.id==='L01'?'duration':'tie';}
function renderEducation(advanced=false):void {const host=$('#education-host');if(!host)return;const concept=educationConcept(),card=getEducationCard(concept,advanced),hasAdvanced=getEducationCard(concept,true).assetId!==getEducationCard(concept).assetId;host.innerHTML=`<img src="${card.src}" alt="${esc(card.description)}"><p class="preview">${card.previewNotice}</p>${advanced?`<p>${esc(card.description)}</p>`:''}${hasAdvanced?button(advanced?'기본 그림으로':'고급 정보 보기',advanced?'education-basic':'education-advanced','text-button'):''}`;}
function quizHtml():string {
  if(['L06','L07'].includes(selected.id))return `<section class="result-exercise"><h3>큰박 구별하기 · 시간 제한 없음</h3><p>여섯 번 탭하기와 박자 구별은 따로 살펴봐요. 네 문제 중 세 문제를 맞히면 박자 구별 조건을 충족해요.</p><small>묶음 그림을 먼저 보여 주지 않고 큰박 클릭을 들려드려요. 시각 도움을 쓰면 개념 설명 활동으로 표시해요.</small>${METER_QUIZ.map((q,qi)=>`<div class="meter-question"><p>${qi+1}. ${q.question}</p>${button('리듬 다시 듣기　▷',`meter-listen:${qi}`)}<div class="quiz-options">${q.options.map((o,i)=>button(esc(o),`meter-answer:${qi}:${i}`)).join('')}</div><p id="meter-feedback-${qi}" class="muted" role="status"></p></div>`).join('')}<p id="meter-total" role="status"></p></section>`;
  const q=LESSONS[selected.id].quiz;const compare=['L08','L09'].includes(selected.id)?'tempo':['L02','L03'].includes(selected.id)?'tie':null;
  return `<section class="result-exercise"><h3>천천히 생각해 보기 · 시간 제한 없음</h3><p>${q.question}</p><div class="quiz-options">${q.options.map((o,i)=>button(esc(o),`quiz:${i}`)).join('')}</div><p id="quiz-feedback" role="status"></p>${compare?`<small>${compare==='tempo'?'같은 음표가 빠르기만 바뀌어요. 108의 전체 시간은 72일 때의 2/3예요.':'같은 C5를 한 번 잇는 소리와 따로 두 번 시작하는 소리를 비교해요.'}</small><div class="options-row">${comparisonPatterns(levels,compare).map((p,i)=>button(p.label,`compare:${compare}:${i}`)).join('')}</div>`:''}</section>`;
}
async function playComparison(level:Level,repeats=2):Promise<void> {
  if(!await ensureAudio())return;audio.stop();audio.start();
  const generation=++comparisonGeneration,chart=compileLevel(level,{repeats}),epoch=audio.contextTime()+.2;
  for(const n of chart.notes)audio.scheduleNote({id:`comparison-${generation}-${n.id}`,midi:n.midi,startSec:epoch+n.startSec,endSec:epoch+n.endSec,kind:'demo'});
  for(const b of chart.beats)audio.pulse(epoch+b.timeSec,b.first,b.major?'beat':'subdivision');
  setTimeout(()=>{if(comparisonGeneration===generation)audio.stop();},(chart.durationSec+.3)*1000);
}
function concept():void {showModal(`<h2>소리 없이 살펴보기</h2><p style="margin:20px 0">${LESSONS[selected.id].concept}</p><div class="notation-area">${renderNotation(selected)}</div>${quizHtml()}<p class="muted" style="margin-top:16px">이 문제는 개념 이해를 돌아보는 활동이며, 청각 능력이나 실제 누름 유지를 측정하지 않아요.</p>`);}
function saveSettings():void {store.updateSettings({keyCode:settings.key as 'Space'|'KeyF'|'KeyJ'|'Enter',highContrast:settings.highContrast,reducedMotion:settings.reducedMotion,toggleHold:settings.toggleHold,wideWindows:settings.wideWindows,guide:settings.guide,showCounts:settings.showBeat,visualOffsetMs:settings.visualOffsetMs,volume:settings.volume,clickVolume:settings.clickVolume,guideVolume:settings.guideVolume,bgmVolume:settings.bgmVolume,sfxVolume:settings.sfxVolume,vibration:settings.vibration});if(progress.calibration.inputOffsetMs!==settings.inputOffsetMs)store.setCalibration(settings.inputOffsetMs);audio.setVolume(settings.volume);audio.setInputOffsetMs(settings.inputOffsetMs);applyMix();}
function showModal(html:string):void {modalReturn=document.activeElement as HTMLElement;const overlay=document.createElement('div');overlay.className='modal-backdrop';overlay.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-label="설정 및 도움"><div class="modal-heading"><span class="eyebrow">NIGHT THREAD</span>${button('×','close','icon-button')}</div>${html}</section>`;root.append(overlay);overlay.querySelector<HTMLButtonElement>('button')?.focus();overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();return;}if(e.key==='Tab'){const controls=Array.from(overlay.querySelectorAll<HTMLElement>('button,input,select,summary')).filter(x=>!x.hasAttribute('disabled'));const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){last?.focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===last){first?.focus();e.preventDefault();}}});}
function closeModal():void {root.querySelector('.modal-backdrop')?.remove();modalReturn?.focus();}
function settingsModal():void {
  if(screen==='game'&&!ready)interrupt('user-pause');
  const check=(id:keyof Settings,title:string,help:string)=>`<label class="setting"><span>${title}<small>${help}</small></span><input type="checkbox" data-setting="${id}" ${settings[id]?'checked':''}></label>`;
  showModal(`<h2>나에게 편안한 리듬</h2><p class="muted">도움 설정은 다음 연습과 연주부터 적용됩니다.</p><label class="setting"><span>연주 키</span><select data-setting="key">${['Space','KeyF','KeyJ','Enter'].map(k=>`<option ${settings.key===k?'selected':''} value="${k}">${k.replace('Key','')}</option>`).join('')}</select></label><label class="setting"><span>전체 볼륨</span><input type="range" min="0" max="1" step=".05" value="${settings.volume}" data-setting="volume"></label>${(['clickVolume','guideVolume','bgmVolume','sfxVolume'] as const).map((k,i)=>`<label class="setting"><span>${['리듬 클릭','시연 선율','반주','효과음'][i]}</span><input type="range" min="0" max="1" step=".05" value="${settings[k]}" data-setting="${k}"></label>`).join('')}${check('highContrast','고대비 윤곽','색과 함께 모양으로 시작·유지·끝을 구별해요.')}${check('reducedMotion','움직임 줄이기','음악은 그대로, 장식 움직임과 입자를 줄여요.')}${check('toggleHold','시작·끝 탭으로 누름 돕기','처음 탭으로 시작, 손을 뗀 뒤 다음 탭으로 놓아요. 보조 기록입니다.')}${check('wideWindows','넓은 판정','허용창 1.35배, 이웃 음과 겹치지 않는 범위. 보조 기록입니다.')}${check('guide','연습에서 작은 정답 소리','연습에서만 겹쳐 들려요. 연주에는 정답 선율이 없어요.')}${check('showBeat','큰박 숫자 표시','박자를 눈으로도 볼 수 있어요. 보조 기록입니다.')}${check('vibration','짧은 진동','지원 장치에서 유효한 누름을 작게 알려 줍니다. 기본 꺼짐.')}<label class="setting"><span>입력 보정 (ms)<small>늦게 관측되면 양수. 사람의 반응 편향이 포함돼요.</small></span><input type="number" min="-250" max="250" step="1" data-setting="inputOffsetMs" value="${settings.inputOffsetMs}"></label><label class="setting"><span>그림만 이동 (ms)<small>판정 점수는 바뀌지 않아요.</small></span><input type="number" min="-250" max="250" step="1" data-setting="visualOffsetMs" value="${settings.visualOffsetMs}"></label><div class="setting"><span>클릭에 맞춰 입력 보정<small>4박 예고 뒤 16회 · 약 15초</small></span>${button('보정 시작','calibrate')}</div><p class="muted" style="font-size:12px;margin:14px 0">오디오 경로나 Bluetooth가 바뀌면 다시 맞춰 보세요. 기기의 물리 지연을 정밀 측정하는 기능은 아닙니다.</p>${button('이 게임의 기록 초기화','reset-confirm','text-button')}`);
}
function updateOffsetPreview():void {const el=$('#offset-preview');if(el)el.textContent=`예시: 관측 오차 +80ms − 입력 보정 ${settings.inputOffsetMs>=0?'+':''}${settings.inputOffsetMs}ms = ${Math.round(80-settings.inputOffsetMs)}ms. 보정은 판정 오차에서 한 번 뺍니다.`;}
function appendClockNotice():void {const modal=root.querySelector('.modal');modal?.insertAdjacentHTML('beforeend',`<p class="muted" style="font-size:12px;margin-top:16px">오디오 시각: ${audio.mappingMethod==='output-timestamp'?'출력 timestamp 매핑':'보고된 지연을 사용한 추정 fallback'}. ${audio.mappingMethod==='latency-fallback'?'기기 지연을 실측한 값이 아니에요.':''}</p><p id="offset-preview" class="muted" style="font-size:12px;margin-top:12px"></p>`);updateOffsetPreview();}
async function calibrate():Promise<void> {
  closeModal();if(!await ensureAudio())return;
  audio.stop();session=null;screen='calibration';audio.start();
  calibration=new CalibrationController(audio.contextTime()+.3);
  calibrationEnd=calibration.clickTimes.at(-1)!+.45;
  for(const t of calibration.countInTimes)audio.pulse(t,true);for(const t of calibration.clickTimes)audio.pulse(t,true);
  shell(`${topbar()}<main class="calibration-page"><div class="eyebrow">편안한 타이밍 맞추기</div><h2>클릭이 들릴 때 눌러 주세요.</h2><p class="muted">네 번의 예고 뒤 열여섯 번. 처음 네 입력은 제외하고 나머지 열두 번의 중앙값을 사용해요.</p><div class="calibration-orb" id="calibration-orb">4</div><div class="action-container"><button id="action-pad" class="action-pad" aria-label="보정 클릭에 맞춰 누르기">● 클릭에 맞춰 누르기</button></div><p id="calibration-status" class="muted">예고를 듣고 있어요.</p>${button('그대로 꿈 지도로','map','text-button')}</main>`);bindPad();calibrationFrame();
}
function calibrationFrame():void {
  if(screen!=='calibration'||!calibration)return;
  const now=audio.now(),all=[...calibration.countInTimes,...calibration.clickTimes],index=all.findLastIndex(t=>t<=now);
  const orb=$('#calibration-orb');if(orb){orb.textContent=index<4?String(Math.max(1,4-index)):String(Math.min(16,index-3));orb.classList.toggle('flash',all.some(t=>now>=t&&now-t<.14));}
  const text=$('#calibration-status');if(text)text.textContent=index<4?'네 박을 함께 세어요.':`${Math.min(16,index-3)} / 16 클릭`;
  if(now>=calibrationEnd){audio.stop();const summary=calibration.summary();const s=summary as typeof summary & {offsetMs:number|null;madMs:number|null};const content=summary.applicable?`입력 보정 ${Math.round(s.offsetMs??0)}ms · 흔들림 ${Math.round(s.madMs??0)}ms. 이 값으로 맞출까요?`:'입력이 충분하지 않거나 흔들림이 커서 자동으로 맞추지 않았어요.';showModal(`<h2>보정 결과</h2><p style="margin:20px 0">${content}</p>${summary.applicable?button('이 값으로 맞추기','apply-calibration','primary'):''}${button('다시 맞추기','calibrate')}${button('그대로 연습하기','map','text-button')}<small>사람의 반응이 포함된 입력 보정이며, 물리 장치 지연의 정밀 측정값이 아닙니다.</small>`);return;}
  raf=requestAnimationFrame(calibrationFrame);
}
function toast(text:string):void {document.querySelector('.toast')?.remove();const node=document.createElement('div');node.className='toast';node.role='status';node.textContent=text;document.body.append(node);setTimeout(()=>node.remove(),4500);}
root.addEventListener('click',async e=>{
  const target=(e.target as HTMLElement).closest<HTMLElement>('[data-action]');if(!target)return;
  const action=target.dataset.action!;e.preventDefault();
  if(action.startsWith('meter-listen:')){const qi=Number(action.split(':')[1]);await playComparison(levelById(METER_QUIZ[qi].levelId),2);return;}
  if(action.startsWith('meter-answer:')){const [,qIndex,answer]=action.split(':'),qi=Number(qIndex),i=Number(answer),q=METER_QUIZ[qi];if(meterAnswers[qi]!==undefined)return;meterAnswers[qi]=i;target.parentElement?.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b===target));const feedback=$(`#meter-feedback-${qi}`);if(feedback)feedback.textContent=(i===q.answer?'맞아요. ':'다시 살펴봐요. ')+q.explanation;if(Object.keys(meterAnswers).length===4){const correct=METER_QUIZ.filter((q,i)=>q.answer===meterAnswers[i]).length;const total=$('#meter-total');if(total)total.textContent=`네 문제 중 ${correct}문제 · ${correct>=3?'큰박의 묶음을 잘 구별했어요.':'2+2+2와 3+3을 다시 들어 보세요.'}`;const s=session;if(s?.judge&&screen==='result'){const attempt=progress.recentAttempts.find(a=>a.id===s.attemptId);if(attempt?.metrics)attempt.metrics.meterConceptCorrect=correct;store.save();const stars=evaluateMastery(selected,s.judge.snapshot(),assisted(),correct).stars;const node=$('.stars');if(node){node.textContent='✦'.repeat(stars)+'✧'.repeat(3-stars);node.setAttribute('aria-label',`별 ${stars}개`);}}}return;}
  if(action.startsWith('compare:')){const [,kind,index]=action.split(':');const p=comparisonPatterns(levels,kind as 'tempo'|'tie')[Number(index)];await playComparison(p.level,p.repeats);return;}
  if(action.startsWith('lesson:')){closeModal();await lesson(action.slice(7));return;}
  if(action.startsWith('quiz:')){const i=Number(action.slice(5)),q=LESSONS[selected.id].quiz;const feedback=root.querySelector<HTMLElement>('.modal-backdrop #quiz-feedback')??$('#quiz-feedback');if(feedback)feedback.textContent=(i===q.answer?'맞아요. ':'다시 살펴봐요. ')+q.explanation;target.parentElement?.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b===target));return;}
  switch(action){case'unlock':if(await ensureAudio())await map();break;case'map':closeModal();await map();break;case'home':await home();break;case'listen':await start('listen');break;case'focused-practice':await startFocused();break;case'lesson-return':await lesson(selected.id);break;case'education-advanced':renderEducation(true);break;case'education-basic':renderEducation(false);break;case'practice':{const speed=Number($<HTMLSelectElement>('#practice-speed')?.value??.75);await start('practice',speed);break;}case'play':await start('play',1);break;case'pause':interrupt('user-pause');break;case'resume':await start(session?.mode??'practice',session?.speed??1,true);break;case'restart':await start(session?.mode??'listen',session?.speed??1);break;case'settings':settingsModal();appendClockNotice();break;case'close':closeModal();break;case'concept':concept();break;case'calibrate':await calibrate();break;case'apply-calibration':{const s=calibration?.summary();if(s?.applicable&&s.offsetMs!==null){settings.inputOffsetMs=s.offsetMs;saveSettings();toast('확인한 입력 보정을 저장했어요.');}closeModal();await map();break;}case'next':{const i=campaignOrder.indexOf(selected.id);await lesson(campaignOrder[(i+1)%campaignOrder.length]);break;}case'reload':if(screen==='game')await start(session?.mode??'listen',session?.speed??1);else if(screen==='lesson')await lesson(selected.id);else await map();break;case'reset-confirm':closeModal();showModal(`<h2>밤실 공방의 기록을 지울까요?</h2><p style="margin:20px 0">이 기기의 수업 완료, 점수와 설정이 초기화됩니다.</p>${button('밤실 기록 지우기','reset')}${button('기록 유지하기','close','primary')}`);break;case'reset':store.reset();location.reload();break;}
});
root.addEventListener('change',e=>{const input=e.target as HTMLInputElement|HTMLSelectElement;const key=input.dataset.setting as keyof Settings|undefined;if(!key)return;let value=input instanceof HTMLInputElement&&input.type==='checkbox'?input.checked:input instanceof HTMLSelectElement?input.value:Number(input.value);if(typeof value==='number'){if(!Number.isFinite(value))return;const [min,max]=key==='inputOffsetMs'||key==='visualOffsetMs'?[-250,250]:[0,1];value=Math.max(min,Math.min(max,value));input.value=String(value);}settings={...settings,[key]:value};saveSettings();updateOffsetPreview();root.classList.toggle('high-contrast',settings.highContrast);root.classList.toggle('reduced-motion',settings.reducedMotion);});
function historicalEdge(kind:'down'|'up',timestamp:number):boolean {const p=timestamp>1e12?timestamp-performance.timeOrigin:timestamp;pruneEpochs();if(inputEpochs.some(e=>e.perfEnd!==Infinity&&p>=e.perfStart&&p<e.perfEnd)){edge(kind,timestamp);return true;}return false;}
window.addEventListener('keydown',e=>{if(e.code===settings.key&&historicalEdge('down',e.timeStamp)){e.preventDefault();return;}if(e.code==='Escape'&&screen==='game'){interrupt('user-pause');return;}if(e.code!==settings.key||e.repeat||root.querySelector('.modal-backdrop')||screen!=='game'&&screen!=='calibration'||ready||session?.paused||keyRearm)return;const target=e.target as HTMLElement;if(target.matches('input,textarea,select,[contenteditable=true]')||target.closest('[data-action]'))return;if(physicalOwner)return;physicalOwner=`k${e.code}`;physicallyHeld.add(physicalOwner);e.preventDefault();$('#action-pad')?.classList.add('held');edge('down',e.timeStamp);});
window.addEventListener('keyup',e=>{const token=`k${e.code}`;physicallyHeld.delete(token);rearmBlocked.delete(token);if(e.code===settings.key)keyRearm=false;if(e.code===settings.key&&historicalEdge('up',e.timeStamp)){e.preventDefault();return;}if(physicalOwner!==token)return;physicalOwner=null;$('#action-pad')?.classList.remove('held');e.preventDefault();edge('up',e.timeStamp);});
window.addEventListener('pointerdown',e=>{if(historicalEdge('down',e.timeStamp)){e.stopImmediatePropagation();return;}if((e.target as HTMLElement).closest('#action-pad'))physicallyHeld.add(`p${e.pointerId}`);},{capture:true});
window.addEventListener('pointerup',e=>{physicallyHeld.delete(`p${e.pointerId}`);rearmBlocked.delete(`p${e.pointerId}`);if(historicalEdge('up',e.timeStamp))e.stopImmediatePropagation();},{capture:true});
window.addEventListener('pointercancel',e=>{physicallyHeld.delete(`p${e.pointerId}`);rearmBlocked.delete(`p${e.pointerId}`);},{capture:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)interrupt('hidden');});window.addEventListener('blur',()=>interrupt('blur'));window.addEventListener('pagehide',()=>interrupt('pagehide'));window.screen.orientation?.addEventListener('change',()=>interrupt('orientation-change'));
if(import.meta.env.DEV)Object.defineProperty(window,'__nightThread',{value:Object.freeze({status:()=>({screen,selectedId:selected.id,mode:session?.mode??null,epoch:session?.epoch??null,audioNow:audio.now(),contextTime:audio.contextTime(),snapshot:session?.judge?.snapshot()??null,paused:session?.paused??false,ready,notes:session?.compiled.notes??[],diagnostics:audio.getDiagnostics(),config:session?.config??settings,physicalOwner,logicalHold,focusBars:session?.focusBars??null,restartSec:session?.restartSec??0,countStart:session?.countStart??0,mappingMethod:audio.mappingMethod,voices:audio.voiceCount,pending:audio.pendingCount,assetDiagnostics:renderer?.assetDiagnostics()??[]})}),writable:false});
void home();
