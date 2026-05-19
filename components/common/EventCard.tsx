/**
 * 이벤트 카드 컴포넌트
 * Supabase DbEvent 기반 데이터를 받아 가로형 리스트 레이아웃으로 렌더링
 */

import Link from "next/link";
import { MapPin, Users, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DbEvent, DbProfile } from "@/lib/database.types";

/** EventCard에 필요한 데이터 타입 */
export interface EventCardData extends DbEvent {
  owner: Pick<DbProfile, "id" | "full_name" | "avatar_url">;
  member_count: number;
  rsvp_counts: { attending: number; absent: number; pending: number };
  is_past: boolean;
}

interface EventCardProps {
  event: EventCardData;
  className?: string;
}

/**
 * 날짜 블록용 월/일 파싱
 * ISO 문자열에서 한국어 월/일 추출
 */
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
    starts_at,
    location,
    member_count,
    capacity,
    is_public,
    is_past,
    rsvp_counts,
  } = event;
  const { month, day } = parseDateParts(starts_at);

  return (
    <Link
      href={`/events/${id}`}
      className="focus-visible:ring-ring block rounded-xl focus:outline-none focus-visible:ring-2"
    >
      <div
        className={cn(
          "bg-card dark:hover:shadow-primary/10 flex items-center gap-4 rounded-xl border px-4 py-3 transition-shadow hover:shadow-md",
          is_past && "opacity-60",
          className,
        )}
      >
        {/* 날짜 블록 */}
        <div
          className={cn(
            "flex w-12 shrink-0 flex-col items-center justify-center rounded-lg py-2.5",
            is_past ? "bg-muted" : "bg-primary/10",
          )}
        >
          <span
            className={cn(
              "text-[10px] font-medium",
              is_past ? "text-muted-foreground" : "text-primary",
            )}
          >
            {month}
          </span>
          <span
            className={cn(
              "text-xl leading-tight font-bold",
              is_past ? "text-muted-foreground" : "text-primary",
            )}
          >
            {day}
          </span>
        </div>

        {/* 이벤트 정보 */}
        <div className="min-w-0 flex-1">
          {/* 제목 + 뱃지 */}
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-1 text-sm leading-snug font-semibold">
              {title}
            </p>
            <div className="flex shrink-0 items-center gap-1">
              {!is_public && (
                <span
                  className="text-muted-foreground flex items-center gap-0.5 text-[10px]"
                  aria-label="비공개 이벤트"
                >
                  <Lock className="h-2.5 w-2.5" />
                  비공개
                </span>
              )}
              <Badge
                variant={is_past ? "secondary" : "default"}
                className="px-1.5 py-0 text-[10px]"
              >
                {is_past ? "지난" : "예정"}
              </Badge>
            </div>
          </div>

          {/* 장소 */}
          <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="line-clamp-1">{location ?? "장소 미정"}</span>
          </div>

          {/* 멤버 수 + RSVP 요약 */}
          <div className="mt-1.5 flex items-center gap-2">
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <Users className="h-3 w-3 shrink-0" />
              <span>
                {member_count}명{capacity ? ` / ${capacity}명` : ""}
              </span>
            </div>
            <span className="text-muted-foreground">·</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400">
              참석 {rsvp_counts.attending}
            </span>
            <span className="text-muted-foreground text-xs">
              불참 {rsvp_counts.absent}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
