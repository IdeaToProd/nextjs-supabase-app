/**
 * 이벤트 수정 페이지 (Server Component)
 * - params.id로 이벤트 조회
 * - owner 권한 확인 (비owner → 이벤트 상세로 리다이렉트)
 * - EventForm(edit 모드) + DeleteEventDialog 렌더링
 */

import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { EventForm } from "@/components/events/EventForm";
import { DeleteEventDialog } from "@/components/events/DeleteEventDialog";
import { createClient } from "@/lib/supabase/server";
import { getEventDependentCounts } from "@/app/actions/events";
import type { EventFormValues } from "@/lib/schemas/events";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 이벤트 수정 페이지
 * - 비로그인 시 /auth/login으로 리다이렉트
 * - 이벤트 없음 → notFound
 * - owner 아님 → 이벤트 상세로 리다이렉트
 * - EventForm(edit 모드) + DeleteEventDialog 표시
 */
export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 로그인 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 이벤트 조회
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (eventError || !event) {
    notFound();
  }

  // owner 권한 확인 (owner만 수정 가능)
  if (event.owner_id !== user.id) {
    redirect(`/events/${id}`);
  }

  // 종속 데이터 개수 조회 (삭제 다이얼로그에 표시)
  const dependentCounts = await getEventDependentCounts(id);

  // 폼 기본값 (datetime-local 형식으로 변환: "2025-12-28T18:00:00+09:00" → "2025-12-28T18:00")
  const defaultValues: Partial<EventFormValues> = {
    title: event.title,
    starts_at: event.starts_at,
    location: event.location ?? "",
    description: event.description ?? "",
    capacity: event.capacity,
    is_public: event.is_public,
  };

  return (
    <div className="space-y-4 px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link
          href={`/events/${id}`}
          className="text-muted-foreground hover:text-foreground"
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">이벤트 수정</h1>
      </div>

      <Separator />

      {/* 이벤트 수정 폼 */}
      <EventForm mode="edit" eventId={id} defaultValues={defaultValues} />

      {/* 이벤트 삭제 다이얼로그 */}
      <DeleteEventDialog
        eventId={id}
        eventTitle={event.title}
        dependentCounts={dependentCounts}
      />
    </div>
  );
}
