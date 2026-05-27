import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 이메일 인증 라우트 핸들러
 *
 * Supabase가 보내는 두 가지 이메일 링크 형식을 모두 처리합니다:
 * 1. PKCE 방식 (신규): ?code=xxx
 *    - 대부분의 Supabase 프로젝트 기본값
 *    - exchangeCodeForSession()으로 세션 교환
 * 2. OTP 방식 (구형): ?token_hash=xxx&type=xxx
 *    - verifyOtp()로 토큰 검증
 *
 * 지원 플로우:
 * - 비밀번호 리셋 (type=recovery): /auth/update-password로 리다이렉트
 * - 회원가입 이메일 확인 (type=signup): next 파라미터 목적지로 리다이렉트
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const { searchParams, origin } = requestUrl;

  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();

  // --- PKCE 방식: ?code=xxx ---
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // next 파라미터에 /auth/update-password가 지정된 경우(비밀번호 리셋)
      // 또는 type=recovery가 함께 전달된 경우 비밀번호 변경 페이지로 이동
      if (next === "/auth/update-password" || type === "recovery") {
        return NextResponse.redirect(`${origin}/auth/update-password`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(error.message)}`,
    );
  }

  // --- OTP 방식: ?token_hash=xxx&type=xxx ---
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      // type=recovery(비밀번호 리셋)이면 비밀번호 변경 페이지로 이동
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/auth/update-password`);
      }
      // 그 외(signup 등)는 next 파라미터 목적지로 이동
      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(error.message)}`,
    );
  }

  // code, token_hash, type 모두 누락 시 에러 페이지로 리다이렉트
  return NextResponse.redirect(
    `${origin}/auth/error?error=${encodeURIComponent("인증 토큰 또는 타입이 없습니다")}`,
  );
}
