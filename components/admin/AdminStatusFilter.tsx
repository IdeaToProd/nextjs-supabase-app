"use client";

/**
 * 어드민 이벤트 상태 필터 컴포넌트
 * shadcn Select 기반, URL status 파라미터로 필터 상태 관리
 */

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** 상태 필터 값 타입 */
type StatusFilter = "all" | "upcoming" | "past";

/**
 * 이벤트 상태 필터 Select 컴포넌트
 * 값 변경 시 URL status 파라미터 업데이트, page 파라미터 초기화
 */
export default function AdminStatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // 현재 URL에서 status 파라미터 읽기 (기본값: 'all')
  const currentStatus = (searchParams.get("status") ?? "all") as StatusFilter;

  /** 필터 변경 시 URL 파라미터 업데이트 */
  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    // 필터 변경 시 첫 페이지로 초기화
    params.delete("page");
    router.push(pathname + "?" + params.toString());
  };

  return (
    <Select value={currentStatus} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-36" aria-label="이벤트 상태 필터">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">전체</SelectItem>
        <SelectItem value="upcoming">예정</SelectItem>
        <SelectItem value="past">지난 이벤트</SelectItem>
      </SelectContent>
    </Select>
  );
}
