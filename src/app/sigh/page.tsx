"use client";

import { useEffect, useRef, useState } from "react";
import { addSigh, load } from "@/lib/storage";
import { AppData } from "@/lib/types";
import { Play, Pause as PauseIcon, RotateCcw, Wind } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

type Phase = "inhale1" | "inhale2" | "exhale" | "rest";

interface Step {
  phase: Phase;
  label: string;
  ms: number;
  scale: number;
}

const CYCLE: Step[] = [
  { phase: "inhale1", label: "用鼻子深吸一口", ms: 1500, scale: 1.0 },
  { phase: "inhale2", label: "再短吸一口（填滿肺）", ms: 700, scale: 1.15 },
  { phase: "exhale", label: "用嘴慢慢長長地吐", ms: 5000, scale: 0.55 },
  { phase: "rest", label: "稍微停一下", ms: 800, scale: 0.55 },
];

const PRESETS = [
  { label: "60 秒（最常用）", cycles: 3 },
  { label: "2 分鐘", cycles: 8 },
  { label: "5 分鐘", cycles: 20 },
];

function SighInner() {
  const [data, setData] = useState<AppData>(load());
  const [targetCycles, setTargetCycles] = useState(3);
  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    return () => window.removeEventListener("brain-recovery:update", onUpdate);
  }, []);

  useEffect(() => {
    if (!running || done) return;
    const step = CYCLE[stepIdx];
    timeoutRef.current = setTimeout(() => {
      const next = (stepIdx + 1) % CYCLE.length;
      if (next === 0) {
        const nextCycle = cycle + 1;
        if (nextCycle >= targetCycles) {
          setRunning(false);
          setDone(true);
          addSigh({ ts: Date.now(), cycles: targetCycles });
          return;
        }
        setCycle(nextCycle);
      }
      setStepIdx(next);
    }, step.ms);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [running, stepIdx, cycle, targetCycles, done]);

  const start = () => {
    setRunning(true);
    setDone(false);
    setCycle(0);
    setStepIdx(0);
  };

  const reset = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setRunning(false);
    setDone(false);
    setCycle(0);
    setStepIdx(0);
  };

  const currentStep = CYCLE[stepIdx];
  const todayCount = (data.sighs || []).filter((s) => {
    const d = new Date(s.ts);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500 flex items-center gap-1">
          <Wind className="h-3.5 w-3.5" /> 生理嘆息法
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">最快的鬆開方法</h1>
        <p className="text-sm text-ink-500 mt-2 leading-relaxed">
          深吸＋短吸＋長吐。Stanford 2022 研究：每天 5 分鐘『生理嘆息』降低焦慮的效果，比正念冥想更快、更穩。
        </p>
      </div>

      <div className="flex gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.cycles}
            onClick={() => {
              reset();
              setTargetCycles(p.cycles);
            }}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
              targetCycles === p.cycles
                ? "bg-calm-700 text-white"
                : "bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 dark:hover:bg-ink-700"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="card flex flex-col items-center py-10">
        <div className="relative h-56 w-56 flex items-center justify-center">
          <div
            className="absolute rounded-full bg-calm-300/50 dark:bg-calm-700/40"
            style={{
              height: "70%",
              width: "70%",
            }}
          />
          <div
            className="absolute rounded-full bg-calm-500 dark:bg-calm-400 transition-transform"
            style={{
              height: "60%",
              width: "60%",
              transform: `scale(${running || done ? currentStep.scale : 0.55})`,
              transitionDuration: `${
                running ? CYCLE[stepIdx].ms : 600
              }ms`,
              transitionTimingFunction: "ease-in-out",
            }}
          />
          <div className="relative text-white font-medium text-sm max-w-[60%] text-center leading-snug">
            {done
              ? "完成"
              : running
              ? currentStep.label
              : "按下開始"}
          </div>
        </div>
        <div className="mt-4 text-xs text-ink-500">
          {running && !done && (
            <>
              第 {cycle + 1} / {targetCycles} 輪
            </>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          {!running && !done && (
            <button onClick={start} className="btn-primary px-6">
              <Play className="h-4 w-4" /> 開始
            </button>
          )}
          {running && (
            <button onClick={() => setRunning(false)} className="btn-ghost">
              <PauseIcon className="h-4 w-4" />
            </button>
          )}
          {(done || (!running && stepIdx > 0)) && (
            <button onClick={reset} className="btn-ghost">
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="text-sm font-medium mb-2">怎麼做</div>
        <ol className="space-y-1.5 text-sm text-ink-700 dark:text-ink-200 list-decimal list-inside">
          <li>鼻子吸一口長氣（約 1.5 秒）</li>
          <li>不吐氣，再短吸一小口把肺填滿（約 0.7 秒）</li>
          <li>嘴巴慢慢長長地吐氣（約 5 秒）</li>
          <li>稍微停一下，重複</li>
        </ol>
        <p className="text-xs text-ink-500 mt-3">
          第二口短吸是關鍵，能打開塌掉的肺泡，讓 CO₂ 一次排掉更多。
        </p>
      </div>

      {done && (
        <div className="card bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10">
          <div className="text-sm font-medium">做完了。</div>
          <p className="text-xs text-ink-500 mt-1">
            真的會有感覺。如果還是緊，再做一輪就好。
          </p>
        </div>
      )}

      <div className="card flex items-center justify-between">
        <div className="text-sm text-ink-500">今天已嘆息</div>
        <div className="text-xl font-semibold tabular-nums">{todayCount} 次</div>
      </div>

      <div className="text-xs text-ink-500 text-center">
        出處：Andrew Huberman / Balban et al.《Cell Reports Medicine》2022
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <SighInner />
    </ClientOnly>
  );
}
