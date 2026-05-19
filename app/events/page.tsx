"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventCard } from "@/components/common/EventCard";
import { EmptyState } from "@/components/common/EmptyState";
import { dummyEvents } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";
import type { Event } from "@/lib/dummy-data";

/** 상태 필터 타입 */
type StatusFilter = "all" | "upcoming" | "past";

/**
 * 이벤트 목록 페이지
 * - 검색 Input + 상태 필터 버튼
 * - 이벤트 카드 그리드 (더미 데이터 10개)
 * - "이벤트 만들기" CTA 버튼
 */
export default function EventsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  /** 검색어 + 상태 필터 적용 */
  const filteredEvents: Event[] = dummyEvents.filter((event) => {
    const matchesQuery =
      query === "" ||
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.location.toLowerCase().includes(query.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  /** 상태 필터 탭 목록 */
  const filterTabs: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "전체" },
    { value: "upcoming", label: "예정" },
    { value: "past", label: "지난 이벤트" },
  ];

  return (
    <div className="space-y-4 px-4 py-6">
      {/* ── 헤더 행 ── */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold">이벤트</h1>
        <Button asChild size="sm">
          <Link href="/events/new">
            <PlusCircle className="mr-1.5 h-4 w-4" />
            이벤트 만들기
          </Link>
        </Button>
      </div>

      {/* ── 검색 입력 ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="이벤트명, 장소로 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
          aria-label="이벤트 검색"
        />
      </div>

      {/* ── 상태 필터 탭 ── */}
      <div className="flex gap-2" role="group" aria-label="이벤트 상태 필터">
        {filterTabs.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              statusFilter === value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
            aria-pressed={statusFilter === value}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── 이벤트 그리드 / 빈 상태 ── */}
      {filteredEvents.length > 0 ? (
        <>
          {/* 결과 수 표시 */}
          <p className="text-xs text-muted-foreground">
            {filteredEvents.length}개의 이벤트
          </p>

          {/* 가로형 리스트: 한 줄씩 나열 */}
          <div className="flex flex-col gap-2">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={Search}
          title="이벤트를 찾을 수 없어요"
          description={
            query
              ? `"${query}"에 해당하는 이벤트가 없습니다.`
              : "해당 조건의 이벤트가 없습니다."
          }
          actionLabel="이벤트 만들기"
          actionHref="/events/new"
        />
      )}
    </div>
  );
}
