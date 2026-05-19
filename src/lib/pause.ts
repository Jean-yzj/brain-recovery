export interface PauseTask {
  id: string;
  title: string;
  short: string;
  steps: string[];
  durationSec: number;
  mode: "breath" | "body" | "write" | "view" | "sound" | "rule" | "ground" | "mbsr";
}

export const PAUSE_TASKS: PauseTask[] = [
  {
    id: "breath-90",
    title: "90 秒呼吸",
    short: "盒式呼吸：吸 4，停 4，吐 4，停 4。",
    steps: [
      "找一個可以坐穩的位置",
      "鼻子吸氣 4 秒，肚子慢慢鼓起",
      "屏住氣 4 秒，肩膀放下",
      "嘴巴吐氣 4 秒，吐久一點",
      "停 4 秒，重複到時間結束",
    ],
    durationSec: 90,
    mode: "breath",
  },
  {
    id: "neck-3min",
    title: "3 分鐘肩頸放鬆",
    short: "頭往左、右、前、後各停 15 秒，繞肩 10 次。",
    steps: [
      "頭慢慢往左倒，停 15 秒",
      "頭慢慢往右倒，停 15 秒",
      "頭低下看胸口，停 20 秒",
      "肩膀往後繞 10 次，再往前繞 10 次",
      "雙手交握，往上推，停 15 秒",
    ],
    durationSec: 180,
    mode: "body",
  },
  {
    id: "noisy-3",
    title: "寫下最吵的 3 件事",
    short: "不是要解決，只是讓它離開腦袋。",
    steps: [
      "拿出紙或備忘錄",
      "寫下現在腦袋裡最吵的 3 件事",
      "每件事旁邊寫『現在可以做』或『今天不處理』",
      "把『今天不處理』的那些先合起來",
    ],
    durationSec: 120,
    mode: "write",
  },
  {
    id: "far-view",
    title: "看遠方 1 分鐘",
    short: "讓眼睛跟大腦一起鬆開焦距。",
    steps: [
      "走到窗邊或門口",
      "看一個 6 公尺以上的物件",
      "讓視線停在它上面，不用想事情",
      "感覺眼睛周圍肌肉慢慢放鬆",
    ],
    durationSec: 60,
    mode: "view",
  },
  {
    id: "white-noise",
    title: "閉眼聽白噪音 2 分鐘",
    short: "讓聽覺取代視覺主導腦袋。",
    steps: [
      "戴上耳機或關掉雜音",
      "閉上眼睛",
      "用手機放白噪音、雨聲、海聲皆可",
      "什麼都不做，聽到時間結束",
    ],
    durationSec: 120,
    mode: "sound",
  },
  {
    id: "no-decision",
    title: "暫不下決定",
    short: "現在的判斷力不適合做重大決定。",
    steps: [
      "辨識你正在糾結的那件事",
      "對自己說：『我現在的大腦狀態不適合決定這件事』",
      "把它寫下來，標記『明早再看』",
      "離開螢幕 5 分鐘",
    ],
    durationSec: 60,
    mode: "rule",
  },
  {
    id: "grounding",
    title: "5-4-3-2-1 接地",
    short: "焦慮高時把感官拉回現在這個空間。",
    steps: [
      "看 5 個你現在看得到的東西",
      "感覺 4 個你身體碰得到的東西（椅子、衣服、地板）",
      "聽 3 個你聽得到的聲音",
      "聞 2 個味道（或想 2 個你喜歡的味道）",
      "嚐 1 個味道（喝水也算）",
    ],
    durationSec: 90,
    mode: "ground",
  },
  {
    id: "mbsr-3min",
    title: "3 分鐘呼吸空間",
    short: "MBSR 經典練習。覺察 → 呼吸 → 擴展。",
    steps: [
      "前 1 分鐘：問自己『我現在身上有什麼？』 感受、念頭、身體",
      "中間 1 分鐘：把注意力收回呼吸上，只覺察一吸一吐",
      "後 1 分鐘：把覺察擴展到整個身體與當下的空間",
    ],
    durationSec: 180,
    mode: "mbsr",
  },
];

export function pickRandomTask(): PauseTask {
  return PAUSE_TASKS[Math.floor(Math.random() * PAUSE_TASKS.length)];
}
