# 밤실 공방 인수 추적표

이 문서는 원 설계13장·프롬프트팩 부록G의 U01~U46/I01~I17/E01~E15 및 D 결정을 추적한다. 아래 상태는 이 문서 작성자의 실행 증거 범위를 표시한다. `planned`는 통과가 아니며, 구현팀의 실제 테스트 결과는 최종 QA 보고서에서 명령·케이스·로그와 연결해야 한다. 자동 검사와 사람/실기기 검사를 서로 대체하지 않는다.

## 현재 확인된 자료 검사

| 항목 | 상태 | 증거 |
|---|---|---|
| 원문2개 전수 읽기 | passed (정적) | promptpack4,607줄/design1,543줄, `spec-audit.md` |
| 기준 design/schema/levels/ZIP/manifest 해시 | passed (정적) | `reference-fixtures/verification.json` |
| JSON25블록 파싱 및 원문/파싱객체 동등 | passed (정적) | `reference-fixtures/manifest.json`, `.source/.parsed.json` |
| 설계와 팩 schema/9레벨 객체 일치 | passed (정적) | 독립 source verifier |
|9레벨 gate/시간/N/rest/큰박 golden 일치 | passed (정적) | `node docs/reference-fixtures/verify-reference.mjs` |
|92기본+17폴백 파일 bytes/SHA | passed (정적) | 같은 verifier의 asset/fallback 항목 |
| 위 독립 정적 검사 합계 |540 passed /0 failed | `reference-fixtures/verification.json` |
| 게임 구현 type/unit/integration/browser/build | audit에서 미실행 | 구현팀의 실제 QA 로그로 판정 |
|92자산 공개 승인 | pending | 원본 runtime manifest 모두 releaseApproved=false |
| 실제 청음·모바일·교육자·초보 관찰 | not run / pending | 아래 사람 검수표 |
| V2/공개배포 | 범위 밖·차단 | P26/P27 별도 승인 없음 |

## 단위 U01~U46

이 표의 각 항목은 **planned**이며 최종 QA에서 실제 test 파일/케이스·명령 결과로 pass/failed/not run을 갱신한다. 자료 검사540개를 이46개 게임 단위검사 통과로 계산하지 않는다.

| ID | 입력/조건 | 정답 / 불변식 |
|---|---|---|
| U01 |4/4,3/4,6/8 | barTicks1920,1440,1440 |
| U02 | 온/2분/4분/8분/16분 |1920/960/480/240/120 |
| U03 | 점4분/점2분 |720/1440 |
| U04 | 점4분인데 ticks480 | duration 오류 |
| U05 |4/4합1680 | 부족 오류·자동 보완 없음 |
| U06 | at overlap/gap | 원본 순서 그대로 reject |
| U07 | L02 | gate2·hold0~960·중간attack0 |
| U08 | L03 | hold1440~2880·1920경계attack0 |
| U09 | C5→D5 tie | pitch mismatch reject |
| U10 | tie 중간 rest | continuity reject |
| U11 | rest.tieGroup | schema reject |
| U12 | tieGroup1음 | dangling tie reject |
| U13 | L06/L07 | bars동일·큰박다름 |
| U14 | L08/L09 | bars동일·시간비2/3 |
| U15 | onset±45/45.001ms |1/.75 |
| U16 |±90/90.001/140/140.001ms |.75/.40/.40/0 |
| U17 | onset gap200ms | W90ms, thresholdUs28929/57857/90000 |
| U18 | release±60/110/160ms |1/.75/.40·경계포함 |
| U19 | tie중간up | BROKEN/release0·재입력복구없음 |
| U20 | onset miss후정확up | onset/release0 |
| U21 | end+160ms초과hold | 음종료·다음onset자동성공없음 |
| U22 | key repeat20회 | 최초down만·extra0 |
| U23 | 두번째pointer down/up | owner불변 |
| U24 | 같은timestamp up→down | 이전release·새onset 각1회 |
| U25 | L02 perfect1모티프 | N3/earned3/score100 |
| U26 | N4/earned3.5/extra1 | score81 |
| U27 | extra>N | penaltycap·score0~100 |
| U28 | raw+80/offset+80 | corrected0 |
| U29 | raw−80/offset−80 | corrected0 |
| U30 | getOutputTimestamp | latency이중차감없음 |
| U31 | tieBoundary | onset후보아님 |
| U32 | rest끝정상early | rest clean·extra0 |
| U33 | pause rollback | earned/N/extra/mastery동시철회 |
| U34 | 같은로그100회 | score/순서/state동일 |
| U35 | 이전sessionId | 현재기대항목불변 |
| U36 | N0 PLAY | authoring오류 |
| U37 |6/8/qBpm90 | 큰박720tick1초·점4분=60 |
| U38 | tap빠른/늦은up | onset동일·길이숙달없음 |
| U39 | assisted90 | assisted근거만갱신 |
| U40 | corrupt/quota | 게임/결과사용가능·안내 |
| U41 | event유효,receipt가음악late창후80ms | grace100내정상. 최종deadline후추가80ms아님 |
| U42 | 정상onset/release FINAL뒤도착 | 해당phrase rollback·miss저장금지 |
| U43 | wide1.35+밀집onset | 확대후.45d cap |
| U44 | tap늦은down→rest | 원래gateEnd내종료·음길이연장0 |
| U45 | count-in끝첫early | 일반onset과같은허용창 |
| U46 | HIT뒤실제재타격 | EXTRA_DOWN·기술rollback없음 |

필수 저작 negative17개는 `promptpack-12-invalidLevelMutations.source.json`이다. 오류코드가 구현 enum과 다르면 명시적인 매핑을 남긴다. 첫 오류순서만 비교하지 않고 필수코드 포함을 확인한다. 구조검사 실패를 semantic 단계로 강제 통과시키지 않는다.

## 통합 I01~I17

각 행의 현 상태는 **planned**다. fake clock/AudioContext mock 검사와 실제 브라우저 검사를 로그에 구분한다.

| ID | 시나리오 | 정답 / 필요한 증거 |
|---|---|---|
| I01 | L02시연스케줄 | tieattack/end각1회 |
| I02 | fps60→30→15 | 음악/판정target불변 |
| I03 | scheduler미예약음 | catch-up폭음없이phrase무효화 |
| I04 | hold중hidden→복귀 | 무실패중단·사용자재개/count-in |
| I05 | pointercancel | 정상release0으로저장하지않음 |
| I06 | 정상up후lostcapture | interrupt추가0 |
| I07 | 비ownerup | ownergate유지 |
| I08 | pause/retry20회 | node/listener누수·중복음0 |
| I09 | 마지막release+grace | 확정전RESULTS저장0 |
| I10 | resume거절 | 무음PLAY금지 |
| I11 | oldJudgeEvent | 다음장면/score불변 |
| I12 | L03focusedpractice | tie시작부터2마디 |
| I13 | RESULTS완료2회 | 저장1회 |
| I14 | assetmissing/decodefail | count-in전차단·retry/exit |
| I15 | receipt지연250ms | 기술중단·usermiss아님 |
| I16 | output경로변경 | 보정안내·현재phrase무효화 |
| I17 | FINAL뒤validlateedge | UI/저장후보/best근거철회 |

## 브라우저 E01~E15

각 행의 현 상태는 **planned**다. Chromium/Firefox/WebKit별 pass/failed/not run, 실제 실행 버전, screenshot/trace를 QA 보고서에 남긴다. 없는 브라우저나 실행 거절은 구체적인 blocker로 적는다. Playwright 입력은 물리 지연 측정이 아니다.

| ID | 경로 | 검사 조건 |
|---|---|---|
| E01 | 빈저장→start/unlock→L01listen/practice/play→result→map | 접근이름·focus·각phase횟수 |
| E02 | keyboard | Space repeat·빠른up/down·pause·menuEnter분리 |
| E03 | pointer/touch | ownerhold·버튼밖move·추가pointer·ownerup |
| E04 | L02tie | 연속hold대480up/down결과/문구차이 |
| E05 | L03hidden/resume |2마디phrase재시작·이전임시점수철회 |
| E06 | 모바일/가로/desktop/200% |320×568,390×844,768×1024,844×390,1366×768·가림/수평scroll0 |
| E07 | reduced-motion | 배경/particle제거·target/sound/score동일 |
| E08 | meter |6tap동일·큰박3/2·표시단위4분/점4분·quiz분리 |
| E09 | tempo |72/108새count-in·음/rest동일·실제시간2/3 |
| E10 | save/reload | standard80+assisted95분리 |
| E11 | corrupt/quota | 정상수업/결과가능 |
| E12 | networkoff | 이미읽은자산사용·없는자산retry·무음진입금지 |
| E13 | 최종음향 | 교체후tieattack/gate스케줄동일 |
| E14 | 마지막허용release | 창+grace/음/쉼끝전결과저장0 |
| E15 | validtimestamp지연전달 | 저장된잘못된결과철회·기술재시작 |

## D 추가 경계와 제품 검수

이 항목도 실제 테스트에 연결하기 전에는 **planned**다. 명세의 빈틈을 구현 결과에 맞춰 바꾸지 않는다.

| ID | 연결 결정 | 필수 기대값 |
|---|---|---|
| A01 | D05/D06 | L03/L05두마디atomic·앞확정phraseevidence보존 |
| A02 | D07 | result이후lateedge면attemptvalid=false/best90→이전80복구 |
| A03 | D08 | LISTEN2회+tail1마디후무시간제선택 |
| A04 | D09 | fallback식·미지원/zero/discontinuous·latency중복차감0 |
| A05 | D10 | toggle down-up-down→onset/release·동일down새onset0 |
| A06 | D11 | 첫early수용·너무이른count-in down은up필요 |
| A07 | D12 | 교육기본6/고급4·꽃1계열만load |
| A08 | D14 | 우체역한마디4편지·0/480/960/1440 |
| A09 | D15 | 이웃없음∞·분모0mastery=null |
| A10 | D16 | L03rest3/모티프·L05clean8/re-entry4 |
| A11 | D17 | 미완료PLAY저장0·보조완료진도허용·표준별분리 |
| A12 | D18 | main72/aux44·세로region128·targetx.3~.7 |
| A13 | D19 |±45.0005ms→45001μs/.75 |
| A14 | D20 | end10.500/now10.495/safe3ms→음≤2ms또는생략 |
| A15 | clock | epochDOMtime변환·5초초과중단·visualOffsetscore불변 |
| A16 | calibration |4예고+16측정/첫4제외/12유효,median80/MAD4.5,45경계,±250/확인 |
| A17 | dispatch | target10000/event10130/receipt10220=.40;10250=rollback;receipt-event201=interrupt |
| A18 | asset |92기본17WebP/75SVG·17선택PNG·decode/fallback·존재/hash |
| A19 | anchors | 여울/꽃/솜새demo개별anchor·포즈발밑튐검수 |
| A20 | scene | tie경계재press없음·빈원mask·pillar뒤·온실같은scale2:1·방6타일폭 |
| A21 | accessibility | DOMtree/focus/라벨/disabled·keyF/J/Enter·매노트announce0 |
| A22 | storage | sentinel다른key보존·corruptbackup·legacy·저장실패결과유지 |
| A23 | education | false/pending유지·미승인내부표기·공개gate실패 |
| A24 | privacy/scope | 계정/서버/마이크/분석/결제/공개배포/V2자동추가0 |

## P22 측정표

아래 수치는 목표이고 본 감사의 관측값은 아니다. 앱/브라우저에서 측정한 경우 방법·build hash·환경과 결과를 QA 보고서에 기록한다.

| 항목 | 목표 | 감사 관측 |
|---|---|---|
| 첫장면전체전송 |≤8,000,000B(JS/CSS/assets/audio/font/요청) | not run |
| 필수오디오 |≤2,000,000B | not run; 팩에오디오없음 |
| 장면주요object/particle/voice |≤12/24/8 | not run |
| renderframep95 |≤33.4ms | not run |
| inputcallbackp95 |≤8ms | not run |
|5분절대예약누적드리프트 |<2ms | not run |
| 공통clockAVtargetp95 |≤1frame | not run; 물리AV와구별 |
| WebP/PNG동시preload |0 | not run |
| 다른3배경/교육10장preload |0 | not run |
| pause/retry20회node/listener/메모리 | 지속증가없음 | not run |

## P24 실제 사람·기기 관문

| 검수 | 대상/방법 | 현재 상태 | 완료에 필요한 기록 |
|---|---|---|---|
| 실제모바일 | iPhoneSafari+AndroidChrome | not run | 기기/OS/browser/build/date·잠금/회전/cancel/safe-area |
| 표적desktop | Chromium/Firefox/Safari실제OS | not run | 버전·키repeat/hidden/resume |
| 실제청음 | 내장/유선/Bluetooth각1 | not run | 경로별unlock/resume/tie/쉼/잔여지연 |
| 물리AV | loopback/고속촬영등 | not run | 장치·방법·관측값·한계 |
| 실제성능 | 중간사양mobile | not run | p95/network/memory·저사양제한 |
| 교육자기보/동시음향 | 자격있는reviewer | pending | reviewer/date/dataHash/renderer/audio·본항목별승인 |
| 초보사용성 |8~12명목표 | not run | 모집/정보권한·L02연속2회/quiz3of4/안내관찰·표본한계 |
| screenreader/사용성 | 실제보조기술 | not run | 조작가능범위·미지원한계 |

자동 WebKit pass를 iPhone pass로 쓰지 않는다. 예약 로그는 청음이 아니고, 정적 bytes는 GPU 실측이 아니며, 수학 pass는 교육자 승인이나 학습 효과의 증명이 아니다. 현재 manifest의 모든 releaseApproved=false를 유지한다.

## P25 인계 관문

- [ ] 실제 package scripts와 일치하는 설치·type/content/unit/integration/e2e/build/preview 명령 및 exit 결과.
- [ ] 깨끗한 설치 또는 동등 재현·로컬 preview·L02 플레이 경로·실제 URL/포트.
- [ ] 네장면9레벨·listen2/tail1/practice2/play4/outro1·결과/저장/복구 확인.
- [ ] 최종 dist·소스ZIP·README·CHANGELOG·QA·권리/폰트고지·지원제한·파일hash.
- [ ] 기능/자동화/교육검수/실기기/배포상태를 별도 보고하고 pending을 pass로 바꾸지 않음.
- [ ] 미승인자산내부프리뷰표기·공개교육gate실패가예상대로동작.
- [ ] 원본문서/미술/공유권한/무관파일보존·다른게임포트/브라우저비간섭.
- [ ] Drive저장가능시지정폴더의소스/보고서ID·부모·크기readback. 막히면정확한target/reason/outcome보고.
- [ ] P26/V2·P27/공개배포·새비용·보안승인·필수로그인임의우회없음.

현재 이 체크박스는 인계자가 실제 증거를 연결하기 전 상태다. P24 미실행을 명시한 내부 검토 빌드는 준비할 수 있으나 공개 교육 출시 통과나 실기기 지원 완료를 주장할 수 없다.
