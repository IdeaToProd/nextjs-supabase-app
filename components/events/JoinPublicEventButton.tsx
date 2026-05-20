"use client";

/**
 * 공개 이벤트 직접 참여 버튼 컴포넌트
 * Server Action joinPublicEvent를 호출하고 성공 시 페이지 갱신
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { joinPublicEvent } from "@/app/actions/members";

interface JoinPublicEventButtonProps {
  /** 이벤트 ID */
  eventId: string;
  className?: string;
}

/**
 * 공개 이벤트에 참여하는 버튼
 * - 참여 성공 시 router.refresh()로 페이지 갱신
 * - 정원 초과 시 안내 메시지 표시
 * - 이미 멤버인 경우 페이지 갱신 (user_role 반영)
 */
export function JoinPublicEventButton({
  eventId,
  className,
}: JoinPublicEventButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /**
   * 공개 이벤트 참여 처리
   */
  const handleJoin = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await joinPublicEvent(eventId);

      if ("error" in result) {
        if (result.code === "ALREADY_MEMBER") {
          // 이미 멤버인 경우 페이지 갱신으로 최신 상태 반영
          router.refresh();
          return;
        }
        setErrorMsg(result.error);
        return;
      }

      // 참여 성공 → 페이지 갱신으로 user_role 및 멤버 수 업데이트
      router.refresh();
    } catch (err) {
      console.error("[JoinPublicEventButton] 참여 처리 중 오류:", err);
      setErrorMsg("이벤트 참여 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        size="sm"
        onClick={handleJoin}
        disabled={isLoading}
        className="w-full"
      >
        <UserPlus className="mr-1.5 h-4 w-4" />
        {isLoading ? "참여 중..." : "참여하기"}
      </Button>
      {errorMsg && <p className="text-destructive mt-1 text-xs">{errorMsg}</p>}
    </div>
  );
}
