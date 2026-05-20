"use client";

import { useState } from "react";
import { addCompassion } from "@/lib/storage";
import ClientOnly from "@/components/ClientOnly";
import { Heart, ArrowLeft, ArrowRight, Check } from "lucide-react";

interface Step {
  no: number;
  name: string;
  intro: string;
  scripts: string[];
  hint: string;
}

const STEPS: Step[] = [
  {
    no: 1,
    name: "覺察（Mindfulness）",
    intro: "先承認，這一刻你真的不舒服。不否認、不誇大、不解釋。",
    scripts: [
      "「這是一個痛苦的時刻。」",
      "「我正在受傷。」",
      "「這真的很難。」",
    ],
    hint: "可以把一隻手放在心口上。慢慢念其中一句 2 次。",
  },
  {
    no: 2,
    name: "共通人性（Common Humanity）",
    intro: "你不是唯一一個經歷這種感覺的人。痛苦是人類共有的經驗。",
    scripts: [
      "「痛苦是人生的一部分。」",
      "「其他人也有過這種感覺。」",
      "「我不是一個人。」",
    ],
    hint: "想像世界上現在有千萬個人，正在跟你經歷類似的事情。",
  },
  {
    no: 3,
    name: "自我善意（Self-Kindness）",
    intro: "對自己說一句溫柔的話。像對一個你深愛的人那樣。",
    scripts: [
      "「願我此刻能對自己溫柔。」",
      "「願我能給自己我需要的東西。」",
      "「願我能接受此刻的自己，就算它不完美。」",
    ],
    hint: "如果好朋友現在跟你說一模一樣的話，你會怎麼回應他？把那句話也送給自己。",
  },
];

function CompassionInner() {
  const [stage, setStage] = useState<"input" | "step" | "done">("input");
  const [situation, setSituation] = useState("");
  const [idx, setIdx] = useState(0);
  const [pickedScripts, setPickedScripts] = useState<string[]>([]);

  const startWork = () => {
    setStage("step");
    setIdx(0);
    setPickedScripts([]);
  };

  const next = (script?: string) => {
    if (script) setPickedScripts((p) => [...p, script]);
    if (idx < STEPS.length - 1) {
      setIdx(idx + 1);
    } else {
      addCompassion({
        ts: Date.now(),
        situation: situation.trim() || undefined,
      });
      setStage("done");
    }
  };

  if (stage === "input") {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2">
          <div className="text-sm text-ink-500 flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" /> 自我慈悲
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">先對自己溫柔一下</h1>
          <p className="text-sm text-ink-500 mt-2 leading-relaxed">
            Kristin Neff：自我慈悲不是脆弱、不是自憐、不是放縱。
            是當你受傷時，能像對好朋友一樣對自己。研究上比『高自尊』更能保護心理健康。
          </p>
        </div>

        <div className="card space-y-3">
          <div className="label">現在讓你不舒服的事是什麼？</div>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="可以選填。例如：剛搞砸了報告 / 被某句話刺到 / 一直自我懷疑"
            className="input min-h-[80px]"
          />
          <p className="text-[11px] text-ink-400">
            這裡寫的不會傳出去，只存在你的瀏覽器，事後也可選擇不留下。
          </p>
          <button onClick={startWork} className="btn-primary w-full">
            開始三步驟
          </button>
        </div>

        <div className="card">
          <div className="text-sm font-medium mb-2">三個成分</div>
          <ul className="space-y-2 text-sm text-ink-700 dark:text-ink-200">
            <li>
              <b>覺察</b>　承認痛苦的存在
            </li>
            <li>
              <b>共通人性</b>　知道別人也經歷過
            </li>
            <li>
              <b>自我善意</b>　對自己說一句溫柔的話
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (stage === "done") {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2">
          <div className="text-sm text-ink-500">完成</div>
          <h1 className="text-2xl font-semibold tracking-tight">你給了自己一個間隙</h1>
        </div>

        <div className="card">
          <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">
            痛苦的事情可能沒有變，但你跟它之間多了一個自我善意的緩衝。
            <br />
            研究上，能對自己慈悲的人，反而更容易為自己負責，也更願意嘗試難的事。
            自我慈悲，不是讓你放棄改變，是讓你能持續地嘗試。
          </p>
        </div>

        {pickedScripts.length > 0 && (
          <div className="card bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10">
            <div className="text-xs text-ink-500 mb-2">你選的三句話</div>
            <ul className="space-y-1.5">
              {pickedScripts.map((s, i) => (
                <li key={i} className="text-sm leading-relaxed">
                  {s}
                </li>
              ))}
            </ul>
            <p className="text-xs text-ink-500 mt-3">
              下次同樣的感覺出現時，可以再對自己念一遍。
            </p>
          </div>
        )}

        <button
          onClick={() => {
            setStage("input");
            setSituation("");
            setPickedScripts([]);
            setIdx(0);
          }}
          className="btn-ghost w-full"
        >
          再做一次
        </button>
      </div>
    );
  }

  const cur = STEPS[idx];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2 flex items-start gap-3">
        <button
          onClick={() => {
            if (idx > 0) setIdx(idx - 1);
            else setStage("input");
          }}
          className="text-ink-400 hover:text-ink-700 mt-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="text-sm text-ink-500">
            步驟 {cur.no} / {STEPS.length}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{cur.name}</h1>
        </div>
      </div>

      <div className="h-1.5 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-calm-500 transition-all"
          style={{ width: `${((idx + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <div className="card">
        <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">
          {cur.intro}
        </p>
      </div>

      <div className="space-y-2">
        {cur.scripts.map((s, i) => (
          <button
            key={i}
            onClick={() => next(s)}
            className="w-full text-left card hover:shadow-md transition active:scale-[0.99]"
          >
            <div className="text-base leading-relaxed">{s}</div>
            <div className="text-xs text-calm-700 dark:text-calm-300 mt-1">
              點我，把這句話送給自己 →
            </div>
          </button>
        ))}
      </div>

      <div className="card">
        <p className="text-xs text-ink-500 leading-relaxed">{cur.hint}</p>
      </div>

      <button onClick={() => next()} className="btn-ghost w-full">
        {idx === STEPS.length - 1 ? (
          <>
            <Check className="h-4 w-4" /> 跳過這一步、完成
          </>
        ) : (
          <>
            這一步先跳過 <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <div className="text-xs text-ink-500 text-center">
        出處：Kristin Neff《Self-Compassion》
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <CompassionInner />
    </ClientOnly>
  );
}
