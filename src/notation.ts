import type { Level, NotationEvent } from './core';
import { EDUCATION_REVIEW_NOTICE } from './lessons';

const BAR_WIDTH = 480;
const LEFT = 68;
const TOP = 42;
const HEAD_Y = 78;
const STEM_TOP = 42;

const escape = (value: string | number): string => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
const numeric = (value: number): string => String(Math.round(value * 1000) / 1000);
const barTicks = (level: Level): number => level.ppq * 4 * level.meter.n / level.meter.d;
const noteName = (event: NotationEvent): string => `${event.notation.dots ? '점'.repeat(event.notation.dots) : ''}${event.notation.denominator === 1 ? '온' : `${event.notation.denominator}분`}${event.kind === 'rest' ? '쉼표' : '음표'}`;

function eventProse(event: NotationEvent, continuation: boolean): string {
  const symbol = noteName(event);
  if (event.kind === 'rest') return `${symbol}: 내가 맡은 소리를 쉬어요. 박과 반주는 계속될 수 있어요.`;
  if (continuation) return `${event.pitchName} ${symbol}: 앞 음과 붙임줄로 이어져요. 다시 누르지 않고 계속 유지해요.`;
  return `${event.pitchName} ${symbol}: ${event.interaction === 'hold' ? '시작에서 누르고 끝에서 놓아요.' : '시작에서 한 번 탭해요.'}${event.tieGroup ? ' 다음 같은 음까지 소리를 이어 가요.' : ''}`;
}

function noteGlyph(event: NotationEvent, x: number, beamed: boolean): string {
  const denominator = event.notation.denominator;
  let glyph = '';
  if (event.kind === 'note') {
    const hollow = denominator <= 2;
    glyph = `<ellipse class="notehead" cx="${numeric(x)}" cy="${HEAD_Y}" rx="7.5" ry="5.4" transform="rotate(-18 ${numeric(x)} ${HEAD_Y})" fill="${hollow ? 'var(--notation-paper, #F3E8C9)' : 'currentColor'}" stroke="currentColor" stroke-width="2"/>`;
    if (denominator > 1) glyph += `<path class="note-stem" d="M ${numeric(x + 6)} ${HEAD_Y - 1} V ${STEM_TOP}" fill="none" stroke="currentColor" stroke-width="2.2"/>`;
    if (denominator >= 8 && !beamed) {
      glyph += `<path class="note-flag" d="M ${numeric(x + 6)} ${STEM_TOP} C ${numeric(x + 8)} ${STEM_TOP + 9}, ${numeric(x + 23)} ${STEM_TOP + 10}, ${numeric(x + 11)} ${STEM_TOP + 25} C ${numeric(x + 17)} ${STEM_TOP + 11}, ${numeric(x + 7)} ${STEM_TOP + 16}, ${numeric(x + 6)} ${STEM_TOP + 11} Z" fill="currentColor"/>`;
    }
    if (denominator >= 16 && !beamed) glyph += `<path d="M ${numeric(x + 6)} ${STEM_TOP + 10} q 19 9 5 25 q 8 -14 -5 -16 Z" fill="currentColor"/>`;
  } else if (denominator <= 2) {
    // Half rests sit on the middle line; whole rests hang below the line above it.
    glyph = `<rect class="rest-glyph rest-${denominator}" x="${numeric(x - 7)}" y="${denominator === 1 ? 54 : 61}" width="15" height="5" fill="currentColor"/>`;
  } else if (denominator === 4) {
    glyph = `<path class="rest-glyph rest-4" d="M ${numeric(x + 2)} 46 l -6 11 10 11 -8 10 q -8 5 -1 13 q -14 -8 -5 -16 l 6 -7 -10 -11 Z" fill="currentColor"/>`;
  } else {
    glyph = `<g class="rest-glyph rest-${denominator}"><circle cx="${numeric(x - 4)}" cy="61" r="4.5" fill="currentColor"/><path d="M ${numeric(x - 4)} 65 Q ${numeric(x + 1)} 69 ${numeric(x + 6)} 58 L ${numeric(x - 3)} 88" fill="none" stroke="currentColor" stroke-width="2.5"/></g>`;
    if (denominator >= 16) glyph += `<circle cx="${numeric(x - 7)}" cy="71" r="4" fill="currentColor"/>`;
  }
  for (let dot = 0; dot < event.notation.dots; dot++) {
    glyph += `<circle class="augmentation-dot" cx="${numeric(x + 18 + dot * 7)}" cy="${event.kind === 'note' ? HEAD_Y - 6 : 60}" r="2.5" fill="currentColor"/>`;
  }
  return glyph;
}

/**
 * Source notation stays separate from compiled sound gates. In particular, a tie
 * draws both original notes, and the active highlight never generates an attack.
 * Rhythm-only vertical placement is intentional; actual pitches remain in DOM.
 */
export function renderNotation(level: Level, activeTick?: number): string {
  const ticksPerBar = barTicks(level);
  const width = LEFT + level.bars.length * BAR_WIDTH + 22;
  const eighthsPerBar = ticksPerBar / (level.ppq / 2);
  const sourceEvents = level.bars.flatMap((bar, barIndex) => bar.events.map(event => ({ event, barIndex, tick: barIndex * ticksPerBar + event.at, x: LEFT + barIndex * BAR_WIDTH + event.at / ticksPerBar * BAR_WIDTH + 18 })));
  const beamedIds = new Set<string>();
  const beams: string[] = [];
  const groups: string[] = [];

  level.bars.forEach((bar, barIndex) => {
    let startEighth = 0;
    level.meter.groupingEighths.forEach((size, groupIndex) => {
      const groupStart = startEighth * level.ppq / 2;
      const groupEnd = (startEighth + size) * level.ppq / 2;
      const groupX = LEFT + barIndex * BAR_WIDTH + startEighth / eighthsPerBar * BAR_WIDTH;
      const groupWidth = size / eighthsPerBar * BAR_WIDTH;
      groups.push(`<g class="notation-group" data-bar-index="${barIndex}" data-group-index="${groupIndex}" data-eighth-count="${size}" data-group-width="${numeric(groupWidth)}"><path d="M ${numeric(groupX + 2)} 117 v 5 H ${numeric(groupX + groupWidth - 2)} v -5" fill="none" stroke="currentColor" stroke-width="2"/><text x="${numeric(groupX + groupWidth / 2)}" y="143" text-anchor="middle" font-size="14">${size}개</text></g>`);
      // Beam only contiguous eighth notes in one meter group. Rests break beams.
      let run: NotationEvent[] = [];
      const flush = (): void => {
        if (run.length >= 2) {
          const first = run[0]!;
          const last = run[run.length - 1]!;
          const firstX = LEFT + barIndex * BAR_WIDTH + first.at / ticksPerBar * BAR_WIDTH + 24;
          const lastX = LEFT + barIndex * BAR_WIDTH + last.at / ticksPerBar * BAR_WIDTH + 24;
          run.forEach(event => beamedIds.add(`${barIndex}:${event.id}`));
          beams.push(`<path class="notation-beam" data-source-notation-ids="${escape(run.map(event => event.id).join(' '))}" data-eighth-count="${run.length}" d="M ${numeric(firstX)} ${STEM_TOP} H ${numeric(lastX)}" stroke="currentColor" stroke-width="5"/>`);
        }
        run = [];
      };
      for (const event of bar.events) {
        if (event.at < groupStart || event.at >= groupEnd) continue;
        const previous = run[run.length - 1];
        if (event.kind === 'note' && event.notation.denominator === 8 && event.notation.dots === 0 && (!previous || previous.at + previous.ticks === event.at)) run.push(event);
        else { flush(); if (event.kind === 'note' && event.notation.denominator === 8 && event.notation.dots === 0) run.push(event); }
      }
      flush();
      startEighth += size;
    });
  });

  const notes = sourceEvents.map(({ event, barIndex, tick, x }) => {
    const active = activeTick !== undefined && activeTick >= tick && activeTick < tick + event.ticks;
    const durationWidth = event.ticks / ticksPerBar * BAR_WIDTH;
    const highlight = active ? `<rect class="notation-active-marker" x="${numeric(x - 12)}" y="30" width="${numeric(Math.max(28, durationWidth - 6))}" height="70" rx="8" fill="currentColor" opacity=".13"/><path d="M ${numeric(x - 6)} 104 l 6 -6 6 6" fill="none" stroke="currentColor" stroke-width="2"/>` : '';
    return `<g class="notation-event${active ? ' is-active' : ''}" data-source-notation-id="${escape(event.id)}" data-source-notation-ids="${escape(event.id)}" data-bar-index="${barIndex}" data-kind="${event.kind}" data-denominator="${event.notation.denominator}" data-dots="${event.notation.dots}" data-start-tick="${tick}" data-duration-width="${numeric(durationWidth)}" data-x="${numeric(x)}"${event.kind === 'note' ? ` data-pitch="${escape(event.pitchName)}"` : ''}>${highlight}${noteGlyph(event, x, beamedIds.has(`${barIndex}:${event.id}`))}</g>`;
  }).join('');

  const ties: string[] = [];
  sourceEvents.forEach((current, index) => {
    const next = sourceEvents[index + 1];
    if (!next || current.event.kind !== 'note' || next.event.kind !== 'note' || !current.event.tieGroup || current.event.tieGroup !== next.event.tieGroup) return;
    const startX = current.x + 4;
    const endX = next.x - 4;
    ties.push(`<path class="notation-tie" data-tie-group="${escape(current.event.tieGroup)}" data-source-notation-ids="${escape(`${current.event.id} ${next.event.id}`)}" d="M ${numeric(startX)} 91 Q ${numeric((startX + endX) / 2)} 112 ${numeric(endX)} 91 Q ${numeric((startX + endX) / 2)} 106 ${numeric(startX)} 91 Z" fill="currentColor"/>`);
  });

  const staff = [0, 1, 2, 3, 4].map(index => `<line x1="${LEFT - 9}" y1="${TOP + index * 12}" x2="${width - 12}" y2="${TOP + index * 12}" stroke="currentColor" opacity=".35"/>`).join('');
  const barlines = Array.from({ length: level.bars.length + 1 }, (_, index) => `<line class="notation-barline" data-bar-boundary="${index}" x1="${LEFT + index * BAR_WIDTH - 8}" y1="${TOP}" x2="${LEFT + index * BAR_WIDTH - 8}" y2="${TOP + 48}" stroke="currentColor" stroke-width="${index === level.bars.length ? 2.5 : 1.4}"/>`).join('');
  const groupText = level.meter.groupingEighths.join('+');
  const meterProse = level.meter.d === 8 ? `이 ${level.meter.n}/8 수업에서는 작은 8분음표 길이를 ${groupText}로 묶어 큰박 둘로 느껴요.` : `${level.meter.n}/4에서는 작은 8분음표 길이를 ${groupText}로 묶어요.`;
  const tempo = level.meter.d === 8 ? `점4분음표=${numeric(level.quarterBpm / 1.5)}` : `4분음표=${level.quarterBpm}`;
  const prose = level.bars.map((bar, barIndex) => `<li>${barIndex + 1}마디<ol>${bar.events.map(event => {
    const absoluteIndex = sourceEvents.findIndex(item => item.barIndex === barIndex && item.event === event);
    const previous = sourceEvents[absoluteIndex - 1]?.event;
    const continuation = event.kind === 'note' && !!event.tieGroup && previous?.kind === 'note' && previous.tieGroup === event.tieGroup;
    return `<li data-source-notation-id="${escape(event.id)}">${escape(eventProse(event, continuation))}</li>`;
  }).join('')}</ol></li>`).join('');

  return `<figure class="rhythm-notation" data-level-id="${escape(level.id)}" data-review-state="pending"><figcaption>${escape(level.title)} · 리듬 악보</figcaption><p class="notation-meter">${level.meter.n}/${level.meter.d} · ${escape(tempo)} · ${escape(groupText)} 묶음</p><div class="notation-scroll" style="overflow-x:auto"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 158" style="display:block;width:100%;min-width:${level.bars.length > 1 ? 800 : 420}px;height:auto;color:var(--notation-ink,#142A35);background:var(--notation-paper,#F3E8C9);border-radius:12px" aria-hidden="true" focusable="false" data-notation-mode="rhythm-only">${staff}<text x="30" y="61" text-anchor="middle" font-size="25" font-weight="700">${level.meter.n}</text><text x="30" y="86" text-anchor="middle" font-size="25" font-weight="700">${level.meter.d}</text>${barlines}${groups.join('')}${notes}${beams.join('')}${ties.join('')}</svg></div><p class="notation-description">${escape(meterProse)} 리듬 전용 그림이며, 실제 음높이는 아래 글 설명에 표시해요.</p><details class="notation-prose"><summary>악보를 글로 읽기</summary><ol>${prose}</ol></details><p class="review-note">${EDUCATION_REVIEW_NOTICE}</p></figure>`;
}
