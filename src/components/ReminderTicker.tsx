"use client";

import { useEffect } from "react";
import { load } from "@/lib/storage";

const KEY_LAST_FIRED = "brain-recovery-last-reminder";

interface Last {
  date: string;
  ids: string[];
}

function loadLast(): Last {
  if (typeof window === "undefined") return { date: "", ids: [] };
  try {
    const raw = window.localStorage.getItem(KEY_LAST_FIRED);
    if (!raw) return { date: "", ids: [] };
    return JSON.parse(raw);
  } catch {
    return { date: "", ids: [] };
  }
}

function saveLast(l: Last) {
  window.localStorage.setItem(KEY_LAST_FIRED, JSON.stringify(l));
}

export default function ReminderTicker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const check = () => {
      const d = load();
      const r = d.settings.reminders;
      if (!r || !r.enabled || Notification.permission !== "granted") return;
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const today = now.toISOString().slice(0, 10);
      const last = loadLast();
      const firedToday = last.date === today ? last.ids : [];

      const fire = (id: string, title: string, body: string, path: string) => {
        if (firedToday.includes(id)) return;
        try {
          const n = new Notification(title, { body, icon: "/icon.svg", tag: id });
          n.onclick = () => {
            window.focus();
            window.location.href = path;
          };
          saveLast({ date: today, ids: [...firedToday, id] });
        } catch {}
      };

      if (r.morningCheckin === hhmm) {
        fire("morning", "今天的大腦還好嗎？", "30 秒打卡，幫大腦留個聲音。", "/daily");
      }
      if (r.afternoonPause === hhmm) {
        fire("afternoon", "腦袋滿了嗎？", "給自己 1–3 分鐘的暫停。", "/pause");
      }
      if (r.windDown === hhmm) {
        fire("winddown", "該關機了。", "17 分鐘睡前儀式，從手機放遠開始。", "/winddown");
      }
    };

    const t = setInterval(check, 30 * 1000);
    check();
    return () => clearInterval(t);
  }, []);

  return null;
}
