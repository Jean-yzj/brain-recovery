"use client";

import { useEffect, useState } from "react";
import { DOORS } from "@/lib/release";
import { addRelease, load } from "@/lib/storage";
import { AppData, StressReleaseLog } from "@/lib/types";
import { Check, ArrowLeft } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import NextStep from "@/components/NextStep";

function ReleaseInner() {
  const [data, setData] = useState<AppData>(load());
  const [picked, setPicked] = useState<typeof DOORS[number] | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    return () => window.removeEventListener("brain-recovery:update", onUpdate);
  }, []);

  const releases = data.releases || [];
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60_000;
  const recent = releases.filter((r) => r.ts >= sevenDaysAgo);
  const counts = new Map<StressReleaseLog["door"], number>();
  recent.forEach((r) => counts.set(r.door, (counts.get(r.door) ?? 0) + 1));
  const favourite = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  const logIt = () => {
    if (!picked) return;
    addRelease({ ts: Date.now(), door: picked.id });
    setDone(true);
    setTimeout(() => {
      setDone(false);
      setPicked(null);
    }, 1800);
  };

  if (picked) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2 flex items-start gap-3">
          <button onClick={() => setPicked(null)} className="text-ink-400 hover:text-ink-700 mt-1">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="text-sm text-ink-500">壓力出口</div>
            <h1 className="text-2xl font-semibold tracking-tight">{picked.title}</h1>
          </div>
        </div>

        <div className="card">
          <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">
            {picked.body}
          </p>
        </div>

        <div className="card">
          <div className="text-sm font-medium mb-2">挑一個現在做</div>
          <ul className="space-y-2">
            {picked.microActs.map((a, i) => (
              <li
                key={i}
                className="rounded-xl bg-ink-50 dark:bg-ink-900 px-4 py-3 text-sm"
              >
                {a}
              </li>
            ))}
          </ul>
        </div>

        <button onClick={logIt} disabled={done} className="btn-primary w-full disabled:opacity-50">
          {done ? (
            <>
              <Check className="h-4 w-4" /> 已紀錄。給自己一點掌聲。
            </>
          ) : (
            `我做完了，紀錄一次「${picked.title}」`
          )}
        </button>

        {picked.id === "movement" && (
          <NextStep
            title="想要更完整的散步？"
            reason="15 分鐘戶外散步，能讓皮質醇明顯下降。"
            href="/walk"
            duration="15 分鐘"
          />
        )}

        {picked.id === "breath" && (
          <NextStep
            title="呼吸要更深入？"
            reason="生理嘆息法 60 秒，研究顯示比一般呼吸練習更快放鬆。"
            href="/sigh"
            duration="60 秒"
          />
        )}

        <div className="text-xs text-ink-500 text-center">
          出處：Emily & Amelia Nagoski《Burnout》
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500">完成壓力循環</div>
        <h1 className="text-2xl font-semibold tracking-tight">7 道出口，選一道</h1>
        <p className="text-sm text-ink-500 mt-2 leading-relaxed">
          光是『想開了』不夠。身體儲存著壓力，需要一個出口把這個 loop 真的合上。
        </p>
      </div>

      {favourite && (
        <div className="card bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10">
          <div className="text-xs text-ink-500">過去 7 天，你最常用</div>
          <div className="text-sm font-medium mt-0.5">
            {DOORS.find((d) => d.id === favourite)?.title}（{counts.get(favourite)} 次）
          </div>
          <p className="text-xs text-ink-500 mt-1">
            這就是你的『恢復風格』。不一定要每次都嘗試新的。
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {DOORS.map((d) => {
          const cnt = counts.get(d.id) ?? 0;
          return (
            <button
              key={d.id}
              onClick={() => setPicked(d)}
              className="card text-left hover:shadow-md transition"
            >
              <div className="flex items-baseline justify-between">
                <div className="text-base font-semibold">{d.title}</div>
                <div className="text-xs text-ink-500">
                  {d.timeMin} 分 {cnt > 0 && `· 7 天用過 ${cnt} 次`}
                </div>
              </div>
              <div className="text-sm text-ink-500 mt-1">{d.short}</div>
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
      <ReleaseInner />
    </ClientOnly>
  );
}
