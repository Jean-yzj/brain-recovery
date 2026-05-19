import { AssessmentAnswer, AssessmentResult } from "./types";

export type Axis = "sleep" | "tech" | "stress" | "body" | "food";

export interface AssessmentQuestion {
  id: string;
  text: string;
  axis: Axis;
}

export const QUESTIONS: AssessmentQuestion[] = [
  { id: "q1", text: "早上是不是常常要靠咖啡或茶才覺得有精神？", axis: "food" },
  { id: "q2", text: "常常同時開很多視窗、同時做很多任務？", axis: "tech" },
  { id: "q3", text: "睡了，但起床還是覺得累、沒有恢復感？", axis: "sleep" },
  { id: "q4", text: "明明很累，晚上卻停不下來滑手機？", axis: "tech" },
  { id: "q5", text: "壓力大時特別想吃甜食、油炸或重口味？", axis: "food" },
  { id: "q6", text: "常常覺得腦袋很吵、很難真正放空？", axis: "stress" },
  { id: "q7", text: "肩頸、頭、胃、皮膚常出現不適但找不到明確原因？", axis: "body" },
  { id: "q8", text: "睡前 30 分鐘還在滑手機、看影片、處理訊息？", axis: "sleep" },
  { id: "q9", text: "對訊息、通知、社群動態感到疲倦但又戒不掉？", axis: "tech" },
  { id: "q10", text: "覺得自己一直在「處理事情」，沒有真的休息？", axis: "stress" },
  { id: "q11", text: "情緒容易被小事點燃，事後又後悔？", axis: "stress" },
  { id: "q12", text: "白天容易在午後感到極度疲憊、想睡？", axis: "sleep" },
];

export const ANSWER_LABELS = ["從不", "偶爾", "經常", "幾乎每天"] as const;

export function evaluate(answers: AssessmentAnswer[]): AssessmentResult {
  const axes: Record<Axis, { sum: number; max: number }> = {
    sleep: { sum: 0, max: 0 },
    tech: { sum: 0, max: 0 },
    stress: { sum: 0, max: 0 },
    body: { sum: 0, max: 0 },
    food: { sum: 0, max: 0 },
  };
  QUESTIONS.forEach((q, i) => {
    axes[q.axis].sum += answers[i] ?? 0;
    axes[q.axis].max += 3;
  });
  const total = Object.values(axes).reduce((acc, a) => acc + a.sum, 0);
  const totalMax = Object.values(axes).reduce((acc, a) => acc + a.max, 0);
  const score = Math.round((total / totalMax) * 100);

  let level: AssessmentResult["level"] = "low";
  if (score >= 75) level = "burnout";
  else if (score >= 55) level = "high";
  else if (score >= 30) level = "mid";

  const axisScore = (a: { sum: number; max: number }) =>
    Math.round((a.sum / Math.max(1, a.max)) * 100);

  return {
    date: new Date().toISOString(),
    answers,
    score,
    level,
    axes: {
      sleep: axisScore(axes.sleep),
      tech: axisScore(axes.tech),
      stress: axisScore(axes.stress),
      body: axisScore(axes.body),
      food: axisScore(axes.food),
    },
  };
}

export function levelLabel(level: AssessmentResult["level"]) {
  return {
    low: { title: "輕度忙碌腦", tone: "你的大腦目前還算穩定，但仍有可以微調的地方。" },
    mid: { title: "中度忙碌腦", tone: "你已經在透支腦力，需要開始做一點點修復。" },
    high: { title: "高度忙碌腦", tone: "你的大腦長期過載，需要刻意安排恢復時間。" },
    burnout: { title: "瀕臨耗竭腦", tone: "你不是懶，是大腦真的太累了。請從睡眠和手機開始修復。" },
  }[level];
}

export function topAxes(r: AssessmentResult): { axis: Axis; score: number }[] {
  return (Object.entries(r.axes) as [Axis, number][])
    .map(([axis, score]) => ({ axis, score }))
    .sort((a, b) => b.score - a.score);
}

export const AXIS_LABEL: Record<Axis, { name: string; icon: string; desc: string }> = {
  sleep: { name: "睡眠", icon: "S", desc: "Sleep — 睡眠節奏與恢復" },
  tech: { name: "科技使用", icon: "T", desc: "Technology — 訊息與螢幕暴露" },
  stress: { name: "壓力恢復", icon: "H", desc: "Hormones — 壓力與身體節奏" },
  body: { name: "身體警訊", icon: "I", desc: "Inflammation — 身體不適訊號" },
  food: { name: "飲食與能量", icon: "F", desc: "Food — 飲食穩定度" },
};
