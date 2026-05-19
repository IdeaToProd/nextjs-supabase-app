"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { dummyUsers } from "@/lib/dummy-data";
import type { UserProfile } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

/** 페이지당 표시 개수 */
const PAGE_SIZE = 5;

/**
 * 어드민 회원 목록 페이지
 * - 이름/이메일 검색
 * - 회원 테이블 (이름, 이메일, 가입일, 관리자 여부)
 * - 페이지네이션
 */
export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /** 검색어 필터 */
  const filtered: UserProfile[] = dummyUsers.filter((user) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    );
  });

  /** 페이지네이션 계산 */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  /** 검색 시 첫 페이지로 이동 */
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">회원 관리</h1>
        <span className="text-sm text-muted-foreground">
          전체 {dummyUsers.length}명
        </span>
      </div>

      {/* 검색 Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="이름 또는 이메일로 검색..."
          value={query}
          onChange={handleSearch}
          className="pl-9"
          aria-label="회원 검색"
        />
      </div>

      {/* 회원 테이블 */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">이름</TableHead>
              <TableHead className="text-xs">이메일</TableHead>
              <TableHead className="text-xs">가입일</TableHead>
              <TableHead className="text-xs">관리자</TableHead>
              <TableHead className="text-xs">참여 이벤트</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length > 0 ? (
              paginated.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="py-3 font-medium">
                    {user.name}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {new Date(user.joinedAt).toLocaleDateString("ko-KR")}
                  </TableCell>
                  <TableCell className="py-3">
                    {user.isAdmin ? (
                      <Badge variant="default" className="text-xs">
                        관리자
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        일반
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {/* 더미: 임의 숫자 */}
                    {Math.floor(Math.random() * 8 + 1)}개
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
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
