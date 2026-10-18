# 밤실 공방 · 꿈을 잇는 리듬

네 꿈 장면과 정규 L01–L09를 실제로 듣고, 누르고, 유지하고, 놓으며 연주하는 한국어 모바일 웹 게임입니다. 제공 이미지 92종을 사용하며, 정지 키포즈를 코드로 움직입니다. 현재는 **내부 검토용 MVP**입니다. 교육 도식과 미술의 `releaseApproved=false`를 보존했습니다.

## 실행

Node.js 22.12 이상(검증 환경 24.14.0)에서 이 폴더를 엽니다.

```powershell
npm ci
npm run dev
```

브라우저에서 **http://127.0.0.1:5286/** 을 여세요. `소리 켜고 꿈에 들어가기`를 직접 누른 뒤 수업을 선택합니다. 시작 시 오디오를 허용하지 못하면 소리 켜기를 재시도합니다. 리듬 마을의 폴더와 5180–5183 포트는 사용하지 않습니다.

인계 ZIP에는 빌드된 `dist/`도 포함됩니다. ZIP을 풀고 `start-game.cmd` 또는 `node scripts/serve.mjs`를 실행하면 추가 패키지 설치 없이 같은 주소에서 플레이할 수 있습니다. `index.html`을 파일로 직접 여는 방식은 ES 모듈·오디오 정책 때문에 지원하지 않습니다.

소스에서 로컬 빌드를 다시 만들려면:

```powershell
npm run build
npm run preview
```

프리뷰는 **http://127.0.0.1:4286/** 에서 실행합니다. 서버는 loopback에만 연결됩니다. 포트 충돌 시 임의로 다른 앱을 종료하지 않습니다.

## GitHub 연동 자동 배포

기존 Vercel 프로젝트 `melatonin-game`은 GitHub 저장소 `kimyounggaur/Melatonin_Game`에 연결되어 있습니다. 원격 `main`의 새 커밋을 push하면 production 배포가 자동으로 시작됩니다. 빌드가 READY로 완료되면 **https://melatonin-game.vercel.app/** 에 새 버전이 반영됩니다.

로컬에서 `git commit`만 하는 것은 배포를 시작하지 않습니다. 커밋을 원격 저장소에 전송하는 `git push origin main`이 자동 배포의 trigger입니다. 전송할 새 커밋이 없는 push도 새 배포를 만들지 않습니다.

Vercel은 연결된 커밋에서 `npm ci`와 `npm run build`를 실행하고 `dist/`를 배포합니다. 배포 목록에서 커밋 SHA·production·READY를 확인하세요. 이 연결에는 별도의 배포 토큰이나 중복 GitHub Actions 배포 작업이 필요하지 않습니다. 교육자·청음·미술의 pending 승인 상태와 교육 출고 gate는 그대로 유지됩니다.

## 플레이

- 추천 순서: **L01 → L02 → L03 → L04 → L06 → L07 → L05 → L08 → L09**. 점수 잠금 없이 다른 수업도 선택할 수 있습니다.
- 결과의 `이 부분 연습 · 원곡의 75%`는 실패한 마디와 필요한 붙임줄 시작 마디를 함께 가져옵니다. 새 1마디 카운트인 뒤 원곡의 75% 속도로 2회 연습하고 다시 하기/원래 수업 복귀를 선택합니다. 기본 최고점은 바뀌지 않습니다.
- 1마디 카운트인 → 시연 2회와 1마디 여운 → 직접 연습 시작 → 연습 2회 → 직접 연주 시작 → 연주 4회 → 종료 판정과 1마디 여운 → 결과.
- `Space` 또는 큰 터치 영역을 누릅니다. 채운 원은 누름, 실은 유지, 빈 원은 놓기, 점선은 기다리기입니다. 설정에서 F/J/Enter로 바꿀 수 있습니다.
- 붙임줄 중간 매듭에서 다시 누르지 않습니다. tap은 시작만, hold는 시작과 놓기를 따로 평가합니다. 쉼에는 담당 선율이 없지만 맥박은 계속됩니다.
- 일시정지·화면 숨김·회전·오디오 중단은 실수로 처리하지 않습니다. 현재 미확정 모티프를 되돌리고, 이미 확정한 이전 모티프를 보존합니다. 손을 놓고 이어하기를 누르면 새 카운트인부터 시작합니다.
- 고대비, 움직임 축소, 시작·끝 탭 보조, 넓은 판정, 연습 가이드, 큰박 숫자, 개별 볼륨을 설정할 수 있습니다. 보조 연주는 기본 최고점과 분리됩니다.
- 선택적 입력 보정은 4박 예고+16클릭, 처음 4개 제외 후 12개 중앙값입니다. 빠진 표본이나 MAD>45ms이면 자동 적용하지 않으며, 적용 전 직접 확인합니다. 사람의 반응 편향이 포함됩니다.

## 검증

```powershell
npm run typecheck
npm run validate:content
npm run test:unit
npm run test:integration
npm run test:e2e
node docs/reference-fixtures/verify-reference.mjs
npm run gate:education
```

`gate:education`의 현재 **실패는 의도된 출고 차단**입니다. 승인 상태를 바꾸거나 사이트를 배포하는 명령은 없습니다. E2E는 전용 브라우저를 사용하며 최초에는 Playwright 브라우저 설치가 필요할 수 있습니다. 자세한 실제 결과와 한계는 `reports/TEST-REPORT.md`, 인수 항목은 `docs/acceptance-checklist.md`를 보세요.

1.0.1-preview는 개발 도구 보안 교정을 포함합니다. Vite 7.3.7·Vitest 4.1.11·Ajv 8.20.0을 고정했고, 교정 뒤 `npm audit` 취약점 0건과 단위·통합 244개 통과를 확인했습니다. 변경 근거와 전후 원시 결과는 `reports/DEPENDENCY-TRIAGE.md`와 `reports/dependency-audit-*.json`에 있습니다.

## 구조와 데이터

`src/core/`는 순수 음악 검증·컴파일·판정·입력·원장입니다. `src/audio.ts`가 유일한 음악 시계이며, `src/scene.ts`는 그 시각을 그리기만 합니다. `src/content/`는 원문과 객체가 같은 9레벨입니다. `public/assets/night-thread/`는 수정하지 않은 모바일 자산·manifest·라벨·라이선스입니다. `reference/`는 읽기 전용 원문이고 `docs/reference-fixtures/`는 원문에서 추출한 테스트 오라클입니다.

이미지 정답을 역산하지 않으며 PPQ480 정수 데이터에서 악보·소리·입력 기대 시각을 만듭니다. 25ms/150ms 오디오 예약, 별도 onset/release 허용창과 100ms 전달 grace를 사용합니다. PLAY에서는 입력이 없으면 정답 선율도 없습니다.

진도는 이 브라우저의 `night-thread.progress.v1`에만 저장합니다. 계정·서버·마이크·결제·분석 SDK가 없습니다. 저장 실패에도 현재 플레이와 결과를 볼 수 있습니다. 설정 초기화는 확인 뒤 이 게임의 키만 삭제합니다. 다른 기기로 자동 동기화하지 않습니다.

## 인수 및 권리

실제 iPhone/Android, 직접 청음, 교육자 서명, 접근성 사용자 관찰과 학습 효과 검증은 자동 검사로 대체하지 않습니다. 미완료 항목은 보고서에 남겼습니다. V2 당김음·스윙과 유료 기능은 범위 밖입니다. 사용자가 추가로 요청한 GitHub commit·push 및 Vercel 호스팅은 **검토용 MVP 빌드**로 진행합니다. 이 호스팅 요청이 교육자·청음·미술 검수를 승인으로 바꾸지는 않으며 `gate:education`은 계속 차단 상태입니다.

제공된 미술과 글리프의 출처·권리 조건은 `reference/original-assets-README.md`, 모바일 README, `public/assets/night-thread/docs/`의 라이선스에 따릅니다. 원본 문서와 Drive 공유 권한은 변경하지 않았습니다.
