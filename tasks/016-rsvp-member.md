# Task-016: RSVP 변경 + 멤버 관리

## 목표

이벤트 상세 참여자 탭에서 멤버가 자신의 RSVP 상태를 변경하고, Owner/Co-host가 멤버를 강퇴할 수 있는 기능을 구현합니다.

---

## 기술 스택

| 항목         | 내용                                                       |
| ------------ | ---------------------------------------------------------- |
| 프레임워크   | Next.js 15 App Router (Server Components + Server Actions) |
| 데이터베이스 | Supabase PostgreSQL (event_members 테이블)                 |
| 인증         | `@supabase/ssr` 쿠키 기반 세션 + `supabase.auth.getUser()` |
| UI           | shadcn/ui (Button, AlertDialog)                            |
| 에러 처리    | 구조화된 에러 코드 (`MemberErrorCode` 타입 확장)           |

---

## 구현 완료 목록

### Server Actions (`app/actions/members.ts`)

| 함수         | 설명                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| `changeRsvp` | 인증→status 유효성→멤버십→24h 잠금→UPDATE 순서로 RSVP 상태 변경        |
| `kickMember` | 인증→자기강퇴방지→요청자role→대상role→역할가드→DELETE 순서로 멤버 강퇴 |

### 에러 코드 추가 (MemberErrorCode)

| 코드               | 의미                                                  |
| ------------------ | ----------------------------------------------------- |
| `EVENT_LOCKED`     | 이벤트 시작 후 24시간 경과 — RSVP 변경 불가           |
| `INVALID_STATUS`   | 유효하지 않은 RSVP 상태 (attending/absent/pending 외) |
| `NOT_MEMBER`       | 해당 이벤트의 멤버가 아님                             |
| `CANNOT_KICK_SELF` | 자기 자신 강퇴 시도                                   |
| `NOT_FOUND`        | 강퇴 대상 멤버 없음                                   |

### 신규 컴포넌트

| 파일                                      | 설명                                                      |
| ----------------------------------------- | --------------------------------------------------------- |
| `components/events/RsvpChangeButtons.tsx` | 참석/불참/미정 3종 버튼, 현재 상태 강조, 지난 이벤트 잠금 |
| `components/events/KickMemberButton.tsx`  | AlertDialog 확인 다이얼로그 포함 강퇴 버튼                |

### 페이지 수정

| 파일                       | 변경 내용                                                                |
| -------------------------- | ------------------------------------------------------------------------ |
| `app/events/[id]/page.tsx` | 더미 RSVP 버튼 → RsvpChangeButtons 교체, 관리 열 + KickMemberButton 추가 |

---

## 수락 기준

### Task-016-1: changeRsvp Server Action

- `MemberErrorCode`에 EVENT_LOCKED | INVALID_STATUS | NOT_MEMBER | CANNOT_KICK_SELF | NOT_FOUND 추가
- `changeRsvp(eventId, status)`: 인증→status 유효성(3종)→멤버십→24h 잠금→UPDATE 순서
- 지난 이벤트 잠금: `starts_at + 24h < now` 이면 `EVENT_LOCKED` 반환

### Task-016-2: kickMember Server Action

- `kickMember(eventId, targetUserId)`: 인증→자기강퇴방지→요청자role(owner/co_host)→대상role→역할가드→DELETE
- Owner 강퇴 불가 (`target.role === 'owner'` → FORBIDDEN)
- Co-host는 participant만 강퇴 가능 (`requester co_host + target co_host` → FORBIDDEN)

### Task-016-3: RsvpChangeButtons 컴포넌트

- props: `eventId`, `currentRsvp`, `isPast`
- 현재 상태 버튼: `variant='default'` 강조
- `isPast === true`: 전체 disabled + "지난 이벤트 — RSVP가 잠겼어요" 안내
- 클릭→changeRsvp→성공 router.refresh()→에러 인라인 표시

### Task-016-4: KickMemberButton 컴포넌트

- props: `eventId`, `targetUserId`, `targetName`
- ghost+destructive 트리거 버튼
- AlertDialog: "{targetName}님을 강퇴할까요?" + 취소/강퇴
- 확인→kickMember→성공 router.refresh()→에러 인라인 표시

### Task-016-5: page.tsx 통합

- 더미 RSVP 버튼 → RsvpChangeButtons 교체
- TableHeader에 `isOwnerOrCoHost` 조건부 "관리" 열 추가
- 강퇴 노출 조건: `member.user_id !== currentUserId AND member.role !== 'owner' AND (user_role === 'owner' OR member.role === 'participant')`
- `npm run lint` 통과, `npm run build` 통과

---

## E2E 검증 결과 (Playwright MCP)

### 시나리오 1 — RSVP 3종 변경 + 집계 갱신

- 계정 B(soyeon21306, participant)로 AI 스터디 이벤트 상세 진입
- 참여자 탭 → 참석/불참/미정 버튼 3개 표시 확인
- "불참" 클릭 → 집계 카드: 참석 1 / 불참 1로 갱신 확인
- "미정" 클릭 → 집계 카드: 참석 1 / 미정 1로 갱신 확인
- "참석" 클릭 → 원상 복귀 확인

### 시나리오 2 — 지난 이벤트 RSVP 잠금

- 계정 A(soyeon12012, owner)로 클라이밍 모임(2026-05-25, 24h 경과) 진입
- 참여자 탭 → "지난 이벤트" 배지 + 참석/불참/미정 버튼 전체 `disabled` 확인
- "지난 이벤트 — RSVP가 잠겼어요" 안내 텍스트 표시 확인

### 시나리오 3 — Owner의 participant 강퇴

- 계정 A(owner)로 AI 스터디 이벤트 참여자 탭
- 박소연(participant) 행에 "강퇴" 버튼 표시 확인
- 강퇴 클릭 → AlertDialog "박소연님을 강퇴할까요?" 표시 확인
- 확인 클릭 → 멤버 목록에서 박소연 제거 + "2명 참여" → "1명 참여" 갱신 확인

### 시나리오 4 — Co-host 권한 제한

- 박소연을 co_host로 설정 후 계정 B(co_host)로 로그인
- 참여자 탭 → 주최자 행: 강퇴 버튼 없음 확인
- 본인(co_host) 행: 강퇴 버튼 없음 확인 (자기자신 + co_host간 강퇴 불가)

---

## 비즈니스 규칙

| 규칙                      | 처리 방식                                                  |
| ------------------------- | ---------------------------------------------------------- |
| 24h 잠금                  | `starts_at + 24h < now` 이면 `EVENT_LOCKED`, 버튼 disabled |
| Owner 강퇴 불가           | `target.role === 'owner'` → FORBIDDEN                      |
| Co-host 해임은 Owner 전용 | `requester co_host + target co_host` → FORBIDDEN           |
| 자기 자신 강퇴 불가       | `targetUserId === user.id` → CANNOT_KICK_SELF              |
| 마이그레이션 불필요       | RLS(`is_event_manager` + `user_id = auth.uid()`) 이미 완비 |

---

## 완료일

2026-05-27
