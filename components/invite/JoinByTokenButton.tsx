"use client";

/**
 * 초대 토큰으로 이벤트에 참여하는 버튼 컴포넌트
 * Server Action joinEventByToken을 호출하고 성공 시 이벤트 상세로 이동
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { joinEventByToken } from "@/app/actions/members";

interface JoinByTokenButtonProps {
  /** 초대 토큰 값 */
  token: string;
}

/**
 * 초대 토큰으로 이벤트에 참여하는 버튼
 * - 참여 성공 시 이벤트 상세 페이지로 이동
 * - 에러 발생 시 인라인 메시지 표시
 */
export function JoinByTokenButton({ token }: JoinByTokenButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /**
   * 초대 토큰으로 이벤트 참여 처리
   */
  const handleJoin = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await joinEventByToken(token);

      if ("error" in result) {
        setErrorMsg(result.error);
        return;
      }

      // 참여 성공 → 이벤트 상세로 이동
      router.push(`/events/${result.eventId}`);
    } catch (err) {
      console.error("[JoinByTokenButton] 참여 처리 중 오류:", err);
      setErrorMsg("이벤트 참여 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        size="lg"
        onClick={handleJoin}
        disabled={isLoading}
      >
        <UserCheck className="mr-2 h-4 w-4" />
        {isLoading ? "참여 중..." : "이 이벤트에 참여하기"}
      </Button>
      {errorMsg && (
        <p className="text-destructive text-center text-sm">{errorMsg}</p>
      )}
    </div>
  );
}
