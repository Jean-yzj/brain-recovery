import { DailyLog, PauseSession } from "./types";

export function avg(nums: number[]) {
  if (!nums.length) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

export function lastNDays(daily: DailyLog[], n: number) {
  return daily.slice(0, n);
}

export function trend(daily: DailyLog[], key: keyof DailyLog, n = 7) {
  const recent = lastNDays(daily, n);
  return recent
    .map((d) => (typeof d[key] === "number" ? (d[key] as number) : 0))
    .reverse();
}

export function topStressSources(daily: DailyLog[], n = 7) {
  const counts = new Map<string, number>();
  daily.slice(0, n).forEach((d) =>
    d.stressSources.forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1))
  );
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({ source: k, count: v }));
}

export function streak(daily: DailyLog[]) {
  if (!daily.length) return 0;
  const sorted = [...daily].sort((a, b) => b.date.localeCompare(a.date));
  let streakCount = 0;
  const today = new Date();
  for (let i = 0; i < sorted.length; i++) {
    const ref = new Date(today);
    ref.setDate(today.getDate() - i);
    const refIso = ref.toISOString().slice(0, 10);
    if (sorted[i].date === refIso) streakCount++;
    else break;
  }
  return streakCount;
}

export function pauseCount(pauses: PauseSession[], n = 7) {
  const since = new Date();
  since.setDate(since.getDate() - n);
  return pauses.filter((p) => new Date(p.date) >= since).length;
}

export function brainScoreNow(latest: DailyLog | undefined) {
  if (!latest) return null;
  const stressInv = 11 - latest.stress;
  const phoneInv = 11 - latest.phoneFatigue;
  const total =
    latest.energy + stressInv + latest.sleepQuality + latest.focus + phoneInv;
  return Math.round((total / 50) * 100);
}
