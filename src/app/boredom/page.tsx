"use client";

import { useEffect, useRef, useState } from "react";
import { addBoredom, load } from "@/lib/storage";
import { AppData } from "@/lib/types";
import { Play, X, Check, Hourglass } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

const LEVELS = [
  { sec: 60, label: "1 分鐘", desc: "新手版" },
  { sec: 180, label: "3 分鐘", desc: "入門" },
  { sec: 300, label: "5 分鐘", desc: "進階" },
  { sec: 600, label: "10 分鐘", desc: "高階" },
  { sec: 1200, label: "20 分鐘", desc: "勇者" },
];

function BoredomInner() {
  const [data, setData] = useState<AppData>(load());
  const [target, setTarget] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<"pick" | "doing" | "after">("pick");
  const [urge, setUrge] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    return () => window.removeEventListener("brain-recovery:update", onUpdate);
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRunning(false);
          setStage("after");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const pick = (sec: number) => {
    setTarget(sec);
    setRemaining(sec);
    setStage("doing");
    setRunning(true);
  };

  const giveUp = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    addBoredom({
      ts: Date.now(),
      targetSec: target,
      completedSec: target - remaining,
    });
    setStage("after");
    setRunning(false);
  };

  const finalize = () => {
    addBoredom({
      ts: Date.now(),
      targetSec: target,
      completedSec: target - remaining,
      urgeNote: urge.trim() || undefined,
    });
    setStage("pick");
    setUrge("");
    setRemaining(60);
    setTarget(60);
  };

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;

  const sessions = data.boredom || [];
  const successCount = sessions.filter((b) => b.completedSec >= b.targetSec).length;

  if (stage === "doing") {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2">
          <div className="text-sm text-ink-500 flex items-center gap-1">
            <Hourglass className="h-3.5 w-3.5" /> 無聊忍受訓練
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            把手機翻過去，什麼都不做
          </h1>
        </div>

        <div className="card flex flex-col items-center py-12">
          <div className="text-7xl font-light tabular-nums">
            {String(m).padStart(1, "0")}:{String(s).padStart(2, "0")}
          </div>
          <p className="text-sm text-ink-500 mt-6 text-center max-w-xs">
            不滑、不開新分頁、不查任何東西。
            <br />
            可以發呆、可以看窗外、可以閉眼。
          </p>
        </div>

        <button onClick={giveUp} className="btn-ghost w-full text-warm-500">
          <X className="h-4 w-4" /> 我撐不住，提早結束
        </button>

        <div className="text-xs text-ink-500 text-center">
          就算撐不到時間結束也算練習。每一次都會讓多巴胺基線回到健康範圍一點。
        </div>
      </div>
    );
  }

  if (stage === "after") {
    const success = remaining === 0;
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2">
          <div className="text-sm text-ink-500">{success ? "完成" : "結束"}</div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {success ? "你撐到了" : "你撐了 " + (target - remaining) + " 秒"}
          </h1>
        </div>

        <div className="card">
          <div className="text-sm font-medium mb-2">剛才身體想做什麼？</div>
          <textarea
            value={urge}
            onChange={(e) => setUrge(e.target.value)}
            placeholder="例如：拿手機、開冰箱、查一個訊息、想睡覺…"
            className="input min-h-[80px]"
          />
          <p className="text-xs text-ink-500 mt-2">
            『想做但沒做』本身就是訓練。把它命名出來。
          </p>
        </div>

        <button onClick={finalize} className="btn-primary w-full">
          <Check className="h-4 w-4" /> 紀錄這次
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500 flex items-center gap-1">
          <Hourglass className="h-3.5 w-3.5" /> 無聊忍受訓練
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">給大腦練習『沒事做』</h1>
        <p className="text-sm text-ink-500 mt-2 leading-relaxed">
          Anna Lembke《Dopamine Nation》：你不是焦慮，是多巴胺基線被拉太高，
          所以一沒事做就難受。每天忍受一點點無聊，是把基線拉回來最直接的方法。
        </p>
      </div>

      <div className="card">
        <div className="text-sm font-medium mb-2">選一個長度</div>
        <ul className="space-y-2">
          {LEVELS.map((l) => (
            <li key={l.sec}>
              <button
                onClick={() => pick(l.sec)}
                className="w-full flex items-center justify-between rounded-xl bg-ink-50 dark:bg-ink-900 px-4 py-3 hover:bg-ink-100 dark:hover:bg-ink-800 transition"
              >
                <div className="text-left">
                  <div className="text-base font-medium">{l.label}</div>
                  <div className="text-xs text-ink-500">{l.desc}</div>
                </div>
                <Play className="h-4 w-4 text-calm-700 dark:text-calm-300" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="累計成功次數" value={`${successCount}`} />
          <Stat label="累計嘗試" value={`${sessions.length}`} />
        </div>
      </div>

      <div className="card">
        <div className="text-sm font-medium mb-2">為什麼這個有用</div>
        <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">
          現代生活的多巴胺供應是過量的。短影音、訊息、購物 App 都會推高基線。
          基線越高，平凡時刻就越無聊、越想立刻找刺激。
          『讓自己無聊一下』不是浪費時間，而是在重新校準感受快樂的能力。
        </p>
      </div>

      <div className="text-xs text-ink-500 text-center">
        出處：Anna Lembke《Dopamine Nation》
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
      <BoredomInner />
    </ClientOnly>
  );
}
