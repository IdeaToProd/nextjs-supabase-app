"use client";

import { usePathname } from "next/navigation";

interface RootShellProps {
  children: React.ReactNode;
  /** 공통 헤더 + 하단 탭바 (서버 컴포넌트를 prop으로 주입) */
  header: React.ReactNode;
  bottomTab: React.ReactNode;
}

/**
 * 루트 쉘 컴포넌트
 * - 어드민 경로(/admin)에서는 공통 Header/BottomTabBar와 모바일 컨테이너를 제외
 * - 일반 경로에서는 모바일 레이아웃 (최대 520px) 유지
 * 서버 컴포넌트(Header, BottomTabBar)를 prop으로 받아 클라이언트/서버 경계 안전하게 유지
 */
export function RootShell({ children, header, bottomTab }: RootShellProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    /* 어드민: 풀 와이드 레이아웃, 자체 헤더 사용 */
    return <div className="min-h-screen">{children}</div>;
  }

  /* 일반: 모바일 최적화 폭 중앙 정렬 */
  return (
    <>
      <div className="mx-auto min-h-screen max-w-[520px] bg-background">
        {header}
        <main className="pb-16">{children}</main>
      </div>
      {bottomTab}
    </>
  );
}
