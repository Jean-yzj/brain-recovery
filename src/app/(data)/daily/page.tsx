"use client";

import { useState, useEffect } from "react";
import {
  COPING_HABITS,
  DailyLog,
  EMOTION_GROUPS,
  STRESS_SOURCES,
  SYMPTOMS,
} from "@/lib/types";
import { load, todayISO, upsertDaily, upsertScreenTime } from "@/lib/storage";
import { Check, ChevronDown, Zap } from "lucide-react";
import Link from "next/link";
import ClientOnly from "@/components/ClientOnly";
import NextStep from "@/components/NextStep";

const MOOD_OPTIONS: { emoji: string; label: string; emotion: string }[] = [
  { emoji: "😩", label: "燃盡", emotion: "疲憊" },
  { emoji: "😣", label: "緊繃", emotion: "緊繃" },
  { emoji: "😐", label: "麻木", emotion: "麻木" },
  { emoji: "🙂", label: "OK", emotion: "平靜" },
  { emoji: "😌", label: "穩定", emotion: "踏實" },
  { emoji: "✨", label: "有勁", emotion: "有動力" },
];

const MODE_KEY = "brain-recovery-daily-mode";

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
  const existingData = load();
  const existing = existingData.daily.find((d) => d.date === today);
  const existingScreenTime = (existingData.screenTime || []).find((d) => d.date === today);
  const [screenMinutes, setScreenMinutes] = useState(
    existingScreenTime?.totalMinutes ?? 180
  );
  const [screenSkipped, setScreenSkipped] = useState(!existingScreenTime);
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
  const [mode, setMode] = useState<"quick" | "full">("quick");
  const [pickedMood, setPickedMood] = useState<string | null>(
    (existing?.emotions ?? []).find((e) =>
      MOOD_OPTIONS.some((m) => m.emotion === e)
    ) ?? null
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(MODE_KEY);
    if (stored === "full" || stored === "quick") setMode(stored);
  }, []);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  const switchMode = (m: "quick" | "full") => {
    setMode(m);
    if (typeof window !== "undefined") window.localStorage.setItem(MODE_KEY, m);
  };

  const pickMood = (emotion: string) => {
    setPickedMood(emotion);
    // Replace any existing mood emoji emotion with this one
    setLog((cur) => {
      const others = (cur.emotions ?? []).filter(
        (e) => !MOOD_OPTIONS.some((m) => m.emotion === e)
      );
      return { ...cur, emotions: [...others, emotion] };
    });
  };

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
    if (!screenSkipped) {
      upsertScreenTime({
        date: today,
        totalMinutes: screenMinutes,
        source: "daily-checkin",
      });
    }
    setSaved(true);
  };

  // Quick-mode primary 3 sliders
  const QUICK_SLIDERS = SLIDERS.slice(0, 3);

  return (
    <div className="space-y-5 animate-fade-in pb-4">
      <div className="pt-2 flex items-baseline justify-between">
        <div>
          <div className="text-sm text-ink-500">回診打卡</div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "quick" ? "10 秒就好" : "完整模式"}
          </h1>
        </div>
        <button
          onClick={() => switchMode(mode === "quick" ? "full" : "quick")}
          className="text-xs text-calm-700 dark:text-calm-300 hover:underline inline-flex items-center gap-1"
        >
          {mode === "quick" ? (
            <>
              <ChevronDown className="h-3.5 w-3.5" /> 展開完整
            </>
          ) : (
            <>
              <Zap className="h-3.5 w-3.5" /> 切回快速
            </>
          )}
        </button>
      </div>

      {/* Mood picker — both modes */}
      <div className="card">
        <div className="text-xs text-ink-500 mb-3">今天的感覺最像？</div>
        <div className="grid grid-cols-6 gap-1.5">
          {MOOD_OPTIONS.map((m) => {
            const on = pickedMood === m.emotion;
            return (
              <button
                key={m.emotion}
                onClick={() => pickMood(m.emotion)}
                className={`rounded-xl py-2 flex flex-col items-center transition ${
                  on
                    ? "bg-calm-700 text-white"
                    : "bg-ink-50 dark:bg-ink-900 hover:bg-ink-100 dark:hover:bg-ink-800"
                }`}
              >
                <div className="text-xl leading-none">{m.emoji}</div>
                <div className="text-[10px] mt-1">{m.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders — quick = 3, full = 5 */}
      <div className="card space-y-5">
        {(mode === "quick" ? QUICK_SLIDERS : SLIDERS).map(({ key, label, low, high }) => (
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

      {mode === "full" && (
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
      )}

      {mode === "full" && (
      <div className="card">
        <div className="flex items-baseline justify-between mb-2">
          <div className="label">今天螢幕使用時間（估計）</div>
          <div className="text-sm tabular-nums text-calm-700 dark:text-calm-300">
            {screenSkipped ? "—" : `${Math.floor(screenMinutes / 60)}h ${screenMinutes % 60}m`}
          </div>
        </div>
        {!screenSkipped ? (
          <>
            <input
              type="range"
              min={0}
              max={720}
              step={15}
              value={screenMinutes}
              onChange={(e) => setScreenMinutes(Number(e.target.value))}
              className="w-full accent-calm-600"
            />
            <div className="flex justify-between text-[11px] text-ink-500 mt-0.5">
              <span>0</span>
              <span>2h</span>
              <span>4h</span>
              <span>6h</span>
              <span>8h</span>
              <span>10h</span>
              <span>12h+</span>
            </div>
            <button
              onClick={() => setScreenSkipped(true)}
              className="text-[11px] text-ink-400 hover:text-ink-700 mt-2"
            >
              今天不想填
            </button>
          </>
        ) : (
          <button
            onClick={() => setScreenSkipped(false)}
            className="text-xs text-calm-700 dark:text-calm-300"
          >
            + 加入螢幕使用時間
          </button>
        )}
        <p className="text-[11px] text-ink-500 mt-2 leading-relaxed">
          iOS：設定 → 螢幕使用時間 → 看到今天總時數。也可以到{" "}
          <a href="/screentime" className="underline">/screentime</a> 設定自動匯入。
        </p>
      </div>
      )}

      {mode === "full" && (
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
      )}

      {mode === "full" && (
        <>
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
        </>
      )}

      {mode === "full" && (
      <>
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
      </>
      )}

      <div className="flex items-center gap-3">
        <button onClick={submit} className="btn-primary flex-1">
          {saved ? (
            <>
              <Check className="h-4 w-4" /> 已儲存
            </>
          ) : mode === "quick" ? (
            "存下，回去看處方"
          ) : (
            "存下今天的狀態"
          )}
        </button>
        {saved && (
          <Link href="/prescription" className="btn-ghost">
            看處方
          </Link>
        )}
      </div>

      {mode === "quick" && !saved && (
        <p className="text-[11px] text-ink-500 text-center">
          這就夠了。想填情緒、症狀、反思？右上角「展開完整」。
        </p>
      )}

      {saved && (
        <NextStep
          title="處方已根據今天的狀態調整"
          reason="去看 coach 為今天客製的劑量。"
          href="/prescription"
        />
      )}
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
