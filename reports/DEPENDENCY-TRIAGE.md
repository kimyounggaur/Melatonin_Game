# 의존성 보안 조사 및 패치 확인

조사 기준: 배포 커밋 `fe40ddb`의 vite 7.2.2 / vitest 3.2.4 / ajv 8.17.1, Node 24.14.0. 이 조사자는 package.json·lockfile·런타임을 변경하거나 audit fix를 실행하지 않았다. 공식 자료와 npm metadata로 패치 후보를 검증했고 루트 작업자가 아래 후속 패치를 수행했다.

## 후속 패치 확인 상태

- package.json 실물 확인: 버전 `1.0.1-preview`, 정확 핀 **vite 7.3.7 / vitest 4.1.11 / ajv 8.20.0**. package·lock 변경과 설치는 루트 작업자가 수행했다.
- `dependency-audit-after.json` 실물 확인: `vulnerabilities:{}`, moderate/high/critical을 포함한 모든 집계 **0건**. 의존성 총104개. 패치 전 총115개·취약 패키지5개와 구분한다.
- 루트가 strict typecheck와 Vite 7.3.7 production build 성공을 확인했다. 음악 데이터·코어 TS를 수정하지 않았다.
- 첫 Vitest 4 실행은 sandbox 임시 캐시 rename EPERM으로 **0 test, success:false**였다. `unit-security-sandbox-environment.json`에 실패를 보존했으며 검사 통과로 세지 않는다. 승인된 환경에서 동일 검사를 다시 실행한 `unit-integration-security-final.json` 실물 확인 결과 **244/244 pass, failed0, pending/skip0, success:true**다. 검사 기준·음악 오라클·코어 TS는 변경하지 않았다.
- 새 build/SHA의 표적 브라우저·원격 production smoke와 인계 파일 갱신은 루트가 후속 확인한다. 기존 배포의 통과를 새 의존성 빌드의 통과로 대신하지 않는다.

## 실제 조회 결과와 증거

최초 sandbox 조회는 `registry.npmjs.org` DNS ENOTFOUND로 실패했다. 승인된 읽기 전용 `npm audit --json` 재조회는 완료됐고 exit 1이었다. 이는 조회 실패가 아니라 취약점 발견 결과다. stdout JSON의 모든 필드를 다시 직렬화해 `dependency-audit-before.json`에 보존했다.

집계는 **5개 패키지: moderate 2 / high 1 / critical 2**이며 개별 보안 권고는 중복을 제거하면 **10개**다. 확인한 설치 트리는 `vite@7.2.2`, `vitest@3.2.4`, `@vitest/mocker@3.2.4`, `tinypool@1.1.1`, `ajv@8.17.1`, `esbuild@0.25.12`, `rollup@4.64.10`이다. esbuild·rollup은 이번 audit의 취약 패키지로 나오지 않았다.

## 권고별 대조

|패키지·식별자|공식 권고의 조건 / 최소 수정|
|---|---|
|Vite / [GHSA-4w7w-66w2-5vf9, CVE-2026-39365](https://github.com/vitejs/vite/security/advisories/GHSA-4w7w-66w2-5vf9)|개발 서버의 optimized dependency `.map` 경로로 범위 밖 파일 읽기. 도달 가능한 개발 서버와 예측 가능한 민감 sourcemap이 전제. 7.x 수정 7.3.2.|
|Vite / [GHSA-v2wj-q39q-566r, CVE-2026-39364](https://github.com/vitejs/vite/security/advisories/GHSA-v2wj-q39q-566r)|개발 서버에서 query를 붙여 `server.fs.deny` 우회. 7.x 수정 7.3.2.|
|Vite / [GHSA-p9ff-h696-f583, CVE-2026-39363](https://github.com/vitejs/vite/security/advisories/GHSA-p9ff-h696-f583)|개발 서버 WebSocket의 fetchModule 파일 접근 검사 누락. 도달 가능한 WebSocket이 전제. 7.x 수정 7.3.2.|
|Vite / [GHSA-v6wh-96g9-6wx3, CVE-2026-53632](https://github.com/vitejs/launch-editor/security/advisories/GHSA-v6wh-96g9-6wx3)|Windows launch-editor middleware의 UNC 접근으로 NTLMv2 유출. 실행 중인 middleware와 공격자 페이지 요청·NTLM 활성화가 전제이며 localhost라는 이유만으로 배제하면 안 된다. Vite 7.3.5 / launch-editor 2.14.1 수정.|
|Vite / [GHSA-fx2h-pf6j-xcff, CVE-2026-53571](https://github.com/vitejs/vite/security/advisories/GHSA-fx2h-pf6j-xcff)|Windows NTFS ADS·8.3 별칭 경로를 이용한 개발 서버 deny 우회. 7.x 수정 7.3.5.|
|Ajv / [GHSA-2g4f-4pwh-qvx6, CVE-2025-69873](https://github.com/advisories/GHSA-2g4f-4pwh-qvx6)|`$data:true`로 runtime pattern을 받는 동적 검증의 ReDoS. 최소 8.18.0. [유지관리자 수정 릴리스](https://github.com/ajv-validator/ajv/releases/tag/v8.18.0)에서도 CVE를 명시한다.|
|Vitest / [GHSA-5xrq-8626-4rwp, CVE-2026-47429](https://github.com/vitest-dev/vitest/security/advisories/GHSA-5xrq-8626-4rwp)|Vitest UI/API 노출 또는 Windows UI/Browser Mode에서 파일 읽기·실행. 유지관리자 페이지는 3.2.5/4.1.0, 조회 당시 npm range는 <3.2.6으로 제시한다. 아래 4.1.11 선택에는 영향 없다.|
|Vitest·mocker / [GHSA-82fw-gwwq-j7x9, CVE-2026-84373](https://github.com/vitest-dev/vitest/security/advisories/GHSA-82fw-gwwq-j7x9)|도달 가능한 개발 WebSocket의 공개 mocker/interceptor plugin 경로에서 파일 읽기. Vitest Browser RPC 경로는 token 필요. 최소 4.1.11이며 2.x/3.x backport 계획이 없다고 명시한다.|
|Tinypool / [GHSA-5gmw-xhrv-c9v3, CVE-2026-104848](https://github.com/advisories/GHSA-5gmw-xhrv-c9v3)|선행 Object.prototype의 execArgv/env 오염 뒤 worker 생성에서 RCE gadget. 최소 2.1.1.|
|Tinypool / [GHSA-85c8-ppgw-ccpr, CVE-2026-104849](https://github.com/advisories/GHSA-85c8-ppgw-ccpr)|선행 prototype.filename 오염과 own filename 없는 `run(task, options)` 객체가 전제. 최소 2.1.2.|

## 이 게임의 노출 판단

소스 검사상 Vite와 Vitest는 개발·빌드·테스트 도구다. scripts는 `vitest run`을 사용하며 UI/Browser/API 또는 mocker plugin을 활성화하지 않는다. 배포는 Vite 개발 서버를 띄우는 Node backend가 아닌 정적 `dist` 제공이므로, 위 개발 서버·UI·worker 경로가 production 게임 요청에 연결됐다는 근거는 확인되지 않았다. 이는 구성에 기초한 판단이며 취약점이 수정됐다는 뜻은 아니다.

Ajv는 devDependencies로 기재됐어도 앱에서 import되어 브라우저 bundle에 포함된다. 따라서 `npm audit --omit=dev`만으로 runtime 안전을 증명할 수 없다. 실제 생성은 `new Ajv2020({allErrors:true,strict:true})`이고 `$data`를 사용하지 않으며 schema와 레벨은 제공된 정규 JSON이다. 현재 ReDoS 권고의 동적 pattern 전제는 충족하지 않는다.

현재 정적 배포의 즉시 철회를 요구할 직접 노출 근거는 확인되지 않았다. 그러나 Windows 사용자가 README대로 개발 서버를 다시 실행할 수 있으므로 알려진 취약 도구를 인계하지 않기 위한 의존성 패치는 필요하다. 인수 시 개발 서버를 정지하고 built static server를 사용하면 개발 middleware 경로를 계속 노출하지 않는다.

## 명시적 핀 추천

|패키지|추천 정확 핀|선정 근거|
|---|---|---|
|vite|7.3.7|현재 조사한 5건의 최소 7.x 수정은 7.3.5. npm이 제시한 7.3.7의 [공식 릴리스](https://github.com/vitejs/vite/releases/tag/v7.3.7)와 metadata 확인. Node `^20.19.0 || >=22.12.0`, @types/node 동일 허용 범위여서 현재 Node 24.14.0 / @types/node 24.10.0 충족.|
|ajv|8.20.0|최소 보안 수정 8.18.0보다 높고 [공식 8.20.0 릴리스](https://github.com/ajv-validator/ajv/releases/tag/v8.20.0)는 Node 22/24 지원을 명시. 같은 major를 유지.|
|vitest|4.1.11|마지막 mocker 권고까지 수정한 최소 확인 버전. [공식 manifest](https://raw.githubusercontent.com/vitest-dev/vitest/v4.1.11/packages/vitest/package.json)는 @vitest/mocker 4.1.11, Vite `^6 || ^7 || ^8`, Node `^20 || ^22 || >=24`이며 **tinypool 의존성이 없다**.|

`vitest@3.2.7`은 npm의 fixAvailable에 나왔지만 [해당 공식 manifest](https://raw.githubusercontent.com/vitest-dev/vitest/v3.2.7/packages/vitest/package.json)가 mocker 3.2.7과 tinypool ^1.1.1을 유지하므로 전체 해결책이 아니다. tinypool 2.x를 3.x Vitest에 강제 override하는 대신 지원되는 4.1.11 조합을 검증한다. `npm audit fix --force`는 권장하지 않으며 실행하지 않았다.

[Vitest 4 공식 migration](https://v4.vitest.dev/guide/migration.html)은 Node>=20/Vite>=6 요구와 coverage·pool·mock constructor 변경을 설명한다. 현재 설정에는 custom pool/coverage가 없고 tests include/exclude와 `vitest/config`의 defineConfig를 사용하므로 큰 설정 이전은 예상하지 않는다. 단 선언 호환은 실제 244개 검사 성공을 대체하지 않는다. [4.1.11 공식 릴리스](https://github.com/vitest-dev/vitest/releases/tag/v4.1.11)도 mocker의 allowlist 수정 backport를 명시한다.

## 패치 후 필요한 확인

1. 정확 핀 설치 후 lockfile·`npm ls vite vitest @vitest/mocker tinypool ajv --all`로 실제 트리와 tinypool 제거를 확인한다. 강제 override 없이 peer 충돌이 없어야 한다.
2. `npm audit --json`을 다시 조회해 metadata·권고 잔존 여부를 확인한다. 후속 조회 0건은 위 상태 절과 `dependency-audit-after.json`에서 확인했다.
3. typecheck, 정규 데이터/negative 오라클, 전체 단위·통합 244개, production build를 실행한다. Ajv strict 오류 의미와 타이·보정·rollback 오라클은 변경하지 않는다.
4. Vite 변환·bundle 변화에 대한 표적 브라우저 검사: unlock → L02 실제 입력 → 결과1회 저장·reload, ±250ms, focused L03 타이, 오류console, 정규92자산경로·hash. production URL smoke도 새 build/SHA에 대해 반복한다.
5. 새 source SHA, 배포 READY, ZIP·보고서 checksum과 사용자 Drive 인계 파일 근거를 함께 갱신한다. 이는 루트 작업자가 수행하며 조사자는 소스·lock·배포를 수정하지 않았다.
