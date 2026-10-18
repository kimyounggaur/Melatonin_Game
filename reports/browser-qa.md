# 브라우저 검증 보고서

<!-- dependency-security-followup -->
Dependency security follow-up (1.0.1-preview): the21-case results below are the retained pre-patch baseline. Exactly8 overlapping cases were rerun after Vite7.3.7/Vitest4.1.11/Ajv8.20.0: **8 passed / 0 failed / 0 skipped**. This is not29 unique cases or a claim that all21 were rerun. See `browser-security-regression.md` and its complete nested raw JSON.

관측된 고유 항목: **21 passed / 0 environment blocked / 0 unresolved failed / 0 skipped**. 여러 실행의 최신 케이스 결과를 합친 수치다. 원래13개 전체가 한 번에 통과했다는 뜻이 아니다.

실행은 전용 headless Chrome·Firefox·Windows Playwright WebKit에서 수행했다. 사용자 탭·프로필은 사용하지 않았다. 볼륨은 실제 설정에서0으로 두고 AudioContext·예약·판정은 실제 시간을 사용했다. 가짜 시계, 점수 호출, 게임 상태 주입, AudioContext 모방은 사용하지 않았다. 화면·상태 관측은 읽기 전용 `window.__nightThread.status()`를 사용했다.

Windows Playwright WebKit26은 AudioContext/webkitAudioContext가 없어 처음 음악 경로4개가 unlock에서 막혔다. 개별 실패 상태 JSON을 보존했고 이 음악 실행 범위는 계속 environment blocked/not run이다. 현재 선택된 별도 WebKit 2검사는 unlock실패·재시도·무음PLAY진입금지, 정상지도링크를 통한9수업·기보·5뷰포트·200%글자·설정숫자경계를 확인한다. 선택된 검사의 passed 개수와 음악 경로 지원 여부를 구분한다. 실제 iPhone/native Safari 지원 확인으로 표시하지 않는다.

초기 sandbox의 ERR_NETWORK_ACCESS_DENIED와 sandbox서버/승인된브라우저 간 ERR_CONNECTION_TIMED_OUT은 실행환경실패였다. 승인된 동일 로컬서버·전용브라우저 실행으로 해결했다. CDP 초기 접점해제 하네스 오류는 빈 페이지의 trusted pointer 이벤트 probe로 분리했고 실제 보조손가락up→ownerup 시퀀스로 교정했다. 실패를 삭제하거나 점수 기대값을 낮추지 않았다.

초기13개 실행의 종합 JSON은 후속 중단 실행(8 skipped)으로 덮였다. 이를 복원했다고 주장하지 않으며 표에 해당 이력을 그대로 남긴다. 개별 상태·이미지 증거는 보존되어 있고, Chrome 주요5개·Firefox 주요4개·새 보정2개를 최종 소스로 다시 실행한 원시 로그를 최신 집계에 사용한다. 이전 실패가 포함된 실행도 삭제하지 않았다.

마지막 Firefox 재개 검사는 이전 paused 세션을 준비 완료로 읽는 테스트 경쟁을 엄격한 armed/unpaused 대기로 바로잡았다. 후속 실제 입력은 전달 지연으로90점(+31~99ms), 과보상70ms 하네스는79점(-53~-64ms)이 나왔다. 두 결과와 원시 로그를 보존하고 최종 고정30ms 명령 선행으로 같은 Perfect창·보정0·100점 기준을 재검증했다. 게임 시각/목표/점수 기대값은 바꾸지 않았다. 상세 원인·trace 경로는 browser-resume-readiness-harness.md 및 browser-firefox-transport.md에 남긴다.

## 실행 기록

| 기록 | passed(expected) | unexpected | skipped |
|---|---:|---:|---:|
| browser-cross-browser-round.json | 0 | 0 | 8 |
| browser-corrected-input.json | 1 | 0 | 0 |
| browser-eight-levels-first-webkit-static.json | 9 | 1 | 0 |
| browser-final-levels-webkit.json | 3 | 0 | 0 |
| browser-final-firefox-regression.json | 1 | 0 | 0 |
| browser-final-main-calibration.json | 10 | 1 | 0 |
| browser-final-firefox-owner-rerun.json | 0 | 1 | 0 |
| browser-final-firefox-owner-lead.json | 0 | 1 | 0 |
| browser-final-firefox-owner-lead30.json | 1 | 0 | 0 |

재현: `node node_modules/@playwright/test/cli.js test` (Windows 기본 프로젝트 선택: Chrome15·Firefox4·WebKit정적2). 로컬서버5286이 먼저 필요하다. 추가8레벨은 실제 시간이므로 수분이 걸린다. 플랫폼 네트워크 제한이 있는 환경에서는 로컬서버와 전용브라우저 모두 허용된 같은 실행환경에서 실행한다.

## 케이스별 근거

| 브라우저 | 케이스 | 상태 | 초 | 원시로그 |
|---|---|---|---:|---|
| chromium | E02 E03 E04: trusted keyboard and pointer hold/release, secondary owner ignored, pause/resume fresh count-in | passed | 52.9 | browser-final-main-calibration.json |
| chromium | L01: LISTEN 2 + tail -> practice 100% 2 -> PLAY 4 + OUTRO -> one zero-score result | passed | 48.4 | browser-eight-levels-first-webkit-static.json |
| chromium | L03: LISTEN 2 + tail -> practice 100% 2 -> PLAY 4 + OUTRO -> one zero-score result | passed | 99.8 | browser-final-levels-webkit.json |
| chromium | L04: LISTEN 2 + tail -> practice 100% 2 -> PLAY 4 + OUTRO -> one zero-score result | passed | 42.6 | browser-eight-levels-first-webkit-static.json |
| chromium | L05: LISTEN 2 + tail -> practice 100% 2 -> PLAY 4 + OUTRO -> one zero-score result | passed | 46.4 | browser-eight-levels-first-webkit-static.json |
| chromium | L06: LISTEN 2 + tail -> practice 100% 2 -> PLAY 4 + OUTRO -> one zero-score result | passed | 29.8 | browser-eight-levels-first-webkit-static.json |
| chromium | L07: LISTEN 2 + tail -> practice 100% 2 -> PLAY 4 + OUTRO -> one zero-score result | passed | 29.7 | browser-eight-levels-first-webkit-static.json |
| chromium | L08: LISTEN 2 + tail -> practice 100% 2 -> PLAY 4 + OUTRO -> one zero-score result | passed | 48.3 | browser-eight-levels-first-webkit-static.json |
| chromium | L09: LISTEN 2 + tail -> practice 100% 2 -> PLAY 4 + OUTRO -> one zero-score result | passed | 34.0 | browser-eight-levels-first-webkit-static.json |
| webkit | WebKit Windows capability: absent Web Audio gives retry guidance and never silently enters PLAY | passed | 1.8 | browser-final-levels-webkit.json |
| webkit | WebKit rendering: legitimate map link opens nine source-notation lessons, five viewport layouts and 200% text | passed | 8.9 | browser-final-levels-webkit.json |
| firefox | E01 E14: real-time L02 listen → practice → PLAY no-input earns zero and emits no lead/player attacks | passed | 48.7 | browser-final-main-calibration.json |
| chromium | E12 calibration -250ms: real keyboard reaches first onset, every hold/release and standard 100 without changing targets | passed | 45.3 | browser-final-main-calibration.json |
| chromium | E12 calibration 250ms: real keyboard reaches first onset, every hold/release and standard 100 without changing targets | passed | 43.6 | browser-final-main-calibration.json |
| chromium | E01 E08 E09: nine lessons expose exact source notation, pitch, ties, grouping and tempo | passed | 4.4 | browser-final-main-calibration.json |
| chromium | E06: five viewport layouts, readable 200% text, keyboard settings and semantic controls | passed | 5.4 | browser-final-main-calibration.json |
| chromium | E01 E14: real-time L02 listen → practice → PLAY no-input earns zero and emits no lead/player attacks | passed | 46.8 | browser-final-main-calibration.json |
| chromium | E05: real browser screen orientation change interrupts and user resume starts a fresh count-in | passed | 1.4 | browser-final-main-calibration.json |
| firefox | E01 E08 E09: nine lessons expose exact source notation, pitch, ties, grouping and tempo | passed | 7.6 | browser-final-main-calibration.json |
| firefox | E06: five viewport layouts, readable 200% text, keyboard settings and semantic controls | passed | 5.9 | browser-final-main-calibration.json |
| firefox | E02 E03 E04: trusted keyboard and pointer hold/release, secondary owner ignored, pause/resume fresh count-in | passed | 55.1 | browser-final-firefox-owner-lead30.json |

## 모든 레벨의 실제 경로

L02는 기본 경로에서 무입력0점 및 실제 키보드/포인터로100점·N12·4프레이즈를 확인한다. 나머지8개는 LISTEN2+tail1마디 → 사용자선택 →100%연습2 → 사용자선택 →PLAY4 →OUTRO1마디 →결과 →지도/새로고침을 실제 시간으로 실행한다. 연습은2모티프의 음악·판정 종료후0.8초 이내에 준비화면으로 가야 하며 별도OUTRO마디를 추가하지 않는다. 결과는 한 번 저장하고, 무입력PLAY의 guide/player 발음은0이어야 한다.

| 레벨 | 실행결과 | 점수 | N | 확정프레이즈 | 초 | 근거 |
|---|---|---:|---:|---:|---:|---|
| L01 | passed | 0 | 16 | 4 | 48.0 | browser-all-levels-L01.json |
| L03 | passed | 0 | 16 | 4 | 99.3 | browser-all-levels-L03.json |
| L04 | passed | 0 | 16 | 4 | 42.2 | browser-all-levels-L04.json |
| L05 | passed | 0 | 20 | 4 | 46.0 | browser-all-levels-L05.json |
| L06 | passed | 0 | 24 | 4 | 29.3 | browser-all-levels-L06.json |
| L07 | passed | 0 | 24 | 4 | 29.3 | browser-all-levels-L07.json |
| L08 | passed | 0 | 16 | 4 | 47.9 | browser-all-levels-L08.json |
| L09 | passed | 0 | 16 | 4 | 33.6 | browser-all-levels-L09.json |

## 부분 연습 추가 회귀

L03의 실제 결과에서 기본/심화 교육자료를 바꾸고, 원곡의 75% 부분 연습을 시작한다. 실패한 두 마디를 함께 유지하고 붙임줄 c→d를 하나의 연속음으로 컴파일했는지, 카운트인 1마디와 2회 반복 뒤 바로 복습 준비로 돌아오는지 확인한다. 연습 전후 최근 시도와 레벨 기록이 같고 원래 레슨으로 복귀하는지도 확인한다. 세부 근거는 browser-all-levels-L03.json의 focused 및 focused-review 스크린샷에 저장된다.

## 보정 경계 추가 회귀

실제 설정에서 입력 보정을 -250ms/+250ms로 지정하고 L04의 모든 8개 hold 시작과 해제를 원시 시각=음악 목표+보정값에 실제 키보드로 전달한다. 첫 목표0초의 음수 보정 입력이 카운트인에서 걸러지지 않는지, 양수 보정 입력이 원시 시계의 조기 마감으로 MISS 처리되지 않는지 확인한다. 음악 목표시각은 동일한 채 N16·표준100점과 단일 저장을 요구한다. 물리 지연을 측정하거나 청음 보정을 완료했다는 뜻은 아니다.

## 미실행·승인 경계

- 실제 iPhone/Android, 스피커·유선·Bluetooth 청음, 물리 AV/입력지연, 실기기 GPU/메모리, 스크린리더 사용성, 교육자 검수, 초보 학습 효과: not run/pending.
- 전체9레벨의 브라우저 전수 경로는 무입력0점이다. 정상 hold/tap 성공은 L02 및 L04 보정 회귀에서 확인하며, 모든 레벨의 모든 성공·오류 패턴을 브라우저로 전수 검증하지 않았다. L03 부분 연습 재시도 버튼과 부분 실패별 최소 마디 선택의 모든 조합도 별도 전수 검증하지 않았다.
- Firefox·WebKit의 CDP 멀티터치/실제 화면방향 에뮬레이션은 미지원이므로 해당 전용검사는 Chrome에서만 수행했다. Chrome의 에뮬레이션도 실제 기기 회전 검사와 다르다.
- 이미지92개의 releaseApproved=false 및 교육/청음 pending을 유지한다. 공개 교육 출시·V2 승인이나 본 감사가 공개배포를 수행했다는 주장은 하지 않는다.
- 200% 글자 CSS 확대와 자동 DOM/기하 확인은 전체 보조기술 접근성 검수를 대체하지 않는다.

스크린샷: `output/playwright/browser-*`. 개별 상태·입력·오디오 예약·저장 근거: `reports/browser-*.json`. hover색·대비 및 별도 CDP probe는 케이스수와 분리된 supporting evidence다.
