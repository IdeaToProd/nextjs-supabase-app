import Link from "next/link";
import { MapPin, Users, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Event } from "@/lib/dummy-data";

interface EventCardProps {
  event: Event;
  className?: string;
}

/** 날짜 블록용 월/일 파싱 */
function parseDateParts(isoString: string) {
  const d = new Date(isoString);
  const month = d.toLocaleString("ko-KR", {
    month: "short",
    timeZone: "Asia/Seoul",
  });
  const day = d
    .toLocaleString("ko-KR", { day: "numeric", timeZone: "Asia/Seoul" })
    .replace("일", "");
  return { month, day };
}

/**
 * 이벤트 카드 컴포넌트 — 가로형 리스트 레이아웃
 * 왼쪽: 날짜 블록 / 오른쪽: 제목·장소·멤버·RSVP
 */
export function EventCard({ event, className }: EventCardProps) {
  const {
    id,
    title,
    date,
    location,
    memberCount,
    maxParticipants,
    isPublic,
    status,
    rsvpCounts,
  } = event;
  const { month, day } = parseDateParts(date);
  const isPast = status === "past";

  return (
    <Link
      href={`/events/${id}`}
      className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div
        className={cn(
          "flex items-center gap-4 rounded-xl border bg-card px-4 py-3 transition-shadow hover:shadow-md dark:hover:shadow-primary/10",
          isPast && "opacity-60",
          className,
        )}
      >
        {/* 날짜 블록 */}
        <div
          className={cn(
            "flex w-12 shrink-0 flex-col items-center justify-center rounded-lg py-2.5",
            isPast ? "bg-muted" : "bg-primary/10",
          )}
        >
          <span
            className={cn(
              "text-[10px] font-medium",
              isPast ? "text-muted-foreground" : "text-primary",
            )}
          >
            {month}
          </span>
          <span
            className={cn(
              "text-xl font-bold leading-tight",
              isPast ? "text-muted-foreground" : "text-primary",
            )}
          >
            {day}
          </span>
        </div>

        {/* 이벤트 정보 */}
        <div className="min-w-0 flex-1">
          {/* 제목 + 뱃지 */}
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-1 text-sm font-semibold leading-snug">
              {title}
            </p>
            <div className="flex shrink-0 items-center gap-1">
              {!isPublic && (
                <span
                  className="flex items-center gap-0.5 text-[10px] text-muted-foreground"
                  aria-label="비공개 이벤트"
                >
                  <Lock className="h-2.5 w-2.5" />
                  비공개
                </span>
              )}
              <Badge
                variant={isPast ? "secondary" : "default"}
                className="px-1.5 py-0 text-[10px]"
              >
                {isPast ? "지난" : "예정"}
              </Badge>
            </div>
          </div>

          {/* 장소 */}
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>

          {/* 멤버 수 + RSVP 요약 */}
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3 shrink-0" />
              <span>
                {memberCount}명{maxParticipants && ` / ${maxParticipants}명`}
              </span>
            </div>
            <span className="text-muted-foreground">·</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400">
              참석 {rsvpCounts.attending}
            </span>
            <span className="text-xs text-muted-foreground">
              불참 {rsvpCounts.absent}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
