# 밤실 공방 구현 계약

기준: `reference/design.md` v1.0와 `reference/promptpack.md` v1.0, 현재 runtime manifest. 사용자 최신 지시는 P00~P25의 로컬 구현과 인계까지 진행하며 P26 V2·P27 공개 배포를 자동 확대하지 않는 것이다. 원본 파일과 다른 게임은 보존한다.

## 음악과 데이터

- 네 장면: 실빛다리 L01~03, 반달 온실 L04~05, 접히는 방 L06~07, 구름 우체역 L08~09. 추천 경로 L01 L02 L03 L04 L06 L07 L05 L08 L09. 성적 잠금 없음.
- PPQ=480, q=4분음표 길이. 온/2분/4분/8분/16분=1920/960/480/240/120 tick; 점4분720, 점2분1440. 마디 길이=n×4/d×480. 초=tick/480×60/(quarterBpm×speed).
- `bars[].events[]`만 정답 원천. Draft2020-12 원본 schema의 additionalProperties:false와 reviewState pending 상수를 유지. 구조·원래 순서의 at 연속성·마디합·표기 길이·중복ID·MIDI·동음 동철자 연속 hold tie 최소2음을 검증. 정렬·쉼 보완·반올림 수선 없음.
- C5=72 D5=74 E5=76 G5=79. L02 뒤 독립 tap E5=76 유지. 원형 악보·sourceNotationIds 보존; tie만 sound/input gate 합침, 중간 TIE_BOUNDARY는 표시 전용.
- L02 hold0~960/tap1440~1680/N3; L03 hold1440~2880와3360~3840/N4; L05 tap720/960/1200+hold1440~2160/N5. L06/L07 동일6탭·quarterBpm90, 큰박0/480/960 대0/720, 표시4분90 대점4분60. L08/09 동일4탭, quarterBpm72/108, 시간10/3 대20/9초.

## 흐름과 판정

카운트인1마디 → LISTEN2모티프+tail1마디 → 무제한 선택 → 새 카운트인 → PRACTICE2회 → 무제한 선택 → 새 카운트인 → PLAY4회 → 마지막 쉼·판정창+grace 종료 → OUTRO1마디 → 결과. 듣기 무채점·정답음, 연습 선택적 낮은 guide·75/100%, PLAY 정답음 없음·100% 기본.

- onset45/90/140ms, release60/110/160ms; 계수1/.75/.40/0. 크기=Math.round(abs(correctedErrorMs)×1000), 부호는 별도. 경계는 안쪽 등급 포함.
- onset W=min(140×assistFactor,.45×최소이웃onset간격), release W=min(160×assistFactor,.45×hold길이), assistFactor=1 또는1.35. 내부 비율45:90:140/60:110:160. 반복 경계 포함, tie 경계·카운트인 제외. 75%는 초 변환만 변경.
- down 한 번은 PENDING 후보 하나. 절대오차 → 더 이른 시각 → 안정ID; 동일 timestamp는 receipt sequence. owner 유지 중 새 down 없음. ACTIVE 조기 up=BROKEN, onset 점수 유지/release0, 재타격 복구 없음. onset miss면 release0. overhold 다음 onset 자동 성공 없음.
- N=tap+2hold. score=round(100×clamp((earned−.25×min(extra,N))/N,0,1)). 쉼 무료점수 없음, N0 scored chart 오류. 조기 release/overhold 자체 추가감점 없음.
- restClean/restCount, tieContinuous/tieCount, releaseInWindow/holdCount, onsetMedianAbsError, meterConceptCorrect 분리. 정상 early matched down/정상 release 창은 쉼 오염 아님. 경계창이 모두 덮는 rest 제외, 분모0=null. tap up 길이로 hold 숙달 없음. rest 저작 이벤트별 표본 유지, 연속 rest의 다음 동일 onset은 reentry 통계에서 한 번만.

## 시계·입력·중단

- AudioContext master, 입력performance/DOM timestamp, 음악tick. 출력timestamp 경로 audible=contextTime+(eventPerf−performanceTime)/1000. fallback=anchor.contextSec+(p−anchor.perfMs)/1000−baseLatency−outputLatency, 추정 표시. 출력경로 latency 재차감 없음. errorMs=1000×(audible−target)−inputOffsetMs. visualOffset은 그림만.
- 보정4박 예고+16클릭, 처음4개 제외12개 중앙값/MAD. MAD>45 불안정, ±250ms만 사용자 확인후 저장. 12개 누락시 자동적용 없음. 초기80BPM, 클릭당±300ms 매칭; 물리지연 측정 주장 없음.
- scheduler25ms/lookahead150ms, absolute tick 예약. 누락음이 발생한100ms 초과 gap은 catchup 폭음 없이 기술중단. tied attack5ms 1회/release8ms 마지막; 사용자 hold 실제up 종료, targetEnd+Wrel에서 강제음종료. tap은 원래targetEnd 고정, 이미 지난 끝은 발음 생략.
- 한 physical owner, event.code Space/F/J/Enter, repeat·추가포인터 무시. 정상up 뒤 lostcapture 무시, 활성owner capture상실/cancel은 중단. action pad만 touch-action:none, menu/input/quiz 분리. toggle 첫 새down onset, up rearm, 다음 새down release; 같은down onset중복 없음. tap은 completeTap 후 실제up으로 rearm.
- receipt−event>200ms 기술중단. dispatchGrace100ms는 음악창 확대가 아닌 확정대기. 같은JS turn은 ingest 뒤 advance. timeout FINAL 뒤 아직 처리 안 된 정상timestamp onset/up은 해당phrase+후속 의존 증거 rollback. 실제 성공 후 재타격은 extra, 중복전송 dedupe.
- atomic phrase=모티프1회, L03/L05 두마디 전체. pause/hidden/blur/pagehide/cancel/nonrunning audio/경로변경/WebGL loss/회전은 현재 미확정phrase 폐기, 확정이전만 보존. 음fade8ms/stop/disconnect/queue·owner clear. 새sessionId·epoch, 명시적이어하기+audio running+physical rearm+해당phrase앞1마디count-in. hold중간 복원금지. 폐기epoch 입력은 재개음 영향없음.

## 저장·접근성·출고

저장 key=`night-thread.progress.v1`만 사용. 유효 시도 원장·best 근거id·재개sessionChain, 결과 idempotency. 철회시 valid=false, 남은 유효시도로 best 재계산. standard/assisted 분리, contentVersion 이전기록legacy. 파손가능시 backup·quota에도 현재게임/결과 유지. 사용자 확인없는 초기화 없음, 다른앱key 보존. 개인정보·외부전송·서버·마이크·계정·결제·SDK 없음. 개발로그 메모리 최대5분.

메뉴/설명/결과 DOM, 기본16px 설명18px 줄1.5, 주버튼72px 이상·보조44×44, 200%확대. highContrast 색외모양, reduced-motion 그림만 변경. toggle/wide/75%/guide/counts/visual 도움은 assisted로 남기고 표준 hold 숙달과 분리. 박자퀴즈3/4는 별도 개념조건. 반복완료만으로 진도 진행.

런타임92종=17WebP+75SVG, PNG17선택fallback, loadProfiles 기준 조건부로드. 정지키포즈를 rig로 주장하지 않음. 정확한 manifest 경로·상태·앵커·모바일crop. pending 교육/청음 승인 자동승격 없음. 내부검토 빌드이며 교육자·실기기·물리음향·초보8~12명 검수는 직접하지 않았다면 pending/not run. V2·유료·공개배포 별도요청 전 차단.
