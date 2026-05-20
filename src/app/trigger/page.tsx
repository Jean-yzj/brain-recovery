"use client";

import { useEffect, useState } from "react";
import { addTrigger, load } from "@/lib/storage";
import { AppData, TriggerLog } from "@/lib/types";
import { Smartphone, Coffee, Candy, Check, X, Wind } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import Link from "next/link";

type UrgeType = TriggerLog["type"];

const URGES: { id: UrgeType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "phone", label: "想拿手機", icon: Smartphone },
  { id: "scroll", label: "想滑社群", icon: Smartphone },
  { id: "sugar", label: "想吃甜的", icon: Candy },
  { id: "coffee", label: "想再喝咖啡", icon: Coffee },
  { id: "snack", label: "想找東西吃", icon: Candy },
  { id: "drink", label: "想喝酒", icon: Coffee },
];

const TRIGGERS = ["無聊", "焦慮", "疲倦", "難過", "壓力", "習慣", "餓了", "孤單"];

function TriggerInner() {
  const [data, setData] = useState<AppData>(load());
  const [pickedUrge, setPickedUrge] = useState<UrgeType | null>(null);
  const [pickedReason, setPickedReason] = useState<string | null>(null);
  const [stage, setStage] = useState<"urge" | "reason" | "wait" | "done">("urge");
  const [waitSec, setWaitSec] = useState(60);
  const [done, setDone] = useState<{ acted: boolean; urge: UrgeType; reason: string | null } | null>(null);

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    return () => window.removeEventListener("brain-recovery:update", onUpdate);
  }, []);

  useEffect(() => {
    if (stage !== "wait") return;
    const t = setInterval(() => {
      setWaitSec((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [stage]);

  const pickUrge = (u: UrgeType) => {
    setPickedUrge(u);
    setStage("reason");
  };

  const pickReason = (r: string) => {
    setPickedReason(r);
    setStage("wait");
    setWaitSec(60);
  };

  const skipReason = () => {
    setStage("wait");
    setWaitSec(60);
  };

  const finalize = (acted: boolean) => {
    if (!pickedUrge) return;
    addTrigger({
      ts: Date.now(),
      type: pickedUrge,
      trigger: pickedReason ?? undefined,
      acted,
    });
    setDone({ acted, urge: pickedUrge, reason: pickedReason });
    setStage("done");
  };

  const reset = () => {
    setPickedUrge(null);
    setPickedReason(null);
    setStage("urge");
    setWaitSec(60);
    setDone(null);
  };

  // last 24h stats
  const last24 = (data.triggers || []).filter(
    (t) => Date.now() - t.ts < 86_400_000
  );
  const resisted = last24.filter((t) => !t.acted).length;
  const acted = last24.filter((t) => t.acted).length;

  if (stage === "urge") {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2">
          <div className="text-sm text-ink-500">觸發紀錄</div>
          <h1 className="text-2xl font-semibold tracking-tight">你的大腦剛剛想做什麼？</h1>
          <p className="text-sm text-ink-500 mt-2 leading-relaxed">
            不是要你忍住。是讓你看見『想要』和『做』之間，有一條小縫。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {URGES.map((u) => {
            const Icon = u.icon;
            return (
              <button
                key={u.id}
                onClick={() => pickUrge(u.id)}
                className="card hover:shadow-md transition flex flex-col items-center text-center py-5"
              >
                <Icon className="h-6 w-6 text-calm-700 dark:text-calm-300" />
                <div className="text-sm font-medium mt-2">{u.label}</div>
              </button>
            );
          })}
        </div>

        {last24.length > 0 && (
          <div className="card">
            <div className="text-sm font-medium mb-2">過去 24 小時</div>
            <div className="grid grid-cols-3 gap-2">
              <Stat label="總紀錄" value={`${last24.length}`} />
              <Stat label="抵抗住" value={`${resisted}`} tone="calm" />
              <Stat label="還是做了" value={`${acted}`} tone="warm" />
            </div>
            <p className="text-xs text-ink-500 mt-3">
              『抵抗住』比『做了』有意義。每一次都在訓練多巴胺基線。
            </p>
          </div>
        )}
      </div>
    );
  }

  if (stage === "reason") {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2">
          <div className="text-sm text-ink-500">為什麼想？</div>
          <h1 className="text-2xl font-semibold tracking-tight">
            這個衝動，更像是？
          </h1>
          <p className="text-sm text-ink-500 mt-2">
            命名背後的情緒，是辨識『真的需要』vs『大腦在喊救命』的第一步。
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {TRIGGERS.map((t) => (
            <button
              key={t}
              onClick={() => pickReason(t)}
              className="card hover:shadow-md transition text-center py-3 text-sm font-medium"
            >
              {t}
            </button>
          ))}
        </div>
        <button onClick={skipReason} className="btn-ghost w-full">
          說不出來，先過
        </button>
      </div>
    );
  }

  if (stage === "wait") {
    const min = Math.floor(waitSec / 60);
    const sec = waitSec % 60;
    const done60 = waitSec === 0;
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2">
          <div className="text-sm text-ink-500">等 60 秒</div>
          <h1 className="text-2xl font-semibold tracking-tight">
            讓衝動的波過去
          </h1>
          <p className="text-sm text-ink-500 mt-2 leading-relaxed">
            渴望像浪：來、達到峰值、退去。研究上多數衝動的高峰只有 60–90 秒。
          </p>
        </div>

        <div className="card flex flex-col items-center py-12">
          <div className="text-6xl font-light tabular-nums">
            {String(min).padStart(1, "0")}:{String(sec).padStart(2, "0")}
          </div>
          <p className="text-sm text-ink-500 mt-6 text-center max-w-xs">
            {done60
              ? "波過了。現在還想嗎？"
              : "深呼吸。觀察衝動，但不動。"}
          </p>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => finalize(false)}
            className="btn-primary w-full"
          >
            <Check className="h-4 w-4" /> 我撐過了，沒有做
          </button>
          <button onClick={() => finalize(true)} className="btn-ghost w-full">
            <X className="h-4 w-4" /> 我還是做了
          </button>
        </div>

        {!done60 && (
          <Link
            href="/sigh"
            className="card flex items-center justify-between hover:shadow-md transition"
          >
            <div>
              <div className="text-sm font-medium flex items-center gap-2">
                <Wind className="h-4 w-4" /> 試試 60 秒生理嘆息
              </div>
              <div className="text-xs text-ink-500 mt-1">
                這 60 秒不要浪費，做嘆息更有效。
              </div>
            </div>
          </Link>
        )}
      </div>
    );
  }

  // done
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500">紀錄完成</div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {done!.acted ? "沒事，下次再試" : "你撐過了"}
        </h1>
      </div>

      <div className="card">
        <div className="text-sm">
          <div className="text-ink-500">這次想要</div>
          <div className="font-medium">{URGES.find((u) => u.id === done!.urge)?.label}</div>
        </div>
        {done!.reason && (
          <div className="text-sm mt-3">
            <div className="text-ink-500">背後是</div>
            <div className="font-medium">{done!.reason}</div>
          </div>
        )}
        <div className="text-sm mt-3">
          <div className="text-ink-500">結果</div>
          <div className={`font-medium ${done!.acted ? "text-warm-500" : "text-calm-700 dark:text-calm-300"}`}>
            {done!.acted ? "做了" : "沒做"}
          </div>
        </div>
      </div>

      {!done!.acted && (
        <div className="card bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10">
          <div className="text-sm font-medium">這是大腦在重新訓練。</div>
          <p className="text-xs text-ink-500 mt-1">
            每一次『想要但沒做』都在把多巴胺基線往健康方向拉。下次會更容易一點。
          </p>
        </div>
      )}

      <button onClick={reset} className="btn-primary w-full">
        再紀錄一次
      </button>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "calm" | "warm";
}) {
  return (
    <div className="rounded-xl bg-ink-50 dark:bg-ink-900 px-3 py-2">
      <div className="text-[10px] text-ink-500">{label}</div>
      <div
        className={`text-base font-semibold mt-0.5 tabular-nums ${
          tone === "calm"
            ? "text-calm-700 dark:text-calm-300"
            : tone === "warm"
            ? "text-warm-500"
            : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <TriggerInner />
    </ClientOnly>
  );
}
