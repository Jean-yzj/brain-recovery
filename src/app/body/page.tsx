"use client";

import { useEffect, useState } from "react";
import { load } from "@/lib/storage";
import { AppData } from "@/lib/types";
import {
  analyzeSymptoms,
  burnoutSignal,
  copingImpact,
  recoveryAnalysis,
  screenImpact,
  triggerStats,
  weekdayPattern,
} from "@/lib/bodyAnalysis";
import { AXIS_LABEL } from "@/lib/assessment";
import {
  Activity,
  AlertTriangle,
  HeartPulse,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import Link from "next/link";

function BodyInner() {
  const [data, setData] = useState<AppData>(load());

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    return () => window.removeEventListener("brain-recovery:update", onUpdate);
  }, []);

  if (data.daily.length < 3) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2">
          <div className="text-sm text-ink-500 flex items-center gap-1">
            <HeartPulse className="h-3.5 w-3.5" /> 身體 × 大腦分析
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">先打卡幾天</h1>
        </div>
        <div className="card text-sm text-ink-600 dark:text-ink-300">
          至少需要 3 天的每日打卡，才能開始看到模式。
          <Link href="/daily" className="text-calm-700 dark:text-calm-300 underline ml-1">
            去打卡
          </Link>
        </div>
      </div>
    );
  }

  const symptoms = analyzeSymptoms(data.daily, 30);
  const weekday = weekdayPattern(data.daily);
  const recovery = recoveryAnalysis(data.daily);
  const burnout = burnoutSignal(data.daily);
  const triggers = triggerStats(data.triggers || [], 30);
  const coping = copingImpact(data.daily);
  const screen = screenImpact(data.daily, data.screenTime || []);

  const burnoutLabel = ["平穩", "輕微訊號", "中度訊號", "明顯訊號", "高度警戒"][
    burnout.level
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500 flex items-center gap-1">
          <HeartPulse className="h-3.5 w-3.5" /> 身體 × 大腦分析
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">看見你的因果關係</h1>
        <p className="text-sm text-ink-500 mt-2 leading-relaxed">
          症狀不是憑空冒出來的。這頁幫你看：是哪個 SHIFT 軸在推你的身體。
        </p>
      </div>

      {/* 燃盡警戒 */}
      <div
        className={`card ${
          burnout.level >= 3
            ? "bg-warm-50 dark:bg-warm-500/10 border-warm-300"
            : burnout.level >= 1
            ? "bg-warm-50/50 dark:bg-warm-500/5"
            : "bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle
            className={`h-4 w-4 ${
              burnout.level >= 3 ? "text-warm-500" : "text-calm-700 dark:text-calm-300"
            }`}
          />
          <div className="text-sm font-medium">燃盡警戒指標</div>
          <span className="ml-auto text-xs">
            {burnout.level}/4 · {burnoutLabel}
          </span>
        </div>
        {burnout.signals.length === 0 ? (
          <p className="text-sm text-ink-500">
            最近 3 天沒有偵測到顯著的耗竭訊號。維持目前的節奏。
          </p>
        ) : (
          <ul className="text-sm space-y-1 text-ink-700 dark:text-ink-200">
            {burnout.signals.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-warm-500">·</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 症狀 × SHIFT */}
      {symptoms.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-calm-700 dark:text-calm-300" />
            <div className="text-sm font-medium">身體警訊的來源（近 30 天）</div>
          </div>
          <p className="text-xs text-ink-500 mb-4">
            每個症狀的出現天，跟「沒症狀的日子」相比，哪些指標差最多。
          </p>
          <div className="space-y-3">
            {symptoms.slice(0, 6).map((s) => (
              <div key={s.symptom} className="border-t border-ink-200/60 dark:border-ink-800 pt-3 first:border-t-0 first:pt-0">
                <div className="flex items-baseline justify-between mb-1.5">
                  <div className="text-sm font-medium">{s.symptom}</div>
                  <div className="text-xs text-ink-500">{s.total} 天出現</div>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <DeltaCell label="壓力" diff={s.diffStress} inverse={false} />
                  <DeltaCell label="睡眠品質" diff={s.diffSleep} inverse={true} />
                  <DeltaCell label="手機疲倦" diff={s.diffPhone} inverse={false} />
                </div>
                {s.topAxis && (
                  <div className="text-[11px] text-ink-500 mt-2">
                    最相關：
                    <span className="text-calm-700 dark:text-calm-300 font-medium ml-1">
                      {AXIS_LABEL[s.topAxis].name}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-ink-500 mt-3">
            ＋值代表症狀日的指標比平均高，−值代表低。睡眠是越低越累。
          </p>
        </div>
      )}

      {/* 週幾模式 */}
      <div className="card">
        <div className="text-sm font-medium mb-3">週幾模式 · 壓力</div>
        <div className="flex items-end gap-1.5 h-32 mb-2">
          {[1, 2, 3, 4, 5, 6, 0].map((wd) => {
            const w = weekday.find((x) => x.weekday === wd);
            if (!w) return null;
            const max = 10;
            const h = w.count > 0 ? (w.avgStress / max) * 110 : 4;
            return (
              <div key={wd} className="flex-1 flex flex-col items-center">
                <div className="flex-1 flex items-end w-full">
                  <div
                    className={`w-full rounded-t-sm ${
                      w.count === 0
                        ? "bg-ink-100 dark:bg-ink-800"
                        : w.avgStress >= 7
                        ? "bg-warm-500"
                        : w.avgStress >= 5
                        ? "bg-warm-400/80"
                        : "bg-calm-500"
                    }`}
                    style={{ height: `${h}px` }}
                  />
                </div>
                <div className="text-[10px] text-ink-500 mt-1">{w.label.slice(1)}</div>
                {w.count > 0 && (
                  <div className="text-[9px] text-ink-400 tabular-nums">
                    {w.avgStress}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-ink-500">
          {(() => {
            const valid = weekday.filter((w) => w.count >= 2);
            if (valid.length === 0) return "資料不足以呈現模式。";
            const peak = valid.reduce((a, b) =>
              a.avgStress > b.avgStress ? a : b
            );
            const low = valid.reduce((a, b) =>
              a.avgStress < b.avgStress ? a : b
            );
            if (peak.label === low.label) return "目前壓力分布還算平均。";
            return `你的壓力高峰常在 ${peak.label}（${peak.avgStress}），最低在 ${low.label}（${low.avgStress}）。`;
          })()}
        </p>
      </div>

      {/* 高壓恢復速度 */}
      {recovery.events > 0 && (
        <div className="card">
          <div className="text-sm font-medium mb-2">高壓恢復速度</div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-semibold tabular-nums">
              {recovery.avgRecoveryDays ?? "—"}
            </div>
            <div className="text-sm text-ink-500">天</div>
            <div className="ml-auto text-xs text-ink-500">
              偵測到 {recovery.events} 次高壓事件
            </div>
          </div>
          <p className="text-xs text-ink-500 mt-2 leading-relaxed">
            從壓力 ≥ 7 的日子到回到 &lt; 5 的平均天數。
            {(recovery.avgRecoveryDays ?? 0) >= 4 &&
              " 比較久才能放下，可以多用 sigh / walk / release 主動加速。"}
            {(recovery.avgRecoveryDays ?? 0) > 0 && (recovery.avgRecoveryDays ?? 0) <= 2 &&
              " 恢復力不錯。"}
          </p>
        </div>
      )}

      {/* 螢幕時間 × 隔日 */}
      {screen && (
        <div className="card">
          <div className="text-sm font-medium mb-2">螢幕時間 × 隔天</div>
          <p className="text-xs text-ink-500 mb-3">
            螢幕 ≥ 4 小時的日子，隔天指標 vs 整體平均：
          </p>
          <div className="grid grid-cols-3 gap-2">
            <DeltaCellAbsolute
              label="專注"
              high={screen.highScreenNextDayFocus}
              base={screen.overallNextDayFocus}
            />
            <DeltaCellAbsolute
              label="精神"
              high={screen.highScreenNextDayEnergy}
              base={screen.overallNextDayEnergy}
            />
            <DeltaCellAbsolute
              label="睡眠品質"
              high={screen.highScreenNextDaySleep}
              base={screen.overallNextDaySleep}
            />
          </div>
          <p className="text-[11px] text-ink-500 mt-3 leading-relaxed">
            {screen.highScreenNextDayFocus < screen.overallNextDayFocus - 0.3
              ? "你的大腦在高螢幕日之後，隔天確實會變鈍。"
              : "目前沒有明顯的『隔天反噬』。但連續高螢幕仍會慢慢累積。"}
          </p>
        </div>
      )}

      {/* 撐過去方式 × 隔日 */}
      {coping.length > 0 && (
        <div className="card">
          <div className="text-sm font-medium mb-1">撐過去的方式 × 隔天狀態</div>
          <p className="text-xs text-ink-500 mb-3">
            勾選這些方式的隔天，精神平均值對比整體。
          </p>
          <ul className="space-y-2">
            {coping.slice(0, 6).map((c) => (
              <li key={c.habit} className="flex items-center gap-3">
                <div className="flex-1 text-sm">{c.habit}</div>
                <div className="text-xs text-ink-500">{c.count} 次</div>
                <div className="flex items-center gap-1 w-20 justify-end">
                  {c.diffEnergy < 0 ? (
                    <TrendingDown className="h-3.5 w-3.5 text-warm-500" />
                  ) : (
                    <TrendingUp className="h-3.5 w-3.5 text-calm-700 dark:text-calm-300" />
                  )}
                  <span
                    className={`text-sm tabular-nums ${
                      c.diffEnergy < 0
                        ? "text-warm-500"
                        : "text-calm-700 dark:text-calm-300"
                    }`}
                  >
                    {c.diffEnergy > 0 ? "+" : ""}
                    {c.diffEnergy}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-ink-500 mt-3">
            負值代表這個習慣的隔天精神比平均更低 — 它可能在偷你的能量。
          </p>
        </div>
      )}

      {/* 觸發紀錄統計 */}
      {triggers.total > 0 && (
        <div className="card">
          <div className="text-sm font-medium mb-2">衝動觸發紀錄</div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Stat label="總計" value={`${triggers.total}`} />
            <Stat
              label="抵抗成功"
              value={`${triggers.resisted}`}
              tone="calm"
            />
            <Stat label="抵抗率" value={`${Math.round(triggers.resistRate * 100)}%`} />
          </div>
          {triggers.byType.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-ink-500 mb-1.5">衝動類型</div>
              <ul className="space-y-1">
                {triggers.byType.slice(0, 5).map((t) => (
                  <li
                    key={t.type}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{t.type}</span>
                    <span className="text-xs text-ink-500 tabular-nums">
                      {t.resisted}/{t.count} 抵抗
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {triggers.byReason.length > 0 && (
            <div>
              <div className="text-xs text-ink-500 mb-1.5">背後情緒（按發生頻率）</div>
              <ul className="space-y-1">
                {triggers.byReason.slice(0, 5).map((r) => (
                  <li
                    key={r.reason}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{r.reason}</span>
                    <span className="text-xs text-ink-500">
                      {r.count} 次 · 行動率 {r.actedRate}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <Link
        href="/insights"
        className="card flex items-center justify-between hover:shadow-md transition"
      >
        <div>
          <div className="text-sm font-medium">看趨勢、壓力來源、SHIFT 五軸雷達</div>
          <div className="text-xs text-ink-500 mt-1">到「洞察」頁。</div>
        </div>
      </Link>
    </div>
  );
}

function DeltaCell({
  label,
  diff,
  inverse,
}: {
  label: string;
  diff: number;
  inverse: boolean;
}) {
  // 對 stress / phone：diff 正 = 不好（紅）
  // 對 sleep：diff 負 = 不好（紅）
  const isBad = inverse ? diff < -0.3 : diff > 0.3;
  const isGood = inverse ? diff > 0.3 : diff < -0.3;
  return (
    <div
      className={`rounded-lg px-2 py-1.5 ${
        isBad
          ? "bg-warm-50 dark:bg-warm-500/10"
          : isGood
          ? "bg-calm-50 dark:bg-calm-900/30"
          : "bg-ink-50 dark:bg-ink-900"
      }`}
    >
      <div className="text-[10px] text-ink-500">{label}</div>
      <div
        className={`text-sm font-semibold tabular-nums ${
          isBad ? "text-warm-500" : isGood ? "text-calm-700 dark:text-calm-300" : ""
        }`}
      >
        {diff > 0 ? "+" : ""}
        {diff}
      </div>
    </div>
  );
}

function DeltaCellAbsolute({
  label,
  high,
  base,
}: {
  label: string;
  high: number;
  base: number;
}) {
  const diff = Math.round((high - base) * 10) / 10;
  const isBad = diff < -0.3;
  const isGood = diff > 0.3;
  return (
    <div
      className={`rounded-lg px-2 py-2 ${
        isBad
          ? "bg-warm-50 dark:bg-warm-500/10"
          : isGood
          ? "bg-calm-50 dark:bg-calm-900/30"
          : "bg-ink-50 dark:bg-ink-900"
      }`}
    >
      <div className="text-[10px] text-ink-500">{label}</div>
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <div className="text-base font-semibold tabular-nums">{high}</div>
        <div className="text-[10px] text-ink-400">/ {base}</div>
      </div>
      <div
        className={`text-[11px] tabular-nums ${
          isBad ? "text-warm-500" : isGood ? "text-calm-700 dark:text-calm-300" : "text-ink-500"
        }`}
      >
        {diff > 0 ? "+" : ""}
        {diff}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "calm";
}) {
  return (
    <div className="rounded-xl bg-ink-50 dark:bg-ink-900 px-3 py-2">
      <div className="text-[10px] text-ink-500">{label}</div>
      <div
        className={`text-base font-semibold tabular-nums mt-0.5 ${
          tone === "calm" ? "text-calm-700 dark:text-calm-300" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <BodyInner />
    </ClientOnly>
  );
}
