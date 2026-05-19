/**
 * 이벤트 생성 페이지 (Server Component)
 * 로그인 확인 후 EventForm을 렌더링
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { EventForm } from "@/components/events/EventForm";
import { createClient } from "@/lib/supabase/server";

/**
 * 이벤트 생성 페이지
 * - 비로그인 시 /auth/login으로 리다이렉트
 * - 로그인 시 이벤트 생성 폼 표시
 */
export default async function NewEventPage() {
  const supabase = await createClient();

  // 로그인 확인 (비로그인 시 리다이렉트)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-4 px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link
          href="/events"
          className="text-muted-foreground hover:text-foreground"
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">이벤트 만들기</h1>
      </div>

      <Separator />

      {/* 이벤트 생성 폼 */}
      <EventForm mode="create" />
    </div>
  );
}
