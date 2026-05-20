export interface DetoxChallenge {
  id: string;
  title: string;
  days: number;
  intro: string;
  rules: string[];
  book: string;
}

export const CHALLENGES: DetoxChallenge[] = [
  {
    id: "morning-7",
    title: "7 天無手機晨間",
    days: 7,
    intro:
      "起床後 30 分鐘不滑手機。讓大腦在最敏感的時段不被劫持。",
    rules: [
      "起床後 30 分鐘內不滑手機",
      "鬧鐘不要放床邊",
      "起床第一件事是水 / 光 / 動",
      "睡前把手機放房間外",
    ],
    book: "Catherine Price《How to Break Up with Your Phone》",
  },
  {
    id: "evening-14",
    title: "14 天無社群晚間",
    days: 14,
    intro:
      "晚上 9 點之後不開社群 App。把『被動接收』的時段還給自己。",
    rules: [
      "晚上 21:00 之後不開 IG/FB/X/TikTok",
      "睡前不看影片串流超過 30 分鐘",
      "通知關掉（除了真實的人）",
      "把社群 App 移到資料夾第二頁",
    ],
    book: "Cal Newport《Digital Minimalism》",
  },
  {
    id: "declutter-30",
    title: "30 天深度數位整理",
    days: 30,
    intro:
      "30 天暫停所有『非必要』的數位活動，重新評估哪些值得留下。這是 Newport 提出的核心練習。",
    rules: [
      "暫停所有娛樂性 App（社群、新聞、短影音）",
      "每天只查 2 次 email / 通訊軟體",
      "手機螢幕設黑白",
      "找一個離線興趣（散步、閱讀、烹飪）",
      "30 天後再決定哪些 App 真的有價值再裝回",
    ],
    book: "Cal Newport《Digital Minimalism》",
  },
];

export function detoxProgress(state: {
  startedAt: string;
  totalDays: number;
  completedDays: string[];
}): { dayIndex: number; done: number; ratio: number; isDoneToday: boolean } {
  const start = new Date(state.startedAt);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayIndex = Math.floor(
    (today.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
  );
  const todayIso = today.toISOString().slice(0, 10);
  return {
    dayIndex: Math.max(0, dayIndex),
    done: state.completedDays.length,
    ratio: Math.min(1, state.completedDays.length / state.totalDays),
    isDoneToday: state.completedDays.includes(todayIso),
  };
}
