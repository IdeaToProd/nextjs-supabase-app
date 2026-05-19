/** 초대 링크 진입 페이지 - 공개 */
export default function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  void params;
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold">초대 링크</h1>
      <p className="mt-4 text-muted-foreground">초대 처리 중 (준비 중)</p>
    </div>
  );
}
