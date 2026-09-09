# 오늘의 배움 🌱

React로 구현한 학습 기록 SPA입니다. 학습 내용을 기록하고 주제·상태로 검색하며, 수정과 삭제까지 하나의 데이터 흐름으로 연결합니다. 핵심 데이터는 Supabase 원격 데이터베이스에서만 CRUD합니다. 목 데이터나 localStorage를 CRUD 저장소로 사용하는 대체 모드는 없습니다.

- 소스 저장소: https://github.com/dooolll00/B1-2
- 제출용 배포 URL: https://b1-2-steel.vercel.app
- 원격 연결 및 배포 검증: **2026-09-09 재검증 통과** — 실제 Chromium에서 목록·등록·상세·수정·삭제, 상세 새로고침, 입력 검증·미리보기, 검색·초기화, 삭제 취소, 404, 오프라인 조회 오류·재시도를 확인했습니다. 검증용 기록은 삭제했습니다.
- 화면 검증: 이번 시연 흐름에서 미처리 브라우저 오류 없음. 390px 등록 폼에서 가로 넘침 없음 확인. 전체 화면의 시각적 품질 검사는 별도입니다.

## 실행 방법

Node.js 22.14 이상을 설치한 뒤 프로젝트 폴더에서 실행합니다.

```bash
npm ci
cp .env.example .env
# 아래 Supabase 설정 후 .env의 두 값을 입력하세요.
npm run dev
```

터미널에 표시된 로컬 주소를 엽니다. 파일을 더블클릭하거나 Live Server로 실행하는 프로젝트가 아닙니다.

```bash
npm test          # React 흐름 자동 테스트 (원격 API는 mock 처리)
npm run build    # dist 생성
npm run preview  # 빌드 결과 확인
```

실제 원격 연결은 `.env`를 설정한 후 `node scripts/check-remote.mjs`로 검증할 수 있습니다. 실행마다 익명 테스트 계정 1개와 임시 기록을 만들고, 해당 기록만 삭제합니다. 익명 테스트 계정은 Supabase Auth에 남습니다.

## 기술 스택

React 19, React Router 7, JavaScript, Vite 6, Supabase JS 2 / PostgreSQL / Anonymous Auth, 순수 CSS, Vitest, React Testing Library, jsdom. 정확한 설치 버전은 package-lock.json에 고정됩니다.

## Supabase 연결: 처음 한 번 필요

1. [Supabase 대시보드](https://supabase.com/dashboard)에서 새 프로젝트를 만듭니다.
2. SQL Editor에서 [supabase/schema.sql](supabase/schema.sql) 전체를 실행합니다. records 테이블, 사용자별 RLS 정책, 수정 시각 트리거가 생성됩니다.
3. Authentication 설정에서 **Anonymous Sign-Ins**를 활성화합니다. 이메일 회원가입이 아니라 SDK의 `signInAnonymously()`를 사용합니다.
4. 프로젝트의 Connect 또는 API 설정에서 Project URL과 **publishable key**를 확인합니다. 기존 프로젝트의 **anon key**도 같은 환경변수에 사용할 수 있습니다.
5. `.env`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`를 입력하고 개발 서버를 재시작합니다.
6. 목록을 열고 새 기록을 작성합니다. Supabase Table Editor에서도 실제 행을 확인하세요.

익명 로그인 사용자도 authenticated 역할을 사용합니다. RLS가 `auth.uid() = user_id`인 행만 허용해 다른 사용자의 기록은 조회·수정·삭제할 수 없습니다. 같은 브라우저의 로그인 세션으로 기록에 재접근합니다. 브라우저 데이터 삭제, 시크릿 모드 종료, 기기 변경 시 기존 익명 계정을 복구할 수 없습니다. 영구 계정 로그인과 보호 라우트는 이번 구현 범위에 포함하지 않습니다.

환경변수 미설정 시 화면에 설정 오류가 표시됩니다. 연결되지 않은 상태를 저장 성공으로 표시하지 않습니다. `Anonymous sign-ins are disabled`는 익명 로그인 설정, 테이블 관련 오류는 SQL 실행 여부, 권한 오류는 RLS 정책을 확인하세요.

`.env`, `.env.*`는 Git에서 제외하고 빈 `.env.example`만 공유합니다. **service_role / secret key / DB 비밀번호는 프론트엔드에 넣지 마세요.** Vite의 `VITE_` 값은 빌드 결과에서 브라우저에 공개되므로 클라이언트용 publishable/anon 키만 사용하며 데이터 권한은 RLS로 제어합니다.

## Vercel 배포

1. 프로젝트 파일을 위 GitHub 저장소에 업로드합니다. `node_modules`, `dist`, `.env`는 업로드하지 않습니다.
2. Vercel에서 Add New Project → GitHub의 `B1-2`를 Import합니다.
3. Framework: Vite, Build: `npm run build`, Output: `dist`, Node.js: 22.x로 설정합니다.
4. Environment Variables에 `.env`와 같은 두 변수 이름과 실제 값을 Production / Preview 환경에 등록합니다.
5. Deploy 후 아래 수동 검증을 모두 수행합니다. 환경변수를 바꾸면 **Redeploy**해야 적용됩니다.
6. 성공한 공개 URL을 이 README 상단과 제출란에 기록합니다. 배포 보호가 켜져 있다면 평가자가 접근 가능한지 확인하세요.

`vercel.json`이 상세 주소 직접 접속과 새로고침을 index.html로 연결합니다. Netlify를 선택하면 동일한 빌드·출력·환경변수 설정을 사용하며 `public/_redirects`가 SPA 경로를 처리합니다.

## 라우트

| 경로              | 화면                                 |
| ----------------- | ------------------------------------ |
| `/`               | 원격 기록 통계와 최근 기록 대시보드  |
| `/items`          | 목록, 제목·내용 검색, 주제·상태 필터 |
| `/items/new`      | 등록 폼 및 실시간 미리보기           |
| `/items/:id`      | 상세 조회, 삭제 확인                 |
| `/items/:id/edit` | 원격 데이터로 초기화한 수정 폼       |
| `/guide`          | 이용·연결 안내                       |
| `*`               | Not Found                            |

## 코드 구조와 React 설명

```text
src/
  pages/       라우트별 화면과 기능 조합
  components/  공통 레이아웃, UI, 등록·수정 폼, 알림 Context
  hooks/       useRemote, useRecords, useRecord
  lib/         Supabase 클라이언트, 원격 CRUD, 입력 검증
  test/        사용자 이벤트와 비동기 렌더링 테스트
supabase/      SQL 스키마와 사용자별 접근 정책
```

**컴포넌트 기준:** 페이지는 라우트 파라미터와 이동을 결정하고, UI는 props로 받은 데이터와 콜백을 표시합니다. Button, Card, Badge, PageHeader, Loading, ErrorState, EmptyState, Field, StatCard, RecordCard, RecordList, RecordForm 등 12개 컴포넌트가 props로 표시·동작을 바꿉니다. 등록과 수정은 같은 RecordForm을 사용합니다. RecordForm은 입력·검증·제출 상태를 담당하고 onSubmit 콜백을 호출합니다. Editor 페이지는 원격 저장·성공 알림·화면 이동을 담당합니다. 저장 실패는 폼으로 전달되어 입력을 유지한 채 오류를 표시합니다.

**props와 state:** props는 부모에서 내려온 입력값입니다. RecordForm의 initial과 RecordCard의 record가 예입니다. state는 이벤트에 따라 바뀌는 컴포넌트의 기억입니다. 폼 값·오류·제출 상태는 RecordForm, 검색·필터는 Items, 조회 결과·로딩·오류는 커스텀 훅, 여러 페이지에서 쓰는 알림은 ToastProvider Context에 둡니다. 원격 데이터의 원본은 Supabase에 있습니다.

**useEffect:** useRemote는 마운트, loader 변경, 재시도 revision 변경 시 데이터를 요청합니다. useRecord의 loader는 id가 바뀔 때만 useCallback으로 바뀝니다. cleanup에서 이전 요청의 active를 false로 바꿔 늦은 응답이 최신 화면을 덮어쓰는 것을 방지합니다. 이는 네트워크 요청 취소가 아니라 오래된 결과 무시입니다. StrictMode 개발 환경의 추가 effect 실행에서도 안전하게 처리합니다.

**사용자 이벤트 → 상태 → 렌더링:**

1. 검색·필터 변경 → Items state 변경 → useMemo가 목록을 계산 → 카드와 결과 수 갱신.
2. 폼 입력 → values 변경 → controlled input과 미리보기·글자 수 갱신.
3. 제출 → 검증 오류 또는 pending 변경 → 오류 표시 또는 입력·버튼 비활성화 → 원격 저장 → 상세 이동 및 Context 알림.
4. 삭제 클릭 → 확인 UI → pending → 원격 삭제 → 목록 재조회와 알림.

비동기 화면은 Loading / ErrorState(재시도) / EmptyState / 데이터 UI로 통일합니다. 등록 화면에는 조회가 없으므로 제출 중·실패 상태를 처리하고, 수정 화면은 초기 조회와 제출 상태를 각각 처리합니다. 목록이 없을 때와 검색 결과가 없을 때 문구를 구분하며, 없는 상세·수정 데이터도 빈 상태로 안내합니다.

보너스는 전역 알림 Context와 useMemo/useCallback을 적용했습니다. useMemo는 데이터와 필터가 그대로인 렌더링에서 재계산을 줄이며, 실제 성능 향상은 별도로 측정하지 않았습니다.

## 배포 후 필수 수동 검증

- 새 브라우저에서 목록 접속 → 로딩 후 빈 상태, 새 기록 링크 확인.
- 빈 제목/내용 제출 → 필드 오류, 네트워크 등록 요청 없음.
- 등록 → 제출 중 비활성화 → 상세 이동과 알림 → Table Editor에 실제 행 생성.
- 목록 검색·주제·상태 필터 → 결과 및 결과 없음 표시.
- 상세 URL 직접 접속과 새로고침 → 같은 기록 표시.
- 수정 → 입력 미리 채움 → 저장 → 새로고침 후 수정된 원격 값 유지.
- 삭제 취소 → 행 유지, 삭제 확인 → 목록 이동 및 원격 행 삭제.
- 개발자 도구 Network를 Offline으로 설정한 뒤 조회·저장 → 오류와 재시도 가능, 저장 실패 시 입력 유지.
- 임의 주소 → 404, 없는 기록 ID → 찾을 수 없음.
- 다른 시크릿 브라우저 → 다른 사용자 기록 미노출.

자동 테스트는 mock API로 React 동작을 검증합니다. 실제 Supabase 권한·환경변수·네트워크·배포 성공을 증명하지 않으므로 위 검증을 별도로 완료해야 합니다.

## 참고한 공식 문서

- [Supabase 익명 로그인과 사용자 역할](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Vite의 Vercel 배포](https://vercel.com/docs/frameworks/frontend/vite)
- [Vercel 환경변수 변경과 재배포](https://vercel.com/docs/environment-variables/managing-environment-variables)

## 코드 형식 유지

`npm run format`으로 JSX·CSS·문서를 정렬하고, `npm run format:check`로 검사합니다. GitHub CI에서도 형식 검사·자동 테스트·빌드를 실행합니다.

## 미션 요구사항 체크리스트 (2026-09-07)

사용자가 제공한 B1-2 미션 원문을 기준으로 대조했습니다. 아래 체크는 소스 코드에서 구현을 확인한 항목입니다. 로컬 자동 테스트와 기존 배포 사이트의 실측 결과는 다음 절에서 구분합니다.

### 필수 요구사항

- [x] React 18 이상: React 19 사용 (`package.json`).
- [x] 단일 핵심 데이터 서비스: 학습 기록 `records`의 CRUD.
- [x] `pages`, `components`, `hooks`, `lib` 역할 분리.
- [x] 주요 화면에 공통 헤더·네비게이션·본문·푸터 적용 (`Layout.jsx`).
- [x] 5개 이상 페이지 라우트: `/`, `/items`, `/items/new`, `/items/:id`, `/items/:id/edit`, `/guide`의 **6개**, 별도 `*` 404 (`src/App.jsx`).
- [x] 목록·상세 화면과 잘못된 주소의 Not Found 처리.
- [x] 메뉴와 새 기록 링크, 목록 카드, 상세 수정 링크로 주요 화면 이동 가능.
- [x] prop에 따라 표시·동작이 달라지는 재사용 컴포넌트 **12개** (아래 표).
- [x] 페이지와 재사용 UI 분리, Loading / ErrorState / EmptyState 공통 사용.
- [x] controlled input으로 폼 입력 관리 (`RecordForm`의 `values`, `value`, `onChange`).
- [x] 목록·상세 데이터 및 로딩·오류를 커스텀 훅으로 관리 (`useRemote`, `useRecords`, `useRecord`).
- [x] Supabase 원격 목록 조회 및 라우트 `id` 기반 상세 조회 (`records.js`).
- [x] 원격 등록·수정 성공 후 상세로 이동하고 완료 알림 표시 (`Editor.jsx`).
- [x] 원격 삭제 성공 후 목록으로 이동하여 재조회 (`Detail.jsx`).
- [x] 필수값·길이·선택값 검증과 필드 근처 오류 표시.
- [x] 제출 중 입력·버튼 비활성화, 중복 요청 방지, 실패 시 오류 표시와 입력 유지.
- [x] 이벤트 → 상태 → 렌더링 변화 3개 이상: 검색/필터, 입력 미리보기, 제출 진행, 성공 알림, 삭제 확인.
- [x] README에 로컬 설치·실행 명령과 기술 스택 명시.
- [x] 제출용 공개 URL과 GitHub 소스 URL 명시 (문서 상단).
- [x] 기존 공개 배포에서 목록·상세·등록·수정·삭제 정상 동작 확인 (아래 실측 결과).
- [x] `.env`와 `.env.*` Git 제외, 빈 `.env.example`만 추적. 클라이언트가 읽는 두 환경변수 사용.

실제 배포의 조회·등록·수정·삭제와 설정 정상 여부는 아래 실측 결과로 판정합니다. Vercel 대시보드의 변수 값 자체는 열람하지 않았습니다. API 키 실제 값이나 서버 비밀키를 소스에 넣지 않습니다.

### 재사용 컴포넌트 근거

`children`도 React의 prop입니다. 컴포넌트 파일 수가 아니라 prop을 받아 표시·동작을 바꾸는 컴포넌트 수를 셉니다.

| 컴포넌트   | 대표 prop                                | 달라지는 표시·동작                   |
| ---------- | ---------------------------------------- | ------------------------------------ |
| Button     | variant, onClick, disabled, children     | 색상·클릭 처리·활성 상태·문구        |
| Card       | className, children                      | 카드 내용과 추가 스타일              |
| Badge      | children                                 | 주제 라벨                            |
| PageHeader | title, description, action               | 제목·설명·우측 동작                  |
| Loading    | label                                    | 로딩 안내 문구                       |
| ErrorState | error, onRetry                           | 오류 메시지와 재시도 버튼            |
| EmptyState | title, description, action               | 빈 결과 안내와 이동 동작             |
| Field      | as, value, onChange, error               | 입력 종류·값·오류                    |
| StatCard   | label, value, hint                       | 통계 이름·수치·설명                  |
| RecordCard | record                                   | 기록 내용과 상세 이동 주소           |
| RecordList | records                                  | 렌더링할 기록 카드 목록              |
| RecordForm | initial, onSubmit, submitLabel, cancelTo | 등록·수정 초기값·저장 동작·취소 경로 |

첫 11개는 `src/components/UI.jsx`, 마지막은 `src/components/RecordForm.jsx`에 있습니다.

### 보너스와 선택 사항

- [x] 전역 상태: `ToastProvider` Context로 여러 페이지의 완료 알림 공유.
- [x] 메모이제이션: `Items`의 useMemo, 조회 함수와 알림의 useCallback. 실제 성능 향상 수치는 측정하지 않음.
- [ ] 인증 보너스 전체: 익명 Auth는 사용하지만 보호 라우트가 없어 **부분 구현**. 필수 요구사항의 누락은 아님.
- [x] 선택 사항인 반응형 CSS 구현.

JavaScript와 순수 CSS는 미션에서 허용됩니다. 별도 로그인 페이지, 영구 계정, 페이지네이션, 서버 검색, 고급 RLS는 필수 조건이 아닙니다. 현재 검색·통계는 내려받은 목록 기준이므로 대량 데이터에서는 서버 검색·집계·페이지네이션을 후속 개선할 수 있습니다.

### 검증 결과

- 로컬 자동 테스트: mock API로 React 상태·이벤트·라우팅 검증. 실제 앱 라우트와 공통 네비게이션, 수정 성공 후 상세 재조회, 삭제 취소, 필터 조합, 상세·수정 오류 재시도, 없는 수정 기록까지 보강했습니다.
- 배포 브라우저 검증: 결과는 아래 최종 확인 기록 참고. 자동 테스트와 달리 실제 배포된 앱과 원격 저장소를 대상으로 합니다.
- 최신 코드·테스트·의존성 변경은 커밋 `d4f1822`로 GitHub와 공개 배포에 반영했습니다. Vercel 배포와 [GitHub Actions](https://github.com/dooolll00/B1-2/actions/runs/34316170828)가 모두 성공했습니다.

발표 대본·시연 순서·예상 질문은 [PRESENTATION_GUIDE.md](PRESENTATION_GUIDE.md)를 참고하세요.

### 최종 확인 기록 — 2026-09-09 14:47 KST

**판정: 제공된 미션의 필수 기능에서 누락을 발견하지 못했습니다.** 보너스 전역 상태·메모이제이션은 구현, 보호 라우트를 포함한 인증 보너스는 미완료입니다.

| 검증                 | 결과          | 범위                                                                                                                 |
| -------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------- |
| `npm test`           | 31개 통과     | 배포한 코드의 React 흐름·조회 전환·삭제 상태·잘못된 ID 처리, 원격 API mock                                           |
| `npm run build`      | 통과          | Node.js 22.14.0, 프로덕션 번들 생성                                                                                  |
| 실제 배포 브라우저   | 통과          | 목록 빈 상태 → 검증 → 등록 → 상세 → 새로고침 → 수정 → 새로고침 → 검색/초기화 → 삭제 취소 → 삭제 → 삭제된 상세 미노출 |
| 조회 실패·재시도     | 통과          | 브라우저 Offline에서 목록 조회 실패, Online 복구 후 재시도 성공                                                      |
| 사용자 분리          | 9/7 통과      | 별도 브라우저 세션에서 첫 사용자의 상세 조회 불가. 다른 사용자 수정·삭제 차단은 이번에 직접 요청하지 않음            |
| 배포 경로            | 통과          | 상세 직접 진입/새로고침, 임의 경로 404                                                                               |
| 모바일·브라우저 오류 | 통과          | 390px 등록 폼 가로 넘침 없음, 시연 중 미처리 JS 오류 없음                                                            |
| 소스 공유 URL        | 9/7 HTTP 200  | 로그인 없는 요청으로 GitHub URL 접근 확인                                                                            |
| 9/7 추적 파일 점검   | 일치 패턴 0개 | publishable/secret 키, JWT 형태, 개인키 헤더 패턴 검사. `.env.example`만 추적. 전체 Git 과거 이력 검사는 아님        |

9월 9일 브라우저 검증은 Playwright/Chromium으로 최신 공개 배포본과 실제 Supabase를 대상으로 수행했습니다. 등록 POST 201, 수정 PATCH 200, 삭제 DELETE 200과 새로고침 후 저장 결과를 확인했습니다. 잘못된 기록 ID에서 인증 요청이 발생하지 않는 동작과 테마 설정 유지도 통과했습니다. 테스트 기록 1개는 삭제했으며, 이번 검증의 익명 Auth 계정 2개는 서버에 남습니다. 사용자 분리·소스 URL·키 패턴 점검은 표에 표시한 9월 7일 결과이며 이번에 재검증하지 않았습니다. 실제 저장 실패와 다른 사용자 수정·삭제 차단은 이번 원격 검증 범위 밖입니다. 자세한 작업 기록은 `WORK_LOG.md`를 참고하세요.

테스트 도구는 Vitest 4.1.11로 업데이트했으며, 9월 9일 `npm audit` 결과 보고된 취약점은 0개입니다.

## 디자인과 폰트

B1-1과 같은 Pretendard 폰트, 밝은 회색 배경과 블루 포인트, 10px 카드 모서리와 은은한 그림자를 적용했습니다. 헤더의 달/해 버튼으로 네이비·퍼플 다크 모드와 라이트 모드를 전환합니다. 다크 모드의 포인트와 보조 글자는 읽기 쉽도록 B1-1보다 밝게 조정했습니다.

처음에는 시스템 테마를 따르고, 직접 선택하면 `today-learning-theme` 설정을 브라우저에 저장합니다. 학습 기록은 계속 Supabase에서만 CRUD합니다. 폰트 CDN 연결 실패 시 시스템 폰트를 사용하고, 브라우저 저장소 접근 실패 시에도 현재 화면의 테마 전환은 가능합니다.

표시 설정은 `ThemeToggle.jsx`의 React state/effect, 색상은 `src/styles.css`의 CSS 변수로 관리합니다. 등록·수정·삭제, 라우팅, 필수값 검증, 로딩·오류·빈 상태의 기존 구조는 유지했습니다. 디자인·폰트·테마 변경은 GitHub와 공개 배포본에 반영되어 있으며, 9월 9일 공개 사이트에서 테마 설정 유지와 모바일 등록 폼의 가로 넘침 없음을 확인했습니다.
