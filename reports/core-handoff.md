# 순수 엔진 검증 인계

## 후속 회귀 수정: D26 보정된 입력의 도착 마감

+250ms 보정 시 raw +241ms frame advance가 정상 +250ms 입력보다 먼저 onset miss를 확정하는 결함을 회귀 테스트 4개 실패로 재현했다. 루트의 QA 경계 승인 뒤, 음악 target/window/audio gate를 유지하면서 pending onset·active release timeout 및 phrase/final 확정 대기에 max(0,offsetMs)를 추가했다. 음수 보정으로 기존 grace를 단축하지 않는다. raw receipt 지연 200ms 제한도 유지한다.

`npx vitest run tests/core-oracles.test.ts tests/core-input-storage.test.ts tests/core-content.test.ts tests/core-mastery.test.ts tests/integration-recovery.test.ts tests/integration-calibration.test.ts --reporter=json --outputFile=reports/core-calibration-vitest.json` → **176/176 pass, failed0, pending0**. 보고서 success:true, 72,536바이트. `npx tsc --noEmit`도 exit0. 아래의 165개 기록을 포함한 최신 회귀 결과다. UI의 음수 보정 early filter는 루트가 별도로 수정한다.

검증일: 2026-10-19 UTC. 모델/추론 설정을 임의로 변경하지 않았다. 기준 문서와 원본 에셋은 수정하지 않았다.

## 완료 범위

- `src/content/levels.json` 및 `levels/L01.json`~`L09.json`: 제공 원본과 파싱 객체 동일. 원본 Draft2020-12 스키마, 추천 campaign 순서. pending reviewState 유지.
- `src/core/validation.ts`: Ajv2020 구조 검사와 비변형 semantic 검사. 원문 부록 E 오류코드·negative mutation 전체 검증.
- `compiler.ts`: PPQ480, 원형 sourceNotationIds 유지, 타이 gate 합침, 반복별 atomic phrase, 반복 경계 이웃 cap, 고정 초 변환, 큰박/세부박/표시 이벤트.
- `judge.ts`, `windows.ts`: 정수 μs 크기 경계, onset/release, BROKEN/OVERHELD, 쉼·재진입·타이 지표, count-in early, sequence/id dedupe, dispatch grace, 과거 epoch 분리, phrase 원자 rollback과 재개.
- `input.ts`: owner, repeat/추가 pointer 무시, 정상 capture 해제, toggle logical hold, tap rearm, timestamp 정상화와 half-open epoch 조회.
- `storage.ts`: 이 게임 전용 key, 결과 idempotency, standard/assisted 분리, valid 원장과 best 근거 철회·이전값 복원, quota/corrupt/content migration. 원시 입력과 개인정보 저장 없음.
- `mastery.ts`: 별80/90점·타이3/4·점음release75%·점쉼clean/reentry75%·박자quiz3/4 분리. 타이 전체를 보존하는 focused practice 마디 선택.
- `docs/contracts.md`, `docs/decisions.md`: D01~D20 채택 및 D21~D25 구현 구체화 기록.

## 실제 실행 증거

|명령|결과|
|---|---|
|`npx tsc --noEmit` (QA 확인 시점)|exit0. 이후 UI 동시 편집은 루트 최종 typecheck 대상|
|`npx vitest run tests/core-oracles.test.ts tests/core-input-storage.test.ts tests/core-mastery.test.ts --reporter=json --outputFile=reports/core-vitest.json`|150/150 pass, failed0/skipped0, JSON success:true|
|`npx vitest run tests/core-content.test.ts --reporter=dot`|11/11 pass, exit0|
|`npx vitest run tests/integration-recovery.test.ts --reporter=dot`|4/4 pass, exit0|

합계165개. core JSON 보고서는 첫 세 파일150개에 대한 기계판독 결과다. 나머지11+4개는 별도 실제 명령으로 통과했다. Windows에서 `tests/core*` 필터는 literal 전달되어 0개를 찾은 실패가 있었고, 명시적 경로로 수정해 다시 실행했다. 이 실패를 성공으로 집계하지 않았다.

주요 오라클: L02 완벽100/중간up재타격58/쉼침입92/무입력0. 모든9레벨 PLAY4 완벽100, 동일 로그100회 결정성. L03 마디선타이, 6/8 큰박720tick=1초, 72/108시간비2/3, 정수μs/넓은창cap·±보정 부호. 저장된 후보94가 늦은 정상release로 철회될 때 이전best80 복원 및 앞3phrase 보존.

## 루트 UI 통합 확인 요청

별도 공유한 사항: 결과 화면의 keyboard/pointer 지연edge가 screen/owner 검사 전에 과거epoch로 전달되어야 함; viewdeparture에서 epoch 닫기; epoch별 audible anchor 보존; 재개 전 physical all-up 보장; asset await 이후 session/audio running 재확인. 코어에서는 대응 API와 통합 경계를 제공하며 실제 UI 적용·브라우저 검증은 루트 담당이다.

실기기, 실제 스피커·Bluetooth 청음, 물리 지연/AV, 교육자·초보자 검수는 수행하지 않았다. 이 보고서는 코드 검증이며 해당 사람 검수의 완료 근거가 아니다. 공개 배포와 V2는 수행하지 않았다.
