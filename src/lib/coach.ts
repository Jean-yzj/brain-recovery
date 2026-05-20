import { AppData, Goal } from "./types";
import { remainingAt, todayTotal } from "./caffeine";
import { debtSeries, netDebt } from "./sleepdebt";
import { CHRONOTYPE_PROFILE } from "./chronotype";
import { topAxes } from "./assessment";

export interface CoachAction {
  id: string;
  priority: number;        // 0–100
  category:
    | "acute"              // 此刻急救
    | "sleep"              // 睡眠相關
    | "tech"               // 螢幕/手機
    | "body"               // 身體/動
    | "mind"               // 情緒/正念
    | "habit"              // 例行
    | "reflect";           // 回顧/紀錄
  title: string;
  reason: string;
  href: string;
  iconKey: string;
  badge?: string;          // "現在" / "今晚" / "明早" / "本週"
  duration?: string;
}

export interface CoachContext {
  primary: CoachAction;
  supporting: CoachAction[];
  stateSummary: string;
  weakAxis?: "sleep" | "tech" | "stress" | "body" | "food";
  weekTheme?: string;
}

type Reasoner = (
  d: AppData,
  now: Date
) => CoachAction[];

function todayIso(now: Date) {
  const d = new Date(now);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function hoursAgo(ts: number, now: number) {
  return (now - ts) / 3_600_000;
}

function hasToday<T extends { ts?: number; date?: string }>(
  arr: T[] | undefined,
  now: Date
): boolean {
  if (!arr || !arr.length) return false;
  const iso = todayIso(now);
  return arr.some((x) => {
    if ("date" in x && typeof x.date === "string") return x.date === iso;
    if ("ts" in x && typeof x.ts === "number")
      return todayIso(new Date(x.ts)) === iso;
    return false;
  });
}

// ===== Rule reasoners =====

const acuteStress: Reasoner = (d, now) => {
  const latest = d.daily[0];
  if (!latest) return [];
  const todayLog = latest.date === todayIso(now) ? latest : null;
  const out: CoachAction[] = [];

  if (todayLog && todayLog.stress >= 8) {
    const anxiety = (todayLog.emotions ?? []).some((e) =>
      ["緊繃", "擔心", "想太多", "胸悶", "靜不下來"].includes(e)
    );
    if (!hasToday(d.sighs, now)) {
      out.push({
        id: "acute-sigh",
        priority: 95,
        category: "acute",
        title: "做一次 60 秒生理嘆息",
        reason: `你今天壓力打 ${todayLog.stress}/10。${
          anxiety ? "情緒裡有焦慮感。" : ""
        }Huberman 研究上這是最快的鬆開方式。`,
        href: "/sigh",
        iconKey: "wind",
        badge: "現在",
        duration: "60 秒",
      });
    }
    if (!hasToday(d.releases, now)) {
      out.push({
        id: "acute-release",
        priority: 80,
        category: "acute",
        title: "選一道壓力出口",
        reason:
          "光是『想開了』不夠，身體還停在備戰狀態。挑一道門把循環真的合上。",
        href: "/release",
        iconKey: "heart",
        badge: "現在",
        duration: "5 分鐘",
      });
    }
  }

  // High anxiety emotions specifically
  if (todayLog) {
    const groundingEmotions = ["緊繃", "胸悶", "靜不下來", "想太多"];
    if (
      (todayLog.emotions ?? []).some((e) => groundingEmotions.includes(e)) &&
      !hasToday(d.pauses, now)
    ) {
      out.push({
        id: "acute-ground",
        priority: 85,
        category: "acute",
        title: "做一次 5-4-3-2-1 接地",
        reason: "你勾了『緊繃 / 胸悶 / 想太多』。把感官拉回現在這個空間。",
        href: "/pause",
        iconKey: "pause",
        badge: "現在",
        duration: "90 秒",
      });
    }
  }

  // Sad emotions → compassion
  if (todayLog) {
    const sadEmotions = ["失落", "委屈", "難過", "孤單", "想哭"];
    if (
      (todayLog.emotions ?? []).some((e) => sadEmotions.includes(e)) &&
      !hasToday(d.compassion, now)
    ) {
      out.push({
        id: "acute-compassion",
        priority: 88,
        category: "mind",
        title: "對自己溫柔 3 分鐘",
        reason: "你今天有難過感。Kristin Neff 的三步驟自我慈悲，現在很需要。",
        href: "/compassion",
        iconKey: "heart-handshake",
        badge: "現在",
        duration: "3 分鐘",
      });
    }
  }

  return out;
};

const sleepCoach: Reasoner = (d, now) => {
  const out: CoachAction[] = [];
  const target = d.settings.sleepTargetHours ?? 8;
  const series = debtSeries(d.daily, target, 14);
  const debt = netDebt(series);
  const h = now.getHours();
  const winddownDoneToday = (() => {
    if (typeof window === "undefined") return false;
    try {
      const raw = window.localStorage.getItem("brain-recovery-winddown-today");
      if (!raw) return false;
      const { date, ids } = JSON.parse(raw);
      return date === todayIso(now) && (ids?.length ?? 0) >= 4;
    } catch {
      return false;
    }
  })();

  // Evening winddown
  if (h >= 20 && h <= 24 && !winddownDoneToday) {
    out.push({
      id: "sleep-winddown",
      priority: h >= 22 ? 92 : 70,
      category: "sleep",
      title: "做 17 分鐘睡前儀式",
      reason: "你已經接近就寢時間。睡前儀式不一定要全做，做幾項都行。",
      href: "/winddown",
      iconKey: "moon",
      badge: "今晚",
      duration: "17 分鐘",
    });
  }

  // Significant sleep debt
  if (debt >= 5) {
    out.push({
      id: "sleep-debt-warn",
      priority: 78,
      category: "sleep",
      title: "你欠了 " + debt.toFixed(1) + " 小時睡眠",
      reason:
        debt >= 10
          ? "已達警戒範圍。本週至少 3 天提早 30 分鐘上床，不要用單次補眠解決。"
          : "本週試著有 1–2 天比目標多睡 30 分鐘就能補回來。",
      href: "/sleep-debt",
      iconKey: "bed",
      badge: "本週",
    });
  }

  // Calculate ideal bedtime from chronotype + reminded
  if (h >= 18 && h <= 22) {
    const ct = d.chronotype?.type;
    if (ct) {
      out.push({
        id: "sleep-bedtime",
        priority: 55,
        category: "sleep",
        title: "用 sleep cycle 算今晚就寢時間",
        reason: `你的 chronotype 是「${
          CHRONOTYPE_PROFILE[ct].name
        }」，建議就寢 ${CHRONOTYPE_PROFILE[ct].sleepWindow}。`,
        href: "/sleep-calc",
        iconKey: "clock",
        badge: "今晚",
      });
    } else {
      out.push({
        id: "sleep-bedtime-nochrono",
        priority: 45,
        category: "sleep",
        title: "算今晚的最佳就寢時間",
        reason: "用 90 分鐘睡眠 cycle，挑一個讓你最容易自然醒的時間點。",
        href: "/sleep-calc",
        iconKey: "clock",
        badge: "今晚",
      });
    }
  }

  return out;
};

const caffeineCoach: Reasoner = (d, now) => {
  const out: CoachAction[] = [];
  const logs = d.caffeine || [];
  if (!logs.length) return [];

  const remaining = remainingAt(logs, now.getTime());
  const h = now.getHours();

  // Caffeine still high in late afternoon/evening
  if (h >= 16 && remaining >= 80) {
    out.push({
      id: "caf-cutoff",
      priority: 78,
      category: "sleep",
      title: `你體內還有 ${Math.round(remaining)} mg 咖啡因`,
      reason:
        "下午之後喝的咖啡因，會偷走今晚的深睡。明天試著把最後一杯往前移 2 小時。",
      href: "/caffeine",
      iconKey: "coffee",
      badge: "提醒",
    });
  }

  const todayMg = todayTotal(logs);
  if (todayMg >= 300) {
    out.push({
      id: "caf-overdose",
      priority: 50,
      category: "sleep",
      title: `今天已喝 ${todayMg} mg`,
      reason: "成人建議每日不超過 400 mg。多餘的咖啡因不會更清醒，只會讓你晚上難睡。",
      href: "/caffeine",
      iconKey: "coffee",
    });
  }

  return out;
};

const phoneCoach: Reasoner = (d, now) => {
  const out: CoachAction[] = [];
  const last3 = d.daily.slice(0, 3);
  if (!last3.length) return [];

  const avgPhone =
    last3.reduce((acc, x) => acc + x.phoneFatigue, 0) / last3.length;

  if (avgPhone >= 7 && !d.detox) {
    out.push({
      id: "phone-detox-start",
      priority: 65,
      category: "tech",
      title: "考慮開始一個數位排毒挑戰",
      reason: `你最近 3 天平均手機疲倦 ${avgPhone.toFixed(
        1
      )}。從 7 天無手機晨間開始最容易。`,
      href: "/detox",
      iconKey: "smartphone",
      badge: "本週",
    });
  }

  // Detox today not yet marked
  if (d.detox) {
    const today = todayIso(now);
    const start = new Date(d.detox.startedAt);
    start.setHours(0, 0, 0, 0);
    const dayIdx = Math.floor(
      (now.getTime() - start.getTime()) / 86_400_000
    );
    if (
      dayIdx >= 0 &&
      dayIdx < d.detox.totalDays &&
      !d.detox.completedDays.includes(today)
    ) {
      out.push({
        id: "phone-detox-today",
        priority: 60,
        category: "tech",
        title: "今天數位排毒打卡",
        reason: `「${
          d.detox.challengeId.includes("morning")
            ? "無手機晨間"
            : d.detox.challengeId.includes("evening")
            ? "無社群晚間"
            : "深度數位整理"
        }」第 ${dayIdx + 1} 天。`,
        href: "/detox",
        iconKey: "smartphone",
        badge: "今天",
      });
    }
  }

  // Many recent triggers → suggest boredom training
  const recentTriggers = (d.triggers || []).filter(
    (t) => hoursAgo(t.ts, now.getTime()) < 24
  );
  if (recentTriggers.length >= 5) {
    out.push({
      id: "phone-boredom",
      priority: 60,
      category: "mind",
      title: "試試 3 分鐘無聊訓練",
      reason: `過去 24 小時你紀錄了 ${recentTriggers.length} 次衝動。多巴胺基線可能被推高了。`,
      href: "/boredom",
      iconKey: "hourglass",
      duration: "3 分鐘",
    });
  }

  return out;
};

const bodyCoach: Reasoner = (d, now) => {
  const out: CoachAction[] = [];
  const latest = d.daily[0];
  if (!latest) return [];
  const todayLog = latest.date === todayIso(now) ? latest : null;

  // Walk prescription when stress high + no walk today + day time
  const h = now.getHours();
  if (todayLog && todayLog.stress >= 7 && h >= 8 && h <= 19) {
    const walkedToday = hasToday(d.walks, now);
    if (!walkedToday) {
      out.push({
        id: "body-walk",
        priority: 82,
        category: "body",
        title: "出去走 15 分鐘",
        reason: `你壓力 ${todayLog.stress}/10。光是走路、看遠方、不滑手機，皮質醇可以掉一截。`,
        href: "/walk",
        iconKey: "footprints",
        badge: "現在",
        duration: "15 分鐘",
      });
    }
  }

  // Body symptoms multiple days
  const last7 = d.daily.slice(0, 7);
  const symptomCount = last7.reduce(
    (acc, x) => acc + (x.symptoms?.length ?? 0),
    0
  );
  if (symptomCount >= 6) {
    out.push({
      id: "body-symptoms",
      priority: 50,
      category: "body",
      title: "身體在喊救命",
      reason: `近 7 天你勾選了 ${symptomCount} 次身體警訊。先放慢一點。`,
      href: "/release",
      iconKey: "heart",
    });
  }

  return out;
};

const reflectCoach: Reasoner = (d, now) => {
  const out: CoachAction[] = [];
  const h = now.getHours();
  const iso = todayIso(now);

  // Morning pages window
  if (h >= 5 && h <= 11) {
    const wrote = (d.morningPages || []).some((p) => p.date === iso);
    if (!wrote) {
      out.push({
        id: "reflect-morning",
        priority: 55,
        category: "reflect",
        title: "寫 5 分鐘晨間日記",
        reason: "把腦袋裡的雜訊先倒出來，再開始一天。",
        href: "/morning-pages",
        iconKey: "sunrise",
        badge: "明早",
        duration: "5 分鐘",
      });
    }
  }

  // No daily checkin today
  const dailyToday = d.daily[0]?.date === iso;
  if (!dailyToday && h >= 9) {
    out.push({
      id: "reflect-daily",
      priority: 70,
      category: "reflect",
      title: "30 秒打卡今天的狀態",
      reason: "資料越多，coach 越能準確判斷。30 秒就好。",
      href: "/daily",
      iconKey: "calendar",
      badge: "今天",
      duration: "30 秒",
    });
  }

  // Sunday evening — weekly report
  if (now.getDay() === 0 && h >= 18) {
    out.push({
      id: "reflect-week",
      priority: 60,
      category: "reflect",
      title: "產出本週 AI 報告",
      reason: "週日晚上適合回顧。把 7 天紀錄整理成你看得懂的洞察。",
      href: "/report",
      iconKey: "sparkles",
      badge: "本週",
    });
  }

  return out;
};

const habitCoach: Reasoner = (d, now) => {
  const out: CoachAction[] = [];
  const habits = d.habits || [];
  if (habits.length === 0) return [];
  const iso = todayIso(now);
  const undoneToday = habits.filter(
    (h) => !(d.habitLogs || []).some((l) => l.stackId === h.id && l.date === iso)
  );
  if (undoneToday.length > 0) {
    const sample = undoneToday[0];
    out.push({
      id: "habit-check",
      priority: 40,
      category: "habit",
      title: `堆疊打卡：${sample.habit}`,
      reason: `在「${sample.anchor}」之後做。今天還有 ${undoneToday.length} 條沒打卡。`,
      href: "/habits",
      iconKey: "link",
    });
  }
  return out;
};

const questCoach: Reasoner = (d, now) => {
  const iso = todayIso(now);
  const todayQuest = (d.quests || []).find((q) => q.date === iso);
  if (!todayQuest || todayQuest.completed) return [];
  return [
    {
      id: "quest-today",
      priority: 50,
      category: "habit",
      title: "今日大腦任務",
      reason: "一個小行動，連續完成是最便宜的成就感來源。",
      href: "/quest",
      iconKey: "target",
      badge: "今天",
    },
  ];
};

const newUserCoach: Reasoner = (d) => {
  const out: CoachAction[] = [];
  if (!d.assessments.length) {
    out.push({
      id: "new-assess",
      priority: 99,
      category: "reflect",
      title: "先做一次大腦疲勞檢測",
      reason: "12 題、90 秒。找出你最累的軸線。其他建議會根據結果調整。",
      href: "/assessment",
      iconKey: "clipboard",
      badge: "開始",
      duration: "90 秒",
    });
  } else if (!d.chronotype) {
    out.push({
      id: "new-chrono",
      priority: 70,
      category: "reflect",
      title: "做 Chronotype 測驗",
      reason: "知道你是 Lion / Bear / Wolf / Dolphin，就能校準提醒時間、咖啡因截止、深度工作時段。",
      href: "/chronotype",
      iconKey: "zap",
      duration: "1 分鐘",
    });
  }
  return out;
};

// Personalization weighting based on goal
function applyGoalWeights(actions: CoachAction[], goal?: Goal): CoachAction[] {
  if (!goal || goal === "general") return actions;
  const boost = (cats: CoachAction["category"][], by = 15) =>
    actions.map((a) =>
      cats.includes(a.category) ? { ...a, priority: a.priority + by } : a
    );
  switch (goal) {
    case "sleep":
      return boost(["sleep"], 20);
    case "anxiety":
      return boost(["acute", "mind"], 18);
    case "focus":
      return boost(["habit", "tech"], 12);
    case "phone":
      return boost(["tech"], 20);
    case "burnout":
      return boost(["acute", "mind", "sleep"], 15);
    default:
      return actions;
  }
}

function applyTimeBudget(
  actions: CoachAction[],
  budget?: number
): CoachAction[] {
  if (!budget || budget >= 30) return actions;
  const limit = budget; // minutes
  const parseDur = (d?: string): number => {
    if (!d) return 5;
    const m = d.match(/(\d+)\s*分/);
    if (m) return parseInt(m[1], 10);
    const s = d.match(/(\d+)\s*秒/);
    if (s) return Math.max(1, Math.round(parseInt(s[1], 10) / 60));
    return 5;
  };
  return actions
    .map((a) => {
      const cost = parseDur(a.duration);
      if (cost > limit) return { ...a, priority: a.priority - 30 };
      return a;
    });
}

function summarize(d: AppData, now: Date): string {
  const latest = d.daily[0];
  const iso = todayIso(now);
  const isToday = latest?.date === iso;
  const parts: string[] = [];
  const name = d.settings.name ? `${d.settings.name}，` : "";

  if (!d.assessments.length) return `${name}先從一次 90 秒的大腦疲勞檢測開始。`;

  if (isToday) {
    if (latest.stress >= 8) parts.push("壓力偏高");
    if (latest.energy <= 4) parts.push("精神不足");
    if (latest.sleepQuality <= 4) parts.push("睡眠品質低");
    if (latest.phoneFatigue >= 7) parts.push("手機疲倦明顯");
  }

  const target = d.settings.sleepTargetHours ?? 8;
  const debt = netDebt(debtSeries(d.daily, target, 14));
  if (debt >= 5) parts.push(`睡眠債 ${debt.toFixed(0)} 小時`);

  if (parts.length === 0)
    return `${name}今天狀態不錯，維持目前的節奏就好。`;
  return `${name}今天觀察到：${parts.join("、")}。`;
}

function weakAxisOf(d: AppData) {
  const a = d.assessments[0];
  if (!a) return undefined;
  return topAxes(a)[0]?.axis;
}

function weekThemeFor(axis?: string) {
  if (!axis) return undefined;
  return {
    sleep: "本週重點：睡眠節奏",
    tech: "本週重點：減少螢幕暴露",
    stress: "本週重點：壓力恢復",
    body: "本週重點：身體訊號",
    food: "本週重點：飲食穩定",
  }[axis as "sleep" | "tech" | "stress" | "body" | "food"];
}

export function coach(d: AppData, now: Date = new Date()): CoachContext {
  const reasoners: Reasoner[] = [
    newUserCoach,
    acuteStress,
    sleepCoach,
    caffeineCoach,
    phoneCoach,
    bodyCoach,
    reflectCoach,
    habitCoach,
    questCoach,
  ];

  let actions = reasoners.flatMap((r) => r(d, now));
  actions = applyGoalWeights(actions, d.settings.goal);
  actions = applyTimeBudget(actions, d.settings.timeBudgetMin);
  actions.sort((a, b) => b.priority - a.priority);

  // Dedupe by href, keep highest
  const seenHref = new Set<string>();
  actions = actions.filter((a) => {
    if (seenHref.has(a.href)) return false;
    seenHref.add(a.href);
    return true;
  });

  let primary = actions[0];
  if (!primary) {
    // Maintenance default
    primary = {
      id: "maint-quest",
      priority: 30,
      category: "habit",
      title: "做一次 60 秒生理嘆息",
      reason: "沒有特別的訊號。給大腦一個間隙，也是練習。",
      href: "/sigh",
      iconKey: "wind",
      duration: "60 秒",
    };
  }
  const supporting = actions
    .slice(1)
    .filter((a) => a.category !== primary.category)
    .slice(0, 3);
  // Fill if not enough
  if (supporting.length < 3) {
    const extra = actions.slice(1).filter((a) => !supporting.includes(a));
    for (const a of extra) {
      if (supporting.length >= 3) break;
      if (!supporting.find((s) => s.href === a.href)) supporting.push(a);
    }
  }

  const weakAxis = weakAxisOf(d) as CoachContext["weakAxis"];
  return {
    primary,
    supporting,
    stateSummary: summarize(d, now),
    weakAxis,
    weekTheme: weekThemeFor(weakAxis),
  };
}
