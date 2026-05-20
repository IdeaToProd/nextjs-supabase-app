"use client";

/**
 * 어드민 네비게이션 컴포넌트
 * 모바일: 헤더 하단 수평 탭, 데스크톱: 좌측 사이드바
 * usePathname으로 현재 활성 경로를 클라이언트에서 판단
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** 사이드바 네비게이션 항목 정의 */
const navItems = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "회원 관리", icon: Users, exact: false },
  {
    href: "/admin/events",
    label: "이벤트 관리",
    icon: Calendar,
    exact: false,
  },
] as const;

/**
 * 어드민 헤더 + 모바일 수평 탭 컴포넌트
 * 데스크톱 사이드바는 AdminSidebar 컴포넌트에서 별도 처리
 */
export default function AdminNav() {
  const pathname = usePathname();

  /** 현재 경로와 네비게이션 항목의 일치 여부 반환 */
  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-background/95 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="flex h-12 items-center px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-primary text-xs font-semibold">ADMIN</span>
          <ChevronRight className="text-muted-foreground h-3.5 w-3.5" />
          <span className="text-sm font-semibold">모이다 관리자</span>
        </Link>
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground ml-auto text-xs"
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
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
            aria-current={isActive(href, exact) ? "page" : undefined}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

/**
 * 어드민 데스크톱 사이드바 컴포넌트
 * layout.tsx의 flex 컨테이너 안에서 렌더링되어 메인 콘텐츠와 나란히 배치
 */
export function AdminSidebar() {
  const pathname = usePathname();

  /** 현재 경로와 네비게이션 항목의 일치 여부 반환 */
  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="bg-muted/20 dark:bg-muted/10 hidden w-56 shrink-0 border-r lg:block">
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
  );
}
