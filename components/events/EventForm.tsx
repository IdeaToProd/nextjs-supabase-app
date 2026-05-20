"use client";

/**
 * 이벤트 생성/수정 폼 컴포넌트
 * React Hook Form + Zod를 사용하여 유효성 검증
 * createEvent / updateEvent Server Action을 호출
 */

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { eventFormSchema, type EventFormValues } from "@/lib/schemas/events";
import { createEvent, updateEvent } from "@/app/actions/events";

interface EventFormProps {
  /** 폼 모드: 생성 또는 수정 */
  mode: "create" | "edit";
  /** 수정 모드일 때 이벤트 ID */
  eventId?: string;
  /** 수정 모드일 때 기존 값 */
  defaultValues?: Partial<EventFormValues>;
}

/**
 * UTC ISO 문자열을 브라우저 로컬 시간 기준 datetime-local 형식으로 변환
 * new Date()가 UTC → 로컬 시간대(KST 등)로 자동 변환하므로
 * getHours() / getMinutes()는 로컬 시간을 반환합니다.
 * 예) "2025-12-28T09:00:00.000Z" (UTC) → "2025-12-28T18:00" (KST)
 */
function toDatetimeLocalValue(isoString?: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * datetime-local 값을 ISO 8601 형식으로 변환
 * 예) "2025-12-28T18:00" → "2025-12-28T18:00:00.000Z"
 */
function toIsoString(datetimeLocalValue: string): string {
  if (!datetimeLocalValue) return "";
  return new Date(datetimeLocalValue).toISOString();
}

/**
 * 이벤트 생성/수정 폼 컴포넌트
 * - create 모드: 새 이벤트 생성 후 /events/{id}로 이동
 * - edit 모드: 기존 이벤트 수정 후 /events/{id}로 이동
 */
export function EventForm({ mode, eventId, defaultValues }: EventFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(eventFormSchema) as any,
    defaultValues: {
      title: defaultValues?.title ?? "",
      starts_at: toDatetimeLocalValue(defaultValues?.starts_at),
      location: defaultValues?.location ?? "",
      description: defaultValues?.description ?? "",
      capacity: defaultValues?.capacity ?? null,
      is_public: defaultValues?.is_public ?? true,
    },
  });

  const isPublicValue = watch("is_public");

  /**
   * 폼 제출 핸들러
   * 모드에 따라 createEvent 또는 updateEvent 호출
   */
  const onSubmit = async (values: EventFormValues) => {
    setServerError(null);

    // datetime-local 값을 ISO 문자열로 변환
    const payload: EventFormValues = {
      ...values,
      starts_at: toIsoString(values.starts_at),
    };

    if (mode === "create") {
      const result = await createEvent(payload);

      if ("error" in result) {
        setServerError(result.error);
        return;
      }

      router.push(`/events/${result.eventId}`);
    } else {
      if (!eventId) {
        setServerError("이벤트 ID가 없습니다.");
        return;
      }

      const result = await updateEvent(eventId, payload);

      if ("error" in result) {
        setServerError(result.error);
        return;
      }

      router.push(`/events/${eventId}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* 서버 에러 메시지 */}
      {serverError && (
        <div
          role="alert"
          className="border-destructive/50 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm"
        >
          {serverError}
        </div>
      )}

      {/* 이벤트 이름 */}
      <div className="space-y-1.5">
        <Label htmlFor="title">
          이벤트 이름 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="예) 2024 연말 송년회"
          maxLength={100}
          aria-invalid={!!errors.title}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-destructive text-xs">{errors.title.message}</p>
        )}
      </div>

      {/* 날짜 및 시간 */}
      <div className="space-y-1.5">
        <Label htmlFor="starts_at">
          날짜 및 시간 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="starts_at"
          type="datetime-local"
          aria-invalid={!!errors.starts_at}
          {...register("starts_at")}
        />
        {errors.starts_at && (
          <p className="text-destructive text-xs">{errors.starts_at.message}</p>
        )}
      </div>

      {/* 장소 */}
      <div className="space-y-1.5">
        <Label htmlFor="location">
          장소 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="location"
          placeholder="예) 강남구 역삼동 레스토랑 3층"
          aria-invalid={!!errors.location}
          {...register("location")}
        />
        {errors.location && (
          <p className="text-destructive text-xs">{errors.location.message}</p>
        )}
      </div>

      {/* 설명 */}
      <div className="space-y-1.5">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          placeholder="이벤트 소개, 준비물, 주의사항 등을 입력하세요"
          rows={4}
          className="resize-none"
          {...register("description")}
        />
      </div>

      {/* 최대 참여 인원 */}
      <div className="space-y-1.5">
        <Label htmlFor="capacity">
          최대 참여 인원
          <span className="text-muted-foreground ml-1 text-xs">(선택)</span>
        </Label>
        <Input
          id="capacity"
          type="number"
          placeholder="제한 없음"
          min={1}
          max={9999}
          aria-invalid={!!errors.capacity}
          {...register("capacity")}
        />
        {errors.capacity && (
          <p className="text-destructive text-xs">{errors.capacity.message}</p>
        )}
      </div>

      {/* 공개 / 비공개 */}
      <div className="space-y-1.5">
        <Label htmlFor="is_public">공개 설정</Label>
        <Select
          value={isPublicValue ? "public" : "private"}
          onValueChange={(val) =>
            setValue("is_public", val === "public", { shouldValidate: true })
          }
        >
          <SelectTrigger id="is_public" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">공개 — 누구나 조회 가능</SelectItem>
            <SelectItem value="private">비공개 — 초대 링크로만 접근</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* 버튼 행 */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting
            ? mode === "create"
              ? "생성 중..."
              : "저장 중..."
            : mode === "create"
              ? "이벤트 만들기"
              : "저장"}
        </Button>
      </div>
    </form>
  );
}
