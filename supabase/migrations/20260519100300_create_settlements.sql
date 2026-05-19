-- ============================================================
-- 정산 도메인 2개 테이블 생성
-- settlements, settlement_snapshot_members
-- ============================================================

-- ── 1. settlements ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.settlements (
  id                      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id                UUID    NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  -- 정산 생성자 삭제 시에도 정산 기록은 보존
  created_by              UUID    NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  title                   TEXT    NOT NULL,
  -- 총액 (원 단위, 음수 불가)
  total_amount            BIGINT  NOT NULL CHECK (total_amount >= 0),
  -- 정산 생성 시점 참석자 수 (스냅샷, 이후 변경 불가)
  snapshot_member_count   INT     NOT NULL CHECK (snapshot_member_count > 0),
  -- 1인당 금액 = Math.ceil(total_amount / snapshot_member_count)
  per_person_amount       BIGINT  NOT NULL CHECK (per_person_amount >= 0),
  -- 정산 설명 (선택)
  description             TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.settlements                        IS '이벤트 정산';
COMMENT ON COLUMN public.settlements.total_amount           IS '총 비용 (원 단위)';
COMMENT ON COLUMN public.settlements.snapshot_member_count  IS '정산 시점 참석자 수 (스냅샷 고정, 불변)';
COMMENT ON COLUMN public.settlements.per_person_amount      IS '1인당 금액 = Math.ceil(total / count) — 스냅샷 고정';

-- 이벤트별 정산 목록 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_settlements_event_id
  ON public.settlements (event_id);


-- ── 2. settlement_snapshot_members ───────────────────────────
CREATE TABLE IF NOT EXISTS public.settlement_snapshot_members (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id   UUID    NOT NULL REFERENCES public.settlements(id) ON DELETE CASCADE,
  -- 사용자 삭제 시에도 정산 스냅샷 기록은 보존 (RESTRICT)
  user_id         UUID    NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  -- 정산 시점 표시 이름 (프로필 변경에 영향받지 않도록 스냅샷)
  display_name    TEXT    NOT NULL,
  -- 한 정산에 한 사용자는 한 번만 포함
  UNIQUE (settlement_id, user_id)
);

COMMENT ON TABLE  public.settlement_snapshot_members               IS '정산 시점 참석자 스냅샷';
COMMENT ON COLUMN public.settlement_snapshot_members.display_name IS '정산 시점 표시 이름 (프로필 변경 영향 없음)';

-- 정산별 스냅샷 멤버 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_settlement_snapshot_members_settlement_id
  ON public.settlement_snapshot_members (settlement_id);
