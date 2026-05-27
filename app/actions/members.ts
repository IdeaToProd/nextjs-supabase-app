"use server";

/**
 * 멤버 참여 관련 Server Actions
 * 초대 토큰을 통한 참여, 공개 이벤트 직접 참여, 초대 토큰 관리
 */

import { createClient } from "@/lib/supabase/server";

/** 에러 코드 타입 */
type MemberErrorCode =
  | "UNAUTHENTICATED"
  | "INVALID_TOKEN"
  | "ALREADY_MEMBER"
  | "CAPACITY_EXCEEDED"
  | "FORBIDDEN"
  | "EVENT_LOCKED"
  | "INVALID_STATUS"
  | "NOT_MEMBER"
  | "CANNOT_KICK_SELF"
  | "NOT_FOUND";

/** 멤버 참여 에러 반환 타입 */
interface MemberError {
  error: string;
  code: MemberErrorCode;
  /** 이미 멤버인 경우 이벤트 ID 포함 */
  eventId?: string;
}

/**
 * 초대 토큰으로 이벤트에 참여합니다.
 * - 토큰 유효성 확인
 * - 로그인 확인
 * - 중복 멤버 확인
 * - 정원 초과 확인
 * - event_members insert
 */
export async function joinEventByToken(
  token: string,
): Promise<{ eventId: string } | MemberError> {
  const supabase = await createClient();

  // 토큰 유효성 확인 (is_active=true인 토큰만 조회)
  const { data: tokenData, error: tokenError } = await supabase
    .from("invite_tokens")
    .select("event_id, events(id, capacity, is_public)")
    .eq("token", token)
    .eq("is_active", true)
    .single();

  if (tokenError || !tokenData) {
    return {
      error: "유효하지 않은 초대 링크입니다.",
      code: "INVALID_TOKEN",
    };
  }

  const eventId = tokenData.event_id;
  // Supabase join 결과가 배열로 반환될 수 있으므로 unknown 경유 캐스팅
  const eventData = (
    Array.isArray(tokenData.events) ? tokenData.events[0] : tokenData.events
  ) as { id: string; capacity: number | null; is_public: boolean } | null;

  // 로그인 사용자 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "로그인이 필요합니다.",
      code: "UNAUTHENTICATED",
    };
  }

  // 중복 멤버 확인
  const { data: existingMember } = await supabase
    .from("event_members")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMember) {
    return {
      error: "이미 이 이벤트의 멤버입니다.",
      code: "ALREADY_MEMBER",
      eventId,
    };
  }

  // 정원 초과 확인 (capacity가 설정된 경우만)
  if (eventData?.capacity != null) {
    const { count: attendingCount } = await supabase
      .from("event_members")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("rsvp_status", "attending");

    if (attendingCount !== null && attendingCount >= eventData.capacity) {
      return {
        error: "정원이 초과되어 참여할 수 없습니다.",
        code: "CAPACITY_EXCEEDED",
      };
    }
  }

  // event_members에 참여자로 추가
  const { error: insertError } = await supabase.from("event_members").insert({
    event_id: eventId,
    user_id: user.id,
    role: "participant",
    rsvp_status: "attending",
  });

  if (insertError) {
    console.error("[joinEventByToken] 멤버 추가 실패:", insertError);
    return {
      error: "이벤트 참여에 실패했습니다.",
      code: "FORBIDDEN",
    };
  }

  return { eventId };
}

/**
 * 공개 이벤트에 직접 참여합니다.
 * - 공개 이벤트 여부 확인
 * - 로그인 확인
 * - 중복 멤버 확인
 * - 정원 초과 확인
 * - event_members insert
 */
export async function joinPublicEvent(
  eventId: string,
): Promise<{ success: true } | MemberError> {
  const supabase = await createClient();

  // 공개 이벤트 여부 확인
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, is_public, capacity")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return {
      error: "이벤트를 찾을 수 없습니다.",
      code: "INVALID_TOKEN",
    };
  }

  if (!event.is_public) {
    return {
      error: "비공개 이벤트에는 초대 링크를 통해서만 참여할 수 있습니다.",
      code: "FORBIDDEN",
    };
  }

  // 로그인 사용자 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "로그인이 필요합니다.",
      code: "UNAUTHENTICATED",
    };
  }

  // 중복 멤버 확인
  const { data: existingMember } = await supabase
    .from("event_members")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMember) {
    return {
      error: "이미 이 이벤트의 멤버입니다.",
      code: "ALREADY_MEMBER",
      eventId,
    };
  }

  // 정원 초과 확인 (capacity가 설정된 경우만)
  if (event.capacity != null) {
    const { count: attendingCount } = await supabase
      .from("event_members")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("rsvp_status", "attending");

    if (attendingCount !== null && attendingCount >= event.capacity) {
      return {
        error: "정원이 초과되어 참여할 수 없습니다.",
        code: "CAPACITY_EXCEEDED",
      };
    }
  }

  // event_members에 참여자로 추가
  const { error: insertError } = await supabase.from("event_members").insert({
    event_id: eventId,
    user_id: user.id,
    role: "participant",
    rsvp_status: "attending",
  });

  if (insertError) {
    console.error("[joinPublicEvent] 멤버 추가 실패:", insertError);
    return {
      error: "이벤트 참여에 실패했습니다.",
      code: "FORBIDDEN",
    };
  }

  return { success: true };
}

/**
 * 초대 토큰을 비활성화합니다.
 * - 로그인 확인
 * - is_event_owner RPC로 권한 확인
 * - invite_tokens.is_active = false 업데이트
 */
export async function deactivateInviteToken(
  eventId: string,
): Promise<{ success: true } | MemberError> {
  const supabase = await createClient();

  // 로그인 사용자 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "로그인이 필요합니다.",
      code: "UNAUTHENTICATED",
    };
  }

  // owner 권한 확인
  const { data: isOwner, error: rpcError } = await supabase.rpc(
    "is_event_owner",
    { p_event_id: eventId },
  );

  if (rpcError) {
    console.error("[deactivateInviteToken] 권한 확인 실패:", rpcError);
    return {
      error: "권한 확인에 실패했습니다.",
      code: "FORBIDDEN",
    };
  }

  if (!isOwner) {
    return {
      error: "초대 토큰을 관리할 권한이 없습니다.",
      code: "FORBIDDEN",
    };
  }

  // 토큰 비활성화
  const { error: updateError } = await supabase
    .from("invite_tokens")
    .update({ is_active: false })
    .eq("event_id", eventId);

  if (updateError) {
    console.error("[deactivateInviteToken] 토큰 비활성화 실패:", updateError);
    return {
      error: "초대 토큰 비활성화에 실패했습니다.",
      code: "FORBIDDEN",
    };
  }

  return { success: true };
}

/**
 * 초대 토큰을 재발급합니다.
 * - 로그인 확인
 * - is_event_owner RPC로 권한 확인
 * - 기존 토큰 비활성화
 * - 새 12자 토큰 생성 및 insert
 */
export async function regenerateInviteToken(
  eventId: string,
): Promise<{ token: string } | MemberError> {
  const supabase = await createClient();

  // 로그인 사용자 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "로그인이 필요합니다.",
      code: "UNAUTHENTICATED",
    };
  }

  // owner 권한 확인
  const { data: isOwner, error: rpcError } = await supabase.rpc(
    "is_event_owner",
    { p_event_id: eventId },
  );

  if (rpcError) {
    console.error("[regenerateInviteToken] 권한 확인 실패:", rpcError);
    return {
      error: "권한 확인에 실패했습니다.",
      code: "FORBIDDEN",
    };
  }

  if (!isOwner) {
    return {
      error: "초대 토큰을 재발급할 권한이 없습니다.",
      code: "FORBIDDEN",
    };
  }

  // 기존 토큰 비활성화
  const { error: deactivateError } = await supabase
    .from("invite_tokens")
    .update({ is_active: false })
    .eq("event_id", eventId);

  if (deactivateError) {
    console.error(
      "[regenerateInviteToken] 기존 토큰 비활성화 실패:",
      deactivateError,
    );
    return {
      error: "기존 초대 토큰 비활성화에 실패했습니다.",
      code: "FORBIDDEN",
    };
  }

  // 새 12자 토큰 생성 (crypto.randomUUID 기반)
  const newToken = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

  // 새 토큰 insert
  const { error: insertError } = await supabase.from("invite_tokens").insert({
    event_id: eventId,
    token: newToken,
    is_active: true,
  });

  if (insertError) {
    console.error("[regenerateInviteToken] 새 토큰 생성 실패:", insertError);
    return {
      error: "초대 토큰 재발급에 실패했습니다.",
      code: "FORBIDDEN",
    };
  }

  return { token: newToken };
}

/**
 * 본인의 RSVP 상태를 변경합니다.
 * - 인증 확인
 * - status 유효성 검증 (attending | absent | pending)
 * - 멤버십 여부 확인
 * - 이벤트 종료(24h 경과) 후 잠금 확인
 * - event_members UPDATE
 */
export async function changeRsvp(
  eventId: string,
  status: string,
): Promise<{ rsvpStatus: string } | MemberError> {
  const supabase = await createClient();

  // 로그인 사용자 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "로그인이 필요합니다.",
      code: "UNAUTHENTICATED",
    };
  }

  // RSVP 상태 유효성 검증
  const validStatuses = ["attending", "absent", "pending"];
  if (!validStatuses.includes(status)) {
    return {
      error: "유효하지 않은 RSVP 상태입니다.",
      code: "INVALID_STATUS",
    };
  }

  // 멤버십 확인
  const { data: memberData, error: memberError } = await supabase
    .from("event_members")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (memberError || !memberData) {
    return {
      error: "이 이벤트의 멤버가 아닙니다.",
      code: "NOT_MEMBER",
    };
  }

  // 이벤트 시작 시각 조회 → 24h 잠금 확인
  const { data: eventData, error: eventError } = await supabase
    .from("events")
    .select("starts_at")
    .eq("id", eventId)
    .single();

  if (eventError || !eventData) {
    return {
      error: "이벤트를 찾을 수 없습니다.",
      code: "NOT_FOUND",
    };
  }

  const startsAt = new Date(eventData.starts_at).getTime();
  if (startsAt + 24 * 60 * 60 * 1000 < Date.now()) {
    return {
      error: "지난 이벤트의 RSVP는 변경할 수 없습니다.",
      code: "EVENT_LOCKED",
    };
  }

  // RSVP 상태 업데이트
  const { error: updateError } = await supabase
    .from("event_members")
    .update({ rsvp_status: status })
    .eq("event_id", eventId)
    .eq("user_id", user.id);

  if (updateError) {
    return {
      error: "RSVP 변경에 실패했습니다.",
      code: "FORBIDDEN",
    };
  }

  return { rsvpStatus: status };
}

/**
 * 이벤트 멤버를 강퇴합니다.
 * - 인증 확인
 * - 자기 자신 강퇴 방지
 * - 요청자 권한 확인 (owner 또는 co_host만 가능)
 * - 대상 멤버 존재 확인
 * - Owner 강퇴 불가 보호
 * - Co-host는 participant만 강퇴 가능
 * - event_members DELETE
 */
export async function kickMember(
  eventId: string,
  targetUserId: string,
): Promise<{ kicked: true } | MemberError> {
  const supabase = await createClient();

  // 로그인 사용자 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: "로그인이 필요합니다.",
      code: "UNAUTHENTICATED",
    };
  }

  // 자기 자신 강퇴 방지
  if (targetUserId === user.id) {
    return {
      error: "자기 자신을 강퇴할 수 없습니다.",
      code: "CANNOT_KICK_SELF",
    };
  }

  // 요청자 역할 확인 (owner 또는 co_host만 강퇴 가능)
  const { data: requesterMember, error: requesterError } = await supabase
    .from("event_members")
    .select("role")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (requesterError || !requesterMember) {
    return {
      error: "이 이벤트의 멤버가 아닙니다.",
      code: "FORBIDDEN",
    };
  }

  const requesterRole = requesterMember.role;
  if (requesterRole !== "owner" && requesterRole !== "co_host") {
    return {
      error: "멤버를 강퇴할 권한이 없습니다.",
      code: "FORBIDDEN",
    };
  }

  // 대상 멤버 역할 확인
  const { data: targetMember, error: targetError } = await supabase
    .from("event_members")
    .select("role")
    .eq("event_id", eventId)
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (targetError || !targetMember) {
    return {
      error: "강퇴할 멤버를 찾을 수 없습니다.",
      code: "NOT_FOUND",
    };
  }

  const targetRole = targetMember.role;

  // Owner 강퇴 불가 보호
  if (targetRole === "owner") {
    return {
      error: "주최자는 강퇴할 수 없습니다.",
      code: "FORBIDDEN",
    };
  }

  // Co-host는 participant만 강퇴 가능 (co_host 해임은 owner 전용)
  if (requesterRole === "co_host" && targetRole === "co_host") {
    return {
      error: "공동주최자 강퇴는 주최자만 할 수 있습니다.",
      code: "FORBIDDEN",
    };
  }

  // 멤버 강퇴 처리
  const { error: deleteError } = await supabase
    .from("event_members")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", targetUserId);

  if (deleteError) {
    return {
      error: "멤버 강퇴에 실패했습니다.",
      code: "FORBIDDEN",
    };
  }

  return { kicked: true };
}
