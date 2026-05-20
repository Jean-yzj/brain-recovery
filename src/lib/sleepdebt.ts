import { DailyLog } from "./types";

export interface DebtPoint {
  date: string;
  hours: number | null;
  diff: number | null;
}

export function debtSeries(
  daily: DailyLog[],
  targetHours: number,
  days = 14
): DebtPoint[] {
  const points: DebtPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const log = daily.find((x) => x.date === iso);
    const hours = log?.sleepHours ?? null;
    const diff = hours === null ? null : hours - targetHours;
    points.push({ date: iso, hours, diff });
  }
  return points;
}

export function totalDebt(series: DebtPoint[]): number {
  return series.reduce((acc, p) => {
    if (p.diff === null) return acc;
    if (p.diff < 0) return acc + Math.abs(p.diff);
    return acc;
  }, 0);
}

export function totalSurplus(series: DebtPoint[]): number {
  return series.reduce((acc, p) => {
    if (p.diff === null) return acc;
    if (p.diff > 0) return acc + p.diff;
    return acc;
  }, 0);
}

export function netDebt(series: DebtPoint[]): number {
  return totalDebt(series) - totalSurplus(series);
}

export function debtLevel(net: number): {
  label: string;
  tone: "ok" | "watch" | "bad" | "burnout";
  msg: string;
} {
  if (net <= 1)
    return {
      label: "睡眠平衡",
      tone: "ok",
      msg: "你目前的睡眠帳戶是平的或有結餘。維持就好。",
    };
  if (net <= 5)
    return {
      label: "輕微負債",
      tone: "watch",
      msg: "累積了一些債。這週試著有 1–2 天比目標多睡 30 分鐘，就能補回來。",
    };
  if (net <= 12)
    return {
      label: "明顯負債",
      tone: "bad",
      msg: "你的注意力、情緒控制、免疫都會被影響。週末可以多睡 1 小時，但別超過 90 分鐘，否則節奏會亂。",
    };
  return {
    label: "嚴重睡眠債",
    tone: "burnout",
    msg: "研究上，超過 10 小時的累積債等於酒駕程度的注意力下降。請至少連續 3 天回到 7–8 小時，不能用一次補眠解決。",
  };
}
