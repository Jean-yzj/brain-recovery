import SectionHeader from "@/components/SectionHeader";

export default function AnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SectionHeader
        label="分析洞察"
        order="②"
        sub="看見你的模式 → 找出因果關係"
        tone="analysis"
      />
      {children}
    </>
  );
}
