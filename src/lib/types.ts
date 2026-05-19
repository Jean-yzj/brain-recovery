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
