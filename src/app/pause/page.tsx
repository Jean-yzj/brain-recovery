"use client";

import { useEffect, useRef, useState } from "react";
import { PAUSE_TASKS, PauseTask, pickRandomTask } from "@/lib/pause";
import { addPause } from "@/lib/storage";
import { Play, Pause as PauseIcon, RefreshCw, Check, X } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import NextStep from "@/components/NextStep";

function PauseInner() {
  const [task, setTask] = useState<PauseTask | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pick = (t?: PauseTask) => {
    const chosen = t ?? pickRandomTask();
    setTask(chosen);
    setRemaining(chosen.durationSec);
    setRunning(false);
    setDone(false);
  };

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRunning(false);
          setDone(true);
          if (task) {
            addPause({
              date: new Date().toISOString(),
              taskId: task.id,
              durationSec: task.durationSec,
            });
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, task]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  if (!task) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2">
          <div className="text-sm text-ink-500">Brain Pause</div>
          <h1 className="text-2xl font-semibold tracking-tight">我現在腦袋很滿</h1>
          <p className="text-sm text-ink-500 mt-1">
            選一個練習，或交給隨機。1–3 分鐘就好。
          </p>
        </div>
        <button
          onClick={() => pick()}
          className="card w-full text-left hover:shadow-md transition bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10"
        >
          <div className="text-sm font-medium">幫我隨機挑一個</div>
          <div className="text-xs text-ink-500 mt-1">
            不要在這裡也耗能。
          </div>
        </button>
        <div className="grid gap-3">
          {PAUSE_TASKS.map((t) => (
            <button
              key={t.id}
              onClick={() => pick(t)}
              className="card text-left hover:shadow-md transition"
            >
              <div className="flex items-baseline justify-between">
                <div className="text-sm font-medium">{t.title}</div>
                <div className="text-xs text-ink-500">
                  {Math.floor(t.durationSec / 60)
                    ? `${Math.floor(t.durationSec / 60)} 分 `
                    : ""}
                  {t.durationSec % 60 ? `${t.durationSec % 60} 秒` : ""}
                </div>
              </div>
              <div className="text-xs text-ink-500 mt-1">{t.short}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2 flex items-baseline justify-between">
        <div>
          <div className="text-sm text-ink-500">Brain Pause</div>
          <h1 className="text-2xl font-semibold tracking-tight">{task.title}</h1>
        </div>
        <button onClick={() => setTask(null)} className="text-ink-400 hover:text-ink-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="card flex flex-col items-center justify-center py-10">
        <div className="relative h-44 w-44 flex items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full bg-calm-200 dark:bg-calm-900/40 ${
              running ? "animate-breath-in" : ""
            }`}
          />
          <div className="relative text-5xl font-light tabular-nums">
            {String(minutes).padStart(1, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3">
          {!done && (
            <button onClick={() => setRunning((r) => !r)} className="btn-primary px-6">
              {running ? <PauseIcon className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? "暫停一下" : remaining < task.durationSec ? "繼續" : "開始"}
            </button>
          )}
          {done && (
            <div className="text-sm text-calm-700 dark:text-calm-300 flex items-center gap-2">
              <Check className="h-4 w-4" /> 做完了，深呼吸一次。
            </div>
          )}
          <button
            onClick={() => pick(task)}
            className="btn-ghost"
            title="重設"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="card">
        <div className="text-xs text-ink-500 mb-2">這個練習怎麼做</div>
        <ol className="space-y-2 list-decimal list-inside text-sm text-ink-700 dark:text-ink-200">
          {task.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>

      {done && (
        <>
          <div className="card bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10">
            <div className="text-sm font-medium">恭喜你，給了大腦一個間隙。</div>
            <div className="text-xs text-ink-500 mt-1">
              不需要完美，只需要你願意停下來。
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setTask(null)} className="btn-ghost">
                做完了
              </button>
              <button onClick={() => pick()} className="btn-soft">
                再來一個
              </button>
            </div>
          </div>
          <NextStep
            title="如果還是很緊繃"
            reason="60 秒生理嘆息是最快的鬆開法。Stanford 2022 研究。"
            href="/sigh"
            duration="60 秒"
          />
        </>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <PauseInner />
    </ClientOnly>
  );
}
