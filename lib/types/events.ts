/**
 * 이벤트 관련 복합 타입 정의
 * Supabase DB 타입을 기반으로 UI 렌더링에 필요한 정보를 합산한 타입
 */

import type { DbEvent, DbEventMember, DbProfile } from "@/lib/database.types";

/**
 * 이벤트 상세 정보 복합 타입
 * 이벤트 기본 정보 + owner 프로필 + 멤버 수/RSVP 집계 + 현재 사용자 상태
 */
export type EventWithDetails = DbEvent & {
  /** 이벤트 주최자 프로필 (이름, 아바타만 포함) */
  owner: Pick<DbProfile, "id" | "full_name" | "avatar_url">;
  /** 전체 멤버 수 */
  member_count: number;
  /** RSVP 상태별 집계 */
  rsvp_counts: {
    attending: number;
    absent: number;
    pending: number;
  };
  /** starts_at + 24h < now 이면 true (지난 이벤트) */
  is_past: boolean;
  /** 현재 로그인 사용자의 역할 — 비로그인 시 null */
  user_role: "owner" | "co_host" | "participant" | null;
  /** 현재 로그인 사용자의 RSVP 상태 — 비로그인이거나 멤버 아닐 시 null */
  user_rsvp: DbEventMember["rsvp_status"] | null;
  /** 활성화된 초대 토큰 — 주최자가 아닐 시 null */
  invite_token: string | null;
};
