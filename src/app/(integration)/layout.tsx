import SectionHeader from "@/components/SectionHeader";

export default function IntegrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SectionHeader
        label="整合"
        order="④"
        sub="接到外部世界 → Google / 知識庫"
        tone="integration"
      />
      {children}
    </>
  );
}
