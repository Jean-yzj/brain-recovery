"use client";

import { useState } from "react";
import { TECHNIQUES } from "@/lib/defusion";
import { addDefusion } from "@/lib/storage";
import { Check, ArrowLeft } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

function DefuseInner() {
  const [thought, setThought] = useState("");
  const [stage, setStage] = useState<"input" | "work" | "done">("input");
  const [techIdx, setTechIdx] = useState(0);
  const [usedIds, setUsedIds] = useState<string[]>([]);

  const startWork = () => {
    if (!thought.trim()) return;
    setStage("work");
    setTechIdx(0);
    setUsedIds([]);
  };

  const next = () => {
    const cur = TECHNIQUES[techIdx];
    setUsedIds((x) => (x.includes(cur.id) ? x : [...x, cur.id]));
    if (techIdx < TECHNIQUES.length - 1) {
      setTechIdx(techIdx + 1);
    } else {
      addDefusion({
        ts: Date.now(),
        thought: thought.trim(),
        techniques: [...usedIds, cur.id],
      });
      setStage("done");
    }
  };

  const skip = () => {
    if (techIdx < TECHNIQUES.length - 1) setTechIdx(techIdx + 1);
    else {
      addDefusion({
        ts: Date.now(),
        thought: thought.trim(),
        techniques: usedIds,
      });
      setStage("done");
    }
  };

  if (stage === "input") {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2">
          <div className="text-sm text-ink-500">思緒解離 · ACT</div>
          <h1 className="text-2xl font-semibold tracking-tight">把念頭從你身上鬆開</h1>
          <p className="text-sm text-ink-500 mt-2 leading-relaxed">
            ACT 的核心：你不是你的念頭。每當你能站到念頭旁邊看它，它就少了一點威力。
          </p>
        </div>
        <div className="card space-y-3">
          <div className="label">現在卡住你的念頭是？</div>
          <textarea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            placeholder="例如：我做不到 / 沒人喜歡我 / 一定會出事"
            className="input min-h-[100px]"
            autoFocus
          />
          <button
            onClick={startWork}
            disabled={!thought.trim()}
            className="btn-primary w-full disabled:opacity-50"
          >
            開始解離
          </button>
        </div>
        <div className="text-xs text-ink-500 text-center">
          這裡寫的不會傳出去。但若有自傷念頭，請撥 1925 或 1995。
        </div>
      </div>
    );
  }

  if (stage === "done") {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2">
          <div className="text-sm text-ink-500">完成</div>
          <h1 className="text-2xl font-semibold tracking-tight">念頭還在，但你比較鬆了</h1>
        </div>
        <div className="card">
          <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">
            念頭不一定會消失，那不是目標。
            <br />
            目標是：你跟它之間多了一點空間，足以選擇要不要照它走。
          </p>
        </div>
        <div className="card bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10">
          <div className="text-xs text-ink-500 mb-1">下一步</div>
          <div className="text-sm">
            問問自己：『如果這個念頭暫時不存在，我現在會做什麼？』
            <br />
            然後去做那件事，哪怕只是一小步。
          </div>
        </div>
        <button
          onClick={() => {
            setStage("input");
            setThought("");
          }}
          className="btn-ghost w-full"
        >
          再試一個念頭
        </button>
      </div>
    );
  }

  const t = TECHNIQUES[techIdx];
  const transformed = t.apply(thought);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2 flex items-start gap-3">
        <button
          onClick={() => setStage("input")}
          className="text-ink-400 hover:text-ink-700 mt-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="text-sm text-ink-500">
            {techIdx + 1} / {TECHNIQUES.length}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
        </div>
      </div>

      <div className="h-1.5 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-calm-500 transition-all"
          style={{ width: `${((techIdx + 1) / TECHNIQUES.length) * 100}%` }}
        />
      </div>

      <div className="card">
        <p className="text-sm text-ink-500 mb-3">{t.intro}</p>
        <div className="rounded-xl bg-ink-50 dark:bg-ink-900 p-4 text-base leading-relaxed whitespace-pre-line">
          {transformed}
        </div>
        <p className="text-xs text-ink-500 mt-3">{t.hint}</p>
      </div>

      <div className="flex gap-2">
        <button onClick={skip} className="btn-ghost flex-1">
          這個不適合，跳過
        </button>
        <button onClick={next} className="btn-primary flex-1">
          {techIdx === TECHNIQUES.length - 1 ? (
            <>
              <Check className="h-4 w-4" /> 完成
            </>
          ) : (
            "下一個練習"
          )}
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <DefuseInner />
    </ClientOnly>
  );
}
