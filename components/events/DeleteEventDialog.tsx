"use client";

/**
 * 이벤트 삭제 확인 다이얼로그 컴포넌트
 * 삭제 전 종속 데이터 개수를 표시하고 deleteEvent Server Action 호출
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
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
import { deleteEvent } from "@/app/actions/events";

interface DependentCounts {
  notices: number;
  members: number;
  settlements: number;
  carpools: number;
}

interface DeleteEventDialogProps {
  /** 삭제할 이벤트 ID */
  eventId: string;
  /** 삭제할 이벤트 제목 */
  eventTitle: string;
  /** 종속 데이터 개수 */
  dependentCounts: DependentCounts;
}

/**
 * 이벤트 삭제 확인 AlertDialog
 * - 종속 데이터 개수(공지, 멤버, 정산, 카풀) 표시
 * - 삭제 확인 후 deleteEvent Server Action 호출
 * - 삭제 성공 시 /events로 이동
 */
export function DeleteEventDialog({
  eventId,
  eventTitle,
  dependentCounts,
}: DeleteEventDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 종속 데이터 총 개수 */
  const totalCount =
    dependentCounts.notices +
    dependentCounts.members +
    dependentCounts.settlements +
    dependentCounts.carpools;

  /**
   * 이벤트 삭제 실행
   */
  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    const result = await deleteEvent(eventId);

    if ("error" in result) {
      setError(result.error);
      setIsDeleting(false);
      return;
    }

    router.push("/events");
  };

  return (
    <div className="space-y-2">
      {/* 서버 에러 메시지 */}
      {error && (
        <div
          role="alert"
          className="border-destructive/50 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm"
        >
          {error}
        </div>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="destructive" className="w-full">
            <Trash2 className="mr-2 h-4 w-4" />
            이벤트 삭제
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이벤트를 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  <strong>&ldquo;{eventTitle}&rdquo;</strong>을 삭제하면 모든
                  종속 데이터가 영구적으로 삭제됩니다.
                </p>
                {totalCount > 0 && (
                  <ul className="list-inside list-disc space-y-0.5 text-sm">
                    {dependentCounts.members > 0 && (
                      <li>참여자 {dependentCounts.members}명</li>
                    )}
                    {dependentCounts.notices > 0 && (
                      <li>공지사항 {dependentCounts.notices}개</li>
                    )}
                    {dependentCounts.settlements > 0 && (
                      <li>정산 내역 {dependentCounts.settlements}개</li>
                    )}
                    {dependentCounts.carpools > 0 && (
                      <li>카풀 {dependentCounts.carpools}개</li>
                    )}
                  </ul>
                )}
                <p className="font-medium">이 작업은 되돌릴 수 없습니다.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
