import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/dummy-data";

interface RsvpBadgeProps {
  /** RSVP 상태값 */
  rsvp: Member["rsvp"];
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
  const labelMap: Record<Member["rsvp"], string> = {
    attending: "참석",
    absent: "불참",
    pending: "미정",
  };

  /** 상태별 스타일 (Tailwind 클래스) */
  const styleMap: Record<Member["rsvp"], string> = {
    attending:
      "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    absent:
      "border-transparent bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    pending:
      "border-transparent bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <Badge variant="outline" className={cn(styleMap[rsvp], className)}>
      {labelMap[rsvp]}
    </Badge>
  );
}
