export interface DefusionTechnique {
  id: string;
  title: string;
  intro: string;
  apply: (thought: string) => string;
  hint: string;
}

const cleanup = (t: string) => t.trim().replace(/[。！？.!?]+$/, "");

export const TECHNIQUES: DefusionTechnique[] = [
  {
    id: "having-thought",
    title: "「我正在想著…」",
    intro: "把思緒從『事實』降階為『一個念頭』。",
    apply: (t) => `我正在想著「${cleanup(t)}」這個念頭。`,
    hint: "默念這句話 3 次，注意身體的緊繃有沒有變化。",
  },
  {
    id: "noticing",
    title: "「我注意到我的心智在說…」",
    intro: "把『我』和『念頭』分開。你不是你的念頭。",
    apply: (t) => `我注意到，我的心智正在告訴我「${cleanup(t)}」。`,
    hint: "這句話讓你變成觀察者，而不是被念頭推著走的人。",
  },
  {
    id: "thanks-mind",
    title: "謝謝我的大腦",
    intro: "大腦很努力在保護你。即使它的提醒方式很煩，先謝謝它。",
    apply: (t) => `謝謝大腦，提醒我「${cleanup(t)}」。我聽見了，但我現在不打算照它說的做。`,
    hint: "把它從敵人變成過度保護的朋友。",
  },
  {
    id: "sing-it",
    title: "用奇怪的方式唸",
    intro: "用唱的、慢動作、用卡通人物的聲音念。聽起來不一樣，感受也會不一樣。",
    apply: (t) =>
      `🎵 ${cleanup(t)} 🎵\n（請你在心裡用慢動作或用很 silly 的聲音念這句話）`,
    hint: "ACT 研究發現，破壞語言的『嚴肅感』可以降低它的情緒衝擊。",
  },
  {
    id: "label-story",
    title: "幫這個故事取名字",
    intro: "把這類念頭看成『又是那個老故事』，給它一個短名字。",
    apply: (t) =>
      `這又是「${shortLabel(cleanup(t))}」的故事。\n我以前也聽過，認得它了。`,
    hint: "命名 = 距離。你不是第一次聽到這個故事。",
  },
  {
    id: "physicalize",
    title: "如果它有形狀",
    intro: "把念頭從『一句話』變成『一個物件』。",
    apply: (t) =>
      `如果「${cleanup(t)}」是一個物件，它會是什麼？\n大小、顏色、溫度、軟硬？\n看著它，但不抓住它。`,
    hint: "把無形的念頭具象化，是 ACT 跟正念共同的核心。",
  },
];

function shortLabel(t: string): string {
  if (t.length <= 10) return t;
  if (/做不到|不會|失敗|沒救|沒用/.test(t)) return "我做不到";
  if (/沒人|沒被愛|孤單|孤獨/.test(t)) return "沒人在乎我";
  if (/應該|必須|一定/.test(t)) return "我應該…";
  if (/會出事|會死|會糟/.test(t)) return "災難化";
  if (/我很差|我不夠|我爛/.test(t)) return "我不夠好";
  return t.slice(0, 10) + "…";
}
