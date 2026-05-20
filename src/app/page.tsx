"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { load, todayISO } from "@/lib/storage";
import { AppData } from "@/lib/types";
import { coach, CoachAction } from "@/lib/coach";
import { brainScoreNow, streak, pauseCount } from "@/lib/insights";
import { AXIS_LABEL } from "@/lib/assessment";
import BrainScoreRing from "@/components/BrainScoreRing";
import {
  ArrowRight,
  Bed,
  BookOpen,
  Brain,
  CalendarRange,
  ChevronDown,
  Clock,
  Coffee,
  Feather,
  Flame,
  Footprints,
  Heart,
  HeartHandshake,
  Hourglass,
  Link2,
  Moon,
  Pause,
  ClipboardCheck,
  Smartphone,
  Sparkle,
  Sparkles,
  Sunrise,
  Target,
  Wind,
  Zap,
  Calendar,
} from "lucide-react";
import ClientOnly from "@/components/ClientOnly";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  wind: Wind,
  heart: Heart,
  "heart-handshake": HeartHandshake,
  pause: Pause,
  moon: Moon,
  bed: Bed,
  clock: Clock,
  coffee: Coffee,
  smartphone: Smartphone,
  hourglass: Hourglass,
  footprints: Footprints,
  sunrise: Sunrise,
  calendar: Calendar,
  sparkles: Sparkles,
  link: Link2,
  target: Target,
  zap: Zap,
  clipboard: ClipboardCheck,
  feather: Feather,
};

function DashboardInner() {
  const router = useRouter();
  const [data, setData] = useState<AppData>(load());
  const [now, setNow] = useState(new Date());
  const [showAllTools, setShowAllTools] = useState(false);

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => {
      window.removeEventListener("brain-recovery:update", onUpdate);
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    const d = load();
    const isFresh =
      !d.assessments.length &&
      !d.daily.length &&
      !d.pauses.length &&
      !d.settings.name;
    const seen =
      typeof window !== "undefined" &&
      window.localStorage.getItem("brain-recovery-seen-welcome");
    if (isFresh && !seen) {
      window.localStorage.setItem("brain-recovery-seen-welcome", "1");
      router.replace("/welcome");
    }
  }, [router]);

  const ctx = coach(data, now);
  const today = todayISO();
  const todayLog = data.daily.find((d) => d.date === today);
  const latest = data.daily[0];
  const score = brainScoreNow(latest);
  const assessment = data.assessments[0];
  const s = streak(data.daily);
  const pauses7 = pauseCount(data.pauses, 7);

  const greeting = (() => {
    const h = now.getHours();
    if (h < 5) return "夜深了";
    if (h < 11) return "早安";
    if (h < 14) return "中午好";
    if (h < 18) return "下午好";
    if (h < 22) return "晚上好";
    return "夜深了";
  })();

  const PrimaryIcon = ICONS[ctx.primary.iconKey] ?? Sparkle;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500">
          {greeting}
          {data.settings.name ? `，${data.settings.name}` : ""}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {ctx.stateSummary}
        </h1>
      </div>

      <div className="card block hover:shadow-lg transition bg-gradient-to-br from-calm-700 to-calm-900 text-white border-calm-900">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider bg-white/15 px-2 py-1 rounded-full">
            {ctx.primary.badge || "建議"}
          </span>
          {ctx.primary.duration && (
            <span className="text-xs text-white/80">
              {ctx.primary.duration}
            </span>
          )}
        </div>
        <Link href={ctx.primary.href} className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <PrimaryIcon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="text-lg font-semibold leading-tight">
              {ctx.primary.title}
            </div>
            <div className="text-sm text-white/85 mt-1.5 leading-relaxed">
              {ctx.primary.reason}
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-white/70 flex-shrink-0 mt-1.5" />
        </Link>
        <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
          <Link
            href="/schedule"
            className="text-xs text-white/80 hover:text-white inline-flex items-center gap-1"
          >
            <Calendar className="h-3.5 w-3.5" />
            排進今日行事曆
          </Link>
          <Link
            href={ctx.primary.href}
            className="text-xs text-white/80 hover:text-white inline-flex items-center gap-1"
          >
            現在做 <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {ctx.supporting.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-ink-500 ml-1">接下來這些也很適合你</div>
          {ctx.supporting.map((a) => {
            const Icon = ICONS[a.iconKey] ?? Sparkle;
            return (
              <Link
                key={a.id}
                href={a.href}
                className="card flex items-center gap-3 hover:shadow-md transition"
              >
                <div className="w-9 h-9 rounded-lg bg-calm-100 dark:bg-calm-900/30 text-calm-700 dark:text-calm-200 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <div className="text-sm font-medium truncate">{a.title}</div>
                    {a.badge && (
                      <span className="text-[10px] text-ink-500 flex-shrink-0">
                        {a.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink-500 mt-0.5 line-clamp-2">
                    {a.reason}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-ink-400 flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <BrainScoreRing
              score={score ?? assessment?.score ?? 0}
              size={88}
            />
          </div>
          <div className="flex-1 grid grid-cols-3 gap-2">
            <Stat
              label="連續打卡"
              value={`${s} 天`}
              icon={<Flame className="h-3.5 w-3.5" />}
            />
            <Stat
              label="7 日 Pause"
              value={`${pauses7}`}
              icon={<Pause className="h-3.5 w-3.5" />}
            />
            <Stat
              label="生理嘆息"
              value={`${data.sighs?.length ?? 0}`}
              icon={<Feather className="h-3.5 w-3.5" />}
            />
          </div>
        </div>
        {ctx.weekTheme && (
          <div className="mt-3 pt-3 border-t border-ink-200/60 dark:border-ink-800 flex items-center gap-2 text-xs">
            <span className="text-ink-500">{ctx.weekTheme}</span>
            {ctx.weakAxis && (
              <span className="pill text-[10px] py-0.5 px-2">
                {AXIS_LABEL[ctx.weakAxis].name}
              </span>
            )}
          </div>
        )}
      </div>

      {!todayLog && (
        <Link
          href="/daily"
          className="card flex items-center justify-between hover:shadow-md transition"
        >
          <div>
            <div className="text-sm font-medium">今天還沒打卡</div>
            <div className="text-xs text-ink-500 mt-1">
              30 秒就好。資料越多 coach 越準。
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-ink-400" />
        </Link>
      )}

      <button
        onClick={() => setShowAllTools((x) => !x)}
        className="card w-full flex items-center justify-between hover:shadow-md transition"
      >
        <div className="text-left">
          <div className="text-sm font-medium">所有工具</div>
          <div className="text-xs text-ink-500 mt-1">
            25 個依書本設計的功能，自己挑想用的
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-ink-400 transition-transform ${
            showAllTools ? "rotate-180" : ""
          }`}
        />
      </button>

      {showAllTools && (
        <div className="space-y-4 animate-fade-in">
          <Section title="當下緩解">
            <Tile href="/sigh" icon={<Feather className="h-5 w-5" />} title="生理嘆息" sub="60 秒鬆開" />
            <Tile href="/pause" icon={<Pause className="h-5 w-5" />} title="Brain Pause" sub="1–3 分鐘" />
            <Tile href="/defuse" icon={<Sparkle className="h-5 w-5" />} title="思緒解離" sub="念頭鬆開" />
            <Tile href="/compassion" icon={<HeartHandshake className="h-5 w-5" />} title="自我慈悲" sub="3 步驟" />
            <Tile href="/release" icon={<Heart className="h-5 w-5" />} title="壓力出口" sub="7 道門" />
            <Tile href="/walk" icon={<Footprints className="h-5 w-5" />} title="散步處方" sub="15 分鐘" />
          </Section>

          <Section title="睡眠">
            <Tile href="/winddown" icon={<Moon className="h-5 w-5" />} title="睡前儀式" sub="17 分鐘" />
            <Tile href="/sleep-calc" icon={<Clock className="h-5 w-5" />} title="睡眠週期" sub="90 分鐘" />
            <Tile href="/sleep-debt" icon={<Bed className="h-5 w-5" />} title="睡眠債" sub="14 天" />
            <Tile href="/caffeine" icon={<Coffee className="h-5 w-5" />} title="咖啡因" sub="半衰期" />
            <Tile href="/chronotype" icon={<Zap className="h-5 w-5" />} title="Chronotype" sub={data.chronotype ? "已測" : "做測驗"} />
          </Section>

          <Section title="心智訓練">
            <Tile href="/deep-work" icon={<Brain className="h-5 w-5" />} title="深度工作" sub="計時器" />
            <Tile href="/boredom" icon={<Hourglass className="h-5 w-5" />} title="無聊訓練" sub="多巴胺校準" />
            <Tile href="/morning-pages" icon={<Sunrise className="h-5 w-5" />} title="晨間日記" sub="意識流" />
            <Tile href="/detox" icon={<Smartphone className="h-5 w-5" />} title="數位排毒" sub={data.detox ? "進行中" : "選挑戰"} />
            <Tile href="/habits" icon={<Link2 className="h-5 w-5" />} title="習慣堆疊" sub={`${(data.habits ?? []).length} 條`} />
          </Section>

          <Section title="紀錄 & 回顧">
            <Tile href="/quest" icon={<Target className="h-5 w-5" />} title="今日任務" sub="連續完成" />
            <Tile href="/trigger" icon={<Smartphone className="h-5 w-5" />} title="觸發紀錄" sub="一鍵 log" />
            <Tile href="/daily" icon={<Calendar className="h-5 w-5" />} title="每日打卡" sub="30 秒" />
            <Tile href="/insights" icon={<Sparkles className="h-5 w-5" />} title="洞察" sub="模式" />
            <Tile href="/history" icon={<CalendarRange className="h-5 w-5" />} title="歷史" sub={`${data.daily.length} 天`} />
            <Tile href="/learn" icon={<BookOpen className="h-5 w-5" />} title="SHIFT 觀念" sub="了解大腦" />
          </Section>

          <Section title="整合">
            <Tile
              href="/schedule"
              icon={<Calendar className="h-5 w-5" />}
              title="排入行事曆"
              sub="Google 同步"
            />
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-ink-500 mb-2 ml-1">{title}</div>
      <div className="grid grid-cols-3 gap-2">{children}</div>
    </div>
  );
}

function Tile({
  href,
  icon,
  title,
  sub,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="card hover:shadow-md transition flex flex-col items-center text-center py-3.5"
    >
      <div className="text-calm-700 dark:text-calm-300">{icon}</div>
      <div className="text-xs font-medium mt-1.5">{title}</div>
      <div className="text-[10px] text-ink-500 mt-0.5">{sub}</div>
    </Link>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-ink-50 dark:bg-ink-900 px-2.5 py-2">
      <div className="flex items-center gap-1 text-[10px] text-ink-500">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="text-sm font-semibold mt-0.5 tabular-nums truncate">
        {value}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <DashboardInner />
    </ClientOnly>
  );
}
