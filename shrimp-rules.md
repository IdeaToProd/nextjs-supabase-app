# Development Guidelines

## 프로젝트 개요

- **제품**: 모이다 (Moida) — 30명 이내 소규모 모임 주최자 대상
- **핵심 기능**: 공지사항 · RSVP · 정산 · 카풀
- **스택**: Next.js 15 (App Router) + Supabase SSR + shadcn/ui + Tailwind CSS + Resend

### 현재 구현 완료 상태

- 인증 시스템 완료: 이메일/비밀번호 로그인, 회원가입, 비밀번호 재설정, 이메일 OTP 확인
- 미들웨어 세션 갱신 완료 (`proxy.ts`)
- UI 기반 설정 완료 (shadcn/ui "new-york" 스타일, lucide-react 아이콘)

### 미구현 기능 (구현 필요)

- 이벤트 CRUD: `/events`, `/events/new`, `/events/[id]`, `/events/[id]/edit`
- RSVP 관리, 정산, 카풀, 공지사항
- 초대 링크: `/invite/[token]`
- 프로필: `/profile`
- DB 테이블 10개 전체 미생성

---

## 디렉토리 구조 및 파일 역할

```
app/                      # Next.js App Router 라우트
  auth/                   # 인증 라우트 (구현 완료, 수정 최소화)
    confirm/route.ts      # 이메일 OTP 검증 Route Handler
  layout.tsx              # 루트 레이아웃 (ThemeProvider 포함)
  globals.css             # 전역 CSS (Tailwind 변수 포함)

components/               # 공유 컴포넌트
  ui/                     # shadcn/ui 자동 생성 컴포넌트 (직접 수정 금지)
  auth-button.tsx         # 인증 상태에 따른 버튼 (Server Component)
  logout-button.tsx       # 로그아웃 버튼 (Client Component)

lib/
  supabase/
    server.ts             # Server Component / Route Handler / Server Action용 클라이언트
    client.ts             # Client Component ('use client')용 클라이언트
    proxy.ts              # 미들웨어 세션 갱신 전용
  utils.ts                # cn() 유틸리티, hasEnvVars 체크

proxy.ts                  # 미들웨어 진입점 (middleware.ts 역할, 파일명 주의)
components.json           # shadcn/ui 설정
```

---

## Supabase 클라이언트 사용 규칙

> **가장 중요한 규칙. 반드시 준수.**

### 클라이언트 선택 기준

| 사용 위치                                      | import 경로             |
| ---------------------------------------------- | ----------------------- |
| Server Component, Route Handler, Server Action | `@/lib/supabase/server` |
| Client Component (`'use client'` 파일)         | `@/lib/supabase/client` |
| 미들웨어 (`proxy.ts`)                          | `@/lib/supabase/proxy`  |

### 필수 규칙

- **전역 변수 저장 절대 금지**: Fluid compute 호환성을 위해 매 함수 호출마다 새 클라이언트 생성
- **세션 확인**: `getUser()` 대신 `getClaims()` 사용 (추가 네트워크 요청 없음, 더 빠름)
- **미들웨어 응답**: `updateSession()` 후 반드시 원본 `supabaseResponse` 그대로 반환
  - 새 Response 객체 생성 시 쿠키 복사 필수, 누락 시 세션 예기치 않게 종료

### 올바른 패턴

```ts
// Server Component에서 세션 확인
const supabase = await createClient(); // lib/supabase/server
const { data } = await supabase.auth.getClaims();
const user = data?.claims;

// Client Component에서 사용
const supabase = createClient(); // lib/supabase/client (await 없음)
```

### 금지 패턴

```ts
// ❌ 전역 변수 저장 금지
let supabase = createClient();
export { supabase };

// ❌ Server Component에서 client.ts 임포트 금지
import { createClient } from "@/lib/supabase/client"; // Server Component에서 금지

// ❌ getClaims() 대신 getUser() 사용 금지 (느림)
const { data } = await supabase.auth.getUser();
```

---

## 미들웨어 규칙

- **파일명 주의**: 미들웨어 진입점은 `proxy.ts` (루트), Next.js 표준 `middleware.ts`가 아님
- `proxy.ts`는 `lib/supabase/proxy.ts`의 `updateSession()`을 호출
- `getClaims()`와 `createServerClient()` 호출 사이에 코드 삽입 금지
- 미들웨어에서 보호 불필요 경로: `/`, `/auth/**`
- 현재 미들웨어는 `/`와 `/auth/**` 외 모든 경로에서 미인증 시 `/auth/login`으로 리다이렉트

---

## 라우트/페이지 추가 규칙

### 새 라우트 추가 시 체크리스트

1. `app/[경로]/page.tsx` 생성
2. 보호 필요 라우트: Server Component 상단에서 `getClaims()` 로 인증 확인 후 미인증 시 `redirect('/auth/login')`
3. `proxy.ts`의 matcher 패턴이 새 경로를 포함하는지 확인
4. `CLAUDE.md`의 라우트 구조 표에 추가

### 라우트별 인증 요구사항

| 경로                | 인증   | 비고                  |
| ------------------- | ------ | --------------------- |
| `/`                 | 불필요 | 공개 이벤트 목록      |
| `/events`           | 불필요 | 이벤트 목록           |
| `/events/[id]`      | 부분   | 비로그인: 기본 정보만 |
| `/events/new`       | 필요   | 로그인 필수           |
| `/events/[id]/edit` | 필요   | Owner만               |
| `/invite/[token]`   | 불필요 | 초대 링크             |
| `/profile`          | 필요   | 로그인 필수           |

---

## 컴포넌트 작성 규칙

### shadcn/ui 컴포넌트 추가

- 새 shadcn 컴포넌트 추가: `npx shadcn@latest add <component>`
- `components/ui/` 내 파일 직접 수정 금지 (재생성 시 덮어씌워짐)
- 아이콘: lucide-react 사용

### 클래스 병합

- Tailwind 클래스 조합 시 반드시 `cn()` 사용

```ts
import { cn } from "@/lib/utils";
// ✅
<div className={cn("base-class", condition && "conditional-class", className)} />
// ❌
<div className={`base-class ${condition ? "conditional-class" : ""}`} />
```

### Server vs Client Component 선택

- 기본값: Server Component (async 함수, Supabase 직접 호출 가능)
- Client Component 사용 조건: `useState`, `useEffect`, 이벤트 핸들러, 브라우저 API 사용 시만

---

## 데이터베이스 규칙

### 테이블 관계 (구현 시 참고)

```
profiles (1:1 → Supabase Auth)
events → profiles (owner_id)
event_members → events, profiles | role: owner/co-host/participant | rsvp: attending/absent/pending
invite_tokens → events (is_active 토글)
notices → events, profiles
notice_email_logs → notices (발송 실패 로그)
settlements → events (스냅샷 고정)
settlement_snapshot_members → settlements (정산 시점 참석자 스냅샷)
carpools → events, profiles (driver_id)
carpool_passengers → carpools, profiles (중복 탑승 불가)
```

### 마이그레이션 규칙

- Supabase MCP `apply_migration` 또는 `execute_sql` 사용
- 마이그레이션 전 `list_tables`로 현재 스키마 확인
- RLS 정책 반드시 설정 (테이블 생성과 동시에)

---

## 비즈니스 로직 규칙

### 이벤트

- 이벤트 일시로부터 24시간 경과 → "지난 이벤트" 표시 + RSVP 잠금
- 정원 초과 시 RSVP "참석" 신규 차단 (불참/미정은 허용)
- 삭제: Hard delete, 삭제 전 확인 다이얼로그에 종속 데이터 개수 표시

### 정산

- 분배 대상: RSVP "참석" 멤버만 (정산 생성 시점 스냅샷 고정, 이후 변경 무시)
- 1인당 금액: **반드시 `Math.ceil(총액 / N)` (올림 처리)**
- 한 이벤트에 다중 정산 허용
- **실제 송금 기능 절대 구현 금지** (계산기 역할만)

### 카풀

- 배정 방식: 주최자/Co-host 수동 배정 (드롭다운)
- 한 참여자는 한 차량만 탑승 가능 (중복 탑승 불가)
- RSVP "불참" 전환 시 카풀 배정 자동 해제
- 운전자 강퇴 시 해당 차량 전체 삭제

### 공지사항 이메일

- 트리거: 새 공지 등록 시만 (수정 시 재발송 없음)
- 발송 서비스: Resend + React Email
- 실패 시 `notice_email_logs`에 로그 기록 (재시도 로직 없음)

### 역할 권한

| 역할        | 허용 작업                                                |
| ----------- | -------------------------------------------------------- |
| Owner       | 이벤트 수정/삭제, Co-host 지명·해임, 공지·정산·카풀 관리 |
| Co-host     | 공지·정산·카풀 관리, 멤버 강퇴 (이벤트 삭제 불가)        |
| Participant | 본인 RSVP 변경, 조회만                                   |

---

## 환경 변수

`.env.local` 필수 항목:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

- `lib/utils.ts`의 `hasEnvVars`가 이 값들을 체크하여 조건부 UI 제어
- `hasEnvVars`가 false이면 미들웨어 세션 갱신 스킵 (개발 편의용)

---

## 금지 사항

- `components/ui/` 내 shadcn 파일 직접 수정 금지
- Supabase 클라이언트를 모듈 레벨 전역 변수에 저장 금지
- `getUser()` 사용 금지 → `getClaims()` 사용
- Server Component에서 `@/lib/supabase/client` 임포트 금지
- Client Component에서 `@/lib/supabase/server` 임포트 금지
- 미들웨어에서 `supabaseResponse` 외 새 Response 반환 금지 (쿠키 복사 없이)
- 정산에 실제 결제/송금 기능 추가 금지
- `middleware.ts` 파일 생성 금지 (이미 `proxy.ts`가 그 역할)
- Tailwind 클래스 직접 문자열 연결 금지 → `cn()` 사용
