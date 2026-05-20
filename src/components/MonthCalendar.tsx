"use client";

import { AppData, DailyLog } from "@/lib/types";
import { brainScoreNow } from "@/lib/insights";

interface Props {
  data: AppData;
  monthDate: Date; // any date in the target month
  onPickDay?: (iso: string) => void;
  selectedIso?: string;
}

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

function isoOf(d: Date) {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
}

function scoreTone(score: number | null): string {
  if (score === null)
    return "bg-ink-50 dark:bg-ink-900/40 text-ink-300 dark:text-ink-700";
  if (score >= 75) return "bg-calm-200 dark:bg-calm-900/60 text-calm-800 dark:text-calm-100";
  if (score >= 60) return "bg-calm-100 dark:bg-calm-900/40 text-calm-700 dark:text-calm-200";
  if (score >= 45) return "bg-warm-100 dark:bg-warm-500/20 text-warm-500";
  return "bg-warm-200 dark:bg-warm-500/40 text-warm-500";
}

export default function MonthCalendar({
  data,
  monthDate,
  onPickDay,
  selectedIso,
}: Props) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  // Monday-first: convert Sun=0..Sat=6 → Mon=0..Sun=6
  const firstWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = isoOf(today);

  // Build cells: leading empty + days + trailing empty to fill 6 rows × 7 cols
  const cells: { iso: string | null; date: Date | null }[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ iso: null, date: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    cells.push({ iso: isoOf(dt), date: dt });
  }
  while (cells.length % 7 !== 0) cells.push({ iso: null, date: null });

  // Build per-date markers
  const pauseDays = new Set<string>();
  (data.pauses || []).forEach((p) => pauseDays.add(isoOf(new Date(p.date))));
  const walkDays = new Set<string>();
  (data.walks || []).forEach((p) => walkDays.add(isoOf(new Date(p.ts))));
  const questDays = new Set<string>(
    (data.quests || []).filter((q) => q.completed).map((q) => q.date)
  );
  const sighDays = new Set<string>();
  (data.sighs || []).forEach((s) => sighDays.add(isoOf(new Date(s.ts))));
  const releaseDays = new Set<string>();
  (data.releases || []).forEach((r) => releaseDays.add(isoOf(new Date(r.ts))));

  const findLog = (iso: string): DailyLog | undefined =>
    data.daily.find((d) => d.date === iso);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`text-[11px] text-center py-1 ${
              i >= 5 ? "text-warm-500/70" : "text-ink-500"
            }`}
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          if (!c.iso || !c.date) {
            return <div key={`empty-${i}`} className="aspect-square" />;
          }
          const log = findLog(c.iso);
          const score = log ? brainScoreNow(log) : null;
          const isToday = c.iso === todayIso;
          const isFuture = c.date.getTime() > today.getTime();
          const isSelected = c.iso === selectedIso;
          const day = c.date.getDate();
          const markers: string[] = [];
          if (pauseDays.has(c.iso)) markers.push("P");
          if (walkDays.has(c.iso)) markers.push("W");
          if (sighDays.has(c.iso)) markers.push("S");
          if (questDays.has(c.iso)) markers.push("Q");
          if (releaseDays.has(c.iso)) markers.push("R");

          return (
            <button
              key={c.iso}
              disabled={isFuture}
              onClick={() => onPickDay?.(c.iso!)}
              className={`aspect-square rounded-lg p-1.5 text-left transition relative
                ${scoreTone(score)}
                ${isFuture ? "opacity-30 cursor-default" : "hover:ring-2 hover:ring-calm-400/40"}
                ${isSelected ? "ring-2 ring-calm-700 dark:ring-calm-300" : ""}
                ${isToday ? "outline outline-1 outline-warm-400" : ""}
              `}
            >
              <div className="flex items-baseline justify-between">
                <div className={`text-xs font-medium tabular-nums ${
                  isToday ? "text-warm-500" : ""
                }`}>
                  {day}
                </div>
                {score !== null && (
                  <div className="text-[9px] tabular-nums opacity-70">{score}</div>
                )}
              </div>
              {markers.length > 0 && (
                <div className="absolute bottom-1 right-1 flex gap-[1px]">
                  {markers.slice(0, 5).map((m, idx) => (
                    <div
                      key={idx}
                      className="w-1.5 h-1.5 rounded-full bg-current opacity-60"
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
