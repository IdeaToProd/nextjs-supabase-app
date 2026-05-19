/** 이벤트 상세 페이지 - 공개 (4섹션 플레이스홀더) */
export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  void params;
  return (
    <div className="container space-y-8 py-8">
      <h1 className="text-2xl font-bold">이벤트 상세</h1>
      <section>
        <h2 className="text-lg font-semibold">공지사항</h2>
        <p className="mt-2 text-muted-foreground">준비 중</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">참여자 (RSVP)</h2>
        <p className="mt-2 text-muted-foreground">준비 중</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">정산</h2>
        <p className="mt-2 text-muted-foreground">준비 중</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold">카풀</h2>
        <p className="mt-2 text-muted-foreground">준비 중</p>
      </section>
    </div>
  );
}
