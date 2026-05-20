"use client";

import { useEffect, useState } from "react";
import {
  addHabitStack,
  load,
  removeHabitStack,
  toggleHabitDoneToday,
  todayISO,
} from "@/lib/storage";
import { AppData } from "@/lib/types";
import { Check, Plus, X, Link2 } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

const ANCHOR_SUGGESTIONS = [
  "起床後",
  "刷完牙",
  "倒完咖啡",
  "打開電腦",
  "午餐後",
  "下班 / 放學",
  "洗完澡",
  "躺上床前",
];

function HabitsInner() {
  const [data, setData] = useState<AppData>(load());
  const [anchor, setAnchor] = useState("");
  const [habit, setHabit] = useState("");

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    return () => window.removeEventListener("brain-recovery:update", onUpdate);
  }, []);

  const today = todayISO();
  const habits = data.habits || [];
  const logs = data.habitLogs || [];

  const add = () => {
    if (!anchor.trim() || !habit.trim()) return;
    addHabitStack({
      id: Math.random().toString(36).slice(2, 10),
      anchor: anchor.trim(),
      habit: habit.trim(),
      createdAt: Date.now(),
    });
    setAnchor("");
    setHabit("");
  };

  const last7 = (() => {
    const arr: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(d.toISOString().slice(0, 10));
    }
    return arr;
  })();

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500 flex items-center gap-1">
          <Link2 className="h-3.5 w-3.5" /> 習慣堆疊
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">把新習慣黏在舊習慣上</h1>
        <p className="text-sm text-ink-500 mt-2 leading-relaxed">
          James Clear《Atomic Habits》：新習慣最容易黏住的位置，是另一個已經存在的習慣後面。
        </p>
      </div>

      <div className="card space-y-3">
        <div className="text-sm font-medium">建立一條新堆疊</div>

        <div>
          <div className="text-xs text-ink-500 mb-1">在…之後</div>
          <input
            value={anchor}
            onChange={(e) => setAnchor(e.target.value)}
            placeholder="例：刷完牙"
            className="input"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {ANCHOR_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setAnchor(s)}
                className="pill text-[11px] py-0.5 px-2 hover:border-calm-400"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs text-ink-500 mb-1">我會…</div>
          <input
            value={habit}
            onChange={(e) => setHabit(e.target.value)}
            placeholder="例：喝 500ml 水"
            className="input"
          />
        </div>

        <div className="rounded-xl bg-ink-50 dark:bg-ink-900 p-3 text-sm">
          <span className="text-ink-500">在</span>{" "}
          <span className="font-medium">{anchor || "_______"}</span>{" "}
          <span className="text-ink-500">之後，我會</span>{" "}
          <span className="font-medium">{habit || "_______"}</span>
          <span className="text-ink-500">。</span>
        </div>

        <button
          onClick={add}
          disabled={!anchor.trim() || !habit.trim()}
          className="btn-primary w-full disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> 加入堆疊
        </button>

        <p className="text-[11px] text-ink-400">
          祕訣：新習慣越小越好。從『2 分鐘做完』的版本開始。
        </p>
      </div>

      {habits.length > 0 && (
        <>
          <div className="text-xs text-ink-500 ml-1">你的堆疊（{habits.length}）</div>
          <ul className="space-y-2">
            {habits.map((h) => {
              const todayDone = logs.some(
                (l) => l.stackId === h.id && l.date === today
              );
              return (
                <li key={h.id} className="card">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleHabitDoneToday(h.id, today)}
                      className={`mt-0.5 h-7 w-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                        todayDone
                          ? "bg-calm-700 border-calm-700"
                          : "border-ink-300 dark:border-ink-700 hover:border-calm-500"
                      }`}
                    >
                      {todayDone && <Check className="h-4 w-4 text-white" />}
                    </button>
                    <div className="flex-1">
                      <div className="text-sm leading-relaxed">
                        <span className="text-ink-500">在</span>{" "}
                        <span className="font-medium">{h.anchor}</span>{" "}
                        <span className="text-ink-500">之後，我會</span>{" "}
                        <span className="font-medium">{h.habit}</span>
                        <span className="text-ink-500">。</span>
                      </div>
                      <div className="flex gap-1 mt-3">
                        {last7.map((iso) => {
                          const done = logs.some(
                            (l) => l.stackId === h.id && l.date === iso
                          );
                          return (
                            <div
                              key={iso}
                              className={`flex-1 h-5 rounded-sm ${
                                done
                                  ? "bg-calm-600"
                                  : "bg-ink-100 dark:bg-ink-800"
                              }`}
                              title={iso}
                            />
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-[10px] text-ink-400 mt-0.5">
                        <span>7 天前</span>
                        <span>今天</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm("確定刪除這條堆疊？")) removeHabitStack(h.id);
                      }}
                      className="text-ink-400 hover:text-warm-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <div className="text-xs text-ink-500 text-center">
        出處：James Clear《Atomic Habits》— Habit Stacking
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <HabitsInner />
    </ClientOnly>
  );
}
