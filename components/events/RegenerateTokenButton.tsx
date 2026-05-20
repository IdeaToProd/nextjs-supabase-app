"use client";

/**
 * 초대 토큰 재발급 버튼 컴포넌트 (Owner 전용)
 * Server Action regenerateInviteToken을 호출하고 성공 시 페이지 갱신
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { regenerateInviteToken } from "@/app/actions/members";

interface RegenerateTokenButtonProps {
  /** 이벤트 ID */
  eventId: string;
  className?: string;
}

/**
 * 초대 토큰을 재발급하는 버튼 (Owner 전용)
 * - 재발급 성공 시 router.refresh()로 새 토큰 반영
 * - 에러 발생 시 인라인 메시지 표시
 */
export function RegenerateTokenButton({
  eventId,
  className,
}: RegenerateTokenButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /**
   * 초대 토큰 재발급 처리
   */
  const handleRegenerate = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await regenerateInviteToken(eventId);

      if ("error" in result) {
        setErrorMsg(result.error);
        return;
      }

      // 재발급 성공 → 페이지 갱신으로 CopyInviteLinkButton에 새 토큰 반영
      router.refresh();
    } catch (err) {
      console.error("[RegenerateTokenButton] 토큰 재발급 중 오류:", err);
      setErrorMsg("토큰 재발급 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRegenerate}
        disabled={isLoading}
        title="초대 링크 재발급"
      >
        <RefreshCw
          className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
        />
        <span className="ml-1.5">
          {isLoading ? "재발급 중..." : "링크 재발급"}
        </span>
      </Button>
      {errorMsg && <p className="text-destructive mt-1 text-xs">{errorMsg}</p>}
    </div>
  );
}
