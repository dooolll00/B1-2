# 오늘의 배움 🌱

React로 구현한 학습 기록 SPA입니다. 학습 내용을 기록하고 주제·상태로 검색하며, 수정과 삭제까지 하나의 데이터 흐름으로 연결합니다. 핵심 데이터는 Supabase 원격 데이터베이스에서만 CRUD합니다. 목 데이터나 localStorage를 CRUD 저장소로 사용하는 대체 모드는 없습니다.

- 소스 저장소: https://github.com/dooolll00/B1-2
- 제출용 배포 URL: https://b1-2-steel.vercel.app
- 원격 연결 및 배포 검증: **통과 — 실제 배포 사이트를 Chrome으로 열어 익명 로그인, 등록·목록·상세·수정·삭제, 상세 새로고침, 폼 검증·미리보기, 검색·초기화, 삭제 취소, 404, 네트워크 오류·재시도를 확인했습니다. 검증용 기록은 삭제했습니다.**
- 화면 검증: 데스크톱·모바일 화면 확인, 390px 너비에서 가로 넘침 없음, 검증 중 미처리 브라우저 오류 없음.

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
