-- ============================================================
-- 공지 도메인 2개 테이블 생성
-- notices, notice_email_logs
-- ============================================================

-- ── 1. notices ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notices (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  -- 작성자 삭제 시 공지는 보존 (RESTRICT → 실수 삭제 방지)
  author_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  title       TEXT        NOT NULL,
  body        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.notices            IS '이벤트 공지사항';
COMMENT ON COLUMN public.notices.event_id  IS '소속 이벤트 (events.id 참조)';
COMMENT ON COLUMN public.notices.author_id IS '공지 작성자 (profiles.id 참조)';
COMMENT ON COLUMN public.notices.body      IS '공지 본문 (Markdown 허용)';

-- 이벤트별 공지 목록 조회 인덱스 (최신순)
CREATE INDEX IF NOT EXISTS idx_notices_event_created
  ON public.notices (event_id, created_at DESC);


-- ── 2. notice_email_logs ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notice_email_logs (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id           UUID        NOT NULL REFERENCES public.notices(id) ON DELETE CASCADE,
  -- 수신자 삭제 시 로그 삭제 (로그 보존 불필요)
  recipient_user_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- 발송 상태: sent(성공) / failed(실패)
  status              TEXT        NOT NULL
                        CHECK (status IN ('sent', 'failed')),
  -- 실패 시 오류 메시지 (성공 시 NULL)
  error_message       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.notice_email_logs                  IS '공지 이메일 발송 결과 로그';
COMMENT ON COLUMN public.notice_email_logs.notice_id        IS '대상 공지 (notices.id 참조)';
COMMENT ON COLUMN public.notice_email_logs.recipient_user_id IS '이메일 수신자 (profiles.id 참조)';
COMMENT ON COLUMN public.notice_email_logs.status           IS 'sent | failed';
COMMENT ON COLUMN public.notice_email_logs.error_message    IS '실패 사유 (Resend 오류 메시지 등)';

-- 공지별 발송 로그 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_notice_email_logs_notice_id
  ON public.notice_email_logs (notice_id);
