/**
 * 이벤트 상세 페이지 (Server Component)
 * - params.id로 이벤트 조회 (없으면 notFound)
 * - event + owner + event_members + invite_token 조회
 * - EventWithDetails 타입으로 조합
 * - 4섹션 탭: 공지사항 / 참여자 / 정산 / 카풀
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Users,
  Bell,
  ArrowLeft,
  Plus,
  Car,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { RsvpBadge } from "@/components/common/RsvpBadge";
import { MemberAvatar } from "@/components/common/MemberAvatar";
import { EmptyState } from "@/components/common/EmptyState";
import { CopyInviteLinkButton } from "@/components/events/CopyInviteLinkButton";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { EventWithDetails } from "@/lib/types/events";

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

/** 금액을 한국 원화 포맷으로 변환 */
function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 이벤트 상세 데이터를 Supabase에서 조회합니다.
 * event + owner + event_members + invite_token + notices + settlements + carpools
 */
async function fetchEventDetail(id: string): Promise<EventWithDetails | null> {
  const supabase = await createClient();

  // 이벤트 + owner 프로필 + 멤버 목록 조회
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(
      `
      *,
      owner:profiles!events_owner_id_fkey(id, full_name, avatar_url),
      event_members(id, user_id, role, rsvp_status)
    `,
    )
    .eq("id", id)
    .single();

  if (eventError || !event) {
    return null;
  }

  // 현재 로그인 사용자 정보
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 초대 토큰 조회 (활성화된 토큰만)
  const { data: tokenData } = await supabase
    .from("invite_tokens")
    .select("token")
    .eq("event_id", id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  // RSVP 집계
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

  // is_past 계산 (starts_at + 24h < now)
  const startsAt = new Date(event.starts_at);
  const isPast =
    new Date(startsAt.getTime() + 24 * 60 * 60 * 1000) < new Date();

  // 현재 사용자의 역할 및 RSVP 상태
  let userRole: EventWithDetails["user_role"] = null;
  let userRsvp: EventWithDetails["user_rsvp"] = null;

  if (user) {
    const currentMember = members.find(
      (m: { user_id: string; role: string; rsvp_status: string }) =>
        m.user_id === user.id,
    );
    if (currentMember) {
      userRole = currentMember.role as EventWithDetails["user_role"];
      userRsvp = currentMember.rsvp_status;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { event_members: _em, ...eventData } = event;

  return {
    ...eventData,
    owner: event.owner ?? { id: "", full_name: null, avatar_url: null },
    member_count: members.length,
    rsvp_counts: rsvpCounts,
    is_past: isPast,
    user_role: userRole,
    user_rsvp: userRsvp,
    invite_token: tokenData?.token ?? null,
  } as EventWithDetails;
}

/**
 * 이벤트 상세 페이지
 * - 이벤트 기본 정보 + 초대 링크 복사 버튼
 * - 4섹션 탭 (공지사항 / 참여자 / 정산 / 카풀)
 */
export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const event = await fetchEventDetail(id);

  if (!event) {
    notFound();
  }

  // 비공개 이벤트 접근 제어: 멤버가 아닌 경우 제한 메시지 표시
  // (404 노출 금지 — 이벤트 존재 여부를 외부에 노출하지 않기 위함)
  if (!event.is_public && event.user_role === null) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-20 text-center">
        <p className="text-muted-foreground text-sm">
          이 이벤트는 초대 링크로만 접근할 수 있습니다.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/events">이벤트 목록으로</Link>
        </Button>
      </div>
    );
  }

  // Owner 또는 Co-host 여부 (관리 기능 표시 여부)
  const isOwnerOrCoHost =
    event.user_role === "owner" || event.user_role === "co_host";

  // 공지사항 조회
  const { data: notices } = await supabase
    .from("notices")
    .select("*")
    .eq("event_id", id)
    .order("created_at", { ascending: false });

  // 참여자 목록 (프로필 join)
  const { data: membersWithProfile } = await supabase
    .from("event_members")
    .select(
      `
      *,
      profile:profiles(id, full_name, avatar_url)
    `,
    )
    .eq("event_id", id)
    .order("joined_at", { ascending: true });

  // 정산 목록
  const { data: settlements } = await supabase
    .from("settlements")
    .select("*")
    .eq("event_id", id)
    .order("created_at", { ascending: false });

  // 카풀 목록 (driver 프로필 + 탑승자 join)
  const { data: carpools } = await supabase
    .from("carpools")
    .select(
      `
      *,
      driver:profiles!carpools_driver_id_fkey(id, full_name, avatar_url),
      carpool_passengers(id, user_id, profile:profiles(full_name))
    `,
    )
    .eq("event_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-0">
      {/* 뒤로 가기 */}
      <div className="px-4 pt-4">
        <Link
          href="/events"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          이벤트 목록
        </Link>
      </div>

      {/* 이벤트 기본 정보 */}
      <section className="space-y-3 px-4 py-4">
        {/* 상태 뱃지 */}
        <div className="flex items-center gap-2">
          <Badge variant={event.is_past ? "secondary" : "default"}>
            {event.is_past ? "지난 이벤트" : "예정"}
          </Badge>
          {!event.is_public && (
            <Badge variant="outline" className="text-xs">
              비공개
            </Badge>
          )}
        </div>

        {/* 제목 */}
        <h1 className="text-xl leading-snug font-bold">{event.title}</h1>

        {/* 메타 정보 */}
        <div className="space-y-1.5">
          <div className="text-muted-foreground flex items-start gap-2 text-sm">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{formatDate(event.starts_at)}</span>
          </div>
          {event.location && (
            <div className="text-muted-foreground flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{event.location}</span>
            </div>
          )}
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 shrink-0" />
            <span>
              {event.member_count}명 참여
              {event.capacity ? ` / 최대 ${event.capacity}명` : ""}
            </span>
          </div>
        </div>

        {/* 설명 */}
        {event.description && (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {event.description}
          </p>
        )}

        {/* 버튼 행 */}
        <div className="flex gap-2 pt-1">
          {/* 초대 링크 복사 — Client Component */}
          {event.invite_token && (
            <CopyInviteLinkButton
              token={event.invite_token}
              className="flex-1"
            />
          )}

          {/* 이벤트 수정 (주최자 전용) */}
          {isOwnerOrCoHost && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/events/${event.id}/edit`}>수정</Link>
            </Button>
          )}
        </div>
      </section>

      <Separator />

      {/* 4섹션 탭 */}
      <Tabs defaultValue="notices" className="w-full">
        {/* 탭 목록 */}
        <div className="overflow-x-auto border-b">
          <TabsList
            variant="line"
            className="mx-4 w-auto gap-0 rounded-none bg-transparent"
          >
            <TabsTrigger value="notices" className="gap-1.5 px-3 text-xs">
              <Bell className="h-3.5 w-3.5" />
              공지사항
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-1.5 px-3 text-xs">
              <Users className="h-3.5 w-3.5" />
              참여자
            </TabsTrigger>
            <TabsTrigger value="settlements" className="gap-1.5 px-3 text-xs">
              <CreditCard className="h-3.5 w-3.5" />
              정산
            </TabsTrigger>
            <TabsTrigger value="carpools" className="gap-1.5 px-3 text-xs">
              <Car className="h-3.5 w-3.5" />
              카풀
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 공지사항 탭 */}
        <TabsContent value="notices" className="space-y-3 px-4 py-4">
          {isOwnerOrCoHost && (
            <Button size="sm" className="w-full">
              <Plus className="mr-1.5 h-4 w-4" />
              공지 작성
            </Button>
          )}

          {notices && notices.length > 0 ? (
            <div className="space-y-3">
              {notices.map((notice) => (
                <Card key={notice.id}>
                  <CardHeader className="pt-4 pb-2">
                    <CardTitle className="text-sm">{notice.title}</CardTitle>
                    <p className="text-muted-foreground text-xs">
                      {new Date(notice.created_at).toLocaleDateString("ko-KR")}
                    </p>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">
                      {notice.body}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Bell}
              title="공지사항이 없어요"
              description="새로운 공지를 작성해 멤버에게 알려보세요."
            />
          )}
        </TabsContent>

        {/* 참여자 탭 */}
        <TabsContent value="members" className="space-y-4 px-4 py-4">
          {/* RSVP 요약 카드 */}
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: "참석",
                count: event.rsvp_counts.attending,
                color: "text-emerald-600 dark:text-emerald-400",
              },
              {
                label: "불참",
                count: event.rsvp_counts.absent,
                color: "text-red-500 dark:text-red-400",
              },
              {
                label: "미정",
                count: event.rsvp_counts.pending,
                color: "text-muted-foreground",
              },
            ].map(({ label, count, color }) => (
              <Card key={label} className="text-center">
                <CardContent className="py-3">
                  <p className={cn("text-xl font-bold", color)}>{count}</p>
                  <p className="text-muted-foreground text-xs">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 본인 RSVP 변경 버튼 (멤버인 경우) */}
          {event.user_role && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs">
                참석으로 변경
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs">
                불참으로 변경
              </Button>
            </div>
          )}

          {/* 멤버 테이블 */}
          {membersWithProfile && membersWithProfile.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">이름</TableHead>
                  <TableHead className="text-xs">역할</TableHead>
                  <TableHead className="text-xs">RSVP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membersWithProfile.map((member) => {
                  const profile = member.profile as {
                    full_name: string | null;
                    avatar_url: string | null;
                  } | null;
                  const displayName = profile?.full_name ?? "알 수 없음";
                  return (
                    <TableRow key={member.id}>
                      <TableCell className="py-2">
                        <MemberAvatar
                          name={displayName}
                          avatarUrl={profile?.avatar_url}
                          size="sm"
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground py-2 text-xs">
                        {member.role === "owner"
                          ? "주최자"
                          : member.role === "co_host"
                            ? "공동주최"
                            : "참여자"}
                      </TableCell>
                      <TableCell className="py-2">
                        <RsvpBadge rsvp={member.rsvp_status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={Users}
              title="참여자가 없어요"
              description="초대 링크를 공유해 멤버를 초대해보세요."
            />
          )}
        </TabsContent>

        {/* 정산 탭 */}
        <TabsContent value="settlements" className="space-y-3 px-4 py-4">
          {isOwnerOrCoHost && (
            <Button size="sm" className="w-full">
              <Plus className="mr-1.5 h-4 w-4" />
              정산 만들기
            </Button>
          )}

          {settlements && settlements.length > 0 ? (
            <div className="space-y-3">
              {settlements.map((settlement) => (
                <Card key={settlement.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          {settlement.title}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {settlement.snapshot_member_count}명 기준 ·{" "}
                          {new Date(settlement.created_at).toLocaleDateString(
                            "ko-KR",
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground text-xs">1인당</p>
                        <p className="text-primary text-base font-bold">
                          {formatCurrency(settlement.per_person_amount)}
                        </p>
                      </div>
                    </div>
                    <Separator className="my-2" />
                    <div className="text-muted-foreground flex justify-between text-xs">
                      <span>총액</span>
                      <span className="text-foreground font-medium">
                        {formatCurrency(settlement.total_amount)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CreditCard}
              title="정산 내역이 없어요"
              description="모임 비용을 입력해 쉽게 나눠보세요."
            />
          )}
        </TabsContent>

        {/* 카풀 탭 */}
        <TabsContent value="carpools" className="space-y-3 px-4 py-4">
          {isOwnerOrCoHost && (
            <Button size="sm" className="w-full">
              <Plus className="mr-1.5 h-4 w-4" />
              차량 추가
            </Button>
          )}

          {carpools && carpools.length > 0 ? (
            <div className="space-y-3">
              {carpools.map((carpool) => {
                const driver = carpool.driver as {
                  full_name: string | null;
                } | null;
                const passengers = (carpool.carpool_passengers ?? []) as Array<{
                  id: string;
                  user_id: string;
                  profile: { full_name: string | null } | null;
                }>;
                return (
                  <Card key={carpool.id}>
                    <CardContent className="space-y-2 py-4">
                      {/* 운전자 정보 */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">
                            {driver?.full_name ?? "알 수 없음"}
                          </p>
                          {carpool.departure_location && (
                            <p className="text-muted-foreground text-xs">
                              출발: {carpool.departure_location}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {passengers.length}/{carpool.seat_count}석
                        </Badge>
                      </div>

                      {/* 탑승자 목록 */}
                      {passengers.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-muted-foreground mb-1.5 text-xs">
                              탑승자
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {passengers.map((p) => (
                                <span
                                  key={p.id}
                                  className="bg-muted rounded-md border px-2 py-0.5 text-xs"
                                >
                                  {p.profile?.full_name ?? "알 수 없음"}
                                </span>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* 빈 좌석 안내 */}
                      {passengers.length < carpool.seat_count && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          빈 좌석 {carpool.seat_count - passengers.length}개
                          있음
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Car}
              title="등록된 카풀이 없어요"
              description="차량을 추가해 멤버들과 이동을 조율해보세요."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
