-- profiles 테이블에 is_admin 플래그 추가
-- 어드민 여부를 Supabase 콘솔에서 직접 설정하는 방식으로 관리
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- 컬럼 설명 추가
COMMENT ON COLUMN public.profiles.is_admin IS '관리자 여부 — Supabase 콘솔에서 직접 설정';

-- 어드민 조회용 부분 인덱스 (is_admin = true인 소수의 row만 인덱싱)
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin
  ON public.profiles (id)
  WHERE is_admin = true;
