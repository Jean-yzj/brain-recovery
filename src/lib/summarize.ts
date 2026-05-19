import { AppData } from "./types";
import { avg, topStressSources, trend } from "./insights";

export function summarizeForAI(data: AppData) {
  const last7 = data.daily.slice(0, 7);
  const last14 = data.daily.slice(0, 14);
  const assessment = data.assessments[0];

  const energy7 = avg(last7.map((d) => d.energy));
  const stress7 = avg(last7.map((d) => d.stress));
  const sleep7 = avg(last7.map((d) => d.sleepQuality));
  const focus7 = avg(last7.map((d) => d.focus));
  const phone7 = avg(last7.map((d) => d.phoneFatigue));

  const stressTop = topStressSources(data.daily, 14).slice(0, 5);

  const symptomCount = new Map<string, number>();
  last14.forEach((d) =>
    d.symptoms.forEach((s) => symptomCount.set(s, (symptomCount.get(s) ?? 0) + 1))
  );

  const copingCount = new Map<string, number>();
  last14.forEach((d) =>
    d.copingHabits.forEach((c) => copingCount.set(c, (copingCount.get(c) ?? 0) + 1))
  );

  return {
    days_logged_last7: last7.length,
    days_logged_last14: last14.length,
    averages_last7: {
      energy: energy7,
      stress: stress7,
      sleep_quality: sleep7,
      focus: focus7,
      phone_fatigue: phone7,
    },
    trend_last7: {
      energy: trend(data.daily, "energy"),
      stress: trend(data.daily, "stress"),
      sleep_quality: trend(data.daily, "sleepQuality"),
      focus: trend(data.daily, "focus"),
      phone_fatigue: trend(data.daily, "phoneFatigue"),
    },
    top_stress_sources: stressTop,
    top_symptoms: [...symptomCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([s, n]) => ({ symptom: s, count: n })),
    top_coping: [...copingCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([s, n]) => ({ habit: s, count: n })),
    latest_assessment: assessment
      ? { score: assessment.score, level: assessment.level, axes: assessment.axes }
      : null,
    plan_status: {
      current_week: data.plan.currentWeek,
      started_at: data.plan.startedAt,
      completed_this_week: (data.plan.completedTasks[String(data.plan.currentWeek)] ?? [])
        .length,
    },
    pause_count_last7: data.pauses.filter((p) => {
      const d = new Date(p.date);
      const ago = new Date();
      ago.setDate(ago.getDate() - 7);
      return d >= ago;
    }).length,
    notes_recent: last7
      .filter((d) => d.note && d.note.trim())
      .map((d) => ({ date: d.date, note: d.note }))
      .slice(0, 5),
  };
}

export function fallbackReport(data: AppData): string {
  const s = summarizeForAI(data);
  const lines: string[] = [];
  lines.push("# 本週大腦疲勞報告");
  lines.push("");
  lines.push(`你這週打卡了 **${s.days_logged_last7} 天**。`);
  lines.push("");
  lines.push("## 平均狀態");
  lines.push(`- 精神：${s.averages_last7.energy}`);
  lines.push(`- 壓力：${s.averages_last7.stress}`);
  lines.push(`- 睡眠品質：${s.averages_last7.sleep_quality}`);
  lines.push(`- 專注：${s.averages_last7.focus}`);
  lines.push(`- 手機疲倦：${s.averages_last7.phone_fatigue}`);
  lines.push("");
  if (s.top_stress_sources.length) {
    lines.push("## 主要壓力來源");
    s.top_stress_sources.forEach((x) =>
      lines.push(`- ${x.source}（${x.count} 次）`)
    );
    lines.push("");
  }
  if (s.top_symptoms.length) {
    lines.push("## 身體警訊");
    s.top_symptoms.forEach((x) => lines.push(`- ${x.symptom}（${x.count} 次）`));
    lines.push("");
  }
  lines.push("## 下一步建議");
  if (s.averages_last7.sleep_quality < 5) {
    lines.push("- 你的睡眠品質偏低。本週試試固定起床時間 + 睡前 30 分鐘不滑手機。");
  }
  if (s.averages_last7.phone_fatigue > 6) {
    lines.push("- 手機疲倦明顯。從關掉非必要通知 + 工作時只開一個視窗開始。");
  }
  if (s.averages_last7.stress > 6) {
    lines.push("- 壓力分數偏高。每天執行一次 Brain Pause，從 90 秒呼吸開始。");
  }
  if (lines[lines.length - 1] === "## 下一步建議") {
    lines.push("- 整體狀態還算穩定。維持目前的微習慣，繼續打卡 7 天。");
  }
  lines.push("");
  lines.push("> 想要更深入的整理？請到設定頁加入你的 Anthropic API Key。");
  return lines.join("\n");
}
