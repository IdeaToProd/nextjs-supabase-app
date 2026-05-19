"use server";

/**
 * 이벤트 관련 Server Actions
 * 이벤트 생성, 수정, 삭제 및 종속 데이터 개수 조회
 */

import { createClient } from "@/lib/supabase/server";
import type { EventFormValues } from "@/lib/schemas/events";

/**
 * 이벤트를 생성합니다.
 * - 로그인 확인
 * - events 테이블 insert
 * - event_members에 owner로 insert
 * - invite_tokens에 초대 토큰 생성
 */
export async function createEvent(
  values: EventFormValues,
): Promise<{ eventId: string } | { error: string }> {
  const supabase = await createClient();

  // 로그인 사용자 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "로그인이 필요합니다." };
  }

  // 이벤트 생성
  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({
      title: values.title,
      starts_at: values.starts_at,
      location: values.location,
      description: values.description ?? null,
      capacity: values.capacity ?? null,
      is_public: values.is_public,
      owner_id: user.id,
    })
    .select("id")
    .single();

  if (eventError || !event) {
    console.error("[createEvent] 이벤트 생성 실패:", eventError);
    return { error: "이벤트 생성에 실패했습니다." };
  }

  // owner를 event_members에 추가
  const { error: memberError } = await supabase.from("event_members").insert({
    event_id: event.id,
    user_id: user.id,
    role: "owner",
    rsvp_status: "attending",
  });

  if (memberError) {
    console.error("[createEvent] 멤버 추가 실패:", memberError);
    // 이벤트 생성은 성공했으므로 계속 진행
  }

  // 초대 토큰 생성 (crypto.randomUUID 슬라이스로 12자 생성)
  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

  const { error: tokenError } = await supabase.from("invite_tokens").insert({
    event_id: event.id,
    token,
    is_active: true,
  });

  if (tokenError) {
    console.error("[createEvent] 초대 토큰 생성 실패:", tokenError);
    // 토큰 생성 실패는 치명적이지 않으므로 계속 진행
  }

  return { eventId: event.id };
}

/**
 * 이벤트를 수정합니다.
 * - owner 권한 확인 (is_event_owner RPC)
 * - events 테이블 update
 */
export async function updateEvent(
  eventId: string,
  values: EventFormValues,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();

  // 로그인 사용자 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "로그인이 필요합니다." };
  }

  // owner 권한 확인
  const { data: isOwner, error: rpcError } = await supabase.rpc(
    "is_event_owner",
    { p_event_id: eventId },
  );

  if (rpcError) {
    console.error("[updateEvent] 권한 확인 실패:", rpcError);
    return { error: "권한 확인에 실패했습니다." };
  }

  if (!isOwner) {
    return { error: "이벤트를 수정할 권한이 없습니다." };
  }

  // 이벤트 수정
  const { error: updateError } = await supabase
    .from("events")
    .update({
      title: values.title,
      starts_at: values.starts_at,
      location: values.location,
      description: values.description ?? null,
      capacity: values.capacity ?? null,
      is_public: values.is_public,
    })
    .eq("id", eventId);

  if (updateError) {
    console.error("[updateEvent] 이벤트 수정 실패:", updateError);
    return { error: "이벤트 수정에 실패했습니다." };
  }

  return { success: true };
}

/**
 * 이벤트를 삭제합니다 (Hard delete).
 * - owner 권한 확인
 * - events 테이블 삭제 (cascade로 종속 데이터 자동 삭제)
 */
export async function deleteEvent(
  eventId: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();

  // 로그인 사용자 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "로그인이 필요합니다." };
  }

  // owner 권한 확인
  const { data: isOwner, error: rpcError } = await supabase.rpc(
    "is_event_owner",
    { p_event_id: eventId },
  );

  if (rpcError) {
    console.error("[deleteEvent] 권한 확인 실패:", rpcError);
    return { error: "권한 확인에 실패했습니다." };
  }

  if (!isOwner) {
    return { error: "이벤트를 삭제할 권한이 없습니다." };
  }

  // 이벤트 삭제 (cascade 적용)
  const { error: deleteError } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId);

  if (deleteError) {
    console.error("[deleteEvent] 이벤트 삭제 실패:", deleteError);
    return { error: "이벤트 삭제에 실패했습니다." };
  }

  return { success: true };
}

/**
 * 이벤트 종속 데이터 개수를 조회합니다.
 * 삭제 확인 다이얼로그에 표시할 정보를 위해 사용
 */
export async function getEventDependentCounts(eventId: string): Promise<{
  notices: number;
  members: number;
  settlements: number;
  carpools: number;
}> {
  const supabase = await createClient();

  // 병렬로 각 테이블 count 조회
  const [noticesResult, membersResult, settlementsResult, carpoolsResult] =
    await Promise.all([
      supabase
        .from("notices")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId),
      supabase
        .from("event_members")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId),
      supabase
        .from("settlements")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId),
      supabase
        .from("carpools")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId),
    ]);

  return {
    notices: noticesResult.count ?? 0,
    members: membersResult.count ?? 0,
    settlements: settlementsResult.count ?? 0,
    carpools: carpoolsResult.count ?? 0,
  };
}
