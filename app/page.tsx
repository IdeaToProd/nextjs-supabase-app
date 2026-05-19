/**
 * 홈 페이지 (Server Component)
 * - 히어로 섹션: 서비스 소개 + CTA
 * - 공개 이벤트 그리드 (최신 6개)
 * - 주요 기능 소개 섹션
 */

import Link from "next/link";
import { Calendar, Bell, CreditCard, Car, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/common/EventCard";
import { createClient } from "@/lib/supabase/server";
import type { EventCardData } from "@/components/common/EventCard";

/**
 * 홈에 표시할 공개 이벤트를 Supabase에서 조회합니다.
 * is_public = true인 이벤트 최신 6개 + owner 프로필 + 멤버 집계 반환
 */
async function fetchRecentPublicEvents(): Promise<EventCardData[]> {
  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from("events")
    .select(
      `
      *,
      owner:profiles!events_owner_id_fkey(id, full_name, avatar_url),
      event_members(rsvp_status)
    `,
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("[fetchRecentPublicEvents] 이벤트 조회 실패:", error);
    return [];
  }

  if (!events) return [];

  const now = new Date();

  return events.map((event) => {
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
  });
}

/**
 * 홈 페이지
 * - 히어로 섹션 + 공개 이벤트 목록(서버 조회) + 기능 소개
 */
export default async function Home() {
  const publicEvents = await fetchRecentPublicEvents();

  /** 주요 기능 소개 카드 데이터 */
  const features = [
    {
      icon: Bell,
      label: "공지사항",
      description: "멤버에게 중요한 소식을 이메일로 즉시 전달",
    },
    {
      icon: Calendar,
      label: "RSVP 관리",
      description: "참석/불참/미정 현황을 한눈에 파악",
    },
    {
      icon: CreditCard,
      label: "정산",
      description: "모임 경비를 자동으로 나눠 계산",
    },
    {
      icon: Car,
      label: "카풀",
      description: "탑승자와 운전자를 간편하게 배정",
    },
  ] as const;

  return (
    <div className="space-y-10 pb-4">
      {/* 히어로 섹션 */}
      <section className="from-primary/10 to-background bg-gradient-to-b px-4 py-12 text-center">
        <h1 className="text-foreground text-3xl font-extrabold tracking-tight">
          모이다
        </h1>
        <p className="text-muted-foreground mt-2 text-base">
          한 번의 모임을 위한, 가장 가벼운 운영 도구
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Button asChild size="lg" className="w-full max-w-xs">
            <Link href="/events/new">이벤트 시작하기</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/events">
              공개 이벤트 둘러보기
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* 공개 이벤트 그리드 */}
      {publicEvents.length > 0 && (
        <section className="px-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">공개 이벤트</h2>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/events">
                전체 보기
                <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {publicEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* 기능 소개 섹션 */}
      <section className="px-4">
        <h2 className="mb-4 text-lg font-semibold">모이다로 할 수 있는 것</h2>
        <div className="grid grid-cols-2 gap-3">
          {features.map(({ icon: Icon, label, description }) => (
            <div
              key={label}
              className="bg-card dark:bg-card flex flex-col gap-2 rounded-xl border p-4"
            >
              {/* 기능 아이콘 */}
              <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
                <Icon className="text-primary h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
