"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { load, todayISO } from "@/lib/storage";
import { AppData } from "@/lib/types";
import { brainScoreNow, streak, pauseCount, topStressSources } from "@/lib/insights";
import { levelLabel, topAxes, AXIS_LABEL } from "@/lib/assessment";
import BrainScoreRing from "@/components/BrainScoreRing";
import { PLAN } from "@/lib/plan";
import {
  ArrowRight,
  CalendarCheck2,
  Flame,
  Pause,
  Sparkles,
  Wind,
} from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

function DashboardInner() {
  const [data, setData] = useState<AppData>(load());

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    return () => window.removeEventListener("brain-recovery:update", onUpdate);
  }, []);

  const today = todayISO();
  const todayLog = data.daily.find((d) => d.date === today);
  const latest = data.daily[0];
  const score = brainScoreNow(latest);
  const assessment = data.assessments[0];
  const s = streak(data.daily);
  const pauses7 = pauseCount(data.pauses, 7);
  const topStress = topStressSources(data.daily, 7);
  const completedThisWeek =
    (data.plan.completedTasks[String(data.plan.currentWeek)] ?? []).length;
  const totalThisWeek =
    PLAN.find((p) => p.week === data.plan.currentWeek)?.tasks.length ?? 0;
  const currentWeekPlan = PLAN.find((p) => p.week === data.plan.currentWeek);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return "夜深了";
    if (h < 11) return "早安";
    if (h < 14) return "中午好";
    if (h < 18) return "下午好";
    if (h < 22) return "晚上好";
    return "夜深了";
  })();

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500">{greeting}</div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {todayLog ? "今天已經打卡了，給自己一個喘息。" : "今天的大腦，還好嗎？"}
        </h1>
      </div>

      {!assessment && (
        <Link
          href="/assessment"
          className="card flex items-center justify-between hover:shadow-md transition"
        >
          <div>
            <div className="text-sm font-medium">先做一次大腦疲勞檢測</div>
            <div className="text-xs text-ink-500 mt-1">
              12 題、約 90 秒。找出你最累的軸線。
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-ink-400" />
        </Link>
      )}

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-stretch">
          <div className="flex-shrink-0">
            <BrainScoreRing
              score={score ?? assessment?.score ?? 0}
              label={
                latest
                  ? "今日大腦狀態指數"
                  : assessment
                  ? "大腦疲勞指數"
                  : "尚未有資料"
              }
              sub={
                latest
                  ? "基於最近一次每日打卡"
                  : assessment
                  ? levelLabel(assessment.level).tone
                  : "做個檢測或打卡就會出現分數"
              }
            />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3 self-center w-full">
            <Stat label="連續打卡" value={`${s} 天`} icon={<Flame className="h-4 w-4" />} />
            <Stat
              label="本週 Brain Pause"
              value={`${pauses7} 次`}
              icon={<Pause className="h-4 w-4" />}
            />
            <Stat
              label="本週計畫進度"
              value={`${completedThisWeek}/${totalThisWeek}`}
              icon={<CalendarCheck2 className="h-4 w-4" />}
            />
            <Stat
              label="主要壓力來源"
              value={topStress[0]?.source ?? "—"}
              icon={<Wind className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      {!todayLog && (
        <Link
          href="/daily"
          className="card flex items-center justify-between hover:shadow-md transition"
        >
          <div>
            <div className="text-sm font-medium">今天還沒打卡，30 秒就好</div>
            <div className="text-xs text-ink-500 mt-1">
              寫下狀態，幫助大腦看到自己。
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-ink-400" />
        </Link>
      )}

      <Link
        href="/pause"
        className="card flex items-center justify-between hover:shadow-md transition bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10"
      >
        <div>
          <div className="text-sm font-medium flex items-center gap-2">
            <Pause className="h-4 w-4" /> 我現在腦袋很滿
          </div>
          <div className="text-xs text-ink-500 mt-1">
            按一下，給你 1–3 分鐘的暫停練習。
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-ink-400" />
      </Link>

      {assessment && (
        <div className="card">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="text-xs text-ink-500">SHIFT 五軸</div>
              <div className="text-sm font-medium">你最需要修復的方向</div>
            </div>
            <Link
              href="/assessment"
              className="text-xs text-calm-700 dark:text-calm-300 hover:underline"
            >
              重做檢測
            </Link>
          </div>
          <ul className="space-y-2">
            {topAxes(assessment).map(({ axis, score }) => (
              <li key={axis} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-calm-100 dark:bg-calm-900/40 text-calm-700 dark:text-calm-200 flex items-center justify-center text-sm font-semibold">
                  {AXIS_LABEL[axis].icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{AXIS_LABEL[axis].name}</div>
                  <div className="h-1.5 bg-ink-100 dark:bg-ink-800 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-calm-500"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-ink-500 tabular-nums w-8 text-right">
                  {score}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {currentWeekPlan && (
        <Link href="/plan" className="card hover:shadow-md transition block">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-ink-500">
              8 週重啟 · 第 {currentWeekPlan.week} 週
            </div>
            <span className="text-xs text-calm-700 dark:text-calm-300">查看 →</span>
          </div>
          <div className="text-base font-medium">{currentWeekPlan.theme}</div>
          <div className="text-xs text-ink-500 mt-1 line-clamp-2">
            {currentWeekPlan.intro}
          </div>
        </Link>
      )}

      <Link
        href="/report"
        className="card flex items-center justify-between hover:shadow-md transition"
      >
        <div>
          <div className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> 產出本週 AI 報告
          </div>
          <div className="text-xs text-ink-500 mt-1">
            把 7 天紀錄整理成你看得懂的洞察。
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-ink-400" />
      </Link>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-ink-50 dark:bg-ink-900 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[11px] text-ink-500">
        {icon}
        {label}
      </div>
      <div className="text-base font-semibold mt-0.5 truncate">{value}</div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <DashboardInner />
    </ClientOnly>
  );
}
