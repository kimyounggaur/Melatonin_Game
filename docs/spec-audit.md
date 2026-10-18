# 밤실 공방 명세 감사

이 문서는 `reference/promptpack.md` 4,607줄과 `reference/design.md` 1,543줄 전체를 읽은 정적 감사 기록이다. 구현 완료 보고서가 아니다. 프로젝트의 실제 실행 결과는 QA 보고서와 명령 로그로 별도 판단한다. 원본 Markdown·ZIP·미술 파일은 수정하지 않았다.

## 범위와 우선순위

이번 작업은 독립 프로젝트에서 P00~P25의 모바일 웹 MVP를 개발하고 로컬 실행·소스·검증 자료를 인계하는 범위다. 다른 게임의 저장소·포트·입력 규칙·점수·콘텐츠를 섞지 않는다. 네 꿈은 실빛다리 L01~03, 반달 온실 L04~05, 접히는 방 L06~07, 구름 우체역 L08~09다. 추천 순서는 **L01 L02 L03 L04 L06 L07 L05 L08 L09**이며 성적 잠금은 없다.

우선순위는 최신 사용자 지시 → 원 설계의 음악·입력·채점·개인정보 계약 → 실제 asset manifest → 프롬프트팩의 구체화 → 저장소 관례다. 사용자는 반복 질문 없이 문서에 따라 진행하도록 위임했다. P24 사람이 필요한 검수를 미실행으로 정확히 남기고 P25 내부 검토용 인계물을 만드는 것은 허용된다.

P26 당김음·스윙은 별도 승인 전 구현·메뉴 노출을 차단한다. P27 공개 배포는 승인되지 않았다. 계정·학생 정보·서버·마이크·광고·결제·분석 SDK·리더보드·새 유료 자산은 범위 밖이다. 문서에 적힌 Astra Ultra라는 문구는 실제 모델 설정 변경의 근거가 아니다.

## 기준 파일과 확인 증거

| 기준 | SHA-256 | 감사 결과 |
|---|---|---|
| `reference/design.md` | `6a4b3db31f6288bde3924c4dc21bb64d49c12f518cc77c0d33404f55a654eedb` | 팩의 기대값 일치 |
| `reference/promptpack.md` | `0a1000132378d81cc771ddce5b5a8b631dc8237f316166bf79ed4c7b31ebd8a4` | 현재 읽은 원문의 식별 해시 |
| `reference/mobile-assets.zip` | `67478bb9a7c96454cd0946aee9d1134c880c0c40ffb75a5eaa4052ef583c44ec` | 기대값 일치, 10,123,168B |
| `runtime_manifest.json` | `2c916a9a196990a1e9ddb2c61436733473879448301bc1f34af02b2d1582eb56` | 기대값 일치 |
| 부록 A1 schema 원문 | `412439879271fae832933059a490f74d6eae0848faa7fb2e3ac05cc6b0128c5a` | 기대값 일치 |
| 부록 A2 level array 원문 | `d7b608c79ca28214329607b1ea4773d6c810b269f2ce23ccfb9e18a1e1c2c6ce` | 기대값 일치 |

팩의 모든 JSON 15블록과 원 설계의 모든 JSON 10블록을 `docs/reference-fixtures/`에 추출했다. `.source.json`은 fenced block의 원문이며 `.parsed.json`은 파싱 후 동등 객체의 사본이다. `manifest.json`은 출처·줄·heading·양쪽 해시를 담는다. 원문 스키마와 레벨 객체는 두 문서 간에 모두 동일하다. 부록 C~F는 테스트 fixture이며 Level 스키마로 검증할 인스턴스가 아니다.

실행한 정적 검사: `node docs/reference-fixtures/verify-reference.mjs` → **540 passed, 0 failed**. 증거는 `docs/reference-fixtures/verification.json`이다. 이 검사는 25쌍의 객체/해시, 설계와 팩의 스키마/9레벨 일치, 독립 계산한 tick·음가·gate·쉼·큰박·N·시간 golden, 92개 자산 및 17 PNG 폴백의 bytes/해시를 확인한다. 프로젝트 compiler/judge를 import하지 않아 구현 결과를 기대값으로 복사하지 않는다. 브라우저 decode·투명 픽셀 동등성·실기기 성능·청음·교육 승인은 이 실행의 검사 대상이 아니다.

재현: `./docs/reference-fixtures/extract-source.ps1` 후 위 Node 명령. 원문 문서 2개를 읽고 fixture 폴더에만 쓴다. 노드 출력의 check 수는 정적 자료 검사의 수이며 게임 테스트 수가 아니다.

## 음악과 컴파일 오라클

PPQ=480이고 `q`는 4분음표 길이다. 교육적 큰박과 구분한다. 온/2분/4분/8분/16분=1920/960/480/240/120 tick, 점4분=720, 점2분=1440이다. `barTicks=n*4/d*480`, `seconds=tick/480*60/quarterBpm`을 transport 원점에서 계산한다. 원본 tick·at는 정수다. 이벤트를 정렬하거나 쉼을 자동 삽입해 잘못된 저작 데이터를 수리하지 않는다.

| 레벨 | 박자 / quarterBpm | 모티프 tick / 초(정확한 분수) | gate / rest 수 | 모티프 N / PLAY N | 주요 기대 동작 |
|---|---|---|---|---|---|
| L01 | 4/4 / 72 | 1920 / 10/3 | 2 / 1 | 4 / 16 | hold 0~480, 960~1920 |
| L02 | 4/4 / 72 | 1920 / 10/3 | 2 / 2 | 3 / 12 | C5 tied hold 0~960, E5 tap 1440~1680 |
| L03 | 4/4 / 72 | 3840 / 20/3 | 2 / 3 | 4 / 16 | C5 tied hold 1440~2880, E5 hold 3360~3840 |
| L04 | 4/4 / 80 | 1920 / 3 | 2 / 2 | 4 / 16 | dotted hold 0~720, 960~1680; 각 1125ms |
| L05 | 6/8 / 90 | 2880 / 4 | 4 / 2 | 5 / 20 | rest 0~720, tap 720/960/1200, G5 hold 1440~2160, rest 2160~2880 |
| L06 | 3/4 / 90 | 1440 / 2 | 6 / 0 | 6 / 24 | C5 여섯 8분 tap, 큰박 0/480/960 |
| L07 | 6/8 / 90 | 1440 / 2 | 6 / 0 | 6 / 24 | L06와 동일 bars, 큰박 0/720 |
| L08 | 4/4 / 72 | 1920 / 10/3 | 4 / 4 | 4 / 16 | C5/D5/E5/G5 tap 0/480/960/1440 |
| L09 | 4/4 / 108 | 1920 / 20/9 | 4 / 4 | 4 / 16 | L08와 동일 bars, 실제 시간 2/3 |

타이는 인접·동음·동일 철자/MIDI·hold·2음 이상이어야 한다. notation 두 음과 곡선은 남기고 sound gate와 입력 기대 항목만 합친다. L02 tick480, L03 tick1920에 새 attack·클릭·press·particle·점수 이벤트가 없다. 같은 tieGroup 문자열이 다음 모티프 반복까지 암묵적으로 연결되지 않는다. 반복별 occurrence ID는 유일하다.

각 phase는 한 마디 count-in을 갖는다. LISTEN=2모티프+1마디 tail, PRACTICE=2모티프, PLAY=4모티프, settle 후 OUTRO=1마디다. 단계 사이 선택 대기는 무시간제다. settle은 마지막 음악/쉼 끝·모든 judge deadline·오디오 tail 중 가장 늦은 시각이다. L01/L03의 마지막 release에는 160ms+100ms가 필요하지만 모든 레벨에 고정 260ms를 붙이지 않는다. 각 phrase는 한 모티프 전체이므로 L03/L05는 2마디 atomic이다.

## 판정·숙달·입력의 위험 지점

onset은 45/90/140ms, release는 60/110/160ms, 점수 계수는 1/.75/.40/0이며 경계는 안쪽 등급이다. `Math.round(Math.abs(correctedErrorMs)*1000)`으로 크기를 한 번 구하고 빠름/늦음 부호를 따로 보존한다. ±45.0005ms는 모두45001μs, .75다. 실제 이웃 onset 간 최소간격 d에 W=min(140, .45d), hold 길이 h에 Wrel=min(160, .45h). 보조 1.35배를 먼저 적용해도 cap을 다시 지킨다. 75% 속도는 음악 시간만 늘린다.

`N=tapCount+2*holdCount`, `score=round(100*clamp((earned-.25*min(extra,N))/N,0,1))`. 쉼과 퀴즈는 무료점수가 아니다. N0 PLAY는 저작 오류다. BROKEN은 onset 점수를 보존하고 release0, onset miss는 release도0, overhold는 release0이며 뒤 음 자동 성공이 없다. up 자체를 extra로 세지 않는다. N4/earned3.5/extra1=81점. L02 perfect100·tie broken restrike58·onset missing33·rest intrusion92·no input0이 고정 replay oracle다.

쉼은 저작 rest 이벤트별 표본이며 화면상 연속 침묵을 합쳐도 통계는 유지한다. L03 앞 쉼960+480은2개다. L05 PLAY clean 표본은8개, 고유 re-entry onset은 모티프별 tick720의4개다. 연속 쉼이 같은 onset을 가리키면 expectation ID로 dedupe한다. 마지막 쉼은 clean 표본에는 남고 후속 onset이 없으므로 re-entry 분모에서 제외한다. 정상 early onset·앞 hold 정상 release 창 내 up은 쉼 dirty가 아니다. 평가 가능한 부분이 없는 쉼은 excluded, 분모0 숙달은 null이다. tap up은 길이 숙달을 만들지 않는다.

physical owner는 실제 up까지 유지된다. key repeat·중복 전송·추가 포인터는 무시하며 정상 새 재타격은 extra다. 같은 timestamp up→down은 수신 sequence 순서 그대로 처리한다. Pointer Events 한 경로와 event.code만 쓰며 click 이중 채점 금지다. capture 유지 중 버튼 밖 이동은 hold 유지, 정상 up 후 lostcapture는 중단하지 않는다. toggleHold는 down→논리 onset, physical up→rearm, 다음 새 down→논리 release이며 같은 down을 새 onset으로 재사용하지 않는다. 표준 hold 숙달과 분리한다.

## 시계·전달 지연·중단·저장

오디오는 AudioContext master, 입력은 정규화된 performance timestamp, tick은 음악 좌표다. 출력 timestamp 유효 시 `audible=contextTime+(eventPerf-performanceTime)/1000`, `errorMs=1000*(audible-target)-inputOffsetMs`다. 이 경로에서 base/output latency를 다시 빼지 않는다. fallback은 anchor 쌍에서 두 reported latency를 빼되 누락은0이고 추정임을 표시한다. epoch DOM timestamp는 timeOrigin으로 정규화하고 현재 performance와5초 초과 차이면 기술 중단이다. visualOffset은 그림만 이동한다.

보정은4박 예고+16측정 클릭, 처음4측정 제외 후12개 median/MAD다. 예시 median80/MAD4.5, MAD45 포함 허용/초과 불안정, 자동 범위±250ms 및 사용자 확인 후 저장이다. 누락 샘플을 임의 채우지 않는다. 장치 물리 지연 측정이나 연주 중 자동 실력 보정이라고 표현하지 않는다.

예약은25ms/lookahead150ms, 절대 tick 시각이다. 유효 down에 사용자 소리를 현재+최대3ms에 시작하고 과거 예약을 하지 않는다. tap은 원래 targetEnd까지만 재생하며 남은 길이가13ms 미만이면5ms attack/8ms release를 축소/생략한다. safeStart≥end면 소리 생략, 채점은 원 timestamp를 쓴다. hold는 실제 up, targetEnd+Wrel 강제 음 종료이며 추가100ms grace 동안 소리를 늘리지 않는다. PLAY 무입력 시 guide lead0이다.

dispatchGrace100ms는 음악 창을 늘리지 않는다. 같은 JS turn에서는 ingest를 advance보다 먼저 처리한다. receipt−event>200ms는 기술 중단이다. target10000/event10130/receipt10220은 정상 .40, receipt10250은 지연120ms여도 FINAL deadline10240 후이므로 rollback이다. U41의 `deadline` 표현을 최종 grace deadline으로 해석해 허용을 더하지 말고 D3 수치 fixture에 맞춘다.

정상 late timestamp가 timeout FINAL과 충돌하면 영향 phrase와 후속 의존 구간을 철회하고 새 count-in에서 재시작한다. 이미 성공한 음의 실제 재타격은 rollback 대상이 아니다. 결과 저장 후에도 해당 attempt와 best 근거를 철회한다. pause·hidden·blur·pagehide·pointercancel·비정상 lostcapture·non-running audio·경로 변경·WebGL loss·회전은 같은 멱등 INTERRUPT 경로다. 8ms master fade, 현재/미래 nodes stop/disconnect, owner·queue·callback epoch clear, 확정 이전 phrase만 보존한다. 자동 재개나 hold 중간 복원은 없다.

저장 key는 `night-thread.progress.v1` 하나다. attemptId는 PLAY 전체, sessionId/epoch는 재생 세대, phraseId는 모티프 반복으로 구분한다. idempotency·유효 시도 원장·bestScoreEvidence·직전 최고 근거·assisted/standard 분리·contentVersion legacy·corrupt backup·quota 실패 시 결과 유지가 필요하다. 초기화는 사용자 확인 뒤 이 게임 key만 삭제한다. 개발 입력 ring buffer 최대5분이며 자동 외부 전송은 없다.

## D01~D20 결정 검수

| 결정 | 감사에서 고정한 의미 / 필요한 증거 |
|---|---|
| D01 | 타이 비교만 C5; L02 뒤 독립 tap은 E5=76 유지 |
| D02 | 여울6·솜새3 정지 키포즈이며 rig 납품 아님; runtime 보간/상태 교체 검사 |
| D03 | 파생본 crop4:3=[64,0,1024,768],16:9=[0,60,1152,648] |
| D04 | 교육 pending/false 유지; 내부 프리뷰 표기 및 공개 출고 차단 |
| D05 | 한 모티프 atomic phrase, 다음 반복 중에도 앞 phrase grace까지 provisional |
| D06 | 새 epoch에서 확정 이전 phrase의 source evidence ID 보존 |
| D07 | FINAL late-edge 충돌은 phrase+후속 및 attempt/best 철회 |
| D08 | LISTEN motif/tail 하위 구간 분리, OUTRO와 구별 |
| D09 | 출력 timestamp fallback 식·mapping method 표시·이중 차감 방지 |
| D10 | toggleHold 새 down 두 번, 중간 up rearm, release down onset 중복 금지 |
| D11 | COUNT_IN 끝 첫 onset early 창 정상 수용; 더 이른 down은 owner만 점유 |
| D12 | 기본 도식6+고급4, 꽃 원화4 또는 벡터4 중 한 계열 |
| D13 | L05는 L07 뒤 추천, 자유 접근은 선행 설명/건너뛰기 |
| D14 | L08/L09 한 마디 총4편지, onset0/480/960/1440 |
| D15 | 없는 이웃은 무한, 표본 없는 숙달 null |
| D16 | rest 저작 이벤트 표본 보존; L05 re-entry 고유4개 별도 |
| D17 | 유효 PLAY4회 종료로 완료; 보조 진도 허용/표준 별 근거 분리 |
| D18 | 보조44×44, 액션 높이72 이상·세로 컨테이너128 이상 |
| D19 | 반μs 양·음 대칭 abs→round, 부호 따로 |
| D20 | 늦은 짧은 tap envelope 축소/생략, targetEnd 연장 금지 |

## 자산과 화면 검수 계약

실제 팩은 **17 WebP+75 SVG=92논리 자산**, 선택 PNG17개다. 기본 bytes1,916,295B이며 ZIP 크기와 초기 앱 전송은 다른 값이다. 각 파일의 path·크기·상태·해시·anchor는 runtime manifest를 따른다. 공통+현재 장면만 decode 후 count-in; PNG/WebP 동시 preload, 다른3배경 preload, 교육10장 preload는 금지한다. 결과 도식은 한 장씩 읽는다. 모든92개 releaseApproved=false를 원문 그대로 유지한다.

여울512 canvas anchor[273.5566,480.9697], 꽃512[272.3317,477.7033], 솜새384 count/encourage[208.2297,350.622], demo[208.2297,357.0526]다. pivot을 자동 중앙으로 바꾸지 않는다. 빈 release 원 뒤 ribbon은 mask, L03 pillar는 ribbon 뒤 레이어다. 온실 액체128×96 대64×96은 같은 px-per-unit scale로2:1, 이미지 외곽 폭을 같게 맞추지 않는다. 방6타일 전체 폭 동일, 묶음만222↔33이다.

세로4:3·가로16:9 무대를 DOM 입력 영역과 재배치한다.320×568,390×844,768×1024,844×390,1366×768 및200% 텍스트 확대에서 가림·수평 스크롤이 없어야 한다. target 중심x=.3~.7, body16/설명18/line-height1.5, safe-area, main72/aux44px다. 연주 HUD는 이름·진행4매듭·pause 중심이며 결과는 수행 개념→점수→한 오개념→다음 연습이다. 고급 tick식은 선택 펼침에만 보인다.

고대비·reduced-motion은 색 외 모양과 필수 시간 게이지를 유지한다. score와 음악 시각은 동일하다. OS reduced-motion 초기값, 키 재지정, DOM 라벨/focus/disabled, 상태·결과만 live announce, 메뉴 Enter 입력 분리, 도움 출처 기록이 필요하다. 정지 포즈는 audible clock와 judge 상태로 선택하고 tie boundary 재press가 없어야 한다.

전송8,000,000B, 필수 오디오2,000,000B, 객체12/particle24/voice8, transition600ms는 목표 예산이다. frame p95≤33.4ms, input callback p95≤8ms,5분 예약 누적 드리프트<2ms, 공통 clock AV target p95≤1프레임은 실제 측정 전 목표로 남긴다. WebP 전송 압축을 decoded/GPU 메모리 감소라고 주장하지 않는다.

## 단계별 의존성과 인수 증거

아래는 요구사항 지도이며 pass 선언이 아니다. 실제 상태·로그는 `acceptance-checklist.md`와 최종 QA 보고서에 연결한다.

| 단계 | 선행 | 필요한 산출물 / 핵심 관문 |
|---|---|---|
| P00 | 기준2문서·ZIP·독립 환경 | contracts/decisions/implementation-state/provenance, hash·범위·pending 잠금 |
| P01 | P00 | strict TS·실행 scripts·DOM shell·320/가로, type/build 실제 실행 |
| P02 | P01 | Draft2020-12 schema·정규9레벨·campaign·정상/negative validator |
| P03 | P02 | compiler·phase/phrase·golden9·fake ClockPort·sourceNotationIds |
| P04 | P03 | 순수 judge/window/score/mastery·100회 replay |
| P05 | P04 | ActionInput·owner·timestamp·dedupe·sequence |
| P06 | P03/P05 | AudioClock·scheduler·mixer·voicePool·unlock·tap/hold gate |
| P07 | P06 | 보정16측정/12유효 median/MAD·확인 저장·skip 경로 |
| P08 | P04~07 | reducer·attempt/epoch/phrase 원장·late-edge rollback·settle |
| P09 | P08 | 중단 controller·fade/clear·사용자 재개·rearm·count-in |
| P10 | P03~09 | L02 지도→듣기→연습→PLAY4→결과, 무입력0/중간재타격58 |
| P11 | P10 | L01/L03·cross-bar/focused practice·타이 문항 |
| P12 | P11 | L04·정확2:1 geometry·점 전이 문항 |
| P13 | P11 | L06/L07·큰박222/33·seed 있는4문항·별도 개념 채점 |
| P14 | P12/P13 | L05·담당 성부 쉼·clean8/re-entry4·마지막 쉼 |
| P15 | P14 | L08/L09·2/3시간비·전체지도·자유접근/추천진도 |
| P16 | P15/manifest | AssetRegistry·장면선택load/unload·anchor/hash/decode/fallback |
| P17 | P16 |5뷰포트·200%·safe-area/crop/레이어/표적 배치 |
| P18 | P17 | 고대비/reduced-motion/toggleHold·assist 분리·keyboard/tree |
| P19 | P18 | ProgressRepository·migration/ledger/rollback·corrupt/quota/idempotency |
| P20 | P19 | 데이터기반 기보·6기본/4고급 도식·교육 preview·승인 manifest/gate |
| P21 | P20 |9키포즈 runtime 움직임·믹스·gate/peak/상태 예산 |
| P22 | P21 | 앱 네트워크·frame/input/node/drift 로그·목표와 관측 분리 |
| P23 | P22 | U46/I17/E15 추적·회귀·type/content/unit/integration/browser/build |
| P24 | P23/사람·기기 | 실제 모바일2종/오디오3경로·교육자·사용성 결과 또는 정확한 pending |
| P25 | P24결과 또는 미검증 제한 | dist·README·CHANGELOG·QA/권리/지원·로컬preview·파일hash·소스ZIP |
| P26 | 별도 V2 승인 | 이번 범위에서 차단; schemaV2/교정/회귀 없이 구현 금지 |
| P27 | 명시적 공개 배포 요청 | 이번 범위에서 차단; 외부 공개·계정·비용 임의 처리 금지 |

## 사람 검수와 남는 경계

본 감사는 실제 스피커 청음, iPhone/Android, Bluetooth/유선, 물리 AV 측정, 스크린리더 사용성, 교육자 서명, 초보8~12명 관찰을 수행하지 않았다. 자동 WebKit은 실제 iPhone이 아니고 synthetic input은 물리 입력 지연 측정이 아니다. 관련 상태는 **not run / pending**이다. 원 설계가 참조한113개 분석 보고서와017/032-3 원본에 관한 직접 검수 주장은 원 설계 작성자의 provenance이며 이번 감사에서 그 원본을 새로 열어 검수했다는 뜻이 아니다.

92자산의 releaseApproved=false, 교육 notation/listening pending을 승인 없이 true로 바꾸면 안 된다. 내부 프리뷰와 공개 교육 출고를 나누며, 로컬 빌드의 존재는 P24나 공개 출시 통과를 뜻하지 않는다. 직접 확인할 수 없는 검사는 결과를 지어내지 않고 대상·환경·미실행 이유를 최종 보고서에 남긴다.
