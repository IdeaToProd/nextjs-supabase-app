/**
 * 이벤트 폼 유효성 검증 스키마 (Zod v4)
 * 이벤트 생성 및 수정 폼에서 공통으로 사용
 */

import { z } from "zod";

/**
 * 이벤트 폼 유효성 검증 스키마
 * - title: 필수, 1~100자
 * - starts_at: ISO 8601 형식의 날짜/시간 문자열 (필수)
 * - location: 필수
 * - description: 선택
 * - capacity: 선택, 1 이상의 정수
 * - is_public: 공개/비공개 여부 (기본값: true)
 */
export const eventFormSchema = z.object({
  title: z
    .string()
    .min(1, "이벤트 이름을 입력해주세요.")
    .max(100, "이벤트 이름은 100자 이내로 입력해주세요."),
  starts_at: z.string().min(1, "날짜 및 시간을 선택해주세요."),
  location: z.string().min(1, "장소를 입력해주세요."),
  description: z.string().optional(),
  capacity: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  }, z.number().int("정수를 입력해주세요.").min(1, "최소 1명 이상이어야 합니다.").nullable().optional()),
  is_public: z.boolean(),
});

/**
 * 이벤트 폼 값 타입
 * z.preprocess 사용으로 infer 타입이 unknown으로 추론되는 문제를 수동 정의로 해결
 */
export type EventFormValues = {
  title: string;
  starts_at: string;
  location: string;
  description?: string;
  capacity?: number | null;
  is_public: boolean;
};
