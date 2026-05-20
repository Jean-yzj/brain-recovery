import SectionHeader from "@/components/SectionHeader";

export default function ActionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SectionHeader
        label="當下行動"
        order="③"
        sub="此刻就做 → 把模式轉成微習慣"
        tone="action"
      />
      {children}
    </>
  );
}
