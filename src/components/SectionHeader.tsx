import Link from "next/link";
import { Home } from "lucide-react";

const TONES: Record<
  string,
  { label: string; bg: string; text: string; ring: string }
> = {
  data: {
    label: "data",
    bg: "bg-calm-100/70 dark:bg-calm-900/40",
    text: "text-calm-700 dark:text-calm-200",
    ring: "ring-calm-200/60 dark:ring-calm-800",
  },
  analysis: {
    label: "analysis",
    bg: "bg-warm-100/60 dark:bg-warm-500/15",
    text: "text-warm-500",
    ring: "ring-warm-200/60",
  },
  action: {
    label: "action",
    bg: "bg-emerald-50/60 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-300",
    ring: "ring-emerald-200/60 dark:ring-emerald-800/60",
  },
  integration: {
    label: "integration",
    bg: "bg-ink-100 dark:bg-ink-800/60",
    text: "text-ink-700 dark:text-ink-200",
    ring: "ring-ink-200/60 dark:ring-ink-700",
  },
};

interface Props {
  label: string;
  order: string; // ①②③④
  sub?: string;
  tone?: keyof typeof TONES;
}

export default function SectionHeader({ label, order, sub, tone = "data" }: Props) {
  const t = TONES[tone] ?? TONES.data;
  return (
    <div className={`-mx-4 -mt-4 md:-mt-8 mb-2 px-4 pt-3 pb-2 ${t.bg}`}>
      <div className="mx-auto max-w-3xl flex items-center gap-2 text-xs">
        <Link href="/" className="text-ink-500 hover:text-ink-700 dark:hover:text-ink-200 inline-flex items-center gap-1">
          <Home className="h-3 w-3" />
          首頁
        </Link>
        <span className="text-ink-400">/</span>
        <span className={`inline-flex items-center gap-1.5 font-medium ${t.text}`}>
          <span className="opacity-70">{order}</span>
          {label}
        </span>
        {sub && <span className="text-ink-400 hidden md:inline">— {sub}</span>}
      </div>
    </div>
  );
}
