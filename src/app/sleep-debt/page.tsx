"use client";

import { useEffect, useState } from "react";
import { load, setSleepTarget } from "@/lib/storage";
import { AppData } from "@/lib/types";
import {
  debtLevel,
  debtSeries,
  netDebt,
  totalDebt,
  totalSurplus,
} from "@/lib/sleepdebt";
import ClientOnly from "@/components/ClientOnly";
import Link from "next/link";

function SleepDebtInner() {
  const [data, setData] = useState<AppData>(load());

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    return () => window.removeEventListener("brain-recovery:update", onUpdate);
  }, []);

  const target = data.settings.sleepTargetHours ?? 8;
  const series = debtSeries(data.daily, target, 14);
  const debt = totalDebt(series);
  const surplus = totalSurplus(series);
  const net = netDebt(series);
  const level = debtLevel(net);
  const logged = series.filter((p) => p.hours !== null).length;

  const tone =
    level.tone === "ok"
      ? "bg-calm-100 text-calm-700 border-calm-200"
      : level.tone === "watch"
      ? "bg-warm-50 text-warm-500 border-warm-200"
      : "bg-warm-500/10 text-warm-500 border-warm-300";

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500">睡眠債 · 14 天滾動</div>
        <h1 className="text-2xl font-semibold tracking-tight">你欠大腦多少睡眠？</h1>
        <p className="text-sm text-ink-500 mt-2 leading-relaxed">
          一晚少睡 1 小時不會怎樣。連續 14 天每天少 1 小時，等於每天酒駕程度的反應速度。— Matthew Walker
        </p>
      </div>

      {logged < 3 && (
        <div className="card text-sm text-ink-500">
          至少需要 3 天的睡眠時數紀錄才能算。
          <Link href="/daily" className="text-calm-700 dark:text-calm-300 underline ml-1">
            去打卡
          </Link>
        </div>
      )}

      {logged >= 3 && (
        <>
          <div className={`card border ${tone}`}>
            <div className="text-xs opacity-80">{level.label}</div>
            <div className="text-3xl font-semibold mt-1 tabular-nums">
              {net > 0 ? "-" : "+"}
              {Math.abs(net).toFixed(1)}{" "}
              <span className="text-sm font-normal opacity-80">小時</span>
            </div>
            <p className="text-sm mt-2 opacity-90 leading-relaxed">{level.msg}</p>
          </div>

          <div className="card">
            <div className="flex items-baseline justify-between mb-3">
              <div className="text-sm font-medium">14 天每日差額</div>
              <div className="text-xs text-ink-500">目標 {target} 小時</div>
            </div>
            <div className="flex items-end gap-1 h-32 mb-2">
              {series.map((p) => {
                const max = 4;
                const v = p.diff ?? 0;
                const h = Math.min(1, Math.abs(v) / max);
                const bar = h * 56;
                return (
                  <div
                    key={p.date}
                    className="flex-1 flex flex-col items-center justify-center"
                  >
                    <div className="flex-1 flex items-end justify-center w-full">
                      {p.diff !== null && p.diff > 0 && (
                        <div
                          className="w-full rounded-t-sm bg-calm-500/70"
                          style={{ height: `${bar}px` }}
                        />
                      )}
                    </div>
                    <div className="h-px w-full bg-ink-300 dark:bg-ink-700" />
                    <div className="flex-1 flex items-start justify-center w-full">
                      {p.diff !== null && p.diff < 0 && (
                        <div
                          className="w-full rounded-b-sm bg-warm-500/70"
                          style={{ height: `${bar}px` }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-ink-400">
              <span>14 天前</span>
              <span>今天</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <Stat label="累計負債" value={`${debt.toFixed(1)} hr`} />
              <Stat label="累計結餘" value={`${surplus.toFixed(1)} hr`} />
              <Stat label="已紀錄" value={`${logged}/14 天`} />
            </div>
          </div>
        </>
      )}

      <div className="card">
        <div className="text-sm font-medium mb-2">調整你的目標時數</div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={6}
            max={10}
            step={0.5}
            value={target}
            onChange={(e) => setSleepTarget(Number(e.target.value))}
            className="flex-1 accent-calm-600"
          />
          <div className="text-xl font-semibold tabular-nums w-16 text-right">
            {target} h
          </div>
        </div>
        <p className="text-xs text-ink-500 mt-2">
          建議：成人 7–9 小時。青少年 8–10。長期低於 6 小時與許多慢性問題有關。
        </p>
      </div>

      {net > 5 && (
        <div className="card bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10">
          <div className="text-sm font-medium mb-1">怎麼還？</div>
          <ul className="text-sm text-ink-700 dark:text-ink-200 space-y-1.5 mt-2">
            <li>· 不要一次補眠 5 小時。會讓週一更累。</li>
            <li>· 每天提早 30–45 分鐘上床，連續 3–5 天。</li>
            <li>· 中午 10–20 分鐘小睡 OK，超過 30 分鐘會偷走晚上的深睡。</li>
            <li>· 不要靠咖啡因蓋過睡眠債，那只是『借更多』。</li>
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink-50 dark:bg-ink-900 px-3 py-2">
      <div className="text-[10px] text-ink-500">{label}</div>
      <div className="text-sm font-semibold tabular-nums mt-0.5">{value}</div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <SleepDebtInner />
    </ClientOnly>
  );
}
