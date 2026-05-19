import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  /** lucide-react 아이콘 컴포넌트 */
  icon?: LucideIcon;
  /** 메인 메시지 */
  title: string;
  /** 부연 설명 (선택) */
  description?: string;
  /** CTA 버튼 레이블 (선택) */
  actionLabel?: string;
  /** CTA 클릭 핸들러 (href 없을 때 사용) */
  onAction?: () => void;
  /** CTA 링크 (Next.js Link) */
  actionHref?: string;
  className?: string;
}

/**
 * 데이터 없음 상태 안내 컴포넌트
 * 아이콘 + 메시지 + 선택적 CTA 버튼으로 구성
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-center",
        className,
      )}
    >
      {/* 아이콘 영역 */}
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Icon className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
        </div>
      )}

      {/* 텍스트 영역 */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      {/* CTA 버튼 */}
      {actionLabel && (
        <>
          {actionHref ? (
            <Button asChild size="sm" variant="outline">
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : onAction ? (
            <Button size="sm" variant="outline" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
}
