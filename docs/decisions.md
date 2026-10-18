# 구현 결정

사용자의 반복질문 없는 문서기준 자율구현 지시에 따라 프롬프트팩 기본 구체화 D01~D20을 전부 채택한다. 음악 정답과 검수 승인 상태는 변경하지 않는다. 출처는 promptpack 1장과 C01~C09, 검증은 원문 부록 오라클 및 기능 테스트다.

|ID|채택 내용|검증/영향|
|---|---|---|
|D01|L02 뒤 tap E5=76 유지|compiler golden pitch|
|D02|정지 포즈+anchor 정렬·작은 보간|rig 주장 없음, 장면QA|
|D03|모바일 crop4:3[64,0,1024,768],16:9[0,60,1152,648]|asset/layout검사|
|D04|교육 pending/false 개발표시, 공개교육gate 차단|education-gate|
|D05|모티프1회 atomic, L03/L05 두마디|phrase.finalizeSec, rollback|
|D06|새sessionId에 이전확정증거 참조, 입력epoch 분리|old-session/재개 tests|
|D07|늦은정상edge 충돌시 해당phrase+후속 및 저장결과/best 철회|late-edge/revoke tests|
|D08|LISTEN motif/tail 내부구분|listen2+tail1|
|D09|fallback audible=context anchor+performance delta−base−output|audio-clock tests|
|D10|toggle down onset/up rearm/down release, tap 별도rearm|InputOwner tests|
|D11|카운트인 끝 첫onset early창 수용, 더이른down 무채점owner|U45|
|D12|기본도식6+고급4, 꽃원화/벡터 한계열|자산로딩/교육UI|
|D13|L01 L02 L03 L04 L06 L07 L05 L08 L09 추천, 점수잠금없음|campaign|
|D14|L08/09 한마디 편지4회0/480/960/1440|golden|
|D15|없는이웃 무한대, 분모0숙달null|windows/metrics tests|
|D16|저작rest별표본, 연속rest화면병합과별도|L03/L05 metrics|
|D17|유효PLAY4회 완료, 중단부분미완료, standard별/숙달조건유지|completed/save|
|D18|보조44px이상/주72px이상·컨테이너128px이상|모바일layout|
|D19|Math.round(abs(errorMs)*1000), 부호별도|±45.0005 oracle|
|D20|tap safeStart~고정targetEnd 안 envelope축소, 지난끝발음생략|audio schedule|

추가 구현 구체화:

- D21: 쉼 뒤 재진입은 고유 nextOnsetId 집합으로 센다. L05 PLAY rest8개, reentry onset4개. 마지막 후속onset없는 쉼은 clean만 집계한다. 근거 P14 및 D16, 원형rest변경없음.
- D22: 컴파일러/judge는 transport 상대 audible초를 받고 UI가 transport 원점을 뺀다. 고정tick 정답과판정창은변경없다. resume는기존확정증거를유지한동일judge에새sessionId를지정하고원래tick에서재개한다.
- D23: 코어는 strict TS, Ajv2020 원본schema+semantic검사. renderer와browser전역을import하지않는다. API구조는`src/core/types.ts`가정의한다.
- D24: 로컬시도원장은모든완료시도를유지해이전최고근거철회복구를보장한다. 원시입력은저장하지않는다. 이예상사용규모에서장기원장상한은도입하지않았으며quota실패시메모리결과유지한다.
- D25: 저장필드이름은타입의`bestStandard/bestAssisted`와`keyCode`를사용하되원설계동등의미를유지한다. 교육승인manifest·reviewState는고치지않는다.
- D26: 보정 후 정상 입력의 도착 가능 시각을 보장하기 위해 onset/release timeout과 phrase/final 확정 대기에 `Math.max(0,inputOffsetMs)/1000`을 더한다. C06/P07의 허용 ±250ms에서 +250ms 입력을 기존 +240ms onset 마감이 먼저 miss로 확정하던 오류를 재현한 뒤 수정했다. 음악 목표·오디오 gate·등급 판정창·dispatch 100ms·raw receipt 지연 200ms 기준은 바꾸지 않는다. 음수 보정으로 기존 대기를 줄이지 않는다. `integration-calibration.test.ts`는 양수/음수 완벽 연주·무입력·마지막 release 확정·늦은 충돌을 검증한다.
