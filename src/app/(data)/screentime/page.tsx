"use client";

import { useEffect, useMemo, useState } from "react";
import { load, todayISO, upsertScreenTime } from "@/lib/storage";
import { AppData } from "@/lib/types";
import { avg } from "@/lib/insights";
import {
  Smartphone,
  Plus,
  Apple,
  Terminal,
  Copy,
  ExternalLink,
  Check,
  Trash2,
} from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import Link from "next/link";

function ScreenTimeInner() {
  const [data, setData] = useState<AppData>(load());
  const [open, setOpen] = useState(false);
  const [editDate, setEditDate] = useState(todayISO());
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [pickups, setPickups] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    return () => window.removeEventListener("brain-recovery:update", onUpdate);
  }, []);

  const logs = data.screenTime || [];
  const today = todayISO();
  const todayLog = logs.find((l) => l.date === today);

  // 7-day & 14-day views
  const last14 = useMemo(() => {
    const arr: { date: string; minutes: number | null }[] = [];
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    for (let i = 13; i >= 0; i--) {
      const d = new Date(t);
      d.setDate(t.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const log = logs.find((l) => l.date === iso);
      arr.push({ date: iso, minutes: log?.totalMinutes ?? null });
    }
    return arr;
  }, [logs]);

  const last7Avg = (() => {
    const vals = last14
      .slice(-7)
      .map((x) => x.minutes)
      .filter((x): x is number => x !== null);
    if (!vals.length) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  })();
  const maxMin = Math.max(120, ...last14.map((x) => x.minutes ?? 0));

  const submit = () => {
    const total = hours * 60 + minutes;
    if (total <= 0) return;
    upsertScreenTime({
      date: editDate,
      totalMinutes: total,
      pickups: pickups ? Number(pickups) : undefined,
      source: "manual",
    });
    setOpen(false);
    setHours(0);
    setMinutes(0);
    setPickups("");
  };

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const macCmd = `curl -sSL https://brain-recovery.zeabur.app/scripts/import-screentime.sh | bash`;
  const macScriptUrl = "/scripts/import-screentime.sh";
  const shortcutUrlTemplate = `https://brain-recovery.zeabur.app/screentime/add?minutes={{minutes}}&pickups={{pickups}}`;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500 flex items-center gap-1">
          <Smartphone className="h-3.5 w-3.5" /> 螢幕使用時間
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {todayLog
            ? `今天 ${formatMin(todayLog.totalMinutes)}`
            : "今天的螢幕時間？"}
        </h1>
        <p className="text-sm text-ink-500 mt-2 leading-relaxed">
          Apple 沒開放網頁讀 Screen Time，所以下面 3 條路任你選。
        </p>
      </div>

      {/* 今日 */}
      <div className="card">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="text-xs text-ink-500">今天</div>
            <div className="text-3xl font-semibold tabular-nums">
              {todayLog ? formatMin(todayLog.totalMinutes) : "—"}
            </div>
            {todayLog?.pickups && (
              <div className="text-xs text-ink-500 mt-1">
                {todayLog.pickups} 次拿起
              </div>
            )}
          </div>
          <button onClick={() => setOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" />
            {todayLog ? "改" : "輸入"}
          </button>
        </div>
        {last7Avg !== null && (
          <div className="pt-3 border-t border-ink-200/60 dark:border-ink-800 flex items-center justify-between text-xs text-ink-500">
            <span>7 天平均</span>
            <span className="font-medium text-ink-700 dark:text-ink-200">
              {formatMin(last7Avg)}
            </span>
          </div>
        )}
      </div>

      {/* 14-day chart */}
      {last14.some((x) => x.minutes !== null) && (
        <div className="card">
          <div className="text-sm font-medium mb-3">最近 14 天</div>
          <div className="flex items-end gap-1 h-32 mb-2">
            {last14.map((d, i) => {
              const v = d.minutes ?? 0;
              const h = v > 0 ? Math.max(4, (v / maxMin) * 110) : 2;
              const isToday = d.date === today;
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="flex-1 flex items-end w-full">
                    <div
                      className={`w-full rounded-t-sm ${
                        d.minutes === null
                          ? "bg-ink-200 dark:bg-ink-800"
                          : v >= 360
                          ? "bg-warm-500"
                          : v >= 240
                          ? "bg-warm-400/80"
                          : "bg-calm-500"
                      } ${isToday ? "ring-2 ring-calm-500/40" : ""}`}
                      style={{ height: `${h}px` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-ink-400">
            <span>14 天前</span>
            <span>今天</span>
          </div>
          <p className="text-xs text-ink-500 mt-3 leading-relaxed">
            建議目標：每日 &lt; 4 小時（240 分鐘）。橘色代表 ≥ 4 小時、紅色代表 ≥ 6 小時。
          </p>
        </div>
      )}

      {/* 三條路 */}
      <div className="text-xs text-ink-500 ml-1 mt-2">如何取得資料</div>

      {/* iOS Shortcut */}
      <div className="card space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="text-sm font-medium flex items-center gap-2">
            <Apple className="h-4 w-4" /> iOS Shortcut（半自動）
          </div>
          <span className="text-[10px] text-ink-500">2 分鐘設定</span>
        </div>
        <ol className="text-sm space-y-1.5 list-decimal list-inside text-ink-700 dark:text-ink-200">
          <li>iPhone 打開「捷徑」App，新增一個捷徑</li>
          <li>加入動作：「要求輸入」→ 文字 → 標題填「今天螢幕用了幾分鐘？」</li>
          <li>加入動作：「URL」→ 貼下面的網址</li>
          <li>加入動作：「打開 URL」</li>
          <li>儲存。每晚執行一次即可。</li>
        </ol>
        <div className="rounded-xl bg-ink-50 dark:bg-ink-900 p-3">
          <div className="text-[10px] text-ink-500 mb-1">URL 範本（把 minutes 換成『要求輸入』的結果）</div>
          <div className="flex items-start gap-2">
            <code className="text-xs flex-1 break-all">
              {shortcutUrlTemplate}
            </code>
            <button
              onClick={() => copy(shortcutUrlTemplate, "url")}
              className="text-ink-400 hover:text-ink-700 flex-shrink-0"
              title="複製"
            >
              {copied === "url" ? (
                <Check className="h-4 w-4 text-calm-700 dark:text-calm-300" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <p className="text-[11px] text-ink-500">
          打開 URL 時 Safari 會跳到本 App，自動把當天螢幕時間存進來。
        </p>
      </div>

      {/* Mac script */}
      <div className="card space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="text-sm font-medium flex items-center gap-2">
            <Terminal className="h-4 w-4" /> Mac 腳本（全自動）
          </div>
          <span className="text-[10px] text-ink-500">需要完整磁碟存取權</span>
        </div>
        <ol className="text-sm space-y-1.5 list-decimal list-inside text-ink-700 dark:text-ink-200">
          <li>到「系統設定 → 私隱權與安全性 → 完整磁碟存取權」，把「終端機」勾起來</li>
          <li>下載腳本，給執行權限：</li>
        </ol>
        <div className="rounded-xl bg-ink-950 text-ink-100 p-3 font-mono text-xs">
          <div className="flex items-start gap-2">
            <code className="flex-1 break-all">{macCmd}</code>
            <button
              onClick={() => copy(macCmd, "mac")}
              className="text-ink-400 hover:text-ink-200 flex-shrink-0"
            >
              {copied === "mac" ? (
                <Check className="h-4 w-4 text-calm-300" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <p className="text-[11px] text-ink-500 leading-relaxed">
          腳本會讀 `~/Library/Application Support/Knowledge/knowledgeC.db`，
          算出今天的螢幕使用時間，然後開 Safari 把資料存進這個 App。
          也可以排程：到 cron 加 <code>0 23 * * * bash {macScriptUrl}</code>。
        </p>
        <a
          href={macScriptUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-calm-700 dark:text-calm-300 hover:underline inline-flex items-center gap-1"
        >
          檢視腳本 <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Manual on daily checkin */}
      <Link
        href="/daily"
        className="card flex items-center justify-between hover:shadow-md transition"
      >
        <div>
          <div className="text-sm font-medium">每日打卡時也可順手填</div>
          <div className="text-xs text-ink-500 mt-1">
            最低門檻：每日狀態打卡頁面已加入「螢幕時間」滑桿。
          </div>
        </div>
      </Link>

      {/* recent entries */}
      {logs.length > 0 && (
        <div className="card">
          <div className="text-sm font-medium mb-2">最近紀錄</div>
          <ul className="space-y-1.5">
            {logs.slice(0, 7).map((l) => (
              <li
                key={l.date}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <span className="tabular-nums">{l.date}</span>
                  <span className="ml-2 text-xs text-ink-500">
                    {l.source === "manual"
                      ? "手動"
                      : l.source === "mac-script"
                      ? "Mac"
                      : l.source === "shortcut"
                      ? "iOS"
                      : "打卡"}
                  </span>
                </div>
                <div className="tabular-nums font-medium">
                  {formatMin(l.totalMinutes)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-ink-950 rounded-2xl p-5"
          >
            <div className="text-lg font-semibold mb-3">輸入螢幕使用時間</div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-ink-500 mb-1">日期</div>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="input"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-ink-500 mb-1">小時</div>
                  <input
                    type="number"
                    min={0}
                    max={24}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value) || 0)}
                    className="input text-center"
                  />
                </div>
                <div>
                  <div className="text-xs text-ink-500 mb-1">分鐘</div>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value) || 0)}
                    className="input text-center"
                  />
                </div>
              </div>
              <div>
                <div className="text-xs text-ink-500 mb-1">拿起次數（選填）</div>
                <input
                  type="number"
                  min={0}
                  value={pickups}
                  onChange={(e) => setPickups(e.target.value)}
                  className="input text-center"
                />
              </div>
              <button onClick={submit} className="btn-primary w-full">
                存下
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatMin(m: number): string {
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r} 分`;
  if (r === 0) return `${h} 小時`;
  return `${h} 小時 ${r} 分`;
}

export default function Page() {
  return (
    <ClientOnly>
      <ScreenTimeInner />
    </ClientOnly>
  );
}
