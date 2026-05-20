// Route group layout — used by all pages under (data)/
// 第一層：資料輸入 — 餵 App 你的狀態資料
import SectionHeader from "@/components/SectionHeader";

export default function DataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SectionHeader
        label="資料輸入"
        order="①"
        sub="紀錄你的狀態 → 餵給 coach 引擎"
        tone="data"
      />
      {children}
    </>
  );
}
