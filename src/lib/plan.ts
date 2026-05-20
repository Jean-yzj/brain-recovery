export interface WeekTask {
  id: string;
  title: string;
  detail: string;
  minutes: number;
}

export interface WeekPlan {
  week: number;
  theme: string;
  intro: string;
  tasks: WeekTask[];
}

export const PLAN: WeekPlan[] = [
  {
    week: 1,
    theme: "找出你的疲勞來源",
    intro: "這一週只做一件事：觀察。不是要改變什麼，先看清楚大腦累在哪裡。",
    tasks: [
      { id: "w1-1", title: "完成大腦疲勞檢測", detail: "了解你的起點，看看主要疲勞軸線在哪。", minutes: 3 },
      { id: "w1-2", title: "連續 3 天每日打卡", detail: "只記錄狀態，不改習慣。", minutes: 1 },
      { id: "w1-3", title: "記下 3 個讓你最累的時刻", detail: "不一定要解決，只要寫下來。", minutes: 2 },
    ],
  },
  {
    week: 2,
    theme: "建立睡眠節奏",
    intro: "睡眠是大腦每天唯一一次完整重啟的機會。先固定起床時間，比強迫早睡有用。",
    tasks: [
      { id: "w2-1", title: "連續 5 天固定起床時間", detail: "誤差 30 分鐘內。週末也算。", minutes: 0 },
      { id: "w2-2", title: "早上 10 分鐘曬太陽或開窗", detail: "幫助褪黑激素節奏歸位。", minutes: 10 },
      { id: "w2-3", title: "下午 2 點後不喝咖啡", detail: "讓晚上的腺苷可以正常累積。", minutes: 0 },
    ],
  },
  {
    week: 3,
    theme: "睡前數位排毒",
    intro: "讓大腦在睡前 30 分鐘真的離線。一開始可能會抗拒，這很正常。",
    tasks: [
      { id: "w3-1", title: "睡前 30 分鐘不滑手機", detail: "把手機放在房間外或視線外。", minutes: 30 },
      { id: "w3-2", title: "改成洗澡 + 簡單伸展", detail: "讓體溫先升再降，幫助入睡。", minutes: 15 },
      { id: "w3-3", title: "關掉非必要 App 通知", detail: "只留人與你的家人。", minutes: 10 },
    ],
  },
  {
    week: 4,
    theme: "每日 3 分鐘大腦暫停",
    intro: "壓力不會在『等一下』消失，要刻意暫停。練習在白天主動關機 3 分鐘。",
    tasks: [
      { id: "w4-1", title: "每天執行一次 Brain Pause", detail: "從呼吸或望遠開始，任選。", minutes: 3 },
      { id: "w4-2", title: "工作 50 分鐘，站起來 3 分鐘", detail: "離開螢幕，看遠方。", minutes: 3 },
      { id: "w4-3", title: "寫下今天讓腦袋最吵的一件事", detail: "用筆寫，不要打字。", minutes: 5 },
    ],
  },
  {
    week: 5,
    theme: "減少甜食與咖啡因依賴",
    intro: "不是戒掉，是學會分辨『真的需要』和『大腦在喊救命』。",
    tasks: [
      { id: "w5-1", title: "咖啡因從每日 2 杯降為 1 杯", detail: "或往前提早飲用時間。", minutes: 0 },
      { id: "w5-2", title: "下午想吃甜食前先喝水", detail: "等 10 分鐘再決定要不要吃。", minutes: 10 },
      { id: "w5-3", title: "記錄甜食出現的時機", detail: "通常會發現是壓力，不是肚子餓。", minutes: 1 },
    ],
  },
  {
    week: 6,
    theme: "穩定飲食與補水",
    intro: "大腦的能量很怕忽高忽低。穩定的小進食，比超完美的健康餐有效。",
    tasks: [
      { id: "w6-1", title: "連續 5 天有早餐", detail: "蛋白質優先。即使只有一顆水煮蛋。", minutes: 5 },
      { id: "w6-2", title: "每天喝水 6 杯以上", detail: "感覺累時先補水。", minutes: 0 },
      { id: "w6-3", title: "每天一份蔬菜或水果", detail: "顏色越多越好。", minutes: 0 },
    ],
  },
  {
    week: 7,
    theme: "日光、散步、低強度活動",
    intro: "不是去健身，是讓身體有節奏。日光和走路是最便宜的抗憂藥。",
    tasks: [
      { id: "w7-1", title: "每天走路 15 分鐘", detail: "通勤或午餐後皆可。", minutes: 15 },
      { id: "w7-2", title: "週末戶外 30 分鐘", detail: "不滑手機，看路上的人和樹。", minutes: 30 },
      { id: "w7-3", title: "每天伸展 5 分鐘", detail: "肩、頸、髖三個區域。", minutes: 5 },
    ],
  },
  {
    week: 8,
    theme: "產出你的大腦修復報告",
    intro: "回顧這 8 週，看看哪些習慣留下來、哪些還在進行中。下一階段你自己決定。",
    tasks: [
      { id: "w8-1", title: "重做一次大腦疲勞檢測", detail: "對照第 1 週的分數。", minutes: 3 },
      { id: "w8-2", title: "讓 AI 產出本週報告", detail: "看 8 週模式整理。", minutes: 1 },
      { id: "w8-3", title: "選 3 個要留下來的習慣", detail: "其他先放下，不要全部背著走。", minutes: 5 },
    ],
  },
];

export function weekTotalTasks(week: number) {
  return PLAN.find((p) => p.week === week)?.tasks.length ?? 0;
}

// 依使用者最弱的 SHIFT 軸，在 week 2–7 加上一個個人化任務
type WeakAxis = "sleep" | "tech" | "stress" | "body" | "food";

const AXIS_BONUS: Record<WeakAxis, WeekTask> = {
  sleep: {
    id: "axis-sleep",
    title: "本週個人化：睡前 10 分鐘關燈儀式",
    detail: "你的弱軸是睡眠。睡前 10 分鐘把主燈關掉，剩一盞暖光。",
    minutes: 10,
  },
  tech: {
    id: "axis-tech",
    title: "本週個人化：每天執行一次數位整理",
    detail: "你的弱軸是科技。挑一個 App 關通知或移到次頁。",
    minutes: 3,
  },
  stress: {
    id: "axis-stress",
    title: "本週個人化：每天 1 次生理嘆息或散步",
    detail: "你的弱軸是壓力。挑一個出口把壓力 loop 合上。",
    minutes: 5,
  },
  body: {
    id: "axis-body",
    title: "本週個人化：每天伸展 5 分鐘",
    detail: "你的弱軸是身體。肩、頸、髖三區各 30 秒以上。",
    minutes: 5,
  },
  food: {
    id: "axis-food",
    title: "本週個人化：每天有早餐 + 1 份蔬菜",
    detail: "你的弱軸是飲食。穩定的能量比超完美飲食更有效。",
    minutes: 5,
  },
};

export function planForUser(weakAxis?: WeakAxis): WeekPlan[] {
  if (!weakAxis) return PLAN;
  return PLAN.map((w) => {
    if (w.week === 1 || w.week === 8) return w;
    return {
      ...w,
      tasks: [...w.tasks, AXIS_BONUS[weakAxis]],
    };
  });
}
