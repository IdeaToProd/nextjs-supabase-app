import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 환경 변수 미설정 시 프록시 체크 생략
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // Fluid compute 호환: 전역 변수 저장 금지, 매 요청마다 새로 생성
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims()와 createServerClient 사이에 다른 코드 추가 금지
  // (랜덤 로그아웃 방지를 위해)
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const { pathname } = request.nextUrl;

  // 공개 허용 경로: /, /auth/**, /events (목록), /events/[id] (상세), /invite/[token]
  const isPublicPath =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname === "/events" ||
    /^\/events\/[^/]+$/.test(pathname) ||
    /^\/invite\/[^/]+/.test(pathname);

  if (!isPublicPath && !user) {
    // 미인증 사용자를 로그인 페이지로 리다이렉트
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: supabaseResponse를 그대로 반환해야 함
  // 새 Response 객체 생성 시 쿠키 복사 필수 (세션 유지)
  return supabaseResponse;
}
