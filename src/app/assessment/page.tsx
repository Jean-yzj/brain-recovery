"use client";

import { useState } from "react";
import {
  QUESTIONS,
  ANSWER_LABELS,
  evaluate,
  levelLabel,
  topAxes,
  AXIS_LABEL,
} from "@/lib/assessment";
import { addAssessment, setPlan } from "@/lib/storage";
import { AssessmentAnswer, AssessmentResult } from "@/lib/types";
import BrainScoreRing from "@/components/BrainScoreRing";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

function AssessmentInner() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(AssessmentAnswer | undefined)[]>(
    Array(QUESTIONS.length).fill(undefined)
  );
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const onChoose = (val: AssessmentAnswer) => {
    const next = [...answers];
    next[step] = val;
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep(step + 1), 120);
    } else {
      const r = evaluate(next.map((a) => (a ?? 0) as AssessmentAnswer));
      addAssessment(r);
      setPlan({ startedAt: new Date().toISOString(), currentWeek: 1 });
      setResult(r);
    }
  };

  if (result) {
    const ll = levelLabel(result.level);
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2">
          <div className="text-sm text-ink-500">大腦疲勞指數</div>
          <h1 className="text-2xl font-semibold tracking-tight">{ll.title}</h1>
        </div>
        <div className="card flex flex-col items-center text-center">
          <BrainScoreRing score={result.score} size={180} />
          <p className="text-sm text-ink-600 dark:text-ink-300 mt-4 max-w-md">{ll.tone}</p>
        </div>
        <div className="card">
          <div className="text-sm font-medium mb-3">SHIFT 五軸（分數越高代表越疲勞）</div>
          <ul className="space-y-3">
            {topAxes(result).map(({ axis, score }) => (
              <li key={axis}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-calm-100 dark:bg-calm-900/40 text-calm-700 dark:text-calm-200 flex items-center justify-center text-sm font-semibold">
                    {AXIS_LABEL[axis].icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{AXIS_LABEL[axis].name}</div>
                    <div className="text-xs text-ink-500">{AXIS_LABEL[axis].desc}</div>
                  </div>
                  <div className="text-sm tabular-nums">{score}</div>
                </div>
                <div className="h-1.5 bg-ink-100 dark:bg-ink-800 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-calm-500" style={{ width: `${score}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="card bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10">
          <div className="text-sm font-medium mb-1">下一步建議</div>
          <div className="text-sm text-ink-600 dark:text-ink-300">
            從第 1 週開始，這週的目標只是「看見自己」，不是改變生活方式。
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Link href="/plan" className="btn-primary">
              開始 8 週重啟 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/daily" className="btn-soft">
              先做今日打卡
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[step];
  const cur = answers[step];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500">大腦疲勞檢測</div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {step + 1} / {QUESTIONS.length}
        </h1>
      </div>
      <div className="h-1.5 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-calm-500 transition-all duration-300"
          style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
        />
      </div>
      <div className="card animate-slide-up min-h-[180px] flex items-center">
        <p className="text-lg leading-relaxed">{q.text}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ANSWER_LABELS.map((label, idx) => {
          const v = idx as AssessmentAnswer;
          const active = cur === v;
          return (
            <button
              key={label}
              onClick={() => onChoose(v)}
              className={`rounded-2xl border px-4 py-4 text-sm font-medium transition active:scale-[0.98] ${
                active
                  ? "bg-calm-700 text-white border-calm-700"
                  : "bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-800 hover:border-calm-400"
              }`}
            >
              {label}
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
        <div className="text-xs text-ink-500">沒有對錯，憑直覺。</div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <AssessmentInner />
    </ClientOnly>
  );
}
