-- ============================================================
-- 카풀 도메인 2개 테이블 생성
-- carpools, carpool_passengers
-- ============================================================

-- ── 1. carpools ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.carpools (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            UUID        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  -- 운전자 강퇴 시 해당 차량 자동 삭제 (CASCADE)
  driver_id           UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- 탑승 가능 인원 (운전자 제외, 1~10명)
  seat_count          INT         NOT NULL CHECK (seat_count BETWEEN 1 AND 10),
  -- 출발지 (선택)
  departure_location  TEXT,
  -- 출발 일시 (선택)
  depart_at           TIMESTAMPTZ,
  description         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.carpools                   IS '카풀 차량 정보';
COMMENT ON COLUMN public.carpools.driver_id         IS '운전자 (profiles.id 참조, CASCADE 삭제)';
COMMENT ON COLUMN public.carpools.seat_count        IS '탑승 가능 인원 (운전자 제외, 1~10)';
COMMENT ON COLUMN public.carpools.departure_location IS '출발지 (선택)';
COMMENT ON COLUMN public.carpools.depart_at         IS '출발 일시 (선택)';

-- 이벤트별 카풀 목록 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_carpools_event_id
  ON public.carpools (event_id);


-- ── 2. carpool_passengers ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.carpool_passengers (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  carpool_id  UUID        NOT NULL REFERENCES public.carpools(id) ON DELETE CASCADE,
  -- event_id 비정규화: 한 이벤트 내 한 차량만 탑승 규칙 강제용
  -- 앱에서 carpools.event_id를 명시적으로 함께 INSERT
  event_id    UUID        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- 핵심 제약: 한 이벤트에서 한 사용자는 한 차량만 탑승 가능
  UNIQUE (event_id, user_id)
);

COMMENT ON TABLE  public.carpool_passengers           IS '카풀 탑승자 목록';
COMMENT ON COLUMN public.carpool_passengers.event_id IS '비정규화 컬럼 — UNIQUE(event_id,user_id)로 중복 탑승 방지';

-- 카풀별 탑승자 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_carpool_passengers_carpool_id
  ON public.carpool_passengers (carpool_id);

-- 사용자별 탑승 카풀 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_carpool_passengers_user_id
  ON public.carpool_passengers (user_id);
