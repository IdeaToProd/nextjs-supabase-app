import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// 세션 쿠키(동적 데이터) 접근으로 정적 프리렌더 불가
export const dynamic = "force-dynamic";

/** 이벤트 생성 페이지 - 인증 필요 */
export default async function NewEventPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold">이벤트 생성</h1>
      <p className="mt-4 text-muted-foreground">이벤트 생성 폼 (준비 중)</p>
    </div>
  );
}
