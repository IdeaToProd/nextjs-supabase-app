# Task-013: 데이터베이스 스키마 및 Supabase 초기 설정

## 목표

10개 테이블 마이그레이션 작성·적용, RLS ENABLE, updated_at 트리거, RLS 헬퍼 함수,
TypeScript 타입 자동 생성, `.env.example` 작성, `resend`·`nanoid` 등 라이브러리 설치.

## 완료 산출물

| 파일                                                                     | 설명                                                         |
| ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `supabase/migrations/20260519100000_add_is_admin_to_profiles.sql`        | profiles.is_admin 컬럼 + 부분 인덱스                         |
| `supabase/migrations/20260519100100_create_events_and_members.sql`       | events / event_members / invite_tokens                       |
| `supabase/migrations/20260519100200_create_notices.sql`                  | notices / notice_email_logs                                  |
| `supabase/migrations/20260519100300_create_settlements.sql`              | settlements / settlement_snapshot_members                    |
| `supabase/migrations/20260519100400_create_carpools.sql`                 | carpools / carpool_passengers                                |
| `supabase/migrations/20260519100500_enable_rls_all_tables.sql`           | 신규 9개 테이블 RLS ENABLE                                   |
| `supabase/migrations/20260519100600_create_updated_at_triggers.sql`      | updated_at 트리거 (events, event_members, notices, carpools) |
| `supabase/migrations/20260519100700_create_helper_functions.sql`         | is_event_owner / is_event_member SECURITY DEFINER 함수       |
| `supabase/migrations/20260519100800_fix_helper_function_anon_revoke.sql` | anon EXECUTE 권한 명시 제거                                  |
| `lib/database.types.ts`                                                  | 10개 테이블 타입 재생성 + Db-prefix 단축키 16종 export       |
| `.env.example`                                                           | 환경 변수 템플릿 5개 항목                                    |

## 완료일

2026-05-19

## 사용자 확정 결정 4건

1. **영문 코드 저장**: role(`owner`/`co_host`/`participant`), rsvp_status(`attending`/`absent`/`pending`) — 한국어 레이블은 UI 레이어에서 매핑
2. **RLS ENABLE만 적용**: 정책 없음 = 전면 차단 상태. Phase 4/5에서 도메인별 최소 정책 추가 예정
3. **도메인별 8개 마이그레이션 분할**: 파일 단위로 롤백 용이, 리뷰 가독성 확보
4. **로컬 SQL + MCP apply_migration**: Supabase CLI 로컬 스택 없이 원격 직접 적용

## 핵심 설계 결정

- `carpool_passengers.event_id` 비정규화: `UNIQUE(event_id, user_id)`로 한 이벤트 내 한 차량만 탑승 규칙 강제
- `settlements` 스냅샷 컬럼(`snapshot_member_count`, `per_person_amount`): INSERT 시점에 계산·고정 (트리거 아님)
- `carpools.driver_id ON DELETE CASCADE`: 운전자 강퇴 시 해당 차량 자동 삭제
- 헬퍼 함수 `SECURITY DEFINER SET search_path = ''`: Security Advisor 경고 방지

## 관련 파일

- `supabase/migrations/` — 마이그레이션 파일 전체
- `lib/database.types.ts` — 자동 생성 TypeScript 타입
- `.env.example` — 환경 변수 템플릿
- `docs/PRD.md` 부록 A — 데이터 모델 원본 명세
