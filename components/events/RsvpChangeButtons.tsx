"use client";

/**
 * RSVP 상태 변경 버튼 컴포넌트
 * 멤버가 자신의 참석 여부(참석/불참/미정)를 변경한다.
 * JoinPublicEventButton.tsx 패턴을 따름
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { changeRsvp } from "@/app/actions/members";

/** RSVP 옵션 목록 */
const RSVP_OPTIONS = [
  { status: "attending", label: "참석" },
  { status: "absent", label: "불참" },
  { status: "pending", label: "미정" },
];

interface RsvpChangeButtonsProps {
  /** 이벤트 ID */
  eventId: string;
  /** 현재 RSVP 상태 (null이면 미설정) */
  currentRsvp: string | null;
  /** 지난 이벤트 여부 (true이면 버튼 잠금) */
  isPast: boolean;
}

/**
 * RSVP 상태를 변경하는 버튼 그룹 컴포넌트
 * - 현재 상태 버튼: variant='default' (강조)
 * - 나머지 버튼: variant='outline'
 * - 지난 이벤트: 전체 disabled + 안내 텍스트
 */
export function RsvpChangeButtons({
  eventId,
  currentRsvp,
  isPast,
}: RsvpChangeButtonsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /**
   * RSVP 상태 변경 처리
   */
  const handleChange = async (status: string) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await changeRsvp(eventId, status);

      if ("error" in result) {
        setErrorMsg(result.error);
        return;
      }

      // 변경 성공 → 페이지 갱신으로 집계 카드 업데이트
      router.refresh();
    } catch (err) {
      console.error("[RsvpChangeButtons] RSVP 변경 중 오류:", err);
      setErrorMsg("RSVP 변경 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        {RSVP_OPTIONS.map(({ status, label }) => (
          <Button
            key={status}
            variant={currentRsvp === status ? "default" : "outline"}
            size="sm"
            className="flex-1 text-xs"
            disabled={isPast || isLoading}
            onClick={() => handleChange(status)}
          >
            {isLoading && currentRsvp !== status ? label : label}
          </Button>
        ))}
      </div>
      {isPast && (
        <p className="text-muted-foreground text-xs">
          지난 이벤트 — RSVP가 잠겼어요
        </p>
      )}
      {errorMsg && <p className="text-destructive text-xs">{errorMsg}</p>}
    </div>
  );
}
