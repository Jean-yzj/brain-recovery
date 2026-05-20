"use client";

import { useEffect, useState } from "react";
import { load, setTodayQuest, todayISO } from "@/lib/storage";
import { AppData } from "@/lib/types";
import {
  CATEGORY_LABEL,
  pickDailyQuest,
  pickRandomQuest,
  QUESTS,
} from "@/lib/quests";
import { Check, Sparkles, RefreshCw, Flame } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

function QuestInner() {
  const [data, setData] = useState<AppData>(load());

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    return () => window.removeEventListener("brain-recovery:update", onUpdate);
  }, []);

  const today = todayISO();
  const todayState = (data.quests || []).find((q) => q.date === today);
  const todayQuest = todayState
    ? QUESTS.find((q) => q.id === todayState.questId) ?? pickDailyQuest(today)
    : pickDailyQuest(today);

  useEffect(() => {
    if (!todayState) {
      setTodayQuest({ date: today, questId: todayQuest.id, completed: false });
    }
  }, [today, todayQuest.id, todayState]);

  const completed = todayState?.completed ?? false;
  const rerolled = todayState?.rerolled ?? false;

  // Streak of completed quests (consecutive days back from today)
  let streak = 0;
  const sorted = [...(data.quests || [])].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const todayD = new Date(today);
  for (let i = 0; i < 365; i++) {
    const d = new Date(todayD);
    d.setDate(todayD.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const q = sorted.find((x) => x.date === iso);
    if (q?.completed) streak++;
    else if (iso !== today) break;
    else if (!q?.completed) {
      // today not done yet — don't break, streak is from yesterday
      continue;
    }
  }

  const completeQuest = () => {
    setTodayQuest({
      date: today,
      questId: todayQuest.id,
      completed: true,
      rerolled,
    });
  };

  const reroll = () => {
    if (rerolled) return;
    const next = pickRandomQuest(todayQuest.id);
    setTodayQuest({
      date: today,
      questId: next.id,
      completed: false,
      rerolled: true,
    });
  };

  // last 14 days
  const last14: { date: string; done: boolean; has: boolean }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(todayD);
    d.setDate(todayD.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const q = sorted.find((x) => x.date === iso);
    last14.push({ date: iso, done: !!q?.completed, has: !!q });
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500 flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5" /> 今日大腦任務
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {completed ? "今天完成了" : "今天只做這一件事"}
        </h1>
      </div>

      <div
        className={`card transition ${
          completed
            ? "bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10"
            : ""
        }`}
      >
        <div className="flex items-baseline justify-between mb-2">
          <span className="pill text-[10px]">
            {CATEGORY_LABEL[todayQuest.category]}
          </span>
          <span className="text-xs text-ink-500">
            {todayQuest.timeMin > 0 ? `約 ${todayQuest.timeMin} 分鐘` : "幾乎不費時"}
          </span>
        </div>
        <h2 className="text-xl font-semibold">{todayQuest.title}</h2>
        <p className="text-sm text-ink-600 dark:text-ink-300 mt-2 leading-relaxed">
          {todayQuest.detail}
        </p>
        <div className="flex gap-2 mt-4">
          {!completed ? (
            <>
              <button onClick={completeQuest} className="btn-primary flex-1">
                <Check className="h-4 w-4" /> 我做完了
              </button>
              <button
                onClick={reroll}
                disabled={rerolled}
                className="btn-ghost disabled:opacity-30"
                title="今天只能重抽一次"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="text-sm text-calm-700 dark:text-calm-300 flex items-center gap-2">
              <Check className="h-4 w-4" /> 一個今天，一個小行動。已紀錄。
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-sm font-medium flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-warm-500" /> 連續完成
          </div>
          <div className="text-2xl font-semibold tabular-nums">{streak} 天</div>
        </div>
        <div className="flex gap-1">
          {last14.map((d) => (
            <div
              key={d.date}
              className={`flex-1 h-6 rounded-sm ${
                d.done
                  ? "bg-calm-600"
                  : d.has
                  ? "bg-ink-200 dark:bg-ink-800"
                  : "bg-ink-100/60 dark:bg-ink-900"
              }`}
              title={d.date}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-ink-400 mt-1">
          <span>14 天前</span>
          <span>今天</span>
        </div>
      </div>

      <div className="text-xs text-ink-500 text-center">
        每天的任務由日期決定（不同人會看到不同任務）。
        重抽會換一個隨機任務，但今天只能重抽一次。
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <QuestInner />
    </ClientOnly>
  );
}
