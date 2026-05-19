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
import { dummyEvents, dummyUsers } from "@/lib/dummy-data";

/**
 * 어드민 홈 대시보드
 * - 통계 카드 3종 (전체 회원, 전체 이벤트, 오늘 생성)
 * - 최근 이벤트 목록 테이블 (5개)
 * - 최근 가입 회원 목록 (5개)
 */
export default function AdminPage() {
  /** 오늘 날짜 (더미: 2025-12-28 기준) */
  const todayEventsCount = 1;

  /** 최근 이벤트 5개 */
  const recentEvents = dummyEvents.slice(0, 5);

  /** 최근 가입 회원 5개 (가입일 최신순 정렬) */
  const recentUsers = [...dummyUsers]
    .sort(
      (a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime(),
    )
    .slice(0, 5);

  /** 통계 카드 데이터 */
  const stats = [
    {
      label: "전체 회원",
      value: dummyUsers.length,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "전체 이벤트",
      value: dummyEvents.length,
      icon: Calendar,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      label: "오늘 생성",
      value: todayEventsCount,
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
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── 최근 이벤트 테이블 ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4">
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
              {recentEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="py-2 pl-6">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="line-clamp-1 text-sm font-medium hover:underline"
                    >
                      {event.title}
                    </Link>
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">
                    {event.ownerName}
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">
                    {event.memberCount}명
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge
                      variant={
                        event.status === "upcoming" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {event.status === "upcoming" ? "예정" : "지난"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── 최근 가입 회원 ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4">
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
              {recentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="py-2 pl-6 text-sm font-medium">
                    {user.name}
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">
                    {new Date(user.joinedAt).toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell className="py-2">
                    {user.isAdmin ? (
                      <Badge variant="default" className="text-xs">
                        관리자
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
