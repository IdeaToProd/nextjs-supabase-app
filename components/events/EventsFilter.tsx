"use client";

/**
 * 이벤트 목록 검색 및 상태 필터 컴포넌트
 * URL searchParams를 통해 Server Component와 상태를 공유
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** 상태 필터 타입 */
type StatusFilter = "all" | "upcoming" | "past";

/** 상태 필터 탭 목록 */
const filterTabs: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "upcoming", label: "예정" },
  { value: "past", label: "지난 이벤트" },
];

interface EventsFilterProps {
  /** 현재 검색어 (URL searchParams에서 전달) */
  currentQuery: string;
  /** 현재 상태 필터 (URL searchParams에서 전달) */
  currentStatus: StatusFilter;
}

/**
 * 이벤트 검색 및 상태 필터 UI 컴포넌트
 * 검색어/필터 변경 시 URL searchParams를 업데이트하여 서버에서 재조회
 */
export function EventsFilter({
  currentQuery,
  currentStatus,
}: EventsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * URL searchParams 업데이트 헬퍼
   * 기존 params를 유지하면서 특정 키만 업데이트
   */
  const updateSearchParams = useCallback(
    (updates: Partial<Record<"q" | "status", string>>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // 검색어가 빈 문자열이면 제거
      if ("q" in updates && !updates.q) {
        params.delete("q");
      }

      router.push(`/events?${params.toString()}`);
    },
    [router, searchParams],
  );

  /**
   * 검색어 변경 핸들러 (디바운스 없이 즉시 반영)
   */
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSearchParams({ q: e.target.value });
  };

  /**
   * 상태 필터 변경 핸들러
   */
  const handleStatusChange = (status: StatusFilter) => {
    updateSearchParams({ status });
  };

  return (
    <div className="space-y-3">
      {/* 검색 입력 */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder="이벤트명, 장소로 검색..."
          defaultValue={currentQuery}
          onChange={handleQueryChange}
          className="pl-9"
          aria-label="이벤트 검색"
        />
      </div>

      {/* 상태 필터 탭 */}
      <div className="flex gap-2" role="group" aria-label="이벤트 상태 필터">
        {filterTabs.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleStatusChange(value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              currentStatus === value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
            aria-pressed={currentStatus === value}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
