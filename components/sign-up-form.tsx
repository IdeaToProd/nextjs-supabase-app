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

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // /auth/confirm 라우트가 OTP 검증 후 /protected로 리다이렉트
          // /protected 직접 지정 시 OTP 검증 단계가 누락되어 이메일 확인이 동작하지 않음
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/protected`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div>
        <h1 className="text-2xl font-bold">회원가입</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          새 계정을 만들거나 Google 계정으로 시작하세요
        </p>
      </div>

      {/* Google OAuth 버튼 */}
      <GoogleOAuthButton onError={setError} />

      {/* 구분선 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">또는</span>
        </div>
      </div>

      <form onSubmit={handleSignUp} className="flex flex-col gap-6">
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
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="repeat-password">비밀번호 확인</Label>
          <Input
            id="repeat-password"
            type="password"
            required
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "계정 생성 중..." : "회원가입"}
        </Button>
        <div className="text-center text-sm">
          이미 계정이 있으신가요?{" "}
          <Link href="/auth/login" className="underline underline-offset-4">
            로그인
          </Link>
        </div>
      </form>
    </div>
  );
}
