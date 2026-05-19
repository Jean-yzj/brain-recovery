"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardCheck,
  CalendarDays,
  Pause,
  ListChecks,
  BarChart3,
  Sparkles,
  Settings,
} from "lucide-react";

const items = [
  { href: "/", label: "今日", icon: Home },
  { href: "/assessment", label: "檢測", icon: ClipboardCheck },
  { href: "/daily", label: "打卡", icon: CalendarDays },
  { href: "/pause", label: "暫停", icon: Pause },
  { href: "/plan", label: "8 週", icon: ListChecks },
  { href: "/insights", label: "洞察", icon: BarChart3 },
  { href: "/report", label: "報告", icon: Sparkles },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink-200/60 dark:border-ink-800/70 bg-white/60 dark:bg-ink-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-calm-600" />
            大腦不疲勞
          </Link>
          <Link href="/settings" className="text-ink-500 hover:text-ink-800 dark:hover:text-ink-100">
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </header>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink-200/70 dark:border-ink-800/80 bg-white/85 dark:bg-ink-950/85 backdrop-blur">
        <ul className="mx-auto flex max-w-3xl items-center justify-between px-2 py-1.5">
          {items.map((it) => {
            const Active = pathname === it.href;
            const Icon = it.icon;
            return (
              <li key={it.href} className="flex-1">
                <Link
                  href={it.href}
                  className={`flex flex-col items-center gap-0.5 rounded-xl px-1.5 py-2 text-[11px] transition ${
                    Active
                      ? "text-calm-700 dark:text-calm-300"
                      : "text-ink-500 hover:text-ink-800 dark:hover:text-ink-100"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={Active ? 2.5 : 1.8} />
                  <span>{it.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
