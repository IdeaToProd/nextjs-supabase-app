import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getRoleLabel } from "@/lib/dummy-data";
import type { Member } from "@/lib/dummy-data";

interface MemberAvatarProps {
  /** 표시할 이름 */
  name: string;
  /** 이메일 (선택) */
  email?: string;
  /** 아바타 이미지 URL */
  avatarUrl?: string | null;
  /** 역할 (선택) */
  role?: Member["role"];
  /** 아바타 크기 */
  size?: "sm" | "default" | "lg";
  /** 레이아웃 방향: 가로(row) / 세로(col) */
  direction?: "row" | "col";
  className?: string;
}

/**
 * 아바타 + 이름 + 역할 표시 컴포넌트
 * 이니셜 기반 폴백을 자동으로 생성
 */
export function MemberAvatar({
  name,
  email,
  avatarUrl,
  role,
  size = "default",
  direction = "row",
  className,
}: MemberAvatarProps) {
  /** 이름에서 이니셜 2자리 추출 */
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        direction === "col" && "flex-col gap-1",
        className,
      )}
    >
      {/* 아바타 이미지 영역 */}
      <Avatar size={size}>
        {avatarUrl && <AvatarImage src={avatarUrl} alt={`${name}의 프로필`} />}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      {/* 이름 및 역할 */}
      <div
        className={cn("flex flex-col", direction === "col" && "items-center")}
      >
        <span className="text-sm font-medium leading-tight">{name}</span>
        {email && (
          <span className="text-xs text-muted-foreground">{email}</span>
        )}
        {role && (
          <span className="text-xs text-muted-foreground">
            {getRoleLabel(role)}
          </span>
        )}
      </div>
    </div>
  );
}
