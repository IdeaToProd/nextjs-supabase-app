"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

/** 이벤트 폼 상태 */
interface EventFormState {
  title: string;
  datetime: string;
  location: string;
  description: string;
  maxParticipants: string;
  visibility: "public" | "private";
}

/**
 * 이벤트 생성 페이지
 * 실제 저장 로직 없음 — UI 마크업 목적의 더미 폼
 */
export default function NewEventPage() {
  const router = useRouter();

  const [form, setForm] = useState<EventFormState>({
    title: "",
    datetime: "",
    location: "",
    description: "",
    maxParticipants: "",
    visibility: "public",
  });

  /** 텍스트/숫자 필드 변경 핸들러 */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /** 폼 제출 (더미) */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("이벤트가 생성되었습니다! (더미)");
    router.push("/events/1");
  };

  return (
    <div className="space-y-4 px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link
          href="/events"
          className="text-muted-foreground hover:text-foreground"
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">이벤트 만들기</h1>
      </div>

      <Separator />

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* 이벤트 이름 */}
        <div className="space-y-1.5">
          <Label htmlFor="title">
            이벤트 이름 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="예) 2024 연말 송년회"
            required
            maxLength={100}
          />
        </div>

        {/* 날짜 및 시간 */}
        <div className="space-y-1.5">
          <Label htmlFor="datetime">
            날짜 및 시간 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="datetime"
            name="datetime"
            type="datetime-local"
            value={form.datetime}
            onChange={handleChange}
            required
          />
        </div>

        {/* 장소 */}
        <div className="space-y-1.5">
          <Label htmlFor="location">
            장소 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="location"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="예) 강남구 역삼동 레스토랑 3층"
            required
          />
        </div>

        {/* 설명 */}
        <div className="space-y-1.5">
          <Label htmlFor="description">설명</Label>
          <Textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="이벤트 소개, 준비물, 주의사항 등을 입력하세요"
            rows={4}
            className="resize-none"
          />
        </div>

        {/* 최대 참여 인원 */}
        <div className="space-y-1.5">
          <Label htmlFor="maxParticipants">
            최대 참여 인원
            <span className="ml-1 text-xs text-muted-foreground">(선택)</span>
          </Label>
          <Input
            id="maxParticipants"
            name="maxParticipants"
            type="number"
            value={form.maxParticipants}
            onChange={handleChange}
            placeholder="제한 없음"
            min={1}
            max={9999}
          />
        </div>

        {/* 공개 / 비공개 */}
        <div className="space-y-1.5">
          <Label htmlFor="visibility">공개 설정</Label>
          <Select
            value={form.visibility}
            onValueChange={(val) =>
              setForm((prev) => ({
                ...prev,
                visibility: val as EventFormState["visibility"],
              }))
            }
          >
            <SelectTrigger id="visibility" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">공개 — 누구나 조회 가능</SelectItem>
              <SelectItem value="private">
                비공개 — 초대 링크로만 접근
              </SelectItem>
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
          >
            취소
          </Button>
          <Button type="submit" className="flex-1">
            이벤트 만들기
          </Button>
        </div>
      </form>
    </div>
  );
}
