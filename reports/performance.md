# P22 로컬 성능 측정

측정: 2026-10-18T17:03:09.194Z. Chrome 155.0.8059.80. Desktop headless Google Chrome on shared Windows host; no physical mobile device, direct listening, GPU profiling, or network throttling.

실제 UI에서 홈 → 소리 켜기 → 꿈 지도 → L02 수업 → 듣기를 진행했다. 별도 headless Chrome 임시 프로필을 사용했고 다른 게임·사용자 브라우저는 조작하지 않았다.

| 실행 | 첫 playable 누적 HTTP 전송 bytes | 홈 mean / p95 / max ms | L02 듣기 mean / p95 / max ms | 듣기 long tasks | 관측 max voices |
|---|---:|---|---|---:|---:|
| production | 1,373,608 | 3.69 / 4.90 / 6.80 | 4.52 / 7.50 / 53.60 | 0 | production getter 없음 |
| development | 2,462,104 | 3.60 / 4.80 / 6.80 | 4.27 / 7.40 / 11.00 | 0 | 3 |

- production: 8,000,000B 초기 전송 목표 통과. production inspector intentionally absent; not directly observable here; development run and asset loader tests provide profile evidence.
- development: 8,000,000B 초기 전송 목표 통과. 20/20 exact scene profiles; no accumulation observed in registry.

Resource Timing의 transferSize는 응답 헤더를 포함하며, encodedBodySize/decodedBodySize와 개별 URL은 JSON에 남겼다. Vite preview의 실제 HTTP content-encoding도 기록했다. build가 출력하는 gzip 크기는 추정치이고 localhost preview가 identity로 제공했다면 그 수치를 압축 실측 전송량으로 부르지 않는다. 개발 서버의 ES module/AJV 요청 수치는 production 빌드와 구별한다.

각 프레임 표본은 약 5초다. requestAnimationFrame 간격과 longtask를 측정했으며 화면 픽셀 GPU 렌더 시간·실제 터치 지연을 측정한 것은 아니다. 성능 수치는 이 공유 데스크톱의 headless 실행 결과이며 iPhone/Android나 브라우저별 보증이 아니다. performance.memory가 있으면 JS heap만 기록하며, 이 값으로 디코드 이미지/GPU 메모리 상한을 주장하지 않는다.

20회 장면 전환은 L02→L04→L06→L08을 다섯 번 순환했다. development getter로 각 전환 뒤 현재 loadProfile의 정확한 ID 집합과 voice 수를 읽었다. production에서 개발 getter가 제거된 것은 의도된 경계이므로 profile 증거는 development와 기존 자산 로더 단위·브라우저 검증을 함께 사용한다.

실행 오류: 없음.

재실행: `npm run build`, `npm run preview`, 별도 `npm run dev` 후 `node scripts/performance-probe.mjs`. 결과 JSON: `reports/performance.json`; 화면: `output/playwright/performance/`.