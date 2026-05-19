"use client";

import { useEffect, useState } from "react";
import {
  clearAll,
  exportJson,
  importJson,
  load,
  setApiKey,
} from "@/lib/storage";
import { AppData } from "@/lib/types";
import { KeyRound, Download, Upload, Trash2, ExternalLink } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import Reminders from "@/components/Reminders";

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

export default function Page() {
  return (
    <ClientOnly>
      <SettingsInner />
    </ClientOnly>
  );
}
