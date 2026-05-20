/**
 * 어드민 홈 대시보드 (Server Component)
 * - 통계 카드 3종: 전체 회원, 전체 이벤트, 오늘 생성
 * - 최근 이벤트 5개 (생성일 최신순)
 * - 최근 가입 회원 5개 (가입일 최신순)
 * - Supabase 실제 데이터 조회
 */

import Link from "next/link";
import { Users, Calendar, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

/** is_past 계산 (starts_at + 24h < now) */
function isEventPast(startsAt: string): boolean {
  return new Date(startsAt).getTime() + 24 * 60 * 60 * 1000 < Date.now();
}

export default async function AdminPage() {
  const supabase = await createClient();

  // 오늘 자정(로컬 기준) ISO 문자열
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 통계 카운트 3종 병렬 조회
  const [
    { count: totalUsers },
    { count: totalEvents },
    { count: todayEventsCount },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStart.toISOString()),
  ]);

  // 최근 이벤트 5개 (owner 이름 + member id 목록 — 클라이언트에서 count)
  const { data: rawRecentEvents } = await supabase
    .from("events")
    .select(
      `
      id, title, starts_at,
      owner:profiles!events_owner_id_fkey(full_name),
      event_members(id)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(5);

  // 최근 가입 회원 5개 (가입일 최신순)
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email, is_admin, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // owner 타입 캐스팅
  const recentEvents = (rawRecentEvents ?? []).map((e) => ({
    ...e,
    owner: e.owner as unknown as { full_name: string | null } | null,
    memberCount: Array.isArray(e.event_members) ? e.event_members.length : 0,
  }));

  const stats = [
    {
      label: "전체 회원",
      value: totalUsers ?? 0,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "전체 이벤트",
      value: totalEvents ?? 0,
      icon: Calendar,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      label: "오늘 생성",
      value: todayEventsCount ?? 0,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">대시보드</h1>

      {/* ── 통계 카드 ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 py-5">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-lg ${bg}`}
              >
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-muted-foreground text-xs">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── 최근 이벤트 테이블 ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pt-4 pb-3">
          <CardTitle className="text-base">최근 이벤트</CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-xs">
            <Link href="/admin/events">
              전체 보기
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 text-xs">이벤트명</TableHead>
                <TableHead className="text-xs">주최자</TableHead>
                <TableHead className="text-xs">멤버</TableHead>
                <TableHead className="text-xs">상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEvents.length > 0 ? (
                recentEvents.map((event) => {
                  const past = isEventPast(event.starts_at);
                  return (
                    <TableRow key={event.id}>
                      <TableCell className="py-2 pl-6">
                        <Link
                          href={`/admin/events/${event.id}`}
                          className="line-clamp-1 text-sm font-medium hover:underline"
                        >
                          {event.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground py-2 text-xs">
                        {event.owner?.full_name ?? "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground py-2 text-xs">
                        {event.memberCount}명
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge
                          variant={past ? "secondary" : "default"}
                          className="text-xs"
                        >
                          {past ? "지난" : "예정"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-muted-foreground py-8 text-center text-sm"
                  >
                    등록된 이벤트가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── 최근 가입 회원 ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pt-4 pb-3">
          <CardTitle className="text-base">최근 가입 회원</CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-xs">
            <Link href="/admin/users">
              전체 보기
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 text-xs">이름</TableHead>
                <TableHead className="text-xs">이메일</TableHead>
                <TableHead className="text-xs">가입일</TableHead>
                <TableHead className="text-xs">관리자</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers && recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="py-2 pl-6 text-sm font-medium">
                      {user.full_name ?? "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-2 text-xs">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-2 text-xs">
                      {new Date(user.created_at).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell className="py-2">
                      {user.is_admin ? (
                        <Badge variant="default" className="text-xs">
                          관리자
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-muted-foreground py-8 text-center text-sm"
                  >
                    등록된 회원이 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
