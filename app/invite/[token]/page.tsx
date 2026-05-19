import Link from "next/link";
import { CalendarDays, MapPin, Users, LogIn, UserCheck } from "lucide-react";
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
import { dummyEvents, formatDate } from "@/lib/dummy-data";

/**
 * 초대 링크 진입 페이지
 * - 이벤트 기본 정보 미리보기
 * - 비로그인: "로그인 후 참여" 안내
 * - 정원 초과 시: "정원 초과" 표시
 */
export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  void token; // 더미 페이지이므로 토큰 사용 안 함

  /** 더미 이벤트 데이터 사용 */
  const event = dummyEvents[0];

  /**
   * 더미 상태 플래그
   * - isLoggedIn: 로그인 여부 (더미 false)
   * - isFull: 정원 초과 여부
   */
  const isLoggedIn = false;
  const isFull =
    event.maxParticipants !== null &&
    event.memberCount >= event.maxParticipants;

  return (
    <div className="space-y-6 px-4 py-10">
      {/* 상단 안내 */}
      <div className="space-y-1 text-center">
        <p className="text-sm text-muted-foreground">초대장이 도착했어요</p>
        <h1 className="text-2xl font-bold">모이다</h1>
      </div>

      {/* 이벤트 미리보기 카드 */}
      <Card>
        <CardHeader className="pb-3">
          {/* 이벤트 상태 뱃지 */}
          <div className="mb-1 flex items-center gap-2">
            <Badge
              variant={event.status === "upcoming" ? "default" : "secondary"}
            >
              {event.status === "upcoming" ? "예정" : "지난 이벤트"}
            </Badge>
            {isFull && <Badge variant="destructive">정원 초과</Badge>}
          </div>
          <CardTitle className="text-lg leading-snug">{event.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {event.description}
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className="space-y-2 pt-4">
          {/* 날짜 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span>{formatDate(event.date)}</span>
          </div>
          {/* 장소 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{event.location}</span>
          </div>
          {/* 참여 현황 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 shrink-0" />
            <span>
              현재 {event.memberCount}명 참여 중
              {event.maxParticipants && ` / 최대 ${event.maxParticipants}명`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 참여 버튼 영역 */}
      <div className="space-y-3">
        {isFull ? (
          /* 정원 초과 */
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-center">
            <p className="text-sm font-medium text-destructive">
              이 이벤트는 정원이 모두 찼습니다
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              주최자에게 문의해 주세요
            </p>
          </div>
        ) : isLoggedIn ? (
          /* 로그인 상태 → 바로 참여 */
          <Button className="w-full" size="lg">
            <UserCheck className="mr-2 h-4 w-4" />이 이벤트에 참여하기
          </Button>
        ) : (
          /* 비로그인 → 로그인 유도 */
          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                로그인하고 참여하기
              </Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              계정이 없으신가요?{" "}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-2 hover:text-foreground"
              >
                회원가입
              </Link>
            </p>
          </div>
        )}

        {/* 이벤트 상세 보기 링크 */}
        <Button asChild variant="ghost" className="w-full text-xs">
          <Link href={`/events/${event.id}`}>이벤트 상세 보기</Link>
        </Button>
      </div>
    </div>
  );
}
