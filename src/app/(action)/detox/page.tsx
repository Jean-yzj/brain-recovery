"use client";

import { useEffect, useState } from "react";
import { load, markDetoxDay, setDetox } from "@/lib/storage";
import { AppData } from "@/lib/types";
import { CHALLENGES, detoxProgress } from "@/lib/detox";
import { Check, Smartphone, Trophy, X } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

function DetoxInner() {
  const [data, setData] = useState<AppData>(load());

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    return () => window.removeEventListener("brain-recovery:update", onUpdate);
  }, []);

  const detox = data.detox;
  const challenge = detox ? CHALLENGES.find((c) => c.id === detox.challengeId) : null;
  const progress = detox ? detoxProgress(detox) : null;
  const todayIso = new Date().toISOString().slice(0, 10);

  const startChallenge = (c: typeof CHALLENGES[number]) => {
    setDetox({
      challengeId: c.id,
      startedAt: new Date().toISOString(),
      totalDays: c.days,
      rules: c.rules,
      completedDays: [],
    });
  };

  if (!detox || !challenge) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2">
          <div className="text-sm text-ink-500 flex items-center gap-1">
            <Smartphone className="h-3.5 w-3.5" /> 數位排毒挑戰
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">選一個挑戰開始</h1>
          <p className="text-sm text-ink-500 mt-2 leading-relaxed">
            不是要你戒掉手機，是讓你重新分辨『需要』和『習慣』。從最低門檻開始。
          </p>
        </div>
        <div className="space-y-3">
          {CHALLENGES.map((c) => (
            <button
              key={c.id}
              onClick={() => startChallenge(c)}
              className="card text-left w-full hover:shadow-md transition"
            >
              <div className="flex items-baseline justify-between">
                <div className="text-base font-semibold">{c.title}</div>
                <div className="text-xs text-ink-500">{c.days} 天</div>
              </div>
              <p className="text-sm text-ink-500 mt-1">{c.intro}</p>
              <ul className="text-xs text-ink-500 mt-2 space-y-0.5">
                {c.rules.slice(0, 3).map((r, i) => (
                  <li key={i}>· {r}</li>
                ))}
                {c.rules.length > 3 && (
                  <li className="text-ink-400">… 還有 {c.rules.length - 3} 條規則</li>
                )}
              </ul>
              <div className="text-[10px] text-ink-400 mt-2">{c.book}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const days: { iso: string; date: Date; isFuture: boolean; isToday: boolean; done: boolean }[] =
    [];
  const start = new Date(detox.startedAt);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let i = 0; i < detox.totalDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    days.push({
      iso,
      date: d,
      isFuture: d.getTime() > now.getTime(),
      isToday: iso === todayIso,
      done: detox.completedDays.includes(iso),
    });
  }

  const isComplete = progress!.done >= detox.totalDays;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500 flex items-center gap-1">
          <Smartphone className="h-3.5 w-3.5" /> 數位排毒挑戰
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{challenge.title}</h1>
      </div>

      <div className="card">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-xs text-ink-500">進度</div>
            <div className="text-2xl font-semibold tabular-nums">
              {progress!.done} / {challenge.days}
            </div>
          </div>
          {isComplete && (
            <div className="flex items-center gap-1.5 text-calm-700 dark:text-calm-300 text-sm">
              <Trophy className="h-4 w-4" /> 完成挑戰
            </div>
          )}
        </div>
        <div className="h-1.5 bg-ink-100 dark:bg-ink-800 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-calm-500 transition-all"
            style={{ width: `${progress!.ratio * 100}%` }}
          />
        </div>
      </div>

      <div className="card">
        <div className="text-sm font-medium mb-3">這次的規則</div>
        <ul className="space-y-2">
          {challenge.rules.map((r, i) => (
            <li key={i} className="text-sm flex gap-2">
              <span className="text-calm-500">·</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <div className="text-sm font-medium mb-3">每日打卡</div>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d) => (
            <button
              key={d.iso}
              disabled={d.isFuture}
              onClick={() => markDetoxDay(d.iso, !d.done)}
              className={`aspect-square rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition ${
                d.done
                  ? "bg-calm-700 text-white"
                  : d.isToday
                  ? "bg-warm-100 border-2 border-warm-400 text-warm-500"
                  : d.isFuture
                  ? "bg-ink-50 dark:bg-ink-900 text-ink-300"
                  : "bg-ink-100 dark:bg-ink-800 text-ink-500"
              }`}
            >
              <span className="text-[9px] opacity-70">D{days.indexOf(d) + 1}</span>
              {d.done ? (
                <Check className="h-3 w-3" />
              ) : (
                <span className="text-[10px]">
                  {d.date.getMonth() + 1}/{d.date.getDate()}
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-ink-500 mt-3">
          點一下：今天做到了。再點一次：取消。
        </p>
      </div>

      {progress!.isDoneToday ? (
        <div className="card bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10">
          <div className="text-sm font-medium">今天做到了。</div>
          <p className="text-xs text-ink-500 mt-1">
            一天一天累積。錯過一天不代表全盤皆毀，繼續就好。
          </p>
        </div>
      ) : (
        <button
          onClick={() => markDetoxDay(todayIso, true)}
          className="btn-primary w-full"
        >
          <Check className="h-4 w-4" /> 我今天做到了
        </button>
      )}

      <button
        onClick={() => {
          if (confirm("確定放棄這次挑戰？進度會清空。")) setDetox(null);
        }}
        className="btn-ghost w-full text-warm-500"
      >
        <X className="h-4 w-4" /> 放棄挑戰
      </button>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <DetoxInner />
    </ClientOnly>
  );
}
