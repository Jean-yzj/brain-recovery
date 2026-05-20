"use client";

import { useState } from "react";
import { markOnboarded, setGoal, setTimeBudget, update } from "@/lib/storage";
import { Goal } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

const SLIDES = [
  {
    title: "不是你太懶",
    body: "是你的大腦真的太累了。\n\n焦慮、失眠、疲憊、注意力渙散，常常不是意志力問題，而是大腦長期過載的訊號。",
  },
  {
    title: "SHIFT 五個方向",
    body: "睡眠 · 激素 · 發炎 · 食物 · 科技使用。\n\n這 App 幫你看見自己累在哪一塊，再用微習慣慢慢修復。",
  },
  {
    title: "你不用自己摸索",
    body: "我們會根據你的狀態，每次告訴你『現在這一刻』最值得做的一件事。\n\n你只要做就好。",
  },
];

const GOALS: { id: Goal; title: string; desc: string }[] = [
  { id: "sleep", title: "睡得更好", desc: "睡眠淺、起來累、晚上停不下來" },
  { id: "anxiety", title: "降低焦慮", desc: "腦袋停不下來、容易緊繃、想太多" },
  { id: "focus", title: "提高專注", desc: "容易分心、開很多視窗、做事拖延" },
  { id: "phone", title: "減少手機依賴", desc: "滑到停不下來、起床就滑、睡前還在滑" },
  { id: "burnout", title: "從耗竭走出來", desc: "已經有身體警訊、對一切沒興趣" },
  { id: "general", title: "整體平衡", desc: "沒有特別嚴重，想長期維持狀態" },
];

const TIME_BUDGETS = [
  { val: 5, label: "5 分鐘以內", desc: "只能塞最迷你的練習" },
  { val: 15, label: "15 分鐘", desc: "推薦：能做完一個完整練習" },
  { val: 30, label: "30 分鐘以上", desc: "可以好好做晨間日記、散步等" },
];

function WelcomeInner() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goal, setGoalState] = useState<Goal | null>(null);
  const [budget, setBudget] = useState<number | null>(null);

  const totalSteps = SLIDES.length + 3; // intro slides + name + goal + budget

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = () => {
    update((d) => {
      d.settings.name = name.trim() || undefined;
    });
    if (goal) setGoal(goal);
    if (budget) setTimeBudget(budget);
    markOnboarded();
    router.push("/assessment");
  };

  // Intro slides
  if (step < SLIDES.length) {
    const s = SLIDES[step];
    return (
      <div className="min-h-[60vh] flex flex-col justify-between animate-fade-in pt-8">
        <div>
          <div className="text-xs text-ink-500 mb-2">
            {step + 1} / {totalSteps}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{s.title}</h1>
          <p className="text-base text-ink-600 dark:text-ink-300 mt-4 whitespace-pre-line leading-relaxed">
            {s.body}
          </p>
        </div>
        <div className="flex items-center justify-between pt-8">
          {step === 0 ? (
            <Link href="/" className="text-xs text-ink-500">跳過</Link>
          ) : (
            <button onClick={back} className="text-xs text-ink-500">上一步</button>
          )}
          <button onClick={next} className="btn-primary">
            繼續 <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Name
  if (step === SLIDES.length) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-between animate-fade-in pt-8">
        <div>
          <div className="text-xs text-ink-500 mb-2">
            {step + 1} / {totalSteps}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">怎麼稱呼你？</h1>
          <p className="text-sm text-ink-500 mt-2">選填，只會用在 App 內部問候。</p>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：阿樹"
            className="input mt-4 text-lg"
            maxLength={20}
          />
        </div>
        <div className="flex items-center justify-between pt-8">
          <button onClick={back} className="text-xs text-ink-500">上一步</button>
          <button onClick={next} className="btn-primary">
            繼續 <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Goal
  if (step === SLIDES.length + 1) {
    return (
      <div className="min-h-[60vh] flex flex-col animate-fade-in pt-8 pb-4">
        <div className="text-xs text-ink-500 mb-2">
          {step + 1} / {totalSteps}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          你最想先解決什麼？
        </h1>
        <p className="text-sm text-ink-500 mt-2">
          選一個你最在意的。之後 coach 會優先給你這方面的建議。可隨時改。
        </p>
        <div className="space-y-2 mt-5">
          {GOALS.map((g) => (
            <button
              key={g.id}
              onClick={() => setGoalState(g.id)}
              className={`w-full text-left rounded-2xl border px-4 py-3 transition ${
                goal === g.id
                  ? "bg-calm-700 text-white border-calm-700"
                  : "bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-800 hover:border-calm-400"
              }`}
            >
              <div className="text-base font-semibold">{g.title}</div>
              <div className={`text-xs mt-0.5 ${goal === g.id ? "text-white/80" : "text-ink-500"}`}>
                {g.desc}
              </div>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between pt-6">
          <button onClick={back} className="text-xs text-ink-500">上一步</button>
          <button onClick={next} disabled={!goal} className="btn-primary disabled:opacity-50">
            繼續 <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Time budget
  return (
    <div className="min-h-[60vh] flex flex-col animate-fade-in pt-8">
      <div className="text-xs text-ink-500 mb-2">
        {step + 1} / {totalSteps}
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">
        你每天大概能花多少時間？
      </h1>
      <p className="text-sm text-ink-500 mt-2">
        Coach 會挑符合你時間預算的練習。
      </p>
      <div className="space-y-2 mt-5">
        {TIME_BUDGETS.map((b) => (
          <button
            key={b.val}
            onClick={() => setBudget(b.val)}
            className={`w-full text-left rounded-2xl border px-4 py-3 transition ${
              budget === b.val
                ? "bg-calm-700 text-white border-calm-700"
                : "bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-800 hover:border-calm-400"
            }`}
          >
            <div className="text-base font-semibold">{b.label}</div>
            <div className={`text-xs mt-0.5 ${budget === b.val ? "text-white/80" : "text-ink-500"}`}>
              {b.desc}
            </div>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between pt-6">
        <button onClick={back} className="text-xs text-ink-500">上一步</button>
        <button onClick={finish} disabled={!budget} className="btn-primary disabled:opacity-50">
          開始檢測 <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <WelcomeInner />
    </ClientOnly>
  );
}
