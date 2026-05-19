import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// 세션 쿠키(동적 데이터) 접근으로 정적 프리렌더 불가
export const dynamic = "force-dynamic";

/** 이벤트 수정 페이지 - 인증 필요 (Owner 전용) */
export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  void params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold">이벤트 수정</h1>
      <p className="mt-4 text-muted-foreground">이벤트 수정 폼 (준비 중)</p>
    </div>
  );
}
