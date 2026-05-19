"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { dummyEvents } from "@/lib/dummy-data";

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
 * 이벤트 수정 페이지
 * 더미 데이터로 초기값 채워 수정 폼 표시
 * 삭제 시 AlertDialog 확인 후 삭제 처리 (더미)
 */
export default function EditEventPage() {
  const router = useRouter();

  /** 더미 이벤트 첫 번째로 초기화 */
  const event = dummyEvents[0];

  const [form, setForm] = useState<EventFormState>({
    title: event.title,
    datetime: event.date.slice(0, 16), // datetime-local 형식
    location: event.location,
    description: event.description,
    maxParticipants: event.maxParticipants?.toString() ?? "",
    visibility: event.isPublic ? "public" : "private",
  });

  /** 텍스트/숫자 필드 변경 핸들러 */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /** 저장 (더미) */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("이벤트가 수정되었습니다! (더미)");
    router.push(`/events/${event.id}`);
  };

  /** 이벤트 삭제 (더미) */
  const handleDelete = () => {
    alert("이벤트가 삭제되었습니다! (더미)");
    router.push("/events");
  };

  return (
    <div className="space-y-4 px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link
          href={`/events/${event.id}`}
          className="text-muted-foreground hover:text-foreground"
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">이벤트 수정</h1>
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

        {/* 저장 / 취소 버튼 */}
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
            저장
          </Button>
        </div>

        {/* 이벤트 삭제 — AlertDialog */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              이벤트 삭제
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>이벤트를 삭제할까요?</AlertDialogTitle>
              <AlertDialogDescription>
                <strong>&ldquo;{event.title}&rdquo;</strong>을 삭제하면
                공지사항, 참여자, 정산, 카풀 데이터({event.memberCount}개
                항목)가 모두 영구적으로 삭제됩니다. 이 작업은 되돌릴 수
                없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
    </div>
  );
}
