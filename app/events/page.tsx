/**
 * 이벤트 목록 페이지 (Server Component)
 * - URL searchParams의 q(검색어), status(상태 필터)를 받아 Supabase에서 조회
 * - is_public = true인 이벤트만 표시
 * - 검색/필터 UI는 EventsFilter Client Component로 분리
 */

import Link from "next/link";
import { Suspense } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/common/EventCard";
import { EmptyState } from "@/components/common/EmptyState";
import { EventsFilter } from "@/components/events/EventsFilter";
import { createClient } from "@/lib/supabase/server";
import type { EventCardData } from "@/components/common/EventCard";

/** 상태 필터 타입 */
type StatusFilter = "all" | "upcoming" | "past";

interface EventsPageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

/**
 * 이벤트 목록을 Supabase에서 조회합니다.
 * is_public = true인 이벤트 + owner 프로필 + 멤버 집계를 함께 반환
 */
async function fetchPublicEvents(
  query: string,
  status: StatusFilter,
): Promise<EventCardData[]> {
  const supabase = await createClient();

  // 기본 쿼리: 공개 이벤트 + owner 프로필 join
  let dbQuery = supabase
    .from("events")
    .select(
      `
      *,
      owner:profiles!events_owner_id_fkey(id, full_name, avatar_url),
      event_members(rsvp_status)
    `,
    )
    .eq("is_public", true)
    .order("starts_at", { ascending: true });

  // 검색어 필터 (제목 또는 장소)
  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,location.ilike.%${query}%`);
  }

  const { data: events, error } = await dbQuery;

  if (error) {
    console.error("[fetchPublicEvents] 이벤트 조회 실패:", error);
    return [];
  }

  if (!events) return [];

  // 현재 시각 기준 is_past 계산 및 rsvp_counts 집계
  const now = new Date();

  return events
    .map((event) => {
      const startsAt = new Date(event.starts_at);
      const isPast = new Date(startsAt.getTime() + 24 * 60 * 60 * 1000) < now;

      const members = event.event_members ?? [];
      const rsvpCounts = {
        attending: members.filter(
          (m: { rsvp_status: string }) => m.rsvp_status === "attending",
        ).length,
        absent: members.filter(
          (m: { rsvp_status: string }) => m.rsvp_status === "absent",
        ).length,
        pending: members.filter(
          (m: { rsvp_status: string }) => m.rsvp_status === "pending",
        ).length,
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { event_members: _em, ...eventData } = event;

      return {
        ...eventData,
        owner: event.owner ?? { id: "", full_name: null, avatar_url: null },
        member_count: members.length,
        rsvp_counts: rsvpCounts,
        is_past: isPast,
      } as EventCardData;
    })
    .filter((event) => {
      // 상태 필터 적용
      if (status === "upcoming") return !event.is_past;
      if (status === "past") return event.is_past;
      return true;
    });
}

/**
 * 이벤트 목록 페이지
 * - 공개 이벤트 목록 Server-side 조회
 * - EventsFilter로 검색/필터 UI 분리
 */
export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const status: StatusFilter =
    params.status === "upcoming" || params.status === "past"
      ? params.status
      : "all";

  const events = await fetchPublicEvents(query, status);

  return (
    <div className="space-y-4 px-4 py-6">
      {/* 헤더 행 */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold">이벤트</h1>
        <Button asChild size="sm">
          <Link href="/events/new">
            <PlusCircle className="mr-1.5 h-4 w-4" />
            이벤트 만들기
          </Link>
        </Button>
      </div>

      {/* 검색 및 필터 — Client Component */}
      <Suspense
        fallback={<div className="bg-muted h-20 animate-pulse rounded-lg" />}
      >
        <EventsFilter currentQuery={query} currentStatus={status} />
      </Suspense>

      {/* 이벤트 그리드 / 빈 상태 */}
      {events.length > 0 ? (
        <>
          <p className="text-muted-foreground text-xs">
            {events.length}개의 이벤트
          </p>
          <div className="flex flex-col gap-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={PlusCircle}
          title="이벤트를 찾을 수 없어요"
          description={
            query
              ? `"${query}"에 해당하는 이벤트가 없습니다.`
              : "해당 조건의 이벤트가 없습니다."
          }
          actionLabel="이벤트 만들기"
          actionHref="/events/new"
        />
      )}
    </div>
  );
}
