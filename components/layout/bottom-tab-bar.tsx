"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, PlusSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "홈", icon: Home, exact: true },
  {
    href: "/events",
    label: "이벤트",
    icon: Calendar,
    exact: false,
    excludes: ["/events/new"],
  },
  { href: "/events/new", label: "새이벤트", icon: PlusSquare },
  { href: "/profile", label: "프로필", icon: User, exact: false },
];

/** 모바일 앱 스타일 하단 탭바 */
export function BottomTabBar() {
  const pathname = usePathname();

  if (pathname.startsWith("/auth")) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[520px] -translate-x-1/2 border-t bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-around">
        {tabs.map(({ href, label, icon: Icon, exact, excludes }) => {
          let isActive: boolean;
          if (exact) {
            isActive = pathname === href;
          } else if (excludes) {
            isActive =
              pathname.startsWith(href) &&
              !excludes.some((ex) => pathname.startsWith(ex));
          } else {
            isActive = pathname.startsWith(href);
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-2 transition-colors active:opacity-70",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              <Icon className="h-6 w-6" />
              <span className={cn("text-xs", isActive && "font-medium")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
