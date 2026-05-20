"use client";

import { useEffect, useState } from "react";
import { load } from "@/lib/storage";
import { AppData, DailyLog } from "@/lib/types";
import { brainScoreNow } from "@/lib/insights";
import ClientOnly from "@/components/ClientOnly";

function HistoryInner() {
  const [data, setData] = useState<AppData>(load());
  const [active, setActive] = useState<DailyLog | null>(null);

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    return () => window.removeEventListener("brain-recovery:update", onUpdate);
  }, []);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500">歷史紀錄</div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {data.daily.length === 0 ? "尚未有紀錄" : `共 ${data.daily.length} 天打卡`}
        </h1>
      </div>

      <div className="flex gap-2">
        <a href="/calendar" className="btn-soft flex-1 justify-center">
          月曆視圖
        </a>
        <a href="/body" className="btn-soft flex-1 justify-center">
          身體 × 大腦分析
        </a>
      </div>

      {data.daily.length === 0 && (
        <div className="card text-sm text-ink-500">先到「打卡」頁留下今天的狀態，之後就會出現在這裡。</div>
      )}

      <ul className="space-y-2">
        {data.daily.map((d) => {
          const score = brainScoreNow(d);
          const tone =
            (score ?? 0) >= 70
              ? "bg-calm-100 text-calm-700"
              : (score ?? 0) >= 50
              ? "bg-warm-100 text-warm-500"
              : "bg-ink-100 text-ink-600";
          return (
            <li key={d.date}>
              <button
                onClick={() => setActive(d)}
                className="w-full text-left card hover:shadow-md transition"
              >
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-sm font-medium">{d.date}</div>
                    <div className="text-xs text-ink-500 mt-0.5">
                      精神 {d.energy} · 壓力 {d.stress} · 睡眠 {d.sleepQuality}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${tone} dark:bg-opacity-20`}>
                    {score ?? 0}
                  </div>
                </div>
                {d.stressSources.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {d.stressSources.slice(0, 4).map((s) => (
                      <span key={s} className="pill text-[10px] py-0.5 px-2">
                        {s}
                      </span>
                    ))}
                    {d.stressSources.length > 4 && (
                      <span className="pill text-[10px] py-0.5 px-2">
                        +{d.stressSources.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {active && (
        <div
          onClick={() => setActive(null)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-ink-950 rounded-2xl p-5 max-h-[80vh] overflow-y-auto"
          >
            <div className="text-sm text-ink-500">{active.date}</div>
            <h2 className="text-xl font-semibold mt-1">那天的大腦</h2>
            <ul className="mt-4 space-y-1.5 text-sm">
              <li>精神 <b>{active.energy}</b> / 10</li>
              <li>壓力 <b>{active.stress}</b> / 10</li>
              <li>睡眠品質 <b>{active.sleepQuality}</b> / 10</li>
              <li>專注 <b>{active.focus}</b> / 10</li>
              <li>手機疲倦 <b>{active.phoneFatigue}</b> / 10</li>
            </ul>
            {active.symptoms.length > 0 && (
              <div className="mt-4">
                <div className="text-xs text-ink-500 mb-1">身體警訊</div>
                <div className="flex flex-wrap gap-1">
                  {active.symptoms.map((s) => (
                    <span key={s} className="pill">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {active.copingHabits.length > 0 && (
              <div className="mt-4">
                <div className="text-xs text-ink-500 mb-1">當天怎麼撐過去</div>
                <div className="flex flex-wrap gap-1">
                  {active.copingHabits.map((s) => (
                    <span key={s} className="pill">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {active.stressSources.length > 0 && (
              <div className="mt-4">
                <div className="text-xs text-ink-500 mb-1">壓力來源</div>
                <div className="flex flex-wrap gap-1">
                  {active.stressSources.map((s) => (
                    <span key={s} className="pill">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {active.note && (
              <div className="mt-4">
                <div className="text-xs text-ink-500 mb-1">當天的話</div>
                <p className="text-sm bg-ink-50 dark:bg-ink-900 p-3 rounded-xl">
                  {active.note}
                </p>
              </div>
            )}
            <button
              onClick={() => setActive(null)}
              className="btn-ghost w-full mt-5"
            >
              關閉
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <HistoryInner />
    </ClientOnly>
  );
}
