"use client";

import { useState, useEffect } from "react";
import {
  COPING_HABITS,
  DailyLog,
  EMOTION_GROUPS,
  STRESS_SOURCES,
  SYMPTOMS,
} from "@/lib/types";
import { load, todayISO, upsertDaily } from "@/lib/storage";
import { Check } from "lucide-react";
import Link from "next/link";
import ClientOnly from "@/components/ClientOnly";

const SLIDERS: {
  key: keyof Pick<
    DailyLog,
    "energy" | "stress" | "sleepQuality" | "focus" | "phoneFatigue"
  >;
  label: string;
  low: string;
  high: string;
}[] = [
  { key: "energy", label: "今天的精神", low: "完全沒電", high: "活力滿滿" },
  { key: "stress", label: "今天的壓力", low: "無壓力", high: "快炸了" },
  { key: "sleepQuality", label: "昨晚睡眠品質", low: "睡很糟", high: "恢復滿滿" },
  { key: "focus", label: "今天的專注", low: "散亂", high: "深度" },
  { key: "phoneFatigue", label: "手機使用後感受", low: "舒服", high: "很疲倦" },
];

function DailyInner() {
  const today = todayISO();
  const existing = load().daily.find((d) => d.date === today);
  const [log, setLog] = useState<DailyLog>(
    existing ?? {
      date: today,
      energy: 5,
      stress: 5,
      sleepQuality: 5,
      focus: 5,
      phoneFatigue: 5,
      symptoms: [],
      copingHabits: [],
      stressSources: [],
      note: "",
      emotions: [],
      sleepHours: 7,
      evenReflect: {},
    }
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  const toggle = (key: "symptoms" | "copingHabits" | "stressSources", v: string) => {
    setLog((cur) => {
      const arr = cur[key];
      return {
        ...cur,
        [key]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v],
      };
    });
  };

  const toggleEmotion = (v: string) => {
    setLog((cur) => {
      const arr = cur.emotions ?? [];
      return {
        ...cur,
        emotions: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v],
      };
    });
  };

  const submit = () => {
    upsertDaily(log);
    setSaved(true);
  };

  return (
    <div className="space-y-5 animate-fade-in pb-4">
      <div className="pt-2">
        <div className="text-sm text-ink-500">每日大腦狀態</div>
        <h1 className="text-2xl font-semibold tracking-tight">30 秒，幫大腦留個聲音</h1>
      </div>

      <div className="card space-y-5">
        {SLIDERS.map(({ key, label, low, high }) => (
          <div key={key}>
            <div className="flex items-baseline justify-between mb-1.5">
              <div className="label">{label}</div>
              <div className="text-sm tabular-nums text-calm-700 dark:text-calm-300">
                {log[key]}
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={log[key] as number}
              onChange={(e) =>
                setLog({ ...log, [key]: Number(e.target.value) } as DailyLog)
              }
              className="w-full accent-calm-600"
            />
            <div className="flex justify-between text-[11px] text-ink-500 mt-0.5">
              <span>{low}</span>
              <span>{high}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-baseline justify-between mb-2">
          <div className="label">昨晚睡了幾小時？</div>
          <div className="text-sm tabular-nums text-calm-700 dark:text-calm-300">
            {log.sleepHours ?? 7} 小時
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={12}
          step={0.5}
          value={log.sleepHours ?? 7}
          onChange={(e) =>
            setLog({ ...log, sleepHours: Number(e.target.value) })
          }
          className="w-full accent-calm-600"
        />
        <div className="flex justify-between text-[11px] text-ink-500 mt-0.5">
          <span>0</span>
          <span>4</span>
          <span>7</span>
          <span>10</span>
          <span>12</span>
        </div>
      </div>

      <div className="card">
        <div className="label mb-1">今天最像哪幾種情緒？（多選）</div>
        <p className="text-[11px] text-ink-500 mb-3">
          越精準命名情緒，越容易降低它的強度。— Lisa Feldman Barrett
        </p>
        <div className="space-y-3">
          {EMOTION_GROUPS.map((g) => (
            <div key={g.label}>
              <div className="text-[11px] text-ink-500 mb-1.5">{g.label}</div>
              <div className="flex flex-wrap gap-1.5">
                {g.words.map((w) => {
                  const on = (log.emotions ?? []).includes(w);
                  return (
                    <button
                      key={w}
                      onClick={() => toggleEmotion(w)}
                      className={`text-[12px] rounded-full px-2.5 py-1 border transition ${
                        on
                          ? g.tone === "warm"
                            ? "bg-warm-500 text-white border-warm-500"
                            : g.tone === "calm"
                            ? "bg-calm-700 text-white border-calm-700"
                            : "bg-ink-700 text-white border-ink-700"
                          : "border-ink-200 dark:border-ink-700 hover:border-calm-400"
                      }`}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ChipGroup
        title="身體有沒有出現警訊？（多選）"
        options={[...SYMPTOMS]}
        active={log.symptoms}
        onToggle={(v) => toggle("symptoms", v)}
      />

      <ChipGroup
        title="今天靠什麼撐過去？（多選）"
        options={[...COPING_HABITS]}
        active={log.copingHabits}
        onToggle={(v) => toggle("copingHabits", v)}
      />

      <ChipGroup
        title="今天的壓力來源？（多選）"
        options={[...STRESS_SOURCES]}
        active={log.stressSources}
        onToggle={(v) => toggle("stressSources", v)}
      />

      <div className="card">
        <label className="label">想多寫一句也可以（選填）</label>
        <textarea
          value={log.note}
          onChange={(e) => setLog({ ...log, note: e.target.value })}
          className="input mt-2 min-h-[80px]"
          placeholder="例如：今天會議多到不行，下午頭已經痛了。"
        />
      </div>

      <div className="card space-y-3">
        <div className="label">睡前 3 句反思（選填）</div>
        <p className="text-[11px] text-ink-500 -mt-1">
          一個小小的儀式，幫大腦關機。一句話就好。
        </p>
        <div>
          <div className="text-xs text-ink-500 mb-1">今天一個小小的 win</div>
          <input
            value={log.evenReflect?.win ?? ""}
            onChange={(e) =>
              setLog({
                ...log,
                evenReflect: { ...(log.evenReflect ?? {}), win: e.target.value },
              })
            }
            placeholder="例如：把那封信回了"
            className="input"
          />
        </div>
        <div>
          <div className="text-xs text-ink-500 mb-1">今天學到一件事</div>
          <input
            value={log.evenReflect?.lesson ?? ""}
            onChange={(e) =>
              setLog({
                ...log,
                evenReflect: {
                  ...(log.evenReflect ?? {}),
                  lesson: e.target.value,
                },
              })
            }
            placeholder="例如：開會前不要先看 IG"
            className="input"
          />
        </div>
        <div>
          <div className="text-xs text-ink-500 mb-1">今天感謝的一件事</div>
          <input
            value={log.evenReflect?.thanks ?? ""}
            onChange={(e) =>
              setLog({
                ...log,
                evenReflect: {
                  ...(log.evenReflect ?? {}),
                  thanks: e.target.value,
                },
              })
            }
            placeholder="例如：有人記得我喜歡黑咖啡"
            className="input"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={submit} className="btn-primary flex-1">
          {saved ? (
            <>
              <Check className="h-4 w-4" /> 已儲存
            </>
          ) : (
            "存下今天的狀態"
          )}
        </button>
        {saved && (
          <Link href="/" className="btn-ghost">
            回首頁
          </Link>
        )}
      </div>
    </div>
  );
}

function ChipGroup({
  title,
  options,
  active,
  onToggle,
}: {
  title: string;
  options: string[];
  active: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="card">
      <div className="label mb-3">{title}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = active.includes(o);
          return (
            <button
              key={o}
              onClick={() => onToggle(o)}
              className={on ? "pill-active" : "pill hover:border-calm-400"}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <DailyInner />
    </ClientOnly>
  );
}
