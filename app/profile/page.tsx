import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CalendarDays, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EventCard } from "@/components/common/EventCard";
import { EmptyState } from "@/components/common/EmptyState";
import { LogoutButton } from "@/components/logout-button";
import { dummyCurrentUser, dummyEvents } from "@/lib/dummy-data";

// 세션 쿠키(동적 데이터) 접근으로 정적 프리렌더 불가
export const dynamic = "force-dynamic";

/**
 * 프로필 페이지
 * - 아바타 + 이름 + 이메일 + 가입일
 * - 내가 만든 이벤트 목록
 * - 내가 참여 중인 이벤트 목록
 */
export default async function ProfilePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/auth/login");
  }

  const user = dummyCurrentUser;

  /** 내가 만든 이벤트 (더미: 주최자 이름으로 필터) */
  const myEvents = dummyEvents.filter((e) => e.ownerName === user.name);

  /** 내가 참여 중인 이벤트 (더미: 주최자 제외, 최대 3개) */
  const joinedEvents = dummyEvents
    .filter((e) => e.ownerName !== user.name)
    .slice(0, 3);

  /** 이름 이니셜 (최대 2자) */
  const initials = user.name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /** 가입일 포맷 */
  const joinedDate = new Date(user.joinedAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 pb-4">
      {/* ── 프로필 섹션 ── */}
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
            <AvatarFallback className="text-base font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <p className="text-base font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              <span>{joinedDate} 가입</span>
            </div>
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <LogoutButton />
      </section>

      <Separator />

      {/* ── 내가 만든 이벤트 ── */}
      <section className="space-y-3 px-4">
        <h2 className="text-base font-semibold">
          내가 만든 이벤트
          <span className="ml-2 text-sm font-normal text-muted-foreground">
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

      {/* ── 내가 참여 중인 이벤트 ── */}
      <section className="space-y-3 px-4">
        <h2 className="text-base font-semibold">
          참여 중인 이벤트
          <span className="ml-2 text-sm font-normal text-muted-foreground">
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
