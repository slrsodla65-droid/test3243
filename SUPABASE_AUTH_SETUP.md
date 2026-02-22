# Supabase 회원가입/로그인 적용 가이드

이 문서는 이 저장소의 `signin.html`, `member.html`를 Supabase Auth와 연결하는 순서입니다.

## 0) 준비물

- Supabase 계정
- 이 프로젝트 코드
- Git
- Docker Desktop (로컬 `supabase start`를 사용할 경우)

## 1) Supabase 프로젝트 만들기

1. Supabase Dashboard에서 새 프로젝트를 생성합니다.
2. 프로젝트 생성이 끝나면 아래 2개 값을 복사합니다.
   - Project URL
   - anon(public) key

주의: `service_role` 키는 절대 프론트엔드에 넣지 않습니다.

## 2) Supabase Auth 기본 설정

Dashboard > Authentication에서 아래를 확인합니다.

1. Email provider 활성화
2. Confirm email 사용 여부 결정
3. URL Configuration 설정
   - Site URL: `https://wgwgw.pages.dev`
   - Redirect URLs: `https://wgwgw.pages.dev/member.html`

## 3) 이 프로젝트에 키 입력

파일: `supabase-client.js`

```js
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

위 2개를 실제 값으로 바꿉니다.

## 4) Supabase CLI 연결 (공식 CLI Reference 흐름)

Supabase CLI Reference(`init`, `login`, `link`, `db push`) 순서로 진행합니다.

```bash
supabase init
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>
supabase db push
```

`supabase` 명령이 없다면 설치 후 사용하거나, 임시로 `npx supabase@latest <command>` 형태로 실행할 수 있습니다.

## 5) 마이그레이션 적용 내용

`supabase/migrations/20260222190000_create_profiles.sql`이 적용됩니다.

포함 내용:
- `public.profiles` 테이블 생성
- 회원가입 시 `auth.users` -> `public.profiles` 자동 생성 트리거
- 본인 행만 읽기/수정 가능한 RLS 정책

## 6) 로컬 확인

1. 정적 서버로 사이트 실행
2. `/signin.html` 접속
3. 회원가입
4. 이메일 인증(Confirm email 사용 시)
5. 로그인
6. `/member.html`에서 사용자 정보와 로그아웃 동작 확인

## 7) 배포

```bash
git add .
git commit -m "feat: add supabase auth pages and cli migration"
git push origin main
```

배포 후 확인:
- `https://wgwgw.pages.dev/signin.html`
- `https://wgwgw.pages.dev/member.html`

## 8) 자주 발생하는 문제

1. `Invalid login credentials`
- 비밀번호 오타 또는 가입 전 계정

2. 가입은 되었는데 로그인 실패
- Confirm email이 켜져 있으면 인증 메일 클릭 전 로그인 불가

3. `supabase db push` 실패
- `supabase link --project-ref ...`를 먼저 실행했는지 확인

4. 페이지에서 설정 오류 메시지 노출
- `supabase-client.js`의 URL/anon key 미입력 또는 오타
