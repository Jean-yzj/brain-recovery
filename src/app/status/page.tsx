"use client";

import { useEffect, useState } from "react";
import { load } from "@/lib/storage";
import { AppData } from "@/lib/types";
import Link from "next/link";
import {
  Activity,
  Bed,
  Brain,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Coffee,
  Database,
  Hourglass,
  Link as LinkIcon,
  Moon,
  Smartphone,
  Target,
  XCircle,
  Zap,
} from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

interface Session {
  user?: { name?: string | null; email?: string | null; image?: string | null };
  error?: string;
}

function StatusInner() {
  const [data, setData] = useState<AppData>(load());
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    (async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const j = await res.json();
        setSession(j?.user ? j : null);
      } catch {
        setSession(null);
      } finally {
        setLoadingSession(false);
      }
    })();
    return () =>
      window.removeEventListener("brain-recovery:update", onUpdate);
  }, []);

  const last30 = (iso: string) => {
    const cutoff = Date.now() - 30 * 86_400_000;
    return new Date(iso).getTime() >= cutoff;
  };
  const last30Ts = (ts: number) => Date.now() - ts <= 30 * 86_400_000;

  const dailyCount = data.daily.filter((d) => last30(d.date)).length;
  const screenCount = (data.screenTime || []).filter((d) => last30(d.date)).length;
  const triggerCount = (data.triggers || []).filter((t) => last30Ts(t.ts)).length;
  const caffeineCount = (data.caffeine || []).filter((c) => last30Ts(c.ts)).length;

  const pauseCount = (data.pauses || []).filter((p) =>
    last30Ts(new Date(p.date).getTime())
  ).length;
  const sighCount = (data.sighs || []).filter((s) => last30Ts(s.ts)).length;
  const walkCount = (data.walks || []).filter((w) => last30Ts(w.ts)).length;
  const releaseCount = (data.releases || []).filter((r) => last30Ts(r.ts)).length;
  const completedQuests = (data.quests || []).filter(
    (q) => last30(q.date) && q.completed
  ).length;

  const isSignedIn = !!session?.user && session.error !== "RefreshError";
  const aiReady = !!data.settings.apiKey;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500 flex items-center gap-1">
          <Database className="h-3.5 w-3.5" /> 系統狀態
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">控制面板</h1>
        <p className="text-sm text-ink-500 mt-2 leading-relaxed">
          一頁看 4 層架構的所有資料來源、活動紀錄、整合狀態。最近 30 天為基準。
        </p>
      </div>

      {/* ① 資料輸入層 */}
      <SectionCard
        order="①"
        title="資料輸入"
        tone="data"
        items={[
          {
            icon: <ClipboardCheck className="h-4 w-4" />,
            name: "每日打卡",
            count: dailyCount,
            unit: "天",
            href: "/daily",
            warn: dailyCount < 7,
          },
          {
            icon: <Smartphone className="h-4 w-4" />,
            name: "螢幕時間",
            count: screenCount,
            unit: "天",
            href: "/screentime",
            warn: screenCount === 0,
          },
          {
            icon: <Hourglass className="h-4 w-4" />,
            name: "觸發紀錄",
            count: triggerCount,
            unit: "次",
            href: "/trigger",
          },
          {
            icon: <Coffee className="h-4 w-4" />,
            name: "咖啡因",
            count: caffeineCount,
            unit: "杯",
            href: "/caffeine",
          },
          {
            icon: <Activity className="h-4 w-4" />,
            name: "大腦疲勞檢測",
            count: data.assessments.length,
            unit: "次",
            href: "/assessment",
            warn: data.assessments.length === 0,
          },
          {
            icon: <Zap className="h-4 w-4" />,
            name: "Chronotype",
            count: data.chronotype ? 1 : 0,
            unit: data.chronotype
              ? data.chronotype.type === "lion"
                ? "獅子型"
                : data.chronotype.type === "bear"
                ? "熊型"
                : data.chronotype.type === "wolf"
                ? "狼型"
                : "海豚型"
              : "未測",
            href: "/chronotype",
            warn: !data.chronotype,
          },
        ]}
      />

      {/* ③ 行動執行層 */}
      <SectionCard
        order="③"
        title="行動執行"
        tone="action"
        items={[
          {
            icon: <Brain className="h-4 w-4" />,
            name: "Brain Pause",
            count: pauseCount,
            unit: "次",
            href: "/pause",
          },
          {
            icon: <Brain className="h-4 w-4" />,
            name: "生理嘆息",
            count: sighCount,
            unit: "次",
            href: "/sigh",
          },
          {
            icon: <Activity className="h-4 w-4" />,
            name: "散步",
            count: walkCount,
            unit: "次",
            href: "/walk",
          },
          {
            icon: <Activity className="h-4 w-4" />,
            name: "壓力出口",
            count: releaseCount,
            unit: "次",
            href: "/release",
          },
          {
            icon: <Target className="h-4 w-4" />,
            name: "今日任務（30 天完成）",
            count: completedQuests,
            unit: "次",
            href: "/quest",
          },
          {
            icon: <Bed className="h-4 w-4" />,
            name: "8 週計畫",
            count: data.plan.currentWeek,
            unit: "週",
            href: "/plan",
          },
        ]}
      />

      {/* ④ 整合層 */}
      <div className="card">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="text-[10px] text-ink-500 uppercase tracking-wider">
              ④ 整合
            </div>
            <div className="text-sm font-medium">外部連線</div>
          </div>
        </div>

        <div className="space-y-2">
          <IntegrationRow
            icon={<Calendar className="h-4 w-4" />}
            name="Google 日曆 / 提醒事項"
            connected={!loadingSession && isSignedIn}
            detail={
              loadingSession
                ? "確認中…"
                : isSignedIn
                ? session?.user?.email ?? "已連線"
                : "可登入啟用排程功能"
            }
            href="/settings"
          />
          <IntegrationRow
            icon={<LinkIcon className="h-4 w-4" />}
            name="Anthropic API（AI 報告 / 助理）"
            connected={aiReady}
            detail={
              aiReady
                ? `已設定（…${data.settings.apiKey?.slice(-4)}）`
                : "未設定 — 無 Key 也能用本地版報告"
            }
            href="/settings"
          />
          <IntegrationRow
            icon={<Moon className="h-4 w-4" />}
            name="瀏覽器提醒通知"
            connected={!!data.settings.reminders?.enabled}
            detail={
              data.settings.reminders?.enabled
                ? `早 ${data.settings.reminders.morningCheckin} · 下午 ${data.settings.reminders.afternoonPause} · 睡前 ${data.settings.reminders.windDown}`
                : "未啟用"
            }
            href="/settings"
          />
        </div>
      </div>

      {/* 個人化 */}
      <div className="card">
        <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-1">
          Coach 個人化
        </div>
        <div className="text-sm font-medium mb-3">推薦會根據這些參數調整</div>
        <ul className="space-y-1.5 text-sm">
          <Row
            label="主要目標"
            value={
              data.settings.goal
                ? {
                    sleep: "睡得更好",
                    anxiety: "降低焦慮",
                    focus: "提高專注",
                    phone: "減少手機依賴",
                    burnout: "從耗竭走出來",
                    general: "整體平衡",
                  }[data.settings.goal]
                : "未設定"
            }
          />
          <Row
            label="每日時間預算"
            value={`${data.settings.timeBudgetMin ?? 15} 分鐘`}
          />
          <Row
            label="睡眠目標"
            value={`${data.settings.sleepTargetHours ?? 8} 小時`}
          />
          <Row
            label="深度工作目標"
            value={`${data.settings.deepWorkTargetMin ?? 120} 分鐘`}
          />
          <Row
            label="暱稱"
            value={data.settings.name ?? "未設定"}
          />
        </ul>
        <Link
          href="/settings"
          className="text-xs text-calm-700 dark:text-calm-300 hover:underline mt-3 inline-block"
        >
          編輯個人化參數 →
        </Link>
      </div>

      <div className="card text-xs text-ink-500 space-y-1.5">
        <div className="text-sm font-medium text-ink-700 dark:text-ink-200">
          資料存放位置
        </div>
        <div>· 你的所有打卡、紀錄都存在這台瀏覽器的 localStorage</div>
        <div>· 沒有資料庫、沒有雲端同步（除非你登入 Google 寫到自己的日曆）</div>
        <div>· 換裝置就要重來。可在「設定」匯出 JSON 備份</div>
      </div>
    </div>
  );
}

function SectionCard({
  order,
  title,
  tone,
  items,
}: {
  order: string;
  title: string;
  tone: "data" | "action";
  items: {
    icon: React.ReactNode;
    name: string;
    count: number;
    unit: string;
    href: string;
    warn?: boolean;
  }[];
}) {
  return (
    <div className="card">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <div className="text-[10px] text-ink-500 uppercase tracking-wider">
            {order} {tone === "data" ? "資料輸入" : "行動執行"}
          </div>
          <div className="text-sm font-medium">{title}</div>
        </div>
        <span className="text-[10px] text-ink-400">最近 30 天</span>
      </div>
      <ul className="grid grid-cols-2 gap-2">
        {items.map((it) => (
          <Link
            key={it.name}
            href={it.href}
            className={`rounded-xl px-3 py-2.5 transition hover:shadow-md ${
              it.warn
                ? "bg-warm-50/60 dark:bg-warm-500/10"
                : it.count > 0
                ? "bg-calm-50/60 dark:bg-calm-900/30"
                : "bg-ink-50 dark:bg-ink-900"
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-ink-500">
              <span
                className={
                  it.count > 0
                    ? "text-calm-700 dark:text-calm-300"
                    : "text-ink-400"
                }
              >
                {it.icon}
              </span>
              <span className="truncate">{it.name}</span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-base font-semibold tabular-nums">{it.count}</span>
              <span className="text-[11px] text-ink-500">{it.unit}</span>
            </div>
          </Link>
        ))}
      </ul>
    </div>
  );
}

function IntegrationRow({
  icon,
  name,
  connected,
  detail,
  href,
}: {
  icon: React.ReactNode;
  name: string;
  connected: boolean;
  detail: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-ink-50 dark:bg-ink-900 hover:bg-ink-100 dark:hover:bg-ink-800 transition"
    >
      <div
        className={
          connected
            ? "text-calm-700 dark:text-calm-300"
            : "text-ink-400"
        }
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{name}</div>
        <div className="text-xs text-ink-500 truncate">{detail}</div>
      </div>
      {connected ? (
        <CheckCircle2 className="h-4 w-4 text-calm-700 dark:text-calm-300 flex-shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 text-ink-400 flex-shrink-0" />
      )}
    </Link>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between text-sm">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium">{value}</span>
    </li>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <StatusInner />
    </ClientOnly>
  );
}
