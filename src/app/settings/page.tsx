"use client";

import { useEffect, useState } from "react";
import {
  clearAll,
  exportJson,
  importJson,
  load,
  setApiKey,
  setGoal,
  setTimeBudget,
} from "@/lib/storage";
import { AppData, Goal } from "@/lib/types";
import { KeyRound, Download, Upload, Trash2, ExternalLink, Compass, LogIn } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import Reminders from "@/components/Reminders";
import SignInButton from "@/components/SignInButton";

function SettingsInner() {
  const [data, setData] = useState<AppData>(load());
  const [key, setKey] = useState(data.settings.apiKey ?? "");
  const [confirmReset, setConfirmReset] = useState(false);
  const [importErr, setImportErr] = useState("");

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    return () => window.removeEventListener("brain-recovery:update", onUpdate);
  }, []);

  const saveKey = () => {
    setApiKey(key.trim());
  };

  const doExport = () => {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brain-recovery-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = (file: File) => {
    setImportErr("");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importJson(String(reader.result));
      } catch (e) {
        setImportErr(e instanceof Error ? e.message : "匯入失敗");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500">設定</div>
        <h1 className="text-2xl font-semibold tracking-tight">你的 App，你做主</h1>
      </div>

      <div className="card space-y-3">
        <div className="flex items-center gap-2">
          <LogIn className="h-4 w-4 text-calm-700 dark:text-calm-300" />
          <div className="text-sm font-medium">Google 行事曆 / 提醒事項</div>
        </div>
        <p className="text-xs text-ink-500">
          登入 Google 後，可以把每天的練習一鍵排入你的行事曆或提醒事項。
          每個人只看到自己的資料 — App 透過 Google 帳號識別，不存任何雲端紀錄。
        </p>
        <SignInButton />
      </div>

      <PersonalizationCard data={data} />

      <Reminders />

      <div className="card space-y-3">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-calm-700 dark:text-calm-300" />
          <div className="text-sm font-medium">Anthropic API Key</div>
        </div>
        <p className="text-xs text-ink-500">
          AI 報告與大腦助理會用到。Key 只存在你的瀏覽器（localStorage），
          每次呼叫 API 時才會送到自己的伺服器再轉發到 Anthropic，
          我們不會儲存或上傳。
        </p>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="sk-ant-..."
          className="input"
        />
        <div className="flex items-center gap-2">
          <button onClick={saveKey} className="btn-primary">
            存下來
          </button>
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
          >
            去申請 <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        {data.settings.apiKey && (
          <div className="text-xs text-calm-700 dark:text-calm-300">
            目前已設定 Key（結尾 …{data.settings.apiKey.slice(-4)}）
          </div>
        )}
      </div>

      <div className="card space-y-3">
        <div className="text-sm font-medium">資料管理</div>
        <p className="text-xs text-ink-500">
          你的所有紀錄都存在這台裝置的瀏覽器裡，不會上傳到雲端。
          可以匯出成 JSON 備份，或在另一台裝置匯入。
        </p>
        <div className="flex gap-2 flex-wrap">
          <button onClick={doExport} className="btn-ghost">
            <Download className="h-4 w-4" /> 匯出 JSON
          </button>
          <label className="btn-ghost cursor-pointer">
            <Upload className="h-4 w-4" /> 匯入 JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) doImport(f);
              }}
            />
          </label>
        </div>
        {importErr && (
          <div className="text-xs text-warm-500">{importErr}</div>
        )}
        <div className="text-xs text-ink-500 pt-2 border-t border-ink-200/60 dark:border-ink-800">
          目前資料：每日打卡 {data.daily.length} 筆 · 檢測 {data.assessments.length} 次
          · 暫停 {data.pauses.length} 次 · 對話 {data.chat.length} 則
        </div>
      </div>

      <div className="card space-y-3">
        <div className="text-sm font-medium text-warm-500">危險區域</div>
        <p className="text-xs text-ink-500">
          清除全部資料。無法復原。
        </p>
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} className="btn-ghost">
            <Trash2 className="h-4 w-4" /> 清除全部資料
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                clearAll();
                setKey("");
                setConfirmReset(false);
              }}
              className="btn bg-warm-500 text-white hover:bg-warm-400"
            >
              確定清除
            </button>
            <button onClick={() => setConfirmReset(false)} className="btn-ghost">
              取消
            </button>
          </div>
        )}
      </div>

      <div className="card text-xs text-ink-500 space-y-2">
        <div>
          這個 App 的精神來自《大腦不疲勞》：焦慮、失眠、疲憊、注意力渙散，不只是意志力的問題，
          而是大腦長期過載的訊號。SHIFT — 睡眠、激素、發炎、食物、科技使用 — 是五個你可以慢慢調整的方向。
        </div>
        <div>本 App 不提供醫療建議。如有嚴重身心症狀，請尋求專業協助。</div>
        <div>免費安心專線：1925（依舊愛我）</div>
      </div>
    </div>
  );
}

const GOAL_LABELS: Record<Goal, string> = {
  sleep: "睡得更好",
  anxiety: "降低焦慮",
  focus: "提高專注",
  phone: "減少手機依賴",
  burnout: "從耗竭走出來",
  general: "整體平衡",
};

function PersonalizationCard({ data }: { data: AppData }) {
  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-2">
        <Compass className="h-4 w-4 text-calm-700 dark:text-calm-300" />
        <div className="text-sm font-medium">個人化方案</div>
      </div>
      <p className="text-xs text-ink-500">
        這兩個會影響首頁 coach 推薦的優先順序與練習長度。
      </p>

      <div>
        <div className="label mb-2">你最想先解決的</div>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
            <button
              key={g}
              onClick={() => setGoal(g)}
              className={`rounded-xl border px-3 py-2 text-sm transition ${
                data.settings.goal === g
                  ? "bg-calm-700 text-white border-calm-700"
                  : "bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-800 hover:border-calm-400"
              }`}
            >
              {GOAL_LABELS[g]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-2">
          <div className="label">每日時間預算</div>
          <div className="text-sm tabular-nums text-calm-700 dark:text-calm-300">
            {data.settings.timeBudgetMin ?? 15} 分鐘
          </div>
        </div>
        <input
          type="range"
          min={5}
          max={60}
          step={5}
          value={data.settings.timeBudgetMin ?? 15}
          onChange={(e) => setTimeBudget(Number(e.target.value))}
          className="w-full accent-calm-600"
        />
        <div className="flex justify-between text-[10px] text-ink-500 mt-1">
          <span>5</span>
          <span>15</span>
          <span>30</span>
          <span>60+</span>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <SettingsInner />
    </ClientOnly>
  );
}
