"use client";

import { useEffect, useRef, useState } from "react";
import { addMorningPage, load, todayISO } from "@/lib/storage";
import { AppData } from "@/lib/types";
import { Sunrise, Play, Check, Trash2, Save, RefreshCw, Eye } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

const PRESETS = [
  { min: 5, label: "5 分鐘", desc: "短版（懶人版）" },
  { min: 10, label: "10 分鐘", desc: "推薦" },
  { min: 15, label: "15 分鐘", desc: "Cameron 原版" },
];

function countWords(s: string) {
  const trimmed = s.trim();
  if (!trimmed) return 0;
  // mix of CJK chars and english words
  const cjk = (trimmed.match(/[一-鿿]/g) || []).length;
  const en = (trimmed.match(/[A-Za-z]+/g) || []).length;
  return cjk + en;
}

function MorningPagesInner() {
  const [data, setData] = useState<AppData>(load());
  const [stage, setStage] = useState<"pick" | "writing" | "after">("pick");
  const [minutes, setMinutes] = useState(10);
  const [remainingSec, setRemainingSec] = useState(600);
  const [text, setText] = useState("");
  const [reveal, setReveal] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    return () => window.removeEventListener("brain-recovery:update", onUpdate);
  }, []);

  useEffect(() => {
    if (stage !== "writing") return;
    intervalRef.current = setInterval(() => {
      setRemainingSec((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setStage("after");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [stage]);

  const today = todayISO();
  const todayPage = (data.morningPages || []).find((p) => p.date === today);
  const total = (data.morningPages || []).length;

  const start = (m: number) => {
    setMinutes(m);
    setRemainingSec(m * 60);
    setText("");
    setStage("writing");
  };

  const wordCount = countWords(text);

  const m = Math.floor(remainingSec / 60);
  const s = remainingSec % 60;

  const saveAndKeep = () => {
    addMorningPage({
      date: today,
      ts: Date.now(),
      minutes,
      wordCount,
      text,
    });
    setStage("pick");
  };

  const saveAndRelease = () => {
    addMorningPage({
      date: today,
      ts: Date.now(),
      minutes,
      wordCount,
      // 不存 text — 真正的 morning pages 精神：寫完就放掉
    });
    setStage("pick");
  };

  const discard = () => {
    setStage("pick");
    setText("");
  };

  if (stage === "writing") {
    return (
      <div className="space-y-3 animate-fade-in">
        <div className="pt-2 flex items-baseline justify-between">
          <div>
            <div className="text-sm text-ink-500 flex items-center gap-1">
              <Sunrise className="h-3.5 w-3.5" /> 晨間日記
            </div>
            <h1 className="text-xl font-semibold tracking-tight">
              不要停、不要編輯、不要回看
            </h1>
          </div>
          <div className="text-2xl font-mono tabular-nums">
            {String(m).padStart(1, "0")}:{String(s).padStart(2, "0")}
          </div>
        </div>

        <div className="h-1 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-calm-500 transition-all"
            style={{ width: `${((minutes * 60 - remainingSec) / (minutes * 60)) * 100}%` }}
          />
        </div>

        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="把任何浮上來的東西寫下來。語法錯誤沒關係，邏輯不通沒關係。卡住就重複寫『我現在卡住』直到下一個念頭出現。"
          className="input min-h-[50vh] text-base leading-relaxed"
          style={{
            color: reveal ? undefined : "transparent",
            textShadow: reveal ? undefined : "0 0 8px rgba(110,110,130,0.55)",
            caretColor: "rgb(74, 104, 182)",
          }}
        />

        <div className="flex items-center justify-between text-xs text-ink-500">
          <span>{wordCount} 字</span>
          <button
            onClick={() => setReveal((r) => !r)}
            className="flex items-center gap-1 hover:text-ink-800 dark:hover:text-ink-100"
          >
            <Eye className="h-3.5 w-3.5" />
            {reveal ? "再次模糊" : "我想看一下我寫了什麼"}
          </button>
        </div>

        <p className="text-[11px] text-ink-400">
          字會被模糊化，是為了讓你不去編輯它。Julia Cameron 強調這個練習的價值就在『不修改』。
        </p>
      </div>
    );
  }

  if (stage === "after") {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2">
          <div className="text-sm text-ink-500">時間到</div>
          <h1 className="text-2xl font-semibold tracking-tight">寫完了</h1>
        </div>
        <div className="card">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="字數" value={`${wordCount}`} />
            <Stat label="時長" value={`${minutes} 分`} />
          </div>
          {text && (
            <div className="mt-4">
              <div className="text-xs text-ink-500 mb-1">你寫的</div>
              <div className="rounded-xl bg-ink-50 dark:bg-ink-900 p-3 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                {text}
              </div>
            </div>
          )}
        </div>

        <div className="card bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10 space-y-2">
          <div className="text-sm font-medium">兩種收尾方式</div>
          <p className="text-xs text-ink-500">
            原版 morning pages 寫完不會回頭看，把腦袋裡的雜訊『倒出來』後就放掉。
            你可以選擇保留或釋放。
          </p>
          <div className="flex gap-2 mt-2">
            <button onClick={saveAndRelease} className="btn-soft flex-1">
              <RefreshCw className="h-4 w-4" /> 只記長度，釋放內容
            </button>
            <button onClick={saveAndKeep} className="btn-primary flex-1">
              <Save className="h-4 w-4" /> 連同內容一起留下
            </button>
          </div>
        </div>

        <button onClick={discard} className="btn-ghost w-full text-warm-500">
          <Trash2 className="h-4 w-4" /> 不紀錄這次
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500 flex items-center gap-1">
          <Sunrise className="h-3.5 w-3.5" /> 晨間日記
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">把腦袋裡的雜訊倒出來</h1>
        <p className="text-sm text-ink-500 mt-2 leading-relaxed">
          Julia Cameron《The Artist&apos;s Way》：每天起床先寫一段意識流，
          把腦袋裡轉的所有東西倒出來，比較容易看清楚『真正在乎的是什麼』。
        </p>
      </div>

      {todayPage && (
        <div className="card bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10">
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-calm-700 dark:text-calm-300" />
            <span className="font-medium">今天已經寫過了</span>
          </div>
          <div className="text-xs text-ink-500 mt-1">
            {todayPage.wordCount} 字 · {todayPage.minutes} 分鐘
          </div>
        </div>
      )}

      <div className="space-y-2">
        {PRESETS.map((p) => (
          <button
            key={p.min}
            onClick={() => start(p.min)}
            className="card w-full text-left hover:shadow-md transition flex items-center justify-between"
          >
            <div>
              <div className="text-base font-semibold">{p.label}</div>
              <div className="text-xs text-ink-500 mt-0.5">{p.desc}</div>
            </div>
            <Play className="h-5 w-5 text-calm-700 dark:text-calm-300" />
          </button>
        ))}
      </div>

      <div className="card flex items-center justify-between">
        <div className="text-sm text-ink-500">累計</div>
        <div className="text-xl font-semibold tabular-nums">{total} 篇</div>
      </div>

      <div className="card">
        <div className="text-sm font-medium mb-2">三個原則</div>
        <ul className="space-y-1.5 text-sm text-ink-700 dark:text-ink-200">
          <li>· 不要停（寫不出來就重複寫「我寫不出來」）</li>
          <li>· 不要編輯（錯字、語法、跳躍都沒關係）</li>
          <li>· 不要追求漂亮（這不是給別人看的）</li>
        </ul>
        <p className="text-xs text-ink-500 mt-3">
          這個 App 會把你寫的字模糊化，逼你不去看。
        </p>
      </div>

      <div className="text-xs text-ink-500 text-center">
        出處：Julia Cameron《The Artist&apos;s Way》— Morning Pages
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink-50 dark:bg-ink-900 px-3 py-2">
      <div className="text-[10px] text-ink-500">{label}</div>
      <div className="text-base font-semibold tabular-nums mt-0.5">{value}</div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <MorningPagesInner />
    </ClientOnly>
  );
}
