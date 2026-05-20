/**
 * 초대 링크 진입 페이지 (실데이터 연동)
 * - 토큰으로 이벤트 조회
 * - 비로그인: 이벤트 기본 정보 + 로그인 버튼
 * - 이미 멤버: 이벤트 상세로 redirect
 * - 정원 초과: 차단 메시지
 * - 로그인 + 참여 가능: JoinByTokenButton
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, MapPin, Users, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { JoinByTokenButton } from "@/components/invite/JoinByTokenButton";
import { createClient } from "@/lib/supabase/server";

/** 날짜를 한국어로 포맷 */
function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Seoul",
  }).format(new Date(isoString));
}

/**
 * 초대 링크 진입 페이지
 */
export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  // 초대 토큰으로 이벤트 조회 (is_active=true인 토큰만)
  const { data: tokenData } = await supabase
    .from("invite_tokens")
    .select(
      `
      event_id,
      events(id, title, description, starts_at, location, capacity, is_public)
    `,
    )
    .eq("token", token)
    .eq("is_active", true)
    .single();

  // 유효하지 않은 토큰: 안내 메시지 표시
  if (!tokenData) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-20 text-center">
        <h1 className="text-xl font-bold">유효하지 않은 초대 링크</h1>
        <p className="text-muted-foreground text-sm">
          초대 링크가 만료되었거나 존재하지 않습니다.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/">홈으로 돌아가기</Link>
        </Button>
      </div>
    );
  }

  // 이벤트 데이터 추출
  const eventRaw = Array.isArray(tokenData.events)
    ? tokenData.events[0]
    : tokenData.events;

  if (!eventRaw) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-20 text-center">
        <h1 className="text-xl font-bold">이벤트를 찾을 수 없습니다</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/">홈으로 돌아가기</Link>
        </Button>
      </div>
    );
  }

  const event = eventRaw as {
    id: string;
    title: string;
    description: string | null;
    starts_at: string;
    location: string | null;
    capacity: number | null;
    is_public: boolean;
  };
  const eventId = tokenData.event_id;

  // 현재 로그인 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 이미 멤버인지 확인 (로그인한 경우만)
  let isMember = false;
  if (user) {
    const { data: memberData } = await supabase
      .from("event_members")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .maybeSingle();

    isMember = !!memberData;
  }

  // 이미 멤버인 경우 이벤트 상세로 redirect
  if (isMember) {
    redirect(`/events/${eventId}`);
  }

  // 정원 초과 여부 계산
  let isFull = false;
  if (event.capacity != null) {
    const { count: attendingCount } = await supabase
      .from("event_members")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("rsvp_status", "attending");

    isFull = attendingCount !== null && attendingCount >= event.capacity;
  }

  // 현재 참여자 수 조회
  const { count: memberCount } = await supabase
    .from("event_members")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  // 이벤트 예정/지난 여부 계산 (starts_at + 24h < now)
  const startsAt = new Date(event.starts_at);
  const isPast =
    new Date(startsAt.getTime() + 24 * 60 * 60 * 1000) < new Date();

  return (
    <div className="space-y-6 px-4 py-10">
      {/* 상단 안내 */}
      <div className="space-y-1 text-center">
        <p className="text-muted-foreground text-sm">초대장이 도착했어요</p>
        <h1 className="text-2xl font-bold">모이다</h1>
      </div>

      {/* 이벤트 미리보기 카드 */}
      <Card>
        <CardHeader className="pb-3">
          {/* 이벤트 상태 뱃지 */}
          <div className="mb-1 flex items-center gap-2">
            <Badge variant={isPast ? "secondary" : "default"}>
              {isPast ? "지난 이벤트" : "예정"}
            </Badge>
            {isFull && <Badge variant="destructive">정원 초과</Badge>}
          </div>
          <CardTitle className="text-lg leading-snug">{event.title}</CardTitle>
          {event.description && (
            <CardDescription className="line-clamp-2">
              {event.description}
            </CardDescription>
          )}
        </CardHeader>

        <Separator />

        <CardContent className="space-y-2 pt-4">
          {/* 날짜 */}
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span>{formatDate(event.starts_at)}</span>
          </div>
          {/* 장소 */}
          {event.location && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{event.location}</span>
            </div>
          )}
          {/* 참여 현황 */}
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 shrink-0" />
            <span>
              현재 {memberCount ?? 0}명 참여 중
              {event.capacity && ` / 최대 ${event.capacity}명`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 참여 버튼 영역 */}
      <div className="space-y-3">
        {isFull ? (
          /* 정원 초과 */
          <div className="border-destructive/30 bg-destructive/5 rounded-lg border px-4 py-3 text-center">
            <p className="text-destructive text-sm font-medium">
              이 이벤트는 정원이 모두 찼습니다
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              주최자에게 문의해 주세요
            </p>
          </div>
        ) : user ? (
          /* 로그인 상태 → JoinByTokenButton */
          <JoinByTokenButton token={token} />
        ) : (
          /* 비로그인 → 로그인 유도 (next 파라미터 포함) */
          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href={`/auth/login?next=/invite/${token}`}>
                <LogIn className="mr-2 h-4 w-4" />
                로그인하고 참여하기
              </Link>
            </Button>
            <p className="text-muted-foreground text-center text-xs">
              계정이 없으신가요?{" "}
              <Link
                href="/auth/sign-up"
                className="hover:text-foreground underline underline-offset-2"
              >
                회원가입
              </Link>
            </p>
          </div>
        )}

        {/* 이벤트 상세 보기 링크 */}
        <Button asChild variant="ghost" className="w-full text-xs">
          <Link href={`/events/${eventId}`}>이벤트 상세 보기</Link>
        </Button>
      </div>
    </div>
  );
}
