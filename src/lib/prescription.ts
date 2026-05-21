import { AppData } from "./types";
import { coach } from "./coach";
import { topAxes, AXIS_LABEL } from "./assessment";
import { CHRONOTYPE_PROFILE } from "./chronotype";
import { netDebt, debtSeries } from "./sleepdebt";

export interface PrescriptionItem {
  title: string;
  detail?: string;
  href?: string;
  minutes?: number;
}

export interface WeeklyProtocol {
  weekNumber: number;
  theme: string;
  axisFocus?: "sleep" | "tech" | "stress" | "body" | "food";
  doDaily: PrescriptionItem[];     // 每天
  avoid: PrescriptionItem[];       // 避免
  oneTime: PrescriptionItem[];     // 本週做一次
}

export interface TodayDose {
  title: string;
  reason: string;
  href: string;
  minutes: number;
  badge?: string;
}

export interface ProfileSnapshot {
  hasAssessment: boolean;
  assessmentDate?: string;
  daysSinceAssessment?: number;
  hasChronotype: boolean;
  chronotypeName?: string;
  hasGoal: boolean;
  goal?: string;
  timeBudget: number;
  needsRecheck: boolean;        // true if assessment > 28 days old
  daysUntilRecheck?: number;    // -ve if overdue
}

export interface Prescription {
  weekProtocol: WeeklyProtocol;
  todayDoses: TodayDose[];
  profile: ProfileSnapshot;
  stateSummary: string;
}

const AXIS_PROTOCOL: Record<
  "sleep" | "tech" | "stress" | "body" | "food",
  {
    theme: string;
    doDaily: PrescriptionItem[];
    avoid: PrescriptionItem[];
    oneTime: PrescriptionItem[];
  }
> = {
  sleep: {
    theme: "睡眠節奏修復",
    doDaily: [
      { title: "固定起床時間（誤差 30 分鐘內）", minutes: 0 },
      { title: "早上 10 分鐘曬光", minutes: 10 },
      { title: "睡前 30 分鐘不滑手機", href: "/winddown", minutes: 30 },
    ],
    avoid: [
      { title: "下午 2 點後攝取咖啡因" },
      { title: "週末睡到中午（讓節奏錯位）" },
    ],
    oneTime: [
      { title: "完成一次 17 分鐘睡前儀式", href: "/winddown", minutes: 17 },
      { title: "用 90 分鐘 cycle 算今晚就寢時間", href: "/sleep-calc", minutes: 1 },
    ],
  },
  tech: {
    theme: "減少螢幕暴露",
    doDaily: [
      { title: "工作時只開一個分頁", minutes: 0 },
      { title: "起床第一小時不滑社群", minutes: 60 },
      { title: "把手機螢幕改成黑白（iOS 灰階）", minutes: 3 },
    ],
    avoid: [
      { title: "睡前在床上滑手機" },
      { title: "邊吃飯邊滑" },
    ],
    oneTime: [
      { title: "開始 7 天無手機晨間挑戰", href: "/detox", minutes: 1 },
      { title: "做一次 3 分鐘無聊訓練", href: "/boredom", minutes: 3 },
    ],
  },
  stress: {
    theme: "壓力恢復力",
    doDaily: [
      { title: "做 1 次 60 秒生理嘆息", href: "/sigh", minutes: 1 },
      { title: "白天 15 分鐘走路（不戴耳機）", href: "/walk", minutes: 15 },
      { title: "晚上寫下 1 個今天的 win", minutes: 1 },
    ],
    avoid: [
      { title: "把『想著問題』當成『解決問題』" },
      { title: "壓力高時馬上做重大決定" },
    ],
    oneTime: [
      { title: "選一道 Nagoski 壓力出口完成一次", href: "/release", minutes: 5 },
      { title: "做一次自我慈悲練習", href: "/compassion", minutes: 3 },
    ],
  },
  body: {
    theme: "身體訊號修復",
    doDaily: [
      { title: "肩 / 頸 / 髖 各伸展 30 秒", minutes: 3 },
      { title: "每小時起身走 1 分鐘", minutes: 1 },
      { title: "每杯飲料前先喝 100ml 水", minutes: 0 },
    ],
    avoid: [
      { title: "連續 2 小時不離開座位" },
      { title: "把疲勞當成『撐一下就好』" },
    ],
    oneTime: [
      { title: "本週至少 1 次戶外 30 分鐘", href: "/walk", minutes: 30 },
    ],
  },
  food: {
    theme: "飲食穩定度",
    doDaily: [
      { title: "起床 1 小時內吃蛋白質", minutes: 5 },
      { title: "下午想吃甜的，先喝水等 10 分鐘", minutes: 10 },
      { title: "一份不同顏色的蔬菜或水果", minutes: 0 },
    ],
    avoid: [
      { title: "用甜食蓋過壓力（壓力性進食）" },
      { title: "把咖啡當早餐" },
    ],
    oneTime: [
      { title: "紀錄一次甜食出現的時機", minutes: 1 },
    ],
  },
};

function weeklyProtocol(d: AppData): WeeklyProtocol {
  const assessment = d.assessments[0];
  const axisFocus =
    (assessment ? topAxes(assessment)[0]?.axis : undefined) as
      | "sleep"
      | "tech"
      | "stress"
      | "body"
      | "food"
      | undefined;
  const weekNumber = d.plan.startedAt ? d.plan.currentWeek : 1;

  if (!axisFocus) {
    return {
      weekNumber,
      theme: "先觀察一週",
      doDaily: [
        { title: "每天打卡（快速模式 10 秒）", href: "/daily", minutes: 1 },
        { title: "做一次 60 秒生理嘆息", href: "/sigh", minutes: 1 },
      ],
      avoid: [{ title: "強迫自己改太多" }],
      oneTime: [
        { title: "做一次大腦疲勞檢測", href: "/assessment", minutes: 2 },
      ],
    };
  }

  return {
    weekNumber,
    axisFocus,
    ...AXIS_PROTOCOL[axisFocus],
  };
}

function buildProfile(d: AppData): ProfileSnapshot {
  const a = d.assessments[0];
  const days = a
    ? Math.floor((Date.now() - new Date(a.date).getTime()) / 86_400_000)
    : undefined;
  const RECHECK_DAYS = 28;
  return {
    hasAssessment: !!a,
    assessmentDate: a?.date,
    daysSinceAssessment: days,
    hasChronotype: !!d.chronotype,
    chronotypeName: d.chronotype
      ? CHRONOTYPE_PROFILE[d.chronotype.type].name
      : undefined,
    hasGoal: !!d.settings.goal,
    goal: d.settings.goal,
    timeBudget: d.settings.timeBudgetMin ?? 15,
    needsRecheck: days !== undefined && days >= RECHECK_DAYS,
    daysUntilRecheck: days !== undefined ? RECHECK_DAYS - days : undefined,
  };
}

function buildTodayDoses(d: AppData, now: Date): TodayDose[] {
  const ctx = coach(d, now);
  const all = [ctx.primary, ...ctx.supporting];
  return all.slice(0, 3).map((a) => ({
    title: a.title,
    reason: a.reason,
    href: a.href,
    minutes: parseDuration(a.duration),
    badge: a.badge,
  }));
}

function parseDuration(d?: string): number {
  if (!d) return 3;
  const m = d.match(/(\d+)\s*分/);
  if (m) return parseInt(m[1], 10);
  const s = d.match(/(\d+)\s*秒/);
  if (s) return Math.max(1, Math.round(parseInt(s[1], 10) / 60));
  return 3;
}

function buildSummary(d: AppData, p: ProfileSnapshot): string {
  if (!p.hasAssessment) return "先完成一次大腦疲勞檢測，就能給你個人化處方。";
  const name = d.settings.name ? `${d.settings.name}，` : "";
  const debt = netDebt(debtSeries(d.daily, d.settings.sleepTargetHours ?? 8, 14));
  const latest = d.daily[0];
  const parts: string[] = [];
  if (debt >= 5) parts.push(`睡眠債 ${debt.toFixed(0)} 小時`);
  if (latest && latest.stress >= 7) parts.push("壓力偏高");
  if (parts.length === 0)
    return `${name}最近狀態穩定。維持本週協議就好。`;
  return `${name}最近觀察到：${parts.join("、")}。依此調整今日劑量。`;
}

export function prescription(d: AppData, now: Date = new Date()): Prescription {
  const profile = buildProfile(d);
  return {
    profile,
    weekProtocol: weeklyProtocol(d),
    todayDoses: buildTodayDoses(d, now),
    stateSummary: buildSummary(d, profile),
  };
}

export function axisLabelOf(
  a?: "sleep" | "tech" | "stress" | "body" | "food"
): string | undefined {
  if (!a) return undefined;
  return AXIS_LABEL[a]?.name;
}
