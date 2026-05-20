/**
 * 어드민 이벤트 상세 페이지 (Server Component, 읽기 전용)
 * - Supabase 실제 데이터 조회
 * - 이벤트 기본 정보 + 4섹션 탭 (공지사항/참여자/정산/카풀)
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Bell,
  CreditCard,
  Car,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RsvpBadge } from "@/components/common/RsvpBadge";
import { MemberAvatar } from "@/components/common/MemberAvatar";
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

/** 금액을 한국 원화 포맷으로 변환 */
function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

/** 역할 레이블 반환 */
function getRoleLabel(role: string): string {
  if (role === "owner") return "주최자";
  if (role === "co_host") return "공동주최";
  return "참여자";
}

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // 이벤트 + owner 프로필 + event_members 조회
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
    notFound();
  }

  // RSVP 집계
  const members = (event.event_members ?? []) as Array<{
    id: string;
    user_id: string;
    role: string;
    rsvp_status: string;
  }>;
  const rsvpCounts = {
    attending: members.filter((m) => m.rsvp_status === "attending").length,
    absent: members.filter((m) => m.rsvp_status === "absent").length,
    pending: members.filter((m) => m.rsvp_status === "pending").length,
  };

  // is_past 계산 (starts_at + 24h < now)
  const isPast =
    new Date(event.starts_at).getTime() + 24 * 60 * 60 * 1000 < Date.now();

  const ownerName =
    (event.owner as { full_name: string | null } | null)?.full_name ?? "-";

  // 공지사항 조회 (author 프로필 join)
  const { data: notices } = await supabase
    .from("notices")
    .select(`*, author:profiles!notices_author_id_fkey(full_name)`)
    .eq("event_id", id)
    .order("created_at", { ascending: false });

  // 참여자 목록 (프로필 + 이메일 join)
  const { data: membersWithProfile } = await supabase
    .from("event_members")
    .select(`*, profile:profiles(id, full_name, avatar_url, email)`)
    .eq("event_id", id)
    .order("joined_at", { ascending: true });

  // 정산 목록
  const { data: settlements } = await supabase
    .from("settlements")
    .select("*")
    .eq("event_id", id)
    .order("created_at", { ascending: false });

  // 카풀 목록 (driver + 탑승자 join)
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
    <div className="space-y-4">
      {/* 뒤로 가기 */}
      <Link
        href="/admin/events"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        이벤트 목록
      </Link>

      {/* 읽기 전용 안내 */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
        관리자 읽기 전용 뷰입니다. 수정/삭제 기능은 이벤트 주최자만 이용할 수
        있습니다.
      </div>

      {/* 이벤트 기본 정보 */}
      <Card>
        <CardContent className="space-y-3 pt-4">
          {/* 상태 뱃지 */}
          <div className="flex gap-2">
            <Badge variant={isPast ? "secondary" : "default"}>
              {isPast ? "지난 이벤트" : "예정"}
            </Badge>
            {!event.is_public && (
              <Badge variant="outline" className="text-xs">
                비공개
              </Badge>
            )}
          </div>

          {/* 제목 */}
          <h1 className="text-lg leading-snug font-bold">{event.title}</h1>

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
                {members.length}명 참여
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

          {/* 주최자 */}
          <div className="text-muted-foreground text-xs">
            주최자:{" "}
            <span className="text-foreground font-medium">{ownerName}</span>
          </div>
        </CardContent>
      </Card>

      {/* 4섹션 탭 (읽기 전용) */}
      <Tabs defaultValue="notices">
        <div className="overflow-x-auto border-b">
          <TabsList
            variant="line"
            className="w-auto gap-0 rounded-none bg-transparent"
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

        {/* 공지사항 */}
        <TabsContent value="notices" className="space-y-3 pt-4">
          {notices && notices.length > 0 ? (
            notices.map((notice) => {
              const author = notice.author as {
                full_name: string | null;
              } | null;
              return (
                <Card key={notice.id}>
                  <CardHeader className="pt-4 pb-2">
                    <CardTitle className="text-sm">{notice.title}</CardTitle>
                    <p className="text-muted-foreground text-xs">
                      {author?.full_name ?? "-"} ·{" "}
                      {new Date(notice.created_at).toLocaleDateString("ko-KR")}
                    </p>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {notice.body}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p className="text-muted-foreground py-8 text-center text-sm">
              공지사항 없음
            </p>
          )}
        </TabsContent>

        {/* 참여자 */}
        <TabsContent value="members" className="pt-4">
          {/* RSVP 요약 */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            {[
              {
                label: "참석",
                count: rsvpCounts.attending,
                color: "text-emerald-600 dark:text-emerald-400",
              },
              {
                label: "불참",
                count: rsvpCounts.absent,
                color: "text-red-500 dark:text-red-400",
              },
              {
                label: "미정",
                count: rsvpCounts.pending,
                color: "text-muted-foreground",
              },
            ].map(({ label, count, color }) => (
              <Card key={label} className="text-center">
                <CardContent className="py-3">
                  <p className={`text-xl font-bold ${color}`}>{count}</p>
                  <p className="text-muted-foreground text-xs">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 멤버 테이블 */}
          {membersWithProfile && membersWithProfile.length > 0 ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">이름</TableHead>
                    <TableHead className="text-xs">이메일</TableHead>
                    <TableHead className="text-xs">역할</TableHead>
                    <TableHead className="text-xs">RSVP</TableHead>
                    <TableHead className="text-xs">가입일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membersWithProfile.map((member) => {
                    const profile = member.profile as {
                      full_name: string | null;
                      avatar_url: string | null;
                      email: string | null;
                    } | null;
                    return (
                      <TableRow key={member.id}>
                        <TableCell className="py-2">
                          <MemberAvatar
                            name={profile?.full_name ?? "알 수 없음"}
                            avatarUrl={profile?.avatar_url}
                            size="sm"
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground py-2 text-xs">
                          {profile?.email ?? "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground py-2 text-xs">
                          {getRoleLabel(member.role)}
                        </TableCell>
                        <TableCell className="py-2">
                          <RsvpBadge rsvp={member.rsvp_status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground py-2 text-xs">
                          {new Date(member.joined_at).toLocaleDateString(
                            "ko-KR",
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center text-sm">
              참여자 없음
            </p>
          )}
        </TabsContent>

        {/* 정산 */}
        <TabsContent value="settlements" className="space-y-3 pt-4">
          {settlements && settlements.length > 0 ? (
            settlements.map((settlement) => (
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
            ))
          ) : (
            <p className="text-muted-foreground py-8 text-center text-sm">
              정산 내역 없음
            </p>
          )}
        </TabsContent>

        {/* 카풀 */}
        <TabsContent value="carpools" className="space-y-3 pt-4">
          {carpools && carpools.length > 0 ? (
            carpools.map((carpool) => {
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
                    {passengers.length > 0 && (
                      <>
                        <Separator />
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
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p className="text-muted-foreground py-8 text-center text-sm">
              카풀 없음
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
