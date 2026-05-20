/**
 * 어드민 레이아웃 (Server Component)
 * - 세션 및 is_admin 권한을 서버에서 검증
 * - 미인증 시 /auth/login, 비관리자 시 / 로 리다이렉트
 * - AdminNav(헤더/모바일탭), AdminSidebar(데스크톱 사이드바) 분리
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminNav, { AdminSidebar } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 세션 클레임 확인 (추가 네트워크 요청 없이 JWT에서 직접 읽음)
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    redirect("/auth/login");
  }

  // is_admin 플래그 확인
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", data.claims.sub)
    .single();

  // 관리자가 아니면 홈으로 리다이렉트 (404 노출 방지)
  if (!profile?.is_admin) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* 어드민 헤더 + 모바일 수평 탭 (클라이언트 컴포넌트) */}
      <AdminNav />

      {/* 데스크톱: 사이드바 + 메인 2컬럼 레이아웃 */}
      <div className="flex flex-1">
        {/* 데스크톱 사이드바 (lg 이상에서만 표시) */}
        <AdminSidebar />

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 overflow-x-hidden p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
