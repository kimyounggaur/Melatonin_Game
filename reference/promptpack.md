# 밤실 공방: 꿈을 잇는 리듬
## Astra Ultra용 모바일 퍼스트 바이브 코딩 실행 프롬프트팩

버전 1.0 · 작성일 2026-10-18 · 한국어 우선 · 독립 게임 4장면/9레벨

이 파일은 **코딩 에이전트에게 한 단계씩 전달할 실제 작업 지시와 검증 오라클**이다. 아직 게임 코드를 구현하거나 브라우저·기기·교육자 검수를 완료했다는 보고가 아니다. 누르기, 이어 누르기, 제때 놓기, 기다리기를 실제로 수행하는 게임을 만든다. 설명 카드와 점수표만 있는 화면은 완성품이 아니다.

## 0. 먼저 읽기: 사용법과 기준 자료

1. 사용자가 선택한 개발 환경의 독립 저장소에 기준 설계, 이 팩, 모바일 에셋 ZIP을 제공한다. `docs/source-design.md`, `docs/mobile-promptpack.md`, `public/assets/night-thread/`는 권장 배치다. 기존 파일이 있으면 비교부터 한다.
2. 실제 모델 선택 UI에서 Astra와 Ultra 추론 설정을 선택한다. 이 문구를 프롬프트에 적는 것만으로 모델이나 추론 수준이 바뀌었다고 주장하지 않는다. 해당 선택이 없는 환경에서는 실제 선택 가능한 모델·설정을 기록하고 사용자에게 알린다.
3. 아래 마스터 프롬프트를 한 번 전달하고 P00부터 하나씩 실행한다. 앞 단계의 산출물·테스트·화면 증거를 확인한 뒤 다음 단계를 요청한다. 실패한 테스트를 숨긴 채 여러 꿈을 동시에 꾸미지 않는다.
4. 새 대화에서는 마스터 프롬프트와 다음 P번호, 최신 `docs/implementation-state.md`를 함께 제공한다. 단계가 길어져도 상태 문서에 검증한 내용과 미검증 내용을 구분한다.
5. P10의 L02 최소 플레이가 첫 작동 관문이다. P15까지 네 장면의 학습이 연결되고, P24의 인수 검수 후 P25에서 인계용 빌드를 준비한다. P26은 별도 승인 후 쓰는 V2다. P27은 사용자가 배포를 요청한 경우에만 검토한다.
6. 오류가 생기면 R01~R10의 해당 복구 프롬프트를 쓴다. 재설치·전체 재작성부터 하지 말고 재현 로그와 최소 failing test부터 만든다.

### 0.1 파일과 우선순위

- [기준 설계 Markdown](https://drive.google.com/file/d/1JvydwaMM3ha5sgdayFlhabsHjfMjQcSv/view): `melatonin_music_theory_game_design.md`, 버전 1.0
- [모바일 전달용 에셋 ZIP](https://drive.google.com/file/d/1vY7Wj3NcMg0uQvu2t8BgpTAcwDVE2GNY/view): `night_thread_mobile_runtime_v1.zip`
- [미술 에셋 폴더](https://drive.google.com/drive/folders/14NAkEcVe1nM1yitrBArXO6xC9qz9_ydg)
- [꿈 게임 문서 폴더](https://drive.google.com/drive/folders/1TouesZsM3iV5ubfywULsO9oJSdNW1hEX)
- 우선순위: 사용자의 최신 명시적 변경 → 기준 설계의 음악·입력·채점·개인정보 계약 → 현재 에셋 manifest의 실제 파일 사실 → 이 팩이 명시한 구현 구체화 → 저장소 관례.
- 저장소의 보안·작업 지침도 준수한다. 충돌은 `docs/decisions.md`에 근거, 영향, 선택, 검증, 승인 필요 여부를 기록한다. 테스트를 통과시키려고 정답 값을 버그에 맞춰 바꾸지 않는다.
- 원 설계와 마스터 원화는 읽기 전용 기준 자료다. 이 팩은 별도 파일이며 원문을 수정하지 않는다. 자산 경로의 대소문자·확장자·해시는 manifest 기준이다.
- 일반 학습자 대상이며 특정 학년·연령대나 교육과정을 추정하지 않는다. 계정, 학생 이름, 서버, 마이크 녹음, 구매, 결제, 리더보드, 분석 SDK는 범위 밖이다.

### 0.2 완성품의 경험

깊은 남색 종이에 황금빛 실, 종이와 천의 질감으로 이루어진 네 꿈이 있다. 여울과 솜새는 독창적인 인물이다. 사용자는 먼저 듣고, 한 손으로 크게 누르고, 이어 누르다가 빈 원에서 놓고, 쉼 동안 맥박을 느낀다. 연주 중 HUD는 장면 이름·진행 매듭·일시정지 정도로 작게 유지한다. 결과에서 방금 한 동작과 한 가지 다음 연습을 설명한다. 참고작의 캐릭터·음악·로고·화면을 재현하지 않는다.

모바일 세로 화면은 4:3 장면과 별도 DOM 입력 영역을 사용한다. 가로 화면은 장면과 입력 영역을 재배치한다. 데스크톱의 전체 화면을 축소한 모습, 작아진 글자, 잘린 표적은 인수 실패다.

### 0.3 검증 기준 해시

| 파일 | SHA-256 |
|---|---|
| `melatonin_music_theory_game_design.md` | `6a4b3db31f6288bde3924c4dc21bb64d49c12f518cc77c0d33404f55a654eedb` |
| `dream_level_schema.json` | `412439879271fae832933059a490f74d6eae0848faa7fb2e3ac05cc6b0128c5a` |
| `dream_level_examples.json` | `d7b608c79ca28214329607b1ea4773d6c810b269f2ce23ccfb9e18a1e1c2c6ce` |
| `runtime_manifest.json` | `2c916a9a196990a1e9ddb2c61436733473879448301bc1f34af02b2d1582eb56` |

모바일 ZIP 기준 SHA-256은 `67478bb9a7c96454cd0946aee9d1134c880c0c40ffb75a5eaa4052ef583c44ec`, 크기는 10,123,168바이트다. ZIP 전체 용량은 앱 초기 로드 용량이 아니다. 부록의 JSON은 읽기 편한 직렬화이므로 공백이 달라도 파싱 후 객체 동일성을 비교한다.

## 1. 먼저 고정할 차이·충돌·구체화 결정

아래 D 항목은 원문을 몰래 바꾸는 대신 개발 첫 단계에서 채택 여부를 기록할 기본 해석이다. 음악 내용의 변경이 필요하면 중단하고 사용자에게 차이를 제시한다.

| ID | 원문/납품에서 확인한 차이 또는 빈틈 | 이 팩의 명시적 처리 |
|---|---|---|
| D01 | 실빛다리 결과 서술에는 ‘음 높이는 모두 C5’라고 있으나 L02 JSON의 뒤 tap은 E5 | C5 두 음의 타이 비교만 C5이고 뒤 독립 tap은 E5=76을 유지. 실제 JSON을 C5로 바꾸지 않음 |
| D02 | 미술 계획은 여울·솜새 rig 각 1개, 현재 납품은 상태별 정지 키포즈 | 리그가 있다고 가정하지 않음. 앵커 일치 상태 교체·가벼운 보간부터 구현. 새 리그 제작은 별도 작업 |
| D03 | 원본 1536×1024 크롭과 모바일 1152×768 크롭이 다름 | 런타임 manifest의 4:3 [64,0,1024,768], 16:9 [0,60,1152,648]만 해당 파생본에 적용 |
| D04 | 교육 출고는 승인 자산만 허용하지만 현재 교육 도식은 pending/false | 내부 개발 프리뷰는 미승인 표시와 함께 사용. 공개 교육 빌드는 사람이 승인하기 전 실패. false를 자동 true로 바꾸지 않음 |
| D05 | ‘현재 프레이즈’ 크기와 늦은 입력 확정의 관계가 명시적으로 고정되지 않음 | 한 모티프 반복을 하나의 atomic phrase로 정의. L03·L05는 2마디 전체. 다음 반복이 시작돼도 앞 반복의 늦음창+grace가 닫힐 때까지 provisional |
| D06 | 중단 때 sessionId 변경과 이전 프레이즈 보존을 동시에 요구 | 새 sessionId에 이전의 확정 phrase 증거를 참조해 이어 감. 입력 epoch와 결과 근거 chain을 분리. 폐기한 epoch의 입력은 재개한 기대 항목을 건드리지 않음 |
| D07 | 과거 확정 miss와 정상 늦은 edge가 충돌할 때 저장 철회 필요 | 영향을 받은 phrase 및 그 뒤 의존 구간을 무효화하고 해당 phrase 카운트인부터 재시작. 그보다 앞의 확정 phrase만 유지. 결과 저장 후라도 해당 결과와 best 근거를 철회 |
| D08 | LISTEN tail 1마디가 상태 표에는 별도 상태로 없음 | LISTEN 내부 subphase `motif`/`tail`로 표현. 2회 시연 뒤 1마디 tail, 그 뒤 PRACTICE_READY. PLAY의 OUTRO와 혼동하지 않음 |
| D09 | fallback 지연값 사용은 지시하지만 식은 생략됨 | `audible = anchor.contextSec + (p-anchor.perfMs)/1000 - baseLatency - outputLatency`. 없는 값은 0, 추정임을 표시. getOutputTimestamp 경로에서는 둘 다 추가 차감하지 않음 |
| D10 | toggleHold의 구체적인 물리 edge 변환은 생략됨 | 첫 새 down→논리 onset, 물리 up은 rearm만, 다음 새 down→논리 release. release 동작을 동시에 새 onset으로 재사용하지 않음. 표준 hold 숙달에서 제외 |
| D11 | 카운트인 동안 무채점이지만 첫 onset early 허용창은 받음 | COUNT_IN 마지막 구간부터 첫 PENDING onset만 정상 매칭. 그보다 이른 down은 점수 없이 owner를 점유하고 up으로 rearm 필요 |
| D12 | 도식 기본 6개와 파일 10개, 꽃 원화와 벡터 4개씩 존재 | 기본 도식 6+고급 4. 꽃은 원화 4상태 또는 벡터 4상태 중 하나. 이중 로드·다른 의미의 8단계로 해석 금지 |
| D13 | 안내에는 L05를 나중에 ‘열기’, 진도 설명에는 추천 순서·건너뛰기 | 추천 경로 L01 L02 L03 L04 L06 L07 L05 L08 L09. 점수 잠금은 하지 않음. 자유 접근에는 선행 설명과 건너뛰기 |
| D14 | ‘편지 4개가 한 마디에 한 번씩’ 문구가 해석상 모호 | L08/L09 데이터대로 한 마디 총 4회, onset 0/480/960/1440. 각 편지가 한 번 도착 |
| D15 | ‘이웃 d’가 무한인 마지막 단독 onset이나 평가할 rest가 없는 경우 | 없는 이웃은 무한으로, 실제 존재하는 이웃만 최소. 표본 없는 숙달은 null/해당 없음. 0/0을 100%로 만들지 않음 |
| D16 | 연속 rest를 합칠지 원문이 고정하지 않음 | MVP 숙달 표본은 저작 rest 이벤트별로 유지. L03의 앞 960+480 쉼은 2개. 화면·오디오 침묵 span만 합칠 수 있으며 표본 통계를 바꾸지 않음 |
| D17 | 해금은 완료만 필요, 별의 기본/보조 구분 일부 생략 | 완료는 유효한 4회 PLAY 종료. 중단 중인 시도는 완료 아님. 보조도 진도는 열고 기본 최고점·기본 별 2/3 근거는 섞지 않음 |
| D18 | UI 라벨 파일의 44px는 아이콘 공통 최소, 원문 액션 버튼은 72px | 보조 44×44 이상, 주 액션 높이 72 이상·컨테이너 128 이상. 아이콘 기본치를 주 버튼 목표로 오용하지 않음 |
| D19 | 원문 signed Math.round와 ±대칭은 정확한 음수 반μs에서 충돌 | 크기 `Math.round(Math.abs(correctedErrorMs)*1000)`로 판정하고 부호는 별도 보존. ±45.0005ms는 모두 45001μs·둘째 등급. 창 임계값은 양수에서 round |
| D20 | 늦게 전달된 tap은 attack 5+release 8ms를 넣을 공간이 부족할 수 있음 | safeStart≥targetEnd면 음 생략. 남은 양의 길이가 짧으면 envelope를 그 안으로 축소/생략. targetEnd 연장 금지, 원 timestamp 채점 유지 |

D05~D10·D15~D17·D19~D20은 구현 세부를 정하는 제안이다. 채택 기록과 테스트를 남긴다. 다른 합리적 처리가 필요하면 변경 이유를 설명하고 동등한 음악/공정성 불변식을 증명한다.

## 2. 바꾸면 안 되는 음악·게임 계약

### C01. 장면과 학습 내용

MVP는 thread-bridge/실빛다리 L01~L03, crescent-greenhouse/반달 온실 L04~L05, folding-room/접히는 방 L06~L07, cloud-post/구름 우체역 L08~L09다. 이름이 비슷한 다른 게임의 M01, ROUND/RESPONSE, down-only 판정, Q 가중 점수, 50ms grace, 1.5배 도움 판정 규칙을 가져오지 않는다. 이 게임의 hold release는 별도 평가다.

새 개념은 한 수업에 하나씩 도입한다. 004·017·006·007·032-3·030-1의 음악 원칙을 사용하며 006/007의 의심 비례 원본을 재사용하지 않는다. 054 당김음과 031-3 스윙은 V2 차단 상태다.

### C02. 데이터와 시간

PPQ=480. q는 4분음표 길이이며 모든 박자의 교육적 큰박이 아니다. 온/2분/4분/8분/16분은 1920/960/480/240/120 tick, 점4분 720, 점2분 1440. 마디 길이는 `n*4/d*480`: 4/4 1920, 3/4와 6/8 1440. 모든 tick·at는 정수. `seconds=tick/480*60/quarterBpm`를 transport 원점에서 매번 계산한다.

원본은 bars[].events[]다. JSON Schema 구조검사 다음 semantic validator에서 마디 합계·원본 순서의 at 연속성·음가·ID·MIDI·타이를 검사한다. 잘못된 at를 정렬하거나 빈 곳에 쉼을 자동 삽입하지 않는다. C5=72, D5=74, E5=76, G5=79. denominator/dots와 ticks가 다르면 실패한다.

같은 tieGroup은 인접한 동음·동일 철자·동일 MIDI·hold·최소 2음이다. 마디선은 통과 가능하나 쉼이나 다른 음으로 끊기면 거부한다. 같은 tieGroup 문자열을 다음 반복까지 암묵적으로 연결하지 않는다. 원래 notation은 보존하고 sound gate/expectation만 합친다.

### C03. 듣기·연습·연주

한 마디 카운트인, 듣기 모티프 2회+tail 1마디, 사용자의 선택, 새 카운트인, 연습 2회, 선택, 새 카운트인, 연주 4회, 판정/음 종료 대기, OUTRO 1마디, 결과다. 대기 화면에는 시간 제한이 없다. 연습은 75%·100%, 기본 연주는 100%다. 속도는 시작 전에 표시하며 실행 도중 자동 변경하지 않는다.

LISTEN은 정답 선율을 재생하고 무채점. PRACTICE는 낮은 정답 선율을 선택할 수 있고 도움 기록. PLAY는 반주·맥박·사용자의 유효 음만 재생하며 무입력에 정답 선율은 없다. 마지막 쉼이 끝나기 전이나 마지막 release/grace가 닫히기 전에 결과를 저장하지 않는다.

### C04. 판정창과 결정성

onset 기본 경계 45/90/140ms와 계수 1/.75/.40/0. release는 60/110/160ms와 같은 계수. 경계 포함은 안쪽 등급이다. 정수 microsecond의 크기 `Math.round(Math.abs(correctedErrorMs)*1000)`를 한 번 구해 비교하고 빠름/늦음 부호는 별도로 보존한다. 양수 창 임계값은 `Math.round(ms*1000)`이다. D19는 원문 반올림의 반μs 부호 충돌을 명시적으로 해결한다.

이웃 실제 onset 최소 간격 d에 `Won=min(140,0.45*d)`, 내부 경계는 45:90:140 비율. hold 길이 h에 `Wrel=min(160,0.45*h)`, 내부 경계는 60:110:160 비율. 반복 경계도 포함하고 tie boundary는 onset이 아니다. 넓은 판정은 1.35배를 먼저 요청한 뒤 같은 cap: `min(140*1.35,0.45*d)`, `min(160*1.35,0.45*h)`. 75% 속도는 tick↔초만 바꾸며 기본 ms 창을 임의로 확대하지 않는다.

한 down은 PENDING 후보 하나만 소비한다. 절대 오차가 작고, 같으면 더 이른 onset, 다시 같으면 안정 ID 순. 같은 timestamp는 수신 sequence 순, 특히 up→down을 뒤집지 않는다. 100회 replay 결과가 정확히 같아야 한다.

### C05. hold·tap·쉼·점수

hold는 onset+release, tap은 onset만이다. 타이는 하나의 hold. `N=tapCount+2*holdCount`; 모티프 N은 L01~L09 순으로 4,3,4,4,5,6,6,4,4이며 PLAY 4회는 4배다. `score=round(100*clamp((earned-.25*min(extra,N))/N,0,1))`. N=0 PLAY는 오류다. 쉼은 분모나 무료점수에 넣지 않는다.

ACTIVE hold의 이른 up은 BROKEN, onset 점수 유지/release 0, 재타격으로 복구 불가. onset miss면 release도 0. overhold는 release 0이며 다음 음 자동 성공 없음. 추가 down의 .25 감점은 최대 N회까지만. 조기 release와 정상 매칭 onset을 extra로 다시 감점하지 않는다.

restCleanCount/restCount, tieContinuousCount/tieCount, releaseInWindowCount/holdCount, onsetMedianAbsError, meterConceptCorrect는 점수와 분리한다. 다음 onset early 창에 정상 매칭된 down, 앞 hold의 정상 release 창 안 up은 쉼 오염이 아니다. 그 밖의 새 down 또는 허용창 넘긴 hold는 해당 쉼 dirty 1회. 경계 허용창들로 전체가 덮인 쉼은 표본 제외. tap의 늦은 up은 길이 채점 대상이 아니지만 새 down을 막는 물리 owner는 유지한다. tap hold 상태를 음향 지속이나 hold 숙달로 오해하지 않는다.

### C06. 세 가지 시계와 보정

AudioContext는 음악 master, performance/DOM timestamp는 입력 시계, tick은 음악 좌표다. 출력 timestamp 유효 시 `audible=output.contextTime+(eventPerf-output.performanceTime)/1000`; `errorMs=1000*(audible-target)-inputOffsetMs`. +80ms 보정은 raw+80에서 빼서 0. baseLatency/outputLatency를 이 경로에서 또 빼지 않는다.

출력 쌍이 미지원·0·불연속이면 D09 fallback과 그 방식 표시. Date.now를 master로 쓰지 않는다. epoch 기반 DOM timestamp는 timeOrigin으로 변환하며 정상화 뒤 현재 performance와 5초 초과 차이면 기술 중단. visualOffsetMs는 그림만 이동하며 채점 불변.

보정은 4박 예고 후 16클릭, 측정 첫 4개 제외, 나머지 12개 오차 중앙값. MAD>45ms 불안정, 자동 적용 ±250ms 범위, 사용자 확인 뒤 저장. 이 팩의 초기 보정 템포 제안 80 BPM·클릭당 하나 ±300ms 매칭은 D 기록에 남긴다. 제외 후 12개가 빠짐없이 모이지 않으면 자동 추정 적용을 하지 않고 다시하기/그대로 연습. 사람 반응 편향이 섞인 값이며 장치 물리 지연 측정이라고 부르지 않는다.

### C07. 오디오 예약·gate

scheduler 25ms, lookahead 150ms. 예약 지평은 ctx.currentTime, 화면/입력은 audible mapping. rAF·애니메이션 완료·충돌 좌표가 다음 음 시점을 만들지 않는다. 절대 tick에서 음 시각을 계산하고 100ms 초과 gap 때문에 필요한 음이 미예약이면 catch-up 폭음을 내지 않고 phrase 무효화.

타이는 첫 onset에서만 attack 5ms, 마지막 끝에서 release 8ms, 중간 경계는 envelope/클릭/빛 펄스/점수 이벤트 없음. 사용자 hold는 owner up에서 끝나며 너무 이른 up을 정답 길이로 자동 보완하지 않는다. targetEnd+Wrel에서 강제 음 종료, grace는 점수만 기다림. tap은 실제 down부터 전체 길이를 다시 세지 않고 원래 targetEnd까지 남은 길이만. 이때 release ramp도 targetEnd 안에 끝낸다. 처리 때 targetEnd가 이미 지났으면 pitched sound 생략, 원 timestamp 채점, 진단 로그.

사용자 음 start는 현재 ctx 시간+최대 3ms 안전 여유. 과거에 소급 예약하지 않는다. 정상 early onset에 반응하는 음은 앞 쉼의 마지막 허용창에 일부 걸칠 수 있으며 이 예외를 중복 벌점하지 않는다. hold 끝의 정상 release 허용창은 실제 사용자 소리가 악보 끝을 넘을 수 있는 교육적 피드백이다. 시연/정답 gate는 정규 데이터 끝을 따른다. 긴 잔향으로 끊김을 가리지 않는다.

### C08. 전달 지연과 중단

dispatchGrace=100ms는 음악 허용창이 아니라 최종 확정 대기다. 목표+lateWindow+100까지 receipt를 기다리되 동일 JS turn 입력을 advance보다 먼저 처리한다. receipt−정상화 event timestamp>200ms는 기술적 중단. 그 이하라도 timeout으로 FINAL된 항목에 아직 처리되지 않은 정상 timestamp가 오면 영향을 받은 phrase를 rollback하고 재시작한다. 이미 성공한 음에 대한 실제 새 재타격은 EXTRA_DOWN이며 rollback 대상이 아니다. 중복 전송은 dedupe한다.

pause, hidden, blur, pagehide, pointercancel, 비정상 lostcapture, 예기치 않은 non-running audio, 오디오 경로 변경, WebGL loss, 방향 회전은 INTERRUPT. 현재 미확정 phrase를 무효화하고 확정된 이전 phrase만 보존. master gain 8ms fade, 미래/현재 node stop·disconnect, owner와 큐 clear, 새 sessionId·epoch. 사용자 이어하기+AudioContext running+물리 rearm 뒤 해당 phrase 앞 한 마디 카운트인. hold 중간 tick 복원 금지.

기본 기대 항목의 시간과 timeout 사유를 결과 확정 뒤에도 해당 시도의 late-edge 확인이 끝날 때까지 보존한다. 실제 이벤트 전달이 무한정 올 수 있다고 영구 대기하지는 않되, timestamp가 정확히 해당 유효 시도를 가리키는 지연이 확인되면 원장의 결과·best 근거를 철회한다. 임의 가산으로 고치지 않는다. 저장/입력 보존 정책과 폐기 조건을 명시한다.

### C09. 입력·접근성·저장

Space 기본, F/J/Enter 재지정 가능, event.code 사용. Pointer Events 한 경로, click 중복 채점 금지. 한 physical owner만, 추가 손가락 무시, repeat 무시. 액션 영역만 touch-action:none. capture가 유지되면 버튼 밖 이동도 hold 유지, 정상 up 뒤 lostcapture는 중복 중단 금지. 메뉴·퀴즈·설정 입력을 연주에 전파하지 않는다.

DOM 메뉴·설명·결과, 기본 16px·설명 18px·line-height 1.5, 주 버튼 72px 이상·보조 44×44, 200% 확대. 고대비는 색 외 모양, reduced-motion은 이동/입자 축소이며 음악은 동일. toggleHold·넓은 판정·75% 연습은 assisted 근거를 남기고 표준 hold 숙달과 분리. 화면 도움을 쓰는 것이 실패라는 문구 금지. 시각/비시간제 문제를 청각 능력 검증이라고 주장하지 않는다.

저장 key `night-thread.progress.v1`. 다른 앱의 key는 건드리지 않는다. 유효 시도 원장과 bestScoreEvidence를 보존, contentVersion 변경 시 legacy 분리. parse/quota 실패에도 게임·결과 사용 가능. 파손 문자열은 가능하면 로컬 backup 후 기본값. 로그는 개발 메모리 ring buffer 최대 5분, 사용자 요청 없는 외부 전송 없음.

## 3. 마스터 프롬프트: 첫 메시지에 붙여 넣기

```text
당신은 Astra Ultra 설정으로 작업하는 시니어 모바일 웹 게임 엔지니어이자 음악 교육 QA 담당자다. 실제 실행 모델·설정은 도구에서 확인하고, 이 문구만으로 모델이 바뀌었다고 주장하지 마라.

첨부한 ‘밤실 공방’ 기준 설계와 모바일 프롬프트팩을 전부 읽고 독립된 TypeScript 게임을 단계적으로 구현하라. 한 번에 전체 앱을 만든다고 가정하지 않는다. 이번에 지정한 P단계만 수행하고 그 단계의 작동 증거와 남은 문제를 보고하라. 사용자 지정 환경·AGENTS.md·기존 변경을 먼저 확인한다. 다른 게임의 입력·점수·저장·커리큘럼을 복사하지 않는다.

고정 계약:
1. PPQ 480, quarterBpm, 정수 tick. NotationEvent가 악보·음·입력·장면·정답의 단일 원천이다.
2. L01~L09와 4장면. L02 타이는 0~960 hold 하나, L03 타이는 1440~2880 hold 하나. 타이 내부 재 attack은 없다.
3. tap onset만, hold onset+release. onset 45/90/140ms, release 60/110/160ms, 계수 1/.75/.40/0. 이웃 cap 0.45, 보조 1.35배 뒤 다시 cap. 정수 microsecond 비교.
4. 점수 N=tap+2hold, 쉼은 별도 숙달. 자동 시연과 보조 기록은 표준 연주와 분리한다.
5. AudioContext master. scheduler 25ms/lookahead 150ms, dispatchGrace 100ms, receipt 지연 200ms 초과 또는 정상 늦은 edge와 timeout 확정 충돌은 시스템 중단이다.
6. 한 physical owner, repeat/중복 click/다중 포인터 방지. pause/cancel/hidden/오디오 중단은 miss가 아니라 phrase rollback과 새 카운트인이다.
7. L06/L07은 같은 여섯 8분음표·같은 quarterBpm 90, 묶음 2+2+2와 3+3. 표시 템포는 4분=90과 점4분=60. L08/L09는 같은 패턴72/108.
8. 모바일 런타임 에셋 92개를 manifest대로 사용. 17 WebP+75 SVG, PNG 17개는 선택 폴백. 마스터 좌표를 축소 파생본에 넣지 않는다. 정지 포즈를 완성 rig로 주장하지 않는다.
9. pending/false 교육 검수를 자동 승인하지 않는다. 개발 프리뷰와 공개 교육 출고를 나눈다. 코드 테스트가 교육자·청음·물리기기 검수를 대신하지 않는다.
10. localStorage만. 계정·서버·학생 정보·마이크·광고·결제·분석 SDK·외부 배포를 추가하지 않는다.

일하는 방법:
- 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md를 읽거나 만든다. 원문과 다른 세부 결정은 D 항목으로 근거를 남긴다.
- 실패 fixture와 expected 값을 먼저 만든 뒤 가장 작은 기능을 구현한다. 테스트를 느슨하게 하거나 고정 score 100으로 통과시키지 않는다.
- 설치 버전은 공식 문서와 현재 환경을 확인하고 lockfile로 고정한다. 기존 저장소의 패키지 매니저를 유지한다.
- 하나의 clock, compiler, judge, reducer를 유지한다. SceneAdapter는 그리기만 하고 판정하지 않는다.
- 사용자 화면은 실제 play canvas + DOM 입력·메뉴·결과다. 퀴즈/카드만으로 게임을 완성했다고 보고하지 않는다.
- 숫자·표기·정확한 도형은 데이터·SVG로, 생성 원화는 장식으로 사용한다.
- 회귀검사, 타입검사, 빌드, 필요한 화면 캡처를 수행한다. 실행 불가 검사는 not run과 구체적 blocker를 남긴다.
- 모든 단계 종료 시 변경 파일, 실행 명령·실제 결과, 인수 기준별 passed/failed/not run, 다음 한 단계, 사람에게 필요한 결정을 짧게 보고한다.
- 문서상 목표 수치를 실제 측정 결과처럼 쓰지 않는다. 승인 없는 업로드·공개 배포는 하지 않는다.

이번에 실행할 단계는 이어서 주어지는 P번호다. 먼저 그 단계의 입력 자료와 선행 산출물이 실제로 있는지 확인하고 시작하라.
```

### 3.1 매 단계 공통 완료 기준

- 기존 사용자 변경 보존, 지정된 단계 범위 준수, 깨진 테스트 0건 또는 명확한 blocker로 중단
- 소스와 검증 fixture가 같은 값을 쓰되 기대값을 구현 결과에서 그대로 복사하지 않음
- `docs/implementation-state.md`에 마지막 완료 P번호·현재 blocker·실행 방법·검수 상태 갱신
- passed에는 명령/로그/스크린샷/기기 정보 등 실제 증거 연결. mock·fake-clock·자동화·물리 측정 범주 구별
- 미승인 자산·교육 검수·실기기·배포를 ‘완료’로 승격하지 않음

## 4. 단계별 실행 지도

| 단계 | 구체적 결과 | 선행 |
|---|---|---|
| P00 | 기준 파일·작업 환경·결정 잠금 | 마스터 프롬프트, 기준 설계, 모바일 ZIP, 사용자 지정 저장소 |
| P01 | 타입·테스트·모바일 DOM 골격 | P00 계약/환경 확인 완료 |
| P02 | 정규 레벨 9개와 구조·음악 검증기 | P01 테스트 골격 |
| P03 | 타이 합침·반복·시간축 컴파일러 | P02 정상/오류 데이터 검사 |
| P04 | 순수 판정창·점수·쉼 숙달 | P03 컴파일 오라클 |
| P05 | 입력 owner·timestamp·중복 방어 | P04 순수 judge |
| P06 | 오디오 master clock·예약·합성음 | P03/P05 계약 |
| P07 | 지연 보정 화면과 프로필 | P06 실제 오디오 시작 가능 |
| P08 | 세션 reducer·phrase 거래·전달 지연 | P04~P07 |
| P09 | pause·cancel·회전·오디오 중단 복구 | P08 거래 원장 |
| P10 | L02 실빛다리 최소 플레이 완성 | P03~P09 핵심 검사 통과 |
| P11 | L01 음가·L03 마디선 연결 | P10 L02 실제 플레이 |
| P12 | L04 점음표 온실과 정확한 2:1 | P11, 온실 자산 manifest 확인 |
| P13 | L06·L07 같은 6탭과 다른 큰박 | P11; L05보다 먼저 학습 경로 연결 |
| P14 | L05 점쉼표와 담당 성부 침묵 | P12/P13, L04와 L07 선행 설명 |
| P15 | L08·L09 우체역과 전체 꿈 지도 | P14까지 나머지 학습 연결 |
| P16 | 92개 런타임 에셋·앵커·폴백 통합 | P15 기능 완성, runtime manifest |
| P17 | 세로·가로·고DPI 화면과 시각 언어 | P16 실자산 통합 |
| P18 | 고대비·움직임 축소·toggleHold 접근성 | P17 반응형 화면 |
| P19 | 진행 저장·철회 가능한 최고점·복구 | P18 모드 구분 |
| P20 | 교육 도식·기보·출고 승인 경로 | P19까지 기능 연결, 교육 manifest pending |
| P21 | 오디오 믹스·질감·상태 애니메이션 다듬기 | P20 음악 의미 검증 경로 |
| P22 | 성능·네트워크·메모리 예산 검증 | P21 실자산/음향 |
| P23 | 전체 자동화·경계·회귀 검수 | P22 기능/성능 수정 반영 |
| P24 | 실기기·교육자·초보자 최종 관문 | P23 자동화 통과, 실제 검사 가능한 사람/기기 |
| P25 | 인수용 빌드·README·재현 가능한 인계 | P24 결과 또는 명시적 미검증 제한 |
| P26 | V2 당김음·2:1 스윙 조건부 설계 | 사용자의 별도 V2 승인과 교정·교육 검수 계획 |
| P27 | 공개 배포 요청 시 확인할 마지막 경계 | 사용자가 명시적으로 배포를 요청한 경우만 |

## P00. 기준 파일·작업 환경·결정 잠금

선행: 마스터 프롬프트, 기준 설계, 모바일 ZIP, 사용자 지정 저장소  
필수 산출물: docs/contracts.md, docs/decisions.md, docs/implementation-state.md, source-provenance.json, 단계별 실행 계획

```text
이번 작업은 P00: 기준 파일·작업 환경·결정 잠금이다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
코드를 쓰기 전에 작업 환경의 AGENTS.md, Git 상태, 패키지 매니저, 기존 실행 명령을 읽어라. 기존 변경과 새 작업을 분리하고 무관한 파일을 덮지 마라. 지정 환경에 필요한 자료가 없으면 정확히 어떤 파일이 필요한지 보고하라. 임의로 다른 컴퓨터·저장소로 옮기지 않는다.
기준 설계와 이 팩을 끝까지 읽고 네 장면·9레벨·권장 순서·음가·타이·쉼·템포·채점·중단·저장 계약을 docs/contracts.md에 정리하라. 입력만 누르는 다른 게임의 규칙과 섞지 않는다. D01~D20을 하나씩 검토해 채택/질문/대안과 테스트를 기록하라.
원 설계, 레벨 JSON, manifest, ZIP 해시를 확인하고 source-provenance.json에 남겨라. ZIP 내부 경로를 먼저 확인한 후 프로젝트 assets/night-thread/ 아래 한 루트로 복사한다. 기존 파일을 삭제하지 않는다. 원본 미술 팩은 바꾸지 않는다.
교육 도식 pending, 청음 pending, 실기기 not run, 실제 구현 not started를 별도 상태로 기록한다. 후속 단계가 이 상태를 임의로 승격하지 못하게 하라. 필요한 공식 문서는 설치/사용 시 직접 확인할 목록으로 남긴다.

검증과 인수:
해시가 기대와 다르면 이유를 확인하기 전 조용히 계속하지 않는다. root package가 없는 새 저장소와 이미 게임이 있는 저장소 각각의 시작 계획을 제시한다. 정지 키포즈 9개가 rig라고 기록되지 않아야 한다. L02 후속 E5, L05 권장 순서, scene enum 4개를 정확히 설명한다.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P 번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P01. 타입·테스트·모바일 DOM 골격

선행: P00 계약/환경 확인 완료  
필수 산출물: 프로젝트 골격, 실행 가능한 package scripts, DOM 셸, CI/로컬 테스트 안내, 최소 screenshot

```text
이번 작업은 P01: 타입·테스트·모바일 DOM 골격이다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
현재 공식 문서와 실행 환경에 맞는 TypeScript strict, Vite, PixiJS8, Vitest, Playwright, Draft2020-12 JSON Schema 검증기를 선택하라. 최신이라는 이유만으로 무조건 버전을 올리지 말고 Node 요구 조건과 기존 lockfile을 확인한다. 기존 패키지 매니저를 유지한다.
음악/판정 순수 모듈, audio/input 어댑터, scenes, DOM UI, storage, content, tests를 분리하라. 음악 코어가 Pixi나 브라우저 전역을 import하지 않도록 경계를 만든다. 임시 any나 ts-ignore로 타입 검사를 통과시키지 않는다.
BOOT→AUDIO_UNLOCK→MAP까지 DOM 골격과 접근 가능한 시작 버튼을 만든다. 실제 오디오 작업은 뒤 단계지만 unlock 실패/로딩/오류 상태를 받을 구조는 둔다. 모바일 viewport-fit=cover, safe-area, 반응형 뷰포트와 키보드 focus 스타일을 준비한다.
명령은 typecheck, test:unit, test:integration, test:e2e, validate:content, build, preview처럼 역할을 분리한다. 아직 구현 전인 검사를 빈 성공으로 위장하지 말고 pending 표에 남긴다. 테스트 러너 자체가 실패 fixture를 실제 실패로 잡는지 한 번 확인한다.

검증과 인수:
빈 셸은 320×568과 844×390에서 수평 스크롤이 없다. 키보드만으로 시작/설정/뒤로가기에 접근한다. typecheck·build가 실제 실행된다. 테스트 러너의 의도적 실패를 복구한 뒤 green인지 확인한다. 브라우저 실행이 막히면 설치 완료와 실행 완료를 구분한다.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P 번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P02. 정규 레벨 9개와 구조·음악 검증기

선행: P01 테스트 골격  
필수 산출물: level.schema.json, L01~L09.json, campaign.json, validateLevel, negative fixtures와 오류 코드 문서

```text
이번 작업은 P02: 정규 레벨 9개와 구조·음악 검증기다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
부록 A의 스키마와 9개 레벨을 원문 그대로 저장하라. additionalProperties:false를 유지하고 Ajv2020 등 선택한 검증기의 Draft2020-12 모드를 확인한다. 스키마 $ID의 example.invalid는 식별자일 뿐 fetch 대상이 아니다.
semantic validator는 원본 순서의 at=누적 tick, 마디 끝=barTicks, denominator/dots 유리수 길이, ID 중복, 음고/MIDI 대응, rest 필드 금지, tieGroup 동음·연속·hold·최소 2음을 검사한다. 각 오류에는 파일·JSON 경로·코드·관측값·기대값을 담는다. 임의 정렬, tick 반올림, 쉼 자동 보완은 하지 않는다.
L06/L07 bars가 완전히 같고 grouping과 표시 단위만 다름을 검사한다. L08/L09 bars도 동일하고 quarterBpm 72/108을 확인한다. scene과 levelId의 매핑, 권장 순서와 선행 추천을 별도 campaign 파일로 둔다. 원 스키마에 새로운 런타임 필드를 끼워 넣지 않는다.
부록 E의 negative mutation fixture를 적용하는 작은 harness를 작성해 정상 데이터와 실패 데이터를 모두 테스트하라. 오류 스키마는 reviewState를 approved로 바꾼 경우도 거부해야 한다. 최종 승인 근거는 별도 콘텐츠 승인 manifest에서 관리한다.

검증과 인수:
정상 9개 pass. 4/4 합 1680, at overlap/gap, 점4분 480, C5/MIDI74, C5→D5 타이, 중간 rest 타이, rest.tieGroup, 단일음 타이, tap 타이, 잘못된 6/8 묶음, 중복 ID, 알 수 없는 필드를 모두 reject. validator가 JSON을 변형하지 않았음을 deep equality로 확인한다.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P 번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P03. 타이 합침·반복·시간축 컴파일러

선행: P02 정상/오류 데이터 검사  
필수 산출물: compileLevel, CompiledTimeline 타입, phase/phrase 확장기, 9개 golden compiler snapshots, fake ClockPort

```text
이번 작업은 P03: 타이 합침·반복·시간축 컴파일러다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
NotationEvent를 절대 tick으로 펼치고 SoundGate, InputExpectation, RestExpectation, MusicalEvent, BeatCue로 컴파일하라. 악보 원형과 sourceNotationIds를 보존하며 tieGroup만 하나의 gate와 hold 기대 항목으로 합친다. tied gate의 내부 tick은 TIE_BOUNDARY 표시 목록에만 남긴다.
phase마다 카운트인 원점과 모티프 원점을 분리한다. COUNT_IN의 1마디, LISTEN의 2회+tail 1마디, PRACTICE 2회, PLAY 4회, OUTRO 1마디를 데이터로 계산하라. PLAY의 판정 종료 대기는 음악 마디와 별도다. 반복마다 occurrenceId를 새로 만들고 tieGroup을 반복 경계 밖으로 합치지 않는다.
각 phrase는 모티프 한 번이다. L03·L05는 2마디 전체. 점수 N을 반복 전에 확인하고 모든 PLAY 기대 항목의 이웃 onset을 확장된 시간축에서 계산한다. 카운트인·시연·타이 경계를 판정 이웃에 넣지 않는다.
ClockPort를 주입해 tick→초를 순수 함수로 검증하라. 75%는 effectiveQuarterBpm=quarterBpm*0.75이고 표기는 원곡/연습 속도를 함께 보여줄 준비를 한다. 모티프 시간·gate·큰박·sourceId를 내보내는 debug JSON을 만든다.

검증과 인수:
L02=(hold 0~960, tap 1440~1680), N3; L03=(hold 1440~2880, hold 3360~3840), N4. L05 tap 720/960/1200+hold 1440~2160, N5. L06/07 큰박 [0,480,960]/[0,720], 같은 8분 333.333…ms. L08/09 모티프 10/3초·20/9초. L01 반복 1920에서 up/down은 별개 기대 항목이다.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P 번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P04. 순수 판정창·점수·쉼 숙달

선행: P03 컴파일 오라클  
필수 산출물: JudgeEngine, windows, score, mastery, 결정적 replay harness, 단위 테스트

```text
이번 작업은 P04: 순수 판정창·점수·쉼 숙달이다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
UI와 AudioContext 없이 실행되는 JudgeEngine을 만든다. ingest(edge)와 advanceTo(audioTime)를 분리하고 보정 후 정수 microsecond로 판정한다. 부록 C/D 경계값을 먼저 test.each로 구현한다. target 시각은 움직이지 않는다.
onset 45/90/140, release 60/110/160, 계수 1/.75/.40/0, 이웃 cap 0.45, 보조 1.35배 후 cap을 구현한다. 한 down은 가장 가까운 PENDING onset 하나. 상대 오차 동률은 시간→ID, 같은 timestamp은 sequence를 보존한다. tie boundary는 후보가 아니다.
N=tap+2hold, earned와 extra 원장을 phrase별로 보존한다. 조기 release/BROKEN, onset miss 뒤 up, overhold, 실제 재타격, 추가 포인터, repeat를 분리한다. hold 시작이 늦어도 release 목표는 원래 끝이다. release 실패를 extra로 중복 벌점하지 않는다.
rest는 저작 이벤트별 표본과 화면용 합친 span을 분리한다. 정상 early 재진입·정상 release 창은 dirty가 아니다. 평가 가능 구간이 없는 rest는 excluded, 분모 0 숙달은 null. onset/tie/release/rest/quiz/assist 모드별 지표를 분리한다. tap up 길이로 duration 숙달을 만들지 않는다.

검증과 인수:
45.000ms=1, 45.001=.75; 90=.75, 90.001=.40; 140=.40, 140.001=0. 200ms 이웃 W90, 임계 μs 28929/57857/90000. N4 earned 3.5 extra 1=81점. L02 완벽 1회 100, 무입력 0. 같은 로그 100회 동일. 부록 D의 early rest·BROKEN·overhold가 정확하다.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P 번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P05. 입력 owner·timestamp·중복 방어

선행: P04 순수 judge  
필수 산출물: ActionInput, InputOwner, normalizeTimestamp, 입력 어댑터 테스트, 개발 입력 추적기

```text
이번 작업은 P05: 입력 owner·timestamp·중복 방어다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
ActionInput과 InputOwner를 구현하라. Space/F/J/Enter는 event.code, repeat=true는 버림. PointerEvents 한 경로만 채점하고 click/mousedown/touchstart를 별도 연결하지 않는다. 실제 물리 down/up을 입력 로그로 변환한다.
첫 down이 physical owner를 획득하고 matching up만 해제한다. 두 번째 포인터나 비소유 키 up은 기존 hold를 놓지 않는다. capture 유지 중 버튼 밖 이동은 hold 유지. 정상 up 뒤 lostcapture는 무시하고 활성 소유 중 비정상 상실은 cancel로 분류한다. owner는 tap gate 자동 종료 뒤에도 실제 up까지 남는다.
normalizeDOMTimestamp는 performance 기원과 epoch 기원을 구분한다. 이벤트 발생 시각·receipt 시각·source·ownerToken·sequence·sessionId·calibrationRevision을 보존한다. 콜백 수신순으로 과거 입력에 현재 sessionId를 무조건 붙이지 않고 transport 시각 구간으로 해당 epoch를 찾는다.
메뉴·다이얼로그·퀴즈 입력은 게임 영역과 분리한다. input/textarea/contenteditable에서 게임 단축키를 가로채지 않는다. touch-action:none은 액션 패드만, 페이지 전체 확대와 스크롤은 유지한다. 전역 debounce로 빠른 정상 연주를 삭제하지 않는다.

검증과 인수:
owner hold+두 번째 손가락 down/up에도 음 유지. key repeat 20회 extra 0. 동일 timestamp up→down의 순서 유지. 정상 capture 해제는 interrupt 0회. epoch timestamp 변환과 5초 초과 오류 검출. 메뉴 Enter가 설정된 ActionEnter로 중복 채점되지 않음.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P 번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P06. 오디오 master clock·예약·합성음

선행: P03/P05 계약  
필수 산출물: AudioEngine/Clock/Scheduler/Mixer/VoicePool, 합성음 데모, 예약 로그 테스트, unlock UI

```text
이번 작업은 P06: 오디오 master clock·예약·합성음이다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
AudioClock과 LookaheadScheduler를 구현하라. 사용자 제스처 안에서 AudioContext 생성/resume, 실제 running 확인 후만 재생 상태로 간다. resume 실패를 무음 PLAY로 우회하지 않는다. source는 매 start 새 노드다.
25ms 스케줄러가 ctx.currentTime+150ms까지 예약하고 원점+tick 변환으로 절대 시각을 고정한다. audibleAt은 출력 timestamp 매핑, 예약 시계는 currentTime으로 분리한다. 유효성 검사·fallback·calibration 적용식을 테스트한다. renderer는 오디오 시계 구독자다.
C5/D5/E5/G5 sine+약한 triangle, wood click, soft chime, 낮은 drone을 직접 합성한다. guide/player/metronome/BGM/SFX bus를 분리하고 최대 voice 8 초기 예산을 관리한다. 사용자 음은 유효 입력 후 현재+최대 3ms, 과거 start 금지. 판정 시각과 실제 발음 시각을 각각 기록한다.
타이 한 attack, 사용자 hold 실제 up 종료, overhold 음 종료와 점수 grace 분리, tap 고정 targetEnd를 구현한다. output timestamp 경로에 latency를 이중 차감하지 않는다. 100ms 초과 scheduler gap이 실제 미예약음을 발생시킨 경우 catch-up 없이 INTERRUPT한다. AudioContext 인터럽트 분류는 실제 브라우저 이벤트로 검증한다.

검증과 인수:
L02 타이 attack 1/release 1, 중간 tick 480 추가 node 0. PLAY 무입력 lead 0. tap 늦게 down해도 쉼 시작을 넘겨 duration 연장 0. targetEnd 지났으면 소리 생략. fps 15/30/60에서 target timestamp 불변. 25/150 값은 설정으로 고정하고 한 음씩 누적 드리프트 없음.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P 번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P07. 지연 보정 화면과 프로필

선행: P06 실제 오디오 시작 가능  
필수 산출물: CalibrationController, DOM 보정 UI, confirm된 최소 프로필, median/MAD/매칭 테스트

```text
이번 작업은 P07: 지연 보정 화면과 프로필이다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
보정은 선택 사항이다. 처음 소리를 켜면 낮은 볼륨으로 시작하고 내장 스피커·유선·Bluetooth에 잔여 지연이 있을 수 있음을 짧게 설명하라. 정밀 물리 지연 측정이라고 쓰지 않는다.
4박 예고+16 고정 클릭을 만들고 측정 첫 4개 제외 후 12개 오차의 median/MAD를 구하라. 초기 템포 80BPM 제안을 D 기록에 남기고 클릭당 한 입력 ±300ms 매칭, 중복과 누락을 표시한다. 유효 12개를 못 얻으면 자동 적용하지 않는다. |offset|≤250ms, MAD≤45ms일 때도 사용자 확인 후 저장한다.
원오차·보정 후 오차를 단순한 미리보기로 보여 부호를 확인시킨다. inputOffset와 visualOffset을 분리하고 그림 조절이 점수에 영향 없게 한다. 불안정하면 다시 하기/보정 없이 연습 선택을 제공한다. 연주 중 사용자 실력을 보고 자동 보정하지 않는다.
기기 지문을 수집하지 말고 입력 source와 사용자가 선택한 출력 종류·mapping method·revision을 기록하는 최소 프로필을 제안하라. 브라우저가 경로 변경을 항상 알려주지 않으므로 Bluetooth 전환 후 수동 재보정 버튼도 둔다. 프로필 변경은 현재 시도 중단 후 다음 시도부터 적용한다.

검증과 인수:
raw+80/offset+80→0, raw-80/offset-80→0. [60,70,75,78,80,80,80,82,84,85,90,100]median 80/MAD 4.5. MAD 45는 허용, 45 초과 불안정. visualOffset 변경 score 동일. 과거 점수 소급 변경 0. 거절/건너뛰기도 게임 진행 가능.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P 번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P08. 세션 reducer·phrase 거래·전달 지연

선행: P04~P07  
필수 산출물: sessionReducer, attempt/epoch/phrase 원장, 지연 충돌 테스트, phase 전환표

```text
이번 작업은 P08: 세션 reducer·phrase 거래·전달 지연이다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
원 설계 상태 기계를 reducer 하나로 구현하라. LISTEN 내 motif/tail 구간을 분리하고 tail 1마디 뒤 사용자 선택을 기다린다. phase 간 자동 카운트다운으로 읽기를 제한하지 않는다. Scene은 상태를 직접 변경하지 않는다.
attemptId는 전체 시도, sessionId/epoch는 새 재생 세대, phraseId는 모티프 반복으로 구분하는 D06 세부를 문서화하라. JudgeEvent에도 sessionId/phraseId를 넣어 오래된 이벤트를 막는다. 이전 확정 phrase를 새 세션에 복사할 때 근거 ID를 보존하고 임시 분자·분모·extra·숙달·입력 로그를 원자적으로 철회한다.
advance보다 같은 turn의 ingest를 먼저 처리하고 최종 miss/release 확정은 target+lateWindow+100ms. receipt 지연>200ms는 중단. timeout FINAL 후 정상 timestamp가 도착하면 해당 phrase와 후속 의존 구간 rollback, 이미 성공한 음에 실제 재타격은 EXTRA_DOWN. dedupe는 실제 재타격을 삭제하지 않는다.
phase 종료는 모티프/마지막 쉼 끝, 모든 기대 항목 최종 창+grace, 남은 audio fade가 끝난 뒤다. OUTRO 1마디 후 결과 저장 후보를 만든다. 최신화가 불가능한 늦은 입력은 miss로 보존하지 말고 정확한 기술 원인을 보여준다.

검증과 인수:
target 10000ms, onset error+130ms, receipt 10250ms: delay 120ms이나 deadline 10240 후이므로 기술 rollback. receipt 10220이면 정상. 성공 음의 실제 재타격은 extra. PLAY 4회 N 확정, 2마디 모티프 반쪽 commit 금지. 결과 완료 이벤트 2회 저장 1회.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P 번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P09. pause·cancel·회전·오디오 중단 복구

선행: P08 거래 원장  
필수 산출물: InterruptionController, pause/error DOM, 복구 시나리오 통합 테스트, listener/node 진단

```text
이번 작업은 P09: pause·cancel·회전·오디오 중단 복구다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
중단 관리자를 만들고 pause, blur, hidden, pagehide, pointercancel, 비정상 lostcapture, non-running audio, 오디오 경로 변경, WebGL context loss, 방향 전환을 한 INTERRUPT 경로로 모아라. 한 원인에서 이벤트가 여러 개 와도 중단은 멱등이어야 한다.
현재 미확정 phrase와 영향받은 이전 미확정 phrase를 rollback하고 확정 이전 phrase만 보존한다. 미래 예약 포함 node를 세션별로 관리하고 master gain 8ms fade 후 stop/disconnect. owner, 논리 toggle hold, 입력 큐, scene 효과, 대기 callback 세대를 clear한다.
복귀는 자동 PLAY가 아니다. 사용자 이어 하기 제스처에서 AudioContext running을 확인한 뒤 새 epoch와 원점으로 해당 phrase 앞 1마디 카운트인. hold 중간 이어받기 금지. 물리 키/손가락이 남아 있으면 손을 떼고 시작을 표시하고 up 후 rearm한다.
화면 방향 회전은 원문대로 pause. 주소창 작은 높이 변화 같은 일반 resize는 LayoutTransform을 안전하게 갱신하되 표적/패드 주요 위치가 바뀌면 중단하는 기준을 D 기록에 명시한다. contextrestored에서는 필수 자산을 재로드하고 준비 후 재개 버튼을 보여준다.

검증과 인수:
L03 타이 중 hidden 후 재개는 1440 타이 시작을 포함한 2마디 phrase 처음. pause/retry 20회 listener/node 증가 없음. 정상 up→lostcapture는 추가 중단 없음. 취소가 release 0이나 미스로 저장되지 않음. 오래된 sessionJudgeEvent는 신규 scene/점수 불변.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P 번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P10. L02 실빛다리 최소 플레이 완성

선행: P03~P09 핵심 검사 통과  
필수 산출물: 작동하는 L02 vertical slice, 플레이 경로 E2E, 화면 증거, 첫 인수 보고

```text
이번 작업은 P10: L02 실빛다리 최소 플레이 완성이다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
이번 단계는 L02 하나를 회색 도형과 합성음으로 끝까지 작동시킨다. 실빛다리의 닫힌 원 도착에 누르기, 중간 매듭은 유지, 빈 원 도착에 놓기, 뒤 E5 tap과 쉼을 구현한다. 지도→수업→듣기→연습→연주→결과→다시 하기를 실제로 완성하라.
SceneAdapter는 CompiledTimeline과 JudgeEvent를 받아 그린다. 원의 충돌/애니메이션 끝으로 판정하지 않는다. 시작 2q 전부터 접근 예고, 0.25q 전 솜새 prepare를 보여줄 준비를 한다. hold 끝 빈 원은 시작부터 보여 갑작스런 release 신호를 막는다. tie boundary는 새 반짝임·클릭·점수 없음.
모바일 320폭에서도 표적이 중앙 ±20%에 있고 입력 패드 최소 72px 높이다. HUD에 큰 콤보·악보·실시간 점수 모두 넣지 않는다. 결과는 붙임줄의 한 시작/한 끝, 2분 동등 길이를 먼저 설명하고 오개념은 한 문장만 선택한다.
완벽 자동 로그와 실제 손 입력을 구분하라. fake input으로 100점이 된 것은 엔진 검사이며 물리 입력 지연 검수라고 보고하지 않는다. 실제 down/up로 한 번 플레이한 스크린샷이나 녹화와 실행 방법을 남긴다.

검증과 인수:
타이 0→960 한 hold, tick 480 up→down은 BROKEN+EXTRA_DOWN이며 복구 안 됨. 시연 2회 무채점, 연습 2회, PLAY 4회 N12. PLAY 무입력 0점/lead 0. last rest 끝 전 결과 없음. 시작·놓기·중간 매듭을 색 없이 구별.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P 번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P11. L01 음가·L03 마디선 연결

선행: P10 L02 실제 플레이  
필수 산출물: L01/L03 콘텐츠 연결, 타이 전이 문항, focused practice selector와 테스트

```text
이번 작업은 P11: L01 음가·L03 마디선 연결이다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
같은 엔진과 실빛다리 adapter에 L01, L03을 추가하라. 새 판정기를 만들지 않는다. L01은 480 hold, 480 rest, 960 hold; 길이를 ribbon 칸으로 표현하고 두 끝 원 모두 예고한다. 모티프 끝 1920과 다음 반복 첫 onset 1920에서 up→down을 요구한다.
L03은 첫 2분+4분 쉼 후 1440에서 시작해 1920 마디 기둥을 지나 2880에 놓는다. 기둥은 리본 뒤 레이어이며 실을 끊지 않는다. 3360~3840 E5 hold도 유지한다. 타이 중간 새 attack/점수/설명 pulse가 없는지 debug event로 확인한다.
결과의 이 부분 연습은 실패 마디와 타이 시작 마디를 포함한 최소 구간이다. L03은 항상 필요한 두 마디를 함께 가져온다. 타이 뒤쪽만 잘라 새 onset으로 바꾸지 않는다. focused practice 2회 앞 count-in 1마디, 표준 최고점에는 반영하지 않는다.
타이 비교 문항은 C5 두 4분 타이 vs 타이 없는 두 4분을 시연하고 소리 시작이 한 번인 것을 고르게 한다. 결과의 E5 독립 tap/hold를 C5 타이 그림의 일부인 것처럼 표시하지 않는다.

검증과 인수:
L01 PLAY N16, L03 PLAY N16. L01 동일 timestamp up→down은 둘 다 정상, up 없이 down은 신규 onset 성공 안 됨. L03 기둥 1920에서 attack 0. 취약 구간 cut이 sourceNotationIds를 모두 보존. 메뉴 퀴즈 입력은 연주 extra 0.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P 번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P12. L04 점음표 온실과 정확한 2:1

선행: P11, 온실 자산 manifest 확인  
필수 산출물: CrescentGreenhouseScene L04, 점 개념 문항, 비례 geometry 검사, 기본/고급 도식 UI

```text
이번 작업은 P12: L04 점음표 온실과 정확한 2:1이다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
반달온실 adapter를 추가하고 L04의 hold 0~720, 960~1680을 구현한다. quarterBpm 80, 점4분 1125ms, 한 마디 3초다. 두 칸 480에 한 칸 240을 더하는 3칸 시간 띠로 지속을 보여준다. 꽃잎 면적·꽃잎 수로 정답 시간을 역산하지 않는다.
greenhouse_container_2u와 _1u는 같은 px-per-unit로 배치한다. 바깥 이미지 폭을 같게 맞추면 2:1이 망가진다. 액체 사각형 128×96과 64×96, 공통 unit 64를 검증하고 하나의 scale로 렌더한다. 중간 점 추가는 attack 신호가 아니다.
꽃은 closed/opening_1/opening_2/open 또는 벡터 0/1/2/3 한 계열만 사용한다. 상태 변환은 hold 시작과 진행률을 따르되 입력 판정은 변하지 않는다. 조기 release면 남은 끝 단계만 접고 다음 음의 시간을 늦추지 않는다.
기본 결과 도식은 education_dot.svg와 DOM 설명, 고급 펼치기에서만 advanced와 tick 식을 보인다. 2분에 붙은 점은 480 추가, 4분에 붙은 점은 240 추가인 전이 문항을 만든다. 점은 언제나 반박이라는 설명을 금지한다.

검증과 인수:
점4분 720/80BPM 1125ms, 모티프 N4. 동일 scale에서 액체 면적 2:1. 두 이미지 width 동일 설정 회귀 검출. 조기 release와 tap 성공만으로 dot mastery 안 됨. 기본 화면/alt text에 고급 tick 설명 숨김 계약 유지.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P 번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P13. L06·L07 같은 6탭과 다른 큰박

선행: P11; L05보다 먼저 학습 경로 연결  
필수 산출물: FoldingRoomScene, 큰박 cue, 4문항 데이터/seed/DOM, 음악·기하·분리채점 테스트

```text
이번 작업은 P13: L06·L07 같은 6탭과 다른 큰박이다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
접히는방 adapter에 L06과 L07을 추가하라. 동일 C5 여섯 8분 tap과 quarterBpm 90을 공유하되 L06은 3/4 큰박 0/480/960, group 2+2+2, 표시 4분=90; L07은 6/8 큰박 0/720, group 3+3, 표시 점4분=60이다. 숫자 90과 60만 단위 없이 비교하지 않는다.
room_floor_222/_33과 room_brackets_222/_33은 같은 6타일 폭을 유지한다. 2u/3u 경첩은 묶음만 바꾼다. 클릭 gain 초기값 0.8/0.55/0.3을 사용하되 첫 큰박·다음 큰박·작은 분할의 구조를 지킨다. 손가락 압력을 강세 정답으로 채점하지 않는다.
연습의 1&2&3&와 1라리2라리는 도움 설정으로 보인다. tap 6회만 성공했다고 박자 구별 숙달을 주지 않는다. 별도 4문항은 Q1=3/4, Q2=6/8, Q3=6/8, Q4=3/4, 각 2마디 시연 후 둘씩 세 묶음/셋씩 두 묶음 선택. 박자표는 응답 뒤 공개한다.
다음 시도 shuffle은 seed를 기록하고 정답과 단서를 함께 섞는다. 시각 묶음/청각/둘 다 도움 종류를 저장하고 순수 청각 검증처럼 표현하지 않는다. 문항은 시간 제한 없이 재생/답변 가능, 연주 패드와 분리한다.

검증과 인수:
bars deep-equal, 8분 333.333…ms 동일, 모티프 2초 동일, 입력 6회 동일. 큰박 개수 3/2. wide 창은 150ms이고 perfect 48.214ms. quiz 3/4가 개념 조건, 리듬 점수 100과 quiz 0/4는 별개. seed 재현 시 문항 순서 동일.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P 번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P14. L05 점쉼표와 담당 성부 침묵

선행: P12/P13, L04와 L07 선행 설명  
필수 산출물: L05 완성, rest/re-entry 분모 정의, 점쉼표 결과 카드, 쉼 경계 통합 테스트

```text
이번 작업은 P14: L05 점쉼표와 담당 성부 침묵이다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
L05를 온실에 연결하라. 추천 순서에서 L07 뒤에 배치하지만 자유 접근은 막지 않는다. 6/8 큰박 두 개, quarterBpm 90, 첫 점4분쉼 0~720에서 작은 맥박은 계속, 720/960/1200의 C5/D5/E5 tap, 다음 마디 1440~2160 G5 hold, 2160~2880 점4분쉼이다.
닫힌 덮개 greenhouse_rest_cover와 icon_wait를 사용하고 pause 아이콘이나 화면 정지를 쉼표 연출로 쓰지 않는다. 쉼의 새 down에 pitched sound를 내지 않고 해당 쉼을 dirty로 표시한다. 단, 다음 정상 early onset에 매칭되면 쉼 오입력으로 중복 처리하지 않는다.
모티프 끝의 쉼과 다음 모티프 처음 쉼은 소리상 이어지지만 D16대로 notation별 숙달 표본을 유지한다. L05 모티프 rest 2개, PLAY 8개이며 평가 가능 구간 검사 후 분모를 확정한다. hold의 늦은 정상 release와 overhold를 구분한다.
쉼 숙달 조건은 평가 가능 쉼 75% clean과 그 뒤 첫 onset 75% 성공을 함께 검사한다. 실제 후속 onset이 없는 마지막 쉼은 재진입 분모에서 제외하고 clean 표본에는 남긴다. 연속 쉼 뒤의 같은 onset은 재진입 통계에서 중복 계수하지 않도록 원본 rest 표본과 재진입 기대 항목을 별도 정의해 D 기록에 추가한다.

검증과 인수:
L05 모티프 4초, N 5, PLAY N 20. 첫 쉼 중 lead 0, 반주/맥박 유지. tick 720의 early hit는 rest clean. hold 2160 정상 release 창의 up은 clean, 창 초과는 dirty와 release 0이지만 점수 이중 감점 없음. 마지막 쉼 종료 전 결과 금지.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P15. L08·L09 우체역과 전체 꿈지도

선행: P14까지 나머지 학습 연결  
필수 산출물: CloudPostScene, 전체 지도/추천 진도, 템포 비교 결과, 9레벨 경로 E2E

```text
이번 작업은 P15: L08·L09 우체역과 전체 꿈지도다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
구름 우체역 adapter를 구현하라. L08과 L09는 동일 4/4의 8분음+8분쉼 네 쌍, 같은 C5/D5/E5/G5와 편지 외형·순서다. quarterBpm만 72/108, 모티프 10/3초와 20/9초다. 한 마디에 편지 4회, 0/480/960/1440 도착이다.
유효 tap에 post_letter_idle→folded→success_star를 보여주되 모든 움직임은 공통 clock에서 계산한다. 빠른 입력으로 다음 편지 시각을 당기지 않는다. PLAY 무입력은 사용자 음 없음. tap의 늦은 입력 gate는 원래 8분 끝에서 닫힌다.
L08 종료 후 L09 수업 카드에서 4분 기준 108 표시와 새 카운트인을 준다. 동일 음원 playbackRate로 음높이까지 바꾸는 방법을 기본으로 쓰지 않는다. 결과는 같은 패턴 두 줄의 시간차와 2/3 비율을 선택 재생으로 보여준다.
꿈지도 4장소와 L01 L02 L03 L04 L06 L07 L05 L08 L09 추천 경로를 연결한다. 완료만으로 진행을 열고 성적 부족으로 이론 학습을 잠그지 않는다. 새 수업 하나만 강조하고, 실패 2회 뒤 쉬운 연습을 제안할 수 있지만 속도/도움 설정을 자동 변경하지 않는다.

검증과 인수:
L08/L09 bars deep-equal, 시간비 정확히 2/3, 8분 416.666…/277.777…ms. 두 레벨 모티프 N 4/PLAY 16. 숫자만 바뀌고 예약 시각이 동일한 결함 검출. 네 장소 전체 경로 E2E. 다른 BPM 전환은 레벨 경계에서만.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P16. 92개 런타임 에셋·앵커·폴백 통합

선행: P15 기능 완성, runtime manifest  
필수 산출물: AssetRegistry/Loader, 장면별 load/unload, 앵커·해시·decode/폴백 테스트, 통합 화면

```text
이번 작업은 P16: 92개 런타임 에셋·앵커·폴백 통합이다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
회색 placeholder를 현재 런타임 팩으로 교체하라. runtime_manifest.json의 assetId, path, format, width, height, anchorPx/anchors, cropRects, hash, state를 타입화한다. 부록 B 카탈로그와 실제 파일의 존재·해시를 검사한다. 마스터 원화와 기존 설계를 수정하지 않는다.
17 WebP의 브라우저 decode를 확인하고 실패한 자산만 pngFallbackPath를 쓴다. WebP와 PNG를 동시에 preload하지 않는다. 75 SVG는 원본과 byte-identical이며, 런타임에 벡터 PNG는 없다. docs/VECTOR_GUIDE의 마스터 생성 경로가 런타임에 없는 것을 누락으로 오인하지 않는다.
여울 512 canvas anchor[273.5566,480.9697], 꽃 [272.3317,477.7033], 솜새 count/encourage[208.2297,350.622], demo[208.2297,357.0526]를 실제 크기로 나누어 normalized anchor를 만든다. 저장된 반올림 좌표와 정규화 원값 차이는 허용 오차로 검증한다. pivot을 자동 중앙으로 덮지 않는다.
장면별 loadProfiles만 로드한다. 공통 포즈·UI와 현재 배경·오브젝트, 결과 교육 도식 1개만 메모리에 둔다. 꽃 원화와 벡터는 대체 관계다. 포즈 교체는 리그가 아니므로 공통 발밑 정렬을 직접 확인한다. missing/decode 실패는 count-in 전 차단하고 재시도/나가기를 제공한다.

검증과 인수:
92개 기본 자산=17 WebP+75 SVG, 17 PNG 선택 폴백. 실제 크기: 배경 1152×768/여울·꽃 512/솜새 384. assetId 오타·잘못된 master crop·중복 preload 검출. pose 전환 시 발밑 튀기 1~2 CSS px 이내 목표를 화면에서 검수. 미검수는 pending 유지.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P17. 세로·가로·고DPI 화면과 시각 언어

선행: P16 실자산 통합  
필수 산출물: 모바일 레이아웃 정책, 5뷰포트 screenshot, 크롭/앵커/레이어 회귀 테스트

```text
이번 작업은 P17: 세로·가로·고DPI 화면과 시각 언어다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
LayoutTransform을 통해 HUD/장면/입력 패드/결과를 반응형으로 재배치하라. 320×568, 390×844, 768×1024, 844×390, 1366×768을 최소 검사한다. 세로 장면 4:3 crop[64,0,1024,768], 가로/데스크톱 16:9 crop[0,60,1152,648]. 장식 crop으로 판정 객체를 잘라내지 않는다.
세로 상단 56+safe area, 장면 중앙, 입력 컨테이너 최소 128·실제 버튼 72. 가로의 짧은 높이에서는 장면 옆 또는 하단 오른손 영역에 큰 패드를 배치해 주 버튼을 보존한다. 기본 논리 좌표 전체를 축소하기만 하지 말고 barpillar/needle/flower 같은 목표와 설명을 재배치한다. 화면 폭 중앙 ±20%의 주 타깃을 유지한다.
bridge_release의 빈 중앙 뒤로 ribbon이 통과해 채워진 원처럼 보이지 않게 리본을 clip/mask한다. tie 매듭은 납작한 유지 표식이며 onset과 혼동되지 않게 한다. 온실 2:1 이미지는 공통 scale, 방의 타일 6개는 동일 폭, 우체역 템포 비교 외형은 동일하다.
DPR은 캔버스 출력 품질과 GPU 비용을 함께 측정해 상한을 정한다. 런타임 4:3 가로 1024px는 DPR 3의 390 CSS px에서 약 1.14배 확대된다. 고DPI에서 항상 원본 품질이라고 쓰지 않는다. 태블릿용 마스터 해상도 선택은 조건부 로드와 별도 성능 검수 후에만 도입한다.

검증과 인수:
각 뷰포트 표적/버튼 가림 0, 가로 스크롤 0, 200% 텍스트 확대에서 설명/결과 스크롤 가능. 빈 놓기 원 중앙의 투명성, 기둥·리본 뒤 레이어, 같은 솜새 발 기준 확인. 회전 시 PAUSED와 재개 카운트인. CSS 크기와 실제 텍스처 크기 구분.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P18. 고대비·움직임 축소·toggleHold 접근성

선행: P17 반응형 화면  
필수 산출물: 접근성 설정, toggleHold adapter, mode별 기록, keyboard/screen-reader 체크리스트

```text
이번 작업은 P18: 고대비·움직임 축소·toggleHold 접근성이다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
ui/labels.ko.json을 실제 DOM 라벨의 기본으로 사용하고 이미지의 중복 alt는 숨긴다. 아이콘만 있는 버튼에도 접근 가능한 이름, 실제 disabled/focus 상태를 준다. SVG 버튼 pressed 그림이 DOM 상태를 대신하지 않게 한다. 스크린리더에는 상태 전환/결과만 announce하고, 매 음 알림은 금지한다.
고대비는 _hc 자산과 모양·윤곽을 함께 사용한다. reduced-motion 초기값은 OS 설정, 이후에는 사용자 선택을 따른다. 배경 이동·입자·흔들림을 제거하고, 정답 시각과 score는 동일하게 유지한다. 고정 게이지나 선형 접근 같은 필수 시간 단서는 남긴다. 진동은 기본 off이며, 명시적 선택에만 보조로 사용한다.
toggleHold는 D10대로 논리 edge 어댑터를 만든다. 첫 새 down은 onset, 물리 up은 rearm, 다음 새 down은 release이며, 그 down을 새 onset으로 중복 소비하지 않는다. 표준 hold owner와 가상 logical hold owner를 구분하고 cancel은 둘 다 해제한다. toggle 모드로 물리 누름 유지 숙달을 주지 않는다.
넓은 창·75% 속도·guide·큰박 숫자·visual-only 도움 출처를 결과에 남기고 표준 최고점과 분리한다. 도움 사용자가 진도를 잃지 않게 한다. 비시간제 개념 문항과 텍스트 설명을 제공하되 지원하지 못하는 영역도 명시한다.

검증과 인수:
키 재지정 F/J/Enter와 메뉴 충돌 없음. high contrast/reduced motion 전후 같은 로그의 score 동일. toggle에서 연속 두 번 down은 반드시 중간 physical up이 필요함. release 역할의 down이 새 onset을 동시에 맞히지 않음. 접근성 트리 중복 라벨 없음, tab focus 순서·대화상자 복귀 확인.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P19. 진행 저장·철회 가능한 최고점·복구

선행: P18 모드 구분  
필수 산출물: ProgressRepository, migration/ledger/rollback 테스트, 오류/초기화 DOM, 저장 스키마

```text
이번 작업은 P19: 진행 저장·철회 가능한 최고점·복구다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
ProgressRepository를 night-thread.progress.v1 한 key로 구현하라. schemaVersion, contentVersion, settings, calibration, levels, recentAttempts, bestScoreEvidence, lastLessonId를 검증한다. 저장 전 복사본을 검사하고 setItem 실패를 잡는다. 결과 화면은 저장에 실패해도 사라지지 않는다.
전체 attempt와 재개 session chain을 명시하고 결과 저장에는 idempotency key를 사용한다. 늦은 정상 edge로 기술 rollback되면 관련 시도는 valid=false로 두고, 그 시도에 의존한 best를 다른 유효 근거에서 재계산한다. 최신 최고값만 남기는 모델은 금지한다. 최소한 현재 철회 가능한 시도와 직전 최고 근거를 보존한다.
기본 80 뒤 보조 95를 저장하고 새로고침해 두 값이 분리되는지 검사한다. contentVersion이 바뀌면 legacy를 보존하고, 새 패턴 숙달로 표시하지 않는다. corrupted JSON은 가능하면 backup 키에 보존하고 기본값으로 실행하되 원문을 무조건 덮지 않는다. quota/private 모드도 진행 가능하게 한다.
설정 초기화는 명시적 확인 후 이 게임 key만 삭제한다. 저장 프로필에 이름·이메일·기기 지문·raw 입력 장기 보관을 추가하지 않는다. 문제 제보 export는 사용자가 요청할 때만 로컬 파일로 만들고 필요 최소한의 장치/브라우저 정보를 검토한다.

검증과 인수:
double RESULTS 저장 1회. 최고 90 시도 철회 후 이전 80 복구. corrupted/quota 오류에도 플레이 가능. 다른 앱 sentinel key 보존. assisted 95가 standard 80을 덮지 않음. schema/content migration 테스트, 중단 시 임시 N/earned/extra/숙달 동시 rollback.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P20. 교육 도식·기보·출고 승인 경로

선행: P19까지 기능 연결, 교육 manifest pending  
필수 산출물: RhythmNotation, 교육 preview, source/approval manifest, 교육자 체크리스트와 pending report

```text
이번 작업은 P20: 교육 도식·기보·출고 승인 경로다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
정규 NotationEvent에서 리듬 기보와 소리를 같이 생성하라. 타이는 원래 음표 둘과 곡선을 보이고 sound gate는 하나로 두며, 점은 정확한 음가·쉼표와 정렬한다. 제공 education_*SVG는 교육 검수 대상 참조로 사용하되 라이브 기보와 데이터 차이를 검사한다.
기본 6도식과 고급 4개를 분리하고 한국어 제목·설명은 DOM에 둔다. 기본 도식 alt text에 숨긴 tick식을 몰래 읽어주지 않는다. L03 예시는 부분 발췌임을 명시하고 그 두 음표만으로 완전한 두 마디를 채운다고 오해시키지 않는다. tempo 도식은 리듬 전용이며 실제 C5/D5/E5/G5 pitch는 정규 JSON에 있다.
source-manifest에 assetId/concept/source/rights/dataHash/renderer/math/notation/listening/reviewer/date/releaseApproved를 관리한다. 현재 level.reviewState 상수는 기존 검토 상태 그대로 두고 최종 승인은 별도 versioned manifest로 관리한다. 승인권자와 근거 없이 releaseApproved=true 금지.
교육자가 9레벨의 마디·동음 타이·점음/점쉼·3/4 vs 6/8·기준 음표 BPM·청음·설명 문구를 검토할 수 있는 로컬 preview를 만든다. 수학 pass와 사람 검수 pending을 분리한 검수표를 출력한다. V2 오류 원본 054/031-3은 공개 메뉴에서 차단한다.

검증과 인수:
원본 PNG/참고작 자산 패키지 미포함. 최종 교육 승인 pending이면 production 교육 출고 gate 실패. 데이터 해시 변경 시 기존 승인 재검토. 모든 도식과 동시 소리의 타이 attack 수/점 길이/큰박 일치. 실제 교육자 이름·날짜가 없으면 reviewer를 지어내지 않음.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P21. 오디오 믹스·질감·상태 애니메이션 다듬기

선행: P20 음악 의미 검증 경로  
필수 산출물: 애니메이션/믹스 정책, 상태 전환 capture, 오디오 회귀 로그, 품질 결함 목록

```text
이번 작업은 P21: 오디오 믹스·질감·상태 애니메이션 다듬기다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
기능이 통과한 뒤 미술과 음향을 다듬는다. 여울 idle/prepare/press/hold/release/miss, 솜새 count/demo/encourage를 명확한 상태표로 만든다. 정지 포즈 교체와 scale/position 보간으로 작게 움직이고 타이 boundary에서 press/particle을 다시 트리거하지 않는다.
원문 팔레트 #142A35/#F3E8C9/#E3B85D/#65A69A/#D77467을 바탕으로 색 외에도 성공에는 둥근 매듭/실수에는 벌어진 매듭을 쓴다. miss는 흐름과 다음 시각을 바꾸지 않는다. 전면 섬광·강한 흔들림·큰 비난음은 넣지 않는다. 장면 전환 600ms는 판정 확정 이후에 하며, reduced-motion에서는 짧은 정적 전환으로 대체한다.
클릭/시연/BGM/SFX 초기 볼륨 70/80/45/60%를 실제 믹스로 검수한다. 학습 lead가 반주에 묻히지 않게 하고 hold가 타이 중간에 감쇠해 끊긴 듯 들리지 않게 한다. 샘플 교체 시 loop와 release의 실제 길이를 측정하고 source gate와 일치시킨다. WAV playbackRate로 템포와 음높이를 함께 바꾸지 않는다.
최대 8 voice·12 주요 오브젝트·24 particle 예산을 상태별로 검사한다. 첫 음부터 소리가 늦는 문제를 장식 animation으로 감추지 않는다. 최종 음향의 peak/clip 검사를 수치와 파일/설정으로 남기고 안전 볼륨을 보장한다고 쓰지 않는다.

검증과 인수:
포즈 상태 변환표에 tie boundary 재 press 없음. miss 뒤 onset 시간 불변. 모드별 동일 score. 합성음→최종음 교체 후 attack/gate 회귀 통과. 600ms 전환 중 두 고해상도 배경의 동시 메모리 사용을 별도로 측정/회피. clipping 측정 상태 명시.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P22. 성능·네트워크·메모리 예산 검증

선행: P21 실자산/음향  
필수 산출물: performance-budget.json, 네트워크/프레임/입력/노드 로그, 기기별 측정표, 최적화 전후 증거

```text
이번 작업은 P22: 성능·네트워크·메모리 예산 검증이다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
실제 build의 첫 장면 초기 전송을 측정하라. 목표 8,000,000B에는 JS/CSS/필수 자산/실제 음원/폰트/요청 비용이 포함된다. 런타임 17 WebP+75 SVG 1,916,295B와 ZIP 10,123,168B를 혼동하지 않는다. 필수 음향 2,000,000B는 예약 예산이며 아직 음원이 포함된 것처럼 쓰지 않는다.
loadProfiles 기준 현재 장면 이미지는 약 0.99~1.56MB, RGBA 추정 13.65~17.29MiB지만 실기기 GPU 측정이 아니다. WebP 전송 축소가 decoded memory 축소라고 주장하지 않는다. SVG 2배 raster 시 그 부분은 4배이며, CPU/GPU 복사·backbuffer·decode 임시·audio·mipmap을 따로 고려한다.
장면 전환 시 이전 texture 해제, 교육 도식 한 장 지연 로드, 필수 decode 완료 후 count-in을 적용한다. idle 중 미래 프리로드가 오디오를 막지 않게 한다. 오프라인은 이미 캐시된 자산만 가능하다고 정확히 표시하고 미요청 service worker를 무조건 추가하지 않는다. 새 캐시 정책 도입 시 content hash와 버전 갱신 검사를 한다.
표적 중간 사양 기기에서 render frame p95≤33.4ms, input callback p95≤8ms, 5분 절대 예약 누적 드리프트 <2ms, 공통 시계 AV target p95≤1프레임을 측정한다. 물리 음파 도착/scanout은 별도 실험이다. 목표와 관측값을 열로 분리한다.

검증과 인수:
초기 로드 WebP/PNG 중복 0, 다른 3배경 선로드 0, 교육 10장 선로드 0. pause/retry 20회 메모리 상승 지속 없음. 저프레임에서도 정답 시각 불변. 정적 바이트 예산 통과를 실기기 성능 pass로 표시하지 않음. 미달은 저사양 모드와 지원 제한 기록.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P23. 전체 자동화·경계·회귀 검수

선행: P22 기능/성능 수정 반영  
필수 산출물: 자동화 QA report, contract traceability, 실패 재현 fixtures, 수정 증거, 독립 리뷰 결과

```text
이번 작업은 P23: 전체 자동화·경계·회귀 검수다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
원설계 U01~U46, I01~I17, E01~E15를 추적표로 만들고 이 팩의 D 결정 추가 테스트를 합쳐 실행하라. typecheck·content validator·unit·integration·E2E·production build를 실제 명령으로 돌린다. 테스트 개수만 보고하지 말고 실패/skip/not run을 구분한다.
부록 fixture의 기대값을 독립 계산한 오라클과 대조한다. full session replay, 100회 결정성, 넓은 판정 cap, epoch timestamp, late edge 결과 철회, 마지막 쉼, 첫 early onset, 타이 내 up/down, 같은 timestamp up/down, 다중 포인터와 resume 실패를 필수로 포함한다.
Chromium/Firefox/WebKit 자동화와 320/390/768/가로/데스크톱 뷰포트를 검사한다. Playwright로 주입한 timestamp는 물리 입력 측정이 아님을 명시한다. synthetic 오디오 예약 로그와 실제 청음도 구분한다. 접근성 자동 검사와 키보드 수동 검사를 둘 다 남긴다.
결함은 P0 데이터 손실/오개념/중단 불공정, P1 핵심 입력·오디오·접근 불가, P2 시각·편의 순으로 처리한다. 판정 창 완화/score 고정/테스트 skip으로 문제를 숨기지 않는다. 고친 범위의 인접 모듈 회귀를 돌리고 독립 리뷰에서 source contract 위반을 다시 찾게 한다.

검증과 인수:
필수 실패 0, 임의 skip 0. not run은 환경/권한/기기 blocker를 구체화. 9레벨/4장면 전 경로 실행. UI/score/저장/오디오 중 서로 다른 결과 없음. source hash와 final manifest hash가 보고서와 일치.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P24. 실기기·교육자·초보자 최종 관문

선행: P23 자동화 통과, 실제 검사 가능한 사람/기기  
필수 산출물: 실기기 matrix, 교육 승인 근거, 사용성 관찰/한계, 공개 출고 go/no-go

```text
이번 작업은 P24: 실기기·교육자·초보자 최종 관문이다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
실제 iPhone Safari와 Android Chrome, 표적 데스크톱 Chromium/Firefox/Safari에서 직접 검수하라. 자동화 WebKit을 실제 iPhone으로 표시하지 않는다. OS/브라우저 버전·기기·출력 경로·날짜·build hash·관측값을 남긴다.
내장 스피커/유선/Bluetooth 각 1개 이상에서 unlock, resume, 화면 잠금, 앱 전환, 회전, cancel, 경로 변경, 잔여 지연과 보정 일관성을 확인한다. Bluetooth 경로 변경 감지가 안 되면 그 제한과 수동 안내를 기록한다. 물리 AV 측정은 loopback/고속 촬영 같은 방법과 장치를 명시한다.
교육자에게 최종 기보와 동시 소리, 점음표/점쉼표, 동음 타이와 이음줄 차이, 3/4·6/8 묶음, 기준 음표 BPM, 실제 수행과 개념 문항의 구분을 검토받는다. 승인자는 보지 않은 항목까지 일괄 pass하지 않는다. manifest의 승인은 확인한 자산·데이터 hash에만 적용한다.
가능하면 초보 8~12명의 사용성 계획을 실행하되 모집/개인정보 수집은 새 권한을 확인한다. 목표는 L02를 두 번 연속 재타격 없이 수행, 박자 4문항 중 3개, 안내 이해다. 표본이 작거나 미실행이면 교육 효과 입증이라고 쓰지 않는다. 필요한 사람이 없으면 관문 pending으로 멈추고 사용자에게 정확히 요청한다.

검증과 인수:
실제 모바일 2종 기록, 표적 브라우저 기록, 오디오 경로별 결과, 교육자 서명/날짜/범위. not run을 pass로 바꾸지 않음. 명백한 음악 오류/불공정 취소/접근 불가 P0/P1이 있으면 공개 인수 불가.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P25. 인수용 빌드·README·재현 가능한 인계

선행: P24 결과 또는 명시적 미검증 제한  
필수 산출물: dist, README, CHANGELOG, QA/지원/권리 문서, 재현 실행 안내, 잔여 blocker

```text
이번 작업은 P25: 인수용 빌드·README·재현 가능한 인계다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
인수용 production build와 로컬 preview를 검증하라. 공개 교육 gate가 pending이면 내부 검토용 artifact로만 표시하고 출시 승인을 주장하지 않는다. 앱 기능 완료·교육 검수·실기기 지원·배포 상태를 별도 칸으로 보고한다.
README에는 실제 설치/개발/타입/검증/빌드/preview 명령, Node·패키지 버전, 실행 URL, 콘텐츠 버전, asset manifest, 권리/폰트 고지, 지원 기기와 제한, 입력/보정/복구 방법을 적는다. 안 쓴 명령과 추정 테스트 결과를 넣지 않는다.
QA 보고서와 테스트 재현 로그, 주요 화면, 잔여 결함, 다음 승인 필요 사항을 정리한다. 저장 초기화 범위와 업그레이드 정책도 명시한다. 최종 dist와 문서의 해시/파일 목록을 만들어 재현 가능하게 한다.
사용자가 지정하지 않은 호스팅, 계정 생성, 외부 업로드, 공유 권한 변경, 상용 음원 구매를 하지 않는다. 사용자에게 무엇을 실행하면 어느 화면에서 L02를 플레이하는지 짧게 설명한다. 다음 작업을 제안할 경우 검증되지 않은 완료 약속을 하지 않는다.

검증과 인수:
깨끗한 설치 환경 또는 동등 재현 검사, 로컬 preview 정상, 필수 파일 누락 0, 미승인 자산 gate 표시. source와 마스터 불변. README 실행 명령과 실제 package scripts 일치. 인수 파일 해시와 버전 일치.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P26. V2 당김음·2:1 스윙 조건부 설계

선행: 사용자의 별도 V2 승인과 교정·교육 검수 계획  
필수 산출물: V2 decision/schema proposal, 교정 fixture·검수 계획; 승인 전 구현/공개 차단

```text
이번 작업은 P26: V2 당김음·2:1 스윙 조건부 설계다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
이 단계는 기본 실행하지 않는다. 먼저 V2 요청과 대상 범위, 기존 MVP 회귀 증거를 확인하라. 새 게임이나 무한 레벨 생성을 추가하지 말고 기존 실빛다리/우체역 확장으로 한정한다.
054 당김음은 원본 2박/3.5박 예와 다른 음 타이를 그대로 쓰지 않는다. 새 4/4 예는 rest 0~240, 동음 타이 240~480+480~960, 다음 960~1440, 다음 1440~1920. tick 480 attack 없음, 합 1920. 약박 시작의 지속이 강한 위치를 지난다는 의미를 검수한다.
031-3 스윙은 한 q를 320+160으로 나누는 2:1 학습 모델이다. 점8분 360+16분 120의 3:1과 다르다. 현재 denominator/dots 스키마에 320을 거짓 표현하지 말고 written/performed 또는 tupletRatio의 schemaVersion 2를 먼저 설계한다. migration과 기존 9레벨 회귀를 작성한다.
실제 스윙은 스타일·템포별로 달라질 수 있음을 명시하고 2:1을 모든 재즈 정답으로 일반화하지 않는다. 데이터/새 기보/청음/권리 승인 후에만 feature flag를 연다. 타이와 스윙을 timing error로 낸 후 score만 보정하는 편법을 쓰지 않는다.

검증과 인수:
당김음 합 1920/attack 240 한 번, 스윙 [320,160]×4 합 1920, 3:1과 구별. V1 schema는 320 fake 값을 거부. MVP 모든 회귀 통과, 승인 없는 V2 메뉴 노출 0.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## P27. 공개 배포 요청 시 확인할 마지막 경계

선행: 사용자가 명시적으로 배포를 요청한 경우만  
필수 산출물: 승인된 배포 결과·검증 링크 또는 공개 전 필요한 구체적 결정

```text
이번 작업은 P27: 공개 배포 요청 시 확인할 마지막 경계다. 먼저 docs/contracts.md, docs/decisions.md, docs/implementation-state.md와 이 단계의 선행 증거를 확인하라. 이미 통과한 모듈을 이유 없이 다시 쓰지 말고 이번 범위를 완성한다.

구현 지시:
사용자가 원하는 호스팅·도메인·공개 대상·비용·계정과 실제 배포 권한을 확인하라. P25의 인수 빌드 준비를 공개 배포 승인으로 해석하지 않는다. 기존 승인된 환경이 있으면 그 환경의 가이드와 현재 설정을 읽는다.
P24의 교육·권리·실기기 관문을 확인하고 pending이 있으면 무엇이 공개 교육 출시를 막는지 먼저 설명한다. 내부 테스트 링크만 허용된 경우 공개 검색/일반 배포로 범위를 늘리지 않는다. 새 접근 권한·키·결제·약관은 해당 확인 절차를 따른다.
배포가 명시적으로 허용되면 build hash·콘텐츠 버전·캐시 전략·fallback 경로를 검증하고 배포 후 실제 URL에서 부팅/자산/오디오 unlock/L02/저장/404 경로를 읽기 검사한다. 배포 도구 성공 로그만으로 사용 가능하다고 단정하지 않는다.
확인된 URL, 검증한 build hash, 지원·미검증 범위, 롤백 방법을 인계한다. 별도의 분석 SDK나 사용자 정보 수집을 배포 편의상 추가하지 않는다.

검증과 인수:
권한/범위 확인, 교육 release gate, 실제 URL readback, 자산 hash/cache 검증, 모바일 실제 접속. 불가하면 정확한 blocker만 보고하고 다른 계정/호스팅으로 우회하지 않음.

종료 보고:
변경 파일, 실행한 명령과 실제 결과, 각 인수 항목의 passed/failed/not run, 확인 가능한 증거, 남은 blocker, 다음 권장 P번호를 보고하라. docs/implementation-state.md를 갱신한다. 이 단계에서 하지 않은 물리 기기·교육자·청음·배포를 완료라고 쓰지 않는다.
```

검수자는 ‘구현했습니다’라는 문장만 보지 말고 위 인수 항목을 재현한다. 불충족 항목은 해당 단계에 남기고 다음 장면의 꾸미기로 넘어가지 않는다.

## 5. 중단·오류·새 대화 복구 프롬프트

아래 블록은 원인별로 골라 전달한다. 수정 전에 재현하고, 최소 변경 후 해당 P단계의 검사를 다시 실행한다. 기존 사용자 변경·원본 설계·에셋 마스터를 보존한다.

### R01. 새 대화에서 안전하게 이어가기

```text
기준 설계, 모바일 프롬프트팩, docs/implementation-state.md, docs/contracts.md, docs/decisions.md, Git 상태를 읽고 마지막 실제 통과 P단계를 확인하라. 파일이 있다는 이유만으로 테스트 완료라고 간주하지 않는다. 미완료 작업·다음 한 단계·blocker를 세 문장으로 먼저 정리한 뒤 현재 단계만 이어 간다. 원본 해시나 콘텐츠 버전이 달라졌으면 차이를 확인한다. 이미 존재하는 기능을 다시 생성하거나 저장소를 초기화하지 않는다. 실행 가능한 최소 회귀검사부터 돌리고 새 결과를 상태 문서에 기록하라.
```

### R02. 소리가 없거나 처음만 재생될 때

```text
오디오 unlock/resume 제스처와 AudioContext state, bus gain, decode 준비, source 생명주기, 예약 target이 미래인지부터 검사하라. AudioBufferSourceNode 재사용, mute와 guide/player bus 혼동, autoplay 거절, source를 너무 일찍 disconnect한 경우를 구분한다. 진단을 위해 무음 PLAY를 허용하지 않는다. LISTEN 한 음과 PLAY 유효 down 한 음을 각각 재현하고 실패 fixture를 만든다. 원인만 고친 뒤 L02 타이 attack 1, tap 고정 종료, pause/retry 20회 ghost node 0을 다시 검증하라. 실제 스피커 청음과 스케줄 로그를 구분해 보고한다.
```

### R03. 타이 중간이 끊기거나 두 번 울릴 때

```text
NotationEvent→tieGroup→SoundGate→InputExpectation→audio node→scene pose를 sourceNotationIds로 추적하라. L02 tick 480과 L03 tick 1920에 새 gate, envelope, 클릭, press pose, particle이 생기는지 검사한다. 동음/동일 철자/연속성 검증을 느슨하게 하지 않는다. 두 음표는 악보에 남기고 소리·입력만 합치는 구조를 복구하라. 실제 중간 up은 BROKEN으로 남겨야 하며 소리를 정답 끝까지 자동 지속해 오류를 감추지 않는다. 수학·오디오 event snapshot·시각 상태를 모두 재검사한다.
```

### R04. 계속 늦거나 보정 부호가 이상할 때

```text
event.timeStamp 정상화, receipt 시각, getOutputTimestamp 유효성, fallback anchor, base/outputLatency, inputOffset 부호를 한 타임라인에 표시하라. 출력 timestamp 경로의 latency 이중 차감과 visualOffset이 점수에 섞인 경우를 먼저 찾는다. raw+80-offset80=0, raw-80-offset(-80)=0을 순수 테스트로 확인한다. 판정창을 넓혀 지연 버그를 감추지 않는다. 사용자 보정과 물리 지연 측정의 차이를 설명하고 불안정 12개/MAD>45 사례에서 자동 저장하지 않는지 검증하라. 경로 변경 뒤 새 확인 연습으로 비교한다.
```

### R05. 빠른 연타·누름 유지·두 손가락이 점수를 망칠 때

```text
ActionInput 한 경로, physical owner, 논리 hold owner, repeat와 dedupe, capture 및 sequence를 점검한다. click 중복 리스너나 전역 debounce를 제거하기 전에 재현 테스트를 만든다. 같은 timestamp up→down, tap gate 자동 종료 뒤 물리 owner 유지, 두 번째 손가락 up 무시, 정상 up 뒤 lostcapture 무시를 각각 확인한다. toggleHold는 두 새 down 사이 physical up이 있어야 하며 release down을 다음 onset으로 동시에 쓰지 않는다. 후보 없는 실제 재타격은 extra지만 반복 keydown은 extra가 아니다.
```

### R06. 잠금·회전·복귀 뒤 stuck hold나 유령음이 날 때

```text
중단 원인 이벤트들이 같은 INTERRUPT 경로로 멱등 처리되는지 확인하라. 활성·미래 node, scheduler task, 입력 owner, toggle owner, particle callback과 sessionId를 추적한다. rollback은 earned/N/extra/숙달/저장 후보를 함께 되돌려야 한다. 복귀는 사용자 제스처와 running 확인, up rearm, 새 count-in 순서다. 현재 hold 중간 복원을 제거하고 해당 모티프 처음으로 돌린다. L03 두 마디 atomic phrase와 마지막 release 직후 interrupt를 시험하고 20회 반복 누수를 확인하라.
```

### R07. 점수·쉼·결과가 서로 맞지 않을 때

```text
해당 시도의 정규 레벨, 컴파일 기대 항목, 입력 timestamp, 판정 등급, phrase별 N/earned/extra와 숙달 분모를 내보내라. 점수는 N=tap+2hold 및 .25*min(extra,N) 공식 하나여야 한다. 쉼 clean과 개념 문항을 무료점수에 섞지 않는다. 정상 early 재진입과 정상 release를 dirty로 중복 표시했는지 검사한다. late dispatch가 timeout 뒤 들어왔으면 해당 시도 철회와 best 근거 재계산을 확인한다. ‘점수 표시만’ 고치지 말고 독립 오라클과 원장을 일치시킨다.
```

### R08. 모바일이 잘리거나 자산이 흐리고 무거울 때

```text
현재 texture path/실크기/cropRect/anchor/CSS 크기/DPR를 한 표로 확인하라. 마스터 좌표를 모바일 파생본에 적용했는지, 원화 투명 여백을 visible 폭으로 오해했는지, 모든 background/education/PNG fallback을 동시에 읽는지 검사한다. LayoutTransform으로 표적과 패드를 재배치하고 72px 주 버튼·44px 보조를 보존한다. 온실 두 물통에 동일 scale을 쓰고 빈 놓기 원 뒤 리본을 마스크한다. WebP 전송 bytes와 decoded RGBA, 실기기 메모리를 구분해 측정한 뒤 가장 큰 원인부터 줄인다.
```

### R09. 저장 파손·중복 결과·최고점 철회 오류

```text
이 게임 key와 backup만 읽고 다른 앱의 localStorage를 건드리지 않는다. 원문 corrupted 문자열을 가능하면 보존한 뒤 검증된 기본값으로 실행한다. result idempotency key와 recentAttempts/bestScoreEvidence를 대조해 중복 저장, assisted→standard 덮어쓰기, invalid attempt의 최고점 잔존을 찾는다. 이전 유효 최고 근거를 잃었다면 점수를 지어내지 말고 제한을 보고한다. quota 실패에도 현재 결과가 남고 새 플레이가 가능한지 확인하라. migration은 원본 버전 fixture로 재현한다.
```

### R10. 테스트가 통과하지만 교육적으로 틀렸거나 승인 자료가 없을 때

```text
실제 잘못된 기보/소리/설명/동작의 차이를 sourceNotationId와 함께 재현하라. math pass를 notation/listening approval로 간주하지 않는다. 해당 asset/data hash의 releaseApproved를 승인된 근거 없이 true로 만들지 말고 공개 교육 빌드를 차단한다. 원본 교재나 참고작 자산을 급히 가져와 메우지 않는다. 수정할 정규 데이터·SVG·음향·문구 범위를 적고 교육자 재검수를 요청한다. 학습자 관찰이 없으면 효과를 입증했다고 말하지 않는다. 이미 승인된 다른 콘텐츠의 상태는 보존한다.
```

## 부록 A. 독립 실행에 필요한 저작 스키마와9개 레벨

다음 JSON 블록은 각각 **스키마 1개, 전체 레벨 배열 1개**다. 배열 자체는 Level 스키마의 인스턴스가 아니다. 배열의 각 객체를 스키마로 검증하고 L01.json~L09.json으로 분리한다. 문자열·배열 순서·필드를 바꾸지 않는다. 부록 C~F는 테스트용 별도 fixture이며 Level 스키마에 넣지 않는다. 모든 JSON 블록에 주석·생략 부호가 없으며 그대로 파싱할 수 있다.

### A1. Draft2020-12 Level schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.invalid/night-thread/level.schema.json",
  "title": "NightThreadLevelV1",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "id",
    "title",
    "scene",
    "ppq",
    "meter",
    "quarterBpm",
    "sourceIds",
    "skillIds",
    "sequence",
    "bars",
    "reviewState"
  ],
  "properties": {
    "schemaVersion": {
      "const": 1
    },
    "id": {
      "type": "string",
      "pattern": "^L[0-9]{2}$"
    },
    "title": {
      "type": "string",
      "minLength": 1
    },
    "scene": {
      "enum": [
        "thread-bridge",
        "crescent-greenhouse",
        "folding-room",
        "cloud-post"
      ]
    },
    "ppq": {
      "const": 480
    },
    "meter": {
      "oneOf": [
        {
          "const": {
            "n": 4,
            "d": 4,
            "groupingEighths": [
              2,
              2,
              2,
              2
            ]
          }
        },
        {
          "const": {
            "n": 3,
            "d": 4,
            "groupingEighths": [
              2,
              2,
              2
            ]
          }
        },
        {
          "const": {
            "n": 6,
            "d": 8,
            "groupingEighths": [
              3,
              3
            ]
          }
        }
      ]
    },
    "quarterBpm": {
      "type": "number",
      "minimum": 50,
      "maximum": 140
    },
    "sourceIds": {
      "type": "array",
      "minItems": 1,
      "uniqueItems": true,
      "items": {
        "type": "string"
      }
    },
    "skillIds": {
      "type": "array",
      "minItems": 1,
      "uniqueItems": true,
      "items": {
        "enum": [
          "duration",
          "tie",
          "cross-bar-tie",
          "dot",
          "dotted-rest",
          "simple-triple",
          "compound-duple",
          "tempo"
        ]
      }
    },
    "sequence": {
      "const": {
        "countInBars": 1,
        "listenRepeats": 2,
        "listenTailBars": 1,
        "practiceRepeats": 2,
        "playRepeats": 4,
        "outroBars": 1
      }
    },
    "bars": {
      "type": "array",
      "minItems": 1,
      "maxItems": 8,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "events"
        ],
        "properties": {
          "events": {
            "type": "array",
            "minItems": 1,
            "items": {
              "$ref": "#/$defs/event"
            }
          }
        }
      }
    },
    "reviewState": {
      "const": "math_checked_art_audio_review_pending"
    }
  },
  "$defs": {
    "notation": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "denominator",
        "dots"
      ],
      "properties": {
        "denominator": {
          "enum": [
            1,
            2,
            4,
            8,
            16
          ]
        },
        "dots": {
          "enum": [
            0,
            1
          ]
        }
      }
    },
    "event": {
      "oneOf": [
        {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "id",
            "at",
            "ticks",
            "kind",
            "notation"
          ],
          "properties": {
            "id": {
              "type": "string",
              "minLength": 1
            },
            "at": {
              "type": "integer",
              "minimum": 0
            },
            "ticks": {
              "type": "integer",
              "minimum": 1
            },
            "kind": {
              "const": "rest"
            },
            "notation": {
              "$ref": "#/$defs/notation"
            }
          }
        },
        {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "id",
            "at",
            "ticks",
            "kind",
            "notation",
            "pitchName",
            "midi",
            "interaction"
          ],
          "properties": {
            "id": {
              "type": "string",
              "minLength": 1
            },
            "at": {
              "type": "integer",
              "minimum": 0
            },
            "ticks": {
              "type": "integer",
              "minimum": 1
            },
            "kind": {
              "const": "note"
            },
            "notation": {
              "$ref": "#/$defs/notation"
            },
            "pitchName": {
              "enum": [
                "C5",
                "D5",
                "E5",
                "G5"
              ]
            },
            "midi": {
              "enum": [
                72,
                74,
                76,
                79
              ]
            },
            "interaction": {
              "enum": [
                "tap",
                "hold"
              ]
            },
            "tieGroup": {
              "type": "string",
              "minLength": 1
            }
          }
        }
      ]
    }
  }
}
```

### A2. 정규 Level 배열 전체

원문과 런타임 `source/dream_level_examples.json`의 파싱된 내용이 같다. 아직 최종 미술·악보·청음 승인이 아니라 수학 검증 상태다.

```json
[
  {
    "schemaVersion": 1,
    "id": "L01",
    "title": "짧은 실과 긴 실",
    "scene": "thread-bridge",
    "ppq": 480,
    "meter": {
      "n": 4,
      "d": 4,
      "groupingEighths": [
        2,
        2,
        2,
        2
      ]
    },
    "quarterBpm": 72,
    "sourceIds": [
      "004"
    ],
    "skillIds": [
      "duration"
    ],
    "sequence": {
      "countInBars": 1,
      "listenRepeats": 2,
      "listenTailBars": 1,
      "practiceRepeats": 2,
      "playRepeats": 4,
      "outroBars": 1
    },
    "bars": [
      {
        "events": [
          {
            "id": "a",
            "at": 0,
            "ticks": 480,
            "kind": "note",
            "notation": {
              "denominator": 4,
              "dots": 0
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "hold"
          },
          {
            "id": "b",
            "at": 480,
            "ticks": 480,
            "kind": "rest",
            "notation": {
              "denominator": 4,
              "dots": 0
            }
          },
          {
            "id": "c",
            "at": 960,
            "ticks": 960,
            "kind": "note",
            "notation": {
              "denominator": 2,
              "dots": 0
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "hold"
          }
        ]
      }
    ],
    "reviewState": "math_checked_art_audio_review_pending"
  },
  {
    "schemaVersion": 1,
    "id": "L02",
    "title": "중간 매듭에서는 계속",
    "scene": "thread-bridge",
    "ppq": 480,
    "meter": {
      "n": 4,
      "d": 4,
      "groupingEighths": [
        2,
        2,
        2,
        2
      ]
    },
    "quarterBpm": 72,
    "sourceIds": [
      "004",
      "017"
    ],
    "skillIds": [
      "tie"
    ],
    "sequence": {
      "countInBars": 1,
      "listenRepeats": 2,
      "listenTailBars": 1,
      "practiceRepeats": 2,
      "playRepeats": 4,
      "outroBars": 1
    },
    "bars": [
      {
        "events": [
          {
            "id": "a",
            "at": 0,
            "ticks": 480,
            "kind": "note",
            "notation": {
              "denominator": 4,
              "dots": 0
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "hold",
            "tieGroup": "t1"
          },
          {
            "id": "b",
            "at": 480,
            "ticks": 480,
            "kind": "note",
            "notation": {
              "denominator": 4,
              "dots": 0
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "hold",
            "tieGroup": "t1"
          },
          {
            "id": "c",
            "at": 960,
            "ticks": 480,
            "kind": "rest",
            "notation": {
              "denominator": 4,
              "dots": 0
            }
          },
          {
            "id": "d",
            "at": 1440,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "E5",
            "midi": 76,
            "interaction": "tap"
          },
          {
            "id": "e",
            "at": 1680,
            "ticks": 240,
            "kind": "rest",
            "notation": {
              "denominator": 8,
              "dots": 0
            }
          }
        ]
      }
    ],
    "reviewState": "math_checked_art_audio_review_pending"
  },
  {
    "schemaVersion": 1,
    "id": "L03",
    "title": "기둥을 넘어 잇기",
    "scene": "thread-bridge",
    "ppq": 480,
    "meter": {
      "n": 4,
      "d": 4,
      "groupingEighths": [
        2,
        2,
        2,
        2
      ]
    },
    "quarterBpm": 72,
    "sourceIds": [
      "004",
      "017"
    ],
    "skillIds": [
      "cross-bar-tie"
    ],
    "sequence": {
      "countInBars": 1,
      "listenRepeats": 2,
      "listenTailBars": 1,
      "practiceRepeats": 2,
      "playRepeats": 4,
      "outroBars": 1
    },
    "bars": [
      {
        "events": [
          {
            "id": "a",
            "at": 0,
            "ticks": 960,
            "kind": "rest",
            "notation": {
              "denominator": 2,
              "dots": 0
            }
          },
          {
            "id": "b",
            "at": 960,
            "ticks": 480,
            "kind": "rest",
            "notation": {
              "denominator": 4,
              "dots": 0
            }
          },
          {
            "id": "c",
            "at": 1440,
            "ticks": 480,
            "kind": "note",
            "notation": {
              "denominator": 4,
              "dots": 0
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "hold",
            "tieGroup": "t2"
          }
        ]
      },
      {
        "events": [
          {
            "id": "d",
            "at": 0,
            "ticks": 960,
            "kind": "note",
            "notation": {
              "denominator": 2,
              "dots": 0
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "hold",
            "tieGroup": "t2"
          },
          {
            "id": "e",
            "at": 960,
            "ticks": 480,
            "kind": "rest",
            "notation": {
              "denominator": 4,
              "dots": 0
            }
          },
          {
            "id": "f",
            "at": 1440,
            "ticks": 480,
            "kind": "note",
            "notation": {
              "denominator": 4,
              "dots": 0
            },
            "pitchName": "E5",
            "midi": 76,
            "interaction": "hold"
          }
        ]
      }
    ],
    "reviewState": "math_checked_art_audio_review_pending"
  },
  {
    "schemaVersion": 1,
    "id": "L04",
    "title": "꽃잎 하나를 더",
    "scene": "crescent-greenhouse",
    "ppq": 480,
    "meter": {
      "n": 4,
      "d": 4,
      "groupingEighths": [
        2,
        2,
        2,
        2
      ]
    },
    "quarterBpm": 80,
    "sourceIds": [
      "004",
      "006"
    ],
    "skillIds": [
      "dot"
    ],
    "sequence": {
      "countInBars": 1,
      "listenRepeats": 2,
      "listenTailBars": 1,
      "practiceRepeats": 2,
      "playRepeats": 4,
      "outroBars": 1
    },
    "bars": [
      {
        "events": [
          {
            "id": "a",
            "at": 0,
            "ticks": 720,
            "kind": "note",
            "notation": {
              "denominator": 4,
              "dots": 1
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "hold"
          },
          {
            "id": "b",
            "at": 720,
            "ticks": 240,
            "kind": "rest",
            "notation": {
              "denominator": 8,
              "dots": 0
            }
          },
          {
            "id": "c",
            "at": 960,
            "ticks": 720,
            "kind": "note",
            "notation": {
              "denominator": 4,
              "dots": 1
            },
            "pitchName": "E5",
            "midi": 76,
            "interaction": "hold"
          },
          {
            "id": "d",
            "at": 1680,
            "ticks": 240,
            "kind": "rest",
            "notation": {
              "denominator": 8,
              "dots": 0
            }
          }
        ]
      }
    ],
    "reviewState": "math_checked_art_audio_review_pending"
  },
  {
    "schemaVersion": 1,
    "id": "L05",
    "title": "꽃이 잠드는 큰박",
    "scene": "crescent-greenhouse",
    "ppq": 480,
    "meter": {
      "n": 6,
      "d": 8,
      "groupingEighths": [
        3,
        3
      ]
    },
    "quarterBpm": 90,
    "sourceIds": [
      "007",
      "032-3"
    ],
    "skillIds": [
      "dotted-rest",
      "compound-duple"
    ],
    "sequence": {
      "countInBars": 1,
      "listenRepeats": 2,
      "listenTailBars": 1,
      "practiceRepeats": 2,
      "playRepeats": 4,
      "outroBars": 1
    },
    "bars": [
      {
        "events": [
          {
            "id": "a",
            "at": 0,
            "ticks": 720,
            "kind": "rest",
            "notation": {
              "denominator": 4,
              "dots": 1
            }
          },
          {
            "id": "b",
            "at": 720,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "tap"
          },
          {
            "id": "c",
            "at": 960,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "D5",
            "midi": 74,
            "interaction": "tap"
          },
          {
            "id": "d",
            "at": 1200,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "E5",
            "midi": 76,
            "interaction": "tap"
          }
        ]
      },
      {
        "events": [
          {
            "id": "e",
            "at": 0,
            "ticks": 720,
            "kind": "note",
            "notation": {
              "denominator": 4,
              "dots": 1
            },
            "pitchName": "G5",
            "midi": 79,
            "interaction": "hold"
          },
          {
            "id": "f",
            "at": 720,
            "ticks": 720,
            "kind": "rest",
            "notation": {
              "denominator": 4,
              "dots": 1
            }
          }
        ]
      }
    ],
    "reviewState": "math_checked_art_audio_review_pending"
  },
  {
    "schemaVersion": 1,
    "id": "L06",
    "title": "둘씩 접히는 세 칸",
    "scene": "folding-room",
    "ppq": 480,
    "meter": {
      "n": 3,
      "d": 4,
      "groupingEighths": [
        2,
        2,
        2
      ]
    },
    "quarterBpm": 90,
    "sourceIds": [
      "032-3"
    ],
    "skillIds": [
      "simple-triple"
    ],
    "sequence": {
      "countInBars": 1,
      "listenRepeats": 2,
      "listenTailBars": 1,
      "practiceRepeats": 2,
      "playRepeats": 4,
      "outroBars": 1
    },
    "bars": [
      {
        "events": [
          {
            "id": "a",
            "at": 0,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "tap"
          },
          {
            "id": "b",
            "at": 240,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "tap"
          },
          {
            "id": "c",
            "at": 480,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "tap"
          },
          {
            "id": "d",
            "at": 720,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "tap"
          },
          {
            "id": "e",
            "at": 960,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "tap"
          },
          {
            "id": "f",
            "at": 1200,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "tap"
          }
        ]
      }
    ],
    "reviewState": "math_checked_art_audio_review_pending"
  },
  {
    "schemaVersion": 1,
    "id": "L07",
    "title": "셋씩 접히는 두 칸",
    "scene": "folding-room",
    "ppq": 480,
    "meter": {
      "n": 6,
      "d": 8,
      "groupingEighths": [
        3,
        3
      ]
    },
    "quarterBpm": 90,
    "sourceIds": [
      "032-3"
    ],
    "skillIds": [
      "compound-duple"
    ],
    "sequence": {
      "countInBars": 1,
      "listenRepeats": 2,
      "listenTailBars": 1,
      "practiceRepeats": 2,
      "playRepeats": 4,
      "outroBars": 1
    },
    "bars": [
      {
        "events": [
          {
            "id": "a",
            "at": 0,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "tap"
          },
          {
            "id": "b",
            "at": 240,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "tap"
          },
          {
            "id": "c",
            "at": 480,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "tap"
          },
          {
            "id": "d",
            "at": 720,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "tap"
          },
          {
            "id": "e",
            "at": 960,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "tap"
          },
          {
            "id": "f",
            "at": 1200,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "tap"
          }
        ]
      }
    ],
    "reviewState": "math_checked_art_audio_review_pending"
  },
  {
    "schemaVersion": 1,
    "id": "L08",
    "title": "느린 구름 편지",
    "scene": "cloud-post",
    "ppq": 480,
    "meter": {
      "n": 4,
      "d": 4,
      "groupingEighths": [
        2,
        2,
        2,
        2
      ]
    },
    "quarterBpm": 72,
    "sourceIds": [
      "004",
      "030-1"
    ],
    "skillIds": [
      "tempo"
    ],
    "sequence": {
      "countInBars": 1,
      "listenRepeats": 2,
      "listenTailBars": 1,
      "practiceRepeats": 2,
      "playRepeats": 4,
      "outroBars": 1
    },
    "bars": [
      {
        "events": [
          {
            "id": "a",
            "at": 0,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "tap"
          },
          {
            "id": "b",
            "at": 240,
            "ticks": 240,
            "kind": "rest",
            "notation": {
              "denominator": 8,
              "dots": 0
            }
          },
          {
            "id": "c",
            "at": 480,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "D5",
            "midi": 74,
            "interaction": "tap"
          },
          {
            "id": "d",
            "at": 720,
            "ticks": 240,
            "kind": "rest",
            "notation": {
              "denominator": 8,
              "dots": 0
            }
          },
          {
            "id": "e",
            "at": 960,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "E5",
            "midi": 76,
            "interaction": "tap"
          },
          {
            "id": "f",
            "at": 1200,
            "ticks": 240,
            "kind": "rest",
            "notation": {
              "denominator": 8,
              "dots": 0
            }
          },
          {
            "id": "g",
            "at": 1440,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "G5",
            "midi": 79,
            "interaction": "tap"
          },
          {
            "id": "h",
            "at": 1680,
            "ticks": 240,
            "kind": "rest",
            "notation": {
              "denominator": 8,
              "dots": 0
            }
          }
        ]
      }
    ],
    "reviewState": "math_checked_art_audio_review_pending"
  },
  {
    "schemaVersion": 1,
    "id": "L09",
    "title": "가벼운 구름 편지",
    "scene": "cloud-post",
    "ppq": 480,
    "meter": {
      "n": 4,
      "d": 4,
      "groupingEighths": [
        2,
        2,
        2,
        2
      ]
    },
    "quarterBpm": 108,
    "sourceIds": [
      "004",
      "030-1"
    ],
    "skillIds": [
      "tempo"
    ],
    "sequence": {
      "countInBars": 1,
      "listenRepeats": 2,
      "listenTailBars": 1,
      "practiceRepeats": 2,
      "playRepeats": 4,
      "outroBars": 1
    },
    "bars": [
      {
        "events": [
          {
            "id": "a",
            "at": 0,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "C5",
            "midi": 72,
            "interaction": "tap"
          },
          {
            "id": "b",
            "at": 240,
            "ticks": 240,
            "kind": "rest",
            "notation": {
              "denominator": 8,
              "dots": 0
            }
          },
          {
            "id": "c",
            "at": 480,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "D5",
            "midi": 74,
            "interaction": "tap"
          },
          {
            "id": "d",
            "at": 720,
            "ticks": 240,
            "kind": "rest",
            "notation": {
              "denominator": 8,
              "dots": 0
            }
          },
          {
            "id": "e",
            "at": 960,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "E5",
            "midi": 76,
            "interaction": "tap"
          },
          {
            "id": "f",
            "at": 1200,
            "ticks": 240,
            "kind": "rest",
            "notation": {
              "denominator": 8,
              "dots": 0
            }
          },
          {
            "id": "g",
            "at": 1440,
            "ticks": 240,
            "kind": "note",
            "notation": {
              "denominator": 8,
              "dots": 0
            },
            "pitchName": "G5",
            "midi": 79,
            "interaction": "tap"
          },
          {
            "id": "h",
            "at": 1680,
            "ticks": 240,
            "kind": "rest",
            "notation": {
              "denominator": 8,
              "dots": 0
            }
          }
        ]
      }
    ],
    "reviewState": "math_checked_art_audio_review_pending"
  }
]
```

## 부록 B. 실제 모바일 에셋 계약과 전체 카탈로그

경로는 모바일 ZIP을 펼친 `night_thread_mobile_runtime_v1/` 내부 콘텐츠 루트를 프로젝트 `public/assets/night-thread/`에 배치한 뒤의 상대 경로다. ZIP의 실제 최상위 이름을 먼저 확인하고 폴더 이름을 추측해 두 번 중첩하지 않는다. 런타임 manifest가 최종 기준이다. 아래 표는 파일 선택과 앵커 결정을 빠르게 확인하기 위한 정확한 사본이다.

### B1. 자산의 종류와 로드 정책

- 92개 논리 자산: 배경 4, 여울 6, 솜새 3, 꽃 원화 4인 WebP 17개; 오브젝트·UI·교육 SVG 75개
- PNG 폴백 17개는 같은 크기/앵커의 선택 대체본이다. SVG의 PNG 렌더는 이 런타임 팩에 없고 마스터 팩에 있다.
- 생성 원화 17개는 새 그림, SVG 75개는 정확한 geometry다. 리그·프레임 애니메이션·게임 코드·오디오 파일은 포함하지 않는다.
- 배경은1152×768,여울/꽃512×512,솜새 384×384. 투명 sprite 13개는 lossless WebP이며 같은 크기 기준 PNG와 RGBA/alpha 동일 검사가 수행됐다.
- 기본 도식 6개+advanced 4개는 결과/도움에서 하나씩 읽는다. 기본 정보에 tick 식이 필요한 경우에는 사용자가 고급 정보를 펼쳤을 때만 보여준다.
- 포즈 상태는 애니메이션 시간의 원천이 아니다. `render(audibleTime)`와 judge 상태에서 현재 키포즈를 선택한다.
- 소스 파일의 regeneration script는 개발 참고용이다. 에셋이 준비됐다는 이유로 다시 이미지 생성·재인코딩하지 않는다.

### B2. 92개 경로·크기·상태·앵커

`anchorPx`는 raster 캔버스 좌표, `anchors`는 SVG viewBox의 의미별 기준점이다. anchor를 임의로 가운데로 바꾸지 않는다. 빈 원의 hit는 중심이지만 내부 투명 공간은 유지한다.

| assetId | 경로 | 크기 | 상태 | 앵커 |
|---|---|---:|---|---|
| `scene_a_thread_bridge` | `backgrounds/scene_a_thread_bridge.webp` | 1152×768 | static | `[576.0,384.0]` |
| `scene_b_crescent_greenhouse` | `backgrounds/scene_b_crescent_greenhouse.webp` | 1152×768 | static | `[576.0,384.0]` |
| `scene_c_folding_room` | `backgrounds/scene_c_folding_room.webp` | 1152×768 | static | `[576.0,384.0]` |
| `scene_d_cloud_post_station` | `backgrounds/scene_d_cloud_post_station.webp` | 1152×768 | static | `[576.0,384.0]` |
| `character.yeoul.idle` | `characters/yeoul_idle.webp` | 512×512 | idle | `[273.5566,480.9697]` |
| `character.yeoul.prepare` | `characters/yeoul_prepare.webp` | 512×512 | prepare | `[273.5566,480.9697]` |
| `character.yeoul.release` | `characters/yeoul_release.webp` | 512×512 | release | `[273.5566,480.9697]` |
| `character.yeoul.press` | `characters/yeoul_press.webp` | 512×512 | press | `[273.5566,480.9697]` |
| `character.yeoul.hold` | `characters/yeoul_hold.webp` | 512×512 | hold | `[273.5566,480.9697]` |
| `character.yeoul.miss` | `characters/yeoul_miss.webp` | 512×512 | miss | `[273.5566,480.9697]` |
| `object.greenhouse.flower_closed` | `objects/flower_closed.webp` | 512×512 | closed | `[272.3317,477.7033]` |
| `object.greenhouse.flower_opening_2` | `objects/flower_opening_2.webp` | 512×512 | opening_2 | `[272.3317,477.7033]` |
| `object.greenhouse.flower_open` | `objects/flower_open.webp` | 512×512 | open | `[272.3317,477.7033]` |
| `object.greenhouse.flower_opening_1` | `objects/flower_opening_1.webp` | 512×512 | opening_1 | `[272.3317,477.7033]` |
| `somsae_count` | `characters/somsae_count.webp` | 384×384 | count | `[208.2297,350.622]` |
| `somsae_demo` | `characters/somsae_demo.webp` | 384×384 | demo | `[208.2297,357.0526]` |
| `somsae_encourage` | `characters/somsae_encourage.webp` | 384×384 | encourage | `[208.2297,350.622]` |
| `bridge_onset` | `objects/bridge_onset.svg` | 96×96 | ready | `{"hit":[48,48]}` |
| `bridge_release` | `objects/bridge_release.svg` | 96×96 | ready | `{"hit":[48,48]}` |
| `bridge_tie_knot` | `objects/bridge_tie_knot.svg` | 96×96 | continuous | `{"boundary":[48,48]}` |
| `bridge_onset_hc` | `objects/bridge_onset_hc.svg` | 96×96 | high-contrast | `{"hit":[48,48]}` |
| `bridge_release_hc` | `objects/bridge_release_hc.svg` | 96×96 | high-contrast | `{"hit":[48,48]}` |
| `bridge_tie_knot_hc` | `objects/bridge_tie_knot_hc.svg` | 96×96 | high-contrast | `{"boundary":[48,48]}` |
| `bridge_bar_pillar` | `objects/bridge_bar_pillar.svg` | 128×320 | behind-ribbon | `{"barline":[64,160],"base":[64,304]}` |
| `bridge_needle_eye` | `objects/bridge_needle_eye.svg` | 256×256 | open | `{"hit":[128,112],"tip":[128,246]}` |
| `bridge_spool` | `objects/bridge_spool.svg` | 256×256 | idle | `{"ribbonExit":[198,124],"base":[128,228]}` |
| `bridge_ribbon_tile` | `objects/bridge_ribbon_tile.svg` | 128×64 | continuous | `{"left":[0,32],"right":[128,32]}` |
| `bridge_ribbon_broken` | `objects/bridge_ribbon_broken.svg` | 256×80 | miss | `{"break":[120,41],"left":[4,41],"right":[250,41]}` |
| `bridge_lantern_idle` | `objects/bridge_lantern_idle.svg` | 128×160 | idle | `{"lightCenter":[64,86],"hang":[64,12],"base":[64,140]}` |
| `bridge_lantern_active` | `objects/bridge_lantern_active.svg` | 128×160 | active | `{"lightCenter":[64,86],"hang":[64,12],"base":[64,140]}` |
| `greenhouse_container_2u` | `objects/greenhouse_container_2u.svg` | 176×184 | filled | `{"base":[88.0,166],"fillOrigin":[24,56]}` |
| `greenhouse_container_1u` | `objects/greenhouse_container_1u.svg` | 112×184 | filled | `{"base":[56.0,166],"fillOrigin":[24,56]}` |
| `greenhouse_time_strip_3u` | `objects/greenhouse_time_strip_3u.svg` | 216×96 | hold | `{"start":[12,44],"release":[204,44]}` |
| `greenhouse_rest_cover` | `objects/greenhouse_rest_cover.svg` | 256×256 | closed | `{"target":[128,115],"base":[128,228]}` |
| `greenhouse_dew_idle` | `objects/greenhouse_dew_idle.svg` | 96×96 | idle | `{"center":[48,48]}` |
| `greenhouse_dew_active` | `objects/greenhouse_dew_active.svg` | 96×96 | active | `{"center":[48,48]}` |
| `greenhouse_flower_0` | `objects/greenhouse_flower_0.svg` | 256×256 | open-0-of-3 | `{"target":[128,149],"base":[128,239]}` |
| `greenhouse_flower_1` | `objects/greenhouse_flower_1.svg` | 256×256 | open-1-of-3 | `{"target":[128,149],"base":[128,239]}` |
| `greenhouse_flower_2` | `objects/greenhouse_flower_2.svg` | 256×256 | open-2-of-3 | `{"target":[128,149],"base":[128,239]}` |
| `greenhouse_flower_3` | `objects/greenhouse_flower_3.svg` | 256×256 | open-3-of-3 | `{"target":[128,149],"base":[128,239]}` |
| `room_tile_idle` | `objects/room_tile_idle.svg` | 96×96 | idle | `{"center":[48,44],"left":[8,44],"right":[88,44]}` |
| `room_tile_active` | `objects/room_tile_active.svg` | 96×96 | active | `{"center":[48,44],"left":[8,44],"right":[88,44]}` |
| `room_hinge_2u` | `objects/room_hinge_2u.svg` | 184×88 | group-2 | `{"left":[12,58],"right":[172,58],"hinge":[92.0,52]}` |
| `room_hinge_3u` | `objects/room_hinge_3u.svg` | 264×88 | group-3 | `{"left":[12,58],"right":[252,58],"hinge":[132.0,52]}` |
| `room_brackets_222` | `objects/room_brackets_222.svg` | 512×104 | grouped | `{"floorOrigin":[16,88]}` |
| `room_floor_222` | `objects/room_floor_222.svg` | 512×160 | grouped | `{"floorOrigin":[16,78]}` |
| `room_brackets_33` | `objects/room_brackets_33.svg` | 512×104 | grouped | `{"floorOrigin":[16,88]}` |
| `room_floor_33` | `objects/room_floor_33.svg` | 512×160 | grouped | `{"floorOrigin":[16,78]}` |
| `post_letter_idle` | `objects/post_letter_idle.svg` | 256×200 | idle | `{"hit":[128,106]}` |
| `post_letter_folded` | `objects/post_letter_folded.svg` | 256×200 | folded | `{"hit":[128,106]}` |
| `post_letter_success_star` | `objects/post_letter_success_star.svg` | 256×200 | success | `{"center":[128,101]}` |
| `post_counter` | `objects/post_counter.svg` | 384×256 | idle | `{"window":[192,105],"counterTop":[192,158],"base":[192,233]}` |
| `icon_press` | `ui/icon_press.svg` | 96×96 | default | `{"center":[48,48]}` |
| `icon_press_hc` | `ui/icon_press_hc.svg` | 96×96 | high-contrast | `{"center":[48,48]}` |
| `icon_hold` | `ui/icon_hold.svg` | 96×96 | default | `{"center":[48,48]}` |
| `icon_hold_hc` | `ui/icon_hold_hc.svg` | 96×96 | high-contrast | `{"center":[48,48]}` |
| `icon_release` | `ui/icon_release.svg` | 96×96 | default | `{"center":[48,48]}` |
| `icon_release_hc` | `ui/icon_release_hc.svg` | 96×96 | high-contrast | `{"center":[48,48]}` |
| `icon_wait` | `ui/icon_wait.svg` | 96×96 | default | `{"center":[48,48]}` |
| `icon_wait_hc` | `ui/icon_wait_hc.svg` | 96×96 | high-contrast | `{"center":[48,48]}` |
| `icon_sound` | `ui/icon_sound.svg` | 96×96 | default | `{"center":[48,48]}` |
| `icon_sound_hc` | `ui/icon_sound_hc.svg` | 96×96 | high-contrast | `{"center":[48,48]}` |
| `icon_pause` | `ui/icon_pause.svg` | 96×96 | default | `{"center":[48,48]}` |
| `icon_pause_hc` | `ui/icon_pause_hc.svg` | 96×96 | high-contrast | `{"center":[48,48]}` |
| `icon_resume` | `ui/icon_resume.svg` | 96×96 | default | `{"center":[48,48]}` |
| `icon_resume_hc` | `ui/icon_resume_hc.svg` | 96×96 | high-contrast | `{"center":[48,48]}` |
| `icon_retry` | `ui/icon_retry.svg` | 96×96 | default | `{"center":[48,48]}` |
| `icon_retry_hc` | `ui/icon_retry_hc.svg` | 96×96 | high-contrast | `{"center":[48,48]}` |
| `icon_home` | `ui/icon_home.svg` | 96×96 | default | `{"center":[48,48]}` |
| `icon_home_hc` | `ui/icon_home_hc.svg` | 96×96 | high-contrast | `{"center":[48,48]}` |
| `icon_help` | `ui/icon_help.svg` | 96×96 | default | `{"center":[48,48]}` |
| `icon_help_hc` | `ui/icon_help_hc.svg` | 96×96 | high-contrast | `{"center":[48,48]}` |
| `icon_contrast` | `ui/icon_contrast.svg` | 96×96 | default | `{"center":[48,48]}` |
| `icon_contrast_hc` | `ui/icon_contrast_hc.svg` | 96×96 | high-contrast | `{"center":[48,48]}` |
| `icon_reduced_motion` | `ui/icon_reduced_motion.svg` | 96×96 | default | `{"center":[48,48]}` |
| `icon_reduced_motion_hc` | `ui/icon_reduced_motion_hc.svg` | 96×96 | high-contrast | `{"center":[48,48]}` |
| `button_normal` | `ui/button_normal.svg` | 384×112 | normal | `{"labelCenter":[192,48]}` |
| `button_pressed` | `ui/button_pressed.svg` | 384×112 | pressed | `{"labelCenter":[192,55]}` |
| `button_focus` | `ui/button_focus.svg` | 384×112 | focus | `{"labelCenter":[192,48]}` |
| `button_disabled` | `ui/button_disabled.svg` | 384×112 | disabled | `{"labelCenter":[192,48]}` |
| `feedback_knot_success` | `ui/feedback_knot_success.svg` | 128×128 | success | `{"center":[64,64]}` |
| `feedback_knot_miss` | `ui/feedback_knot_miss.svg` | 128×128 | miss | `{"center":[64,64]}` |
| `education_duration` | `education/education_duration.svg` | 1024×640 | review-pending | `{"contentTopLeft":[100,100]}` |
| `education_duration_advanced` | `education/education_duration_advanced.svg` | 1024×640 | review-pending | `{"contentTopLeft":[100,100]}` |
| `education_tie` | `education/education_tie.svg` | 1024×640 | review-pending | `{"contentTopLeft":[100,100]}` |
| `education_tie_advanced` | `education/education_tie_advanced.svg` | 1024×640 | review-pending | `{"contentTopLeft":[100,100]}` |
| `education_dot` | `education/education_dot.svg` | 1024×640 | review-pending | `{"contentTopLeft":[100,100]}` |
| `education_dot_advanced` | `education/education_dot_advanced.svg` | 1024×640 | review-pending | `{"contentTopLeft":[100,100]}` |
| `education_dotted_rest` | `education/education_dotted_rest.svg` | 1024×640 | review-pending | `{"contentTopLeft":[100,100]}` |
| `education_dotted_rest_advanced` | `education/education_dotted_rest_advanced.svg` | 1024×640 | review-pending | `{"contentTopLeft":[100,100]}` |
| `education_meter` | `education/education_meter.svg` | 1024×640 | review-pending | `{"contentTopLeft":[100,100]}` |
| `education_tempo` | `education/education_tempo.svg` | 1024×640 | review-pending | `{"contentTopLeft":[100,100]}` |

### B3. PNG 폴백 경로

같은 논리 asset의 WebP가 브라우저에서 decode 불가일 때만 선택한다. unsupported와 일시 네트워크 오류는 구분하되 끝없이 재시도하지 않는다. 주 경로/폴백 모두 실패하면 count-in 전 오류 화면.

```json
{
  "fixtureKind": "runtimeRasterFallbacks",
  "entries": [
    {
      "assetId": "scene_a_thread_bridge",
      "primaryPath": "backgrounds/scene_a_thread_bridge.webp",
      "pngFallbackPath": "png_fallbacks/backgrounds/scene_a_thread_bridge.png",
      "width": 1152,
      "height": 768,
      "anchorPx": [
        576.0,
        384.0
      ]
    },
    {
      "assetId": "scene_b_crescent_greenhouse",
      "primaryPath": "backgrounds/scene_b_crescent_greenhouse.webp",
      "pngFallbackPath": "png_fallbacks/backgrounds/scene_b_crescent_greenhouse.png",
      "width": 1152,
      "height": 768,
      "anchorPx": [
        576.0,
        384.0
      ]
    },
    {
      "assetId": "scene_c_folding_room",
      "primaryPath": "backgrounds/scene_c_folding_room.webp",
      "pngFallbackPath": "png_fallbacks/backgrounds/scene_c_folding_room.png",
      "width": 1152,
      "height": 768,
      "anchorPx": [
        576.0,
        384.0
      ]
    },
    {
      "assetId": "scene_d_cloud_post_station",
      "primaryPath": "backgrounds/scene_d_cloud_post_station.webp",
      "pngFallbackPath": "png_fallbacks/backgrounds/scene_d_cloud_post_station.png",
      "width": 1152,
      "height": 768,
      "anchorPx": [
        576.0,
        384.0
      ]
    },
    {
      "assetId": "character.yeoul.idle",
      "primaryPath": "characters/yeoul_idle.webp",
      "pngFallbackPath": "png_fallbacks/characters/yeoul_idle.png",
      "width": 512,
      "height": 512,
      "anchorPx": [
        273.5566,
        480.9697
      ]
    },
    {
      "assetId": "character.yeoul.prepare",
      "primaryPath": "characters/yeoul_prepare.webp",
      "pngFallbackPath": "png_fallbacks/characters/yeoul_prepare.png",
      "width": 512,
      "height": 512,
      "anchorPx": [
        273.5566,
        480.9697
      ]
    },
    {
      "assetId": "character.yeoul.release",
      "primaryPath": "characters/yeoul_release.webp",
      "pngFallbackPath": "png_fallbacks/characters/yeoul_release.png",
      "width": 512,
      "height": 512,
      "anchorPx": [
        273.5566,
        480.9697
      ]
    },
    {
      "assetId": "character.yeoul.press",
      "primaryPath": "characters/yeoul_press.webp",
      "pngFallbackPath": "png_fallbacks/characters/yeoul_press.png",
      "width": 512,
      "height": 512,
      "anchorPx": [
        273.5566,
        480.9697
      ]
    },
    {
      "assetId": "character.yeoul.hold",
      "primaryPath": "characters/yeoul_hold.webp",
      "pngFallbackPath": "png_fallbacks/characters/yeoul_hold.png",
      "width": 512,
      "height": 512,
      "anchorPx": [
        273.5566,
        480.9697
      ]
    },
    {
      "assetId": "character.yeoul.miss",
      "primaryPath": "characters/yeoul_miss.webp",
      "pngFallbackPath": "png_fallbacks/characters/yeoul_miss.png",
      "width": 512,
      "height": 512,
      "anchorPx": [
        273.5566,
        480.9697
      ]
    },
    {
      "assetId": "object.greenhouse.flower_closed",
      "primaryPath": "objects/flower_closed.webp",
      "pngFallbackPath": "png_fallbacks/objects/flower_closed.png",
      "width": 512,
      "height": 512,
      "anchorPx": [
        272.3317,
        477.7033
      ]
    },
    {
      "assetId": "object.greenhouse.flower_opening_2",
      "primaryPath": "objects/flower_opening_2.webp",
      "pngFallbackPath": "png_fallbacks/objects/flower_opening_2.png",
      "width": 512,
      "height": 512,
      "anchorPx": [
        272.3317,
        477.7033
      ]
    },
    {
      "assetId": "object.greenhouse.flower_open",
      "primaryPath": "objects/flower_open.webp",
      "pngFallbackPath": "png_fallbacks/objects/flower_open.png",
      "width": 512,
      "height": 512,
      "anchorPx": [
        272.3317,
        477.7033
      ]
    },
    {
      "assetId": "object.greenhouse.flower_opening_1",
      "primaryPath": "objects/flower_opening_1.webp",
      "pngFallbackPath": "png_fallbacks/objects/flower_opening_1.png",
      "width": 512,
      "height": 512,
      "anchorPx": [
        272.3317,
        477.7033
      ]
    },
    {
      "assetId": "somsae_count",
      "primaryPath": "characters/somsae_count.webp",
      "pngFallbackPath": "png_fallbacks/characters/somsae_count.png",
      "width": 384,
      "height": 384,
      "anchorPx": [
        208.2297,
        350.622
      ]
    },
    {
      "assetId": "somsae_demo",
      "primaryPath": "characters/somsae_demo.webp",
      "pngFallbackPath": "png_fallbacks/characters/somsae_demo.png",
      "width": 384,
      "height": 384,
      "anchorPx": [
        208.2297,
        357.0526
      ]
    },
    {
      "assetId": "somsae_encourage",
      "primaryPath": "characters/somsae_encourage.webp",
      "pngFallbackPath": "png_fallbacks/characters/somsae_encourage.png",
      "width": 384,
      "height": 384,
      "anchorPx": [
        208.2297,
        350.622
      ]
    }
  ]
}
```

### B4. 상태별 구체적 결합

| 장면/상태 | 선택 자산과 행동 | 금지 |
|---|---|---|
| 실빛다리 준비 | bridge_spool의 ribbonExit→needle_eye.hit, onset.hit가 공통 목표로 접근 | 그림 픽셀 충돌로 점수 판정 |
| 실빛다리 hold | ribbon_tile 반복, yeoul_hold, tie_knot는 표시만 | tie_knot에서 press/flash/click |
| 실빛다리 release | bridge_release.hit, yeoul_release, 빈 원 내부를 마스크 | 리본이 빈 원을 채우게 합성 |
| L03 마디선 | bridge_bar_pillar를 리본 아래, barline anchor를 정확한 tick 1920 cue에 연결 | 마디선에서 gate 끊기 |
| 온실 hold | flower_closed→opening_1→opening_2→open; time_strip의 같은 3칸 | 꽃 그림 면적·개수를 길이 정답으로 사용 |
| 온실 저용량 대안 | greenhouse_flower_0/1/2/3과 동일 논리 상태 매핑 | 원화 4+벡터 4를 8단계로 합침 |
| 온실 rest | rest_cover와 icon_wait, 작은 이슬/반주는 계속 | pause 그림·화면 정지·전체 무음 |
| 방 3/4 | room_floor_222, brackets_222, hinge_2u 세 묶음 | 타일 수·폭·8분 간격 변경 |
| 방 6/8 | room_floor_33, brackets_33, hinge_3u 두 묶음 | 압력으로 강세 채점 |
| 우체역 hit | letter_idle→folded→success_star, counter.window를 기준으로 | 성공으로 다음 편지 시각 당김 |
| 공통 miss | yeoul_miss, feedback_knot_miss, 짧은 DOM 문구 | 다음 박 늦추기·목숨·큰 비난음 |
| 공통 도움 | somsae_count/demo/encourage | 미스마다 화면 중심을 크게 가림 |

초기 포즈 시간 제안: prepare는 onset 0.25q 전, press는 유효 down 직후 짧게, hold는 ACTIVE 전체, release는 up 뒤 약 120ms, miss는 약 160ms. 이 값은 미술 보간 제안이며 음악 gate나 판정창이 아니다. 예고 2q 밖에 있던 끝 빈 원도 onset부터는 전체 길이를 알 수 있도록 고정 게이지/리본 축약으로 표시한다. 긴 리본이 화면 밖으로 나가 release를 숨기면 실패다.

### B5. 장면별 실제 파일 bytes와 예상 decoded 메모리

단위 MB는 10진, MiB는 2진이다. 예상 decoded 값은 `width*height*4`와 SVG 원 viewBox 1배 raster 합이며 실제 앱/GPU 사용량이 아니다. 결과 도식 1개 추가는 1024×640×4=2,621,440B다. mipmap·backbuffer·decode 임시·CPU/GPU 이중 복사·오디오·앱 코드는 별도다.

| 프로필 | 기본 이미지 bytes | PNG 대체+SVG bytes | decoded 추정 B | 도식 1장 포함 B | 이미지+오디오 2MB 예산 B |
|---|---:|---:|---:|---:|---:|
| `thread-bridge` | 1,021,110 | 2,526,858 | 14,491,648 | 17,113,088 | 3,021,110 |
| `crescent-greenhouse` | 1,564,633 | 3,384,578 | 18,128,896 | 20,750,336 | 3,564,633 |
| `folding-room` | 989,896 | 2,475,674 | 14,616,576 | 17,238,016 | 2,989,896 |
| `cloud-post` | 1,022,222 | 2,704,965 | 14,311,424 | 16,932,864 | 3,022,222 |

초기 8MB 통과 여부는 앱 전체 네트워크 계측으로 확인한다. 배경은 현재 1장, 주요 오브젝트 12개, particle 24개, voice 8개가 초기 예산이다. 600ms 전환 중 두 장면을 동시에 보유한다면 위 표보다 메모리가 크므로 별도 검사한다. Texture unload 이후에도 브라우저 메모리 회수 시점이 즉시라고 단정하지 않는다.

## 부록 C. 독립 계산한 음악·컴파일·phase 오라클

### C1. 9레벨 golden 결과

이것은 정답용 snapshot이다. 런타임 compiler가 다시 만들어 대조한다. `id`는 fixture 내부 식별자이고 실제 occurrenceId에는 phase/반복/epoch를 더한다. tick은 모티프 첫 위치 기준이며 카운트인 길이를 포함하지 않는다. fraction은 [분자,분모]이고 microsecond는 반올림 표시값이다. 부동소수 3.333333을 원래 길이로 다시 입력하지 않는다.

```json
{
  "fixtureKind": "compiledLevelGolden",
  "ppq": 480,
  "levels": [
    {
      "levelId": "L01",
      "barTicks": 1920,
      "motifTicks": 1920,
      "motifSecondsFraction": [
        10,
        3
      ],
      "scoreDenominatorPerMotif": 4,
      "scoreDenominatorPlay4": 16,
      "onsetMicrosecondsFromMotifStart": [
        0,
        1666667
      ],
      "bigBeatTicksPerBar": [
        0,
        480,
        960,
        1440
      ],
      "gates": [
        {
          "id": "L01:a",
          "onsetTick": 0,
          "endTick": 480,
          "interaction": "hold",
          "pitchMidi": 72,
          "sourceNotationIds": [
            "a"
          ],
          "tieBoundaryTicks": []
        },
        {
          "id": "L01:c",
          "onsetTick": 960,
          "endTick": 1920,
          "interaction": "hold",
          "pitchMidi": 72,
          "sourceNotationIds": [
            "c"
          ],
          "tieBoundaryTicks": []
        }
      ],
      "rests": [
        {
          "sourceNotationId": "b",
          "startTick": 480,
          "endTick": 960
        }
      ]
    },
    {
      "levelId": "L02",
      "barTicks": 1920,
      "motifTicks": 1920,
      "motifSecondsFraction": [
        10,
        3
      ],
      "scoreDenominatorPerMotif": 3,
      "scoreDenominatorPlay4": 12,
      "onsetMicrosecondsFromMotifStart": [
        0,
        2500000
      ],
      "bigBeatTicksPerBar": [
        0,
        480,
        960,
        1440
      ],
      "gates": [
        {
          "id": "L02:a",
          "onsetTick": 0,
          "endTick": 960,
          "interaction": "hold",
          "pitchMidi": 72,
          "sourceNotationIds": [
            "a",
            "b"
          ],
          "tieBoundaryTicks": [
            480
          ]
        },
        {
          "id": "L02:d",
          "onsetTick": 1440,
          "endTick": 1680,
          "interaction": "tap",
          "pitchMidi": 76,
          "sourceNotationIds": [
            "d"
          ],
          "tieBoundaryTicks": []
        }
      ],
      "rests": [
        {
          "sourceNotationId": "c",
          "startTick": 960,
          "endTick": 1440
        },
        {
          "sourceNotationId": "e",
          "startTick": 1680,
          "endTick": 1920
        }
      ]
    },
    {
      "levelId": "L03",
      "barTicks": 1920,
      "motifTicks": 3840,
      "motifSecondsFraction": [
        20,
        3
      ],
      "scoreDenominatorPerMotif": 4,
      "scoreDenominatorPlay4": 16,
      "onsetMicrosecondsFromMotifStart": [
        2500000,
        5833333
      ],
      "bigBeatTicksPerBar": [
        0,
        480,
        960,
        1440
      ],
      "gates": [
        {
          "id": "L03:c",
          "onsetTick": 1440,
          "endTick": 2880,
          "interaction": "hold",
          "pitchMidi": 72,
          "sourceNotationIds": [
            "c",
            "d"
          ],
          "tieBoundaryTicks": [
            1920
          ]
        },
        {
          "id": "L03:f",
          "onsetTick": 3360,
          "endTick": 3840,
          "interaction": "hold",
          "pitchMidi": 76,
          "sourceNotationIds": [
            "f"
          ],
          "tieBoundaryTicks": []
        }
      ],
      "rests": [
        {
          "sourceNotationId": "a",
          "startTick": 0,
          "endTick": 960
        },
        {
          "sourceNotationId": "b",
          "startTick": 960,
          "endTick": 1440
        },
        {
          "sourceNotationId": "e",
          "startTick": 2880,
          "endTick": 3360
        }
      ]
    },
    {
      "levelId": "L04",
      "barTicks": 1920,
      "motifTicks": 1920,
      "motifSecondsFraction": [
        3,
        1
      ],
      "scoreDenominatorPerMotif": 4,
      "scoreDenominatorPlay4": 16,
      "onsetMicrosecondsFromMotifStart": [
        0,
        1500000
      ],
      "bigBeatTicksPerBar": [
        0,
        480,
        960,
        1440
      ],
      "gates": [
        {
          "id": "L04:a",
          "onsetTick": 0,
          "endTick": 720,
          "interaction": "hold",
          "pitchMidi": 72,
          "sourceNotationIds": [
            "a"
          ],
          "tieBoundaryTicks": []
        },
        {
          "id": "L04:c",
          "onsetTick": 960,
          "endTick": 1680,
          "interaction": "hold",
          "pitchMidi": 76,
          "sourceNotationIds": [
            "c"
          ],
          "tieBoundaryTicks": []
        }
      ],
      "rests": [
        {
          "sourceNotationId": "b",
          "startTick": 720,
          "endTick": 960
        },
        {
          "sourceNotationId": "d",
          "startTick": 1680,
          "endTick": 1920
        }
      ]
    },
    {
      "levelId": "L05",
      "barTicks": 1440,
      "motifTicks": 2880,
      "motifSecondsFraction": [
        4,
        1
      ],
      "scoreDenominatorPerMotif": 5,
      "scoreDenominatorPlay4": 20,
      "onsetMicrosecondsFromMotifStart": [
        1000000,
        1333333,
        1666667,
        2000000
      ],
      "bigBeatTicksPerBar": [
        0,
        720
      ],
      "gates": [
        {
          "id": "L05:b",
          "onsetTick": 720,
          "endTick": 960,
          "interaction": "tap",
          "pitchMidi": 72,
          "sourceNotationIds": [
            "b"
          ],
          "tieBoundaryTicks": []
        },
        {
          "id": "L05:c",
          "onsetTick": 960,
          "endTick": 1200,
          "interaction": "tap",
          "pitchMidi": 74,
          "sourceNotationIds": [
            "c"
          ],
          "tieBoundaryTicks": []
        },
        {
          "id": "L05:d",
          "onsetTick": 1200,
          "endTick": 1440,
          "interaction": "tap",
          "pitchMidi": 76,
          "sourceNotationIds": [
            "d"
          ],
          "tieBoundaryTicks": []
        },
        {
          "id": "L05:e",
          "onsetTick": 1440,
          "endTick": 2160,
          "interaction": "hold",
          "pitchMidi": 79,
          "sourceNotationIds": [
            "e"
          ],
          "tieBoundaryTicks": []
        }
      ],
      "rests": [
        {
          "sourceNotationId": "a",
          "startTick": 0,
          "endTick": 720
        },
        {
          "sourceNotationId": "f",
          "startTick": 2160,
          "endTick": 2880
        }
      ]
    },
    {
      "levelId": "L06",
      "barTicks": 1440,
      "motifTicks": 1440,
      "motifSecondsFraction": [
        2,
        1
      ],
      "scoreDenominatorPerMotif": 6,
      "scoreDenominatorPlay4": 24,
      "onsetMicrosecondsFromMotifStart": [
        0,
        333333,
        666667,
        1000000,
        1333333,
        1666667
      ],
      "bigBeatTicksPerBar": [
        0,
        480,
        960
      ],
      "gates": [
        {
          "id": "L06:a",
          "onsetTick": 0,
          "endTick": 240,
          "interaction": "tap",
          "pitchMidi": 72,
          "sourceNotationIds": [
            "a"
          ],
          "tieBoundaryTicks": []
        },
        {
          "id": "L06:b",
          "onsetTick": 240,
          "endTick": 480,
          "interaction": "tap",
          "pitchMidi": 72,
          "sourceNotationIds": [
            "b"
          ],
          "tieBoundaryTicks": []
        },
        {
          "id": "L06:c",
          "onsetTick": 480,
          "endTick": 720,
          "interaction": "tap",
          "pitchMidi": 72,
          "sourceNotationIds": [
            "c"
          ],
          "tieBoundaryTicks": []
        },
        {
          "id": "L06:d",
          "onsetTick": 720,
          "endTick": 960,
          "interaction": "tap",
          "pitchMidi": 72,
          "sourceNotationIds": [
            "d"
          ],
          "tieBoundaryTicks": []
        },
        {
          "id": "L06:e",
          "onsetTick": 960,
          "endTick": 1200,
          "interaction": "tap",
          "pitchMidi": 72,
          "sourceNotationIds": [
            "e"
          ],
          "tieBoundaryTicks": []
        },
        {
          "id": "L06:f",
          "onsetTick": 1200,
          "endTick": 1440,
          "interaction": "tap",
          "pitchMidi": 72,
          "sourceNotationIds": [
            "f"
          ],
          "tieBoundaryTicks": []
        }
      ],
      "rests": []
    },
    {
      "levelId": "L07",
      "barTicks": 1440,
      "motifTicks": 1440,
      "motifSecondsFraction": [
        2,
        1
      ],
      "scoreDenominatorPerMotif": 6,
      "scoreDenominatorPlay4": 24,
      "onsetMicrosecondsFromMotifStart": [
        0,
        333333,
        666667,
        1000000,
        1333333,
        1666667
      ],
      "bigBeatTicksPerBar": [
        0,
        720
      ],
      "gates": [
        {
          "id": "L07:a",
          "onsetTick": 0,
          "endTick": 240,
          "interaction": "tap",
          "pitchMidi": 72,
          "sourceNotationIds": [
            "a"
          ],
          "tieBoundaryTicks": []
        },
        {
          "id": "L07:b",
          "onsetTick": 240,
          "endTick": 480,
          "interaction": "tap",
          "pitchMidi": 72,
          "sourceNotationIds": [
            "b"
          ],
          "tieBoundaryTicks": []
        },
        {
          "id": "L07:c",
          "onsetTick": 480,
          "endTick": 720,
          "interaction": "tap",
          "pitchMidi": 72,
          "sourceNotationIds": [
            "c"
          ],
          "tieBoundaryTicks": []
        },
        {
          "id": "L07:d",
          "onsetTick": 720,
          "endTick": 960,
          "interaction": "tap",
          "pitchMidi": 72,
          "sourceNotationIds": [
            "d"
          ],
          "tieBoundaryTicks": []
        },
        {
          "id": "L07:e",
          "onsetTick": 960,
          "endTick": 1200,
          "interaction": "tap",
          "pitchMidi": 72,
          "sourceNotationIds": [
            "e"
          ],
          "tieBoundaryTicks": []
        },
        {
          "id": "L07:f",
          "onsetTick": 1200,
          "endTick": 1440,
          "interaction": "tap",
          "pitchMidi": 72,
          "sourceNotationIds": [
            "f"
          ],
          "tieBoundaryTicks": []
        }
      ],
      "rests": []
    },
    {
      "levelId": "L08",
      "barTicks": 1920,
      "motifTicks": 1920,
      "motifSecondsFraction": [
        10,
        3
      ],
      "scoreDenominatorPerMotif": 4,
      "scoreDenominatorPlay4": 16,
      "onsetMicrosecondsFromMotifStart": [
        0,
        833333,
        1666667,
        2500000
      ],
      "bigBeatTicksPerBar": [
        0,
        480,
        960,
        1440
      ],
      "gates": [
        {
          "id": "L08:a",
          "onsetTick": 0,
          "endTick": 240,
          "interaction": "tap",
          "pitchMidi": 72,
          "sourceNotationIds": [
            "a"
          ],
          "tieBoundaryTicks": []
        },
        {
          "id": "L08:c",
          "onsetTick": 480,
          "endTick": 720,
          "interaction": "tap",
          "pitchMidi": 74,
          "sourceNotationIds": [
            "c"
          ],
          "tieBoundaryTicks": []
        },
        {
          "id": "L08:e",
          "onsetTick": 960,
          "endTick": 1200,
          "interaction": "tap",
          "pitchMidi": 76,
          "sourceNotationIds": [
            "e"
          ],
          "tieBoundaryTicks": []
        },
        {
          "id": "L08:g",
          "onsetTick": 1440,
          "endTick": 1680,
          "interaction": "tap",
          "pitchMidi": 79,
          "sourceNotationIds": [
            "g"
          ],
          "tieBoundaryTicks": []
        }
      ],
      "rests": [
        {
          "sourceNotationId": "b",
          "startTick": 240,
          "endTick": 480
        },
        {
          "sourceNotationId": "d",
          "startTick": 720,
          "endTick": 960
        },
        {
          "sourceNotationId": "f",
          "startTick": 1200,
          "endTick": 1440
        },
        {
          "sourceNotationId": "h",
          "startTick": 1680,
          "endTick": 1920
        }
      ]
    },
    {
      "levelId": "L09",
      "barTicks": 1920,
      "motifTicks": 1920,
      "motifSecondsFraction": [
        20,
        9
      ],
      "scoreDenominatorPerMotif": 4,
      "scoreDenominatorPlay4": 16,
      "onsetMicrosecondsFromMotifStart": [
        0,
        555556,
        1111111,
        1666667
      ],
      "bigBeatTicksPerBar": [
        0,
        480,
        960,
        1440
      ],
      "gates": [
        {
          "id": "L09:a",
          "onsetTick": 0,
          "endTick": 240,
          "interaction": "tap",
          "pitchMidi": 72,
          "sourceNotationIds": [
            "a"
          ],
          "tieBoundaryTicks": []
        },
        {
          "id": "L09:c",
          "onsetTick": 480,
          "endTick": 720,
          "interaction": "tap",
          "pitchMidi": 74,
          "sourceNotationIds": [
            "c"
          ],
          "tieBoundaryTicks": []
        },
        {
          "id": "L09:e",
          "onsetTick": 960,
          "endTick": 1200,
          "interaction": "tap",
          "pitchMidi": 76,
          "sourceNotationIds": [
            "e"
          ],
          "tieBoundaryTicks": []
        },
        {
          "id": "L09:g",
          "onsetTick": 1440,
          "endTick": 1680,
          "interaction": "tap",
          "pitchMidi": 79,
          "sourceNotationIds": [
            "g"
          ],
          "tieBoundaryTicks": []
        }
      ],
      "rests": [
        {
          "sourceNotationId": "b",
          "startTick": 240,
          "endTick": 480
        },
        {
          "sourceNotationId": "d",
          "startTick": 720,
          "endTick": 960
        },
        {
          "sourceNotationId": "f",
          "startTick": 1200,
          "endTick": 1440
        },
        {
          "sourceNotationId": "h",
          "startTick": 1680,
          "endTick": 1920
        }
      ]
    }
  ]
}
```

### C2. L02 PLAY4회 완전 확장

`playOriginAudioSec`는 카운트인이 끝나고 첫 실제 음이 오는 시각이다. 여기에 onsetTick을 변환해 더한다. 한 마디 카운트인 시작은 playOrigin−10/3초다. 아래의 origin 10초는 테스트용 값이다.

```json
{
  "fixtureKind": "expandedPlay",
  "levelId": "L02",
  "phase": "PLAY",
  "repetitions": 4,
  "playOriginAudioSec": 10,
  "countInTicks": 1920,
  "playTicks": 7680,
  "playSecondsFraction": [
    40,
    3
  ],
  "N": 12,
  "expectedGuideLeadAttacksInPlay": 0,
  "expectedPlayerAttacksForPerfectInput": 8,
  "expectations": [
    {
      "occurrenceId": "L02:PLAY:0:a",
      "phraseId": "L02:PLAY:0",
      "onsetTick": 0,
      "endTick": 960,
      "interaction": "hold",
      "pitchMidi": 72,
      "tieBoundaryTicks": [
        480
      ]
    },
    {
      "occurrenceId": "L02:PLAY:0:d",
      "phraseId": "L02:PLAY:0",
      "onsetTick": 1440,
      "endTick": 1680,
      "interaction": "tap",
      "pitchMidi": 76,
      "tieBoundaryTicks": []
    },
    {
      "occurrenceId": "L02:PLAY:1:a",
      "phraseId": "L02:PLAY:1",
      "onsetTick": 1920,
      "endTick": 2880,
      "interaction": "hold",
      "pitchMidi": 72,
      "tieBoundaryTicks": [
        2400
      ]
    },
    {
      "occurrenceId": "L02:PLAY:1:d",
      "phraseId": "L02:PLAY:1",
      "onsetTick": 3360,
      "endTick": 3600,
      "interaction": "tap",
      "pitchMidi": 76,
      "tieBoundaryTicks": []
    },
    {
      "occurrenceId": "L02:PLAY:2:a",
      "phraseId": "L02:PLAY:2",
      "onsetTick": 3840,
      "endTick": 4800,
      "interaction": "hold",
      "pitchMidi": 72,
      "tieBoundaryTicks": [
        4320
      ]
    },
    {
      "occurrenceId": "L02:PLAY:2:d",
      "phraseId": "L02:PLAY:2",
      "onsetTick": 5280,
      "endTick": 5520,
      "interaction": "tap",
      "pitchMidi": 76,
      "tieBoundaryTicks": []
    },
    {
      "occurrenceId": "L02:PLAY:3:a",
      "phraseId": "L02:PLAY:3",
      "onsetTick": 5760,
      "endTick": 6720,
      "interaction": "hold",
      "pitchMidi": 72,
      "tieBoundaryTicks": [
        6240
      ]
    },
    {
      "occurrenceId": "L02:PLAY:3:d",
      "phraseId": "L02:PLAY:3",
      "onsetTick": 7200,
      "endTick": 7440,
      "interaction": "tap",
      "pitchMidi": 76,
      "tieBoundaryTicks": []
    }
  ]
}
```

### C3. phase 종료와 phrase 확정

- LISTEN: count-in 1마디 + 모티프 2회 + melody 없는 tail 1마디 → PRACTICE_READY. tail 동안 반주/맥박은 유지 가능, 사용자 점수 없음.
- PRACTICE: 새 count-in 1마디 + 모티프 2회 → 모든 음악/판정 끝 → PRACTICE_REVIEW. 연습 score는 standard best에 저장하지 않는다.
- PLAY: 새 count-in 1마디 + 모티프 4회 → settle → OUTRO 1마디 → RESULTS. settle은 고정 1마디가 아니라 마지막 음악/쉼 끝·모든 deadline·audio fade 중 가장 늦은 시점까지다.
- phrase commit은 `max(phraseMusicalEnd, lastRelevantJudgeDeadline)` 뒤이며 후행 phrase와 잠깐 겹칠 수 있다. release timeout 음향은 deadline보다 100ms 먼저 멈춘다.
- 최종 결과 전에 마지막 rest가 끝나야 한다. 입력창이 먼저 닫힌 tap-only 패턴도 음악 종료를 기다린다.
- 결과는 idempotent 저장. 이후 확인된 정상 late edge가 timeout과 충돌하면 D07대로 결과 철회와 재시작. pause로 이미 폐기된 epoch의 입력은 현재 결과에 재매칭하지 않는다.

L02·L04·L05·L06·L07·L08·L09는 마지막 gate/창 뒤에도 모티프 끝까지 기다리는 경우를 모두 계산한다. L01/L03의 마지막 hold release는 모티프 끝이 목표이므로 160ms+100ms가 최종 확정에 필요하다. 정확한 종료 target은 compiler와 window에서 계산하며 상수 260ms를 모든 레벨에 더하지 않는다.

## 부록 D. 판정·보정·전달 지연 fixture

### D1. window 계산 오라클

`neighborOrHoldDurationMs`의 null은 cap할 이웃/짧은 길이 조건이 없는 기본 창 fixture다. 실제 release에는 holdDuration을 항상 넣는다. 333.333…은 1/3 분할의 정확한 값으로 계산하고 JSON 표시 소수를 source of truth로 재사용하지 않는다. 기대 threshold는 정수 μs이며 근처 ±1μs를 검사한다.

```json
{
  "fixtureKind": "judgeWindows",
  "cases": [
    {
      "type": "onset",
      "neighborOrHoldDurationMs": null,
      "assistMultiplier": 1,
      "windowMsFraction": [
        140,
        1
      ],
      "thresholdsUs": [
        45000,
        90000,
        140000
      ]
    },
    {
      "type": "onset",
      "neighborOrHoldDurationMs": 200.0,
      "assistMultiplier": 1,
      "windowMsFraction": [
        90,
        1
      ],
      "thresholdsUs": [
        28929,
        57857,
        90000
      ]
    },
    {
      "type": "onset",
      "neighborOrHoldDurationMs": 333.3333333333333,
      "assistMultiplier": 1.35,
      "windowMsFraction": [
        150,
        1
      ],
      "thresholdsUs": [
        48214,
        96429,
        150000
      ]
    },
    {
      "type": "release",
      "neighborOrHoldDurationMs": null,
      "assistMultiplier": 1,
      "windowMsFraction": [
        160,
        1
      ],
      "thresholdsUs": [
        60000,
        110000,
        160000
      ]
    },
    {
      "type": "release",
      "neighborOrHoldDurationMs": 200.0,
      "assistMultiplier": 1,
      "windowMsFraction": [
        90,
        1
      ],
      "thresholdsUs": [
        33750,
        61875,
        90000
      ]
    },
    {
      "type": "release",
      "neighborOrHoldDurationMs": 200.0,
      "assistMultiplier": 1.35,
      "windowMsFraction": [
        90,
        1
      ],
      "thresholdsUs": [
        33750,
        61875,
        90000
      ]
    }
  ],
  "gradeMultipliers": [
    1,
    0.75,
    0.4,
    0
  ]
}
```

```json
{
  "fixtureKind": "judgeBoundaries",
  "cases": [
    {
      "kind": "onset",
      "errorUs": 45000,
      "expectedPoints": 1
    },
    {
      "kind": "onset",
      "errorUs": 45001,
      "expectedPoints": 0.75
    },
    {
      "kind": "onset",
      "errorUs": -45000,
      "expectedPoints": 1
    },
    {
      "kind": "onset",
      "errorUs": -45001,
      "expectedPoints": 0.75
    },
    {
      "kind": "onset",
      "errorUs": 90000,
      "expectedPoints": 0.75
    },
    {
      "kind": "onset",
      "errorUs": 90001,
      "expectedPoints": 0.4
    },
    {
      "kind": "onset",
      "errorUs": 140000,
      "expectedPoints": 0.4
    },
    {
      "kind": "onset",
      "errorUs": 140001,
      "expectedPoints": 0
    },
    {
      "kind": "release",
      "errorUs": 60000,
      "expectedPoints": 1
    },
    {
      "kind": "release",
      "errorUs": 60001,
      "expectedPoints": 0.75
    },
    {
      "kind": "release",
      "errorUs": 110000,
      "expectedPoints": 0.75
    },
    {
      "kind": "release",
      "errorUs": 110001,
      "expectedPoints": 0.4
    },
    {
      "kind": "release",
      "errorUs": 160000,
      "expectedPoints": 0.4
    },
    {
      "kind": "release",
      "errorUs": 160001,
      "expectedPoints": 0
    }
  ]
}
```

### D1b. 정확한 반μs 부호 대칭

```json
{
  "fixtureKind": "halfMicrosecondSymmetry",
  "cases": [
    {
      "correctedErrorMs": 45.0005,
      "roundedAbsoluteErrorUs": 45001,
      "expectedPoints": 0.75
    },
    {
      "correctedErrorMs": -45.0005,
      "roundedAbsoluteErrorUs": 45001,
      "expectedPoints": 0.75
    }
  ]
}
```

### D2. L02 모티프 입력 로그

`atTick`은 테스트 어댑터에서 정확한 음악 시각으로 변환한다. 키를 같은 시간값으로 두 번 사용해도 sequence 순서를 지킨다. `expectedN/earned/extra/score`는 해당 모티프 하나에 대한 값이다. 일반 PLAY 4회에는 이 로그를 각 모티프 오프셋으로 반복한다. tap의 up은 물리 rearm일 뿐 release 점수는 없다.

```json
{
  "fixtureKind": "L02InputReplay",
  "quarterBpm": 72,
  "N": 3,
  "cases": [
    {
      "name": "perfect",
      "edges": [
        {
          "sequence": 1,
          "edge": "down",
          "atTick": 0,
          "ownerToken": "keyboard:Space"
        },
        {
          "sequence": 2,
          "edge": "up",
          "atTick": 960,
          "ownerToken": "keyboard:Space"
        },
        {
          "sequence": 3,
          "edge": "down",
          "atTick": 1440,
          "ownerToken": "keyboard:Space"
        },
        {
          "sequence": 4,
          "edge": "up",
          "atTick": 1500,
          "ownerToken": "keyboard:Space"
        }
      ],
      "expectedEarned": 3,
      "expectedExtra": 0,
      "expectedScore": 100
    },
    {
      "name": "tie_broken_and_restrike",
      "edges": [
        {
          "sequence": 1,
          "edge": "down",
          "atTick": 0,
          "ownerToken": "keyboard:Space"
        },
        {
          "sequence": 2,
          "edge": "up",
          "atTick": 480,
          "ownerToken": "keyboard:Space"
        },
        {
          "sequence": 3,
          "edge": "down",
          "atTick": 480,
          "ownerToken": "keyboard:Space"
        },
        {
          "sequence": 4,
          "edge": "up",
          "atTick": 960,
          "ownerToken": "keyboard:Space"
        },
        {
          "sequence": 5,
          "edge": "down",
          "atTick": 1440,
          "ownerToken": "keyboard:Space"
        },
        {
          "sequence": 6,
          "edge": "up",
          "atTick": 1500,
          "ownerToken": "keyboard:Space"
        }
      ],
      "expectedEarned": 2,
      "expectedExtra": 1,
      "expectedScore": 58
    },
    {
      "name": "hold_onset_missing_then_up",
      "edges": [
        {
          "sequence": 1,
          "edge": "up",
          "atTick": 960,
          "ownerToken": "keyboard:Space"
        },
        {
          "sequence": 2,
          "edge": "down",
          "atTick": 1440,
          "ownerToken": "keyboard:Space"
        },
        {
          "sequence": 3,
          "edge": "up",
          "atTick": 1500,
          "ownerToken": "keyboard:Space"
        }
      ],
      "expectedEarned": 1,
      "expectedExtra": 0,
      "expectedScore": 33
    },
    {
      "name": "rest_intrusion",
      "edges": [
        {
          "sequence": 1,
          "edge": "down",
          "atTick": 0,
          "ownerToken": "keyboard:Space"
        },
        {
          "sequence": 2,
          "edge": "up",
          "atTick": 960,
          "ownerToken": "keyboard:Space"
        },
        {
          "sequence": 3,
          "edge": "down",
          "atTick": 1200,
          "ownerToken": "keyboard:Space"
        },
        {
          "sequence": 4,
          "edge": "up",
          "atTick": 1210,
          "ownerToken": "keyboard:Space"
        },
        {
          "sequence": 5,
          "edge": "down",
          "atTick": 1440,
          "ownerToken": "keyboard:Space"
        },
        {
          "sequence": 6,
          "edge": "up",
          "atTick": 1500,
          "ownerToken": "keyboard:Space"
        }
      ],
      "expectedEarned": 3,
      "expectedExtra": 1,
      "expectedScore": 92
    },
    {
      "name": "no_input",
      "edges": [],
      "expectedEarned": 0,
      "expectedExtra": 0,
      "expectedScore": 0
    }
  ]
}
```

`tie_broken_and_restrike`에서는 onset 1+tap 1=earned 2, release 0, extra 1 → (2−.25)/3=58.333…→58. `rest_intrusion`은 첫 쉼 dirty 1이지만 점수에서 별도의 쉼 감점을 또 하지 않아 92다. 쉼표를 N에 넣으면 이 오라클과 달라진다.

### D3. rest·owner·dispatch 경계 사례

```json
{
  "fixtureKind": "edgeCases",
  "cases": [
    {
      "id": "early_reentry",
      "level": "L02",
      "event": "down",
      "targetTick": 1440,
      "errorMs": -100,
      "expected": "onset grade 0.40; no extra; preceding rest clean"
    },
    {
      "id": "normal_release_into_rest",
      "level": "L02",
      "event": "up",
      "targetTick": 960,
      "errorMs": 100,
      "expected": "release grade 0.75; preceding hold sound stops on up; following rest clean"
    },
    {
      "id": "overhold",
      "level": "L02",
      "event": "up",
      "targetTick": 960,
      "errorMs": 170,
      "expected": "release 0; sound stopped at target+160ms; owner clears on up; following rest dirty; no extra for up"
    },
    {
      "id": "same_stamp_boundary",
      "level": "L01",
      "atTick": 1920,
      "edgesInSequence": [
        "up",
        "down"
      ],
      "expected": "previous release and next onset each judged once"
    },
    {
      "id": "repeat_key",
      "count": 20,
      "repeat": true,
      "expected": "no extra; no new expectation; owner unchanged"
    },
    {
      "id": "other_pointer_up",
      "owner": "pointer:1",
      "eventOwner": "pointer:2",
      "expected": "owner hold remains active"
    },
    {
      "id": "dispatch_in_grace",
      "targetMs": 10000,
      "windowMs": 140,
      "graceMs": 100,
      "eventMs": 10130,
      "receiptMs": 10220,
      "expected": "normal grade 0.40"
    },
    {
      "id": "dispatch_after_timeout",
      "targetMs": 10000,
      "windowMs": 140,
      "graceMs": 100,
      "eventMs": 10130,
      "receiptMs": 10250,
      "expected": "technical rollback because timeout finalized; receipt delay120ms does not rescue it"
    },
    {
      "id": "receipt_201",
      "eventMs": 10000,
      "receiptMs": 10201,
      "expected": "technical interrupt, not user miss"
    },
    {
      "id": "hit_then_real_restrike",
      "expectedState": "HIT",
      "newDownInSameWindow": true,
      "expected": "EXTRA_DOWN, no technical rollback"
    },
    {
      "id": "duplicate_transport_edge",
      "sameSessionAndSequence": true,
      "expected": "dedupe, no score change"
    },
    {
      "id": "old_invalidated_epoch",
      "expected": "discard from current judge; never remap into resumed onset"
    },
    {
      "id": "result_then_late_valid_edge",
      "previousFinalReason": "release_timeout",
      "expected": "revoke attempt and dependent best evidence; restart affected phrase; preserve earlier valid phrase evidence"
    }
  ]
}
```

D3의 문자열 expected는 사람이 확인할 시나리오 설명이다. P04~P09에서 코드의 enum과 필드로 변환하되 원문을 지우지 말고 연결 ID를 유지한다. AudioContext 시각과 위 fixture의 ms 축은 테스트 어댑터가 명시적으로 변환한다.

### D4. 보정·점수·진도·문항 계산

```json
{
  "fixtureKind": "calibrationAndScore",
  "calibration": {
    "previewClicks": 4,
    "measurementClicks": 16,
    "discardFirstMeasurementClicks": 4,
    "usedSamples": 12,
    "sampleErrorsMs": [
      60,
      70,
      75,
      78,
      80,
      80,
      80,
      82,
      84,
      85,
      90,
      100
    ],
    "expectedMedianMs": 80,
    "expectedMADMs": 4.5,
    "maxMADMs": 45,
    "maxAutomaticAbsoluteOffsetMs": 250,
    "requiresUserConfirmation": true,
    "signCases": [
      {
        "rawMs": 80,
        "offsetMs": 80,
        "expectedMs": 0
      },
      {
        "rawMs": -80,
        "offsetMs": -80,
        "expectedMs": 0
      }
    ]
  },
  "scoreCases": [
    {
      "N": 4,
      "earned": 3.5,
      "extra": 1,
      "expectedScore": 81
    },
    {
      "N": 3,
      "earned": 3,
      "extra": 0,
      "expectedScore": 100
    },
    {
      "N": 3,
      "earned": 0,
      "extra": 9,
      "expectedScore": 0
    },
    {
      "N": 4,
      "earned": 4,
      "extra": 20,
      "expectedScore": 75
    }
  ],
  "meterQuiz": {
    "defaultOrder": [
      "3/4",
      "6/8",
      "6/8",
      "3/4"
    ],
    "answers": [
      "2+2+2",
      "3+3",
      "3+3",
      "2+2+2"
    ],
    "requiredCorrect": 3,
    "questions": 4,
    "rhythmScoreDoesNotSubstitute": true
  }
}
```

진도는 시도 완료로 열고 기본 별 2는 80점, 별 3은 90점+개념 조건이다. 타이는 PLAY 4회 중 최소 3회 연속 유지이며 해당 시작/끝도 허용창 안이어야 한다. 점음표는 hold release 성공률 75% 이상. 점쉼표는 평가 가능 rest 75% clean+별도 unique 재진입 onset 75% 성공. 박자는 문항 4개 중 3개. 표본이 없거나 보조 toggle이면 표준 유지 숙달을 자동 성공으로 쓰지 않는다.

P14 구체화: L05 PLAY 4회에는 rest 이벤트 8개가 있지만 고유 쉼 후 재진입 onset은 각 모티프의 tick 720을 오프셋한 4개다. 직전 모티프 끝 쉼과 다음 모티프 첫 쉼이 같은 onset을 가리키므로 unique expectation ID로 dedupe한다. 최종 끝 쉼에는 다음 onset이 없어 재진입 분모에 들어가지 않는다. clean 표본 8개와 재진입 표본 4개를 혼동하지 않는다.

## 부록 E. 잘못된 저작 데이터가 반드시 실패하는 fixture

정상 sourceLevel을 깊은 복사한 뒤 아래 JSON Patch subset을 순서대로 적용한다. `add`, `replace`, `remove`만 쓰며 `/`로 JSON Pointer를 해석한다. `mustIncludeErrorCodes`는 이 팩의 **권장 오류 코드 계약**이다. 검증기별 모든 오류 순서는 다를 수 있으므로 첫 오류만 비교하지 말고 필요한 오류를 포함하는지 확인한다. 프로젝트가 다른 enum을 선택하면 명시적인 매핑표를 둔다. 원문 JSON은 변형하지 않는다.

schema 실패 사례는 semantic 단계로 억지 진입시키지 않는다. semantic fixture는 구조 검사를 통과한 뒤 해당 의미 오류를 잡는다. `rest_inside_tie`는 음 a와 d의 t1 사이에 독립음 b와 rest c가 끼어 연속 타이가 아니므로 실패한다. 게임은 이를 두 개의 정상 타이로 자동 고치면 안 된다.

```json
{
  "fixtureKind": "invalidLevelMutations",
  "cases": [
    {
      "id": "short_bar",
      "sourceLevel": "L02",
      "patch": [
        {
          "op": "remove",
          "path": "/bars/0/events/4"
        }
      ],
      "mustIncludeErrorCodes": [
        "BAR_LENGTH"
      ]
    },
    {
      "id": "overlap_at",
      "sourceLevel": "L02",
      "patch": [
        {
          "op": "replace",
          "path": "/bars/0/events/1/at",
          "value": 400
        }
      ],
      "mustIncludeErrorCodes": [
        "EVENT_CONTIGUITY"
      ]
    },
    {
      "id": "gap_at",
      "sourceLevel": "L02",
      "patch": [
        {
          "op": "replace",
          "path": "/bars/0/events/1/at",
          "value": 500
        }
      ],
      "mustIncludeErrorCodes": [
        "EVENT_CONTIGUITY"
      ]
    },
    {
      "id": "dotted_quarter_wrong_ticks",
      "sourceLevel": "L04",
      "patch": [
        {
          "op": "replace",
          "path": "/bars/0/events/0/ticks",
          "value": 480
        }
      ],
      "mustIncludeErrorCodes": [
        "DURATION_MISMATCH"
      ]
    },
    {
      "id": "pitch_midi_mismatch",
      "sourceLevel": "L02",
      "patch": [
        {
          "op": "replace",
          "path": "/bars/0/events/0/midi",
          "value": 74
        }
      ],
      "mustIncludeErrorCodes": [
        "PITCH_MIDI_MISMATCH"
      ]
    },
    {
      "id": "different_pitch_tie",
      "sourceLevel": "L02",
      "patch": [
        {
          "op": "replace",
          "path": "/bars/0/events/1/pitchName",
          "value": "D5"
        },
        {
          "op": "replace",
          "path": "/bars/0/events/1/midi",
          "value": 74
        }
      ],
      "mustIncludeErrorCodes": [
        "TIE_PITCH_MISMATCH"
      ]
    },
    {
      "id": "rest_inside_tie",
      "sourceLevel": "L02",
      "patch": [
        {
          "op": "remove",
          "path": "/bars/0/events/1/tieGroup"
        },
        {
          "op": "add",
          "path": "/bars/0/events/3/tieGroup",
          "value": "t1"
        },
        {
          "op": "replace",
          "path": "/bars/0/events/3/pitchName",
          "value": "C5"
        },
        {
          "op": "replace",
          "path": "/bars/0/events/3/midi",
          "value": 72
        },
        {
          "op": "replace",
          "path": "/bars/0/events/3/interaction",
          "value": "hold"
        }
      ],
      "mustIncludeErrorCodes": [
        "TIE_CONTIGUITY"
      ]
    },
    {
      "id": "rest_with_tie",
      "sourceLevel": "L02",
      "patch": [
        {
          "op": "add",
          "path": "/bars/0/events/2/tieGroup",
          "value": "bad"
        }
      ],
      "mustIncludeErrorCodes": [
        "SCHEMA"
      ]
    },
    {
      "id": "dangling_tie",
      "sourceLevel": "L02",
      "patch": [
        {
          "op": "remove",
          "path": "/bars/0/events/1/tieGroup"
        }
      ],
      "mustIncludeErrorCodes": [
        "TIE_TOO_SHORT"
      ]
    },
    {
      "id": "tap_tie",
      "sourceLevel": "L02",
      "patch": [
        {
          "op": "replace",
          "path": "/bars/0/events/1/interaction",
          "value": "tap"
        }
      ],
      "mustIncludeErrorCodes": [
        "TIE_INTERACTION"
      ]
    },
    {
      "id": "wrong_compound_grouping",
      "sourceLevel": "L07",
      "patch": [
        {
          "op": "replace",
          "path": "/meter/groupingEighths",
          "value": [
            2,
            2,
            2
          ]
        }
      ],
      "mustIncludeErrorCodes": [
        "SCHEMA"
      ]
    },
    {
      "id": "duplicate_id",
      "sourceLevel": "L02",
      "patch": [
        {
          "op": "replace",
          "path": "/bars/0/events/1/id",
          "value": "a"
        }
      ],
      "mustIncludeErrorCodes": [
        "DUPLICATE_EVENT_ID"
      ]
    },
    {
      "id": "unknown_property",
      "sourceLevel": "L02",
      "patch": [
        {
          "op": "add",
          "path": "/bpm",
          "value": 72
        }
      ],
      "mustIncludeErrorCodes": [
        "SCHEMA"
      ]
    },
    {
      "id": "fictional_review_approval",
      "sourceLevel": "L02",
      "patch": [
        {
          "op": "replace",
          "path": "/reviewState",
          "value": "approved"
        }
      ],
      "mustIncludeErrorCodes": [
        "SCHEMA"
      ]
    },
    {
      "id": "rest_with_pitch",
      "sourceLevel": "L02",
      "patch": [
        {
          "op": "add",
          "path": "/bars/0/events/2/pitchName",
          "value": "C5"
        }
      ],
      "mustIncludeErrorCodes": [
        "SCHEMA"
      ]
    },
    {
      "id": "zero_ticks",
      "sourceLevel": "L02",
      "patch": [
        {
          "op": "replace",
          "path": "/bars/0/events/0/ticks",
          "value": 0
        }
      ],
      "mustIncludeErrorCodes": [
        "SCHEMA"
      ]
    },
    {
      "id": "unrepresented_swing_320",
      "sourceLevel": "L06",
      "patch": [
        {
          "op": "replace",
          "path": "/bars/0/events/0/ticks",
          "value": 320
        }
      ],
      "mustIncludeErrorCodes": [
        "DURATION_MISMATCH"
      ]
    }
  ]
}
```

추가로 생성할 property-based 사례:

1. 모든 정상 레벨의 이벤트 배열을 바꾸지 않은 deep clone은 같은 compile 결과다.
2. 임의 이벤트의 at±1tick, ticks±1tick은 해당 validation 오류를 일으킨다.
3. tieGroup의 중간 note를 다른 철자·MIDI·tap으로 바꾸면 거절한다.
4. repeat를 펼친 뒤 occurrenceId는 유일하다. 원 notation ID 중복과 occurrence ID 반복은 다른 검사다.
5. 모든 유효 PLAY는 N>0, score 0~100, expected 항목의 최종 결정≤1회다.
6. 같은 로그 replay 100회는 구조적으로 동일하다. frameRate/visualOffset/highContrast/reducedMotion은 점수를 바꾸지 않는다.
7. 정해진 몇 개 레벨만 하드코딩한 compiler가 아니라 스키마상 정상인 동일 범위의 작은 변형에도 합계·타이·분모가 맞아야 한다. 새 curriculum을 자동 출시하는 것은 아니다.

## 부록 F. 반응형 화면·상태·저장 예시

### F1. 레이아웃 토큰 제안

아래 값은 원 설계의 최소값을 보존하는 초기 구현 설정이다. 실기기 관찰 뒤 조정할 수 있으나 새 음악 정답이나 판정창이 아니다. 작은 가로 화면은 무대와 패드의 분할 배치를 사용하고 safe-area를 빼고 난 실제 공간으로 계산한다.

```json
{
  "fixtureKind": "layoutTokens",
  "color": {
    "background": "#142A35",
    "paper": "#F3E8C9",
    "thread": "#E3B85D",
    "leaf": "#65A69A",
    "errorOutline": "#D77467"
  },
  "typography": {
    "bodyCssPx": 16,
    "instructionCssPx": 18,
    "lineHeight": 1.5
  },
  "targets": {
    "actionMinHeightCssPx": 72,
    "auxiliaryMinCssPx": 44,
    "portraitActionRegionMinHeightCssPx": 128,
    "targetCenterHorizontalRange": [
      0.3,
      0.7
    ]
  },
  "portrait": {
    "headerCssPxBeforeSafeArea": 56,
    "stageAspect": [
      4,
      3
    ],
    "backgroundCropPx": [
      64,
      0,
      1024,
      768
    ]
  },
  "landscape": {
    "headerCssPxBeforeSafeArea": 56,
    "stageAspect": [
      16,
      9
    ],
    "backgroundCropPx": [
      0,
      60,
      1152,
      648
    ],
    "compactStrategy": "stage-and-action-side-by-side"
  },
  "desktop": {
    "headerCssPx": 64,
    "stageMaxCssWidth": 1200,
    "actionRegionCssHeight": 112
  },
  "initialBudgets": {
    "sceneBackgrounds": 1,
    "majorSceneObjects": 12,
    "particles": 24,
    "voices": 8,
    "transitionMs": 600
  }
}
```

주요 화면 인수 기준:

| 화면 | 반드시 보여야 하는 것 | 입력/focus/복구 |
|---|---|---|
| 시작 | 독립 게임명·소리 켜기·볼륨 안내 | 실제 사용자 제스처 AudioContext; 실패 시 재시도 |
| 꿈 지도 | 4장소·추천 다음 수업·진행 구분 | 키보드 접근·선행 설명 건너뛰기 가능 |
| 수업 | 목표 1문장·듣기/연습/연주·명시적 도움 | 시간 제한 없음, 메뉴 입력 게임으로 전파 금지 |
| 듣기 | 솜새 시연과 분명한 동작 | 사용자 입력은 점수 0, 정답 소리 가리지 않음 |
| 연습 | 현재 속도·도움·간단한 early/late | 언제든 pause, 실패로 쫓아내지 않음 |
| 연주 | 장면명·진행 4매듭·일시정지 | 큰 액션 패드, 기본 악보/실시간 점수 과다 노출 없음 |
| 중단 | 원인·손 떼기·이어하기/지도 | focus trap과 복귀, 자동 재개 금지 |
| 결과 | 수행 개념·점수·한 오개념·연습/다음 | DOM 스크롤, 고급 정보 선택, 중복 저장 방지 |
| 개념 문항 | 재생·선택지·답변 뒤 설명 | 박자표는 정답 뒤, 무시간제, 도움 출처 표시 |
| 오류 | 어떤 자산/상태가 막혔는지·재시도/나가기 | raw stack을 사용자에게 던지지 않음 |

### F2. runtime 상태 envelope 예시

이 JSON은 설계 계약을 설명하는 테스트 상태다. 원 레벨 스키마와 별개이며 현재 실제 구현 상태를 보고하는 것이 아니다. sessionId는 재생 세대, attemptId는 4회 PLAY 전체 결과의 근거, phraseId는 모티프 반복이다. 실제 wall-clock 시각이나 사용자 식별자를 넣지 않은 synthetic fixture다.

```json
{
  "fixtureKind": "sessionEnvelope",
  "attemptId": "test-attempt-L02-001",
  "sessionId": "test-session-epoch-2",
  "phase": "PLAY",
  "phraseId": "L02:PLAY:1",
  "transportGeneration": 2,
  "calibrationRevision": 1,
  "committedPhrases": [
    {
      "phraseId": "L02:PLAY:0",
      "sourceSessionId": "test-session-epoch-1",
      "N": 3,
      "earned": 3,
      "extra": 0,
      "valid": true
    }
  ],
  "provisionalPhrase": {
    "phraseId": "L02:PLAY:1",
    "N": 3,
    "earned": 1,
    "extra": 0,
    "valid": true
  },
  "expectedAfterInterrupt": {
    "committedPhraseCount": 1,
    "provisionalEarned": 0,
    "provisionalExtra": 0,
    "resumePhraseId": "L02:PLAY:1",
    "resumeStartsWithCountInBars": 1,
    "requiresPhysicalRearm": true
  }
}
```

N의 해석을 분리한다. 전체 attempt 목표 N=12는 컴파일 정보다. provisional ledger의 집계 N은 그 phrase를 채점 증거에 포함할 때만 합친다. rollback 후 ‘남은 연주가 없는데 분모만 12로 남아 점수가 낮아지는’ 버그를 막는다. 최종 유효 결과에서는 4개 phrase 모두 모여 N12여야 한다. 미완료 시도를 최종 성적으로 저장하지 않는다.

### F3. 최소 저장 모델 예시

초기 설정의 `assistMode` 이름, volume key, method enum은 구현 제안이며 별도 저장 스키마로 잠근다. 원래 ProgressV1의 요구 정보를 보존한다. review status와 권리 승인은 진행 저장소가 아니라 콘텐츠 manifest에서 관리한다. 사용자의 실제 보정/진행을 지어낸 데이터가 아니다.

```json
{
  "fixtureKind": "initialProgressExample",
  "storageKey": "night-thread.progress.v1",
  "value": {
    "schemaVersion": 1,
    "contentVersion": "night-thread-mvp/1.0.0",
    "settings": {
      "locale": "ko-KR",
      "volumes": {
        "metronome": 0.7,
        "guide": 0.8,
        "bgm": 0.45,
        "sfx": 0.6
      },
      "reducedMotion": false,
      "highContrast": false,
      "inputCode": "Space",
      "assistMode": "standard"
    },
    "calibration": {
      "inputOffsetMs": 0,
      "visualOffsetMs": 0,
      "method": "unconfirmed",
      "confirmedAt": null,
      "revision": 0
    },
    "levels": {},
    "recentAttempts": [],
    "bestScoreEvidence": {},
    "lastLessonId": null
  }
}
```

### F4. 오디오 envelope의 짧은 tap 처리

attack 5ms/release 8ms는 초기 목표다. 처리 시점부터 targetEnd까지 13ms보다 적게 남았다면 시간을 뒤로 늘리면 안 된다. 안전 start 시각을 정한 뒤 남은 양의 길이 안에서 attack/release를 비례 축소하거나 소리를 생략한다. `now+safeLead>=targetEnd`면 pitched sound는 생략한다. 역순 AudioParam automation과 과거 start를 만들지 않는다. 원 timestamp로 판정한 점수는 유지하며 음향 생략 이유를 진단한다. hold에는 실제 release 반응을 유지한다.

예: 원 targetEnd=10.500초, receipt 처리 ctxNow=10.495초, safeLead=0.003초라면 남은 소리는 2ms뿐이다. envelope를 2ms 안으로 줄이거나 생략할 수 있으나 10.511초까지 13ms를 새로 재생하면 다음 쉼을 침범한다. 이 결정은 D20으로 기록한다.

## 부록 G. 전체 QA 추적표와 사람 검수

아래는 원 설계의 테스트 계획을 그대로 추적하기 위한 사본이다. 이 문서 작성 단계에서 게임 코드의 해당 테스트를 실행했다는 뜻이 아니다. P23에서 테스트 ID를 실제 파일/케이스/로그에 연결한다. D05~D20 추가 결정은 별도 테스트 ID를 붙인다.

### G1. 단위 테스트 U01~U46

| ID | 입력/조건 | 기대 결과 |
|---|---|---|
| U01 | 4/4, 3/4, 6/8 | barTicks 1920, 1440, 1440 |
| U02 | 온·2분·4분·8분·16분 | 1920, 960, 480, 240, 120 |
| U03 | 점4분/점2분 | 720/1440 |
| U04 | 점4분인데 ticks 480 | duration 오류 |
| U05 | 합계 1680인 4/4 | 마디 부족 오류, 자동 보완 없음 |
| U06 | at 중복/빈틈 | overlap/gap 거부 |
| U07 | L02 | gate 2개, hold 0~960, 중간 attack 없음 |
| U08 | L03 | hold 1440~2880, 1920에서 계속 유지 |
| U09 | C5→D5 타이 | pitch mismatch 거부 |
| U10 | 타이 중간 rest | 연속성 오류 |
| U11 | rest의 tieGroup | schema 거부 |
| U12 | tieGroup에 음 1개 | dangling tie 거부 |
| U13 | L06/L07 | 음·쉼 배열 동일, 큰박 배열은 다름 |
| U14 | L08/L09 | 음·쉼 배열 동일, 시간 비 2/3 |
| U15 | onset ±45/45.001ms | 1.00/.75 |
| U16 | ±90/90.001/140/140.001ms | .75/.40/.40/0 |
| U17 | onset 간격 200ms | W=90ms, perfect 임계 약 28.928571ms, 창 겹침 없음 |
| U18 | release ±60/110/160ms | 1/.75/.40, 경계 포함 |
| U19 | 타이 중간 up | BROKEN, release 0, 재입력해도 복구 없음 |
| U20 | onset miss 후 정확한 up | onset/release 모두 0 |
| U21 | 끝+160ms 초과 유지 | 음 자동 종료, 다음 onset 자동 성공 없음 |
| U22 | 반복 keydown 20회 | 첫 down만 수용, repeat를 extra로 세지 않음 |
| U23 | 두 번째 포인터 down/up | owner hold에 영향 없음 |
| U24 | 동일 timestamp의 up→down | 기존 release 후 새 onset, 각각 1회 |
| U25 | L02 완벽 입력 1회 | N=3, earned=3, 100점 |
| U26 | N=4, earned=3.5, extra=1 | 81점 |
| U27 | extra>N | 감점 cap, 점수 0~100 |
| U28 | raw +80, 보정 +80ms | corrected 0ms |
| U29 | raw -80, 보정 -80ms | corrected 0ms |
| U30 | getOutputTimestamp 경로 | latency 중복 차감 없음 |
| U31 | 타이 중간 경계 | onset 목록에 없음 |
| U32 | 쉼 끝 직전 정상 early onset | 쉼 dirty 아님 |
| U33 | pause rollback | 분자·분모·extra 함께 복구 |
| U34 | 같은 로그 100회 replay | 점수·순서·상태 완전히 동일 |
| U35 | 이전 sessionId 입력 | 현재 기대 항목 불변 |
| U36 | N=0 플레이 chart | 작성 오류 |
| U37 | quarterBpm 90의 6/8 | 큰박 720 tick=1초, 표시 점4분=60 |
| U38 | tap의 빠른/늦은 up | onset 점수 동일, 길이 숙달 증가 없음 |
| U39 | 도움 모드 90점 | assisted 기록만 갱신 |
| U40 | 저장 파손/quota 오류 | 게임·결과 사용 가능, 안내 노출 |
| U41 | 정상 timestamp가 deadline 후 80ms에 도착 | dispatch grace 안에서 정상 판정 |
| U42 | 정상 onset/release가 확정 뒤에 도착 | 해당 프레이즈 기술적 rollback, miss 점수 보존 금지 |
| U43 | 넓은 판정 ×1.35 + 밀집 onset | 확대 뒤 0.45*d cap 유지 |
| U44 | tap을 늦게 누르고 다음 구간이 쉼 | 예약된 gate 끝에서 음 종료, 쉼까지 길이 연장 없음 |
| U45 | 카운트인 끝의 첫 onset early 입력 | 다른 onset과 같은 허용창으로 정상 판정 |
| U46 | 성공 확정 뒤 같은 창의 실제 재타격 | 기술적 rollback 없이 EXTRA_DOWN |

U17의 소수 임계값은 구현의 정수 microsecond 정규화 규칙으로 반올림해 테스트한다. tick 및 음악 길이는 정수·유리수로 정확히 비교한다.

### G2. 통합 테스트 I01~I17

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| I01 | L02 시연 스케줄 추적 | 타이 attack/end 각각 1회 |
| I02 | fps 60→30→15 | 음악·판정 목표 timestamp 불변 |
| I03 | scheduler 지연으로 미예약 음 발견 | 소리 몰아내기 없이 프레이즈 무효화 |
| I04 | hold 중 화면 숨김→복귀 | 무실패 중단, 사용자 재개와 카운트인 |
| I05 | pointercancel | 정상 release 0점으로 변환하지 않음 |
| I06 | 정상 up 후 lost capture | 중복 중단 없음 |
| I07 | 다른 포인터 up | owner의 gate 유지 |
| I08 | pause/retry 20회 | node/listener 누수·중복음 없음 |
| I09 | 마지막 release 창+dispatch grace | 확정 전에 RESULTS 저장 없음 |
| I10 | resume 거절 | 무음 PLAY 진입 금지 |
| I11 | 오래된 JudgeEvent | 다음 장면·점수에 영향 없음 |
| I12 | L03 취약 구간 연습 | 타이 시작부터 두 마디 포함 |
| I13 | 결과 완료 이벤트 2회 | 저장 1회 |
| I14 | 자산 누락/decode 실패 | 카운트인 전 차단, 재시도/나가기 |
| I15 | 입력 receipt 지연 250ms | miss 대신 기술적 중단 |
| I16 | 오디오 경로 변경 | 보정 안내, 현재 프레이즈 무효화 |
| I17 | 확정 이후의 늦은 정상 edge | 시각 결과·저장 후보 모두 rollback |

### G3. E2E E01~E15

1. **E01 새 사용자:** 빈 저장 상태→시작→소리 켜기→L01 시연→연습→연주→결과→지도. 각 단계의 접근 가능한 이름과 focus 순서를 검사한다.
2. **E02 키보드:** Space 자동 반복, 빠른 up/down, 일시정지, 메뉴 Enter가 잘 분리되는지 확인한다.
3. **E03 터치:** owner로 hold, 버튼 밖 이동, 두 번째 손가락 추가, owner up. 음 하나만 판정한다.
4. **E04 타이:** L02 tick 480에 up→down을 넣은 로그와 연속 hold 로그의 결과·설명 차이를 확인한다. 같은 키의 물리 재타격에는 실제 up→down이 필요하다.
5. **E05 화면 숨김:** L03 타이 도중 탭을 숨겼다가 재개한다. 프레이즈의 이전 점수는 없어지고 새 시작만 남는다.
6. **E06 모바일 뷰:** 320×568, 390×844, 768×1024, 1366×768에서 표적·버튼 가림과 수평 스크롤이 없다. 텍스트 200% 확대 시 메뉴·설명을 읽을 수 있다.
7. **E07 움직임 축소:** 배경 이동·파티클이 사라져도 목표 시간·소리·점수는 같다.
8. **E08 박자 비교:** 작은 입력 6개는 동일, 큰박은 3개→2개, 표시 단위는 4분→점4분. 문항 결과와 리듬 점수는 별개다.
9. **E09 BPM 비교:** L08/L09에서 음·쉼은 같고 카운트인·재생 속도가 함께 바뀐다. 숫자만 바뀌는 결함을 잡는다.
10. **E10 저장:** 기본 80점 후 보조 95점→새로고침. 두 최고 점수를 따로 보존한다.
11. **E11 복구:** 파손 JSON·저장 불가 환경에서도 수업을 사용할 수 있다.
12. **E12 네트워크 차단:** 이미 읽은 레벨은 실행되고, 없는 자산은 무음 진입 대신 재시도를 안내한다.
13. **E13 최종 자산:** 음원을 교체해도 타이 attack 수와 gate 길이가 같은지 스케줄 snapshot을 비교한다.
14. **E14 마지막 놓기:** 마지막 up을 허용 끝에 넣는다. 창과 dispatch grace가 닫히기 전에 결과를 저장하지 않는다.
15. **E15 늦은 이벤트:** 테스트 어댑터로 허용창 안 timestamp를 확정 뒤 전달한다. 잘못된 최종 점수가 남지 않고 기술적 재시작이 일어난다.

자동화 WebKit 통과는 실제 iPhone Safari의 오디오·Bluetooth 검증을 대신하지 않는다. Playwright 입력 주입은 물리 지연 측정이 아니다.

### G4. 실제 기기 및 교육 검수

| 구분 | 최소 대상 | 확인 사항 |
|---|---|---|
| 데스크톱 | Chromium·Firefox·Safari의 표적 OS | 소리 재개·키 반복·화면 숨김 |
| 모바일 | 실제 iPhone Safari, Android Chrome | cancel·잠금·회전·safe-area·오디오 중단 |
| 오디오 | 내장 스피커·유선·Bluetooth 각 1개 | 보정 일관성·경로 전환·남은 지연 |
| 성능 | 중간 사양 모바일 | 첫 로드·frame p95·중단·메모리 |
| 음악 | 리듬 기보 검수 가능한 교육자 | 마디·점·타이·음원·큰박 일치 |
| 사용성 | 음악 초보 8~12명 목표 | 오개념 문항·재타격·지시 이해 |

초기 성능 목표:

- 표적 기기에서 render frame p95≤33.4ms
- 입력 callback 처리 p95≤8ms
- 5분 연속 예약 시각의 누적 드리프트<2ms, 스케줄 로그 기준
- 공통 시계에서 계산한 시각·오디오 목표 편차 p95≤1프레임

이 수치는 실제 스피커의 음파 도착이나 디스플레이 scanout까지 보증하지 않는다. 물리 AV 동기는 loopback·고속 촬영 등 측정 방법과 장치를 기록한다. 미달 기기는 저사양 모드로 재검수하고 지원표에 제한을 쓴다.

### G5. 출고 gate

- [ ] 9개 JSON과 필수 negative fixture 통과
- [ ] U01~U46, I01~I17, E01~E15의 필수 결함 0건
- [ ] 타이 내부 attack 없음, 마디선 연속성 직접 청음
- [ ] 점음표·점쉼표 대체 도식과 기보의 사람 검수
- [ ] 3/4·6/8의 큰박·기준 음표 차이 확인
- [ ] 권리 unknown 원본 및 참고작 자산 미포함
- [ ] unlock·cancel·pause·focus·저장 실패 복구
- [ ] 실제 모바일 2종과 표적 데스크톱 검수 기록
- [ ] 보조 모드 및 개념 숙달 기록 분리
- [ ] 사용성 결과·미검증 효과·남은 문제 명시
- [ ] 실제 배포·공개는 별도 승인 확인

### G6. 단계 보고 템플릿

```text
완료 단계 / build·content·asset 버전:
이번에 실제로 작동하는 결과:
변경 파일:
실행 명령과 실제 exit/result:
인수 기준별 passed / failed / not run:
증거: 테스트 로그, 화면, 예약 로그, 기기·브라우저·출력 경로
수학/자동화/청음/교육자/실기기 각각의 상태:
남은 결함과 영향:
필요한 사용자 결정 또는 승인:
다음 P번호와 재개 방법:
```

`passed`는 직접 실행하거나 증거를 확인한 항목에만 쓴다. 계획을 작성한 경우 `planned`, 환경/기기 때문에 못한 경우 `not run`, 사람이 승인해야 하는 경우 `pending`을 쓴다. 정지 asset QA, browser decode, 런타임 pose, 물리 audio, 학습 효과는 서로 다른 검사다.

### G7. 교육자에게 넘길 짧은 검수 질문

1. 같은 음높이의 타이는 소리 시작 1회로 들리고 악보에만 음표가 나뉘는가? 이음줄과 혼동하지 않는가?
2. 점은 원래 길이의 절반이며 점4분 720, 점2분 1440의 비례가 맞는가?
3. L05 점4분쉼은 담당 성부의 침묵이며 반주·맥박은 살아 있는가?
4. L06/L07은 같은 6개 작은 음·실제 간격으로 3큰박/2큰박을 구별하는가?
5. 표시 4분=90과 점4분=60을 같은 단위의 숫자로 비교하는 오류가 없는가?
6. L08/L09는 음가 비율을 유지하면서 4분 기준 72→108, 실제 시간 2/3이 되는가?
7. tap 성공을 음가 유지 능력으로, 6탭 성공을 박자 구별 능력으로 과장하지 않는가?
8. 교정 대기 원본, V2 당김음/스윙, 권리 불명 원본이 공개 build에 들어가지 않는가?
9. 기본 설명의 비유·언어·고급 tick 노출이 초보자에게 적절한가?
10. 해당 검수는 어떤 dataHash/renderer/audio 버전에서 언제 수행했는가?

## 부록 H. 교재 보완·권리·공식 기술 자료

### H1. 교재 사용의 정확한 범위

| 교재 | 이번 게임에서 쓰는 개념 | 처리 |
|---|---|---|
| 004 | 음표 상대 길이 | 4분=1박의 조건을 일반화하지 않고 q 길이와 큰박 구분 |
| 017 | 동음 붙임줄·마디선 넘기 | 동일 철자/MIDI·연속성, 한 attack. 새 기보·단위·실제 barline |
| 006 | 점음표 | 피자 면적 원본 사용 보류, 정확한 2칸+1칸 도형 |
| 007 | 점쉼표 | 의심 면적 원본 사용 보류, 6/8 점4분쉼 720 tick 새 도식 |
| 032-3 | 3/4와 6/8 | 동일 6 작은 단위, 2+2+2와 3+3, 6/8 큰박 점4분 명시 |
| 030-1 | BPM | 분당 마디 수가 아닌 기준 음표의 박동 수, 72/108 동일 4분 기준 |
| 054 | V2 당김음 | 출고 차단, 각 4/4 마디 1920·동음 타이 재기보/청음 후 |
| 031-3 | V2 스윙 | 출고 차단, 2:1의 320+160과 점음표 3:1을 구별, 새 스키마 |

원 설계가 참조한 [113개 원본 분석 보고서](https://docs.google.com/document/d/1Mbtlky-yiBefNoYpNSFJwb6zp-0Rn72-0bD5tx67oJg/edit), [017 원본](https://drive.google.com/file/d/1sqKEmCF-HSOHjHM9p6L4HhTjfMsYTJrX/view), [032-3 원본](https://drive.google.com/file/d/1Tf75AOzgm2MDL6EHHDVIDzC9Up1k09IP/view)을 근거 위치로 남긴다. 이 프롬프트팩 작성에서 113개 원본을 새로 전수 재검수한 것은 아니다. 원문 설계의 직접 확인/보고서 근거 상태를 유지한다.

런타임의 Noto/DejaVu 라이선스 고지는 배포물에도 포함한다. SVG에 글리프 윤곽을 넣었다고 라이선스가 없어지는 것이 아니다. 생성 원화가 독점적 저작권·상표 등록 가능성을 보장한다고 쓰지 않는다. 참고작 화면·음악·캐릭터는 게임 자산으로 사용하지 않는다.

### H2. 구현 시 다시 확인할 공식 기술 문서

- [AudioScheduledSourceNode.start](https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/start)
- [AudioContext.getOutputTimestamp](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/getOutputTimestamp)
- [Autoplay 안내](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- [Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- [Pointer Events 표준](https://www.w3.org/TR/pointerevents/)
- [PixiJS 8 시작](https://pixijs.com/8.x/guides/getting-started/quick-start)
- [Vite](https://vite.dev/guide/), [Vitest](https://vitest.dev/guide/), [Playwright](https://playwright.dev/docs/intro)
- [Open Music Theory 음가·점·타이](https://viva.pressbooks.pub/openmusictheory/chapter/notating-rhythm/)
- [Open Music Theory 복합박](https://viva.pressbooks.pub/openmusictheorycopy/chapter/compound-meters-and-time-signatures/)

이는 기준 설계에 사용된 자료와 구현 중 확인할 위치다. 이 문서가 모든 현재 API·patch 버전을 설치해 검증했다는 뜻이 아니다. 구현자는 현재 공식 문서·호환성·실제 환경을 확인해 정확한 버전을 lockfile로 고정한다. 25/150ms, 45/90/140ms, 60/110/160ms, 100/200ms는 API 보장이 아닌 이 제품의 명시적 초기 정책이다.

### H3. 실제 프로젝트 명령의 계약

```text
설치: 저장소 package manager와 lockfile에 맞는 frozen install
타입: package script typecheck
저작: package script validate:content
단위: package script test:unit
통합: package script test:integration
브라우저: package script test:e2e
빌드: package script build
검토: package script preview
```

위 문자열은 실행한 로그가 아니라 P01에서 만들 역할명이다. npm/pnpm/yarn 중 현재 저장소 하나를 선택하고 실제 명령을 README에 기록한다. 실패한 설치나 권한 문제를 성공으로 표시하지 않는다.

## 부록 I. 문서 자체의 검증 범위와 최종 인계 경계

이 프롬프트팩은 기준 설계를 바탕으로 작성한 별도 개발 문서다. 원 설계·마스터 원화는 보존했다. 부록의 정규 데이터는 원문과 객체 동일성을 대조하고 스키마·음가·마디·타이·gate·분모·템포를 정적으로 검증한다. 런타임 에셋은 실제 경로·크기·앵커·상태·선택 폴백을 확인해 통합했다. 모든 JSON 코드 블록은 파싱 대상으로 삼고 다른 fixture 종류를 Level 스키마에 잘못 넣지 않는다.

독립 검토는 음악 계약·계산 fixture·경계 정책·자산 참조를 대상으로 한다. 발견된 모호함과 수정은 D 결정표에 명시한다. 정적 문서 검증은 게임 구현·기기 측정·최종 악보 청음·교육 효과 검증이 아니다.

아직 완료하지 않은 범위:
- 실제 게임 코드 작성·실행·배포
- 브라우저의 실제 WebP decode와 PNG fallback, 포즈 전환·scene composition
- 실제 iPhone/Android/오디오 경로의 지연·성능·GPU 측정
- 교육자의 최종 기보·동시 음향 승인과 초보자 학습 실험
- 원본 교재 교정 및 공개 배포 권리 승인

첫 구현 목표는 **L02 한 장면을 실제로 듣고, 한 번 눌러 두 음을 잇고, 마지막에 놓아 결과까지 보는 것**이다. 그 증거 위에 나머지 꿈과 미술을 차례로 올린다. 이 파일을 전달했다고 그 구현이 자동으로 시작되거나 공개 배포가 승인되는 것은 아니다.

