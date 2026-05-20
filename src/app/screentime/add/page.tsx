"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { todayISO, upsertScreenTime } from "@/lib/storage";
import { ScreenTimeLog } from "@/lib/types";
import { Check, Smartphone, AlertCircle } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import { Suspense } from "react";

function AddInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [state, setState] = useState<
    | { kind: "ok"; saved: ScreenTimeLog }
    | { kind: "error"; reason: string }
    | { kind: "pending" }
  >({ kind: "pending" });

  useEffect(() => {
    const minutesParam = params.get("minutes");
    if (!minutesParam) {
      setState({ kind: "error", reason: "缺少 minutes 參數" });
      return;
    }
    const minutes = parseInt(minutesParam, 10);
    if (isNaN(minutes) || minutes < 0 || minutes > 1440) {
      setState({ kind: "error", reason: `minutes=${minutesParam} 不合法` });
      return;
    }
    const date = params.get("date") || todayISO();
    const pickupsParam = params.get("pickups");
    const sourceParam = (params.get("source") || "shortcut") as
      | "shortcut"
      | "mac-script"
      | "manual";

    const log: ScreenTimeLog = {
      date,
      totalMinutes: minutes,
      pickups: pickupsParam ? parseInt(pickupsParam, 10) : undefined,
      source: sourceParam,
    };
    upsertScreenTime(log);
    setState({ kind: "ok", saved: log });
  }, [params]);

  useEffect(() => {
    if (state.kind === "ok") {
      const t = setTimeout(() => router.push("/screentime"), 1500);
      return () => clearTimeout(t);
    }
  }, [state, router]);

  if (state.kind === "pending") {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-ink-500 animate-pulse">儲存中…</div>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2">
          <div className="text-sm text-ink-500 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5 text-warm-500" /> 無法存入
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">資料格式有問題</h1>
        </div>
        <div className="card text-sm text-ink-700 dark:text-ink-200">
          {state.reason}
          <div className="text-xs text-ink-500 mt-2 leading-relaxed">
            URL 應該長這樣：
            <br />
            <code className="text-[11px]">
              /screentime/add?minutes=235&pickups=47
            </code>
          </div>
        </div>
        <a href="/screentime" className="btn-primary w-full">
          回螢幕時間頁
        </a>
      </div>
    );
  }

  // ok
  const h = Math.floor(state.saved.totalMinutes / 60);
  const m = state.saved.totalMinutes % 60;
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500 flex items-center gap-1">
          <Check className="h-3.5 w-3.5 text-calm-700 dark:text-calm-300" /> 已存入
        </div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Smartphone className="h-6 w-6" />
          {state.saved.date}
        </h1>
      </div>
      <div className="card bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10">
        <div className="text-xs text-ink-500 mb-1">螢幕使用時間</div>
        <div className="text-3xl font-semibold tabular-nums">
          {h > 0 ? `${h} 小時 ` : ""}
          {m > 0 || h === 0 ? `${m} 分` : ""}
        </div>
        {state.saved.pickups !== undefined && (
          <div className="text-sm text-ink-500 mt-2">
            {state.saved.pickups} 次拿起
          </div>
        )}
        <div className="text-[11px] text-ink-500 mt-3">
          來源：
          {state.saved.source === "shortcut"
            ? "iOS Shortcut"
            : state.saved.source === "mac-script"
            ? "Mac 腳本"
            : "手動"}
        </div>
      </div>
      <div className="text-xs text-ink-500 text-center">即將跳回螢幕時間頁…</div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <Suspense fallback={<div className="text-ink-500 text-center pt-10">載入中…</div>}>
        <AddInner />
      </Suspense>
    </ClientOnly>
  );
}
