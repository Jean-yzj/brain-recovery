"use client";

import { useEffect, useRef, useState } from "react";
import {
  addDeepWork,
  load,
  removeDeepWork,
  setDeepWorkTarget,
} from "@/lib/storage";
import { AppData } from "@/lib/types";
import { Brain, Play, Pause as PauseIcon, RotateCcw, Plus, X, Check } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

const PRESETS = [25, 50, 90];

function isoDate(ts: number) {
  const d = new Date(ts);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function startOfWeekIso(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

function DeepWorkInner() {
  const [data, setData] = useState<AppData>(load());
  const [duration, setDuration] = useState(50);
  const [remaining, setRemaining] = useState(50 * 60);
  const [running, setRunning] = useState(false);
  const [label, setLabel] = useState("");
  const [open, setOpen] = useState(false);
  const [manualMin, setManualMin] = useState(50);
  const [completedToast, setCompletedToast] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    return () => window.removeEventListener("brain-recovery:update", onUpdate);
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRunning(false);
          addDeepWork({
            ts: Date.now(),
            minutes: duration,
            label: label || undefined,
          });
          setCompletedToast(true);
          setTimeout(() => setCompletedToast(false), 3000);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, duration, label]);

  const setPreset = (m: number) => {
    setDuration(m);
    setRemaining(m * 60);
    setRunning(false);
  };

  const sessions = data.deepWork || [];
  const todayKey = isoDate(Date.now());
  const todayMin = sessions
    .filter((s) => isoDate(s.ts) === todayKey)
    .reduce((a, s) => a + s.minutes, 0);

  const weekStart = startOfWeekIso(Date.now());
  const weekSessions = sessions.filter(
    (s) => isoDate(s.ts) >= weekStart
  );
  const weekMin = weekSessions.reduce((a, s) => a + s.minutes, 0);

  const targetMin = data.settings.deepWorkTargetMin ?? 120;
  const todayRatio = Math.min(1, todayMin / targetMin);

  // Last 7 days bar chart
  const last7: { date: string; mins: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const iso = d.toISOString().slice(0, 10);
    const mins = sessions
      .filter((s) => isoDate(s.ts) === iso)
      .reduce((a, s) => a + s.minutes, 0);
    last7.push({ date: iso, mins });
  }
  const maxMin = Math.max(targetMin, ...last7.map((d) => d.mins));

  const addManual = () => {
    if (manualMin <= 0) return;
    addDeepWork({ ts: Date.now(), minutes: manualMin, label: label || undefined });
    setOpen(false);
    setLabel("");
    setManualMin(50);
  };

  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500 flex items-center gap-1">
          <Brain className="h-3.5 w-3.5" /> 深度工作
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">一天 2 小時就夠了</h1>
        <p className="text-sm text-ink-500 mt-2 leading-relaxed">
          Cal Newport：高品質的工作 = 時間 × 專注強度。一天能維持 2–4 小時真正的深度工作，已經是頂尖水準。
        </p>
      </div>

      <div className="card">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-xs text-ink-500">今日</div>
            <div className="text-2xl font-semibold tabular-nums">
              {Math.floor(todayMin / 60)}h {todayMin % 60}m
            </div>
          </div>
          <div className="text-xs text-ink-500">
            目標 {Math.floor(targetMin / 60)}h
            {targetMin % 60 ? ` ${targetMin % 60}m` : ""}
          </div>
        </div>
        <div className="h-1.5 bg-ink-100 dark:bg-ink-800 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-calm-500 transition-all"
            style={{ width: `${todayRatio * 100}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="rounded-xl bg-ink-50 dark:bg-ink-900 px-3 py-2">
            <div className="text-[10px] text-ink-500">本週累計</div>
            <div className="text-sm font-semibold tabular-nums mt-0.5">
              {Math.floor(weekMin / 60)}h {weekMin % 60}m
            </div>
          </div>
          <div className="rounded-xl bg-ink-50 dark:bg-ink-900 px-3 py-2">
            <div className="text-[10px] text-ink-500">本週次數</div>
            <div className="text-sm font-semibold tabular-nums mt-0.5">
              {weekSessions.length}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex gap-2 mb-4">
          {PRESETS.map((m) => (
            <button
              key={m}
              onClick={() => setPreset(m)}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
                duration === m
                  ? "bg-calm-700 text-white"
                  : "bg-ink-50 dark:bg-ink-900 hover:bg-ink-100 dark:hover:bg-ink-800"
              }`}
            >
              {m} 分
            </button>
          ))}
        </div>
        <div className="text-center py-6">
          <div className="text-6xl font-light tabular-nums">
            {String(min).padStart(2, "0")}:{String(sec).padStart(2, "0")}
          </div>
        </div>
        <input
          placeholder="這段在做什麼？（選填）"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="input mb-3"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setRunning((r) => !r)}
            className="btn-primary flex-1"
            disabled={remaining === 0}
          >
            {running ? <PauseIcon className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? "暫停" : remaining < duration * 60 ? "繼續" : "開始"}
          </button>
          <button onClick={() => setPreset(duration)} className="btn-ghost">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        {completedToast && (
          <div className="mt-3 text-sm text-calm-700 dark:text-calm-300 flex items-center gap-2">
            <Check className="h-4 w-4" /> 一段完成。給大腦一點掌聲。
          </div>
        )}
      </div>

      <button onClick={() => setOpen(true)} className="btn-ghost w-full">
        <Plus className="h-4 w-4" /> 補登一段已完成的深度工作
      </button>

      <div className="card">
        <div className="text-sm font-medium mb-3">最近 7 天</div>
        <div className="flex items-end gap-1.5 h-32">
          {last7.map((d) => {
            const h = d.mins > 0 ? Math.max(4, (d.mins / maxMin) * 110) : 2;
            const isToday = d.date === todayKey;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center">
                <div className="flex-1 flex items-end w-full">
                  <div
                    className={`w-full rounded-t-sm ${
                      d.mins >= targetMin
                        ? "bg-calm-600"
                        : d.mins > 0
                        ? "bg-calm-400/70"
                        : "bg-ink-200 dark:bg-ink-800"
                    } ${isToday ? "ring-2 ring-calm-500/30" : ""}`}
                    style={{ height: `${h}px` }}
                  />
                </div>
                <div className="text-[10px] text-ink-400 mt-1">
                  {d.date.slice(5).replace("-", "/")}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end mt-2">
          <span className="text-[10px] text-ink-400">
            橫線：目標 {Math.floor(targetMin / 60)}h
          </span>
        </div>
      </div>

      <div className="card">
        <div className="text-sm font-medium mb-2">調整每日目標</div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={30}
            max={240}
            step={15}
            value={targetMin}
            onChange={(e) => setDeepWorkTarget(Number(e.target.value))}
            className="flex-1 accent-calm-600"
          />
          <div className="text-base font-semibold tabular-nums w-16 text-right">
            {Math.floor(targetMin / 60)}h
            {targetMin % 60 ? ` ${targetMin % 60}m` : ""}
          </div>
        </div>
        <p className="text-xs text-ink-500 mt-2">
          建議：初心者 60–90 分鐘起步，老手 2–4 小時。超過 4 小時通常品質會掉。
        </p>
      </div>

      {sessions.slice(0, 5).length > 0 && (
        <div className="card">
          <div className="text-sm font-medium mb-2">最近紀錄</div>
          <ul className="space-y-2">
            {sessions.slice(0, 5).map((s) => {
              const d = new Date(s.ts);
              return (
                <li
                  key={s.ts}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <div className="font-medium">
                      {s.minutes} 分 {s.label && `· ${s.label}`}
                    </div>
                    <div className="text-xs text-ink-500">
                      {d.toLocaleDateString()}{" "}
                      {String(d.getHours()).padStart(2, "0")}:
                      {String(d.getMinutes()).padStart(2, "0")}
                    </div>
                  </div>
                  <button
                    onClick={() => removeDeepWork(s.ts)}
                    className="text-ink-400 hover:text-warm-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-ink-950 rounded-2xl p-5"
          >
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-lg font-semibold">補登一段</h2>
              <button onClick={() => setOpen(false)}>
                <X className="h-5 w-5 text-ink-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-ink-500 mb-1">時長（分鐘）</div>
                <input
                  type="number"
                  min={5}
                  max={300}
                  value={manualMin}
                  onChange={(e) => setManualMin(Number(e.target.value) || 0)}
                  className="input text-center"
                />
              </div>
              <div>
                <div className="text-xs text-ink-500 mb-1">在做什麼？（選填）</div>
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="input"
                />
              </div>
              <button onClick={addManual} className="btn-primary w-full">
                加入紀錄
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-ink-500 text-center">
        出處：Cal Newport《Deep Work》
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <DeepWorkInner />
    </ClientOnly>
  );
}
