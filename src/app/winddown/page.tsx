"use client";

import { useState, useEffect } from "react";
import { Check, Moon } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

const STEPS = [
  { id: "phone", title: "把手機放到房間外或視線外", desc: "或開飛航。最關鍵的一步。", min: 1 },
  { id: "light", title: "把主燈關掉，只留一盞暖光", desc: "讓眼睛知道：要睡了。", min: 1 },
  { id: "shower", title: "洗澡或泡腳 5–10 分鐘", desc: "讓體溫先升再降，加速入睡。", min: 8 },
  { id: "stretch", title: "肩、頸、髖伸展各 30 秒", desc: "讓白天累積的緊繃離開。", min: 3 },
  { id: "tomorrow", title: "寫下明天最重要的 1 件事", desc: "把腦袋裡轉的事丟到紙上，比較容易停下來。", min: 2 },
  { id: "breath", title: "床上盒式呼吸 1–2 分鐘", desc: "吸 4、停 4、吐 4、停 4。", min: 2 },
];

function WindDownInner() {
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem("brain-recovery-winddown-today");
    const today = new Date().toISOString().slice(0, 10);
    if (stored) {
      try {
        const { date, ids } = JSON.parse(stored);
        if (date === today) setDone(ids);
      } catch {}
    }
  }, []);

  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
    setDone(next);
    const today = new Date().toISOString().slice(0, 10);
    window.localStorage.setItem(
      "brain-recovery-winddown-today",
      JSON.stringify({ date: today, ids: next })
    );
  };

  const allDone = done.length === STEPS.length;
  const totalMin = STEPS.reduce((acc, s) => acc + s.min, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500 flex items-center gap-1">
          <Moon className="h-3.5 w-3.5" /> 睡前儀式
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">17 分鐘，幫大腦關機</h1>
        <p className="text-sm text-ink-500 mt-2">
          這不是『最完美的睡前 routine』，是『最低門檻的版本』。能做幾項就做幾項。
        </p>
      </div>

      <div className="card">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-sm font-medium">今晚進度</div>
          <div className="text-xs text-ink-500">
            {done.length}/{STEPS.length} · 約 {totalMin} 分鐘
          </div>
        </div>
        <div className="h-1.5 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-calm-500 transition-all duration-500"
            style={{ width: `${(done.length / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <ul className="space-y-2">
        {STEPS.map((s, i) => {
          const isDone = done.includes(s.id);
          return (
            <li key={s.id}>
              <button
                onClick={() => toggle(s.id)}
                className={`w-full text-left card transition ${
                  isDone ? "opacity-70" : "hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                      isDone
                        ? "bg-calm-700 border-calm-700"
                        : "border-ink-300 dark:border-ink-700"
                    }`}
                  >
                    {isDone && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${isDone ? "line-through text-ink-500" : ""}`}>
                      {i + 1}. {s.title}
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5">{s.desc}</div>
                    <div className="text-[11px] text-ink-400 mt-1">約 {s.min} 分鐘</div>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {allDone && (
        <div className="card bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10">
          <div className="text-sm font-medium">你準備好了。</div>
          <p className="text-xs text-ink-500 mt-1">
            如果還是睡不著也沒關係。躺著也是休息。記得這個版本明天可以再做一次。
          </p>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <WindDownInner />
    </ClientOnly>
  );
}
