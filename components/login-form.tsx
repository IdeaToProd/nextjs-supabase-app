"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { GoogleOAuthButton } from "@/components/google-oauth-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LoginFormProps extends React.ComponentPropsWithoutRef<"div"> {
  /** 로그인 성공 후 이동할 경로 (오픈 리다이렉트 방지: /invite/ 경로만 허용) */
  nextPath?: string;
}

export function LoginForm({ className, nextPath, ...props }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // 오픈 리다이렉트 방지: /invite/ 또는 /events/ 경로만 허용
      if (
        nextPath &&
        (nextPath.startsWith("/invite/") || nextPath.startsWith("/events/"))
      ) {
        router.push(nextPath);
      } else {
        router.push("/");
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div>
        <h1 className="text-2xl font-bold">로그인</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          이메일로 로그인하거나 Google 계정을 사용하세요
        </p>
      </div>

      {/* Google OAuth 버튼 */}
      <GoogleOAuthButton onError={setError} nextPath={nextPath} />

      {/* 구분선 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">또는</span>
        </div>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">비밀번호</Label>
            <Link
              href="/auth/forgot-password"
              className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "로그인 중..." : "로그인"}
        </Button>
        <div className="text-center text-sm">
          계정이 없으신가요?{" "}
          <Link href="/auth/sign-up" className="underline underline-offset-4">
            회원가입
          </Link>
        </div>
      </form>
    </div>
  );
}
