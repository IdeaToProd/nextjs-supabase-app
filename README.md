# 모이다 (Moida)

> **한 번의 모임을 위한, 가장 가벼운 운영 도구.**

30명 이내 소규모 모임 주최자가 카카오톡·구글폼·더치트로 흩어진 작업을 **단일 이벤트 페이지 하나**로 처리할 수 있도록 합니다.

---

## 핵심 기능

| 기능                   | 설명                                                             |
| ---------------------- | ---------------------------------------------------------------- |
| **공지사항**           | 단톡방에 묻히지 않는 모임 전용 공지 + 멤버 전원 이메일 자동 발송 |
| **참여자 관리 (RSVP)** | 참석 / 불참 / 미정 3종 상태 + 초대 링크 / 공개 참여 자동 등록    |
| **정산**               | 총액 N등분 자동 계산 (스냅샷 고정, 올림 처리), 다중 정산 지원    |
| **카풀**               | 차량 등록 + 드롭다운 기반 탑승자 수동 배정, 중복 탑승 방지       |
| **어드민**             | 운영자 전용 회원·이벤트 전체 조회 (읽기 전용)                    |

---

## 기술 스택

| 영역        | 기술                                      |
| ----------- | ----------------------------------------- |
| 프레임워크  | Next.js 15 (App Router)                   |
| 데이터·인증 | Supabase (이메일/비밀번호 + Google OAuth) |
| UI          | shadcn/ui + Tailwind CSS                  |
| 이메일      | Resend + React Email                      |
| 배포        | Vercel                                    |

---

## 로컬 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 아래 값을 채웁니다.

```env
NEXT_PUBLIC_SUPABASE_URL=<Supabase 프로젝트 URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Supabase Publishable(anon) 키>
```

> 두 값 모두 [Supabase 대시보드 → Project Settings → API](https://supabase.com/dashboard/project/_?showConnect=true) 에서 확인할 수 있습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 앱을 확인합니다.

---

## 개발 명령어

```bash
npm run dev       # 개발 서버 (localhost:3000)
npm run build     # 프로덕션 빌드
npm run start     # 빌드된 앱 실행
npm run lint      # ESLint 검사
npm run lint:fix  # ESLint 자동 수정
npm run format    # Prettier 포맷팅
```

---

## 라우트 구조

| 경로                 | 페이지                    |   비로그인    |
| -------------------- | ------------------------- | :-----------: |
| `/`                  | 홈 (공개 이벤트 목록)     |       ✓       |
| `/events`            | 이벤트 목록               |       ✓       |
| `/events/[id]`       | 이벤트 상세 (4기능 섹션)  | △ 기본 정보만 |
| `/events/new`        | 이벤트 생성               |       ×       |
| `/events/[id]/edit`  | 이벤트 수정 (Owner 전용)  |       ×       |
| `/invite/[token]`    | 초대 링크 진입            |       ✓       |
| `/profile`           | 내 프로필                 |       ×       |
| `/auth/**`           | 인증 (로그인·회원가입 등) |       ✓       |
| `/admin`             | 어드민 홈                 |       ×       |
| `/admin/users`       | 회원 목록·검색            |       ×       |
| `/admin/events`      | 이벤트 목록·검색·필터     |       ×       |
| `/admin/events/[id]` | 이벤트 상세 (읽기 전용)   |       ×       |

---

## 역할 및 권한

| 역할            | 부여 방식                                  | 핵심 권한                                           |
| --------------- | ------------------------------------------ | --------------------------------------------------- |
| **Owner**       | 이벤트 생성 시 자동                        | 이벤트 수정·삭제, Co-host 지명, 공지·정산·카풀 관리 |
| **Co-host**     | Owner가 멤버 중 지명                       | 공지·정산·카풀 관리, 멤버 강퇴                      |
| **Participant** | 멤버 등록 시 기본                          | 본인 RSVP 변경, 전체 조회                           |
| **Admin**       | `profiles.is_admin = true` (Supabase 콘솔) | 모든 회원·이벤트 조회 (읽기 전용)                   |

---

## 데이터 모델

총 **10개 테이블**로 구성됩니다.

| 테이블                        | 역할                                        |
| ----------------------------- | ------------------------------------------- |
| `profiles`                    | Supabase Auth와 1:1, `is_admin` 플래그 보유 |
| `events`                      | 이벤트 기본 정보                            |
| `event_members`               | 역할(owner/co-host/participant) + RSVP 상태 |
| `invite_tokens`               | 초대 링크 토큰, `is_active` 토글            |
| `notices`                     | 공지사항                                    |
| `notice_email_logs`           | 이메일 발송 실패 로그                       |
| `settlements`                 | 정산 (스냅샷 고정, `Math.ceil` 올림)        |
| `settlement_snapshot_members` | 정산 시점 참석자 스냅샷                     |
| `carpools`                    | 카풀 차량 정보                              |
| `carpool_passengers`          | 탑승자 (중복 탑승 불가)                     |

---

## 핵심 비즈니스 규칙

- **RSVP 잠금**: 이벤트 일시 24시간 경과 후 변경 불가
- **정산**: N = 정산 생성 시점의 "참석" 멤버 스냅샷, 1인당 = `Math.ceil(총액 / N)`
- **카풀**: RSVP "불참" 전환 시 탑승 자동 해제, 운전자 강퇴 시 차량 자동 삭제
- **이메일**: 새 공지 등록 시에만 자동 발송 (Resend + React Email)
- **어드민**: 읽기 전용 — 수정·삭제 권한 없음

상세 로드맵: [`docs/ROADMAP.md`](./docs/ROADMAP.md)  
제품 요구사항: [`docs/PRD.md`](./docs/PRD.md)
