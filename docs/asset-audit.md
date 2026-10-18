# 런타임 자산 통합 검수

기준은 `reference/assets/night_thread_mobile_runtime_v1/runtime_manifest.json` 및 같은 폴더의 README, VECTOR_GUIDE, RUNTIME_QA, vector_QA, labels.ko.json이다. 원 설계·프롬프트팩의 D02/D03/D04/D12, P10~P18/P20/P21 및 부록 B를 적용했다. 원본 문서·자산·해시·승인 상태는 수정하지 않았다.

## 실제 전달본

`public/assets/night-thread/`에는 기본 논리 자산 **92종**(WebP 17, SVG 75), 선택 PNG 폴백 17, 원본 manifest·README·라이선스·검수 기록·정규 레벨 원본이 있다. 기본 92종 합계는 **1,916,295 bytes**, PNG 폴백 합계는 **6,979,922 bytes**이다. 폴백 파일은 디스크에 함께 있으나 브라우저에서 두 포맷을 동시에 preload하지 않는다. PNG 벡터 렌더가 없는 것은 런타임 팩의 정상 계약이다.

`src/assets.ts`는 manifest의 ID/경로/상태/크기/앵커/크롭을 그대로 사용한다. `AssetLoader.loadScene`은 WebP 디코드 기능을 한 번 검사하고, 선택한 장면의 loadProfiles만 디코드한다. 개별 WebP가 실패하면 해당 PNG 하나만 뒤이어 읽는다. SVG·폴백이 없거나 크기가 잘못되면 에러를 던져 카운트인 시작 전에 차단한다. 장면 전환 전에 이전 전용 이미지를 해제하며 공통 캐릭터·UI를 유지한다. 해제 시 브라우저의 실제 메모리 회수 시점까지 보증하지 않는다. 비동기 decode 도중 dispose/다른 장면 요청이 도착해도 폐기한 이미지가 되살아나지 않는다.

## 좌표와 움직임

Canvas2D를 PixiJS 8 대신 사용한 것은 기능적 대안이다. 이 게임의 작은 2D 장면은 정지 키포즈와 SVG를 그리는 draw-only adapter로 충분하며 추가 렌더러 의존성과 WebGL 텍스처 관리가 필요 없다. 게임 판정·음향 clock은 렌더러에 의존하지 않는다. 이 선택이 GPU 메모리 절감을 실제 측정해 증명한 것은 아니다.

`DreamScene.render(frame)`은 전달된 audio transport tick과 judge 상태만 사용한다. 자체 음악 타이머·충돌 판정·requestAnimationFrame 루프가 없다. 고해상도 canvas backing store DPR은 **최대 2**로 제한한다. 390 CSS px/DPR 3에서 원본 픽셀 품질을 제공한다고 주장하지 않는다.

- 세로 배경: 런타임 4:3 crop `[64,0,1024,768]`; 가로: 16:9 `[0,60,1152,648]`.
- 발밑 앵커: 여울 `[273.5566,480.9697]`, 꽃 `[272.3317,477.7033]`; 솜새 count/encourage `[208.2297,350.622]`, demo `[208.2297,357.0526]`.
- `anchorPx / 실제 width,height`로 정규화한다. pixel 4자리/normalized 6자리의 독립 반올림으로 demo Y는 `5.2083e-7` 차이가 있어 허용치는 `1e-6`이다. 중앙 pivot으로 덮지 않는다.
- 주요 타깃은 논리 가로 `0.52` 위치로, 폭 중앙 ±20% 안에 유지한다. 입력 패드와 한국어 설명은 별도 실제 DOM이다.
- 실빛다리: 닫힌 onset, 납작한 tie 매듭, 빈 release 원, 뒤 레이어 마디 기둥. 타이 경계에 새 press/공격/파티클을 만들지 않는다. ribbon은 release 내부 직전에 clip하며 실감개 연결선도 고정 타깃 중앙 전에 멈춘다. 긴 hold는 전체 끝 원을 보여주는 동일 칸 게이지를 유지한다.
- 온실: 실제 원화 꽃 closed→opening_1→opening_2→open의 **4상태만** 사용한다. 대체 벡터 꽃 4개는 함께 로드하지 않는다. 두 물통은 같은 scale `.78`을 사용하여 액체 128×96 : 64×96의 **2:1**을 보존한다. 장식 꽃 면적으로 길이를 계산하지 않는다. 쉼에는 덮개와 기다리기 아이콘을 쓰며 이슬 pulse는 계속 진행한다.
- 접히는 방: 6개의 같은 80px 타일과 같은 eighth clock을 유지한다. 대기 화면은 묶음이 포함된 floor를, 연주 화면은 6개 개별 타일과 bracket 한 계열을 사용한다. 각 묶음이 조금 접히는 transform을 코드로 적용하며, 완성 floor·bracket·hinge의 곡선을 한꺼번에 겹쳐 묶음 수를 부풀리지 않는다. 2+2+2와 3+3은 묶음·큰박 단서만 바뀐다. 압력을 채점하지 않는다.
- 우체역: L08/L09에 동일 편지 외형을 쓰고 이동 위치를 tick에서 계산한다. 유효 성공은 idle→folded→success_star를 선택하며 다음 편지 시각을 변경하지 않는다.
- 여울은 idle/prepare/press/hold/release/miss, 솜새는 count/demo/encourage 정지 포즈다. 약한 위치·회전·scale 보간은 코드가 붙였다. **애니메이션 리그가 아니다.** 움직임 축소에서는 sway·squash·lift를 제거하고 필수 선형 시간 단서는 유지한다. 고대비는 `_hc`와 윤곽을 사용하며 hit 앵커와 시간은 동일하다. 화면 흔들림·전면 섬광·파티클은 사용하지 않는다.

## 교육 프리뷰와 배포 경계

기본 6개 도식과 고급 4개를 구분했다. `getEducationCard`는 한 도식의 경로와 한국어 DOM 설명을 반환한다. 기본 설명·alt에 숨긴 tick 공식을 넣지 않는다. L03은 부분 발췌이며, tempo 도식은 음높이를 생략한 리듬 표기임을 명시한다. 도식은 결과·도움 DOM에서 한 장씩 불러오는 용도이며 장면 텍스처로 preload하지 않는다.

모든 교육 자산의 `notationReview=pending`, `listeningReview=pending`, `releaseApproved=false`를 보존한다. ‘교육자·청음 검수 전 개발 프리뷰’ 표시를 제공한다. 수학 검사나 자동 브라우저 스크린샷을 교육자 승인·실기기 검수·실제 청음으로 표현하지 않는다. 제공 license 두 개를 배포 파일에 그대로 포함한다. 공개 배포는 이 작업 범위에 없다.

## 실행한 검증

- `npx vitest run tests/assets.test.ts`: **16/16 통과**. 모든 92종 기본 파일과 17종 PNG의 크기·SHA-256, 앵커, 파생 크롭, 고대비 앵커 일치, 동일 칸 geometry, 꽃 대체 관계, 장면별 전송 예산·load/unload, 선택 폴백·오류 차단·비동기 폐기, 타이 포즈, 교육 승인 상태를 검사했다. WebP 기능 검사 대기 중 dispose 또는 다른 장면 요청이 도착하면 이전 프로필의 디코드를 한 번도 시작하지 않는지 확인했다.
- 실제 브라우저 검증 스크립트: `node tests/assets-browser.mjs` (기본 검증 서버 `127.0.0.1:5287`). 결과는 `reports/assets-browser.json`, 화면은 `output/playwright/assets/`에 기록한다. sandbox 로컬 소켓 차단을 피해 별도 승인된 로컬 실행에서 검증한다. 최종 실행 결과는 이 JSON을 기준으로 판단한다.
- 실제 WebP 17개 decode, 4장면×390 세로/844 가로의 8개 스크린샷, 장면별 정확한 profile/DPR/crop/그리기와 개별 실 PNG 폴백을 브라우저에서 통과했다. 정지 검수에서 캐릭터가 첫 타일·물통 일부를 가리는 것과 묶음 곡선 중복을 발견해 수정한 뒤 재촬영했다.
- 실기기 iPhone/Android 성능·메모리·GPU·터치 지연·직접 청음·교육자 최종 승인은 **미수행**이다.

## 92종 실제 카탈로그

아래 표는 배포에 복사한 동일 manifest에서 생성했다. SVG 앵커는 이름 있는 anchors, 래스터는 anchorPx이며 승인 상태는 모두 false이다.

| assetId | 실제 파일 | 상태 | 크기 | 앵커 |
|---|---|---|---|---|
| scene_a_thread_bridge | backgrounds/scene_a_thread_bridge.webp | static | 1152×768 | [576.0,384.0] |
| scene_b_crescent_greenhouse | backgrounds/scene_b_crescent_greenhouse.webp | static | 1152×768 | [576.0,384.0] |
| scene_c_folding_room | backgrounds/scene_c_folding_room.webp | static | 1152×768 | [576.0,384.0] |
| scene_d_cloud_post_station | backgrounds/scene_d_cloud_post_station.webp | static | 1152×768 | [576.0,384.0] |
| character.yeoul.idle | characters/yeoul_idle.webp | idle | 512×512 | [273.5566,480.9697] |
| character.yeoul.prepare | characters/yeoul_prepare.webp | prepare | 512×512 | [273.5566,480.9697] |
| character.yeoul.release | characters/yeoul_release.webp | release | 512×512 | [273.5566,480.9697] |
| character.yeoul.press | characters/yeoul_press.webp | press | 512×512 | [273.5566,480.9697] |
| character.yeoul.hold | characters/yeoul_hold.webp | hold | 512×512 | [273.5566,480.9697] |
| character.yeoul.miss | characters/yeoul_miss.webp | miss | 512×512 | [273.5566,480.9697] |
| object.greenhouse.flower_closed | objects/flower_closed.webp | closed | 512×512 | [272.3317,477.7033] |
| object.greenhouse.flower_opening_2 | objects/flower_opening_2.webp | opening_2 | 512×512 | [272.3317,477.7033] |
| object.greenhouse.flower_open | objects/flower_open.webp | open | 512×512 | [272.3317,477.7033] |
| object.greenhouse.flower_opening_1 | objects/flower_opening_1.webp | opening_1 | 512×512 | [272.3317,477.7033] |
| somsae_count | characters/somsae_count.webp | count | 384×384 | [208.2297,350.622] |
| somsae_demo | characters/somsae_demo.webp | demo | 384×384 | [208.2297,357.0526] |
| somsae_encourage | characters/somsae_encourage.webp | encourage | 384×384 | [208.2297,350.622] |
| bridge_onset | objects/bridge_onset.svg | ready | 96×96 | {"hit":[48,48]} |
| bridge_release | objects/bridge_release.svg | ready | 96×96 | {"hit":[48,48]} |
| bridge_tie_knot | objects/bridge_tie_knot.svg | continuous | 96×96 | {"boundary":[48,48]} |
| bridge_onset_hc | objects/bridge_onset_hc.svg | high-contrast | 96×96 | {"hit":[48,48]} |
| bridge_release_hc | objects/bridge_release_hc.svg | high-contrast | 96×96 | {"hit":[48,48]} |
| bridge_tie_knot_hc | objects/bridge_tie_knot_hc.svg | high-contrast | 96×96 | {"boundary":[48,48]} |
| bridge_bar_pillar | objects/bridge_bar_pillar.svg | behind-ribbon | 128×320 | {"barline":[64,160],"base":[64,304]} |
| bridge_needle_eye | objects/bridge_needle_eye.svg | open | 256×256 | {"hit":[128,112],"tip":[128,246]} |
| bridge_spool | objects/bridge_spool.svg | idle | 256×256 | {"ribbonExit":[198,124],"base":[128,228]} |
| bridge_ribbon_tile | objects/bridge_ribbon_tile.svg | continuous | 128×64 | {"left":[0,32],"right":[128,32]} |
| bridge_ribbon_broken | objects/bridge_ribbon_broken.svg | miss | 256×80 | {"break":[120,41],"left":[4,41],"right":[250,41]} |
| bridge_lantern_idle | objects/bridge_lantern_idle.svg | idle | 128×160 | {"lightCenter":[64,86],"hang":[64,12],"base":[64,140]} |
| bridge_lantern_active | objects/bridge_lantern_active.svg | active | 128×160 | {"lightCenter":[64,86],"hang":[64,12],"base":[64,140]} |
| greenhouse_container_2u | objects/greenhouse_container_2u.svg | filled | 176×184 | {"base":[88.0,166],"fillOrigin":[24,56]} |
| greenhouse_container_1u | objects/greenhouse_container_1u.svg | filled | 112×184 | {"base":[56.0,166],"fillOrigin":[24,56]} |
| greenhouse_time_strip_3u | objects/greenhouse_time_strip_3u.svg | hold | 216×96 | {"start":[12,44],"release":[204,44]} |
| greenhouse_rest_cover | objects/greenhouse_rest_cover.svg | closed | 256×256 | {"target":[128,115],"base":[128,228]} |
| greenhouse_dew_idle | objects/greenhouse_dew_idle.svg | idle | 96×96 | {"center":[48,48]} |
| greenhouse_dew_active | objects/greenhouse_dew_active.svg | active | 96×96 | {"center":[48,48]} |
| greenhouse_flower_0 | objects/greenhouse_flower_0.svg | open-0-of-3 | 256×256 | {"target":[128,149],"base":[128,239]} |
| greenhouse_flower_1 | objects/greenhouse_flower_1.svg | open-1-of-3 | 256×256 | {"target":[128,149],"base":[128,239]} |
| greenhouse_flower_2 | objects/greenhouse_flower_2.svg | open-2-of-3 | 256×256 | {"target":[128,149],"base":[128,239]} |
| greenhouse_flower_3 | objects/greenhouse_flower_3.svg | open-3-of-3 | 256×256 | {"target":[128,149],"base":[128,239]} |
| room_tile_idle | objects/room_tile_idle.svg | idle | 96×96 | {"center":[48,44],"left":[8,44],"right":[88,44]} |
| room_tile_active | objects/room_tile_active.svg | active | 96×96 | {"center":[48,44],"left":[8,44],"right":[88,44]} |
| room_hinge_2u | objects/room_hinge_2u.svg | group-2 | 184×88 | {"left":[12,58],"right":[172,58],"hinge":[92.0,52]} |
| room_hinge_3u | objects/room_hinge_3u.svg | group-3 | 264×88 | {"left":[12,58],"right":[252,58],"hinge":[132.0,52]} |
| room_brackets_222 | objects/room_brackets_222.svg | grouped | 512×104 | {"floorOrigin":[16,88]} |
| room_floor_222 | objects/room_floor_222.svg | grouped | 512×160 | {"floorOrigin":[16,78]} |
| room_brackets_33 | objects/room_brackets_33.svg | grouped | 512×104 | {"floorOrigin":[16,88]} |
| room_floor_33 | objects/room_floor_33.svg | grouped | 512×160 | {"floorOrigin":[16,78]} |
| post_letter_idle | objects/post_letter_idle.svg | idle | 256×200 | {"hit":[128,106]} |
| post_letter_folded | objects/post_letter_folded.svg | folded | 256×200 | {"hit":[128,106]} |
| post_letter_success_star | objects/post_letter_success_star.svg | success | 256×200 | {"center":[128,101]} |
| post_counter | objects/post_counter.svg | idle | 384×256 | {"window":[192,105],"counterTop":[192,158],"base":[192,233]} |
| icon_press | ui/icon_press.svg | default | 96×96 | {"center":[48,48]} |
| icon_press_hc | ui/icon_press_hc.svg | high-contrast | 96×96 | {"center":[48,48]} |
| icon_hold | ui/icon_hold.svg | default | 96×96 | {"center":[48,48]} |
| icon_hold_hc | ui/icon_hold_hc.svg | high-contrast | 96×96 | {"center":[48,48]} |
| icon_release | ui/icon_release.svg | default | 96×96 | {"center":[48,48]} |
| icon_release_hc | ui/icon_release_hc.svg | high-contrast | 96×96 | {"center":[48,48]} |
| icon_wait | ui/icon_wait.svg | default | 96×96 | {"center":[48,48]} |
| icon_wait_hc | ui/icon_wait_hc.svg | high-contrast | 96×96 | {"center":[48,48]} |
| icon_sound | ui/icon_sound.svg | default | 96×96 | {"center":[48,48]} |
| icon_sound_hc | ui/icon_sound_hc.svg | high-contrast | 96×96 | {"center":[48,48]} |
| icon_pause | ui/icon_pause.svg | default | 96×96 | {"center":[48,48]} |
| icon_pause_hc | ui/icon_pause_hc.svg | high-contrast | 96×96 | {"center":[48,48]} |
| icon_resume | ui/icon_resume.svg | default | 96×96 | {"center":[48,48]} |
| icon_resume_hc | ui/icon_resume_hc.svg | high-contrast | 96×96 | {"center":[48,48]} |
| icon_retry | ui/icon_retry.svg | default | 96×96 | {"center":[48,48]} |
| icon_retry_hc | ui/icon_retry_hc.svg | high-contrast | 96×96 | {"center":[48,48]} |
| icon_home | ui/icon_home.svg | default | 96×96 | {"center":[48,48]} |
| icon_home_hc | ui/icon_home_hc.svg | high-contrast | 96×96 | {"center":[48,48]} |
| icon_help | ui/icon_help.svg | default | 96×96 | {"center":[48,48]} |
| icon_help_hc | ui/icon_help_hc.svg | high-contrast | 96×96 | {"center":[48,48]} |
| icon_contrast | ui/icon_contrast.svg | default | 96×96 | {"center":[48,48]} |
| icon_contrast_hc | ui/icon_contrast_hc.svg | high-contrast | 96×96 | {"center":[48,48]} |
| icon_reduced_motion | ui/icon_reduced_motion.svg | default | 96×96 | {"center":[48,48]} |
| icon_reduced_motion_hc | ui/icon_reduced_motion_hc.svg | high-contrast | 96×96 | {"center":[48,48]} |
| button_normal | ui/button_normal.svg | normal | 384×112 | {"labelCenter":[192,48]} |
| button_pressed | ui/button_pressed.svg | pressed | 384×112 | {"labelCenter":[192,55]} |
| button_focus | ui/button_focus.svg | focus | 384×112 | {"labelCenter":[192,48]} |
| button_disabled | ui/button_disabled.svg | disabled | 384×112 | {"labelCenter":[192,48]} |
| feedback_knot_success | ui/feedback_knot_success.svg | success | 128×128 | {"center":[64,64]} |
| feedback_knot_miss | ui/feedback_knot_miss.svg | miss | 128×128 | {"center":[64,64]} |
| education_duration | education/education_duration.svg | review-pending | 1024×640 | {"contentTopLeft":[100,100]} |
| education_duration_advanced | education/education_duration_advanced.svg | review-pending | 1024×640 | {"contentTopLeft":[100,100]} |
| education_tie | education/education_tie.svg | review-pending | 1024×640 | {"contentTopLeft":[100,100]} |
| education_tie_advanced | education/education_tie_advanced.svg | review-pending | 1024×640 | {"contentTopLeft":[100,100]} |
| education_dot | education/education_dot.svg | review-pending | 1024×640 | {"contentTopLeft":[100,100]} |
| education_dot_advanced | education/education_dot_advanced.svg | review-pending | 1024×640 | {"contentTopLeft":[100,100]} |
| education_dotted_rest | education/education_dotted_rest.svg | review-pending | 1024×640 | {"contentTopLeft":[100,100]} |
| education_dotted_rest_advanced | education/education_dotted_rest_advanced.svg | review-pending | 1024×640 | {"contentTopLeft":[100,100]} |
| education_meter | education/education_meter.svg | review-pending | 1024×640 | {"contentTopLeft":[100,100]} |
| education_tempo | education/education_tempo.svg | review-pending | 1024×640 | {"contentTopLeft":[100,100]} |
