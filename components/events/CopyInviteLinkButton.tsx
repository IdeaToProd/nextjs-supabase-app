"use client";

/**
 * 초대 링크 클립보드 복사 버튼 컴포넌트
 * 클립보드 API를 사용하여 초대 링크를 복사하고 피드백을 표시
 */

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopyInviteLinkButtonProps {
  /** 초대 토큰 값 */
  token: string;
  className?: string;
}

/**
 * 초대 링크를 클립보드에 복사하는 버튼
 * - 복사 성공 시 2초간 "복사됨" 상태 표시
 * - 클립보드 API 미지원 환경에서 폴백 처리
 */
export function CopyInviteLinkButton({
  token,
  className,
}: CopyInviteLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  /**
   * 초대 링크 클립보드 복사
   * HTTP 환경, 구형 브라우저 등 클립보드 API 미지원 시 폴백 처리
   */
  const handleCopy = async () => {
    const inviteUrl = `${window.location.origin}/invite/${token}`;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 API 미지원 환경 폴백
      alert(`링크를 직접 복사해주세요:\n${inviteUrl}`);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={className}
    >
      {copied ? (
        <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="mr-1.5 h-3.5 w-3.5" />
      )}
      {copied ? "복사됨" : "초대 링크 복사"}
    </Button>
  );
}
