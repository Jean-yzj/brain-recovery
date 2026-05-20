export interface Quest {
  id: string;
  title: string;
  detail: string;
  category: "sleep" | "tech" | "body" | "mind" | "social" | "food";
  timeMin: number;
}

export const QUESTS: Quest[] = [
  // sleep
  { id: "q-s1", title: "今晚提早 30 分鐘上床", detail: "不用早睡，只是早一點躺。", category: "sleep", timeMin: 30 },
  { id: "q-s2", title: "明天用同一時間起床", detail: "週末也算。固定起床比早睡有用。", category: "sleep", timeMin: 0 },
  { id: "q-s3", title: "睡前把手機放房間外", detail: "鬧鐘用其他設備或舊手機。", category: "sleep", timeMin: 1 },
  { id: "q-s4", title: "下午 2 點後不喝咖啡因", detail: "讓晚上的腺苷可以正常累積。", category: "sleep", timeMin: 0 },

  // tech
  { id: "q-t1", title: "工作 60 分鐘只開一個分頁", detail: "瀏覽器只開一個，其他全關。", category: "tech", timeMin: 60 },
  { id: "q-t2", title: "關掉 3 個 App 的通知", detail: "選你最常被打斷的那幾個。", category: "tech", timeMin: 5 },
  { id: "q-t3", title: "今天只查 2 次 email", detail: "中午一次、傍晚一次。其他時間不開信箱。", category: "tech", timeMin: 0 },
  { id: "q-t4", title: "起床第一個小時不滑社群", detail: "把這段時間還給自己。", category: "tech", timeMin: 60 },
  { id: "q-t5", title: "手機螢幕改成黑白", detail: "iOS 的『色彩濾鏡 → 灰階』，Android 的『單色』。多巴胺會掉一截。", category: "tech", timeMin: 3 },

  // body
  { id: "q-b1", title: "走路 15 分鐘", detail: "通勤、午餐後皆可。能曬太陽更好。", category: "body", timeMin: 15 },
  { id: "q-b2", title: "肩、頸、髖伸展各 30 秒", detail: "3 個區域是身體最緊繃的地方。", category: "body", timeMin: 3 },
  { id: "q-b3", title: "原地跳 30 秒", detail: "心跳上去，整個人會清醒一截。", category: "body", timeMin: 1 },
  { id: "q-b4", title: "早上 10 分鐘曬太陽", detail: "陰天也算。哪怕只是開窗。", category: "body", timeMin: 10 },

  // mind
  { id: "q-m1", title: "做一次 3 分鐘呼吸空間", detail: "Brain Pause 裡的 MBSR 練習。", category: "mind", timeMin: 3 },
  { id: "q-m2", title: "寫下今天最吵的 3 個念頭", detail: "用紙筆，不要打字。", category: "mind", timeMin: 5 },
  { id: "q-m3", title: "把一件糾結的事先放著", detail: "對自己說：『我今天不適合決定這件事』。", category: "mind", timeMin: 1 },
  { id: "q-m4", title: "做一次 5-4-3-2-1 接地", detail: "感官拉回現在。", category: "mind", timeMin: 2 },

  // social
  { id: "q-soc1", title: "傳訊息給一個你想念的人", detail: "不為了什麼，只是讓對方知道你想到他。", category: "social", timeMin: 2 },
  { id: "q-soc2", title: "和家人/同事真的對話 5 分鐘", detail: "放下手機，眼睛看著對方。", category: "social", timeMin: 5 },
  { id: "q-soc3", title: "對 3 個陌生人微笑或道謝", detail: "便利商店、電梯、路人都算。", category: "social", timeMin: 1 },

  // food
  { id: "q-f1", title: "早餐有蛋白質", detail: "蛋、豆漿、無糖優格、堅果。穩住整天血糖。", category: "food", timeMin: 5 },
  { id: "q-f2", title: "下午想吃甜的，先喝水等 10 分鐘", detail: "通常是壓力，不是肚子餓。", category: "food", timeMin: 10 },
  { id: "q-f3", title: "今天吃 1 份蔬菜或水果", detail: "顏色越多越好。", category: "food", timeMin: 0 },
  { id: "q-f4", title: "每小時喝 1 口水", detail: "脫水也會讓大腦覺得累。", category: "food", timeMin: 0 },
];

export function pickDailyQuest(seed: string): Quest {
  // deterministic per-date pick
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) & 0x7fffffff;
  }
  return QUESTS[h % QUESTS.length];
}

export function pickRandomQuest(excludeId?: string): Quest {
  const pool = excludeId ? QUESTS.filter((q) => q.id !== excludeId) : QUESTS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export const CATEGORY_LABEL: Record<Quest["category"], string> = {
  sleep: "睡眠",
  tech: "科技",
  body: "身體",
  mind: "心智",
  social: "社交",
  food: "飲食",
};
