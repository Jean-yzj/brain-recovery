import { CaffeineLog } from "./types";

// 咖啡因半衰期 ≈ 5 小時（個體差異 1.5–9 hr）。Walker, Why We Sleep。
export const HALF_LIFE_MIN = 5 * 60;

export const PRESETS: { label: string; mg: number }[] = [
  { label: "美式 / 黑咖啡（中杯）", mg: 150 },
  { label: "拿鐵（中杯）", mg: 120 },
  { label: "Espresso 一份", mg: 75 },
  { label: "手沖咖啡", mg: 200 },
  { label: "紅茶（一杯）", mg: 50 },
  { label: "綠茶（一杯）", mg: 35 },
  { label: "能量飲料（一罐）", mg: 160 },
  { label: "可樂（一罐）", mg: 35 },
  { label: "黑巧克力（30g）", mg: 25 },
];

export function remainingAt(logs: CaffeineLog[], atTs: number): number {
  return logs.reduce((sum, log) => {
    if (log.ts > atTs) return sum;
    const minsSince = (atTs - log.ts) / 60_000;
    const halves = minsSince / HALF_LIFE_MIN;
    const remaining = log.amountMg * Math.pow(0.5, halves);
    return sum + remaining;
  }, 0);
}

export function todayLogs(logs: CaffeineLog[]): CaffeineLog[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return logs.filter((l) => l.ts >= start.getTime());
}

export function todayTotal(logs: CaffeineLog[]): number {
  return todayLogs(logs).reduce((a, b) => a + b.amountMg, 0);
}

export function sleepImpactAt(logs: CaffeineLog[], bedtimeTs: number): {
  remaining: number;
  level: "ok" | "watch" | "bad";
} {
  const r = remainingAt(logs, bedtimeTs);
  let level: "ok" | "watch" | "bad" = "ok";
  if (r >= 50) level = "bad";
  else if (r >= 20) level = "watch";
  return { remaining: r, level };
}

export function decayCurve(
  logs: CaffeineLog[],
  fromTs: number,
  hours = 12,
  steps = 48
): { t: number; mg: number }[] {
  const pts: { t: number; mg: number }[] = [];
  const stepMs = (hours * 60 * 60_000) / steps;
  for (let i = 0; i <= steps; i++) {
    const t = fromTs + i * stepMs;
    pts.push({ t, mg: remainingAt(logs, t) });
  }
  return pts;
}
