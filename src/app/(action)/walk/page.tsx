"use client";

import { useEffect, useRef, useState } from "react";
import { addWalk, load } from "@/lib/storage";
import { AppData } from "@/lib/types";
import { Footprints, Play, Pause as PauseIcon, X, Check, ArrowRight } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import NextStep from "@/components/NextStep";

const PRESETS = [
  { min: 5, label: "5 分鐘", desc: "辦公室一圈" },
  { min: 15, label: "15 分鐘", desc: "推薦最低劑量" },
  { min: 30, label: "30 分鐘", desc: "完整散步處方" },
];

// 散步處方的『提示卡』：散步時不要滑手機，但腦袋可以有方向
const PROMPTS = [
  "注意你腳步落地的節奏",
  "看遠方一個 6 公尺以外的物件",
  "深呼吸，鼻子吸、嘴巴吐",
  "找一個你之前沒注意過的細節",
  "聽聽周圍的聲音，不要急著辨認",
  "讓肩膀掉下來",
  "感受陽光或風在皮膚上的感覺",
  "想一件你之前感謝過的事",
];

function WalkInner() {
  const [data, setData] = useState<AppData>(load());
  const [stage, setStage] = useState<"pick" | "stress-before" | "walking" | "stress-after">("pick");
  const [target, setTarget] = useState(15);
  const [remaining, setRemaining] = useState(15 * 60);
  const [running, setRunning] = useState(false);
  const [promptIdx, setPromptIdx] = useState(0);
  const [stressBefore, setStressBefore] = useState<number | null>(null);
  const [stressAfter, setStressAfter] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const promptTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
          if (promptTimerRef.current) clearInterval(promptTimerRef.current);
          setRunning(false);
          setStage("stress-after");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    // rotate prompts every 90 sec
    promptTimerRef.current = setInterval(() => {
      setPromptIdx((i) => (i + 1) % PROMPTS.length);
    }, 90_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (promptTimerRef.current) clearInterval(promptTimerRef.current);
    };
  }, [running]);

  const startStress = (m: number) => {
    setTarget(m);
    setRemaining(m * 60);
    setStage("stress-before");
  };

  const startWalk = () => {
    setStage("walking");
    setRunning(true);
    setPromptIdx(Math.floor(Math.random() * PROMPTS.length));
  };

  const skipStress = () => {
    setStressBefore(null);
    startWalk();
  };

  const finish = () => {
    addWalk({
      ts: Date.now(),
      minutes: target - Math.floor(remaining / 60),
      perceivedStressBefore: stressBefore ?? undefined,
      perceivedStressAfter: stressAfter ?? undefined,
    });
    setStage("pick");
    setStressBefore(null);
    setStressAfter(null);
    setRemaining(15 * 60);
  };

  const giveUp = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (promptTimerRef.current) clearInterval(promptTimerRef.current);
    setRunning(false);
    setStage("stress-after");
  };

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const totalWalks = (data.walks || []).length;

  if (stage === "stress-before") {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2">
          <div className="text-sm text-ink-500">出門前</div>
          <h1 className="text-2xl font-semibold tracking-tight">現在的壓力幾分？</h1>
          <p className="text-sm text-ink-500 mt-2">
            回來後我們會比較。你會發現散步真的有用。
          </p>
        </div>
        <div className="card">
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setStressBefore(n)}
                className={`aspect-square rounded-lg text-sm font-semibold transition ${
                  stressBefore === n
                    ? "bg-warm-500 text-white"
                    : "bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 dark:hover:bg-ink-700"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-ink-500 mt-2">
            <span>無壓力</span>
            <span>快炸了</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={startWalk}
            disabled={stressBefore === null}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            記下，開始走 <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={skipStress} className="btn-ghost">
            略過
          </button>
        </div>
      </div>
    );
  }

  if (stage === "walking") {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2">
          <div className="text-sm text-ink-500 flex items-center gap-1">
            <Footprints className="h-3.5 w-3.5" /> 散步中
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            把手機收起來，眼睛看遠方
          </h1>
        </div>

        <div className="card flex flex-col items-center py-12">
          <div className="text-6xl font-light tabular-nums">
            {String(m).padStart(1, "0")}:{String(s).padStart(2, "0")}
          </div>
          <div className="mt-6 px-4 text-center text-sm text-ink-700 dark:text-ink-200 min-h-[40px] max-w-xs">
            {PROMPTS[promptIdx]}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setRunning((r) => !r)} className="btn-ghost flex-1">
            {running ? <PauseIcon className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? "暫停" : "繼續"}
          </button>
          <button onClick={giveUp} className="btn-ghost flex-1 text-warm-500">
            <X className="h-4 w-4" /> 提早結束
          </button>
        </div>

        <div className="card">
          <div className="text-sm font-medium mb-2">散步規則</div>
          <ul className="text-sm space-y-1 text-ink-700 dark:text-ink-200">
            <li>· 不要滑手機</li>
            <li>· 不要戴耳機聽 Podcast（給大腦真的休息）</li>
            <li>· 不要走得太快（這不是運動，是恢復）</li>
            <li>· 看 6 公尺以外的東西</li>
          </ul>
        </div>
      </div>
    );
  }

  if (stage === "stress-after") {
    const completed = target - Math.floor(remaining / 60);
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2">
          <div className="text-sm text-ink-500">回來了</div>
          <h1 className="text-2xl font-semibold tracking-tight">
            走了 {completed} 分鐘。現在的壓力幾分？
          </h1>
        </div>

        <div className="card">
          <div className="grid grid-cols-10 gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setStressAfter(n)}
                className={`aspect-square rounded-lg text-sm font-semibold transition ${
                  stressAfter === n
                    ? "bg-calm-700 text-white"
                    : "bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 dark:hover:bg-ink-700"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-ink-500 mt-2">
            <span>無壓力</span>
            <span>快炸了</span>
          </div>
        </div>

        {stressBefore !== null && stressAfter !== null && (
          <div className="card bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10">
            <div className="text-sm">
              壓力 <b>{stressBefore}</b> → <b>{stressAfter}</b>
              {stressAfter < stressBefore && (
                <span className="text-calm-700 dark:text-calm-300">
                  　降了 {stressBefore - stressAfter} 分
                </span>
              )}
            </div>
            <p className="text-xs text-ink-500 mt-1">
              記住這個感覺。下次想滑手機消化壓力時，先試 5 分鐘走路。
            </p>
          </div>
        )}

        <button onClick={finish} className="btn-primary w-full">
          <Check className="h-4 w-4" /> 紀錄這次散步
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500 flex items-center gap-1">
          <Footprints className="h-3.5 w-3.5" /> 散步處方
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">壓力高？先走出去</h1>
        <p className="text-sm text-ink-500 mt-2 leading-relaxed">
          研究上，15 分鐘戶外散步可以讓皮質醇明顯下降。比咖啡因、比社群、比甜食都有效，而且免費。
        </p>
      </div>

      <div className="space-y-2">
        {PRESETS.map((p) => (
          <button
            key={p.min}
            onClick={() => startStress(p.min)}
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
        <div className="text-sm text-ink-500">累計散步</div>
        <div className="text-xl font-semibold tabular-nums">{totalWalks} 次</div>
      </div>

      <NextStep
        title="走完還是緊繃？"
        reason="再做一次 60 秒生理嘆息，或試試自我慈悲。"
        href="/sigh"
        duration="60 秒"
      />
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <WalkInner />
    </ClientOnly>
  );
}
