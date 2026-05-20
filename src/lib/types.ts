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

export interface DeepWorkSession {
  ts: number;
  minutes: number;
  label?: string;
}

export interface DetoxState {
  challengeId: string;
  startedAt: string;
  totalDays: number;
  rules: string[];
  completedDays: string[];
}

export interface DefusionLog {
  ts: number;
  thought: string;
  techniques: string[];
}

export interface QuestState {
  date: string;
  questId: string;
  completed: boolean;
  rerolled?: boolean;
}

export interface HabitStack {
  id: string;
  anchor: string;
  habit: string;
  createdAt: number;
}

export interface HabitLog {
  date: string;
  stackId: string;
}

export interface SighSession {
  ts: number;
  cycles: number;
}

export interface BoredomSession {
  ts: number;
  targetSec: number;
  completedSec: number;
  urgeNote?: string;
}

export interface MorningPage {
  date: string;
  ts: number;
  minutes: number;
  wordCount: number;
  text?: string;
}

export interface CompassionSession {
  ts: number;
  situation?: string;
}

export type Goal =
  | "sleep"
  | "anxiety"
  | "focus"
  | "phone"
  | "burnout"
  | "general";

export interface TriggerLog {
  ts: number;
  type: "phone" | "sugar" | "coffee" | "scroll" | "snack" | "drink" | "other";
  trigger?: string; // 觸發的情境 (boredom / anxiety / habit / hungry / tired / sad / other)
  acted?: boolean;  // 真的做了嗎
}

export interface WalkSession {
  ts: number;
  minutes: number;
  perceivedStressBefore?: number;
  perceivedStressAfter?: number;
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
  deepWork: DeepWorkSession[];
  detox?: DetoxState;
  defusions: DefusionLog[];
  quests: QuestState[];
  habits: HabitStack[];
  habitLogs: HabitLog[];
  sighs: SighSession[];
  boredom: BoredomSession[];
  morningPages: MorningPage[];
  compassion: CompassionSession[];
  triggers: TriggerLog[];
  walks: WalkSession[];
  settings: {
    apiKey?: string;
    name?: string;
    reminders?: ReminderSettings;
    sleepTargetHours?: number;
    deepWorkTargetMin?: number;
    goal?: Goal;
    timeBudgetMin?: number;
    onboardedAt?: string;
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
