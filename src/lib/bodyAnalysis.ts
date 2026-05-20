import { DailyLog, TriggerLog } from "./types";

// === 症狀 × 條件 關聯分析 ===

export interface SymptomCorrelation {
  symptom: string;
  total: number; // 出現次數
  avgStress: number;
  avgSleep: number;
  avgPhone: number;
  // 對比：所有有打卡的日子的平均（baseline）
  diffStress: number; // (有症狀日的平均壓力) - (整體平均)
  diffSleep: number;
  diffPhone: number;
  topAxis: "sleep" | "stress" | "tech" | null; // 最相關的軸
}

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

export function analyzeSymptoms(daily: DailyLog[], days = 30): SymptomCorrelation[] {
  const recent = daily.slice(0, days);
  if (recent.length < 3) return [];

  const baseStress = avg(recent.map((d) => d.stress));
  const baseSleep = avg(recent.map((d) => d.sleepQuality));
  const basePhone = avg(recent.map((d) => d.phoneFatigue));

  const symptoms = new Set<string>();
  recent.forEach((d) => d.symptoms.forEach((s) => symptoms.add(s)));

  return Array.from(symptoms)
    .map((sym) => {
      const daysWithIt = recent.filter((d) => d.symptoms.includes(sym));
      const avgStress = avg(daysWithIt.map((d) => d.stress));
      const avgSleep = avg(daysWithIt.map((d) => d.sleepQuality));
      const avgPhone = avg(daysWithIt.map((d) => d.phoneFatigue));

      const diffStress = Math.round((avgStress - baseStress) * 10) / 10;
      const diffSleep = Math.round((avgSleep - baseSleep) * 10) / 10;
      const diffPhone = Math.round((avgPhone - basePhone) * 10) / 10;

      // 找最強相關：stress 高、sleep 低（負相關）、phone 高
      const sleepAlignment = -diffSleep; // 睡眠分數低 = 數值大
      const candidates = [
        { axis: "stress" as const, score: diffStress },
        { axis: "sleep" as const, score: sleepAlignment },
        { axis: "tech" as const, score: diffPhone },
      ];
      candidates.sort((a, b) => b.score - a.score);
      const topAxis = candidates[0].score > 0.5 ? candidates[0].axis : null;

      return {
        symptom: sym,
        total: daysWithIt.length,
        avgStress,
        avgSleep,
        avgPhone,
        diffStress,
        diffSleep,
        diffPhone,
        topAxis,
      };
    })
    .sort((a, b) => b.total - a.total);
}

// === 週幾模式 ===

export interface WeekdayPattern {
  weekday: number; // 0 = Sunday
  label: string;
  count: number;
  avgStress: number;
  avgEnergy: number;
  avgSleep: number;
  avgPhone: number;
}

const WEEKDAYS_TC = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

export function weekdayPattern(daily: DailyLog[]): WeekdayPattern[] {
  const buckets: { [k: number]: DailyLog[] } = {};
  daily.forEach((d) => {
    const wd = new Date(d.date).getDay();
    buckets[wd] = buckets[wd] || [];
    buckets[wd].push(d);
  });
  return [0, 1, 2, 3, 4, 5, 6].map((wd) => {
    const list = buckets[wd] || [];
    return {
      weekday: wd,
      label: WEEKDAYS_TC[wd],
      count: list.length,
      avgStress: avg(list.map((d) => d.stress)),
      avgEnergy: avg(list.map((d) => d.energy)),
      avgSleep: avg(list.map((d) => d.sleepQuality)),
      avgPhone: avg(list.map((d) => d.phoneFatigue)),
    };
  });
}

// === 高壓恢復速度 ===

export interface RecoveryAnalysis {
  events: number; // 偵測到的高壓事件數
  avgRecoveryDays: number | null; // 平均幾天恢復到正常
}

export function recoveryAnalysis(daily: DailyLog[]): RecoveryAnalysis {
  // 按時間正序
  const sorted = [...daily].sort((a, b) => a.date.localeCompare(b.date));
  const HIGH = 7; // 壓力 >= 7 視為高壓事件
  const RECOVERED = 5; // 壓力 < 5 視為回復
  const durations: number[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].stress >= HIGH) {
      // 找後面第一個 < RECOVERED 的日子
      for (let j = i + 1; j < Math.min(sorted.length, i + 14); j++) {
        if (sorted[j].stress < RECOVERED) {
          durations.push(j - i);
          i = j; // 跳過這段，避免重複計算
          break;
        }
      }
    }
  }
  return {
    events: durations.length,
    avgRecoveryDays: durations.length ? avg(durations) : null,
  };
}

// === 燃盡警戒指標 ===

export interface BurnoutSignal {
  level: 0 | 1 | 2 | 3 | 4;
  signals: string[];
}

export function burnoutSignal(daily: DailyLog[]): BurnoutSignal {
  const last3 = daily.slice(0, 3);
  if (last3.length < 3) return { level: 0, signals: [] };

  const signals: string[] = [];
  const avgStress = avg(last3.map((d) => d.stress));
  const avgSleep = avg(last3.map((d) => d.sleepQuality));
  const symptomCount = last3.reduce((acc, d) => acc + d.symptoms.length, 0);
  const copingCount = last3.reduce(
    (acc, d) =>
      acc +
      d.copingHabits.filter((c) =>
        ["靠咖啡撐", "吃甜食", "酒精", "暴飲暴食"].includes(c)
      ).length,
    0
  );

  if (avgStress >= 7) signals.push(`連續 3 天壓力 ≥ 7（平均 ${avgStress}）`);
  if (avgSleep <= 4) signals.push(`連續 3 天睡眠品質 ≤ 4`);
  if (symptomCount >= 6) signals.push(`身體警訊 3 天累積 ${symptomCount} 次`);
  if (copingCount >= 4) signals.push(`過度依賴咖啡/糖/酒（${copingCount} 次）`);

  return {
    level: Math.min(4, signals.length) as 0 | 1 | 2 | 3 | 4,
    signals,
  };
}

// === 觸發紀錄統計 ===

export interface TriggerStats {
  total: number;
  resisted: number;
  acted: number;
  resistRate: number; // 0–1
  byType: { type: string; count: number; resisted: number }[];
  byReason: { reason: string; count: number; actedRate: number }[];
}

const URGE_LABEL: Record<TriggerLog["type"], string> = {
  phone: "想拿手機",
  scroll: "想滑社群",
  sugar: "想吃甜的",
  coffee: "想喝咖啡",
  snack: "想吃零食",
  drink: "想喝酒",
  other: "其他",
};

export function triggerStats(triggers: TriggerLog[], days = 30): TriggerStats {
  const since = Date.now() - days * 86_400_000;
  const t = triggers.filter((x) => x.ts >= since);
  const resisted = t.filter((x) => !x.acted).length;
  const acted = t.filter((x) => x.acted).length;
  const total = t.length;

  const typeCounts = new Map<string, { count: number; resisted: number }>();
  t.forEach((x) => {
    const cur = typeCounts.get(x.type) || { count: 0, resisted: 0 };
    cur.count++;
    if (!x.acted) cur.resisted++;
    typeCounts.set(x.type, cur);
  });

  const byType = Array.from(typeCounts.entries())
    .map(([k, v]) => ({
      type: URGE_LABEL[k as TriggerLog["type"]] || k,
      count: v.count,
      resisted: v.resisted,
    }))
    .sort((a, b) => b.count - a.count);

  const reasonCounts = new Map<string, { count: number; acted: number }>();
  t.forEach((x) => {
    if (!x.trigger) return;
    const cur = reasonCounts.get(x.trigger) || { count: 0, acted: 0 };
    cur.count++;
    if (x.acted) cur.acted++;
    reasonCounts.set(x.trigger, cur);
  });

  const byReason = Array.from(reasonCounts.entries())
    .map(([k, v]) => ({
      reason: k,
      count: v.count,
      actedRate: v.count ? Math.round((v.acted / v.count) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    total,
    resisted,
    acted,
    resistRate: total ? Math.round((resisted / total) * 100) / 100 : 0,
    byType,
    byReason,
  };
}

// === 撐過去方式 × 隔日狀態 ===

export interface CopingImpact {
  habit: string;
  count: number;
  nextDayEnergy: number; // 隔天精神
  nextDayStress: number;
  diffEnergy: number; // 對比整體平均
}

export function copingImpact(daily: DailyLog[]): CopingImpact[] {
  const sorted = [...daily].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 5) return [];

  const baseEnergy = avg(sorted.map((d) => d.energy));

  const habitMap = new Map<
    string,
    { energies: number[]; stresses: number[] }
  >();
  for (let i = 0; i < sorted.length - 1; i++) {
    const day = sorted[i];
    const next = sorted[i + 1];
    day.copingHabits.forEach((h) => {
      const cur = habitMap.get(h) || { energies: [], stresses: [] };
      cur.energies.push(next.energy);
      cur.stresses.push(next.stress);
      habitMap.set(h, cur);
    });
  }

  return Array.from(habitMap.entries())
    .map(([habit, v]) => ({
      habit,
      count: v.energies.length,
      nextDayEnergy: avg(v.energies),
      nextDayStress: avg(v.stresses),
      diffEnergy: Math.round((avg(v.energies) - baseEnergy) * 10) / 10,
    }))
    .filter((x) => x.count >= 2)
    .sort((a, b) => b.count - a.count);
}
