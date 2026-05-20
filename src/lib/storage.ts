"use client";

import {
  AppData,
  AssessmentResult,
  CaffeineLog,
  ChatMessage,
  ChronotypeResult,
  DailyLog,
  DeepWorkSession,
  DefusionLog,
  DetoxState,
  PauseSession,
  PlanState,
  QuestState,
  StressReleaseLog,
} from "./types";

const KEY = "brain-recovery-v1";

const empty: AppData = {
  assessments: [],
  daily: [],
  pauses: [],
  plan: { startedAt: null, currentWeek: 1, completedTasks: {} },
  chat: [],
  weeklyReports: [],
  caffeine: [],
  releases: [],
  deepWork: [],
  defusions: [],
  quests: [],
  settings: {},
};

export function load(): AppData {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...empty };
    const parsed = JSON.parse(raw);
    return { ...empty, ...parsed, settings: { ...empty.settings, ...(parsed.settings ?? {}) } };
  } catch {
    return { ...empty };
  }
}

export function save(data: AppData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("brain-recovery:update"));
}

export function update(mutator: (d: AppData) => AppData | void) {
  const cur = load();
  const next = mutator(cur);
  save(next ?? cur);
}

export function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function addAssessment(a: AssessmentResult) {
  update((d) => {
    d.assessments.unshift(a);
    if (d.assessments.length > 30) d.assessments.length = 30;
  });
}

export function upsertDaily(log: DailyLog) {
  update((d) => {
    const idx = d.daily.findIndex((x) => x.date === log.date);
    if (idx >= 0) d.daily[idx] = log;
    else d.daily.unshift(log);
    d.daily.sort((a, b) => b.date.localeCompare(a.date));
    if (d.daily.length > 200) d.daily.length = 200;
  });
}

export function addPause(p: PauseSession) {
  update((d) => {
    d.pauses.unshift(p);
    if (d.pauses.length > 500) d.pauses.length = 500;
  });
}

export function setPlan(p: Partial<PlanState>) {
  update((d) => {
    d.plan = { ...d.plan, ...p };
  });
}

export function toggleTaskComplete(week: number, taskId: string) {
  update((d) => {
    const key = String(week);
    const list = d.plan.completedTasks[key] ?? [];
    const has = list.includes(taskId);
    d.plan.completedTasks[key] = has ? list.filter((x) => x !== taskId) : [...list, taskId];
  });
}

export function pushChat(m: ChatMessage) {
  update((d) => {
    d.chat.push(m);
    if (d.chat.length > 100) d.chat.splice(0, d.chat.length - 100);
  });
}

export function setApiKey(key: string) {
  update((d) => {
    d.settings.apiKey = key;
  });
}

export function setChronotype(r: ChronotypeResult) {
  update((d) => {
    d.chronotype = r;
  });
}

export function addCaffeine(c: CaffeineLog) {
  update((d) => {
    d.caffeine = d.caffeine || [];
    d.caffeine.unshift(c);
    if (d.caffeine.length > 500) d.caffeine.length = 500;
  });
}

export function removeCaffeine(ts: number) {
  update((d) => {
    d.caffeine = (d.caffeine || []).filter((x) => x.ts !== ts);
  });
}

export function addRelease(r: StressReleaseLog) {
  update((d) => {
    d.releases = d.releases || [];
    d.releases.unshift(r);
    if (d.releases.length > 500) d.releases.length = 500;
  });
}

export function addDeepWork(s: DeepWorkSession) {
  update((d) => {
    d.deepWork = d.deepWork || [];
    d.deepWork.unshift(s);
    if (d.deepWork.length > 1000) d.deepWork.length = 1000;
  });
}

export function removeDeepWork(ts: number) {
  update((d) => {
    d.deepWork = (d.deepWork || []).filter((x) => x.ts !== ts);
  });
}

export function setDetox(s: DetoxState | null) {
  update((d) => {
    if (s) d.detox = s;
    else delete d.detox;
  });
}

export function markDetoxDay(date: string, on: boolean) {
  update((d) => {
    if (!d.detox) return;
    const has = d.detox.completedDays.includes(date);
    if (on && !has) d.detox.completedDays = [...d.detox.completedDays, date];
    if (!on && has)
      d.detox.completedDays = d.detox.completedDays.filter((x) => x !== date);
  });
}

export function addDefusion(l: DefusionLog) {
  update((d) => {
    d.defusions = d.defusions || [];
    d.defusions.unshift(l);
    if (d.defusions.length > 200) d.defusions.length = 200;
  });
}

export function setTodayQuest(q: QuestState) {
  update((d) => {
    d.quests = d.quests || [];
    const idx = d.quests.findIndex((x) => x.date === q.date);
    if (idx >= 0) d.quests[idx] = q;
    else d.quests.unshift(q);
    d.quests.sort((a, b) => b.date.localeCompare(a.date));
    if (d.quests.length > 200) d.quests.length = 200;
  });
}

export function setSleepTarget(h: number) {
  update((d) => {
    d.settings.sleepTargetHours = h;
  });
}

export function setDeepWorkTarget(m: number) {
  update((d) => {
    d.settings.deepWorkTargetMin = m;
  });
}

export function clearAll() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("brain-recovery:update"));
}

export function exportJson(): string {
  return JSON.stringify(load(), null, 2);
}

export function importJson(json: string) {
  const parsed = JSON.parse(json);
  save({ ...empty, ...parsed });
}
