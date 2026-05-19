import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/layout/header";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "모이다",
  description: "소규모 모임을 위한 가장 가벼운 운영 도구",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      {/* 모바일 앱처럼 보이도록 body에 배경색 적용 */}
      <body
        className={`${geistSans.className} bg-muted/30 antialiased dark:bg-muted/10`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* 모바일 최적화 폭 (430px) 중앙 정렬 컨테이너 */}
          <div className="mx-auto min-h-screen max-w-[520px] bg-background">
            <Suspense>
              <Header />
            </Suspense>
            <main className="pb-16">{children}</main>
          </div>
          <Suspense>
            <BottomTabBar />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
