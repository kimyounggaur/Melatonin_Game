# 밤실 공방: 꿈을 잇는 리듬
## Melatonin의 꿈 장면형 리듬 경험에서 영감을 받은 독립 교육 게임 개발 설계서

- 문서 버전: 1.0 / 2026-10-18
- 대상: 음악 이론을 처음 배우는 일반 학습자. 연령 제한을 가정하지 않는다.
- 플랫폼: 모바일·데스크톱 웹. 한국어 우선, 키보드 또는 한 손가락.
- 결과물의 상태: **개발 설계 및 검증 가능한 예시 데이터**. 게임 구현, 실제 기기 테스트, 음원 제작, 원본 이미지 교정, 배포를 완료했다는 뜻이 아니다.
- 핵심 결정: 네 꿈 장면, 아홉 학습 모티프, 하나의 입력 버튼. 여러 교재 이미지의 개념을 함께 쓰되 한 장면에 새 개념은 하나씩 도입한다.
- 독립성: 다른 기존 프로젝트와 연결하지 않는다. Melatonin의 캐릭터·스테이지·음악·색 조합·UI를 복제하지 않는다.

---

## 1. 기획 요약과 제작 범위

### 1.1 한 문장 소개

꿈속 수선사 ‘여울’이 끊어진 밤의 풍경을 **누르기, 이어 누르기, 제때 놓기, 기다리기**로 복원하면서 음의 길이와 붙임줄, 점음표·점쉼표, 박의 묶음, 빠르기를 몸으로 배우는 리듬 게임이다.

처음에는 음악과 사물의 움직임을 따라 한다. 연주가 끝나면 방금 한 행동을 짧은 악보와 수치로 확인한다. 악보를 먼저 읽어야만 진행할 수 있는 게임으로 만들지 않는다. 결과 화면은 점수보다 ‘이번에 어떤 개념을 실행했는가’를 먼저 보여 준다.

### 1.2 참고작에서 가져오는 추상적 원칙

[Melatonin 공식 소개](https://www.halfasleep.games/melatonin/)는 꿈을 소재로 한 여러 리듬 장면, 손그림 미술, 음악을 소개한다. 본 설계는 ‘장면 속 행동 자체가 리듬 단서가 된다’는 높은 수준의 방향만 참고한다. 아래의 수선사, 실빛다리, 반달 온실, 접히는 방, 구름 우체역, 악곡과 판정 방식은 새로 설계한다. 참고작의 특정 레벨을 이름만 바꿔 재현하지 않는다.

### 1.3 MVP 고정 범위

| 항목 | MVP 결정 | 제외 또는 V2 |
|---|---|---|
| 장면 | 4개, 공통 한 버튼 입력 | 무제한 신규 미니게임 제작 |
| 학습 모티프 | 이 문서의 L01~L09, 고정 데이터 | 생성형 실시간 출제 |
| 음악 | 박자별 직접 만든 클릭·드론·짧은 멜로디, 런타임 합성음으로 먼저 검증 | 라이선스 불명 상업 음원, 마이크 채점 |
| 음가 | 8분·4분·2분, 점4분음표·점4분쉼표의 제한적 용례 | 32분·겹점·복잡한 잇단음표 |
| 박자 | 4/4, 비교 수업의 3/4·6/8 | 혼합박자, 레벨 안의 박자 변경 |
| 빠르기 | 모티프별 고정 BPM; 동일 패턴 72와108 비교 | 플레이 중 임의 BPM 변경·가속 |
| 이론 화면 | 직접 만든 벡터 설명 + 선택형 한 줄 리듬 악보 | 오류 원본 PNG를 정답으로 재사용 |
| 저장 | 이 기기 localStorage, 버전 있는 진행 기록 | 계정·학생 이름·서버·순위표·결제 |
| 접근성 | 무실패 연습, 시각/소리 단서, 색 외 모양, 움직임 축소, 키 재지정 | ‘모든 장애 유형에 완전 접근 가능’이라는 검증되지 않은 주장 |

V2는 기존 네 장면의 확장만 허용한다. 당김음은 실빛다리, 2:1 스윙은 구름 우체역의 선택 수업으로 추가한다. 교정·교육 검수 관문을 통과하기 전에는 메뉴에서 활성화하지 않는다.

### 1.4 성공 조건

1. 학습자가 붙임줄 중간의 두 번째 음표에서 다시 누르지 않고 소리를 이어 간다.
2. 점4분 길이 720 tick을 4분 480 tick + 8분 240 tick과 연결한다.
3. 쉼은 게임 정지가 아니라 담당 성부가 침묵하는 시간임을 안다.
4. 같은 여섯 8분음표를 3/4의 2+2+2와 6/8의 3+3으로 비교한다.
5. 4분음표 기준 72 BPM과108 BPM에서 음가 비율은 같고 실제 시간이 달라짐을 경험한다.
6. 모르는 용어가 있어도 듣기→연습→연주→설명 순서로 시작할 수 있다.

초기 사용성 검증 목표는 8~12명의 초보자가 안내 후 L02의 붙임줄을 2회 연속 재타격 없이 수행하고, 두 박자 비교 문제 4개 중3개를 맞히는 것이다. 이는 **검증 계획**이며 이미 달성된 교육 효과가 아니다. 소규모 결과를 일반적인 학습 효과로 과장하지 않는다.

## 2. 교재 활용과 음악적 교정 관문

### 2.1 근거와 확인 범위

기준 문서는 [113개 원본 전수 분석·오류 및 보완 보고서](https://docs.google.com/document/d/1Mbtlky-yiBefNoYpNSFJwb6zp-0Rn72-0bD5tx67oJg/edit)이다. 본 설계 작성에서 보고서의 해당 항목을 읽었고, **017.png와032-3.png는 원본 이미지를 직접 열어 재확인했다**. 다른 항목은 보고서에 근거한 상태 표시이며 이 설계 작업에서 다시 시각 검수했다고 주장하지 않는다.

음악의 정답은 PNG의 픽셀이나 OCR 결과에서 자동 추출하지 않는다. 교육자 검수 대상인 `NotationEvent` 정규 데이터 하나에서 악보, 소리, 화면, 정답을 함께 만든다. 아래 예시 데이터의 합계 검사는 수행할 수 있지만 최종 악보 렌더링과 청음의 사람 검수는 개발 단계에서 별도로 해야 한다.

### 2.2 원본→학습 행동 매핑

| 원본 | 보고서 판정·주의 | 게임 활용 | 출고 상태·필요 조치 |
|---|---|---|---|
| 004 음표 길이 | 수치에 뚜렷한 오류 미발견, ‘4분=1박’ 조건 보완 | L01의 짧고 긴 실, L08/09 시간 비교 | 개념 사용 가능. 원본 배치 전 문구·권리 확인 |
| 017 붙임줄 | 개선 제안. 같은 음의 길이 합, 4분=1박 조건 필요 | L02 같은 마디 붙임줄, L03 마디선 넘기 | 직접 확인. 새 도식에 단위·실제 마디선 표시 후 사용 |
| 006 점음표 | 수치는 맞지만 피자 분할 면적 재검수 | L04의 2칸+1칸 꽃잎 | 원본 비율 그림 사용 보류. 480+240의 균등 폭 도형으로 새 제작 |
| 007 점쉼표 | 반박·1/8박 그림 면적 불일치 의심, 점온쉼표6박 설명 주의 | L05에서 6/8 큰박 하나를 쉬기 | 원본 사용 보류. 6/8 점4분쉼표720 tick으로 새 도식 제작 |
| 032-3 3/4와6/8 | 설명·음표수 일치. 6/8의 큰박=점4분 명시 필요 | L06/07의 접히는 방 | 직접 확인. 공통 여섯 작은 단위를 새로 그려2+2+2 대3+3 비교 |
| 030-1 빠르기 | BPM은 분당 박동 수. 기준 음표가 같아야 숫자 비교 가능 | L08/09의 같은 모티프 다른 속도 | ‘4분음표=72/108’ 표시. 분당 마디 수라고 하지 않음 |
| 054 당김음 | 4/4 예시가 각각2박·3.5박, 다른 음의 곡선을 타이처럼 표현 | V2 실빛다리의 약박 시작 | **출고 차단**. 각 마디1920 tick, 동음 붙임줄 재기보·청음 통과 필요 |
| 031-3 스윙 | 셋잇단2:1 설명 대 점음표3:1 악보 충돌 | V2 구름 우체역의 긴-짧은 이동 | **출고 차단**. 320+160 tick 모델과 새 악보 일치 필요. 모든 재즈가 고정2:1이라는 설명 금지 |

017 원본 링크: https://drive.google.com/file/d/1sqKEmCF-HSOHjHM9p6L4HhTjfMsYTJrX/view  
032-3 원본 링크: https://drive.google.com/file/d/1Tf75AOzgm2MDL6EHHDVIDzC9Up1k09IP/view

‘개념 사용 가능’은 원본 이미지 전체가 무오류이거나 배포 권리가 확인됐다는 뜻이 아니다. 원본 PNG를 게임 패키지에 넣는 것은 별도 권리 확인 후 결정한다. MVP 기본값은 원본 미포함, 개념만 새 그림으로 설명하는 방식이다.

### 2.3 반드시 고정할 음악 규칙

- 내부 길이 단위 `q`는 4분음표 길이이며, 교육상 ‘박’과 구분한다. PPQ=480이므로 q=480 tick.
- 음표의 기본 길이: 온1920, 2분960, 4분480, 8분240, 16분120 tick. 이 값은 상대 길이이며 초 단위 고정 시간이 아니다.
- 한 점은 원 길이의 절반을 더한다. 점4분은720 tick이다. 점이 ‘반박을 늘 붙인다’고 가르치지 않는다.
- 붙임줄은 같은 높이의 인접 음을 하나의 소리로 유지한다. 중간에는 새 attack이 없다. 음이름 철자까지 같은지 검사한다.
- 이음줄은 프레이즈·아티큘레이션을 나타내며 여러 음을 하나의 긴 동음으로 합산하는 붙임줄이 아니다. 본 게임은 이음줄을 연주 입력으로 평가하지 않는다. 비교 카드에는 ‘여러 음을 부드럽게 잇는 표시’라고 설명하고, 모든 악기의 구체적인 발음 방식을 한 버튼으로 단정하지 않는다.
- 3/4: 한 마디1440 tick, 4분 큰박3개, 8분 단위는2+2+2.
- 6/8: 한 마디1440 tick, 일반적인 복합2박 학습에서는 점4분 큰박2개, 8분 단위는3+3. 느린 곡의 세는 방식까지 부정하지 않고 ‘이 수업에서는 큰박 둘로 느껴 본다’고 쓴다.
- 쉼표는 학습자가 담당하는 성부의 무음이다. 반주·기본박 단서는 계속 들릴 수 있다. ‘쉼표가 나오면 모든 음악이 멈춘다’는 연출 금지.
- 실시간 게임 입력의 `hold`는 지속 시간 학습을 위한 인터페이스다. 피아노·관악기·현악기에서 붙임줄을 실현하는 물리 행동이 모두 같은 것은 아니다.

음가·점·붙임줄 원칙의 외부 확인: [Open Music Theory: Notating Rhythm](https://viva.pressbooks.pub/openmusictheory/chapter/notating-rhythm/). 복합박 설명 확인: [Open Music Theory: Compound Meter](https://viva.pressbooks.pub/openmusictheorycopy/chapter/compound-meters-and-time-signatures/). 아래의 UI·수치·판정·장면은 이 원칙에 기초한 독자적인 제품 설계 결정이다.

### 2.4 교육 자산 출고 파이프라인

`원본 참조 → 교정 문장 → 정규 음악 데이터 → 마디/타이 검증 → SVG 악보·비례 도식·음원 생성 → 사람이 보며 듣기 → 승인 manifest → 빌드 포함`.

자산 manifest 필드: `assetId, conceptId, originalSourceId, sourceUrl, sourceRevision, rightsStatus, correctionNotes, dataHash, rendererVersion, mathValidation, notationReview, listeningReview, reviewer, reviewedAt, releaseApproved`.

- `rightsStatus`는 `unknown/owned/licensed/permissionGranted` 중 하나. 원본 복제에는 unknown 허용 금지.
- 본 설계의 새 패턴은 `mathValidation=passed`가 가능해도 `notationReview/listeningReview=pending`이면 최종 교육 자산 승인 전이다.
- `releaseApproved`는 임의로 true로 기본 설정하지 않는다. 음표 합계 통과가 음원·악보 시각 검수까지 대신하지 않는다.
- 앱에는 승인된 자산만 들어간다. 개발 모드에는 미승인 표시가 보이되 사용자 연주 화면에는 오류 원본을 ‘예제’로 노출하지 않는다.

## 3. 이야기·장면·미술의 구체 설계

### 3.1 세계와 공통 화면 언어

여울은 밤마다 잠든 마을의 찢어진 풍경을 꿰맨다. 작은 직물새 ‘솜새’가 먼저 리듬을 보여 준다. 적이나 추격은 없고, 실수하면 풍경의 일부가 투명해졌다가 다음 패턴에서 복원된다. 학습자의 실패를 비난하는 대사, 목숨, 시간 구매는 없다.

미술은 짙은 남색 종이에 오려 붙인 직물·실크스크린 질감이다. 기본 팔레트는 배경 `#142A35`, 종이 `#F3E8C9`, 실빛 `#E3B85D`, 잎 `#65A69A`, 오류 윤곽 `#D77467`. 색만으로 정오를 구별하지 않는다. 성공은 둥근 매듭, 실수는 벌어진 매듭과 작은 문자. 과한 네온·전면 섬광·다중 패럴랙스는 쓰지 않는다.

캐릭터 실루엣: 여울은 사각 앞치마, 원형 바늘집, 얼굴에 두 점과 짧은 코. 솜새는 길쭉한 재봉추 몸과 접힌 부직포 날개. 참고작의 인물 의상·얼굴·색조를 재사용하지 않는다. 캐릭터가 입력 성공 때만 크게 움직여 박을 가리는 것도 금지한다.

### 3.2 장면 A: 실빛다리

**학습:** L01 음가, L02 붙임줄, L03 마디선을 넘는 붙임줄. 004+017 활용.

- 구성: 왼쪽 고정 실감개(x=18%), 중앙 바늘귀(x=52%, y=55%), 오른쪽 풀리는 리본(x=82%). 풍경 뒤에는 작은 등불4개가 박 단서를 준다.
- 시작 단서: 실 끝의 **닫힌 원**이 바늘귀에 닿을 때 누른다. 접근2q 전부터 보인다. 원이 닿기0.25q 전 솜새가 고개를 한 번 기울인다.
- 유지 단서: 리본의 내부에 동일 폭 작은 칸이 있고, 누르는 동안 바늘귀 뒤에 실이 채워진다. 예상 길이는 리본 길이와 칸수로 예고한다.
- 끝 단서: 리본 끝의 **빈 원**이 바늘귀에 닿을 때 놓는다. 끝 원은 시작부터 보인다. 갑자기 나타나는 놓기 신호 금지.
- 붙임줄 경계: 같은 색·높이 리본의 중간에 작은 부드러운 매듭을 그린다. 이 매듭이 바늘귀를 통과할 때 바늘은 계속 열려 있고 새로운 반짝임·클릭은 발생하지 않는다. 두 번째 눌러야 할 원으로 그리지 않는다.
- 마디선: L03에서 다리 기둥 하나가 리본의 뒤를 지나간다. 기둥은 리본을 자르지 않는다. 이때 손을 떼지 않고 이어 가면 다리 중앙이 연결된다.
- 실패: 너무 일찍 놓으면 현재 실이 끊어지고 남은 부분이 점선이 된다. 다음 입력부터 다시 이어 간다. 미스 때문에 배경 음악이나 다음 도착 시각을 늦추지 않는다.
- 결과 시각: ‘시작1회, 유지2q’ 아래 4분+4분 붙임줄과2분음표를 나란히 보인다. 음 높이는 모두 C5로 동일하다. 중간에 눌렀다면 중간 매듭에만 분홍 점선을 표시한다.

### 3.3 장면 B: 반달 온실

**학습:** L04 점음표, L05 점쉼표. 006+007을 교정한 새 비례 도식 활용.

- 구성: 중앙 꽃봉오리, 왼쪽에 두 칸짜리 물통, 오른쪽에 한 칸짜리 이슬병. 두 병은 같은 높이·같은 칸 폭이라 면적비가2:1이다.
- 점4분음표: 4분 길이를 두 작은 칸(480 tick), 점을 한 작은 칸(240 tick)으로 표현한다. 3칸 리본에 누른 채 물을 붓는다. 한 칸이 늘어나는 순간은 재타격 신호가 아니다.
- 꽃봉오리는 시작 때 열린다. 유지 동안 3단계로 펴지고 끝 빈 원에서 놓으면 꽃잎이 고정된다. 중간 조기 release면 끝 꽃잎만 접혀 길이 차이가 보인다.
- 쉼의 시각: L05에서는 꽃의 닫힌 덮개와 ‘기다리기’ 아이콘이 보인다. 여섯 작은 이슬칸 중 처음3칸을 건너뛴 뒤4·5·6번째 이슬에 가볍게 탭한다. 덮개를 누르거나 길게 누르고 있어도 다음 음을 자동으로 얻지 않는다.
- 연출: 반주는 유지되며 담당 꽃의 음만 쉬게 한다. 쉼 동안 화면이 정지하거나 어두워져 시간 감각을 없애지 않는다.
- 순서 주의: L04는 일찍 열지만 L05는3/4·6/8 비교를 경험한 뒤 같은 온실로 돌아와 연다.6/8의 점4분쉼표를 모르는 박자표에서 먼저 강요하지 않는다.
- 결과 카드: `2칸+1칸=3칸`, 아래 `4분480 + 8분240 = 점4분720 tick`의 개념 도식. 실제 사용자에게 tick은 고급 정보 펼치기에서만 노출한다.

### 3.4 장면 C: 접히는 방

**학습:** L06 3/4, L07 6/8.032-3 활용.

- 구성: 방 바닥에 같은 크기 타일6개가 좌우로 펼쳐진다. 작은 리듬은 두 레벨 모두 같은 속도로 진행한다.
- 3/4: 바닥이 타일2개씩 세 경첩으로 접힌다. 큰 곡선3개, 소리 강세는 강-약-약. 숫자 ‘1 & 2 & 3 &’는 연습 보조에서만 보인다.
- 6/8: 바닥이 타일3개씩 두 경첩으로 접힌다. 큰 곡선2개, 첫 묶음의 시작이 가장 크고 두 번째 묶음 시작은 중간. 숫자 ‘1 라 리 2 라 리’로 표시한다.
- 입력은 모든 작은 타일 도착 때 탭6회로 동일하다. 비교의 핵심은 입력 수 차이가 아니라 **묶음·강세 차이**다. 탭6회 성공만으로 박자 구별을 숙달했다고 기록하지 않는다.
- 별도 전이 문항: 연주 후 소리와 접힘을2마디 들려주고 ‘둘씩 세 묶음 / 셋씩 두 묶음’ 버튼 중 하나를 선택한다. 박자표는 답변 후 보여 준다. 이 선택은 리듬 판정과 별도인 개념 문항이다.
- 시각 도움 켜기/끄기 가능. 화면 도움을 끈 연습에서도 기준 박 소리는 유지한다. 청각 단독이 어려우면 같은 문항을 시각 묶음으로 풀 수 있으나 기록에는 사용한 도움 종류를 남긴다.
- 기본박 클릭의 상대 gain은 마디 첫 큰박 0.8, 다음 큰박 0.55, 작은 분할 0.3으로 시작한다. 손가락 압력이나 탭 세기로 강세를 채점하지 않는다. 클릭·경첩 움직임이 묶음을 알려 준다. 이 gain은 믹스 후 청음으로 조정하되 큰박 구조는 그대로 둔다.
- 메트로놈 표시: L06 `4분음표=90`, L07 `점4분음표=60`. 내부 두 레벨 모두 quarterBpm=90이라8분 길이는333.333ms로 같다. 숫자90과60을 숨기거나 같은 단위인 듯 비교하지 않는다.

### 3.5 장면 D: 구름 우체역

**학습:** L08/09 같은 패턴, 다른 빠르기.030-1 활용.

- 구성: 여울은 고정된 우편 창구, 구름 편지4개가 한 마디에 한 번씩 도착한다. 편지 사이에는8분쉼표 길이의 빈 공간.
-4분 기준72에서는8분이416.667ms,108에서는277.778ms. 편지 모양·순서·4/4·리듬은 같다.
- 템포가 바뀌는 것은 L08을 끝내고 L09를 시작할 때뿐이다. 표지의 기준 음표와 숫자를 먼저 바꾸고 새 템포의 한 마디 카운트인을 준다.
- 앞 레벨의 성공 점수 때문에 몰래 빠르게 하지 않는다. 사용자가 선택한 연습 속도는 항상 화면에 표시한다.
- 효과: 정확한 탭이면 편지가 접혀 별자리 하나가 된다. 빠르게 눌렀다고 편지를 앞당겨 받거나 다음 편지를 당기지 않는다.
- 마지막 화면은 같은 패턴 두 줄과 각 소요시간을 나란히 재생할 수 있게 한다. ‘리듬의 비율은 같고 흐르는 속도가 달라졌어요.’

### 3.6 전환과 성능 한도

장면 사이 전환은600ms 종이 접기. 연주가 끝나고 모든 판정이 확정된 뒤에만 한다. 장면당 배경1장, 주요 오브젝트12개 이하, 파티클동시24개 이하, 최대 음성8개를 초기 예산으로 잡는다. 화면 흔들림은 기본 꺼짐. 종이 질감은 작은 타일을 반복하며 거대한 비압축 배경을 넣지 않는다.

## 4. 화면 흐름·입력·접근성

### 4.1 전체 흐름

`시작 → 소리 켜기/볼륨 → 선택적 지연 보정 → 꿈 지도 → 수업 카드 → 듣기 → 연습 → 연주 → 결과 → 다음 꿈/취약 구간 연습`.

- 최초 시작 버튼은 실제 사용자 제스처 안에서 AudioContext를 생성/재개한다. resume이 실패하면 ‘소리를 켜고 다시 시작’과 재시도 버튼만 보이며 무음 상태로 채점하지 않는다.
- 듣기: 솜새가 해당 모티프2회 시연한다. 학습자 입력은 점수에 넣지 않는다. 시연 중 입력하면 가벼운 그림 반응만 주고 정답 소리를 덮지 않는다.
- 연습: 한 마디 카운트인 뒤 모티프2회. 정답 소리를 낮게 겹쳐 들을 수 있다. 기본속도75%·100% 선택. 시간창을 바꾸면 도움 배지를 붙인다.
- 연주: 한 마디 카운트인 뒤 모티프4회. 정답 멜로디는 재생하지 않고 반주·장면 단서·사용자 음만 낸다. 입력이 없으면 담당 멜로디도 없다. 자동 시연을 플레이 점수로 기록하지 않는다.
- 종료: 마지막 release 늦음창, dispatch grace, 오디오 release tail을 모두 기다린 뒤 1마디의 마무리 풍경. 결과 저장은 한 번만 한다.
- 연습 후 연주 이동은 사용자의 ‘이제 해보기’ 선택으로 진행. 읽기 속도를 임의의 카운트다운으로 제한하지 않는다.

### 4.2 반응형 레이아웃

| 영역 | 데스크톱 ≥900px | 모바일 세로320~899px |
|---|---|---|
| 상단 | 높이64px, 장면명·진행·일시정지 | 높이56px+safe-area, 같은 세 요소 |
| 장면 | 중앙16:9, 최대1200px 폭 | 중앙4:3, 바늘귀/꽃 등 타깃은 중앙 유지 |
| 입력 영역 | 하단 높이112px, Space 안내와 큰 버튼 | 하단 높이최소128px, 전체 폭 큰 누르기 영역 |
| 교육 도움 | 장면 아래 접기 가능 한 줄 | 결과에서 열기, 연주 중 기본 접힘 |
| 결과 | 최대640px 단일 카드 | 화면 전체 스크롤, 버튼가로2개 이하 |

전체 canvas를 단순 축소해 모바일 표적을 작게 만들지 않는다. `LayoutTransform`이 논리 위치를 재배치한다. 타격 타깃은 화면 너비의 중앙±20% 이내, 액션 버튼은 최소72px 높이, 보조 버튼44×44 CSSpx 이상. 글자 기본16px, 설명18px, 줄간격1.5. iOS safe-area를 반영한다. 가로 전환은 재배치 후 자동 일시정지 상태에서 재개한다.

연주 중 기본 HUD는 ‘장면명’, 진행4개 작은 매듭, 일시정지뿐이다. 매 프레임 점수 숫자, 큰 콤보, 악보, 템포 설명을 동시에 띄우지 않는다. 정밀 오차는 연습에서만 작은 ‘조금 빨라요/늦어요’, 결과에서 상세값을 제공한다.

### 4.3 입력 계약

- 기본 키: Space. 설정에서 F/J/Enter 중 하나로 변경 가능. 키보드 이벤트는 `event.code` 기준.
- 터치/마우스: 액션 영역의 Pointer Events만 사용. `pointerdown`→누르기, `pointerup`→놓기. `click`을 추가 판정 경로로 사용하지 않는다.
- hold의 시작 키·포인터가 owner다. 다른 키/손가락은 대신 놓을 수 없다. 동시 두 번째 포인터는 판정·소리 없이 무시한다.
- 키 자동반복(`repeat=true`)을 버린다. 한 물리 down으로 다수 음을 판정하지 않는다.
- 액션 영역에서만 `touch-action:none`; 문서 전체 스크롤을 막지 않는다. 정상 down에서 pointer capture를 잡고 정상 up 후 해제한다.
- 활성 hold 중 손가락이 버튼 밖으로 이동해도 capture가 유지되면 계속 누르는 것으로 본다. pointercancel 또는 예기치 않은 lostpointercapture는 정상 release로 점수화하지 않고 해당 프레이즈를 중단한다.
- hold가 끝난 뒤 계속 누르는 상태로 다음 onset을 자동 성공시키지 않는다. 반드시 up→새 down이 필요하다.
- tap은 down만 채점한다. tap 음의 음악적 길이는 데이터로 재생되고 물리적인 up 시간은 평가하지 않는다. 따라서 tap 성공으로 ‘길이 유지 숙달’을 주지 않는다.
- 동일 timestamp의 up/down은 기록의 수신 순번을 보존한다. 한 사용자에게 up 다음 down이 실제로 들어온 경우만 새 음을 시작한다. 시간값만으로 이벤트를 임의 뒤집지 않는다.
- 일시정지 메뉴·설정·문항 버튼의 입력은 Action 입력으로 전파하지 않는다. 메뉴 닫기의 keyup이 연주 release로 섞이지 않도록 세대 ID를 바꾼다.

### 4.4 접근성 모드

1. 소리 단서: 리듬 클릭, 시연 멜로디, BGM, 효과음을 개별 볼륨으로 제어. 기본값 각각70/80/45/60%에서 최종 믹스를 실제 장치로 점검한다.
2. 시각 단서: 고대비 윤곽, 큰 타깃, 큰박 카운트 표시. 색 외 닫힌 원·빈 원·점선으로 시작/끝/쉼을 구별.
3. 움직임 축소: `prefers-reduced-motion`을 초기값에 반영. 화면 흔들림·파티클·배경 이동 제거, 타깃의 선형 접근이나 고정 게이지 유지. 음악 시간을 줄이거나 멈추지 않는다.
4. 부담 완화: 연습은 무제한, 실패로 수업 잠그지 않음. 보조모드에서 hold를 시작탭/끝탭 방식으로 바꿀 수 있으나 `assistMode=toggleHold`로 별도 기록하고 ‘실제 누름 유지’ 숙달 측정에서 제외.
5. 메뉴·설명·결과는 실제 DOM 버튼·텍스트로 제공한다. canvas 픽셀에만 중요한 정보 저장 금지. 스크린리더에게 매 노트 알림을 폭주시키지 않고 상태 전환과 결과만 announce한다.
6. 텍스트/비시간제 개념 문제를 대안으로 제공한다. 시각 리듬 모드가 청각 학습 목표까지 검증했다고 주장하지 않는다.
7. 진동은 기본 꺼짐. 지원 장치에서 명시적으로 켠 경우만 보조 단서로 쓰며 진동 타이밍을 채점 기준으로 삼지 않는다.

## 5. 타이밍 엔진과 음향 규약

### 5.1 세 가지 시간과 단위

- 음악 시간: 정수 tick, PPQ=480. 프레임 누적이나 소수 q를 원본 데이터로 저장하지 않는다.
- 오디오 시간: `AudioContext` 초. 예약 재생의 master clock.
- 입력/UI 시간: `performance.now()`와 같은 기원의 DOM timestamp. 오디오 출력 시점과 매핑해 사용한다.

고정 템포 변환:

```text
quarterSeconds = 60 / quarterBpm
secondsAtTick(tick) = tick / 480 * quarterSeconds
barTicks = meter.n * (4 / meter.d) * 480
scheduledAudioTime(tick) = transportStartAudioTime + secondsAtTick(tick)
```

6/8이라고 내부480 tick을 큰박으로 부르지 않는다.6/8 큰박720 tick의 초 길이는 `720/480*60/quarterBpm`이다. 표시 BPM은 `quarterBpm / 1.5`로 변환한다. 3/4와6/8 비교에서 내부90이면 표시90과60이 된다.

### 5.2 재생 예약

- 렌더 루프는 위치를 그릴 뿐 음 재생 시점을 결정하지 않는다. `setTimeout` 만료 순간이나 canvas 충돌을 정답 시각으로 삼지 않는다.
-25ms 간격 스케줄러가 `ctx.currentTime+150ms`까지의 시연·클릭·반주 이벤트를 예약한다.150ms는 초기 엔지니어링 값으로 프로파일링 후 조정하되 판정창을 몰래 변경하지 않는다.
- 정답 시각은 불변 `start+tickToSeconds`. 매 tick마다 이전 이벤트 시간에 길이를 더하지 말고 절대 위치로 계산해 누적 드리프트를 피한다.
- AudioBufferSourceNode는 다시 start할 수 없으므로 재시도·재개 때 새 node를 만든다. [예약 재생 API](https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/start)의 시간 좌표를 따른다.
- 미래에 예약된 node도 세션별 목록으로 관리한다. 중단하면 master gain을8ms fade-out하고 해당 세션 node를 stop/disconnect한다. 이전 세션의 예약음을 다음 카운트인에 남기지 않는다.
-100ms를 넘는 scheduler gap으로 이미 재생돼야 할 이벤트가 예약되지 못했다면 catch-up 소리를 몰아내지 않는다. 시스템 중단으로 현재 프레이즈를 무효화하고 재개 안내로 이동한다. 실수로 처리하지 않는다.

### 5.3 입력 timestamp·지연 보정

지원될 때 `getOutputTimestamp()`의 쌍을 사용한다. `contextTime`은 출력 위치이고 `performanceTime`은 그 출력의 예상 performance 시각이다. [API 설명](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/getOutputTimestamp).

```text
inputPerfMs = normalizeDOMTimestamp(event.timeStamp)
audibleAudioSec = output.contextTime + (inputPerfMs-output.performanceTime)/1000
rawErrorMs = 1000 * (audibleAudioSec-targetAudioSec)
correctedErrorMs = rawErrorMs - calibration.inputOffsetMs
```

- 부호: +80ms 보정은 ‘기본적으로80ms 늦게 관측되는 입력’을 의미하며 raw에서80을 뺀다. 양·음 부호를 UI 미리보기로 확인한다.
- `getOutputTimestamp`를 사용하면서 baseLatency/outputLatency를 다시 빼지 않는다. 이중 보정 금지.
- 미지원·초기값이0·값이 불연속이면 fallback을 표시한다. `currentTime`과performance 쌍을 잡고 보고된 baseLatency·outputLatency로 추정하되 누락값은0으로 처리, 사용자 보정을 우선한다. 추정값을 실제 측정 지연처럼 표기하지 않는다.
- 시각 위치는 동일 audible time 매핑에서 계산한다. `visualOffsetMs`는 그림만 이동하며 판정점수에는 영향이 없다.
- DOM timestamp의 epoch 기반 예외는 `performance.timeOrigin`으로 정규화한다. 정규화 후 현재performance와5초 넘게 어긋나면 시스템 시간 오류로 중단한다. 조용히0ms 오차로 바꾸지 않는다.
- 보정 화면:4박 예고 후16개의 고정 클릭에 탭. 처음4개 제외, 나머지12개 오차의 중앙값. 절대편차 중앙값(MAD)>45ms면 불안정 안내와 다시하기/그대로 연습 선택. 자동 적용 범위는±250ms, 사용자가 확인 후 저장. 실패 보정을 강제하지 않는다.
- 보정에는 사람의 반응 편향이 섞이므로 ‘장치의 물리 지연을 정밀 측정했다’고 말하지 않는다. 입력 장치·오디오 경로·브라우저가 바뀌면 재보정 안내. Bluetooth에서는 잔여 지연 가능성을 설명한다.
- 보정값은 현재 기기 설정에만 저장, 난이도나 이전 점수를 사후 재계산하지 않는다. 연주 중 자동 보정으로 실력을 보정해 버리지 않는다.

### 5.4 소리 gate와 붙임줄

`NotationEvent[]`를 `SoundGate[]`와 `InputExpectation[]`으로 컴파일한다. 같은 tieGroup의 연속 동음들을 합쳐 **한 gate, 한 onset, 한 release**로 만든다. notation에는 원래 두 음과 곡선을 남긴다.

| 상황 | 시연/정답 소리 | 사용자 연주 소리 | 채점 |
|---|---|---|---|
| tap | 정의된 시작~끝 한 음 | 유효 down에 즉시 시작, 원래 예약된 gate 끝에서 자동 종료 | onset만 |
| 일반 hold | 정의된 시작~끝 | 유효 down에 시작, owner up에 종료 | onset+release |
| tied hold | 첫 음부터 마지막 끝까지 하나 | 중간 boundary에서 envelope 재시작 금지 | 합친 onset+release |
| rest | 담당 성부의 gate 없음 | 오입력에 pitched sound 없음 | 쉼 행동 기록 |
| onset miss | 시연은 정상 | 해당 음을 자동 재생하지 않음 | 기대 항목0점 |

- 사용자 발음은 입력을 과거 audio 시각으로 예약하지 않는다. 현재 audio 시간+최대3ms의 안전 여유로 시작한다. 판정 timestamp와 실제 발음 예약 timestamp를 분리한다.
- hold의 소리는 실제 놓음에 반응한다. 이른 release에서 정답 길이까지 자동으로 소리를 늘려 오류를 감추지 않는다. 단, OS cancel은 시스템 중단으로 처리한다.
- 최종 끝+release 허용창을 넘겨 누르면 소리를 자동 종료한다. 점수 최종 확정은 dispatch grace까지 기다리지만 음을 그만큼 더 늘리지 않는다. 물리 owner는 up까지 남아 다음 onset의 자동 성공을 막는다.
- 모든 gate attack5ms/release8ms의 짧은 경사로 클릭음을 줄인다. 교육상 길이의 기준은 gate 명령 시점이며 잔향은 별도 wet bus로 제한한다. 유지 학습의 lead에는 긴 reverb를 넣지 않는다.
- tieGroup 내부 노드 경계에서는 클릭·볼륨 펄스·새 particle을 만들지 않는다. 이것이 재타격 교육으로 잘못 전달되기 쉽다.
- tap은 실제 늦은 down에서 duration만큼 다시 세지 않는다. `targetEndAudioSec = transportStart + tickToSeconds(endTick)`을 고정 종료점으로 사용한다. 늦게 누르면 남은 길이만 들려주므로 다음 쉼을 침범하지 않는다. 짧은 release ramp도 이 종료점 안에서 끝낸다. 오디오 처리를 시작할 때 목표 끝이 이미 지났다면 pitched sound는 생략하고 시각 피드백만 준다. 채점은 원래 입력 timestamp에 따른다. 이 경우를 진단 로그에 남기며 과거 시각으로 start하지 않는다.

### 5.5 일시정지·포커스·재개

사용자 pause, `visibilitychange:hidden`, window blur, AudioContext의 예기치 않은 non-running 상태, pointercancel, 오디오 경로 변경, WebGL context loss는 모두 `INTERRUPT`다. [Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)와 [Pointer Events](https://www.w3.org/TR/pointerevents/#the-pointercancel-event)의 실제 이벤트를 사용한다.

1. 현재 프레이즈의 임시 점수·입력 로그를 폐기한다. 이미 확정된 이전 프레이즈는 보존한다.
2. 오디오 fade/stop, owner 해제, 예약 이벤트 세대 ID 증가, 모든 누름 상태 clear.
3. 중단 원인을 짧게 보여 준다. 숨겨진 탭에서 게임을 계속 진행하거나 자동 실패 처리하지 않는다.
4. 사용자가 ‘이어하기’를 눌러 AudioContext가 running임을 확인한 후 해당 프레이즈 시작점으로 돌아간다.
5. 한 마디 카운트인. 카운트인에 남아 있는 누름이 있으면 ‘손을 떼고 시작’을 표시하며 입력 rearm 전에는 진행하지 않는다.
6. 중단 직전 hold의 중간부터 재개하지 않는다. 붙임줄은 첫 onset부터 다시 연습한다.

브라우저 자동재생 제한 때문에 사용자 제스처가 필요할 수 있다. [MDN 자동재생 안내](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)를 기준으로 구현하며 자동재생 차단을 사용자 실수로 기록하지 않는다.

## 6. 상태기계·이벤트·입력 중재

### 6.1 세션 상태기계

| 상태 | 입장 작업 | 허용 이벤트 | 다음 상태 |
|---|---|---|---|
| BOOT | 설정·진행 로드, 스키마검사 | LOAD_OK/LOAD_FAIL | AUDIO_UNLOCK/ERROR |
| AUDIO_UNLOCK | 시작 버튼 대기 | USER_START + AUDIO_RUNNING | MAP |
| MAP | 수업 목록·권장 순서 | SELECT_LEVEL | LESSON |
| LESSON | 목표1문장·보조모드 | START_LISTEN/SKIP_LISTEN | COUNT_IN |
| COUNT_IN | 새 transport epoch, 입력 rearm | COUNT_COMPLETE | LISTEN/PRACTICE/PLAY 중 지정값 |
| LISTEN | 시연2회, 무채점 | LISTEN_COMPLETE | PRACTICE_READY |
| PRACTICE_READY | 듣기 반복·연습·연주 선택 | START_PRACTICE/START_PLAY | COUNT_IN |
| PRACTICE |2회 모티프, 보조 가능 | PHRASE_END | PRACTICE_REVIEW |
| PRACTICE_REVIEW | 오개념1개와 선택 버튼 | REPEAT/PLAY | COUNT_IN |
| PLAY | 4회 모티프, 점수 누적 | LAST_WINDOW_AND_DISPATCH_GRACE_CLOSED | OUTRO |
| OUTRO |1마디 종료 연출 | OUTRO_COMPLETE | RESULTS |
| RESULTS | 점수1회 저장, 개념 문항 | RETRY/NEXT/FOCUSED_PRACTICE | LESSON/COUNT_IN |
| PAUSED | 소리중단, 현재 phrase rollback | USER_RESUME/EXIT | COUNT_IN/MAP |
| ERROR | 검증 실패 파일명·안내 | RETRY/EXIT | BOOT/MAP |

카운트인 동안에는 원칙적으로 채점하지 않지만, 첫 실제 onset의 이른 허용창에 들어온 마지막 구간의 down은 그 첫 onset에 정상 매칭한다. 더 이른 누름은 점수 없이 무시하고 다시 손을 떼어야 한다. 카운트인 상태라는 이유로 첫 음의 early 입력만 불리하게 막지 않는다.

모든 재생 상태에서 INTERRUPT→PAUSED. 상태 전환은 reducer 한 곳에서만 수행한다. scene 클래스가 직접 점수나 다음 상태를 변경하지 않는다. 사용자가 MENU로 나가면 resume 대상 세션을 종료하며 재진입은 새 시도다.

### 6.2 기대 입력 상태기계

- tap: `PENDING → HIT 또는 MISSED → FINAL`.
- hold: `PENDING → ACTIVE → RELEASED 또는 BROKEN 또는 OVERHELD → FINAL`.
- onset 시간이 늦음창과 dispatch grace를 모두 넘어가면 PENDING→MISSED. 한 hold의 onset을 놓치면 release도0점이며 다음 owner up을 release 성공으로 받지 않는다.
- ACTIVE에서 release 창보다 이른 up은 BROKEN. 그 뒤 다시 down해도 같은 hold를 복구하지 않는다. 연습 화면에서는 다시 눌러 보기 반응을 줄 수 있지만 점수·gate 정답을 새로 만들지 않는다.
- ACTIVE에서 release 창 안의 up은 RELEASED. 늦음창을 넘기면 음은 자동 종료하되 OVERHELD 점수의 최종 확정은 dispatch grace 뒤에 한다. 뒤늦게 정상 timestamp의 up이 들어오면 6.4의 전달 지연 규칙을 적용한다.
- tie 내부 경계는 표시용 `TIE_BOUNDARY`일 뿐 상태 전이를 일으키지 않는다.
- owner가 없는 up, 반복keydown, 추가 포인터는 아무 점수도 변경하지 않는다.

### 6.3 이벤트 버스 계약

```text
InputEdge { sessionId, sequence, source, ownerToken, edge: down|up|cancel,
            performanceMs, audioEstimateSec, calibrationRevision }
MusicalEvent { occurrenceId, type: ONSET|GATE_END|TIE_BOUNDARY|REST_START|REST_END|BEAT,
               tick, audioSec, sourceNotationIds }
JudgeEvent { occurrenceId, expectationId, type: ONSET_RESULT|RELEASE_RESULT|MISS|EXTRA_DOWN,
             errorMs, grade, points, reason }
TransportEvent { sessionId, type: START|INTERRUPT|RESTART_PHRASE|COMPLETE, reason? }
```

점수 저장은 sessionId 단위의 원장으로 관리한다. 기술적 지연으로 시도가 철회되면 그 sessionId의 결과를 제거하고 남은 유효 시도에서 best score·숙달을 다시 계산한다. 마지막 세션의 결과만 덮어쓰는 방식으로는 이전 최고점을 복구할 수 없으므로, 최근 유효 시도와 최고점의 근거 sessionId를 함께 보존한다. 실서비스 저장 용량을 제한할 때도 철회 가능한 현재 세션과 직전 최고점은 유지한다.

Id는 `levelId:phase:repetition:eventId` 형태로 유일하게 만든다. 다시 시작하면 sessionId가 달라진다. 이전 세션 이벤트는 reducer 입구에서 버린다. 소리와 장면은 JudgeEvent를 구독할 뿐 점수의 원천이 아니다.

### 6.4 입력 중재 순서

1. 입력 timestamp에 해당하는 transport 구간과 세션을 찾는다. 콜백이 실행된 순간의 sessionId만 무조건 붙이지 않는다. 막 끝난 세션의 기대 항목에 들어가는 늦은 edge는 8번의 기술적 지연 검사를 먼저 한다. 그 뒤 현재 세션·상태·장치 owner·중복 repeat를 검사한다.
2. 입력 timestamp를 정규화하고 보정한다. 원시 입력도 로컬 디버그 메모리에만 유지한다.
3. up은 현재 owner의 ACTIVE hold에만 전달. 그 밖의 up은 상태해제만 한다.
4. down은 현재 물리 owner가 없는 경우에만 평가. owner가 이미 있으면 추가 누름을 무시한다.
5. 후보는 시간창 안에 있는 **아직 PENDING인 onset**. 절대오차가 작은 것, 같으면 더 이른 onset, 다시 같으면 안정적인 ID 순서. 한 down은 한 후보만 소비.
6. 후보가 없으면 `EXTRA_DOWN`. 현재 active hold를 소유한 동일 물리 키의 repeat는 이 단계까지 오지 않는다.
7. 같은 JS turn에 수신된 입력을 먼저 처리한다. 입력의 음악적 허용창은 그대로 두고, 최종 miss/release 확정만 `target + lateWindow + dispatchGrace`까지 미룬다. `dispatchGrace=100ms`이며 이 100ms는 연주 허용창을 늘리는 시간이 아니라 브라우저 이벤트 전달을 기다리는 시간이다. `advanceTo()`와 `ingest()`를 별도로 테스트한다.
8. 입력 receipt와 정규화한 event timestamp 차이가 200ms를 넘으면 프레이즈를 기술적으로 중단한다. 이 값 이하라도 마감 때문에 MISSED 또는 OVERHELD로 확정한 항목(또는 FINAL의 사유가 onset_miss/release_timeout인 항목)에, 아직 처리하지 않은 정상 허용창 안 timestamp가 뒤늦게 도착했다면 해당 프레이즈를 rollback하고 새 카운트인으로 다시 시작한다. onset과 release 모두 적용한다. 과거 기대 항목을 timestamp로 대조한 뒤 처리하므로 이 전달 지연을 extra down이나 사용자 miss로 남기지 않는다. 이미 성공한 HIT/RELEASED에 다시 들어온 down은 이 복구 대상이 아니다. 자동 repeat·동일 전송의 중복 edge는 중복 제거하고, 실제 새 재타격은 EXTRA_DOWN으로 처리한다. 최종 저장 전까지 과거 기대 항목의 시각을 보존한다. 결과 화면에 이미 저장한 세션이라도 이 조건이 확인되면 그 시도의 결과를 철회하고 기술적 재시작을 안내한다. 잘못된 점수에 부분 가산하는 방식으로 덮지 않는다.

## 7. 판정·점수·오개념 피드백

### 7.1 판정창

기본 onset 절대오차 `|e|`:

| 결과 | 범위 | 점수 계수 |
|---|---|---|
| 또렷해요 |0~45ms 포함 |1.00 |
| 잘 이어졌어요 |>45~90ms 포함 |0.75 |
| 조금 비껴갔어요 |>90~140ms 포함 |0.40 |
| 놓쳤어요 |>140ms 또는 입력 없음 |0.00 |

밀집 패턴의 중복 매칭 방지: 이웃 **실제 onset** 간격의 작은 값`d`에 대해 최대창`W=min(140ms,0.45*d)`로 제한하고 세 임계값을 `45/140*W`, `90/140*W`, `W`로 비례 축소한다. tie boundary는 이웃 onset이 아니다. 앞/뒤 이웃이 없으면 그 방향은 무한대로 취급하며 모티프 반복 경계 이웃도 포함한다. 카운트인·시연 onset은 대상이 아니다.

release 기본창은60/110/160ms이며 계수1/.75/.40/0. release창은 시작점을 넘지 않도록 `Wrelease=min(160ms,0.45*holdDurationMs)`로 제한하고60/160,110/160 비율을 유지한다. 점수는 onset과 별도다. 시작이80ms 늦었다고 끝도80ms 늦추지 않는다. release 목표는 원래 악곡의 절대 끝이다.

비교는 정규화한 정수 microsecond로 수행한다. 변환값과 비례 임계값은 `Math.round(ms*1000)`으로 한 번 반올림한다. 정확히 45,000μs는 첫 구간, 45,001μs는 둘째다. 속도 75% 모드는 tick의 실제 시각만 바꾸고 기본 ms 창은 유지한다. 넓은 판정은 `W=min(140ms*1.35, 0.45*d)`, `Wrelease=min(160ms*1.35, 0.45*holdDurationMs)`로 계산한다. 즉 확대 후에도 이웃 간격·hold 길이 cap을 반드시 유지하고 내부 등급 임계값은 앞서 정한 비율로 산출한다. assisted 기록으로 분리한다.

### 7.2 점수 불변식

- 각 tap은 onset 가중치1. 각 hold는 onset1 + release1. 붙임줄의 세부 음표 개수는 분모를 늘리지 않는다.
- `N = tapCount + 2*holdCount`는 시작 전에 확정한다.
- `earned = 모든 onset 계수 + 모든 유효 hold release 계수`.
- hold 시작 miss, 이른 release, 중간 재타격/재시작은 release 계수0. 시작에 얻은 점수는 유지한다.
- 후보 없는 유효 down1회는 `extra`1회. 로그에는 매회 남기지만 점수 감점은 `0.25 * min(extra, N)` 점수단위다.
- 최종 `score = round(100 * clamp((earned - 0.25*min(extra,N))/N, 0, 1))`.
- tap을 길게 눌러도 추가점수 없음. 모든 음을 계속 누른 상태로 기다려도 새 onset 점수 없음. 연타가 기대항목 분모를 줄이거나 점수를 늘리지 않음.
- 유효 onset이 틀린 시각에 연결되더라도 같은 입력을 추가감점으로 다시 세지 않는다. 조기 release 자체도 EXTRA_DOWN이 아니므로 이중 감점하지 않는다.
- overhold는 release0으로 처리한다. 그 누름이 뒤 쉼으로 넘어간 것은 쉼 숙달 지표에 기록하지만 점수에서 두 번째 감점하지 않는다.
- pause로 폐기된 프레이즈의 numerator·denominator·extra 모두 롤백한다. 한쪽만 남기지 않는다.
- `N=0`인 플레이 chart는 authoring 오류. 쉼만 있는 설명 시연은 가능하지만 채점 레벨로 로드 금지.
- 점수0~100, 한 기대항목 한 번 확정, 결과 저장 한 번, 같은 로그의 재실행 점수동일이 필수 invariant다.

예: tap2개와 hold1개면N=4. onset들1+0.75+1, release0.75로earned=3.5. extra1이면 `(3.5-.25)/4*100=81.25`, 표시81점. 시스템 cancel은0점이 아니라 시도 무효다.

### 7.3 쉼과 학습 숙달의 별도 측정

쉼은 기다리기만 반복해 점수를 부풀리지 않도록 점수 분모에 넣지 않는다. 대신 `restCleanCount/restCount`, `tieContinuousCount/tieCount`, `releaseInWindowCount/holdCount`, `onsetMedianAbsError`, `meterConceptCorrect`를 결과에 분리한다.

쉼 판정의 경계는 기대 입력 허용창과 충돌하지 않게 한다. 쉼 구간 안이어도 다음 onset의 이른 허용창으로 정상 매칭된 down은 쉼 오입력으로 세지 않는다. 직전 hold release의 허용창 내 up 역시 깨끗한 쉼이다. 그 밖의 새로운 down 또는 직전 gate가 허용release창을 넘어 지속되면 해당 쉼을1회 dirty로 표시한다. 쉼 전체가 경계 허용창으로 덮일 만큼 짧으면 별도 숙달 표본에서 제외한다.

### 7.4 진도와 결과 문구

- ‘다음 꿈’은 완료만 하면 열 수 있다. 높은 정밀도로 못 눌렀다는 이유로 이론 학습을 막지 않는다.
- 별1개: 시도 완료. 별2개: 기본 모드80점 이상. 별3개:90점 이상 + 해당 개념 조건 충족.
- 붙임줄 개념 조건: 플레이4회 중 최소3회 연속 유지, 시작·끝 모두 허용창 안.
- 점음표 조건: hold release 성공률75% 이상. tap만으로 달성 불가.
- 점쉼표 조건: 평가 가능한 쉼의75% 이상 clean + 뒤 첫 onset75% 이상 성공.
- 박자 구별 조건: 타이밍 점수와 별도로4개 개념 문항 중3개 이상. 탭6회만 성공해서는 ‘박자 구별 완료’ 배지 금지.
- 보조모드에서도 진행은 동일하게 열되 정밀 기록과 별개로 표시한다. 접근성 사용을 실패처럼 표현하지 않는다.

오개념 문구는 한 번에 하나: ‘중간 매듭에서는 다시 누르지 않아요.’ / ‘점은 원래 길이의 절반을 더해요.’ / ‘이 쉼에서도 작은 박은 계속 가요.’ / ‘6개의 작은 움직임을 셋씩 두 번 느껴 보세요.’ / ‘같은4분음표 기준에서 숫자가 커져 더 빨라졌어요.’

## 8. 레벨 데이터 계약과 작성 규칙

### 8.1 단일 진실 원천

저장 원본은 표기 단위의 `bars[].events[]`. 각 이벤트의 at와ticks는 정수, tick0에서 시작하고 빈틈·겹침 없이 마디를 끝까지 채운다. rest도 명시한다. 실제 동작 기대항목은 compiler가 만들고 파일에 수동 중복 저장하지 않는다.

`notation.denominator/dots`에서 계산한 길이와ticks를 비교한다. 중복 필드를 둔 이유는 사람이 읽기 쉬운 악보 표기와 엔진 길이의 충돌을 조기에 잡기 위해서다. 두 값이 다르면 자동 추정하지 말고 빌드 실패.

모든 note에는pitchName과midi가 있다. MVP 허용 음고는C5=72,D5=74,E5=76,G5=79. 음 높이를 맞히는 게임은 아니지만 소리와 표기는 일치해야 한다. 같은tieGroup은 pitchName과midi 모두 같고, 시간적으로 붙어 있고, 최소2개 음이어야 한다. tieGroup은 음표에서만 가능하며 모두interaction=hold다. 마지막 마디 끝에서 다음 반복 첫 음으로 암묵적 tie를 만들지 않는다.

### 8.2 핵심 JSON Schema

아래 스키마는 구조를 검증한다. 합계·연속성·음고 대응·타이 유효성·해금 순서는 추가 semantic validator가 검사한다. `additionalProperties:false`로 오타를 조용히 무시하지 않는다.

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

### 8.3 완성형 모티프 JSON 9개

아래 각 블록은 위 스키마로 검증할 수 있는 독립 레벨이다. 생략 부호·주석·가상 음표를 포함하지 않는다. 공통 sequence는 각 재생 단계 앞 한 마디 카운트인, 듣기2회, 연습2회, 연주4회, 마무리1마디를 의미한다. LISTEN 뒤 listenTailBars만큼 쉬고 사용자 선택을 기다린다. 연습·연주로 넘어갈 때 새 카운트인을 준다. 전체 세션 길이는 사용자 대기 시간과 선택한 연습 횟수에 따라 달라진다.

리뷰 상태는 최종 미술·악보·청음 검수 대기다. 아래 데이터의 수치 검사 통과를 실제 게임 테스트 통과와 혼동하지 않는다.

#### L01: 짧은 실과 긴 실

음가 도입. 입력 down at0, up at480; 쉼480; down960, up1920.4분+4분쉼+2분=480+480+960=1920. 시작과 끝에 서로 다른 시각 표식을 쓴다.

```json
{
  "schemaVersion": 1,
  "id": "L01",
  "title": "짧은 실과 긴 실",
  "scene": "thread-bridge",
  "ppq": 480,
  "meter": {"n": 4, "d": 4, "groupingEighths": [2, 2, 2, 2]},
  "quarterBpm": 72,
  "sourceIds": ["004"],
  "skillIds": ["duration"],
  "sequence": {"countInBars": 1, "listenRepeats": 2, "listenTailBars": 1, "practiceRepeats": 2, "playRepeats": 4, "outroBars": 1},
  "reviewState": "math_checked_art_audio_review_pending",
  "bars": [
    {"events": [
      {"id": "a", "at": 0, "ticks": 480, "kind": "note", "notation": {"denominator": 4, "dots": 0}, "pitchName": "C5", "midi": 72, "interaction": "hold"},
      {"id": "b", "at": 480, "ticks": 480, "kind": "rest", "notation": {"denominator": 4, "dots": 0}},
      {"id": "c", "at": 960, "ticks": 960, "kind": "note", "notation": {"denominator": 2, "dots": 0}, "pitchName": "C5", "midi": 72, "interaction": "hold"}
    ]}
  ]
}
```

#### L02: 중간 매듭에서는 계속

붙임줄 도입. a+b를 합쳐 down0/up960 한 쌍으로 컴파일. tick480에서는 아무 입력도 요구하지 않는다. 그 뒤 쉼480, tap1440, 쉼240. 합계480+480+480+240+240=1920.

```json
{
  "schemaVersion": 1,
  "id": "L02",
  "title": "중간 매듭에서는 계속",
  "scene": "thread-bridge",
  "ppq": 480,
  "meter": {"n": 4, "d": 4, "groupingEighths": [2, 2, 2, 2]},
  "quarterBpm": 72,
  "sourceIds": ["004", "017"],
  "skillIds": ["tie"],
  "sequence": {"countInBars": 1, "listenRepeats": 2, "listenTailBars": 1, "practiceRepeats": 2, "playRepeats": 4, "outroBars": 1},
  "reviewState": "math_checked_art_audio_review_pending",
  "bars": [
    {"events": [
      {"id": "a", "at": 0, "ticks": 480, "kind": "note", "notation": {"denominator": 4, "dots": 0}, "pitchName": "C5", "midi": 72, "interaction": "hold", "tieGroup": "t1"},
      {"id": "b", "at": 480, "ticks": 480, "kind": "note", "notation": {"denominator": 4, "dots": 0}, "pitchName": "C5", "midi": 72, "interaction": "hold", "tieGroup": "t1"},
      {"id": "c", "at": 960, "ticks": 480, "kind": "rest", "notation": {"denominator": 4, "dots": 0}},
      {"id": "d", "at": 1440, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "E5", "midi": 76, "interaction": "tap"},
      {"id": "e", "at": 1680, "ticks": 240, "kind": "rest", "notation": {"denominator": 8, "dots": 0}}
    ]}
  ]
}
```

#### L03: 기둥을 넘어 잇기

2마디 예제. 첫 마디960+480+480=1920, 둘째960+480+480=1920. c+d는 절대tick1440부터2880까지 이어지는1440 tick hold다. 마디선1920에서는 release/attack 없음. 마지막f는 절대tick3360부터3840까지.

```json
{
  "schemaVersion": 1,
  "id": "L03",
  "title": "기둥을 넘어 잇기",
  "scene": "thread-bridge",
  "ppq": 480,
  "meter": {"n": 4, "d": 4, "groupingEighths": [2, 2, 2, 2]},
  "quarterBpm": 72,
  "sourceIds": ["004", "017"],
  "skillIds": ["cross-bar-tie"],
  "sequence": {"countInBars": 1, "listenRepeats": 2, "listenTailBars": 1, "practiceRepeats": 2, "playRepeats": 4, "outroBars": 1},
  "reviewState": "math_checked_art_audio_review_pending",
  "bars": [
    {"events": [
      {"id": "a", "at": 0, "ticks": 960, "kind": "rest", "notation": {"denominator": 2, "dots": 0}},
      {"id": "b", "at": 960, "ticks": 480, "kind": "rest", "notation": {"denominator": 4, "dots": 0}},
      {"id": "c", "at": 1440, "ticks": 480, "kind": "note", "notation": {"denominator": 4, "dots": 0}, "pitchName": "C5", "midi": 72, "interaction": "hold", "tieGroup": "t2"}
    ]},
    {"events": [
      {"id": "d", "at": 0, "ticks": 960, "kind": "note", "notation": {"denominator": 2, "dots": 0}, "pitchName": "C5", "midi": 72, "interaction": "hold", "tieGroup": "t2"},
      {"id": "e", "at": 960, "ticks": 480, "kind": "rest", "notation": {"denominator": 4, "dots": 0}},
      {"id": "f", "at": 1440, "ticks": 480, "kind": "note", "notation": {"denominator": 4, "dots": 0}, "pitchName": "E5", "midi": 76, "interaction": "hold"}
    ]}
  ]
}
```

#### L04: 꽃잎 하나를 더

점4분음표720+8분쉼240을2회. 각2q 묶음의 끝을 맞춘다. 두 hold는 각각0→720,960→1680. 합계720+240+720+240=1920.

```json
{
  "schemaVersion": 1,
  "id": "L04",
  "title": "꽃잎 하나를 더",
  "scene": "crescent-greenhouse",
  "ppq": 480,
  "meter": {"n": 4, "d": 4, "groupingEighths": [2, 2, 2, 2]},
  "quarterBpm": 80,
  "sourceIds": ["004", "006"],
  "skillIds": ["dot"],
  "sequence": {"countInBars": 1, "listenRepeats": 2, "listenTailBars": 1, "practiceRepeats": 2, "playRepeats": 4, "outroBars": 1},
  "reviewState": "math_checked_art_audio_review_pending",
  "bars": [
    {"events": [
      {"id": "a", "at": 0, "ticks": 720, "kind": "note", "notation": {"denominator": 4, "dots": 1}, "pitchName": "C5", "midi": 72, "interaction": "hold"},
      {"id": "b", "at": 720, "ticks": 240, "kind": "rest", "notation": {"denominator": 8, "dots": 0}},
      {"id": "c", "at": 960, "ticks": 720, "kind": "note", "notation": {"denominator": 4, "dots": 1}, "pitchName": "E5", "midi": 76, "interaction": "hold"},
      {"id": "d", "at": 1680, "ticks": 240, "kind": "rest", "notation": {"denominator": 8, "dots": 0}}
    ]}
  ]
}
```

#### L05: 꽃이 잠드는 큰박

6/8을 배운 뒤 열리는2마디. 첫 마디 점4분쉼720+8분음3개720=1440. 둘째 점4분음720+점4분쉼720=1440. 큰박1개를 기다리는 경험과 점음의 길이를 연결한다.

```json
{
  "schemaVersion": 1,
  "id": "L05",
  "title": "꽃이 잠드는 큰박",
  "scene": "crescent-greenhouse",
  "ppq": 480,
  "meter": {"n": 6, "d": 8, "groupingEighths": [3, 3]},
  "quarterBpm": 90,
  "sourceIds": ["007", "032-3"],
  "skillIds": ["dotted-rest", "compound-duple"],
  "sequence": {"countInBars": 1, "listenRepeats": 2, "listenTailBars": 1, "practiceRepeats": 2, "playRepeats": 4, "outroBars": 1},
  "reviewState": "math_checked_art_audio_review_pending",
  "bars": [
    {"events": [
      {"id": "a", "at": 0, "ticks": 720, "kind": "rest", "notation": {"denominator": 4, "dots": 1}},
      {"id": "b", "at": 720, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "C5", "midi": 72, "interaction": "tap"},
      {"id": "c", "at": 960, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "D5", "midi": 74, "interaction": "tap"},
      {"id": "d", "at": 1200, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "E5", "midi": 76, "interaction": "tap"}
    ]},
    {"events": [
      {"id": "e", "at": 0, "ticks": 720, "kind": "note", "notation": {"denominator": 4, "dots": 1}, "pitchName": "G5", "midi": 79, "interaction": "hold"},
      {"id": "f", "at": 720, "ticks": 720, "kind": "rest", "notation": {"denominator": 4, "dots": 1}}
    ]}
  ]
}
```

#### L06: 둘씩 접히는 세 칸

3/4의6개8분음표.0/240/480/720/960/1200에서 탭. 합계6×240=1440. 별도 큰박 시각·클릭은0/480/960에 두며2+2+2로 묶는다.

```json
{
  "schemaVersion": 1,
  "id": "L06",
  "title": "둘씩 접히는 세 칸",
  "scene": "folding-room",
  "ppq": 480,
  "meter": {"n": 3, "d": 4, "groupingEighths": [2, 2, 2]},
  "quarterBpm": 90,
  "sourceIds": ["032-3"],
  "skillIds": ["simple-triple"],
  "sequence": {"countInBars": 1, "listenRepeats": 2, "listenTailBars": 1, "practiceRepeats": 2, "playRepeats": 4, "outroBars": 1},
  "reviewState": "math_checked_art_audio_review_pending",
  "bars": [
    {"events": [
      {"id": "a", "at": 0, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "C5", "midi": 72, "interaction": "tap"},
      {"id": "b", "at": 240, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "C5", "midi": 72, "interaction": "tap"},
      {"id": "c", "at": 480, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "C5", "midi": 72, "interaction": "tap"},
      {"id": "d", "at": 720, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "C5", "midi": 72, "interaction": "tap"},
      {"id": "e", "at": 960, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "C5", "midi": 72, "interaction": "tap"},
      {"id": "f", "at": 1200, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "C5", "midi": 72, "interaction": "tap"}
    ]}
  ]
}
```

#### L07: 셋씩 접히는 두 칸

L06과 음표 데이터·작은음의 실제 간격이 완전히 같다. 박자와 큰박시각·클릭만0/720으로 바뀌어3+3이 된다. 합계6×240=1440. 표시 템포는점4분=60.

```json
{
  "schemaVersion": 1,
  "id": "L07",
  "title": "셋씩 접히는 두 칸",
  "scene": "folding-room",
  "ppq": 480,
  "meter": {"n": 6, "d": 8, "groupingEighths": [3, 3]},
  "quarterBpm": 90,
  "sourceIds": ["032-3"],
  "skillIds": ["compound-duple"],
  "sequence": {"countInBars": 1, "listenRepeats": 2, "listenTailBars": 1, "practiceRepeats": 2, "playRepeats": 4, "outroBars": 1},
  "reviewState": "math_checked_art_audio_review_pending",
  "bars": [
    {"events": [
      {"id": "a", "at": 0, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "C5", "midi": 72, "interaction": "tap"},
      {"id": "b", "at": 240, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "C5", "midi": 72, "interaction": "tap"},
      {"id": "c", "at": 480, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "C5", "midi": 72, "interaction": "tap"},
      {"id": "d", "at": 720, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "C5", "midi": 72, "interaction": "tap"},
      {"id": "e", "at": 960, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "C5", "midi": 72, "interaction": "tap"},
      {"id": "f", "at": 1200, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "C5", "midi": 72, "interaction": "tap"}
    ]}
  ]
}
```

#### L08: 느린 구름 편지

4/4에서8분음+8분쉼을4번. 합계8×240=1920.0/480/960/1440에서 탭. quarterBpm72이므로 모티프3.333333초.

```json
{
  "schemaVersion": 1,
  "id": "L08",
  "title": "느린 구름 편지",
  "scene": "cloud-post",
  "ppq": 480,
  "meter": {"n": 4, "d": 4, "groupingEighths": [2, 2, 2, 2]},
  "quarterBpm": 72,
  "sourceIds": ["004", "030-1"],
  "skillIds": ["tempo"],
  "sequence": {"countInBars": 1, "listenRepeats": 2, "listenTailBars": 1, "practiceRepeats": 2, "playRepeats": 4, "outroBars": 1},
  "reviewState": "math_checked_art_audio_review_pending",
  "bars": [
    {"events": [
      {"id": "a", "at": 0, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "C5", "midi": 72, "interaction": "tap"},
      {"id": "b", "at": 240, "ticks": 240, "kind": "rest", "notation": {"denominator": 8, "dots": 0}},
      {"id": "c", "at": 480, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "D5", "midi": 74, "interaction": "tap"},
      {"id": "d", "at": 720, "ticks": 240, "kind": "rest", "notation": {"denominator": 8, "dots": 0}},
      {"id": "e", "at": 960, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "E5", "midi": 76, "interaction": "tap"},
      {"id": "f", "at": 1200, "ticks": 240, "kind": "rest", "notation": {"denominator": 8, "dots": 0}},
      {"id": "g", "at": 1440, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "G5", "midi": 79, "interaction": "tap"},
      {"id": "h", "at": 1680, "ticks": 240, "kind": "rest", "notation": {"denominator": 8, "dots": 0}}
    ]}
  ]
}
```

#### L09: 가벼운 구름 편지

L08과 모든음·쉼·순서가 동일하고quarterBpm만108. 모티프2.222222초. 비교 전에 새한마디 카운트인을 준다.

```json
{
  "schemaVersion": 1,
  "id": "L09",
  "title": "가벼운 구름 편지",
  "scene": "cloud-post",
  "ppq": 480,
  "meter": {"n": 4, "d": 4, "groupingEighths": [2, 2, 2, 2]},
  "quarterBpm": 108,
  "sourceIds": ["004", "030-1"],
  "skillIds": ["tempo"],
  "sequence": {"countInBars": 1, "listenRepeats": 2, "listenTailBars": 1, "practiceRepeats": 2, "playRepeats": 4, "outroBars": 1},
  "reviewState": "math_checked_art_audio_review_pending",
  "bars": [
    {"events": [
      {"id": "a", "at": 0, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "C5", "midi": 72, "interaction": "tap"},
      {"id": "b", "at": 240, "ticks": 240, "kind": "rest", "notation": {"denominator": 8, "dots": 0}},
      {"id": "c", "at": 480, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "D5", "midi": 74, "interaction": "tap"},
      {"id": "d", "at": 720, "ticks": 240, "kind": "rest", "notation": {"denominator": 8, "dots": 0}},
      {"id": "e", "at": 960, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "E5", "midi": 76, "interaction": "tap"},
      {"id": "f", "at": 1200, "ticks": 240, "kind": "rest", "notation": {"denominator": 8, "dots": 0}},
      {"id": "g", "at": 1440, "ticks": 240, "kind": "note", "notation": {"denominator": 8, "dots": 0}, "pitchName": "G5", "midi": 79, "interaction": "tap"},
      {"id": "h", "at": 1680, "ticks": 240, "kind": "rest", "notation": {"denominator": 8, "dots": 0}}
    ]}
  ]
}
```

### 8.4 수치 검증 결과와 컴파일 기대값

| 레벨 | 마디수 | 마디당tick | 총tick | 모티프 초 | 합쳐진gate 수 | 모티프 점수분모N |
|---|---:|---:|---:|---:|---:|---:|
| L01 | 1 | 1920 | 1920 | 3.333333 | 2 | 4 |
| L02 | 1 | 1920 | 1920 | 3.333333 | 2 | 3 |
| L03 | 2 | 1920 | 3840 | 6.666667 | 2 | 4 |
| L04 | 1 | 1920 | 1920 | 3.0 | 2 | 4 |
| L05 | 2 | 1440 | 2880 | 4.0 | 4 | 5 |
| L06 | 1 | 1440 | 1440 | 2.0 | 6 | 6 |
| L07 | 1 | 1440 | 1440 | 2.0 | 6 | 6 |
| L08 | 1 | 1920 | 1920 | 3.333333 | 4 | 4 |
| L09 | 1 | 1920 | 1920 | 2.222222 | 4 | 4 |

L02의gate는0→960 hold,1440→1680 tap의2개다. L03의gate는1440→2880 hold,3360→3840 hold의2개다. 플레이4회 반복시N도4배로 확장한다. 시연·카운트인·마무리의 음은N에 넣지 않는다.

### 8.5 컴파일·콘텐츠 검증 순서

1. JSON Schema를 적용하고 모르는 필드를 거부한다.
2. 마디 길이를 계산한다. 4/4=1920, 3/4·6/8=1440 tick이다.
3. 원본 순서에서 `event.at===누적 tick`, 마지막 끝=`barTicks`를 검사한다. 정렬로 오류를 숨기지 않는다.
4. denominator·dots의 정확한 유리수 길이와 ticks를 대조한다.
5. ID 중복, 음고·MIDI 대응, rest의 잘못된 pitch/tie 필드를 검사한다.
6. 절대 tick으로 펼친 tieGroup이 두 음 이상인지, 동일 철자·음고인지, 연속인지, 모두 hold인지 검사한다.
7. 타이 그룹을 하나의 gate·expectation으로 합치되 원래 notation ID를 보존한다.
8. 반복을 펼칠 때 새로운 occurrenceId를 만들고 반복 경계의 이웃 onset까지 판정창을 계산한다.
9. 기본박·작은박·장면 cue를 별도 layer로 생성한다. 6/8의 큰박은 0·720, 3/4는 0·480·960이다.
10. preview에서 악보·소리·입력 예상·마디 합계를 나란히 보여 주고 편집자가 승인한다.

4/4의 합계 1680, 서로 다른 음의 타이, 점4분의 ticks 480, 6/8의 grouping 2+2+2는 오류다. JSON 경로와 오류 코드를 반환하고 임의로 쉼을 채우거나 묶음을 바꾸지 않는다.

## 9. 진도·난이도·교육 전이

### 9.1 권장 경로와 수업 카드

| 순서 | 레벨 | 선행 권장 | 수업 카드의 핵심 문장 | 첫 플레이 도움 |
|---:|---|---|---|---|
| 1 | L01 | 없음 | ‘실의 시작에서 누르고, 빈 동그라미에서 놓아요.’ | 시작/끝 아이콘과 4박 등불 |
| 2 | L02 | L01 | ‘같은 음을 이은 중간 매듭에서는 계속 누르고 있어요.’ | 타이 경계 설명 1회 |
| 3 | L03 | L02 | ‘마디의 기둥을 지나도 실은 이어져요.’ | 기둥 통과 때 ‘계속’ 표시 |
| 4 | L04 | L01 | ‘두 칸 길이에 그 절반인 한 칸을 더해요.’ | 2칸+1칸 비례도 |
| 5 | L06 | L01 | ‘여섯 작은 움직임을 둘씩 세 묶음으로 느껴요.’ | 1 & 2 & 3 & |
| 6 | L07 | L06 | ‘이번에는 셋씩 두 묶음이에요.’ | 1 라 리 2 라 리 |
| 7 | L05 | L04·L07 | ‘꽃이 닫힌 큰박 하나 동안 쉬고 다음 이슬부터 눌러요.’ | 쉼 구간 진행 칸 |
| 8 | L08 | L01 | ‘같은 간격으로 오는 편지를 받아요.’ | 4분음표=72 표시 |
| 9 | L09 | L08 | ‘모양은 같고 흐르는 속도가 빨라져요.’ | 4분음표=108과 새 카운트인 |

선행은 추천 순서이며 성적 잠금이 아니다. 꿈 지도에는 네 장소가 처음부터 보이고, 새 학습자에게 다음 수업만 강조한다. 자유 연습에서 다른 수업을 열면 ‘이 설명을 먼저 볼까요?’와 건너뛰기를 함께 제공한다.

### 9.2 난이도 조절의 우선순위

1. 같은 패턴을 75% 속도로 들어 본다.
2. 큰박·작은박 표시를 켠다.
3. 정답 시연 2회와 함께 연습한다.
4. 같은 패턴을 100% 속도로 연주한다.
5. 익숙해진 뒤 안내 숫자를 줄인다.

속도, 시각 단서, 새 리듬을 한 번에 모두 바꾸지 않는다. MVP는 성공률에 따라 새 곡을 즉석 생성하거나 난이도를 자동 상승시키지 않는다. 실패 2회 후 쉬운 연습을 제안할 수는 있지만 설정을 자동 변경하지 않는다.

### 9.3 취약 구간 연습의 정확한 동작

결과의 ‘이 부분 연습’은 실패한 마디와 필요한 타이 시작 마디를 포함하는 최소 구간을 선택한다. 마디선을 가로지르는 타이는 두 마디 전체를 포함한다. 타이 후반만 잘라 새 onset처럼 만들지 않는다. 선택 구간 앞 한 마디 카운트인, 연습 2회, 결과 후 다시 하기/원래 레벨로 복귀 순서다. 자유 연습 결과는 원래 레벨의 최고 점수를 덮지 않는다.

### 9.4 전이 확인 문항

- 붙임줄: 같은 음높이의 4분+4분 붙임줄과 붙임줄 없는 4분음표 두 개를 시연한다. ‘소리의 시작이 한 번인 것’을 고른다. 정답은 붙임줄. 선택 버튼은 리듬 입력 영역과 별개다.
- 점: 2분음표의 점은 1q를 더한다. 4분음표의 점은 0.5q를 더한다. ‘점은 언제나 반박’이라는 오개념이 있는지 두 비교 카드로 확인한다.
- 묶음: 기본 검증 시퀀스는 Q1=3/4, Q2=6/8, Q3=6/8, Q4=3/4. 박자표 정답을 미리 보이지 않고 이름 없는 A/B를 비교한다. 다음 시도에는 문항 순서 seed를 기록해 섞되 정답 데이터는 변경하지 않는다.
- 템포: L08/09의 상대 길이 비는 동일하고 전체 시간은 108 BPM에서 72 BPM의 2/3이다. ‘빠를수록 음표의 종류가 자동으로 바뀐다’고 설명하지 않는다.

정밀 리듬 점수, 개념 문항 정답률, 도움 모드는 서로 대체하지 않는다. 무엇을 확인했는지 결과에 분리해 표시한다.

## 10. 기술 스택·디렉터리·모듈 인터페이스

### 10.1 권장 스택과 선택 이유

- TypeScript strict, Vite, PixiJS 8계열: 2D 장면과 좌표계를 담당한다. 메뉴는 DOM/CSS로 구현한다. Pixi 공식 문서도 Vite 템플릿을 안내한다. [Pixi 빠른 시작](https://pixijs.com/8.x/guides/getting-started/quick-start), [Vite 안내](https://vite.dev/guide/).
- 네이티브 Web Audio: 예약 재생, gate, envelope와 master clock을 직접 관리한다. 별도 오디오 라이브러리의 transport를 이중 master로 두지 않는다.
- JSON Schema 검증기(Ajv 등)와 순수 semantic validator: 레벨 작성 오류를 차단한다. 검증기는 UI/Pixi에 의존하지 않는다.
- Vitest: compiler·판정·점수·상태기계 단위 테스트. [공식 가이드](https://vitest.dev/guide/).
- Playwright: Chromium·Firefox·WebKit의 화면·키보드·터치·저장 흐름. [공식 문서](https://playwright.dev/docs/intro).
- SVG 악보: MVP 음표 종류와 같은 높이 리듬 오선만 지원하는 작은 renderer. 복잡한 기보를 확장할 때 전용 기보 도구를 별도로 검토한다. 지금 검증하지 않은 패키지 API를 가정하지 않는다.
- 정확한 patch 버전은 개발 시점의 문서·환경을 확인하고 lockfile로 고정한다. Node 버전은 선택한 Vite 버전의 요구 조건과 맞춘다. 이 문서는 설치·실행 보고가 아니다.

두 독립 게임이 공통 엔진을 추출한다면 PPQ 480, quarter BPM, AudioContext master, 기본 onset 45/90/140ms만 명시적으로 공유한다. 장면·커리큘럼·저장 key·점수 분모·hold 규칙은 이 게임의 계약대로 유지한다. 다른 게임의 패턴을 혼합하지 않는다.

### 10.2 권장 프로젝트 구조

```text
night-thread/
  package.json
  src/
    main.ts
    app/AppController.ts
    app/sessionReducer.ts
    app/sessionTypes.ts
    audio/AudioEngine.ts
    audio/AudioClock.ts
    audio/LookaheadScheduler.ts
    audio/VoicePool.ts
    audio/Mixer.ts
    audio/CalibrationController.ts
    music/level.schema.json
    music/validateLevel.ts
    music/compileLevel.ts
    music/tickTime.ts
    music/types.ts
    input/ActionInput.ts
    input/InputOwner.ts
    input/normalizeTimestamp.ts
    judge/JudgeEngine.ts
    judge/windows.ts
    judge/score.ts
    judge/mastery.ts
    scenes/SceneAdapter.ts
    scenes/ThreadBridgeScene.ts
    scenes/CrescentGreenhouseScene.ts
    scenes/FoldingRoomScene.ts
    scenes/CloudPostScene.ts
    scenes/LayoutTransform.ts
    ui/MapScreen.ts
    ui/LessonScreen.ts
    ui/PauseDialog.ts
    ui/ResultsScreen.ts
    ui/SettingsScreen.ts
    notation/RhythmNotation.ts
    notation/DurationDiagram.ts
    storage/ProgressRepository.ts
    content/levels/L01.json ... L09.json
    content/campaign.json
    content/lessons.ko.json
    content/source-manifest.json
    debug/TimelineInspector.ts
  public/assets/art/
  public/assets/audio/
  tests/unit/
  tests/integration/
  tests/e2e/
  tools/validate-content.ts
  tools/export-preview.ts
  docs/content-review-checklist.md
  docs/device-test-matrix.md
```

`L01.json ... L09.json`은 파일 목록 설명이다. 실제 JSON은 8장의 완성 예시를 각각 저장하며 리터럴 생략 부호를 넣지 않는다.

### 10.3 모듈 의존관계

```text
JSON → validateLevel → compileLevel → CompiledTimeline
                                      ├→ AudioEngine
                                      ├→ JudgeEngine ← ActionInput ← DOM
                                      ├→ SceneAdapter
                                      └→ RhythmNotation
JudgeEngine → ResultSnapshot → ResultsScreen → ProgressRepository
AudioClock → AudioEngine / JudgeEngine / SceneAdapter
AppController → transport / sessionReducer / interruption lifecycle
```

금지: Pixi 좌표로 음 판정, UI 텍스트에서 BPM 파싱, 이미지에서 정답 추출, 애니메이션 완료 콜백으로 다음 박 진행, scene 안에서 localStorage 직접 수정.

### 10.4 핵심 인터페이스

```typescript
interface ClockPort {
  audioNow(): number;
  audibleAt(performanceMs: number): number;
  tickToAudio(tick: number): number;
}
interface CompiledExpectation {
  id: string;
  onsetTick: number;
  endTick: number;
  interaction: 'tap' | 'hold';
  sourceNotationIds: string[];
  pitchMidi: number;
}
interface JudgePort {
  ingest(edge: InputEdge): readonly JudgeEvent[];
  advanceTo(audioTime: number): readonly JudgeEvent[];
  snapshot(): ResultSnapshot;
  resetPhrase(phraseId: string): void;
}
interface SceneAdapter {
  mount(root: unknown): Promise<void>;
  setTimeline(timeline: CompiledTimeline): void;
  render(audibleAudioTime: number): void;
  onJudge(event: JudgeEvent): void;
  resize(layout: LayoutMetrics): void;
  destroy(): void;
}
```

`root: unknown`은 설계상의 의존 역전 표기다. 실제 구현에서는 Pixi Container 타입을 명시하고 any로 우회하지 않는다. ClockPort를 가짜 시계로 바꾸면 렌더러 없이 같은 로그를 판정할 수 있어야 한다.

### 10.5 저장 모델과 복구

저장 key는 `night-thread.progress.v1`. 개인 식별 정보는 없다.

```text
ProgressV1 {
  schemaVersion:1,
  settings:{locale,volumes,reducedMotion,highContrast,inputCode,assistMode},
  calibration:{inputOffsetMs,visualOffsetMs,method,confirmedAt,revision},
  levels:{ [levelId]:{completed,bestStandardScore,bestAssistedScore,lastMode,
                     tieMastery,dotMastery,restMastery,meterQuizBest,updatedAt} },
  recentAttempts:{sessionId,levelId,mode,score,mastery,valid,finishedAt}[],
  bestScoreEvidence:{[levelId]:{standardSessionId,assistedSessionId}},
  contentVersion,
  lastLessonId
}
```

- 저장 전에 복사본을 검증하고 setItem 실패를 처리한다. 저장 실패에도 현재 결과는 남는다. ‘이 기기에 기록을 저장하지 못했어요’라고 안내한다.
- JSON이 파손됐다면 기존 문자열을 바로 덮지 않는다. 가능하면 로컬 backup key에 보존하고 기본 설정으로 실행한다. 서버로 전송하지 않는다.
- contentVersion 변경으로 패턴이 달라지면 기존 최고 점수를 legacy 값으로 보존한다. 새 패턴의 숙달인 것처럼 표시하지 않는다.
- 초기화는 설정에서 사용자가 확인한 뒤 이 게임 key만 삭제한다. 전체 localStorage 삭제 금지.
- 디버그 입력 로그는 개발 메모리 ring buffer에 최대 5분만 유지한다. production 자동 업로드는 없다. 사용자가 문제 제보 export를 선택하면 장치 식별자 없는 로컬 파일을 만든다.

## 11. 음악·그래픽·교재 자산 제작 명세

### 11.1 미술 납품표

| 자산 | MVP 개수 | 상태/변형 | 검수 |
|---|---:|---|---|
| 여울 | 1 rig | idle/prepare/press/hold/release/miss | 독자적인 실루엣 |
| 솜새 | 1 rig | count/demo/encourage | 동작이 음 시작을 가리지 않음 |
| 배경 | 4 | 움직임 축소 버전 포함 | 세로·가로 안전 영역 |
| 실빛다리 | 1 set | 시작 원/끝 원/타이 매듭/마디 기둥 | 매듭과 시작 원을 구별 |
| 반달 온실 | 1 set | 2칸 물통/1칸 이슬/3칸 꽃/닫힘 덮개 | 비례 2:1 검증 |
| 접히는 방 | 1 set | 타일 6, 경첩 3/2, 묶음 괄호 | 같은 타일 폭·명확한 묶음 |
| 구름 우체역 | 1 set | 편지/창구/성공 별 | 속도 외 패턴 외관 동일 |
| UI 아이콘 | 약 12 | 누르기/유지/놓기/기다리기/소리/일시정지 | 색 없이도 구별 |
| 이론 도식 | 6 | 음가/타이/점/점쉼/박자 비교/BPM | 그림·숫자·소리의 데이터 일치 |

배경 제작 프롬프트 예: ‘짙은 남색 종이와 황금빛 실로 만든 독창적인 꿈속 수선 공방. 사각 앞치마의 작은 수선사와 추 모양 직물새. 평면 종이 오리기, 네 단계 명도, 텍스트와 음표 없음. 가운데 타깃용 빈 공간.’ 생성 이미지는 장식에만 쓴다. 음표·쉼표·숫자·정답 비례 도형을 생성 모델에 맡기지 않는다.

### 11.2 음향 사양

- 개발 첫 단계: C5/D5/E5/G5의 sine+약한 triangle lead, 기본박 wood click, 큰박 soft chime. 시연과 사용자 연주를 같은 gate에서 생성해 길이 불일치를 먼저 제거한다.
- 미술·음향 교체 단계: 직접 제작한 플럭/유리음 샘플을 쓸 수 있다. hold용 loop 지점과 release tail을 검수한다. 샘플이 저절로 사라져 타이가 끊긴 듯 들리면 사용하지 않는다.
- 가이드 멜로디와 사용자 멜로디는 compiler 출력의 pitch/length를 공유한다. DAW에서 따로 길이를 바꾸지 않는다.
- 반주는 낮은 C 계열 drone와 약한 percussion. 학습자의 onset을 가리는 고음 멜로디는 넣지 않는다. 쉼에서도 반주의 맥박은 유지한다.
- 각 레벨의 quarterBpm으로 새로 예약한다. WAV 하나의 playbackRate를 바꿔 음높이까지 변형하는 방식을 기본으로 삼지 않는다.
- gain 합과 limiter를 점검해 clipping을 없앤다. 최종 출력은 정한 peak 기준으로 실제 측정한다. 웹 볼륨만으로 청취 안전을 보증하지 않으며 처음에는 낮은 음량을 안내한다.
- 첫 로드 목표는 압축 전송 8MB 이하, 필수 음향 2MB 이하. 현재 레벨의 음향은 카운트인 전에 모두 decode한다.

### 11.3 권리·출처 기록

참고작의 스크린샷·음악·로고는 게임 자산으로 넣지 않는다. 사용자 교재는 소유·배포 허락 범위를 확인한 뒤 사용한다. 원본 링크를 문서에 적는 것과 PNG를 공개 게임에 복제하는 것은 별개다. 외부 폰트·샘플·텍스처는 저작자, URL, 라이선스, 변경 여부를 THIRD_PARTY_NOTICES에 남긴다. 공개 배포·계정 생성·상업 음원 구매는 이 설계의 자동 실행 범위가 아니다.

## 12. 단계별 구현 작업과 완료 기준

### 12.1 구현 순서

**정규 데이터 → 순수 판정 → 시계·소리 → 한 장면 vertical slice → 나머지 장면 → 교육 QA → 기기 QA** 순서다. 미술에 맞춰 음악 시간을 끼워 맞추지 않는다.

| 단계 | 작업 | 선행 | 산출물 | 완료 정의 |
|---|---|---|---|---|
| 0 | 범위·단위·교정 상태 고정 | 없음 | 결정 기록·source manifest | 4장면/9레벨, q/큰박 구분, 차단 자산 명시 |
| 1 | 골격·테스트 러너 | 0 | TS/Vite/Pixi+DOM 셸 | 타입 검사·build·빈 테스트 실행 |
| 2 | schema·semantic validator | 1 | 검증기·9개 JSON | 정상 pass, 오류 fixture fail |
| 3 | compiler·가짜 시계 | 2 | gate/expectation/timeline | L02/L03 타이 합침 검증 |
| 4 | 순수 JudgeEngine | 3 | 판정·점수·replay | 경계·연타·miss·중복 검사 |
| 5 | AudioClock·예약·입력 | 3,4 | 오디오 프로토타입 | 음·시각·입력 시간 원천 통일 |
| 6 | L02 vertical slice | 5 | 최소 실빛다리 | 듣기→연습→연주→결과 |
| 7 | L01/L03·중단 복구 | 6 | 길이·타이 장면 | 마디 넘기·focus·pause 복구 |
| 8 | L04/L05 온실 | 7, 교정 도식 | 점·점쉼 장면 | 2:1 도형·720 tick·쉼 재진입 |
| 9 | L06/L07 박자 비교 | 7 | 접히는 방·4문항 | 같은 6 onset·다른 큰박 |
| 10 | L08/L09·진도 | 8,9 | 구름역·지도·저장 | 같은 패턴의 속도 비·복구 |
| 11 | 최종 자산·접근성 | 10 | 승인 자산·보조 모드 | 화면·음향 일치·모바일 배치 |
| 12 | 기기·교육 QA·수정 | 11 | 검수표·결함 목록 | release gate 통과 |
| 13 | 인수용 빌드 준비 | 12 | dist·README | 로컬 preview·제약 명시 |

13단계는 배포 가능한 파일 준비다. 실제 외부 배포는 요청한 환경과 공유 범위를 확인한 뒤 진행한다. 일정은 인력·자산 제작 방식이 정해진 뒤 산정한다. 이 표는 완료한 작업 목록이 아니다.

### 12.2 단계별 세부 지시

**0~3단계: 음악 데이터 우선**

- 9개 JSON을 저장하고 검증 코드를 만든다. 오류가 생기면 검증기를 느슨하게 하지 말고 데이터·명세 중 잘못된 쪽을 찾는다.
- 첫 golden fixture는 L02, L03, L07. 원래 음표 ID→gate→입력 예상→악보를 debug 표에서 추적한다.
- PPQ나 템포 단위 변경은 major content version으로 취급한다.

**4~5단계: 판정과 시계**

- 순수 로그로 100점, 무입력 0점, 조기 release, overhold, 연타를 검사한다.
- clock을 주입해 벽시계에 의존하는 테스트를 없앤다. tick은 정수로 유지한다.
- AudioContext 생성·resume은 사용자 제스처에서 수행하고 실패를 UI 상태로 전달한다.
- 지연 보정은 별도 구현하고 오프셋 부호부터 테스트한다.

**6~7단계: 한 장면을 제대로 완성**

- 회색 도형과 합성음으로 L02를 끝까지 만든다. 한 번 눌러 두 음표를 지속하는 동작이 먼저다.
- 중단 직전 hold의 중간 상태를 복원하지 말고 프레이즈 시작으로 돌아간다. ghost node가 남지 않는지 확인한다.
- L03의 마디선 통과에서 소리·그림을 모두 이어 간다. 기둥이 새 타격 신호처럼 보이지 않게 한다.

**8~10단계: 장면 확장**

- SceneAdapter만 바꾼다. 장면마다 새 판정기를 만들지 않는다.
- L06/L07의 이벤트 deep equality를 검사한다. L08/L09도 BPM 외 패턴 동일성을 유지한다.
- 교정이 필요한 원본 대신 새 검증 도식을 쓴다. 미승인 자산을 출고물에 넣지 않는다.

**11~13단계: 검수와 인수**

- 합성음을 최종 음원으로 교체한 후에도 음가·타이 attack 수를 다시 검사한다.
- 실제 모바일에서 hold 취소, 스크롤, 회전, 화면 잠금, 오디오 경로 전환을 확인한다.
- 측정한 오차와 주관적인 느낌을 나눠 기록한다. 테스트하지 않은 브라우저를 지원 완료로 표시하지 않는다.
- README에 실행·검증 명령, 지원 기기, 제한, 권리 상태, 남은 일을 쓴다.

## 13. 테스트 명세와 객관적 인수 조건

아래 U/I/E 항목은 **구현할 테스트 계획**이다. 이 설계 파일 작업에서 실행한 검사는 14장의 정적 JSON 검사다. 실제 게임·브라우저·오디오 테스트는 구현 이후 수행한다.

### 13.1 단위 테스트

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
| U17 | onset 간격 200ms | W=90ms, perfect 임계 약28.928571ms, 창 겹침 없음 |
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
| U41 | 정상 timestamp가 deadline 후80ms에 도착 | dispatch grace 안에서 정상 판정 |
| U42 | 정상 onset/release가 확정 뒤에 도착 | 해당 프레이즈 기술적 rollback, miss 점수 보존 금지 |
| U43 | 넓은 판정 ×1.35 + 밀집 onset | 확대 뒤 0.45*d cap 유지 |
| U44 | tap을 늦게 누르고 다음 구간이 쉼 | 예약된 gate 끝에서 음 종료, 쉼까지 길이 연장 없음 |
| U45 | 카운트인 끝의 첫 onset early 입력 | 다른 onset과 같은 허용창으로 정상 판정 |
| U46 | 성공 확정 뒤 같은 창의 실제 재타격 | 기술적 rollback 없이 EXTRA_DOWN |

U17의 소수 임계값은 구현의 정수 microsecond 정규화 규칙으로 반올림해 테스트한다. tick 및 음악 길이는 정수·유리수로 정확히 비교한다.

### 13.2 통합 테스트

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

### 13.3 E2E 시나리오

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

### 13.4 실제 기기 및 교육 검수

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

### 13.5 출고 gate

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

## 14. 이 문서에서 수행한 검증과 남은 검증

수행한 정적 검사:

1. 9개 레벨의 JSON 파싱
2. Draft 2020-12 JSON Schema 검사
3. 모든 마디의 tick 합계 및 at 연속성 검사
4. denominator·dot의 유리수 길이와 ticks 대조
5. 음이름·MIDI 대응 검사
6. tieGroup의 동음·연속성·hold 타입·두 음 이상 검사
7. 타이 합침 후 gate·점수 분모 계산
8. L06/L07의 음·쉼 배열 동일성 검사
9. L08/L09의 음·쉼 배열 동일성 검사

**아직 실행하지 않은 것:** 게임 코드의 단위·통합·E2E 테스트, 정밀 오디오 측정, 실제 브라우저 화면, 최종 SVG 악보, 최종 음원 청음, 학습자 실험, 원본 교정, 배포. JSON의 수학적 일관성이 게임 완성이나 교육 효과를 증명하지 않는다.

## 15. 코딩 에이전트용 단계별 실행 프롬프트

앞 단계의 완료 증거를 확인한 뒤 하나씩 전달한다. 매번 수정 범위, 실행 명령, 테스트 결과, 남은 blocker를 보고하게 한다. 사용자가 지정한 개발 환경에서 수행하며 임의로 배포하지 않는다.

### 프롬프트 0: 명세 읽기와 작업 분해

```text
이 설계서의 게임 '밤실 공방'만 구현할 준비를 해 주세요. 먼저 프로젝트의 AGENTS.md와 기존 구조를 읽으세요. 다른 게임이나 기존 프로젝트와 합치지 마세요. 네 장면, L01~L09, PPQ 480, quarterBpm, 타이의 한 onset/한 release 규칙을 DECISIONS.md에 정리하세요. 명세 충돌을 먼저 찾고, 확정된 부분은 실행 순서와 테스트 계획으로 정리하세요. 원본 이미지의 교정 대기 상태를 유지하세요. 배포·계정 생성·외부 업로드는 하지 마세요.
```

### 프롬프트 1: 데이터와 검증기

```text
8장의 JSON Schema와 L01~L09를 파일로 옮기고 TypeScript strict에서 구조·semantic validator를 구현하세요. 음·쉼의 마디 합계와 연속성, 점 길이, 음고/MIDI, 타이 동음·연속성·최소 두 음을 검사하세요. 틀린 데이터를 자동 수정하지 마세요. 4/4의 1680 tick, C5-D5 타이, 점4분 480 tick, 중간 쉼이 있는 타이 등의 실패 fixture도 작성하세요. 정상과 오류 사례의 결과를 모두 보고하세요. UI는 아직 만들지 않아도 됩니다.
```

### 프롬프트 2: 컴파일러와 순수 판정

```text
NotationEvent를 SoundGate와 InputExpectation으로 컴파일하세요. L02는 0~960 hold 하나와 1440 tap, L03은 1440~2880 hold를 만들어야 합니다. 타이 중간 음은 새 onset이 아닙니다. fake clock을 주입하는 JudgeEngine에 7장의 판정창·점수·release·extra 규칙을 구현하세요. 경계값, 조기 release, overhold, miss, repeat, 이중 포인터, 같은 timestamp 순서, pause rollback, 결정적 replay를 테스트하세요. 넓은 판정 뒤에도 이웃 간격 cap을 유지하고 늦게 도착한 정상 edge의 기술적 rollback도 검사하세요. 장면이 판정하지 않게 하세요.
```

### 프롬프트 3: 오디오·입력·지연

```text
AudioContext를 master clock으로 두고 25ms scheduler와 150ms lookahead를 구현하세요. 출력 timestamp 매핑과 fallback을 분리하고 inputOffsetMs의 부호를 테스트하세요. 타이의 attack은 한 번뿐입니다. 사용자 hold는 실제 up에서 끝나며 tap은 늦게 눌러도 예약된 gate 끝을 넘겨 길어지지 않습니다. Pointer Events와 키보드 owner를 통합하세요. cancel, blur, hidden, non-running audio에서 프레이즈 rollback과 새 카운트인을 구현하세요. autoplay 차단을 무음 플레이로 처리하지 마세요. 로그 결과와 실제 장치 미검증 항목을 구분해 보고하세요.
```

### 프롬프트 4: 실빛다리 완성 경로

```text
회색 도형과 합성음으로 L01~L03의 듣기→연습→연주→결과를 완성하세요. 닫힌 원은 시작, 빈 원은 놓기, 타이 매듭은 유지, 마디 기둥은 계속 지나가기입니다. 기본 HUD는 최소화하고 악보는 설명·결과에서 선택적으로 보여 주세요. 모바일에서 canvas를 축소하기만 하지 말고 표적·입력 영역을 재배치하세요. L02 중간 재타격, L03 마디선 통과, 반복 경계의 놓고 다시 누르기를 테스트하세요. 다른 장면을 임의로 확장하지 마세요.
```

### 프롬프트 5: 온실·박자 비교·구름역

```text
같은 엔진의 SceneAdapter를 바꿔 L04~L09를 구현하세요. 온실은 실제 2칸+1칸 비례 도형을 쓰며 PNG를 정답으로 삼지 않습니다. L06/L07의 여섯 8분음표와 실제 간격은 같고 묶음만 2+2+2와 3+3입니다. 6/8은 점4분=60, 내부 quarterBpm=90임을 표시하세요. L08/L09는 같은 패턴에 quarterBpm만 72/108입니다. 진도는 L01 L02 L03 L04 L06 L07 L05 L08 L09 순서입니다. 박자 개념 4문항과 리듬 점수를 분리하세요.
```

### 프롬프트 6: 접근성·저장·복구

```text
DOM 메뉴·결과, 키 재지정, 고대비, 움직임 축소, 볼륨 분리, 명시적인 도움 모드, 버전 있는 localStorage를 구현하세요. 기본 기록과 도움 기록을 구분하고 다른 앱의 key를 건드리지 마세요. 파손 저장·quota 오류·decode 실패·회전·pause 후 남은 키·중복 결과 이벤트를 테스트하세요. 스크린리더에 매 노트 알림을 보내지 마세요. 지원하지 못한 접근성 범위도 정확히 보고하세요.
```

### 프롬프트 7: 최종 자산과 교정

```text
승인된 새 미술·음원으로만 placeholder를 바꾸세요. Melatonin의 캐릭터·음악·화면은 사용하지 마세요. 음표·쉼표·숫자·비례 도형은 정규 데이터에서 생성하세요. 006/007, 054, 031-3의 미교정 원본을 출고하지 마세요. manifest에 출처·권리·dataHash·수학 검사·악보 검수·청음 검수를 남기세요. 최종 음원 교체 뒤 타이 attack 수와 길이를 다시 확인하고 사람 검수가 필요한 것은 pending으로 남기세요.
```

### 프롬프트 8: QA와 인수

```text
13장의 테스트를 실행하고 각각 passed/failed/not run으로 보고하세요. 자동화 WebKit과 실제 iPhone 검증은 구분하세요. 가능한 기기에서 오디오 재개·Bluetooth·잠금·회전·cancel을 확인하세요. 측정 수치와 목표 수치를 섞지 마세요. README에 실행·빌드·검증 명령, 콘텐츠 버전, 권리 상태, 지원 기기, 제한을 기록하세요. 배포 권한이 없다면 정적 build 준비에서 멈추고 배포했다고 말하지 마세요.
```

## 16. V2 조건부 확장: 당김음과 스윙

### 16.1 당김음

054 원본의 마디 합계와 다른 음에 그린 타이 문제를 먼저 고친다. 당김음을 ‘강박을 무조건 빨리 누르기’로 설명하지 않는다. 약한 부분에서 시작한 같은 음이 강한 위치를 지나 유지되는 예를 먼저 쓴다.

새 4/4 예의 길이: 쉼 0.5q + 타이로 이은 8분 0.5q/4분 1q + 4분 1q + 4분 1q = 4q. 절대 tick은 rest 0~240, 타이음 240~480과 480~960, 다음 960~1440, 다음 1440~1920이다. 총 1920 tick이고 타이 attack은 240에서 한 번, 480에서는 없다. 원본의 2박·3.5박 예를 그대로 넣지 않는다.

교육자가 클릭·강세·지속·설명 카드의 일치를 검수한다. 새 데이터·악보·음원 승인 후에만 기능을 연다. 현재 MVP JSON에 알 수 없는 필드를 먼저 추가하지 않는다.

### 16.2 스윙: 2:1 연습 모델

031-3의 셋잇단 2:1 설명과 점음표 3:1 기보 충돌을 교정한다. 첫 수업은 ‘이 연습에서는 한 4분 길이를 320+160 tick으로 나눈다’고 명시한다. 4/4 한 마디에 [320,160]×4=1920 tick. 점8분 360+16분 120의 3:1 패턴과 같지 않다.

현재 denominator/dots 스키마로 320 tick을 거짓 표현하지 않는다. V2에서 writtenDuration과 performedDuration 또는 tupletRatio를 갖는 schemaVersion 2를 설계하고 migration 테스트를 쓴다. 보통 8분 두 개를 적고 스윙 지시로 해석하는지, 셋잇단을 직접 기보하는지 구분한다. 스윙을 timing error로 판정한 뒤 점수만 보정하지 않는다.

실제 스윙 비율은 템포·스타일·연주에 따라 달라진다. 2:1 연습 모델을 모든 재즈의 정답으로 일반화하지 않는다. 첫 수업에서는 기본 리듬과 2:1만 비교한다. 16분 스윙은 추가 후속 범위다.

## 17. 위험·가정·결정 필요 사항

| 위험/가정 | 영향 | 기본 대응 | 확인 시점 |
|---|---|---|---|
| 교재 권리 미확인 | 공개 사용 문제 | 원본 미포함, 새 도식 | 배포 전 |
| 006/007 비례 문제 | 점 개념 오학습 | 같은 칸 폭의 2+1 도식 | 8단계 |
| 타이/이음줄 혼동 | 다른 음까지 합침 | 철자·MIDI·연속성 검사 | 2~3단계 |
| 음가/키 동작 혼동 | tap을 길이 숙달로 오판 | hold에서만 길이 평가 | 4단계 |
| 박자를 음표 수로만 평가 | 같은 6탭으로 차이 소실 | 묶음·강세·개념 문항 | 9단계 |
| 기준 음표 없는 BPM | 6/8 빠르기 오해 | 내부 q와 표시 큰박 분리 | 3·9단계 |
| 모바일 지연 | 불공정한 miss | 시간 매핑·보정·기기 QA | 5·12단계 |
| 포커스 손실 | stuck hold | 프레이즈 무효화·재시작 | 7단계 |
| 장식이 신호를 가림 | 단서 불명확 | 판정점과 장식 레이어 분리 | 11단계 |
| 개념 과다 | 초보 이탈 | 수업마다 새 개념 하나 | 사용성 검사 |
| 모티프 반복 | 단조로움 | 같은 패턴 안에서 풍경 복원 | 사용성 검사 |
| 자산 제작량 | 일정 지연 | placeholder부터 완성 | 개발 착수 |

별도 결정이 없으면 한국어, 한 손 입력, 개인 기기 저장, 무계정, 네 장면, 아홉 레벨, 원본 PNG 미포함으로 진행한다. 학년별 교육과정, 교사용 대시보드, 다중 학생, 마이크 녹음, 서버 동기화, 유료 서비스는 새 범위다.

## 18. 출처와 검증 한계

- 교재 판정: [전수 분석 보고서](https://docs.google.com/document/d/1Mbtlky-yiBefNoYpNSFJwb6zp-0Rn72-0bD5tx67oJg/edit). 해당 항목을 읽었으며 원본 전체를 이 작업에서 재검수한 것은 아니다.
- 직접 본 원본: [017 붙임줄](https://drive.google.com/file/d/1sqKEmCF-HSOHjHM9p6L4HhTjfMsYTJrX/view), [032-3 박자 비교](https://drive.google.com/file/d/1Tf75AOzgm2MDL6EHHDVIDzC9Up1k09IP/view).
- 참고작: [Melatonin 공식 소개](https://www.halfasleep.games/melatonin/). 꿈·미술·음악의 높은 수준 방향만 참조했다.
- 이론: [OMT 음가·점·타이](https://viva.pressbooks.pub/openmusictheory/chapter/notating-rhythm/), [OMT 복합박](https://viva.pressbooks.pub/openmusictheorycopy/chapter/compound-meters-and-time-signatures/). 문구·도형·연습 문제를 복제하지 않고 원칙만 확인했다.
- 오디오: [예약 start](https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/start), [출력 timestamp](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/getOutputTimestamp), [autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).
- 중단·입력: [Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API), [W3C Pointer Events](https://www.w3.org/TR/pointerevents/).
- 도구: [PixiJS](https://pixijs.com/8.x/guides/getting-started/quick-start), [Vite](https://vite.dev/guide/), [Vitest](https://vitest.dev/guide/), [Playwright](https://playwright.dev/docs/intro).

자료 확인일은 2026-10-18이다. API 동작과 제품의 초기 수치(45/90/140ms, 25/150ms, 4회 반복)는 구분한다. 제품 수치를 검수 결과로 바꾸면 명세·테스트·contentVersion도 함께 갱신한다.

---

**첫 개발 목표:** L02를 회색 도형과 합성음으로 끝까지 작동시켜 중간 매듭에서 다시 누르지 않고 소리를 이어 가며 마지막에 제때 놓는 경험을 증명한다. 그다음 같은 데이터·시계·판정 계약 위에 나머지 꿈을 올린다.
