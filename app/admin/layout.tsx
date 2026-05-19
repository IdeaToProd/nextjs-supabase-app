"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** 사이드바 네비게이션 항목 */
const navItems = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "회원 관리", icon: Users, exact: false },
  { href: "/admin/events", label: "이벤트 관리", icon: Calendar, exact: false },
] as const;

/**
 * 어드민 레이아웃
 * - 데스크톱: 사이드바 + 메인 콘텐츠 2컬럼
 * - 모바일: 상단 수평 네비게이션
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  /** 활성 링크 여부 판단 */
  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── 어드민 헤더 (모바일/공통) ── */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex h-12 items-center px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xs font-semibold text-primary">ADMIN</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-semibold">모이다 관리자</span>
          </Link>
          <Link
            href="/"
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            사이트로 돌아가기
          </Link>
        </div>

        {/* 모바일 수평 네비게이션 */}
        <nav
          className="flex overflow-x-auto border-t lg:hidden"
          aria-label="어드민 내비게이션"
        >
          {navItems.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors",
                isActive(href, exact)
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
              aria-current={isActive(href, exact) ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </header>

      {/* ── 사이드바 + 메인 (데스크톱) ── */}
      <div className="flex flex-1">
        {/* 데스크톱 사이드바 */}
        <aside className="hidden w-56 shrink-0 border-r bg-muted/20 dark:bg-muted/10 lg:block">
          <nav className="sticky top-[4.5rem] space-y-0.5 p-3">
            {navItems.map(({ href, label, icon: Icon, exact }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(href, exact)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-current={isActive(href, exact) ? "page" : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-x-hidden p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
