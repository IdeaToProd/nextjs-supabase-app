-- ============================================================
-- 이벤트 도메인 핵심 3개 테이블 생성
-- events, event_members, invite_tokens
-- ============================================================

-- ── 1. events ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  title           TEXT        NOT NULL,
  description     TEXT,
  starts_at       TIMESTAMPTZ NOT NULL,
  location        TEXT,
  -- 정원(NULL = 무제한)
  capacity        INT         CHECK (capacity IS NULL OR capacity > 0),
  is_public       BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.events               IS '모이다 이벤트 본체';
COMMENT ON COLUMN public.events.owner_id      IS '이벤트 생성자 (profiles.id 참조)';
COMMENT ON COLUMN public.events.starts_at     IS '이벤트 시작 일시';
COMMENT ON COLUMN public.events.capacity      IS '최대 참석 인원 (NULL = 무제한)';
COMMENT ON COLUMN public.events.is_public     IS '공개 여부';

-- 날짜 기준 정렬/필터 인덱스
CREATE INDEX IF NOT EXISTS idx_events_starts_at
  ON public.events (starts_at DESC);

-- owner_id 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_events_owner_id
  ON public.events (owner_id);


-- ── 2. event_members ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.event_members (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- 역할: owner(주최자) / co_host(공동주최자) / participant(참가자)
  role        TEXT        NOT NULL DEFAULT 'participant'
                CHECK (role IN ('owner', 'co_host', 'participant')),
  -- 참석 의사: attending(참석) / absent(불참) / pending(미정)
  rsvp_status TEXT        NOT NULL DEFAULT 'pending'
                CHECK (rsvp_status IN ('attending', 'absent', 'pending')),
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- 한 이벤트에 한 사용자는 한 번만 참여 가능
  UNIQUE (event_id, user_id)
);

COMMENT ON TABLE  public.event_members              IS '이벤트 멤버 (역할 + RSVP)';
COMMENT ON COLUMN public.event_members.role         IS 'owner | co_host | participant';
COMMENT ON COLUMN public.event_members.rsvp_status  IS 'attending | absent | pending';

-- 이벤트별 멤버 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_event_members_event_id
  ON public.event_members (event_id);

-- 사용자별 참여 이벤트 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_event_members_user_id
  ON public.event_members (user_id);


-- ── 3. invite_tokens ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invite_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  -- 앱에서 nanoid(10)으로 생성
  token       TEXT        NOT NULL UNIQUE,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ
);

COMMENT ON TABLE  public.invite_tokens             IS '이벤트 초대 링크 토큰';
COMMENT ON COLUMN public.invite_tokens.token       IS '초대 링크용 난수 토큰 (nanoid)';
COMMENT ON COLUMN public.invite_tokens.is_active   IS '토큰 활성화 여부 (비활성화 시 사용 불가)';
COMMENT ON COLUMN public.invite_tokens.expires_at  IS '만료 일시 (NULL = 무기한)';

-- 토큰 조회 인덱스 (초대 링크 입장 시 사용)
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token
  ON public.invite_tokens (token);

CREATE INDEX IF NOT EXISTS idx_invite_tokens_event_id
  ON public.invite_tokens (event_id);
