export type AssessmentAnswer = 0 | 1 | 2 | 3;

export interface AssessmentResult {
  date: string;
  answers: AssessmentAnswer[];
  score: number;
  level: "low" | "mid" | "high" | "burnout";
  axes: {
    sleep: number;
    tech: number;
    stress: number;
    body: number;
    food: number;
  };
}

export interface DailyLog {
  date: string;
  energy: number;
  stress: number;
  sleepQuality: number;
  focus: number;
  phoneFatigue: number;
  symptoms: string[];
  copingHabits: string[];
  stressSources: string[];
  note?: string;
  emotions?: string[];
  sleepHours?: number;
  evenReflect?: { win?: string; lesson?: string; thanks?: string };
}

export type Chronotype = "lion" | "bear" | "wolf" | "dolphin";

export interface ChronotypeResult {
  type: Chronotype;
  date: string;
  scores: Record<Chronotype, number>;
}

export interface CaffeineLog {
  ts: number;
  amountMg: number;
  source: string;
}

export interface StressReleaseLog {
  ts: number;
  door:
    | "movement"
    | "breath"
    | "social"
    | "laughter"
    | "affection"
    | "cry"
    | "creative";
  note?: string;
}

export interface PauseSession {
  date: string;
  taskId: string;
  durationSec: number;
  feltBetter?: boolean;
}

export interface PlanState {
  startedAt: string | null;
  currentWeek: number;
  completedTasks: Record<string, string[]>;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

export interface AppData {
  assessments: AssessmentResult[];
  daily: DailyLog[];
  pauses: PauseSession[];
  plan: PlanState;
  chat: ChatMessage[];
  weeklyReports: { weekOf: string; markdown: string; createdAt: number }[];
  chronotype?: ChronotypeResult;
  caffeine: CaffeineLog[];
  releases: StressReleaseLog[];
  settings: {
    apiKey?: string;
    name?: string;
    reminders?: ReminderSettings;
  };
}

export interface ReminderSettings {
  enabled: boolean;
  morningCheckin?: string;
  afternoonPause?: string;
  windDown?: string;
}

export const STRESS_SOURCES = [
  "工作",
  "學業",
  "人際",
  "家庭",
  "金錢",
  "未來焦慮",
  "健康焦慮",
  "社群比較",
  "資訊過載",
  "待辦太多",
] as const;

export const SYMPTOMS = [
  "頭痛",
  "肩頸痠痛",
  "胃不適",
  "心悸",
  "眼睛痠",
  "失眠",
  "倦怠",
  "皮膚狀況",
] as const;

export const COPING_HABITS = [
  "靠咖啡撐",
  "吃甜食",
  "滑手機放空",
  "酒精",
  "暴飲暴食",
  "拖延",
  "對人不耐煩",
] as const;

// 情緒輪簡化版 — Lisa Feldman Barrett 的 emotion granularity 觀點：
// 越能精準命名情緒，越容易降低它的強度。
export const EMOTION_GROUPS: { label: string; tone: "warm" | "calm" | "ink"; words: string[] }[] = [
  {
    label: "煩躁系",
    tone: "warm",
    words: ["焦躁", "煩悶", "急", "卡住", "不耐煩"],
  },
  {
    label: "低能量系",
    tone: "ink",
    words: ["疲憊", "麻木", "沒勁", "想躲起來", "懶得"],
  },
  {
    label: "焦慮系",
    tone: "warm",
    words: ["緊繃", "擔心", "想太多", "胸悶", "靜不下來"],
  },
  {
    label: "難過系",
    tone: "ink",
    words: ["失落", "委屈", "難過", "孤單", "想哭"],
  },
  {
    label: "穩定系",
    tone: "calm",
    words: ["平靜", "踏實", "放鬆", "感謝", "知足"],
  },
  {
    label: "正向系",
    tone: "calm",
    words: ["有動力", "好奇", "期待", "投入", "開心"],
  },
];
