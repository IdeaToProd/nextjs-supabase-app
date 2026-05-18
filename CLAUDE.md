# CLAUDE.md

---

## 프로젝트 개요

- **제품명**: 모임 이벤트 관리 웹 MVP
- **한 줄 정의**: 한 번의 모임을 위한, 가장 가벼운 운영 도구
- **타겟**: 30명 이내 소규모 모임 주최자
- **핵심 기능 4종**: 공지사항 · 참여자 관리(RSVP) · 정산 · 카풀

---

## 개발 명령어

```bash
npm run dev       # 개발 서버 (localhost:3000)
npm run build     # 프로덕션 빌드
npm run start     # 빌드된 앱 실행
npm run lint      # ESLint 검사
```

테스트 프레임워크 미포함.

---

## 환경 변수

`.env.local` 필수 항목:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

`lib/utils.ts`의 `hasEnvVars`가 이 값들을 체크하여 조건부 UI를 제어한다.

---

## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **데이터·인증**: Supabase (이메일/비밀번호 + Google OAuth 구현 완료)
- **UI**: shadcn/ui + Tailwind CSS
- **이메일**: Resend + React Email
- **배포**: Vercel

---

## 아키텍처

### Supabase 클라이언트

절대 전역 변수에 저장하지 않는다 (Fluid compute 호환성). 매 요청마다 새로 생성.

| 파일                     | 용도                                           |
| ------------------------ | ---------------------------------------------- |
| `lib/supabase/server.ts` | Server Component, Route Handler, Server Action |
| `lib/supabase/client.ts` | Client Component (`'use client'` 필요)         |
| `lib/supabase/proxy.ts`  | 미들웨어 세션 갱신                             |

### 미들웨어 (`proxy.ts`)

- 모든 요청을 가로채 Supabase 세션 갱신
- `supabase.auth.getClaims()` 호출 후 원본 `supabaseResponse` 그대로 반환 필수
  - 새 Response 객체에 쿠키 미복사 시 세션 예기치 않게 종료됨
- 인증 불필요 경로: `/`, `/auth/**`

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

### 보호된 라우트

- `/protected/**` → 미인증 시 `/auth/login` 리다이렉트
- 서버 컴포넌트: `getClaims()` 사용 (추가 네트워크 요청 없이 세션 클레임 직접 읽기)

---

## 라우트 구조

| 경로                | 페이지                   |   비로그인    |
| ------------------- | ------------------------ | :-----------: |
| `/`                 | 홈 (공개 이벤트 목록)    |       ✓       |
| `/events`           | 이벤트 목록              |       ✓       |
| `/events/[id]`      | 이벤트 상세 (4기능 섹션) | △ 기본 정보만 |
| `/events/new`       | 이벤트 생성              |       ×       |
| `/events/[id]/edit` | 이벤트 수정 (Owner 전용) |       ×       |
| `/invite/[token]`   | 초대 링크 진입           |       ✓       |
| `/profile`          | 내 프로필                |       ×       |
| `/auth/**`          | 인증 (기존 구현)         |       ✓       |

---

## 데이터 모델 (10개 테이블)

| 테이블                        | 핵심 관계                                             |
| ----------------------------- | ----------------------------------------------------- |
| `profiles`                    | Supabase Auth와 1:1                                   |
| `events`                      | → profiles (owner)                                    |
| `event_members`               | role: owner/co-host/participant, rsvp: 참석/불참/미정 |
| `invite_tokens`               | → events, is_active 토글                              |
| `notices`                     | → events, profiles                                    |
| `notice_email_logs`           | 발송 실패 로그                                        |
| `settlements`                 | 스냅샷 고정, `Math.ceil` 올림 처리                    |
| `settlement_snapshot_members` | 정산 시점 참석자 스냅샷                               |
| `carpools`                    | → events, profiles (driver)                           |
| `carpool_passengers`          | 중복 탑승 불가                                        |

---

## 역할 및 권한

| 역할            | 핵심 권한                                                |
| --------------- | -------------------------------------------------------- |
| **Owner**       | 이벤트 수정/삭제, Co-host 지명·해임, 공지·정산·카풀 관리 |
| **Co-host**     | 공지·정산·카풀 관리, 멤버 강퇴 (삭제 불가)               |
| **Participant** | 본인 RSVP 변경, 조회                                     |

---

## 핵심 비즈니스 규칙

### 이벤트

- 일시 24시간 경과 후 → "지난 이벤트" 표시 + RSVP 잠금
- 정원 초과 시 신규 "참석" 차단 (불참/미정은 허용)
- 삭제: Hard delete, 확인 다이얼로그에 종속 데이터 개수 표시

### 정산

- N = RSVP "참석" 멤버 (정산 생성 시점 스냅샷 고정)
- 1인당 금액: `Math.ceil(총액 / N)` (올림 처리)
- 한 이벤트에 다중 정산 가능
- 실제 송금 기능 영구 제외 (계산기 역할만)

### 카풀

- 주최자 수동 배정 (드롭다운 선택)
- 한 사람 = 한 차량만 (중복 탑승 불가)
- RSVP "불참" 전환 시 카풀 배정 자동 해제
- 운전자 강퇴 시 해당 차량 자동 삭제

### 이메일 알림

- 트리거: 새 공지 등록 시만
- 발송 서비스: Resend + React Email
- 실패 시 `notice_email_logs`에 로그 기록 (재시도 없음)

---

## UI 컴포넌트

- `components/ui/` → shadcn/ui 컴포넌트
- 추가 시: `npx shadcn@latest add <component>`
- 클래스 병합: `lib/utils.ts`의 `cn()` 사용

상세 태스크: [`docs/ROADMAP.md`](./docs/ROADMAP.md)
PRD 전문: [`docs/PRD.md`](./docs/PRD.md)
