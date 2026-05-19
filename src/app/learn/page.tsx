import Link from "next/link";

const SECTIONS = [
  {
    letter: "S",
    title: "Sleep · 睡眠",
    body: "大腦每天唯一一次完整重啟的機會。固定起床時間比強迫早睡更有效。睡前 30 分鐘把光線壓低、把手機放遠，可以讓褪黑激素更穩。",
    micro: [
      "起床第一件事打開窗簾 / 走到光下",
      "下午 2 點之後不喝咖啡",
      "睡前 30 分鐘把手機放在房間外",
    ],
  },
  {
    letter: "H",
    title: "Hormones · 激素節奏",
    body: "壓力荷爾蒙皮質醇有自己的節奏，早上高、夜晚低。長期過度刺激（資訊轟炸、跨時區、太晚睡），會讓節奏錯位，於是你『該醒的時候醒不了、該睡的時候睡不著』。",
    micro: [
      "早上 10 分鐘曬太陽（哪怕是陰天）",
      "中午前完成最重要的決策",
      "傍晚不開強光、不看激烈內容",
    ],
  },
  {
    letter: "I",
    title: "Inflammation · 發炎與身體訊號",
    body: "頭痛、胃不適、肩頸痛、皮膚問題，常常是身體在說『我太忙了』。這不是要你害怕症狀，而是把它當作儀表板的指示燈：哪裡亮了，慢一點。",
    micro: [
      "每出現一次身體警訊，停下來深呼吸 30 秒",
      "把症狀和當天的睡眠/壓力一起記下來",
      "嚴重或持續的症狀請找醫生，不要自己診斷",
    ],
  },
  {
    letter: "F",
    title: "Food · 飲食與大腦能量",
    body: "大腦最怕能量忽高忽低。穩定的小進食（蛋白質 + 蔬菜 + 水）比超完美的健康餐更有效。下午突然想吃甜的，多半不是肚子餓，是壓力。",
    micro: [
      "起床 1 小時內吃一點蛋白質",
      "下午想吃甜食前，先喝水等 10 分鐘",
      "每天加一份蔬菜或水果，顏色越多越好",
    ],
  },
  {
    letter: "T",
    title: "Technology · 科技使用",
    body: "現代大腦最大的挑戰：永不關機的訊息與通知。不是要你戒手機，是要把『被動接收』換成『主動使用』。同時只開一個視窗、固定查信時間，已經能讓大腦輕很多。",
    micro: [
      "工作時只開一個分頁",
      "關掉非必要 App 通知",
      "睡前 30 分鐘不滑手機，改成洗澡或伸展",
    ],
  },
];

export default function LearnPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500">SHIFT 五個方向</div>
        <h1 className="text-2xl font-semibold tracking-tight">了解你的大腦累在哪</h1>
        <p className="text-sm text-ink-500 mt-2 leading-relaxed">
          不是要你學一套新的健康理論，而是把 5 個你大概都聽過的方向，整理成 1–3 個可以馬上做的微習慣。
        </p>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((s) => (
          <div key={s.letter} className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-calm-100 dark:bg-calm-900/40 text-calm-700 dark:text-calm-200 flex items-center justify-center text-lg font-bold">
                {s.letter}
              </div>
              <h2 className="text-lg font-semibold">{s.title}</h2>
            </div>
            <p className="text-sm text-ink-700 dark:text-ink-200 leading-relaxed">
              {s.body}
            </p>
            <div className="text-xs text-ink-500 mt-3 mb-1.5">3 個微習慣</div>
            <ul className="space-y-1 text-sm">
              {s.micro.map((m, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-calm-500">·</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="card bg-gradient-to-br from-calm-50 to-calm-100 dark:from-calm-900/30 dark:to-calm-900/10">
        <div className="text-sm font-medium mb-1">想開始實作？</div>
        <p className="text-xs text-ink-500 mb-3">
          8 週重啟計畫會把這些微習慣安排成一週做一點。第一週只是觀察，不需要改變生活方式。
        </p>
        <Link href="/plan" className="btn-primary">
          看 8 週計畫
        </Link>
      </div>
    </div>
  );
}
