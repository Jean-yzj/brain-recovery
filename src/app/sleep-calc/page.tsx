"use client";

import { useState } from "react";
import { Moon, Sun, ArrowRight } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import { load } from "@/lib/storage";
import { CHRONOTYPE_PROFILE } from "@/lib/chronotype";

const CYCLE_MIN = 90;
const FALL_ASLEEP_MIN = 14;

function fmt(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function addMin(base: Date, min: number) {
  return new Date(base.getTime() + min * 60_000);
}

function SleepCalcInner() {
  const ct = load().chronotype;
  const [mode, setMode] = useState<"wake" | "sleep">("wake");
  const [t, setT] = useState(() => {
    const d = new Date();
    d.setHours(7, 0, 0, 0);
    return fmt(d);
  });

  const ref = (() => {
    const [hh, mm] = t.split(":").map(Number);
    const d = new Date();
    d.setHours(hh || 0, mm || 0, 0, 0);
    return d;
  })();

  let bedtimes: Date[] = [];
  let wakeTimes: Date[] = [];

  if (mode === "wake") {
    for (let cycles = 6; cycles >= 3; cycles--) {
      bedtimes.push(addMin(ref, -(cycles * CYCLE_MIN + FALL_ASLEEP_MIN)));
    }
  } else {
    for (let cycles = 4; cycles <= 6; cycles++) {
      wakeTimes.push(addMin(ref, cycles * CYCLE_MIN + FALL_ASLEEP_MIN));
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500">睡眠週期計算器</div>
        <h1 className="text-2xl font-semibold tracking-tight">90 分鐘一輪</h1>
        <p className="text-sm text-ink-500 mt-2 leading-relaxed">
          你的睡眠由 90 分鐘的 cycle 構成（淺、深、REM 各一輪）。從 cycle 之間醒來，比在深睡中被叫醒舒服很多。
        </p>
      </div>

      <div className="flex gap-1.5 p-1 rounded-full bg-ink-100 dark:bg-ink-800 w-fit">
        <button
          onClick={() => setMode("wake")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            mode === "wake" ? "bg-white dark:bg-ink-900 shadow-sm" : "text-ink-500"
          }`}
        >
          我要幾點起
        </button>
        <button
          onClick={() => setMode("sleep")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            mode === "sleep" ? "bg-white dark:bg-ink-900 shadow-sm" : "text-ink-500"
          }`}
        >
          我現在/這時候要睡
        </button>
      </div>

      <div className="card">
        <label className="label">
          {mode === "wake" ? "我希望幾點起床？" : "我要幾點上床睡覺？"}
        </label>
        <input
          type="time"
          value={t}
          onChange={(e) => setT(e.target.value)}
          className="input mt-2 text-2xl text-center tabular-nums"
        />
        <p className="text-xs text-ink-500 mt-3">
          已加入 {FALL_ASLEEP_MIN} 分鐘的平均入睡時間。
        </p>
      </div>

      {mode === "wake" ? (
        <div className="card">
          <div className="flex items-center gap-2 text-sm font-medium mb-3">
            <Moon className="h-4 w-4 text-calm-700 dark:text-calm-300" />
            建議的上床時間
          </div>
          <ul className="space-y-2">
            {bedtimes.map((b, i) => {
              const cycles = bedtimes.length - i + 2;
              const hours = (cycles * CYCLE_MIN) / 60;
              return (
                <li
                  key={i}
                  className="flex items-baseline justify-between rounded-xl bg-ink-50 dark:bg-ink-900 px-4 py-3"
                >
                  <div className="text-xl font-semibold tabular-nums">{fmt(b)}</div>
                  <div className="text-xs text-ink-500">
                    {cycles} 個 cycle · 約 {hours.toFixed(1)} 小時
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-ink-500 mt-3">
            5–6 個 cycle（7.5–9 小時）對大多數人最理想。
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center gap-2 text-sm font-medium mb-3">
            <Sun className="h-4 w-4 text-warm-500" />
            建議的起床時間
          </div>
          <ul className="space-y-2">
            {wakeTimes.map((w, i) => {
              const cycles = i + 4;
              const hours = (cycles * CYCLE_MIN) / 60;
              return (
                <li
                  key={i}
                  className="flex items-baseline justify-between rounded-xl bg-ink-50 dark:bg-ink-900 px-4 py-3"
                >
                  <div className="text-xl font-semibold tabular-nums">{fmt(w)}</div>
                  <div className="text-xs text-ink-500">
                    {cycles} 個 cycle · 約 {hours.toFixed(1)} 小時
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {ct && (
        <div className="card bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10">
          <div className="text-xs text-ink-500 mb-1">你的 chronotype 建議</div>
          <div className="text-sm font-medium">
            就寢 {CHRONOTYPE_PROFILE[ct.type].sleepWindow} · 起床 {CHRONOTYPE_PROFILE[ct.type].wakeWindow}
          </div>
        </div>
      )}

      {!ct && (
        <a
          href="/chronotype"
          className="card flex items-center justify-between hover:shadow-md transition"
        >
          <div>
            <div className="text-sm font-medium">想要更個人化的建議？</div>
            <div className="text-xs text-ink-500 mt-1">先做 Chronotype 測驗。</div>
          </div>
          <ArrowRight className="h-5 w-5 text-ink-400" />
        </a>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <SleepCalcInner />
    </ClientOnly>
  );
}
