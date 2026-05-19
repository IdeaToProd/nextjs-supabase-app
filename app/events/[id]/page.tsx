"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Users,
  Copy,
  Check,
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
import { cn } from "@/lib/utils";

/**
 * 이벤트 상세 페이지
 * - 상단: 이벤트 기본 정보 + 초대 링크 복사
 * - 하단: 4섹션 Tabs (공지사항 / 참여자 / 정산 / 카풀)
 */
export default function EventDetailPage() {
  /** 더미 이벤트 첫 번째 사용 */
  const event = dummyEvents[0];
  const [copied, setCopied] = useState(false);

  /** 초대 링크 클립보드 복사 — HTTPS 미지원 환경 대응 포함 */
  const handleCopyInviteLink = async () => {
    const inviteUrl = `${window.location.origin}/invite/dummy-token-abc`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // HTTP 환경, 구형 브라우저 등 클립보드 API 미지원 시 폴백
      alert(`링크를 직접 복사해주세요:\n${inviteUrl}`);
    }
  };

  /** 현재 사용자는 주최자 더미 처리 */
  const isOwnerOrCoHost = true;

  return (
    <div className="space-y-0">
      {/* ── 뒤로 가기 ── */}
      <div className="px-4 pt-4">
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          이벤트 목록
        </Link>
      </div>

      {/* ── 이벤트 기본 정보 ── */}
      <section className="space-y-3 px-4 py-4">
        {/* 상태 뱃지 */}
        <div className="flex items-center gap-2">
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
        <h1 className="text-xl font-bold leading-snug">{event.title}</h1>

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

        {/* 버튼 행 */}
        <div className="flex gap-2 pt-1">
          {/* 초대 링크 복사 */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyInviteLink}
            className="flex-1"
          >
            {copied ? (
              <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="mr-1.5 h-3.5 w-3.5" />
            )}
            {copied ? "복사됨" : "초대 링크 복사"}
          </Button>

          {/* 이벤트 수정 (주최자 전용) */}
          {isOwnerOrCoHost && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/events/${event.id}/edit`}>수정</Link>
            </Button>
          )}
        </div>
      </section>

      <Separator />

      {/* ── 4섹션 탭 ── */}
      <Tabs defaultValue="notices" className="w-full">
        {/* 탭 목록: 가로 스크롤 */}
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

        {/* ── 공지사항 탭 ── */}
        <TabsContent value="notices" className="space-y-3 px-4 py-4">
          {isOwnerOrCoHost && (
            <Button size="sm" className="w-full">
              <Plus className="mr-1.5 h-4 w-4" />
              공지 작성
            </Button>
          )}

          {dummyNotices.length > 0 ? (
            <div className="space-y-3">
              {dummyNotices.map((notice) => (
                <Card key={notice.id}>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm">{notice.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {notice.authorName} ·{" "}
                      {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {notice.content}
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

        {/* ── 참여자 탭 ── */}
        <TabsContent value="members" className="space-y-4 px-4 py-4">
          {/* RSVP 요약 카드 */}
          <div className="grid grid-cols-3 gap-2">
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
                  <p className={cn("text-xl font-bold", color)}>{count}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 본인 RSVP 변경 버튼 */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 text-xs">
              참석으로 변경
            </Button>
            <Button variant="outline" size="sm" className="flex-1 text-xs">
              불참으로 변경
            </Button>
          </div>

          {/* 멤버 테이블 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">이름</TableHead>
                <TableHead className="text-xs">역할</TableHead>
                <TableHead className="text-xs">RSVP</TableHead>
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
                    {getRoleLabel(member.role)}
                  </TableCell>
                  <TableCell className="py-2">
                    <RsvpBadge rsvp={member.rsvp} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* ── 정산 탭 ── */}
        <TabsContent value="settlements" className="space-y-3 px-4 py-4">
          {isOwnerOrCoHost && (
            <Button size="sm" className="w-full">
              <Plus className="mr-1.5 h-4 w-4" />
              정산 만들기
            </Button>
          )}

          {dummySettlements.length > 0 ? (
            <div className="space-y-3">
              {dummySettlements.map((settlement) => (
                <Card key={settlement.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          {settlement.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {settlement.participantCount}명 기준 ·{" "}
                          {new Date(settlement.createdAt).toLocaleDateString(
                            "ko-KR",
                          )}
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

        {/* ── 카풀 탭 ── */}
        <TabsContent value="carpools" className="space-y-3 px-4 py-4">
          {isOwnerOrCoHost && (
            <Button size="sm" className="w-full">
              <Plus className="mr-1.5 h-4 w-4" />
              차량 추가
            </Button>
          )}

          {dummyCarpools.length > 0 ? (
            <div className="space-y-3">
              {dummyCarpools.map((carpool) => (
                <Card key={carpool.id}>
                  <CardContent className="space-y-2 py-4">
                    {/* 운전자 정보 */}
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

                    {/* 탑승자 목록 */}
                    {carpool.passengers.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <p className="mb-1.5 text-xs text-muted-foreground">
                            탑승자
                          </p>
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
                        </div>
                      </>
                    )}

                    {/* 빈 좌석 안내 */}
                    {carpool.passengers.length < carpool.seats && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        빈 좌석 {carpool.seats - carpool.passengers.length}개
                        있음
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
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
