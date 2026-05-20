"use client";

import { useEffect, useState } from "react";
import { load } from "@/lib/storage";
import { AppData } from "@/lib/types";
import { suggestions, buildEventTimes } from "@/lib/schedule";
import {
  Calendar,
  CheckSquare,
  Plus,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Check,
} from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import SignInButton from "@/components/SignInButton";

interface GEvent {
  id: string;
  summary: string;
  start?: string;
  end?: string;
  allDay: boolean;
  location?: string;
  htmlLink?: string;
}

interface Session {
  user?: { name?: string | null; email?: string | null; image?: string | null };
  error?: string;
}

function ScheduleInner() {
  const [data, setData] = useState<AppData>(load());
  const [session, setSession] = useState<Session | null>(null);
  const [events, setEvents] = useState<GEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string>("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [doneIds, setDoneIds] = useState<Record<string, { kind: "task" | "calendar"; link?: string }>>(
    {}
  );
  const [overrideTime, setOverrideTime] = useState<Record<string, string>>({});

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    return () => window.removeEventListener("brain-recovery:update", onUpdate);
  }, []);

  const fetchSession = async () => {
    const res = await fetch("/api/auth/session", { cache: "no-store" });
    const d = await res.json();
    setSession(d?.user ? d : null);
    return !!d?.user;
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    setEventsError("");
    try {
      const res = await fetch("/api/calendar/today", { cache: "no-store" });
      if (res.status === 401) {
        setSession(null);
        setEventsError("尚未登入");
        return;
      }
      if (!res.ok) {
        setEventsError("讀取行事曆失敗");
        return;
      }
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch {
      setEventsError("讀取行事曆失敗");
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    (async () => {
      const isAuthed = await fetchSession();
      if (isAuthed) await fetchEvents();
    })();
  }, []);

  const isSignedIn = !!session?.user && session.error !== "RefreshError";
  const list = suggestions(data.chronotype?.type);

  const addToCalendar = async (
    sid: string,
    summary: string,
    description: string,
    hhmm: string,
    durationMin: number
  ) => {
    setBusyId(sid);
    try {
      const { startISO, endISO } = buildEventTimes(hhmm, durationMin);
      const res = await fetch("/api/calendar/add", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ summary, description, startISO, endISO }),
      });
      if (!res.ok) {
        alert("加入失敗，請稍後再試");
        return;
      }
      const data = await res.json();
      setDoneIds((x) => ({ ...x, [sid]: { kind: "calendar", link: data.htmlLink } }));
      await fetchEvents();
    } finally {
      setBusyId(null);
    }
  };

  const addToTasks = async (sid: string, title: string, notes: string, hhmm: string) => {
    setBusyId(sid);
    try {
      const { startISO } = buildEventTimes(hhmm, 5);
      const res = await fetch("/api/tasks/add", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, notes, dueISO: startISO }),
      });
      if (!res.ok) {
        alert("加入失敗，請稍後再試");
        return;
      }
      setDoneIds((x) => ({ ...x, [sid]: { kind: "task" } }));
    } finally {
      setBusyId(null);
    }
  };

  // Schedule everything in one shot
  const scheduleAll = async () => {
    for (const s of list) {
      if (doneIds[s.id]) continue;
      const hhmm = overrideTime[s.id] ?? s.defaultTime;
      if (s.type === "calendar") {
        await addToCalendar(s.id, s.title, s.description, hhmm, s.durationMin);
      } else {
        await addToTasks(s.id, s.title, s.description, hhmm);
      }
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500 flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" /> 今日行程
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          把練習排進你既有的一天
        </h1>
        <p className="text-sm text-ink-500 mt-2 leading-relaxed">
          登入 Google 之後，可以把每個練習一鍵加進你的行事曆或提醒事項。
          每個人只看到自己的資料（透過自己的 Google 帳號）。
        </p>
      </div>

      {!isSignedIn && <SignInButton variant="card" />}

      {isSignedIn && (
        <>
          <div className="card">
            <div className="flex items-baseline justify-between mb-3">
              <div className="text-sm font-medium flex items-center gap-2">
                今日的 Google 行事曆
                <button
                  onClick={fetchEvents}
                  className="text-ink-400 hover:text-ink-700"
                  title="重新整理"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingEvents ? "animate-spin" : ""}`} />
                </button>
              </div>
              <div className="text-xs text-ink-500">{events.length} 個事件</div>
            </div>
            {events.length === 0 && !loadingEvents && (
              <div className="text-sm text-ink-500">今天還沒有事件。</div>
            )}
            {eventsError && (
              <div className="text-xs text-warm-500 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> {eventsError}
              </div>
            )}
            <ul className="space-y-2">
              {events.map((e) => {
                const startD = e.start ? new Date(e.start) : null;
                const endD = e.end ? new Date(e.end) : null;
                const timeStr = e.allDay
                  ? "整天"
                  : startD
                  ? `${String(startD.getHours()).padStart(2, "0")}:${String(
                      startD.getMinutes()
                    ).padStart(2, "0")}${
                      endD
                        ? ` – ${String(endD.getHours()).padStart(2, "0")}:${String(
                            endD.getMinutes()
                          ).padStart(2, "0")}`
                        : ""
                    }`
                  : "";
                return (
                  <li
                    key={e.id}
                    className="flex items-center gap-3 rounded-xl bg-ink-50 dark:bg-ink-900 px-3 py-2"
                  >
                    <div className="text-xs tabular-nums text-ink-500 w-20 flex-shrink-0">
                      {timeStr}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {e.summary}
                      </div>
                      {e.location && (
                        <div className="text-xs text-ink-500 truncate">
                          {e.location}
                        </div>
                      )}
                    </div>
                    {e.htmlLink && (
                      <a
                        href={e.htmlLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ink-400 hover:text-ink-700"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <button onClick={scheduleAll} className="btn-primary w-full">
            <Plus className="h-4 w-4" /> 一鍵把整個今日方案加進去
          </button>

          <div className="text-xs text-ink-500 text-center">
            建議時段已根據你的{" "}
            {data.chronotype ? (
              <b>{data.chronotype.type === "lion"
                ? "獅子型"
                : data.chronotype.type === "bear"
                ? "熊型"
                : data.chronotype.type === "wolf"
                ? "狼型"
                : "海豚型"}
              </b>
            ) : (
              "預設 chronotype"
            )}{" "}
            自動校準
          </div>
        </>
      )}

      <div className="space-y-3">
        {(["morning", "day", "evening"] as const).map((cat) => {
          const items = list.filter((s) => s.category === cat);
          if (!items.length) return null;
          return (
            <div key={cat}>
              <div className="text-xs text-ink-500 mb-2 ml-1">
                {cat === "morning"
                  ? "早晨"
                  : cat === "day"
                  ? "白天"
                  : "晚上"}
              </div>
              <div className="space-y-2">
                {items.map((s) => {
                  const done = doneIds[s.id];
                  const time = overrideTime[s.id] ?? s.defaultTime;
                  return (
                    <div key={s.id} className="card">
                      <div className="flex items-baseline justify-between mb-1">
                        <div className="text-sm font-semibold">{s.title}</div>
                        <span className="text-[10px] text-ink-500 pill py-0.5 px-2">
                          {s.type === "task" ? (
                            <>
                              <CheckSquare className="h-3 w-3 inline mr-1" />
                              提醒事項
                            </>
                          ) : (
                            <>
                              <Calendar className="h-3 w-3 inline mr-1" />
                              行事曆
                            </>
                          )}
                        </span>
                      </div>
                      <div className="text-xs text-ink-500 mb-3">
                        {s.description}
                        {s.type === "calendar" && ` · ${s.durationMin} 分鐘`}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={time}
                          onChange={(e) =>
                            setOverrideTime((x) => ({
                              ...x,
                              [s.id]: e.target.value,
                            }))
                          }
                          className="input w-28 text-center text-sm"
                          disabled={!!done}
                        />
                        {done ? (
                          <div className="flex-1 flex items-center gap-2 text-sm text-calm-700 dark:text-calm-300">
                            <Check className="h-4 w-4" /> 已加入{" "}
                            {done.kind === "task" ? "提醒事項" : "行事曆"}
                            {done.link && (
                              <a
                                href={done.link}
                                target="_blank"
                                rel="noreferrer"
                                className="ml-auto text-ink-400 hover:text-ink-700"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              s.type === "calendar"
                                ? addToCalendar(
                                    s.id,
                                    s.title,
                                    s.description,
                                    time,
                                    s.durationMin
                                  )
                                : addToTasks(s.id, s.title, s.description, time)
                            }
                            disabled={!isSignedIn || busyId === s.id}
                            className="btn-primary flex-1 disabled:opacity-50"
                          >
                            {busyId === s.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Plus className="h-4 w-4" />
                                {isSignedIn ? "排入" : "登入後可用"}
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card text-xs text-ink-500 space-y-2">
        <div className="text-sm font-medium text-ink-700 dark:text-ink-200">
          隱私說明
        </div>
        <div>
          · 你登入的是你自己的 Google 帳號，App 拿到的 access token 只能存取你的資料。
        </div>
        <div>
          · 每個使用者的 session 存在他自己瀏覽器的加密 cookie 裡，互相看不到。
        </div>
        <div>
          · 這個 App 沒有資料庫。你的打卡、檢測、紀錄都只存在你的瀏覽器；
          行事曆/提醒事項則直接寫到你自己的 Google 帳號。
        </div>
        <div>
          · 你可以隨時到{" "}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Google 第三方應用程式管理
          </a>{" "}
          撤銷授權。
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <ScheduleInner />
    </ClientOnly>
  );
}
