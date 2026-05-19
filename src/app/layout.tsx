import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import ReminderTicker from "@/components/ReminderTicker";
import PWARegister from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "大腦不疲勞 · Brain Recovery",
  description: "不是你太懶，是你的大腦真的太累了。8 週微習慣，重啟身心狀態。",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "大腦不疲勞",
  },
};

export const viewport: Viewport = {
  themeColor: "#39529a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen gradient-soft">
        <Nav />
        <ReminderTicker />
        <PWARegister />
        <main className="mx-auto max-w-3xl px-4 pb-24 pt-4 md:pt-8">{children}</main>
      </body>
    </html>
  );
}
