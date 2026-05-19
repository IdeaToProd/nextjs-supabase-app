import Link from "next/link";
import { Calendar, Bell, CreditCard, Car, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/common/EventCard";
import { dummyEvents } from "@/lib/dummy-data";

/**
 * 홈 페이지
 * - 히어로 섹션: 서비스 소개 + CTA
 * - 공개 이벤트 그리드 (6개)
 * - 주요 기능 소개 섹션
 */
export default function Home() {
  /** 공개 이벤트 중 최신 6개만 표시 */
  const publicEvents = dummyEvents.filter((e) => e.isPublic).slice(0, 6);

  /** 주요 기능 소개 카드 데이터 */
  const features = [
    {
      icon: Bell,
      label: "공지사항",
      description: "멤버에게 중요한 소식을 이메일로 즉시 전달",
    },
    {
      icon: Calendar,
      label: "RSVP 관리",
      description: "참석/불참/미정 현황을 한눈에 파악",
    },
    {
      icon: CreditCard,
      label: "정산",
      description: "모임 경비를 자동으로 나눠 계산",
    },
    {
      icon: Car,
      label: "카풀",
      description: "탑승자와 운전자를 간편하게 배정",
    },
  ] as const;

  return (
    <div className="space-y-10 pb-4">
      {/* ── 히어로 섹션 ── */}
      <section className="bg-gradient-to-b from-primary/10 to-background px-4 py-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          모이다
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          한 번의 모임을 위한, 가장 가벼운 운영 도구
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Button asChild size="lg" className="w-full max-w-xs">
            <Link href="/events/new">이벤트 시작하기</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/events">
              공개 이벤트 둘러보기
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── 공개 이벤트 그리드 ── */}
      <section className="px-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">공개 이벤트</h2>
          <Button asChild variant="ghost" size="sm" className="text-xs">
            <Link href="/events">
              전체 보기
              <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* 가로형 리스트: 한 줄씩 나열 */}
        <div className="flex flex-col gap-2">
          {publicEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* ── 기능 소개 섹션 ── */}
      <section className="px-4">
        <h2 className="mb-4 text-lg font-semibold">모이다로 할 수 있는 것</h2>
        <div className="grid grid-cols-2 gap-3">
          {features.map(({ icon: Icon, label, description }) => (
            <div
              key={label}
              className="flex flex-col gap-2 rounded-xl border bg-card p-4 dark:bg-card"
            >
              {/* 기능 아이콘 */}
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
