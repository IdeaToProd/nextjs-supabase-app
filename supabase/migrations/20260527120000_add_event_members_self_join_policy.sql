-- 로그인 사용자가 본인을 participant로 등록(self-join)하는 케이스 허용.
-- 무단 가입 방지를 위해 대상 이벤트가 공개이거나 활성 초대 토큰이 있을 때만 허용.
-- 정원 초과/지난 이벤트/공개 여부 등 세부 비즈니스 검증은 Server Action에서 수행.
CREATE POLICY event_members_self_join
  ON public.event_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND role = 'participant'
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_members.event_id
        AND (
          e.is_public = true
          OR EXISTS (
            SELECT 1 FROM public.invite_tokens it
            WHERE it.event_id = e.id AND it.is_active = true
          )
        )
    )
  );
