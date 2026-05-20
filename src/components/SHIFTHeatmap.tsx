"use client";

import { DailyLog } from "@/lib/types";

interface Props {
  daily: DailyLog[];
  days?: number;
}

// 把每天的日誌映射成 SHIFT 5 軸的『今日值』（0–10）
function axisValuesForLog(d: DailyLog | undefined) {
  if (!d) return null;
  // 高分 = 越疲勞
  const sleep = d.sleepQuality ? 10 - d.sleepQuality : 5;
  const tech = d.phoneFatigue ?? 5;
  const stress = d.stress ?? 5;
  const body = Math.min(10, (d.symptoms?.length ?? 0) * 2.5);
  const food = (d.copingHabits ?? []).filter((c) =>
    ["吃甜食", "暴飲暴食", "靠咖啡撐"].includes(c)
  ).length * 3;
  return { sleep, tech, stress, body, food: Math.min(10, food) };
}

const AXES: { key: "sleep" | "tech" | "stress" | "body" | "food"; label: string }[] = [
  { key: "sleep", label: "S 睡眠" },
  { key: "tech", label: "T 科技" },
  { key: "stress", label: "H 壓力" },
  { key: "body", label: "I 身體" },
  { key: "food", label: "F 飲食" },
];

function color(v: number | null) {
  if (v === null) return "bg-ink-100 dark:bg-ink-900";
  if (v <= 2) return "bg-calm-200 dark:bg-calm-900/70";
  if (v <= 4) return "bg-calm-400/80 dark:bg-calm-700/80";
  if (v <= 6) return "bg-warm-200/80 dark:bg-warm-500/40";
  if (v <= 8) return "bg-warm-400/90 dark:bg-warm-500/70";
  return "bg-warm-500 dark:bg-warm-500";
}

export default function SHIFTHeatmap({ daily, days = 30 }: Props) {
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  const cells = dates.map((iso) => {
    const log = daily.find((x) => x.date === iso);
    return { iso, vals: axisValuesForLog(log) };
  });

  return (
    <div className="space-y-2">
      {AXES.map((ax) => (
        <div key={ax.key} className="flex items-center gap-2">
          <div className="text-[10px] text-ink-500 w-16 flex-shrink-0">{ax.label}</div>
          <div className="flex gap-[2px] flex-1">
            {cells.map((c, i) => {
              const v = c.vals ? c.vals[ax.key] : null;
              return (
                <div
                  key={i}
                  className={`flex-1 h-5 rounded-sm ${color(v)}`}
                  title={`${c.iso}${v !== null ? ` · ${v.toFixed(0)}/10` : ""}`}
                />
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between text-[10px] text-ink-400 mt-1">
        <span>{days} 天前</span>
        <div className="flex items-center gap-1">
          <span>低</span>
          {[0, 2, 4, 6, 8, 10].map((v) => (
            <div key={v} className={`w-3 h-3 rounded-sm ${color(v)}`} />
          ))}
          <span>高</span>
        </div>
        <span>今天</span>
      </div>
    </div>
  );
}
