import { StressReleaseLog } from "./types";

export interface ReleaseDoor {
  id: StressReleaseLog["door"];
  title: string;
  short: string;
  body: string;
  microActs: string[];
  timeMin: number;
}

// Emily & Amelia Nagoski《Burnout》— Completing the Stress Cycle 的 7 種方式。
export const DOORS: ReleaseDoor[] = [
  {
    id: "movement",
    title: "動一動",
    short: "讓身體完成『逃跑』的動作",
    body: "壓力的本質是『身體準備好對付危險』。如果只是用『想』結束，身體還停在備戰狀態。一場運動／甩手／快走，能把這個 loop 真正合上。",
    microActs: [
      "原地跳 20 下",
      "快走 15 分鐘",
      "用力甩手 1 分鐘",
      "做一組伏地挺身 / 深蹲",
    ],
    timeMin: 15,
  },
  {
    id: "breath",
    title: "深呼吸",
    short: "用吐氣比吸氣長的呼吸，啟動副交感神經",
    body: "慢慢吐氣是迷走神經的開關。吐氣比吸氣長 2 倍，能直接告訴身體：警報解除。",
    microActs: [
      "吸 4 秒、吐 8 秒，重複 5 次",
      "盒式呼吸：吸 4、停 4、吐 4、停 4",
      "嘆氣兩次（生理嘆息法）",
    ],
    timeMin: 3,
  },
  {
    id: "social",
    title: "有正向互動",
    short: "和一個讓你覺得安全的人講一句話",
    body: "不是抱怨。是『被看見』。即使是跟便利商店店員笑一下、跟同事點個頭，也能改變壓力荷爾蒙。",
    microActs: [
      "傳訊息給一個你信任的人",
      "打給家人或朋友 5 分鐘",
      "對店員、計程車司機說『謝謝』",
    ],
    timeMin: 5,
  },
  {
    id: "laughter",
    title: "笑出來",
    short: "不是禮貌笑，是真的笑到肚子在動",
    body: "深層大笑可以放鬆壓力反應。看搞笑短片、跟朋友互相吐槽都算。研究中『回想笑話』也有同樣效果。",
    microActs: [
      "看 1–2 個搞笑短片",
      "回想最近一次笑出聲的事",
      "和朋友交換最近的糗事",
    ],
    timeMin: 5,
  },
  {
    id: "affection",
    title: "擁抱／親密接觸",
    short: "20 秒以上的擁抱，會放催產素",
    body: "和你信任的人或寵物實體接觸，是降低壓力最快的方式之一。寵物 OK，自己用手放在心口也算。",
    microActs: [
      "和家人/伴侶擁抱 20 秒",
      "摸寵物 1 分鐘",
      "雙手交叉放胸口，深呼吸 30 秒（自我擁抱）",
    ],
    timeMin: 2,
  },
  {
    id: "cry",
    title: "哭一場",
    short: "讓眼淚把壓力沖出去",
    body: "情緒性的眼淚跟切洋蔥不一樣，含有壓力荷爾蒙的代謝產物。哭完真的會比較鬆。不是脆弱，是生理。",
    microActs: [
      "看一部你知道會哭的片",
      "聽一首會讓你眼眶熱的歌",
      "寫下『我現在想哭是因為…』",
    ],
    timeMin: 15,
  },
  {
    id: "creative",
    title: "做點有創意的事",
    short: "塗鴉、煮飯、唱歌、彈琴、寫字",
    body: "創意活動讓大腦從『工作模式』切到『遊戲模式』，是壓力 loop 的另一個出口。不用做得好，重點是『做』。",
    microActs: [
      "塗鴉 10 分鐘",
      "煮一道簡單的菜",
      "唱一首歌（哪怕在浴室）",
      "用紙筆隨便寫 10 行",
    ],
    timeMin: 15,
  },
];
