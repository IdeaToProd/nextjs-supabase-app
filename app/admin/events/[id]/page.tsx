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
import {
  dummyEvents,
  dummyMembers,
  dummyNotices,
  dummySettlements,
  dummyCarpools,
  formatDate,
  formatCurrency,
  getRoleLabel,
} from "@/lib/dummy-data";

/**
 * 어드민 이벤트 상세 페이지 (읽기 전용)
 * - 이벤트 기본 정보 (수정/삭제 버튼 없음)
 * - 4섹션 탭 (공지사항/참여자/정산/카풀) — 읽기 전용
 */
export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  /** id로 이벤트 조회 (없으면 첫 번째 더미 사용) */
  const event = dummyEvents.find((e) => e.id === id) ?? dummyEvents[0];

  return (
    <div className="space-y-4">
      {/* 뒤로 가기 */}
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
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
            <Badge
              variant={event.status === "upcoming" ? "default" : "secondary"}
            >
              {event.status === "upcoming" ? "예정" : "지난 이벤트"}
            </Badge>
            {!event.isPublic && (
              <Badge variant="outline" className="text-xs">
                비공개
              </Badge>
            )}
          </div>

          {/* 제목 */}
          <h1 className="text-lg font-bold leading-snug">{event.title}</h1>

          {/* 메타 정보 */}
          <div className="space-y-1.5">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 shrink-0" />
              <span>
                {event.memberCount}명 참여
                {event.maxParticipants && ` / 최대 ${event.maxParticipants}명`}
              </span>
            </div>
          </div>

          {/* 설명 */}
          {event.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {event.description}
            </p>
          )}

          {/* 주최자 */}
          <div className="text-xs text-muted-foreground">
            주최자:{" "}
            <span className="font-medium text-foreground">
              {event.ownerName}
            </span>
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
          {dummyNotices.length > 0 ? (
            dummyNotices.map((notice) => (
              <Card key={notice.id}>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm">{notice.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {notice.authorName} ·{" "}
                    {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {notice.content}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
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
                count: event.rsvpCounts.attending,
                color: "text-emerald-600 dark:text-emerald-400",
              },
              {
                label: "불참",
                count: event.rsvpCounts.absent,
                color: "text-red-500 dark:text-red-400",
              },
              {
                label: "미정",
                count: event.rsvpCounts.pending,
                color: "text-muted-foreground",
              },
            ].map(({ label, count, color }) => (
              <Card key={label} className="text-center">
                <CardContent className="py-3">
                  <p className={`text-xl font-bold ${color}`}>{count}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 멤버 테이블 */}
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
                {dummyMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="py-2">
                      <MemberAvatar
                        name={member.name}
                        avatarUrl={member.avatarUrl}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground">
                      {member.email}
                    </TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground">
                      {getRoleLabel(member.role)}
                    </TableCell>
                    <TableCell className="py-2">
                      <RsvpBadge rsvp={member.rsvp} />
                    </TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground">
                      {new Date(member.joinedAt).toLocaleDateString("ko-KR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* 정산 */}
        <TabsContent value="settlements" className="space-y-3 pt-4">
          {dummySettlements.length > 0 ? (
            dummySettlements.map((settlement) => (
              <Card key={settlement.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        {settlement.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {settlement.participantCount}명 기준
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">1인당</p>
                      <p className="text-base font-bold text-primary">
                        {formatCurrency(settlement.perPersonAmount)}
                      </p>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>총액</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(settlement.totalAmount)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              정산 내역 없음
            </p>
          )}
        </TabsContent>

        {/* 카풀 */}
        <TabsContent value="carpools" className="space-y-3 pt-4">
          {dummyCarpools.length > 0 ? (
            dummyCarpools.map((carpool) => (
              <Card key={carpool.id}>
                <CardContent className="space-y-2 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        {carpool.driverName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        출발: {carpool.departure}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {carpool.passengers.length}/{carpool.seats}석
                    </Badge>
                  </div>
                  {carpool.passengers.length > 0 && (
                    <>
                      <Separator />
                      <div className="flex flex-wrap gap-1.5">
                        {carpool.passengers.map((p) => (
                          <span
                            key={p.id}
                            className="rounded-md border bg-muted px-2 py-0.5 text-xs"
                          >
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              카풀 없음
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
