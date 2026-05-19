-- ============================================================
-- updated_at 자동 갱신 트리거 부착
-- 기존 public.handle_updated_at() 함수 재사용
-- updated_at 컬럼이 있는 테이블만 대상: events, event_members, notices, carpools
-- ============================================================

-- events 테이블 updated_at 트리거
CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- event_members 테이블 updated_at 트리거
CREATE TRIGGER trg_event_members_updated_at
  BEFORE UPDATE ON public.event_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- notices 테이블 updated_at 트리거
CREATE TRIGGER trg_notices_updated_at
  BEFORE UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- carpools 테이블 updated_at 트리거
CREATE TRIGGER trg_carpools_updated_at
  BEFORE UPDATE ON public.carpools
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
