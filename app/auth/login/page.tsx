/**
 * 로그인 페이지
 * - next 파라미터 지원: 로그인 후 지정된 경로로 리다이렉트
 */

import { LoginForm } from "@/components/login-form";

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function Page({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return (
    <div className="px-4 py-8">
      <LoginForm nextPath={next} />
    </div>
  );
}
