"use client";

import { useState, useEffect } from "react";
import { PLAN } from "@/lib/plan";
import { load, setPlan, toggleTaskComplete } from "@/lib/storage";
import { AppData } from "@/lib/types";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

function PlanInner() {
  const [data, setData] = useState<AppData>(load());
  const [viewWeek, setViewWeek] = useState<number>(load().plan.currentWeek);

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    return () => window.removeEventListener("brain-recovery:update", onUpdate);
  }, []);

  const week = PLAN.find((p) => p.week === viewWeek)!;
  const completed = data.plan.completedTasks[String(viewWeek)] ?? [];
  const ratio = week.tasks.length
    ? Math.round((completed.length / week.tasks.length) * 100)
    : 0;

  const startPlan = () => {
    setPlan({ startedAt: new Date().toISOString(), currentWeek: 1 });
  };

  const advanceWeek = () => {
    if (data.plan.currentWeek < 8) {
      setPlan({ currentWeek: data.plan.currentWeek + 1 });
      setViewWeek(data.plan.currentWeek + 1);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500">8 週大腦重啟計畫</div>
        <h1 className="text-2xl font-semibold tracking-tight">微習慣，慢慢來</h1>
        {!data.plan.startedAt && (
          <p className="text-sm text-ink-500 mt-1">
            一週只給 1–3 個小任務。第一週的目標只是觀察，不需要改變生活方式。
          </p>
        )}
      </div>

      {!data.plan.startedAt && (
        <button onClick={startPlan} className="btn-primary w-full">
          開始第 1 週
        </button>
      )}

      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {PLAN.map((p) => {
          const isCur = p.week === data.plan.currentWeek;
          const isViewing = p.week === viewWeek;
          const wDone = (data.plan.completedTasks[String(p.week)] ?? []).length;
          const wTotal = p.tasks.length;
          const fullyDone = wDone >= wTotal && wTotal > 0;
          return (
            <button
              key={p.week}
              onClick={() => setViewWeek(p.week)}
              className={`relative flex-shrink-0 w-12 h-14 rounded-xl border text-sm font-semibold flex flex-col items-center justify-center transition ${
                isViewing
                  ? "bg-calm-700 text-white border-calm-700"
                  : fullyDone
                  ? "bg-calm-100 dark:bg-calm-900/30 text-calm-700 dark:text-calm-200 border-calm-200 dark:border-calm-800"
                  : "bg-white dark:bg-ink-900 text-ink-700 dark:text-ink-200 border-ink-200 dark:border-ink-800"
              }`}
            >
              <span className="text-[10px] opacity-80">週</span>
              <span>{p.week}</span>
              {isCur && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-warm-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-ink-500">第 {week.week} 週</div>
            <h2 className="text-xl font-semibold">{week.theme}</h2>
          </div>
          <div className="text-right">
            <div className="text-xs text-ink-500">完成</div>
            <div className="text-lg font-semibold tabular-nums">
              {completed.length}/{week.tasks.length}
            </div>
          </div>
        </div>
        <div className="h-1.5 bg-ink-100 dark:bg-ink-800 rounded-full mt-3 overflow-hidden">
          <div className="h-full bg-calm-500" style={{ width: `${ratio}%` }} />
        </div>
        <p className="text-sm text-ink-600 dark:text-ink-300 mt-3">{week.intro}</p>
      </div>

      <ul className="space-y-2">
        {week.tasks.map((t) => {
          const done = completed.includes(t.id);
          return (
            <li key={t.id}>
              <button
                onClick={() => toggleTaskComplete(week.week, t.id)}
                className={`w-full text-left card transition ${
                  done ? "opacity-70" : "hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                      done
                        ? "bg-calm-700 border-calm-700"
                        : "border-ink-300 dark:border-ink-700"
                    }`}
                  >
                    {done && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`text-sm font-medium ${
                        done ? "line-through text-ink-500" : ""
                      }`}
                    >
                      {t.title}
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5">{t.detail}</div>
                    {t.minutes > 0 && (
                      <div className="text-[11px] text-ink-400 mt-1.5">
                        約 {t.minutes} 分鐘
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {viewWeek === data.plan.currentWeek &&
        completed.length === week.tasks.length &&
        data.plan.currentWeek < 8 && (
          <button onClick={advanceWeek} className="btn-primary w-full">
            這週完成了，進入第 {data.plan.currentWeek + 1} 週
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

      {viewWeek !== data.plan.currentWeek && (
        <div className="text-center text-xs text-ink-500">
          {viewWeek < data.plan.currentWeek
            ? "這是之前的週次，可以隨時回顧。"
            : "這是未來的週次，預覽用。"}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          disabled={viewWeek <= 1}
          onClick={() => setViewWeek(Math.max(1, viewWeek - 1))}
          className="btn-ghost disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" /> 上一週
        </button>
        <button
          disabled={viewWeek >= 8}
          onClick={() => setViewWeek(Math.min(8, viewWeek + 1))}
          className="btn-ghost disabled:opacity-30"
        >
          下一週 <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <PlanInner />
    </ClientOnly>
  );
}
