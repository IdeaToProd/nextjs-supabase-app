# Task-015: 초대 링크 및 자동 멤버 등록

## 목표

nanoid 토큰 기반 초대 링크와 공개 이벤트 직접 참여 두 경로를 통해
사용자가 이벤트 멤버로 자동 등록되는 기능을 구현합니다.

---

## 기술 스택

| 항목         | 내용                                                       |
| ------------ | ---------------------------------------------------------- |
| 프레임워크   | Next.js 15 App Router (Server Components + Server Actions) |
| 데이터베이스 | Supabase PostgreSQL (invite_tokens + event_members 테이블) |
| 인증         | `@supabase/ssr` 쿠키 기반 세션 + `supabase.auth.getUser()` |
| 에러 처리    | 구조화된 에러 코드 (`MemberErrorCode` 타입)                |

---

## 구현 완료 목록

### Server Actions (`app/actions/members.ts`)

| 함수                    | 설명                                                        |
| ----------------------- | ----------------------------------------------------------- |
| `joinEventByToken`      | 토큰 유효성·로그인·중복·정원 확인 후 `event_members` insert |
| `joinPublicEvent`       | 공개 이벤트·로그인·중복·정원 확인 후 `event_members` insert |
| `deactivateInviteToken` | `is_event_owner` RPC 확인 후 `is_active=false` 업데이트     |
| `regenerateInviteToken` | 기존 토큰 비활성화 + 새 12자 토큰 생성 및 insert            |

### 에러 코드

| 코드                | 의미                             |
| ------------------- | -------------------------------- |
| `UNAUTHENTICATED`   | 로그인 필요                      |
| `INVALID_TOKEN`     | 유효하지 않은 토큰 또는 이벤트   |
| `ALREADY_MEMBER`    | 이미 이벤트 멤버                 |
| `CAPACITY_EXCEEDED` | 정원 초과                        |
| `FORBIDDEN`         | 권한 없음 (Owner 전용 기능 시도) |

### 페이지 및 컴포넌트

| 파일                                          | 변경 유형 | 설명                                                 |
| --------------------------------------------- | --------- | ---------------------------------------------------- |
| `app/invite/[token]/page.tsx`                 | 수정      | 더미 데이터 → Supabase 실데이터 연동                 |
| `app/auth/login/page.tsx`                     | 수정      | `next` 파라미터 지원 추가                            |
| `app/events/[id]/page.tsx`                    | 수정      | 참여 버튼 + 토큰 재발급 버튼 추가                    |
| `components/invite/JoinByTokenButton.tsx`     | 신규      | 초대 토큰 참여 버튼 (Client Component)               |
| `components/events/JoinPublicEventButton.tsx` | 신규      | 공개 이벤트 참여 버튼 (Client Component)             |
| `components/events/RegenerateTokenButton.tsx` | 신규      | 초대 토큰 재발급 버튼 (Owner 전용, Client Component) |
| `components/login-form.tsx`                   | 수정      | `nextPath` props 추가 + 오픈 리다이렉트 방지         |

---

## 수락 기준

### Task-015-1: app/actions/members.ts 신규 구현

- `joinEventByToken(token)`: 토큰 유효성·로그인·중복멤버·정원 확인 후 `event_members` insert
- `joinPublicEvent(eventId)`: 공개이벤트·로그인·중복멤버·정원 확인 후 insert
- `deactivateInviteToken(eventId)`: `is_event_owner` RPC 확인 후 `is_active=false`
- `regenerateInviteToken(eventId)`: 비활성화 + 새 12자 토큰 insert
- 에러 `code` 필드 포함: `UNAUTHENTICATED` / `INVALID_TOKEN` / `ALREADY_MEMBER` / `CAPACITY_EXCEEDED` / `FORBIDDEN`

### Task-015-2: 초대 링크 페이지 실데이터 연동 + returnUrl 지원

- 유효하지 않은 토큰 접근 시 '유효하지 않은 초대 링크' 메시지 표시
- 비로그인 시 이벤트 기본 정보 표시 + 로그인 버튼 (`href=/auth/login?next=/invite/TOKEN`)
- 이미 멤버인 경우 이벤트 상세로 redirect
- 정원 초과 시 차단 메시지 표시
- 로그인 사용자 + 참여 가능 → '이 이벤트에 참여하기' 버튼 (`JoinByTokenButton`)

### Task-015-3: 이벤트 상세 참여 버튼 + 토큰 재발급 UI

- 공개 이벤트 + 비멤버 + 로그인 → '참여하기' 버튼 (`joinPublicEvent` 호출)
- 공개 이벤트 + 비멤버 + 비로그인 → '로그인 후 참여' Link
- Owner 전용: `CopyInviteLinkButton` 옆에 '링크 재발급' `RegenerateTokenButton` 추가
- 재발급 후 `router.refresh()`로 새 토큰 반영

---

## E2E 검증 결과 (Playwright MCP)

### 시나리오 #3 (공개 이벤트 참여)

- `/events` 접근 → 공개 이벤트 목록 확인 (2개 표시)
- 초대 링크 (`/invite/5ca0f31510b2`) 비로그인 접근 → 이벤트 기본 정보 표시 + `/auth/login?next=/invite/5ca0f31510b2` 링크 확인
- 유효하지 않은 토큰 (`/invite/invalidtoken123`) 접근 → '유효하지 않은 초대 링크' 메시지 표시 확인
- 이미 멤버인 사용자로 초대 링크 접근 → 이벤트 상세 페이지로 redirect 확인

### RLS 정책 수정 (마이그레이션)

초대 링크 페이지에서 비로그인 사용자도 이벤트 미리보기가 가능하도록 `invite_tokens` SELECT 정책 변경:

- **이전**: `is_event_member(event_id)` (멤버만 조회 가능)
- **이후**: `is_active = true OR is_event_member(event_id)` (활성 토큰은 누구나 조회 가능)
- 마이그레이션: `fix_invite_tokens_select_policy_for_public_access`

---

## 비즈니스 규칙 정리

| 규칙                        | 처리 방식                                                   |
| --------------------------- | ----------------------------------------------------------- |
| 정원 없음 (`capacity=null`) | count 확인 생략, 무제한 참여 허용                           |
| 이미 멤버                   | `ALREADY_MEMBER` 에러 + `eventId` 반환 (상세 redirect 가능) |
| 비공개 이벤트 직접 참여     | `FORBIDDEN` 에러 (초대 링크 경로만 허용)                    |
| 오픈 리다이렉트 방지        | `/invite/`, `/events/` 경로만 `next` 파라미터 허용          |

---

## 완료일

2026-05-20
