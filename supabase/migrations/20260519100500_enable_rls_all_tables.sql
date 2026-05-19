-- ============================================================
-- 신규 9개 테이블 RLS ENABLE
-- 정책 없음 = 전면 차단 상태 (Phase 4/5에서 도메인별 정책 추가)
-- ============================================================

-- 이벤트 도메인
ALTER TABLE public.events                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_members              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_tokens              ENABLE ROW LEVEL SECURITY;

-- 공지 도메인
ALTER TABLE public.notices                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notice_email_logs          ENABLE ROW LEVEL SECURITY;

-- 정산 도메인
ALTER TABLE public.settlements                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_snapshot_members ENABLE ROW LEVEL SECURITY;

-- 카풀 도메인
ALTER TABLE public.carpools                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carpool_passengers         ENABLE ROW LEVEL SECURITY;
