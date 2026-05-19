import { Chronotype } from "./types";

export interface CTQuestion {
  id: string;
  text: string;
  options: { label: string; weights: Partial<Record<Chronotype, number>> }[];
}

export const CT_QUESTIONS: CTQuestion[] = [
  {
    id: "wake",
    text: "完全沒有鬧鐘的情況下，你會自然醒在幾點？",
    options: [
      { label: "5:30–6:30，超早", weights: { lion: 2 } },
      { label: "6:30–7:30，早", weights: { lion: 1, bear: 1 } },
      { label: "7:30–9:00，剛好", weights: { bear: 2 } },
      { label: "9:00–10:30，晚", weights: { wolf: 2 } },
      { label: "怎麼睡都覺得沒睡飽", weights: { dolphin: 2 } },
    ],
  },
  {
    id: "peak",
    text: "你一天裡腦袋最清楚的時段是？",
    options: [
      { label: "清晨剛醒沒多久", weights: { lion: 2 } },
      { label: "上午 9–11 點", weights: { bear: 2, lion: 1 } },
      { label: "下午 2–5 點", weights: { wolf: 1, bear: 1 } },
      { label: "晚上 7–10 點", weights: { wolf: 2 } },
      { label: "從沒覺得真的清楚過", weights: { dolphin: 2 } },
    ],
  },
  {
    id: "sleep",
    text: "你的睡眠通常是？",
    options: [
      { label: "很容易入睡、很沉、很穩", weights: { lion: 1, bear: 2 } },
      { label: "睡得還行，但中間會醒", weights: { lion: 1 } },
      { label: "很難入睡、淺眠、容易被吵醒", weights: { dolphin: 2 } },
      { label: "晚睡晚起，半夜很有精神", weights: { wolf: 2 } },
    ],
  },
  {
    id: "morning",
    text: "早上的狀態？",
    options: [
      { label: "起來就完整、馬上可以幹活", weights: { lion: 2 } },
      { label: "需要 20–30 分鐘暖機", weights: { bear: 2 } },
      { label: "前 2 小時像殭屍", weights: { wolf: 2 } },
      { label: "起床後仍然累，整天都不太對", weights: { dolphin: 2 } },
    ],
  },
  {
    id: "social",
    text: "你的個性比較偏？",
    options: [
      { label: "外向、有領導感", weights: { lion: 2 } },
      { label: "親和、隨和、團體型", weights: { bear: 2 } },
      { label: "創意、夜貓、需要獨處充電", weights: { wolf: 2 } },
      { label: "敏感、容易焦慮、想很多", weights: { dolphin: 2 } },
    ],
  },
  {
    id: "nap",
    text: "下午想睡覺的程度？",
    options: [
      { label: "幾乎不會想睡", weights: { lion: 1 } },
      { label: "1–3 點之間有點昏沉", weights: { bear: 2 } },
      { label: "下午都很想睡，但晚上又精神", weights: { wolf: 2 } },
      { label: "整天都想睡，但躺下又睡不著", weights: { dolphin: 2 } },
    ],
  },
];

export function evaluateChronotype(
  picks: number[]
): { type: Chronotype; scores: Record<Chronotype, number> } {
  const scores: Record<Chronotype, number> = {
    lion: 0,
    bear: 0,
    wolf: 0,
    dolphin: 0,
  };
  CT_QUESTIONS.forEach((q, i) => {
    const opt = q.options[picks[i]];
    if (!opt) return;
    (Object.entries(opt.weights) as [Chronotype, number][]).forEach(([k, v]) => {
      scores[k] += v;
    });
  });
  const sorted = (Object.entries(scores) as [Chronotype, number][]).sort(
    (a, b) => b[1] - a[1]
  );
  return { type: sorted[0][0], scores };
}

export const CHRONOTYPE_PROFILE: Record<
  Chronotype,
  {
    name: string;
    pct: string;
    summary: string;
    wakeWindow: string;
    sleepWindow: string;
    deepWork: string;
    caffeineCutoff: string;
    workout: string;
    notes: string[];
  }
> = {
  lion: {
    name: "獅子型",
    pct: "約 15% 的人",
    summary:
      "你天生是早晨型。日出前就清醒，下午能量會下滑很快。早上是你的黃金時段。",
    wakeWindow: "05:30 – 06:30",
    sleepWindow: "22:00 – 23:00",
    deepWork: "06:00 – 11:00（早上鎖住最重要的工作）",
    caffeineCutoff: "中午 12:00 之前",
    workout: "下午 5–6 點，幫助過渡到晚上",
    notes: [
      "晚上不要硬撐做重要決定，腦袋已經下班。",
      "週末也不要過度補眠，會讓週一更累。",
      "下午 3 點容易撞牆，可以安排一個 15 分鐘走路或閉眼。",
    ],
  },
  bear: {
    name: "熊型",
    pct: "約 55% 的人（最多）",
    summary:
      "你跟著太陽走。早上需要 30 分鐘暖機，上午 9–11 點是高峰，下午有一個明顯的低點。",
    wakeWindow: "07:00 – 08:00",
    sleepWindow: "22:30 – 23:30",
    deepWork: "10:00 – 14:00",
    caffeineCutoff: "下午 14:00 之前",
    workout: "早晨 7–8 點 或 下午 6 點",
    notes: [
      "下午 2–4 點是普遍的『熊低谷』，不要排重要會議。",
      "睡眠需求最大（7–9 小時），週末別熬夜超過 1 小時。",
      "中午前曬一次太陽，會讓下午低谷沒那麼深。",
    ],
  },
  wolf: {
    name: "狼型",
    pct: "約 15% 的人",
    summary:
      "你是夜型。早上前 2 小時很慢、下午開始開機、晚上 10 點到午夜是創造力高峰。社會時間表跟你不太合，所以你常常覺得累。",
    wakeWindow: "07:30 – 09:00",
    sleepWindow: "00:00 – 01:00",
    deepWork: "13:00 – 18:00 與 21:00 – 23:00",
    caffeineCutoff: "下午 15:00 之前（你比較容易低估咖啡因影響）",
    workout: "傍晚 6–8 點，幫助提早疲倦感",
    notes: [
      "早上不要排創意工作，安排例行性事務就好。",
      "晚上 11 點之後不要再開新工作，否則大腦就停不下來。",
      "週末『稍微』晚睡 OK，但起床時間不要差超過 1 小時。",
    ],
  },
  dolphin: {
    name: "海豚型",
    pct: "約 10% 的人",
    summary:
      "你睡得淺、容易焦慮、常常覺得沒睡飽。腦袋很愛轉。對你最重要的是：規律、降低刺激、學會與焦慮共處。",
    wakeWindow: "06:30 – 07:30（固定起床比睡夠重要）",
    sleepWindow: "23:30 – 00:30",
    deepWork: "10:00 – 12:00 與 16:00 – 18:00",
    caffeineCutoff: "中午 12:00 之前（且建議不要超過 1 杯）",
    workout: "早晨輕度運動，幫助晚上更累",
    notes: [
      "你最不適合躺床上『努力睡』。睡不著就起來做無聊的事 20 分鐘。",
      "睡前一定要做 wind-down，不能直接從工作切到床上。",
      "白天小睡會破壞晚上睡眠，盡量不要。",
      "焦慮高時，5-4-3-2-1 接地練習對你最有效。",
    ],
  },
};

export function chronotypeIcon(t: Chronotype): string {
  return { lion: "獅", bear: "熊", wolf: "狼", dolphin: "豚" }[t];
}
