"use client";

import { useEffect, useState } from "react";
import { addCaffeine, load, removeCaffeine } from "@/lib/storage";
import { AppData } from "@/lib/types";
import {
  HALF_LIFE_MIN,
  PRESETS,
  decayCurve,
  remainingAt,
  sleepImpactAt,
  todayLogs,
  todayTotal,
} from "@/lib/caffeine";
import { Coffee, Plus, X } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

function CaffeineInner() {
  const [data, setData] = useState<AppData>(load());
  const [now, setNow] = useState(Date.now());
  const [bedtime, setBedtime] = useState("23:00");
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [customMg, setCustomMg] = useState(100);
  const [customLabel, setCustomLabel] = useState("");
  const [timeStr, setTimeStr] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      window.removeEventListener("brain-recovery:update", onUpdate);
      clearInterval(t);
    };
  }, []);

  const logs = data.caffeine || [];
  const today = todayLogs(logs);
  const total = todayTotal(logs);
  const remaining = remainingAt(logs, now);

  const bedtimeTs = (() => {
    const [hh, mm] = bedtime.split(":").map(Number);
    const d = new Date();
    d.setHours(hh || 0, mm || 0, 0, 0);
    if (d.getTime() < now) d.setDate(d.getDate() + 1);
    return d.getTime();
  })();

  const impact = sleepImpactAt(logs, bedtimeTs);

  const submit = () => {
    if (picked === null && !customLabel) return;
    const preset = picked !== null ? PRESETS[picked] : null;
    const [hh, mm] = timeStr.split(":").map(Number);
    const ts = (() => {
      const d = new Date();
      d.setHours(hh || 0, mm || 0, 0, 0);
      if (d.getTime() > now) d.setDate(d.getDate() - 1);
      return d.getTime();
    })();
    addCaffeine({
      ts,
      amountMg: preset ? preset.mg : customMg,
      source: preset ? preset.label : customLabel || "其他",
    });
    setOpen(false);
    setPicked(null);
    setCustomLabel("");
    setCustomMg(100);
  };

  const curve = decayCurve(logs, now - 2 * 60 * 60_000, 12, 72);
  const maxMg = Math.max(50, ...curve.map((p) => p.mg));

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500 flex items-center gap-1">
          <Coffee className="h-3.5 w-3.5" /> 咖啡因追蹤
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">看見你體內還有多少咖啡因</h1>
        <p className="text-sm text-ink-500 mt-2 leading-relaxed">
          咖啡因半衰期約 5 小時：下午 2 點喝的咖啡，到晚上 11 點還有四分之一在你血液裡。
        </p>
      </div>

      <div className="card">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-ink-50 dark:bg-ink-900 p-4">
            <div className="text-xs text-ink-500">現在體內</div>
            <div className="text-2xl font-semibold tabular-nums">
              {Math.round(remaining)}
              <span className="text-sm font-normal text-ink-500"> mg</span>
            </div>
          </div>
          <div className="rounded-xl bg-ink-50 dark:bg-ink-900 p-4">
            <div className="text-xs text-ink-500">今日攝取</div>
            <div className="text-2xl font-semibold tabular-nums">
              {total}
              <span className="text-sm font-normal text-ink-500"> mg</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <svg viewBox="0 0 200 80" className="w-full h-24" preserveAspectRatio="none">
            <polyline
              points={curve
                .map(
                  (p, i) =>
                    `${(i / (curve.length - 1)) * 200},${
                      80 - (p.mg / maxMg) * 70 - 5
                    }`
                )
                .join(" ")}
              className="fill-none stroke-warm-500"
              strokeWidth={1.5}
            />
            {(() => {
              const nowIdx = curve.findIndex((p) => p.t >= now);
              if (nowIdx < 0) return null;
              const x = (nowIdx / (curve.length - 1)) * 200;
              return (
                <line
                  x1={x}
                  x2={x}
                  y1={0}
                  y2={80}
                  className="stroke-calm-500 opacity-40"
                  strokeDasharray="3 3"
                />
              );
            })()}
          </svg>
          <div className="flex justify-between text-[10px] text-ink-400 mt-1">
            <span>2 小時前</span>
            <span>現在</span>
            <span>+5 小時</span>
            <span>+10 小時</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-sm font-medium">睡前還會剩多少？</div>
          <input
            type="time"
            value={bedtime}
            onChange={(e) => setBedtime(e.target.value)}
            className="input w-28 text-center"
          />
        </div>
        <div className="flex items-baseline gap-3 mt-2">
          <div className="text-3xl font-semibold tabular-nums">
            {Math.round(impact.remaining)} mg
          </div>
          <div
            className={`text-xs px-2 py-0.5 rounded-full ${
              impact.level === "ok"
                ? "bg-calm-100 text-calm-700"
                : impact.level === "watch"
                ? "bg-warm-100 text-warm-500"
                : "bg-warm-500 text-white"
            }`}
          >
            {impact.level === "ok"
              ? "影響不大"
              : impact.level === "watch"
              ? "可能會影響深睡"
              : "對睡眠影響大"}
          </div>
        </div>
        <p className="text-xs text-ink-500 mt-2">
          {impact.level === "bad" &&
            "建議下次提前 3 小時喝完最後一杯，深睡才不會被偷走。"}
          {impact.level === "watch" &&
            "今天的咖啡可能讓深睡少 10–20%。明天試著早一點喝完。"}
          {impact.level === "ok" && "你的時間抓得不錯。"}
        </p>
      </div>

      <button onClick={() => setOpen(true)} className="btn-primary w-full">
        <Plus className="h-4 w-4" /> 紀錄一杯
      </button>

      {today.length > 0 && (
        <div className="card">
          <div className="text-sm font-medium mb-2">今天</div>
          <ul className="space-y-2">
            {today.map((l) => {
              const d = new Date(l.ts);
              return (
                <li
                  key={l.ts}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <div className="font-medium">{l.source}</div>
                    <div className="text-xs text-ink-500">
                      {String(d.getHours()).padStart(2, "0")}:
                      {String(d.getMinutes()).padStart(2, "0")} · {l.amountMg} mg
                    </div>
                  </div>
                  <button
                    onClick={() => removeCaffeine(l.ts)}
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
            className="w-full max-w-md bg-white dark:bg-ink-950 rounded-2xl p-5 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-lg font-semibold">紀錄咖啡因</h2>
              <button onClick={() => setOpen(false)}>
                <X className="h-5 w-5 text-ink-400" />
              </button>
            </div>
            <div className="space-y-1.5 mb-4">
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPicked(i)}
                  className={`w-full text-left rounded-xl px-3 py-2 text-sm flex items-center justify-between transition ${
                    picked === i
                      ? "bg-calm-700 text-white"
                      : "bg-ink-50 dark:bg-ink-900 hover:bg-ink-100 dark:hover:bg-ink-800"
                  }`}
                >
                  <span>{p.label}</span>
                  <span className={picked === i ? "text-white/80" : "text-ink-500"}>
                    {p.mg} mg
                  </span>
                </button>
              ))}
            </div>
            <div className="text-xs text-ink-500 mb-1">或自訂</div>
            <div className="flex gap-2 mb-3">
              <input
                placeholder="名稱"
                value={customLabel}
                onChange={(e) => {
                  setCustomLabel(e.target.value);
                  if (e.target.value) setPicked(null);
                }}
                className="input flex-1"
              />
              <input
                type="number"
                value={customMg}
                onChange={(e) => setCustomMg(Number(e.target.value) || 0)}
                className="input w-24 text-center"
              />
            </div>
            <div className="text-xs text-ink-500 mb-1">什麼時候喝的？</div>
            <input
              type="time"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              className="input text-center"
            />
            <button onClick={submit} className="btn-primary w-full mt-4">
              加入紀錄
            </button>
          </div>
        </div>
      )}

      <div className="text-xs text-ink-500 text-center">
        半衰期計算採 5 小時（個體差異約 1.5–9 hr）。出處：Matthew Walker《Why We Sleep》。
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <CaffeineInner />
    </ClientOnly>
  );
}
