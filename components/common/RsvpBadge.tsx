/**
 * RSVP 상태 뱃지 컴포넌트
 * 참석/불참/미정 상태를 색상으로 구분하여 표시
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** RSVP 상태 타입 */
type RsvpStatus = "attending" | "absent" | "pending";

interface RsvpBadgeProps {
  /** RSVP 상태값 */
  rsvp: RsvpStatus | string;
  className?: string;
}

/**
 * RSVP 상태를 색상으로 구분하는 뱃지 컴포넌트
 * - 참석: 초록 계열
 * - 불참: 빨간 계열
 * - 미정: 회색 계열
 */
export function RsvpBadge({ rsvp, className }: RsvpBadgeProps) {
  /** 상태별 레이블 */
  const labelMap: Record<string, string> = {
    attending: "참석",
    absent: "불참",
    pending: "미정",
  };

  /** 상태별 스타일 (Tailwind 클래스) */
  const styleMap: Record<string, string> = {
    attending:
      "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    absent:
      "border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    pending: "border-transparent bg-muted text-muted-foreground",
  };

  const label = labelMap[rsvp] ?? rsvp;
  const style =
    styleMap[rsvp] ?? "border-transparent bg-muted text-muted-foreground";

  return (
    <Badge variant="outline" className={cn(style, className)}>
      {label}
    </Badge>
  );
}
