/**
 * 어드민 이벤트 목록 페이지 (Server Component)
 * - Supabase events 테이블 실제 데이터 조회
 * - 제목 ilike 검색, 상태(예정/지난) 필터
 * - 서버 사이드 페이지네이션 (PAGE_SIZE=10)
 * - 지난 이벤트 기준: starts_at + 24h < now (CLAUDE.md 비즈니스 규칙)
 */

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import AdminStatusFilter from "@/components/admin/AdminStatusFilter";

/** 페이지당 표시 개수 */
const PAGE_SIZE = 10;

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

/**
 * 이벤트 목록 서버 컴포넌트
 * searchParams에서 q(검색어), status(상태 필터), page(페이지) 추출
 */
export default async function AdminEventsPage({ searchParams }: PageProps) {
  const { q, status, page: pageParam } = await searchParams;

  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  // 지난 이벤트 기준: starts_at + 24h 이전 (CLAUDE.md 비즈니스 규칙)
  const pastThreshold = new Date(
    Date.now() - 24 * 60 * 60 * 1000,
  ).toISOString();

  const supabase = await createClient();

  // events + owner 프로필 join 조회
  let query = supabase
    .from("events")
    .select(
      "id, title, starts_at, location, owner:profiles!events_owner_id_fkey(full_name)",
      { count: "exact" },
    )
    .order("starts_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  // 제목 검색 필터
  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  // 상태 필터 (지난 이벤트 기준: starts_at + 24h < now)
  if (status === "upcoming") {
    query = query.gt("starts_at", pastThreshold);
  } else if (status === "past") {
    query = query.lte("starts_at", pastThreshold);
  }

  const { data: rawEvents, count, error } = await query;

  // Supabase join 타입을 명시적으로 캐스팅 (owner는 단일 객체)
  const events = rawEvents as
    | (Omit<NonNullable<typeof rawEvents>[number], "owner"> & {
        owner: { full_name: string | null } | null;
      })[]
    | null;

  if (error) {
    throw new Error(`이벤트 목록 조회 실패: ${error.message}`);
  }

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  /** 페이지네이션 링크 URL 생성 (현재 검색어·필터 유지) */
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status && status !== "all") params.set("status", status);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/events${qs ? `?${qs}` : ""}`;
  };

  /** 이벤트 상태 판별 (starts_at + 24h < now이면 지난 이벤트) */
  const isEventPast = (startsAt: string) => {
    return new Date(startsAt).getTime() < Date.now() - 24 * 60 * 60 * 1000;
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">이벤트 관리</h1>
        <span className="text-muted-foreground text-sm">
          전체 {totalCount}개
        </span>
      </div>

      {/* 검색 + 상태 필터 행 */}
      <div className="flex flex-col gap-2 sm:flex-row">
        {/* 검색 Input (Client Component) */}
        <AdminSearchInput
          placeholder="이벤트명으로 검색..."
          paramName="q"
          defaultValue={q ?? ""}
        />

        {/* 상태 필터 (Client Component) */}
        <AdminStatusFilter />
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
              <TableHead className="text-xs">상태</TableHead>
              <TableHead className="text-xs">상세</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events && events.length > 0 ? (
              events.map((event) => {
                const past = isEventPast(event.starts_at);
                // owner join 결과에서 이름 추출
                const ownerName = event.owner?.full_name ?? "-";

                return (
                  <TableRow key={event.id}>
                    <TableCell className="py-3">
                      <p className="line-clamp-1 text-sm font-medium">
                        {event.title}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground py-3 text-sm">
                      {ownerName}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden py-3 text-sm sm:table-cell">
                      {new Date(event.starts_at).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden py-3 text-sm lg:table-cell">
                      <span className="line-clamp-1">
                        {event.location ?? "-"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant={past ? "secondary" : "default"}
                        className="text-xs"
                      >
                        {past ? "지난" : "예정"}
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
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground py-10 text-center text-sm"
                >
                  {q || status
                    ? "검색 결과가 없습니다"
                    : "등록된 이벤트가 없습니다"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 (Link 기반 — 서버 컴포넌트 호환) */}
      {totalPages > 1 && (
        <nav
          className="flex items-center justify-center gap-1"
          aria-label="페이지 이동"
        >
          {currentPage > 1 && (
            <Link
              href={buildPageUrl(currentPage - 1)}
              className="hover:bg-muted rounded border px-3 py-1.5 text-xs"
            >
              이전
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildPageUrl(p)}
              aria-current={currentPage === p ? "page" : undefined}
              className={
                currentPage === p
                  ? "bg-primary text-primary-foreground pointer-events-none rounded px-3 py-1.5 text-xs"
                  : "hover:bg-muted rounded border px-3 py-1.5 text-xs"
              }
            >
              {p}
            </Link>
          ))}
          {currentPage < totalPages && (
            <Link
              href={buildPageUrl(currentPage + 1)}
              className="hover:bg-muted rounded border px-3 py-1.5 text-xs"
            >
              다음
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
