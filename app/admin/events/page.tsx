"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dummyEvents, formatDateShort } from "@/lib/dummy-data";
import type { Event } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

/** 페이지당 표시 개수 */
const PAGE_SIZE = 5;

/** 상태 필터 타입 */
type StatusFilter = "all" | "upcoming" | "past";

/**
 * 어드민 이벤트 목록 페이지
 * - 검색 Input + 상태 필터 Select
 * - 이벤트 테이블 (제목, 주최자, 날짜, 장소, 멤버 수, 상태, 상세 보기)
 * - 페이지네이션
 */
export default function AdminEventsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  /** 검색어 + 상태 필터 적용 */
  const filtered: Event[] = dummyEvents.filter((event) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !query ||
      event.title.toLowerCase().includes(q) ||
      event.ownerName.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  /** 페이지네이션 계산 */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  /** 검색/필터 변경 시 첫 페이지로 */
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val as StatusFilter);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">이벤트 관리</h1>
        <span className="text-sm text-muted-foreground">
          전체 {dummyEvents.length}개
        </span>
      </div>

      {/* 검색 + 필터 행 */}
      <div className="flex flex-col gap-2 sm:flex-row">
        {/* 검색 Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="이벤트명, 주최자로 검색..."
            value={query}
            onChange={handleSearch}
            className="pl-9"
            aria-label="이벤트 검색"
          />
        </div>

        {/* 상태 필터 */}
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-36" aria-label="상태 필터">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="upcoming">예정</SelectItem>
            <SelectItem value="past">지난 이벤트</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 이벤트 테이블 */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">이벤트명</TableHead>
              <TableHead className="text-xs">주최자</TableHead>
              <TableHead className="hidden text-xs sm:table-cell">
                날짜
              </TableHead>
              <TableHead className="hidden text-xs lg:table-cell">
                장소
              </TableHead>
              <TableHead className="text-xs">멤버</TableHead>
              <TableHead className="text-xs">상태</TableHead>
              <TableHead className="text-xs">상세</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length > 0 ? (
              paginated.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="py-3">
                    <p className="line-clamp-1 text-sm font-medium">
                      {event.title}
                    </p>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {event.ownerName}
                  </TableCell>
                  <TableCell className="hidden py-3 text-sm text-muted-foreground sm:table-cell">
                    {formatDateShort(event.date)}
                  </TableCell>
                  <TableCell className="hidden py-3 text-sm text-muted-foreground lg:table-cell">
                    <span className="line-clamp-1">{event.location}</span>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {event.memberCount}명
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant={
                        event.status === "upcoming" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {event.status === "upcoming" ? "예정" : "지난"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                    >
                      <Link
                        href={`/admin/events/${event.id}`}
                        aria-label="상세 보기"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  검색 결과가 없습니다
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-center gap-1"
          role="navigation"
          aria-label="페이지 이동"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="text-xs"
          >
            이전
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={cn(
                "min-w-8 text-xs",
                currentPage === page && "pointer-events-none",
              )}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="text-xs"
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
