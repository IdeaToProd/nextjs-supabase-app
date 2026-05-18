import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Google OAuth 콜백 핸들러
 * Supabase로부터 전달받은 code를 세션으로 교환한 뒤 목적지로 리다이렉트합니다.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/protected";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(
    `${origin}/auth/error?error=${encodeURIComponent("인증 코드가 없습니다")}`,
  );
}
