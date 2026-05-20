"use client";

/**
 * 어드민 공통 검색 Input 컴포넌트
 * URL searchParams 기반으로 동작 (router.push로 q 파라미터 업데이트)
 * 300ms 디바운스 적용으로 타이핑 중 불필요한 라우팅 방지
 */

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

interface AdminSearchInputProps {
  /** Input placeholder 텍스트 */
  placeholder?: string;
  /** URL 파라미터 키 (기본값: 'q') */
  paramName?: string;
  /** 초기 검색어 (서버에서 searchParams로 전달) */
  defaultValue?: string;
}

/**
 * URL 파라미터 기반 검색 Input (300ms 디바운스 적용)
 * debouncedValue 변경 시에만 router.push 실행
 */
export default function AdminSearchInput({
  placeholder = "검색...",
  paramName = "q",
  defaultValue = "",
}: AdminSearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [value, setValue] = useState(defaultValue);
  // 300ms 디바운스 적용 — 타이핑 중 불필요한 라우팅 방지
  const debouncedValue = useDebounce(value, 300);

  /** debouncedValue 변경 시에만 URL 업데이트 */
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedValue) {
      params.set(paramName, debouncedValue);
    } else {
      params.delete(paramName);
    }
    // 검색 시 첫 페이지로 초기화
    params.delete("page");
    router.push(pathname + "?" + params.toString());
    // searchParams 변경은 의존성에서 제외 (무한 루프 방지)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  return (
    <div className="relative max-w-sm flex-1">
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9"
        aria-label={placeholder}
      />
    </div>
  );
}
