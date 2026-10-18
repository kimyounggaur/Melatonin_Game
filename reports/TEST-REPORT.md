# 밤실 공방 MVP 검증 보고서

대상은 `bamsil-workshop`의 검토용 MVP 빌드입니다. 네 꿈 장면과 L01–L09를 제공된 정규 데이터와 92종 모바일 자산으로 구현했습니다. 원본 문서·이미지와 Drive 공유 권한은 변경하지 않았습니다. V2와 유료 기능은 실행하지 않았습니다. 추가로 명시적으로 요청한 Git push·Vercel 호스팅은 교육 검수 pending을 보존한 검토용 빌드로 진행하며, 최종 배포 증거는 별도 배포 보고서에 남깁니다.

## 자동 검증

| 범위 | 결과 | 근거 |
|---|---|---|
| TypeScript strict + Vite 빌드 | 통과 | `npm run typecheck`, `npm run build` |
| 단위·통합 | 244/244 통과, 실패/skip 0 | `unit-integration-final.json` |
| 원문·정규 데이터·오라클·자산 해시 대조 | 540/540 통과 | `../docs/reference-fixtures/verification.json` |
| 실제 Chrome 자산 검사 | 28/28 통과 | `assets-browser.json` |
| 전체 UI·실제 시간 브라우저 경로 | 최신 고유 21/21 통과, 미해결 실패/skip 0 | `browser-qa.md`, `browser-qa.json` 및 원시 실행 기록 |
| 설치 없는 로컬 서버 | HTML·JS·CSS·WebP·manifest 모두 HTTP 200 | `local-server-check.json` |
| DEV getter 없는 로컬 production | 실제 키 반응·결과 0/100·1회 저장/재시작 보존·92종 HTTP/SHA 통과, 실행 오류 0 | `browser-production-preflight.json` |
| 공개 교육 출고 gate | **차단됨, 예상 결과** | `npm run gate:education` exit 1, 92/92 승인 미완료 |
| 테스트 러너 자체 오류 탐지 | 예상 실패 탐지 후 fixture 제거 | `runner-negative.json` exit 1. 최종 suite는 green |

순수 엔진 검사에는 정규 9레벨·잘못된 at/음가/MIDI/타이/미승인 상태 거부, 붙임줄 단일 gate, 반복 경계, 45/90/140ms와 release 60/110/160ms의 μs 경계, 보조 1.35배와 이웃 cap, 점수 분모, 쉼의 별도 표본, 100회 결정성, 늦은 이벤트의 원장 철회, 원자 프레이즈 복구, owner/repeat/다중 포인터, 저장 파손·quota·migration·중복·보조 기록 분리가 포함됩니다.

오디오 검사는 실제 Web Audio API의 예약 계약에 맞춘 fake context와 통합 테스트입니다. 타이 중간 attack 없음, 이른 up 종료, tap 원래 끝 유지, 늦은 tap 축소/생략, 최대 release와 dispatch grace 분리, 오디오 중단 fade/정리, +80ms 보정의 한 번 적용, 출력 timestamp/fallback, 보정 median/MAD/표본 누락을 확인했습니다. 실제 청음이나 물리 지연 측정은 아닙니다.

## 브라우저 검증

공유 Windows 컴퓨터에서 전용 임시 프로필의 headless Google Chrome 155와 Playwright Firefox 142.0.1을 사용했습니다. 사용자 브라우저 탭과 다른 게임 저장소·포트는 조작하지 않았습니다. 검사는 실제 AudioContext와 실제 시간 흐름을 사용하고, 소리를 직접 듣는 검사는 아닙니다. 다른 작업을 방해하지 않도록 테스트 볼륨을 0으로 두되 clock과 예약은 계속 실행했습니다.

최소 화면 크기는 320×568, 390×844, 768×1024, 844×390, 1366×768입니다. 지도·수업·연주 화면, 가로 스크롤, 주 패드의 가로/세로 viewport 노출과 최소 72px 높이, 200% 텍스트 확대, 설정과 일시정지의 접근 가능한 이름, 키보드 focus를 검사했습니다. 스크린샷은 인계 ZIP의 `output/playwright/`에 포함됩니다.

Windows Playwright WebKit 26에는 `AudioContext`와 `webkitAudioContext`가 모두 없어 음악 실행 검사가 불가능했습니다. 앱은 소리 켜기 실패 안내를 표시하고 무음 채점으로 진행하지 않습니다. WebKit 정적 화면과 실패 경로는 별도로 검사하며, 실제 iPhone Safari 검사를 수행했다고 쓰지 않습니다.

최신 케이스별 합산은 Chrome 15개·Firefox 4개·WebKit 정적 2개, 총 21개 통과입니다. 전체가 한 번의 실행에서 통과했다는 뜻은 아닙니다. Chrome에서는 정규 9레벨의 실제 LISTEN→PRACTICE→PLAY→결과·저장 흐름, L02 hold/release·다중 포인터·재개 100점, L04 ±250ms 보정 각각 100점을 확인했습니다. L03은 75% 부분 연습·타이 전체 보존·원장 불변과 기본/심화 교육 카드 전환도 확인했습니다. 나머지 레벨의 성공 타이밍을 실제 브라우저 입력으로 전수 연주한 것은 아니며, 정답 데이터와 판정은 독립 오라클·단위 검사로 대조했습니다.

Firefox의 최종 재개 검사는 새 세션의 카운트인 준비를 기다리도록 테스트 경쟁을 수정한 뒤, headless 명령 전달 지연을 고려한 고정 30ms 선행 입력으로 같은 판정창·보정 0·100점 기준을 통과했습니다. 앞선 90점·79점과 초기 실패·skip 기록은 삭제하지 않았습니다. 상세 이력과 각 최신 결과의 근거는 `browser-qa.md`, `browser-resume-readiness-harness.md`, `browser-firefox-transport.md`를 참조합니다. 이는 실제 사용자 입력/음향 지연의 보정 측정이 아닙니다.

## 발견 및 수정

- 초기 sandbox DNS/localhost 제한은 승인된 전용 파일 다운로드·서버·headless 실행으로 해결했습니다. 권한을 우회하지 않았습니다.
- Windows에서 Vitest glob이 literal 필터로 전달되어 검사 0건이 되던 스크립트를 실제 prefix 필터로 수정했습니다. 최종 검사 244건이 실제 실행됐습니다.
- D26: 허용된 ±250ms 입력 보정에서 정상 입력이 먼저 miss로 확정되던 문제를 수정했습니다. 양수 보정만큼 onset/release timeout과 프레이즈·최종 확정 대기를 늦추고, 첫 입력의 early 필터는 해당 시도에 고정된 보정값을 뺀 시각으로 비교합니다. 음악 목표·오디오 gate·판정창과 raw 전달 지연 200ms 기준은 유지했습니다. 양수/음수 완벽 연주·무입력·마지막 release 확정·늦은 정상 edge를 포함한 새 회귀 검사 11개가 모두 통과했습니다.
- 데스크톱 낮은 높이에서 패드가 화면 밖으로 밀리던 결함을 수정했습니다. 최종 layout은 장면을 사용 가능한 높이에 맞추고, 검사도 패드의 y좌표까지 확인합니다.
- 시작 전 안전 여유 때문에 카운트인에 5가 보이던 문제를 박자별 4/3/2 상한으로 수정했습니다.
- hover 때 주 패드가 어두워지던 대비 문제, 수동 보정 값의 범위 초과, 폐기된 장면의 늦은 decode, press/prepare 포즈 연결을 수정했습니다.
- PRACTICE 뒤의 불필요한 1마디 OUTRO를 제거했습니다. 이제 2회 모티프와 판정 확정 뒤 바로 선택 화면으로 돌아가며, PLAY에만 1마디 마무리가 있습니다.
- 결과의 취약 구간 연습은 원곡의 75% 속도로 2회 진행하며 완료·최고점 원장을 바꾸지 않습니다. L03은 마디선을 넘는 붙임줄의 시작과 끝을 함께 보존합니다.
- 연주 중 입력 보조와 결과의 도움 표시는 해당 시도 시작 때 고정한 설정을 사용합니다. 이후 설정 변경이 이전 연주의 보조 기록이나 표시를 바꾸지 않습니다.
- Chrome CDP의 `touchEnd`에 남은 포인터를 넣었던 테스트 프로토콜 오류는 harness를 수정했습니다. 제품 음악 오라클·점수 정답은 바꾸지 않았습니다.
- 배포 빌드의 추가 검사에서 발견한 `favicon.ico` 404는 제공된 `ui/icon_home.svg`를 favicon으로 연결해 수정했습니다. 실제 배포 검증은 DEV getter 없이 입력 버튼 반응·결과·저장·92종 HTTP/SHA를 확인하며, 이 검사에서 Perfect 연주를 했다고 주장하지 않습니다.

## 성능

`performance.json`과 `performance.md`는 2026-10-18T17:03:09Z에 favicon을 포함한 최종 build를 측정한 resource timing과 rAF 표본입니다. 첫 playable까지 production 전송은 **1,373,608B**로 8,000,000B 목표 아래입니다. 약 5초의 L02 듣기 표본에서 프레임 간격 mean 4.52ms / p95 7.50ms / max 53.60ms, 해당 구간 long task 0이었습니다. 전체 탐색 실행에는 long task 2개가 관측됐습니다. 개발 환경에서는 관측 voice 최대 3, 20회 전환 모두 정확한 현재 profile만 보유했습니다.

이는 공유 데스크톱의 짧은 headless 측정입니다. GPU 렌더 시간, 실제 터치 지연, iPhone/Android의 메모리·온도·배터리 성능을 측정하지 않았습니다. 자산의 RGBA 예상 메모리는 실기기 GPU 측정이 아닙니다. ZIP 전체 크기는 초기 앱 전송량이 아닙니다. 세부 측정과 구간 구분은 JSON을 참조합니다.

## 사람이 확인해야 할 사항

실제 iPhone/Android, 직접 청음과 peak/clip 확인, 교육자 악보·설명·문항 서명, 스크린리더/접근성 사용자 관찰, 초보자 학습 효과는 **not run / pending**입니다. 검수자 이름이나 승인 날짜를 만들지 않았고 92종 자산의 `releaseApproved=false`를 유지했습니다. `../docs/manual-acceptance.md`에 후속 체크리스트가 있습니다.

로컬 MVP를 실행하고 코드를 검토할 수 있는 상태이며, 공개 교육 출고는 사람이 승인하기 전 차단됩니다.
