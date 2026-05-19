import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

/** 최대 너비 래퍼 컴포넌트 */
export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("mx-auto max-w-5xl px-4", className)}>{children}</div>
  );
}
