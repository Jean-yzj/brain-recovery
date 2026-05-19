"use client";

import { useState, useEffect } from "react";
import { load } from "@/lib/storage";
import { AppData } from "@/lib/types";
import { trend, topStressSources, avg, pauseCount } from "@/lib/insights";
import Sparkline from "@/components/Sparkline";
import ClientOnly from "@/components/ClientOnly";

function InsightsInner() {
  const [data, setData] = useState<AppData>(load());

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    return () => window.removeEventListener("brain-recovery:update", onUpdate);
  }, []);

  const last7 = data.daily.slice(0, 7);

  if (last7.length < 2) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2">
          <div className="text-sm text-ink-500">大腦洞察</div>
          <h1 className="text-2xl font-semibold tracking-tight">先打卡幾天</h1>
        </div>
        <div className="card text-sm text-ink-600 dark:text-ink-300">
          至少需要 2 天的每日打卡，才能開始看到你的模式。
          <br />
          每天 30 秒就好，今天就試試看？
        </div>
      </div>
    );
  }

  const energy = trend(data.daily, "energy");
  const stress = trend(data.daily, "stress");
  const sleep = trend(data.daily, "sleepQuality");
  const focus = trend(data.daily, "focus");
  const phone = trend(data.daily, "phoneFatigue");

  const stressSources = topStressSources(data.daily, 14);

  // Pattern: phone usage vs next-day focus
  const phoneFocusPairs: { phone: number; nextFocus: number }[] = [];
  const sortedAsc = [...data.daily].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 0; i < sortedAsc.length - 1; i++) {
    phoneFocusPairs.push({
      phone: sortedAsc[i].phoneFatigue,
      nextFocus: sortedAsc[i + 1].focus,
    });
  }
  const highPhoneDays = phoneFocusPairs.filter((p) => p.phone >= 7);
  const avgFocusAfterHighPhone = avg(highPhoneDays.map((p) => p.nextFocus));
  const avgFocusOverall = avg(phoneFocusPairs.map((p) => p.nextFocus));

  const symptomCount = new Map<string, number>();
  data.daily.slice(0, 14).forEach((d) =>
    d.symptoms.forEach((s) => symptomCount.set(s, (symptomCount.get(s) ?? 0) + 1))
  );
  const topSymptoms = [...symptomCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const copingCount = new Map<string, number>();
  data.daily.slice(0, 14).forEach((d) =>
    d.copingHabits.forEach((c) => copingCount.set(c, (copingCount.get(c) ?? 0) + 1))
  );
  const topCoping = [...copingCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500">大腦洞察 · 最近 7 天</div>
        <h1 className="text-2xl font-semibold tracking-tight">你的模式</h1>
      </div>

      <div className="card">
        <div className="text-sm font-medium mb-3">日均趨勢</div>
        <div className="space-y-4">
          <TrendRow label="精神" values={energy} />
          <TrendRow label="壓力" values={stress} color="stroke-warm-500" />
          <TrendRow label="睡眠品質" values={sleep} />
          <TrendRow label="專注" values={focus} />
          <TrendRow label="手機疲倦" values={phone} color="stroke-warm-500" />
        </div>
      </div>

      <div className="card">
        <div className="text-sm font-medium mb-2">本週壓力來源排行</div>
        {stressSources.length === 0 ? (
          <div className="text-xs text-ink-500">這幾天沒有勾選壓力來源。</div>
        ) : (
          <ul className="space-y-2">
            {stressSources.slice(0, 6).map((s, i) => (
              <li key={s.source}>
                <div className="flex items-center justify-between text-sm">
                  <span>
                    <span className="text-ink-400 mr-2 tabular-nums">{i + 1}</span>
                    {s.source}
                  </span>
                  <span className="text-xs text-ink-500 tabular-nums">{s.count} 次</span>
                </div>
                <div className="h-1.5 bg-ink-100 dark:bg-ink-800 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-calm-500"
                    style={{ width: `${(s.count / stressSources[0].count) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {topSymptoms.length > 0 && (
        <div className="card">
          <div className="text-sm font-medium mb-2">身體警訊（近 2 週）</div>
          <ul className="flex flex-wrap gap-2">
            {topSymptoms.map(([s, n]) => (
              <li key={s} className="pill bg-warm-50 dark:bg-warm-500/10 border-warm-200/60">
                {s} · {n}
              </li>
            ))}
          </ul>
        </div>
      )}

      {topCoping.length > 0 && (
        <div className="card">
          <div className="text-sm font-medium mb-2">你最常用來撐過去的方式</div>
          <ul className="flex flex-wrap gap-2">
            {topCoping.map(([s, n]) => (
              <li key={s} className="pill">
                {s} · {n}
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-500 mt-3">
            這些不是壞習慣，是大腦在告訴你它需要恢復。重點是看見，不是責怪。
          </p>
        </div>
      )}

      {highPhoneDays.length >= 2 && (
        <div className="card">
          <div className="text-sm font-medium mb-2">手機 × 隔日專注</div>
          <p className="text-sm text-ink-600 dark:text-ink-300">
            在手機疲倦 ≥ 7 的日子之後，
            <br />
            隔天平均專注 <b className="text-calm-700 dark:text-calm-300">{avgFocusAfterHighPhone}</b>
            <span className="text-ink-500"> ／ 整體平均 {avgFocusOverall}</span>
          </p>
          <p className="text-xs text-ink-500 mt-2">
            {avgFocusAfterHighPhone < avgFocusOverall
              ? "看起來：你的大腦在數位過載後，隔天確實會變鈍。"
              : "目前沒有明顯關聯。繼續打卡，模式會越來越清楚。"}
          </p>
        </div>
      )}

      <div className="card">
        <div className="text-sm font-medium mb-2">Brain Pause 使用</div>
        <p className="text-sm text-ink-600 dark:text-ink-300">
          本週你按下「腦袋很滿」<b>{pauseCount(data.pauses, 7)}</b> 次。
        </p>
        <p className="text-xs text-ink-500 mt-1">
          每按一次，就是給大腦一個間隙。不需要完美。
        </p>
      </div>
    </div>
  );
}

function TrendRow({
  label,
  values,
  color,
}: {
  label: string;
  values: number[];
  color?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs text-ink-500">{label}</span>
        <span className="text-xs text-ink-400">平均 {avg(values)}</span>
      </div>
      <Sparkline values={values} color={color} />
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <InsightsInner />
    </ClientOnly>
  );
}
