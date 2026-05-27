"use client";

/**
 * 멤버 강퇴 버튼 컴포넌트
 * AlertDialog 확인 다이얼로그를 통한 강퇴 처리
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { kickMember } from "@/app/actions/members";

interface KickMemberButtonProps {
  /** 이벤트 ID */
  eventId: string;
  /** 강퇴 대상 사용자 ID */
  targetUserId: string;
  /** 강퇴 대상 표시 이름 */
  targetName: string;
}

/**
 * 멤버 강퇴 버튼
 * - 트리거: 작은 붉은색 텍스트 ghost 버튼
 * - AlertDialog: 강퇴 확인 다이얼로그
 * - 확인 클릭 → kickMember 호출 → 성공 시 router.refresh()
 */
export function KickMemberButton({
  eventId,
  targetUserId,
  targetName,
}: KickMemberButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /**
   * 멤버 강퇴 처리
   */
  const handleKick = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await kickMember(eventId, targetUserId);

      if ("error" in result) {
        setErrorMsg(result.error);
        return;
      }

      // 강퇴 성공 → 페이지 갱신으로 멤버 목록 업데이트
      router.refresh();
    } catch (err) {
      console.error("[KickMemberButton] 강퇴 처리 중 오류:", err);
      setErrorMsg("멤버 강퇴 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive text-xs"
            disabled={isLoading}
          >
            강퇴
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{targetName}님을 강퇴할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleKick}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              강퇴
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {errorMsg && <p className="text-destructive mt-1 text-xs">{errorMsg}</p>}
    </div>
  );
}
