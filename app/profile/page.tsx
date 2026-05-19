/**
 * 프로필 페이지 (Server Component)
 * - 아바타 + 이름 + 이메일 + 가입일
 * - 내가 만든 이벤트 목록
 * - 내가 참여 중인 이벤트 목록
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CalendarDays, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EventCard } from "@/components/common/EventCard";
import { EmptyState } from "@/components/common/EmptyState";
import { LogoutButton } from "@/components/logout-button";
import type { EventCardData } from "@/components/common/EventCard";

// 세션 쿠키(동적 데이터) 접근으로 정적 프리렌더 불가
export const dynamic = "force-dynamic";

/**
 * 프로필 페이지
 * - 로그인한 사용자의 프로필 정보 및 이벤트 목록 표시
 */
export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) {
    redirect("/auth/login");
  }

  // 현재 사용자 정보 조회
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 프로필 정보 조회
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 내가 만든 이벤트 조회
  const { data: myEventsRaw } = await supabase
    .from("events")
    .select(
      `
      *,
      owner:profiles!events_owner_id_fkey(id, full_name, avatar_url),
      event_members(rsvp_status)
    `,
    )
    .eq("owner_id", user.id)
    .order("starts_at", { ascending: false });

  // 내가 참여 중인 이벤트 조회 (owner 제외)
  const { data: memberEventIds } = await supabase
    .from("event_members")
    .select("event_id")
    .eq("user_id", user.id)
    .neq("role", "owner");

  const joinedEventIdList = (memberEventIds ?? []).map((m) => m.event_id);

  const { data: joinedEventsRaw } =
    joinedEventIdList.length > 0
      ? await supabase
          .from("events")
          .select(
            `
          *,
          owner:profiles!events_owner_id_fkey(id, full_name, avatar_url),
          event_members(rsvp_status)
        `,
          )
          .in("id", joinedEventIdList)
          .order("starts_at", { ascending: false })
          .limit(10)
      : { data: [] };

  /**
   * 이벤트 raw 데이터를 EventCardData로 변환
   */
  function toEventCardData(events: typeof myEventsRaw): EventCardData[] {
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

  const myEvents = toEventCardData(myEventsRaw);
  const joinedEvents = toEventCardData(joinedEventsRaw);

  // 표시할 이름: full_name > email 앞부분
  const displayName =
    profile?.full_name ?? user.email?.split("@")[0] ?? "사용자";

  /** 이름 이니셜 (최대 2자) */
  const initials = displayName
    .split(" ")
    .map((s: string) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /** 가입일 포맷 */
  const joinedDate = new Date(user.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 pb-4">
      {/* 프로필 섹션 */}
      <section className="space-y-4 px-4 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">내 프로필</h1>
          <Button variant="ghost" size="icon" aria-label="프로필 설정">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* 아바타 + 정보 */}
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            {profile?.avatar_url && (
              <AvatarImage
                src={profile.avatar_url}
                alt={`${displayName}의 프로필`}
              />
            )}
            <AvatarFallback className="text-base font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <p className="text-base font-semibold">{displayName}</p>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <CalendarDays className="h-3 w-3" />
              <span>{joinedDate} 가입</span>
            </div>
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <LogoutButton />
      </section>

      <Separator />

      {/* 내가 만든 이벤트 */}
      <section className="space-y-3 px-4">
        <h2 className="text-base font-semibold">
          내가 만든 이벤트
          <span className="text-muted-foreground ml-2 text-sm font-normal">
            {myEvents.length}개
          </span>
        </h2>

        {myEvents.length > 0 ? (
          <div className="flex flex-col gap-2">
            {myEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="아직 만든 이벤트가 없어요"
            description="첫 모임을 만들어보세요."
            actionLabel="이벤트 만들기"
            actionHref="/events/new"
          />
        )}
      </section>

      <Separator />

      {/* 내가 참여 중인 이벤트 */}
      <section className="space-y-3 px-4">
        <h2 className="text-base font-semibold">
          참여 중인 이벤트
          <span className="text-muted-foreground ml-2 text-sm font-normal">
            {joinedEvents.length}개
          </span>
        </h2>

        {joinedEvents.length > 0 ? (
          <div className="flex flex-col gap-2">
            {joinedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="참여 중인 이벤트가 없어요"
            description="초대 링크로 모임에 참여해보세요."
          />
        )}
      </section>
    </div>
  );
}
