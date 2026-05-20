import { Chronotype } from "./types";

export interface ScheduleSuggestion {
  id: string;
  title: string;
  description: string;
  href: string;
  defaultTime: string; // HH:MM
  durationMin: number;
  type: "calendar" | "task";
  category: "morning" | "day" | "evening" | "anytime";
}

// 每個 chronotype 預設時段
const TIMES: Record<Chronotype | "default", {
  morningPages: string;
  deepWork: string;
  walk: string;
  pause: string;
  winddown: string;
  bedtime: string;
}> = {
  lion: {
    morningPages: "06:30",
    deepWork: "07:30",
    walk: "13:30",
    pause: "15:30",
    winddown: "21:00",
    bedtime: "22:00",
  },
  bear: {
    morningPages: "08:00",
    deepWork: "10:00",
    walk: "14:00",
    pause: "15:30",
    winddown: "22:00",
    bedtime: "23:00",
  },
  wolf: {
    morningPages: "10:00",
    deepWork: "14:00",
    walk: "16:30",
    pause: "17:30",
    winddown: "23:30",
    bedtime: "00:30",
  },
  dolphin: {
    morningPages: "07:30",
    deepWork: "10:00",
    walk: "15:00",
    pause: "16:00",
    winddown: "22:30",
    bedtime: "23:30",
  },
  default: {
    morningPages: "08:00",
    deepWork: "10:00",
    walk: "14:00",
    pause: "15:30",
    winddown: "22:00",
    bedtime: "23:00",
  },
};

export function suggestions(chronotype?: Chronotype): ScheduleSuggestion[] {
  const t = TIMES[chronotype ?? "default"];
  return [
    {
      id: "morning-pages",
      title: "晨間日記",
      description: "5 分鐘意識流，先把腦袋雜訊倒出來",
      href: "/morning-pages",
      defaultTime: t.morningPages,
      durationMin: 10,
      type: "calendar",
      category: "morning",
    },
    {
      id: "daily-checkin",
      title: "每日狀態打卡",
      description: "30 秒，幫大腦留個聲音",
      href: "/daily",
      defaultTime: "21:30",
      durationMin: 5,
      type: "task",
      category: "evening",
    },
    {
      id: "deep-work",
      title: "深度工作 50 分鐘",
      description: "一段不被打擾的單一任務時間",
      href: "/deep-work",
      defaultTime: t.deepWork,
      durationMin: 50,
      type: "calendar",
      category: "day",
    },
    {
      id: "walk",
      title: "散步 15 分鐘",
      description: "光、空氣、看遠方。最便宜的抗壓藥",
      href: "/walk",
      defaultTime: t.walk,
      durationMin: 15,
      type: "calendar",
      category: "day",
    },
    {
      id: "brain-pause",
      title: "Brain Pause",
      description: "下午的低谷做一次 3 分鐘暫停",
      href: "/pause",
      defaultTime: t.pause,
      durationMin: 5,
      type: "calendar",
      category: "day",
    },
    {
      id: "quest",
      title: "今日大腦任務",
      description: "一個小行動，連續做",
      href: "/quest",
      defaultTime: "20:00",
      durationMin: 5,
      type: "task",
      category: "evening",
    },
    {
      id: "winddown",
      title: "睡前儀式",
      description: "17 分鐘關機 routine",
      href: "/winddown",
      defaultTime: t.winddown,
      durationMin: 30,
      type: "calendar",
      category: "evening",
    },
    {
      id: "bedtime",
      title: "上床睡覺",
      description: "今天的工作日結束",
      href: "/sleep-calc",
      defaultTime: t.bedtime,
      durationMin: 5,
      type: "task",
      category: "evening",
    },
  ];
}

export function buildEventTimes(
  hhmm: string,
  durationMin: number
): { startISO: string; endISO: string } {
  const [h, m] = hhmm.split(":").map(Number);
  const start = new Date();
  start.setHours(h || 0, m || 0, 0, 0);
  // if the time is already past, schedule for tomorrow
  if (start.getTime() < Date.now() - 30 * 60_000) {
    start.setDate(start.getDate() + 1);
  }
  const end = new Date(start.getTime() + durationMin * 60_000);
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}
