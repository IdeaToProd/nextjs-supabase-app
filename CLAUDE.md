# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 개발 명령어

```bash
npm run dev       # 개발 서버 실행 (localhost:3000)
npm run build     # 프로덕션 빌드
npm run start     # 빌드된 앱 실행
npm run lint      # ESLint 검사
```

테스트 설정 없음 — 현재 테스트 프레임워크 미포함.

---

## 환경 변수

`.env.local` 파일에 아래 두 값이 반드시 필요하다:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

`lib/utils.ts`의 `hasEnvVars`가 이 값들을 체크하여 앱 전체의 조건부 UI를 제어한다.

---

## 아키텍처

### Supabase 클라이언트 사용 규칙

Supabase 클라이언트는 **절대 전역 변수에 저장하지 않는다** (Fluid compute 호환성). 매 요청/함수 호출마다 새로 생성해야 한다.

| 파일                     | 용도                                                    |
| ------------------------ | ------------------------------------------------------- |
| `lib/supabase/server.ts` | Server Component, Route Handler, Server Action에서 사용 |
| `lib/supabase/client.ts` | Client Component에서 사용 (`'use client'` 필요)         |
| `lib/supabase/proxy.ts`  | 프록시(미들웨어)에서 세션 갱신용                        |

### 프록시 (`proxy.ts`)

`proxy.ts`는 Next.js 미들웨어 역할을 하며 모든 요청을 가로채 Supabase 세션을 갱신한다. `supabase.auth.getClaims()` 호출 후 반드시 원본 `supabaseResponse`를 그대로 반환해야 한다 — 새 Response 객체를 만들 때 쿠키를 복사하지 않으면 사용자 세션이 예기치 않게 종료된다.

인증이 필요 없는 경로: `/`, `/auth/**`

### 인증 흐름

```
/auth/login           → LoginForm (이메일/비밀번호)
/auth/sign-up         → SignUpForm
/auth/forgot-password → ForgotPasswordForm
/auth/update-password → UpdatePasswordForm
/auth/confirm         → 이메일 OTP 검증 Route Handler (GET)
/auth/error           → 인증 오류 표시
/auth/sign-up-success → 회원가입 완료 안내
```

`/auth/confirm/route.ts`는 이메일 링크 클릭 시 OTP를 검증하고 성공 시 `next` 쿼리 파라미터 경로로 리다이렉트한다.

### 보호된 라우트

`/protected/**`는 프록시에서 미인증 사용자를 `/auth/login`으로 리다이렉트한다. 서버 컴포넌트에서 `supabase.auth.getClaims()`로 사용자를 확인하고 없으면 `redirect('/auth/login')`을 호출한다. `getUser()` 대신 `getClaims()`를 사용하는 이유는 추가 네트워크 요청 없이 세션 클레임을 바로 읽기 때문이다.

### UI 컴포넌트

`components/ui/`는 shadcn/ui 컴포넌트들이다. 새 컴포넌트 추가 시 `npx shadcn@latest add <component>` 사용. `lib/utils.ts`의 `cn()` 함수로 Tailwind 클래스를 병합한다.
