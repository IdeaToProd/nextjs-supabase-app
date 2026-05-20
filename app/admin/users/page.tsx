/**
 * 어드민 회원 목록 페이지 (Server Component)
 * - Supabase profiles 테이블 실제 데이터 조회
 * - 이름/이메일 ilike 검색
 * - 서버 사이드 페이지네이션 (PAGE_SIZE=10)
 * - AdminSearchInput으로 URL q 파라미터 기반 검색
 */

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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

/** 페이지당 표시 개수 */
const PAGE_SIZE = 10;

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

/**
 * 회원 목록 서버 컴포넌트
 * searchParams에서 q(검색어), page(현재 페이지) 추출
 */
export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { q, page: pageParam } = await searchParams;

  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  const supabase = await createClient();

  // profiles 조회 (count: 'exact'로 전체 건수 확인)
  let query = supabase
    .from("profiles")
    .select("id, full_name, email, is_admin, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  // 검색어가 있으면 이름 또는 이메일 ilike 필터 적용
  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: users, count, error } = await query;

  if (error) {
    throw new Error(`회원 목록 조회 실패: ${error.message}`);
  }

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  /** 페이지네이션 링크 URL 생성 (현재 검색어 유지) */
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/users${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">회원 관리</h1>
        <span className="text-muted-foreground text-sm">
          전체 {totalCount}명
        </span>
      </div>

      {/* 검색 Input (Client Component) */}
      <AdminSearchInput
        placeholder="이름 또는 이메일로 검색..."
        paramName="q"
        defaultValue={q ?? ""}
      />

      {/* 회원 테이블 */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">이름</TableHead>
              <TableHead className="text-xs">이메일</TableHead>
              <TableHead className="text-xs">가입일</TableHead>
              <TableHead className="text-xs">관리자</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="py-3 font-medium">
                    {user.full_name ?? "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground py-3 text-sm">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground py-3 text-sm">
                    {new Date(user.created_at).toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell className="py-3">
                    {user.is_admin ? (
                      <Badge variant="default" className="text-xs">
                        관리자
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        일반
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground py-10 text-center text-sm"
                >
                  {q ? "검색 결과가 없습니다" : "등록된 회원이 없습니다"}
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
