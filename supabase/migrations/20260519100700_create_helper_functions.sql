-- ============================================================
-- Phase 4/5 RLS 정책 작성에 활용될 헬퍼 함수
-- SECURITY DEFINER + SET search_path = '' 필수 (Security Advisor 경고 방지)
-- ============================================================

-- ── is_event_owner ───────────────────────────────────────────
-- 현재 사용자가 해당 이벤트의 owner인지 확인
CREATE OR REPLACE FUNCTION public.is_event_owner(p_event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.event_members
    WHERE event_id = p_event_id
      AND user_id  = (SELECT auth.uid())
      AND role     = 'owner'
  );
$$;

COMMENT ON FUNCTION public.is_event_owner(UUID) IS 'RLS 헬퍼 — 현재 사용자가 해당 이벤트의 owner인지 확인';

-- ── is_event_member ──────────────────────────────────────────
-- 현재 사용자가 해당 이벤트의 멤버(role 무관)인지 확인
CREATE OR REPLACE FUNCTION public.is_event_member(p_event_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.event_members
    WHERE event_id = p_event_id
      AND user_id  = (SELECT auth.uid())
  );
$$;

COMMENT ON FUNCTION public.is_event_member(UUID) IS 'RLS 헬퍼 — 현재 사용자가 해당 이벤트의 멤버인지 확인';

-- ── 권한 설정 ─────────────────────────────────────────────────
-- PUBLIC 실행 권한 제거 후 authenticated 역할에만 부여
REVOKE EXECUTE ON FUNCTION public.is_event_owner(UUID)  FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_event_member(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_event_owner(UUID)  TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_event_member(UUID) TO authenticated;
