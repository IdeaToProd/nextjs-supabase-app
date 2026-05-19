import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/layout/header";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { RootShell } from "@/components/layout/RootShell";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "모이다",
  description: "소규모 모임을 위한 가장 가벼운 운영 도구",
};

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${poppins.variable} bg-background text-foreground font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/*
           * RootShell: 경로별 레이아웃 분기
           * - 일반 경로: 모바일 최적화 폭(520px) + Header + BottomTabBar
           * - 어드민 경로(/admin): 풀 와이드 레이아웃 (어드민 자체 헤더 사용)
           */}
          <RootShell
            header={
              <Suspense>
                <Header />
              </Suspense>
            }
            bottomTab={
              <Suspense>
                <BottomTabBar />
              </Suspense>
            }
          >
            {children}
          </RootShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
