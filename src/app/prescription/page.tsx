"use client";

import { useEffect, useState } from "react";
import { load } from "@/lib/storage";
import { AppData } from "@/lib/types";
import { axisLabelOf, prescription } from "@/lib/prescription";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FileText,
  Pill,
  RefreshCw,
  Sparkle,
  Zap,
} from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

const GOAL_LABEL: Record<string, string> = {
  sleep: "睡得更好",
  anxiety: "降低焦慮",
  focus: "提高專注",
  phone: "減少手機依賴",
  burnout: "從耗竭走出來",
  general: "整體平衡",
};

function PrescriptionInner() {
  const [data, setData] = useState<AppData>(load());
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => {
      window.removeEventListener("brain-recovery:update", onUpdate);
      clearInterval(t);
    };
  }, []);

  const rx = prescription(data, now);
  const axisName = axisLabelOf(rx.weekProtocol.axisFocus);

  if (!rx.profile.hasAssessment) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="pt-2">
          <div className="text-sm text-ink-500 flex items-center gap-1">
            <Pill className="h-3.5 w-3.5" /> 你的處方
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">先做一次完整檢查</h1>
          <p className="text-sm text-ink-500 mt-2 leading-relaxed">
            就像看醫生：第一次需要詳細問診，之後就只看處方、回診微調，不用每次都從頭來。
          </p>
        </div>
        <Link
          href="/assessment"
          className="card flex items-center justify-between hover:shadow-md transition bg-gradient-to-br from-calm-700 to-calm-900 text-white border-calm-900"
        >
          <div>
            <div className="text-sm font-medium flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" /> 開始大腦疲勞檢測
            </div>
            <div className="text-xs text-white/80 mt-1">12 題 · 約 90 秒</div>
          </div>
          <ArrowRight className="h-5 w-5 text-white/70" />
        </Link>
        <Link
          href="/chronotype"
          className="card flex items-center justify-between hover:shadow-md transition"
        >
          <div>
            <div className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" /> 順便做 Chronotype 測驗
            </div>
            <div className="text-xs text-ink-500 mt-1">
              知道你是哪種類型，後面的時段會自動校準
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-ink-400" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500 flex items-center gap-1">
          <Pill className="h-3.5 w-3.5" /> 你的處方
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          第 {rx.weekProtocol.weekNumber} 週 · {rx.weekProtocol.theme}
        </h1>
        <p className="text-sm text-ink-500 mt-2 leading-relaxed">
          {rx.stateSummary}
        </p>
      </div>

      {/* 今日劑量 — 動態，會隨狀態變 */}
      {rx.todayDoses.length > 0 && (
        <div>
          <div className="text-xs text-ink-500 mb-2 ml-1 uppercase tracking-wider">
            今日劑量（依今天的狀態調整）
          </div>
          <div className="space-y-2">
            {rx.todayDoses.map((dose, i) => (
              <Link
                key={i}
                href={dose.href}
                className="card flex items-center gap-3 hover:shadow-md transition"
              >
                <div className="w-9 h-9 rounded-lg bg-calm-100 dark:bg-calm-900/30 text-calm-700 dark:text-calm-200 flex items-center justify-center text-xs font-semibold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <div className="text-sm font-medium truncate">{dose.title}</div>
                    {dose.badge && (
                      <span className="text-[10px] text-ink-500 flex-shrink-0">
                        {dose.badge}
                      </span>
                    )}
                    <span className="text-[10px] text-ink-400 ml-auto flex-shrink-0">
                      {dose.minutes < 1 ? "1 分內" : `${dose.minutes} 分`}
                    </span>
                  </div>
                  <div className="text-xs text-ink-500 mt-0.5 line-clamp-2">
                    {dose.reason}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-ink-400 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 本週協議 — 一週內穩定 */}
      <div>
        <div className="text-xs text-ink-500 mb-2 ml-1 uppercase tracking-wider">
          本週協議（一週內穩定）
        </div>
        <div className="card space-y-4">
          {axisName && (
            <div className="flex items-center gap-2 text-sm">
              <span className="pill text-[11px] bg-calm-100 dark:bg-calm-900/30 text-calm-700 dark:text-calm-200 border-calm-200">
                重點軸：{axisName}
              </span>
            </div>
          )}

          <div>
            <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-calm-700 dark:text-calm-300" />
              每天做
            </div>
            <ul className="space-y-1.5">
              {rx.weekProtocol.doDaily.map((it, i) => (
                <RxRow key={i} item={it} />
              ))}
            </ul>
          </div>

          {rx.weekProtocol.avoid.length > 0 && (
            <div>
              <div className="text-xs font-medium mb-2 flex items-center gap-1.5 text-warm-500">
                <span className="text-warm-500">✕</span>
                避免
              </div>
              <ul className="space-y-1.5">
                {rx.weekProtocol.avoid.map((it, i) => (
                  <li
                    key={i}
                    className="text-sm text-ink-600 dark:text-ink-300 flex gap-2"
                  >
                    <span className="text-warm-500">·</span>
                    <span>{it.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {rx.weekProtocol.oneTime.length > 0 && (
            <div>
              <div className="text-xs font-medium mb-2 flex items-center gap-1.5">
                <Sparkle className="h-3.5 w-3.5 text-calm-700 dark:text-calm-300" />
                本週做一次
              </div>
              <ul className="space-y-1.5">
                {rx.weekProtocol.oneTime.map((it, i) => (
                  <RxRow key={i} item={it} />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 你的檔案 — 不用再填 */}
      <div>
        <div className="text-xs text-ink-500 mb-2 ml-1 uppercase tracking-wider">
          你的檔案 · 不用再重來
        </div>
        <div className="card space-y-2.5">
          <ProfileRow
            icon={<ClipboardCheck className="h-4 w-4" />}
            label="SHIFT 大腦疲勞檢測"
            value={
              rx.profile.daysSinceAssessment === 0
                ? "今天剛做"
                : `${rx.profile.daysSinceAssessment} 天前完成`
            }
            ok
            href="/assessment"
            actionLabel={rx.profile.needsRecheck ? "建議回診" : "查看結果"}
            highlight={rx.profile.needsRecheck}
          />
          <ProfileRow
            icon={<Zap className="h-4 w-4" />}
            label="Chronotype 類型"
            value={rx.profile.chronotypeName ?? "未測"}
            ok={rx.profile.hasChronotype}
            href="/chronotype"
            actionLabel={rx.profile.hasChronotype ? "查看" : "做測驗"}
          />
          <ProfileRow
            icon={<Compass className="h-4 w-4" />}
            label="主要目標"
            value={rx.profile.goal ? GOAL_LABEL[rx.profile.goal] : "未設定"}
            ok={rx.profile.hasGoal}
            href="/settings"
            actionLabel="調整"
          />
          <ProfileRow
            icon={<FileText className="h-4 w-4" />}
            label="每日時間預算"
            value={`${rx.profile.timeBudget} 分鐘`}
            ok
            href="/settings"
            actionLabel="調整"
          />
          {rx.profile.daysUntilRecheck !== undefined && (
            <div className="pt-2 mt-2 border-t border-ink-200/60 dark:border-ink-800 text-xs flex items-center justify-between">
              <span className="text-ink-500 flex items-center gap-1.5">
                <RefreshCw className="h-3 w-3" />
                {rx.profile.needsRecheck
                  ? `已超過 ${-rx.profile.daysUntilRecheck} 天，建議回診一次`
                  : `下次完整檢查：${rx.profile.daysUntilRecheck} 天後`}
              </span>
              {rx.profile.needsRecheck && (
                <Link
                  href="/assessment"
                  className="text-calm-700 dark:text-calm-300 hover:underline"
                >
                  現在做 →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <Link
        href="/daily"
        className="card flex items-center justify-between hover:shadow-md transition bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10"
      >
        <div>
          <div className="text-sm font-medium">回診 · 10 秒快速打卡</div>
          <div className="text-xs text-ink-500 mt-1">
            只要 3 個 slider + 心情。每週你也可以做一次完整檢查。
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-ink-400" />
      </Link>
    </div>
  );
}

function RxRow({ item }: { item: { title: string; href?: string; minutes?: number } }) {
  const content = (
    <>
      <span className="text-calm-500">·</span>
      <span className="flex-1">{item.title}</span>
      {typeof item.minutes === "number" && item.minutes > 0 && (
        <span className="text-[10px] text-ink-400 flex-shrink-0">
          {item.minutes} 分
        </span>
      )}
    </>
  );
  if (item.href) {
    return (
      <li>
        <Link
          href={item.href}
          className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-200 hover:text-calm-700 dark:hover:text-calm-300 transition"
        >
          {content}
        </Link>
      </li>
    );
  }
  return (
    <li className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-200">
      {content}
    </li>
  );
}

function ProfileRow({
  icon,
  label,
  value,
  ok,
  href,
  actionLabel,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  ok: boolean;
  href: string;
  actionLabel: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 -mx-1 px-1 py-1 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-900 transition"
    >
      <div className={ok ? "text-calm-700 dark:text-calm-300" : "text-ink-400"}>
        {ok ? <CheckCircle2 className="h-4 w-4" /> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-ink-500">{label}</div>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
      <span
        className={`text-xs ${
          highlight
            ? "text-warm-500"
            : "text-calm-700 dark:text-calm-300"
        } hover:underline`}
      >
        {actionLabel}
      </span>
    </Link>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <PrescriptionInner />
    </ClientOnly>
  );
}
