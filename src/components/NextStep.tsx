"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  title: string;
  reason: string;
  href: string;
  duration?: string;
}

export default function NextStep({ title, reason, href, duration }: Props) {
  return (
    <Link
      href={href}
      className="card flex items-center justify-between hover:shadow-md transition bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10"
    >
      <div className="flex-1">
        <div className="text-[10px] text-calm-700 dark:text-calm-300 uppercase tracking-wide">
          下一步
        </div>
        <div className="text-sm font-medium mt-0.5">{title}</div>
        <div className="text-xs text-ink-500 mt-1">
          {reason}
          {duration && <span className="text-ink-400"> · {duration}</span>}
        </div>
      </div>
      <ArrowRight className="h-5 w-5 text-ink-400 flex-shrink-0 ml-2" />
    </Link>
  );
}
