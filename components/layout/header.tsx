import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/layout/container";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";

/** 공통 헤더 컴포넌트 (Server Component) */
export async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
      <Container>
        <nav className="flex h-14 items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
            MOIDA
          </Link>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            {!user && (
              <Button asChild>
                <Link href="/auth/login">로그인</Link>
              </Button>
            )}
          </div>
        </nav>
      </Container>
    </header>
  );
}
