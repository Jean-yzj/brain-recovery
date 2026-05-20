"use client";

import { useEffect, useMemo, useState } from "react";
import { load } from "@/lib/storage";
import { AppData, DailyLog } from "@/lib/types";
import { brainScoreNow } from "@/lib/insights";
import MonthCalendar from "@/components/MonthCalendar";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X,
} from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import Link from "next/link";

function CalendarInner() {
  const [data, setData] = useState<AppData>(load());
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [pickedIso, setPickedIso] = useState<string | null>(null);

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    return () => window.removeEventListener("brain-recovery:update", onUpdate);
  }, []);

  const monthLabel = `${cursor.getFullYear()} 年 ${cursor.getMonth() + 1} 月`;

  // Compute month-level stats
  const stats = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const inMonth = (iso: string) => {
      const d = new Date(iso);
      return d.getFullYear() === y && d.getMonth() === m;
    };
    const monthLogs = data.daily.filter((d) => inMonth(d.date));
    const scores = monthLogs
      .map((d) => brainScoreNow(d))
      .filter((s): s is number => s !== null);
    const avg = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;
    const tsInMonth = (ts: number) => inMonth(new Date(ts).toISOString().slice(0, 10));
    const pauseCount = (data.pauses || []).filter((p) => tsInMonth(new Date(p.date).getTime())).length;
    const sighCount = (data.sighs || []).filter((s) => tsInMonth(s.ts)).length;
    const walkCount = (data.walks || []).filter((w) => tsInMonth(w.ts)).length;
    const questCount = (data.quests || []).filter((q) => inMonth(q.date) && q.completed).length;
    return {
      logged: monthLogs.length,
      avgScore: avg,
      pauseCount,
      sighCount,
      walkCount,
      questCount,
    };
  }, [cursor, data]);

  const picked: DailyLog | undefined = pickedIso
    ? data.daily.find((d) => d.date === pickedIso)
    : undefined;
  const pickedDate = pickedIso ? new Date(pickedIso) : null;
  const pickedScore = picked ? brainScoreNow(picked) : null;
  const pickedPauses = pickedIso
    ? (data.pauses || []).filter(
        (p) => new Date(p.date).toISOString().slice(0, 10) === pickedIso
      )
    : [];
  const pickedSighs = pickedIso
    ? (data.sighs || []).filter(
        (s) => new Date(s.ts).toISOString().slice(0, 10) === pickedIso
      )
    : [];
  const pickedWalks = pickedIso
    ? (data.walks || []).filter(
        (w) => new Date(w.ts).toISOString().slice(0, 10) === pickedIso
      )
    : [];
  const pickedQuest = pickedIso
    ? (data.quests || []).find((q) => q.date === pickedIso)
    : undefined;
  const pickedTriggers = pickedIso
    ? (data.triggers || []).filter(
        (t) => new Date(t.ts).toISOString().slice(0, 10) === pickedIso
      )
    : [];

  const go = (delta: number) => {
    const d = new Date(cursor);
    d.setMonth(d.getMonth() + delta);
    setCursor(d);
    setPickedIso(null);
  };

  const today = (() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  })();

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500 flex items-center gap-1">
          <CalendarDays className="h-3.5 w-3.5" /> 月曆
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">你的大腦這個月</h1>
        <p className="text-sm text-ink-500 mt-2 leading-relaxed">
          每一格是一天。顏色越藍代表大腦狀態越穩，越橘代表越疲勞。點任一天看當天詳情。
        </p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => go(-1)} className="btn-ghost px-3">
            <ChevronLeft className="h-4 w-4" /> 上個月
          </button>
          <div className="text-base font-semibold">{monthLabel}</div>
          <button onClick={() => go(1)} className="btn-ghost px-3">
            下個月 <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <MonthCalendar
          data={data}
          monthDate={cursor}
          onPickDay={(iso) => setPickedIso(iso)}
          selectedIso={pickedIso ?? undefined}
        />

        <div className="mt-4 pt-3 border-t border-ink-200/60 dark:border-ink-800 flex items-center gap-3 text-[10px] text-ink-500">
          <span>色階：</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-warm-200 dark:bg-warm-500/40" />
            <span>很累</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-warm-100 dark:bg-warm-500/20" />
            <span>累</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-calm-100 dark:bg-calm-900/40" />
            <span>還行</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-calm-200 dark:bg-calm-900/60" />
            <span>穩定</span>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-ink-500">
          右下角的小圓點代表當天執行的：P=暫停、S=嘆息、W=散步、Q=今日任務、R=壓力出口
        </div>
      </div>

      <div className="card">
        <div className="text-sm font-medium mb-3">本月概覽</div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="平均分數" value={stats.avgScore !== null ? `${stats.avgScore}` : "—"} />
          <Stat label="打卡天數" value={`${stats.logged}`} />
          <Stat label="Brain Pause" value={`${stats.pauseCount}`} />
          <Stat label="生理嘆息" value={`${stats.sighCount}`} />
          <Stat label="散步" value={`${stats.walkCount}`} />
          <Stat label="完成任務" value={`${stats.questCount}`} />
        </div>
      </div>

      <Link
        href="/insights"
        className="card flex items-center justify-between hover:shadow-md transition"
      >
        <div>
          <div className="text-sm font-medium">想看趨勢、壓力來源、SHIFT 雷達？</div>
          <div className="text-xs text-ink-500 mt-1">到「洞察」頁。</div>
        </div>
        <ChevronRight className="h-5 w-5 text-ink-400" />
      </Link>

      <Link
        href="/body"
        className="card flex items-center justify-between hover:shadow-md transition"
      >
        <div>
          <div className="text-sm font-medium">身體 × 大腦深度分析</div>
          <div className="text-xs text-ink-500 mt-1">
            找出哪個 SHIFT 軸導致你哪種身體警訊。
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-ink-400" />
      </Link>

      {pickedIso && pickedDate && (
        <div
          onClick={() => setPickedIso(null)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-ink-950 rounded-2xl p-5 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-baseline justify-between mb-1">
              <div>
                <div className="text-xs text-ink-500">
                  {pickedDate.getFullYear()} 年 {pickedDate.getMonth() + 1} 月
                </div>
                <h2 className="text-2xl font-semibold tabular-nums">
                  {pickedDate.getMonth() + 1}/{pickedDate.getDate()}
                  <span className="text-sm font-normal text-ink-500 ml-2">
                    {["週日", "週一", "週二", "週三", "週四", "週五", "週六"][pickedDate.getDay()]}
                  </span>
                  {pickedIso === today && (
                    <span className="ml-2 text-xs text-warm-500">· 今天</span>
                  )}
                </h2>
              </div>
              <button onClick={() => setPickedIso(null)}>
                <X className="h-5 w-5 text-ink-400" />
              </button>
            </div>

            {picked ? (
              <>
                {pickedScore !== null && (
                  <div className="mt-3 rounded-xl bg-calm-50 dark:bg-calm-900/30 px-4 py-3">
                    <div className="text-xs text-ink-500">大腦狀態指數</div>
                    <div className="text-3xl font-semibold tabular-nums">
                      {pickedScore}
                      <span className="text-sm text-ink-500 font-normal">/100</span>
                    </div>
                  </div>
                )}
                <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <Field label="精神" v={picked.energy} />
                  <Field label="壓力" v={picked.stress} />
                  <Field label="睡眠品質" v={picked.sleepQuality} />
                  <Field label="專注" v={picked.focus} />
                  <Field label="手機疲倦" v={picked.phoneFatigue} />
                  {picked.sleepHours !== undefined && (
                    <Field label="睡眠時數" v={`${picked.sleepHours}h`} />
                  )}
                </ul>
                {(picked.emotions ?? []).length > 0 && (
                  <Chips title="情緒" items={picked.emotions ?? []} />
                )}
                {picked.symptoms.length > 0 && (
                  <Chips title="身體警訊" items={picked.symptoms} tone="warm" />
                )}
                {picked.copingHabits.length > 0 && (
                  <Chips title="撐過去的方式" items={picked.copingHabits} />
                )}
                {picked.stressSources.length > 0 && (
                  <Chips title="壓力來源" items={picked.stressSources} />
                )}
                {picked.note && (
                  <div className="mt-4">
                    <div className="text-xs text-ink-500 mb-1">當天的話</div>
                    <p className="text-sm bg-ink-50 dark:bg-ink-900 p-3 rounded-xl whitespace-pre-line">
                      {picked.note}
                    </p>
                  </div>
                )}
                {picked.evenReflect &&
                  (picked.evenReflect.win ||
                    picked.evenReflect.lesson ||
                    picked.evenReflect.thanks) && (
                    <div className="mt-4 space-y-2">
                      {picked.evenReflect.win && (
                        <Reflect label="🏆 win" text={picked.evenReflect.win} />
                      )}
                      {picked.evenReflect.lesson && (
                        <Reflect label="💡 lesson" text={picked.evenReflect.lesson} />
                      )}
                      {picked.evenReflect.thanks && (
                        <Reflect label="💛 thanks" text={picked.evenReflect.thanks} />
                      )}
                    </div>
                  )}
              </>
            ) : (
              <div className="mt-3 text-sm text-ink-500">這天沒有打卡。</div>
            )}

            <div className="mt-4 pt-3 border-t border-ink-200/60 dark:border-ink-800 space-y-1.5 text-xs text-ink-500">
              {pickedPauses.length > 0 && <div>· Brain Pause × {pickedPauses.length}</div>}
              {pickedSighs.length > 0 && <div>· 生理嘆息 × {pickedSighs.length}</div>}
              {pickedWalks.length > 0 && (
                <div>
                  · 散步 × {pickedWalks.length}（共{" "}
                  {pickedWalks.reduce((a, w) => a + w.minutes, 0)} 分鐘）
                </div>
              )}
              {pickedTriggers.length > 0 && (
                <div>
                  · 觸發紀錄 × {pickedTriggers.length}（抵抗{" "}
                  {pickedTriggers.filter((t) => !t.acted).length}、行動{" "}
                  {pickedTriggers.filter((t) => t.acted).length}）
                </div>
              )}
              {pickedQuest?.completed && <div>· 完成今日任務</div>}
              {pickedPauses.length +
                pickedSighs.length +
                pickedWalks.length +
                (pickedQuest?.completed ? 1 : 0) ===
                0 &&
                !picked && (
                  <div className="text-ink-400 italic">沒有任何紀錄。</div>
                )}
            </div>
          </div>
        </div>
      )}
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

function Field({ label, v }: { label: string; v: number | string }) {
  return (
    <li className="rounded-lg bg-ink-50 dark:bg-ink-900 px-3 py-2">
      <div className="text-[10px] text-ink-500">{label}</div>
      <div className="text-sm font-semibold tabular-nums mt-0.5">{v}</div>
    </li>
  );
}

function Chips({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone?: "warm";
}) {
  return (
    <div className="mt-4">
      <div className="text-xs text-ink-500 mb-1">{title}</div>
      <div className="flex flex-wrap gap-1">
        {items.map((i) => (
          <span
            key={i}
            className={
              tone === "warm"
                ? "pill bg-warm-50 dark:bg-warm-500/10 border-warm-200/60"
                : "pill"
            }
          >
            {i}
          </span>
        ))}
      </div>
    </div>
  );
}

function Reflect({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-lg bg-ink-50 dark:bg-ink-900 px-3 py-2">
      <div className="text-[10px] text-ink-500 mb-0.5">{label}</div>
      <div className="text-sm">{text}</div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <CalendarInner />
    </ClientOnly>
  );
}
