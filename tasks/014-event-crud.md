# Task-014: 이벤트 CRUD + 공개 목록·상세

## 목표

더미 데이터를 실제 Supabase API 호출로 교체하여 이벤트 생성·수정·삭제 핵심 기능과
공개 이벤트 목록·상세 조회를 구현합니다.

---

## 기술 스택

| 항목         | 내용                                                       |
| ------------ | ---------------------------------------------------------- |
| 프레임워크   | Next.js 15 App Router (Server Components + Server Actions) |
| 데이터베이스 | Supabase PostgreSQL (10개 테이블, RLS 정책 적용)           |
| 인증         | `@supabase/ssr` 쿠키 기반 세션 + `supabase.auth.getUser()` |
| 유효성 검증  | Zod + React Hook Form (`lib/schemas/events.ts`)            |
| 스키마 타입  | `lib/database.types.ts` (Supabase CLI 자동 생성)           |

---

## 구현 완료 목록

### Server Actions (`app/actions/events.ts`)

| 함수              | 설명                                                               |
| ----------------- | ------------------------------------------------------------------ |
| `createEvent`     | 이벤트 생성 + owner 자동 지정 + `event_members` 등록 (role: owner) |
| `updateEvent`     | `is_event_owner()` RPC로 서버사이드 권한 검증 후 수정              |
| `deleteEvent`     | 종속 데이터 개수(멤버·공지·정산·카풀) 조회 후 Hard delete          |
| `getPublicEvents` | `is_public = true` 이벤트 목록 조회 (페이지네이션 지원)            |

### 페이지

| 경로                | 컴포넌트                        | 설명                                                  |
| ------------------- | ------------------------------- | ----------------------------------------------------- |
| `/events`           | `app/events/page.tsx`           | 공개 이벤트 목록 (Supabase 실데이터 연동)             |
| `/events/new`       | `app/events/new/page.tsx`       | 이벤트 생성 폼 (비로그인 시 `/auth/login` 리다이렉트) |
| `/events/[id]`      | `app/events/[id]/page.tsx`      | 이벤트 상세 (비공개 이벤트 접근 제어 포함)            |
| `/events/[id]/edit` | `app/events/[id]/edit/page.tsx` | 이벤트 수정 폼 (Owner 전용, 삭제 다이얼로그 포함)     |

### 컴포넌트

| 컴포넌트                                     | 설명                                         |
| -------------------------------------------- | -------------------------------------------- |
| `components/events/EventForm.tsx`            | 생성/수정 공용 폼 (datetime 버그 수정 완료)  |
| `components/events/EventCard.tsx`            | 목록 카드 (is_past 배지, 참여자 수 표시)     |
| `components/events/CopyInviteLinkButton.tsx` | 초대 링크 복사 버튼 (Client Component)       |
| `components/events/DeleteEventDialog.tsx`    | 삭제 확인 다이얼로그 (종속 데이터 개수 표시) |

---

## 수락 기준

### datetime 시간대 버그 수정 (Task-014-1)

- **문제**: `toDatetimeLocalValue`가 UTC ISO 문자열을 그대로 `.slice(0, 16)` 처리
  - KST `18:00` 저장 → DB `09:00Z` → 수정 폼 `09:00` 표시 (9시간 오차)
- **수정**: `new Date(isoString)`으로 파싱 후 `getFullYear()` / `getHours()` 등 로컬 시간 메서드 사용
  - UTC ISO → 브라우저 로컬 시간(KST) 기준 datetime-local 값 반환
- **적용 파일**: `components/events/EventForm.tsx` (함수 `toDatetimeLocalValue`)

### 비공개 이벤트 접근 정책 수정 (Task-014-2)

| 사용자 유형     | 공개 이벤트 | 비공개 이벤트         |
| --------------- | ----------- | --------------------- |
| 비로그인        | 기본 정보   | 접근 제한 메시지 표시 |
| 로그인 + 비멤버 | 기본 정보   | 접근 제한 메시지 표시 |
| 로그인 + 멤버   | 전체 정보   | 전체 정보             |

- 404 노출 금지 — 이벤트 존재 여부를 외부에 노출하지 않기 위함
- `event.user_role === null`이면 멤버가 아닌 것으로 판단
- **적용 파일**: `app/events/[id]/page.tsx` (`EventDetailPage` 함수)

### 그 외 핵심 비즈니스 규칙

- Owner 자동 지정: `createEvent` 실행 시 `event_members`에 `role: 'owner'`로 자동 등록
- 삭제 다이얼로그: 종속 데이터 개수(멤버·공지·정산·카풀) 확인 후 삭제 진행
- 일시 24시간 경과: `is_past` 플래그 서버사이드 계산 (`starts_at + 24h < now`)

---

## E2E 검증 결과 (Playwright MCP)

### 시나리오 #1 (비로그인 — 공개 이벤트 조회)

- `/events` 접근 → 공개 이벤트 목록 정상 표시 확인
- 공개 이벤트 클릭 → 상세 페이지에서 제목·날짜·장소 정보 확인
- 비공개 이벤트 URL 직접 접근 → "이 이벤트는 초대 링크로만 접근할 수 있습니다." 메시지 표시 확인

### 시나리오 #2 (이벤트 생성 — 리다이렉트)

- `/events/new` 비로그인 접근 → `/auth/login` 리다이렉트 정상 동작 확인

---

## 수정 파일 목록

| 파일                              | 변경 유형 | 설명                                    |
| --------------------------------- | --------- | --------------------------------------- |
| `components/events/EventForm.tsx` | 수정      | `toDatetimeLocalValue` 시간대 버그 수정 |
| `app/events/[id]/page.tsx`        | 수정      | 비공개 이벤트 접근 제어 로직 추가       |
| `tasks/014-event-crud.md`         | 신규      | 본 태스크 문서                          |

---

## 완료일

2026-05-20
