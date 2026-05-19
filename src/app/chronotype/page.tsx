"use client";

import { useState } from "react";
import {
  CT_QUESTIONS,
  CHRONOTYPE_PROFILE,
  evaluateChronotype,
  chronotypeIcon,
} from "@/lib/chronotype";
import { load, setChronotype } from "@/lib/storage";
import { Chronotype } from "@/lib/types";
import ClientOnly from "@/components/ClientOnly";
import { ArrowLeft, ArrowRight, Sun, Moon, Coffee, Dumbbell, Brain } from "lucide-react";

function ChronotypeInner() {
  const existing = load().chronotype;
  const [view, setView] = useState<"result" | "quiz">(existing ? "result" : "quiz");
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);

  if (view === "result" && existing) {
    const p = CHRONOTYPE_PROFILE[existing.type];
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2">
          <div className="text-sm text-ink-500">你的 Chronotype</div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-calm-100 dark:bg-calm-900/40 text-calm-700 dark:text-calm-200 flex items-center justify-center text-lg font-bold">
              {chronotypeIcon(existing.type)}
            </span>
            {p.name}
          </h1>
          <div className="text-xs text-ink-500 mt-1">{p.pct}</div>
        </div>
        <div className="card">
          <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">{p.summary}</p>
        </div>
        <div className="card space-y-3">
          <div className="text-sm font-medium">為你校準的時間表</div>
          <Row icon={<Sun className="h-4 w-4" />} label="起床" v={p.wakeWindow} />
          <Row icon={<Moon className="h-4 w-4" />} label="就寢" v={p.sleepWindow} />
          <Row icon={<Brain className="h-4 w-4" />} label="深度工作" v={p.deepWork} />
          <Row icon={<Coffee className="h-4 w-4" />} label="咖啡因截止" v={p.caffeineCutoff} />
          <Row icon={<Dumbbell className="h-4 w-4" />} label="運動時段" v={p.workout} />
        </div>
        <div className="card">
          <div className="text-sm font-medium mb-2">給你的特別提醒</div>
          <ul className="space-y-1.5 text-sm text-ink-700 dark:text-ink-200">
            {p.notes.map((n, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-calm-500">·</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => {
            setView("quiz");
            setPicks([]);
            setStep(0);
          }}
          className="btn-ghost w-full"
        >
          重做測驗
        </button>
      </div>
    );
  }

  const q = CT_QUESTIONS[step];

  const pick = (i: number) => {
    const next = [...picks];
    next[step] = i;
    setPicks(next);
    if (step < CT_QUESTIONS.length - 1) {
      setTimeout(() => setStep(step + 1), 120);
    } else {
      const r = evaluateChronotype(next);
      setChronotype({
        type: r.type as Chronotype,
        scores: r.scores,
        date: new Date().toISOString(),
      });
      setView("result");
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500">Chronotype 測驗</div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {step + 1} / {CT_QUESTIONS.length}
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          找出你的天生節奏類型（基於 Michael Breus 的 chronotype 分類）。
        </p>
      </div>
      <div className="h-1.5 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-calm-500 transition-all"
          style={{ width: `${((step + 1) / CT_QUESTIONS.length) * 100}%` }}
        />
      </div>
      <div className="card animate-slide-up">
        <p className="text-lg leading-relaxed">{q.text}</p>
      </div>
      <div className="space-y-2">
        {q.options.map((o, i) => {
          const active = picks[step] === i;
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              className={`w-full text-left rounded-2xl border px-4 py-3 text-sm transition active:scale-[0.99] ${
                active
                  ? "bg-calm-700 text-white border-calm-700"
                  : "bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-800 hover:border-calm-400"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <button
          disabled={step === 0}
          onClick={() => setStep(Math.max(0, step - 1))}
          className="btn-ghost disabled:opacity-30"
        >
          <ArrowLeft className="h-4 w-4" /> 上一題
        </button>
        {existing && (
          <button onClick={() => setView("result")} className="text-xs text-ink-500">
            取消，回到結果 <ArrowRight className="inline h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ icon, label, v }: { icon: React.ReactNode; label: string; v: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-calm-700 dark:text-calm-300">{icon}</div>
      <div className="flex-1">
        <div className="text-xs text-ink-500">{label}</div>
        <div className="text-sm font-medium">{v}</div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <ChronotypeInner />
    </ClientOnly>
  );
}
