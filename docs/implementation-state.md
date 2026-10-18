# 구현 상태 · 내부 검토 MVP

기준: 원 설계 1.0 + 모바일 프롬프트팩 1.0. 최신 사용자 지시에 따라 P00부터 MVP를 구현하고 P25 인계 빌드를 준비합니다. P26 V2는 실행하지 않습니다. 추가로 요청한 Git commit·push는 지정된 `kimyounggaur/Melatonin_Game`에 수행하고, P27은 이후 명시적으로 요청한 Vercel 검토용 MVP 호스팅을 진행합니다. 미술·교육자·청음 승인은 pending을 유지합니다.

원문, 92종 이미지, 해시, 정규 레벨과 테스트 오라클을 보존했습니다. 실제 모델 선택 UI를 바꾸거나 Astra/Ultra로 전환했다고 주장하지 않습니다. 현재 Codex 세션에서 구현했습니다.

| 단계 | 구현 및 자동 검증 상태 | 증거 / 남은 인수 |
|---|---|---|
| P00 | 완료 | `source-provenance.json`, `contracts.md`, `decisions.md`, 원문 540항목 대조 |
| P01 | 완료 | strict TypeScript, Vite, Vitest, Playwright, 실제 실패 러너 검사·복구 |
| P02 | 완료 | 원문과 동등한 9 JSON·Draft2020-12·음악 의미 검사·negative mutations |
| P03 | 완료 | 타이·반복·큰박·절대 tick 컴파일 golden |
| P04 | 완료 | μs 경계·이웃 cap·onset/release·rest·100회 결정성 |
| P05 | 완료 | 물리 owner·repeat·timestamp·보조 edge·epoch |
| P06–P07 | 완료 | Web Audio master·25/150 예약·합성음·보정·오디오 테스트 |
| P08–P09 | 완료 | 원자 프레이즈 복구·확정 근거 보존·늦은 입력 철회·재카운트인 |
| P10–P11 | 완료 | L02 실 플레이 관문·L01 길이·L03 마디선 타이 |
| P12–P15 | 완료 | 점음표/점쉼표·3/4·6/8·72/108·4장면/9레벨 지도 |
| P16 | 완료 | manifest 기반 92종·개별 앵커·실제 WebP decode·PNG fallback |
| P17–P18 | 완료 | 5뷰포트·큰 DOM패드·고대비·움직임축소·키 재지정·보조모드 |
| P19 | 완료 | 로컬 원장·중복 저장 방지·보조 최고점 분리·철회·저장 장애 복구 |
| P20 | 내부 preview 완료 | 정규 데이터 악보·4개 박자 문항·도식 lazy load. 교육 출고 승인 pending |
| P21 | 자동/시각 검사 완료 | 앵커 교체·모션·볼륨 bus·voice 제한. 실제 청음/장치 peak 검수 not run |
| P22 | 데스크톱 headless 측정 완료 | `reports/performance.md`. 실제 모바일 GPU/메모리/온도 not run |
| P23 | 자동 회귀 및 최종 보고서 완료 | 단위·통합 244/244, 원문 540/540, 브라우저 최신 고유 21/21. 실패 이력과 환경 한계는 `reports/TEST-REPORT.md`에 보존 |
| P24 | 사람이 해야 할 인수 대기 | 실제 iPhone/Android·교육자·직접 청음·접근성 사용자·초보자 관찰 not run |
| P25 | 내부 검토 인계 빌드 | 소스/로컬 dist·README·테스트 보고서·ZIP. P24 미완료를 명시 |
| P26 | 미실행 | V2 별도 승인 없음 |
| P27 | 명시 승인된 검토용 MVP 호스팅 | 검증된 Git SHA로 Vercel에 연결. 최종 URL·배포 ID·SHA는 별도 인수 보고서 참조. 교육 출고 gate는 계속 차단 |

시연은 성적에 저장하지 않습니다. 실제 연주 무입력 0점, 실제 타이 hold/release, 도식 미승인 출고 차단은 자동 회귀로 확인합니다. 웹 자동화에서 실제 audio clock과 입력 이벤트를 사용하지만, 물리적 기기 조작이나 청음을 수행한 검사는 아닙니다.

최종 자동 통과/실패 수, 보존한 초기 환경 오류, 성능 수치와 미검증 범위는 `reports/TEST-REPORT.md`를 최종 근거로 사용합니다. 공개 교육 빌드는 `npm run gate:education`에서 의도적으로 실패합니다.
