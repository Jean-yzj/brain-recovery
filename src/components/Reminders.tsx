"use client";

import { useEffect, useState } from "react";
import { load, update } from "@/lib/storage";
import { Bell, BellOff } from "lucide-react";

const DEFAULTS = {
  morningCheckin: "09:00",
  afternoonPause: "15:00",
  windDown: "22:30",
};

export default function Reminders() {
  const [enabled, setEnabled] = useState(false);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");
  const [times, setTimes] = useState(DEFAULTS);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) {
      setPerm("unsupported");
      return;
    }
    setPerm(Notification.permission);
    const d = load();
    const r = d.settings.reminders;
    if (r) {
      setEnabled(r.enabled);
      setTimes({
        morningCheckin: r.morningCheckin || DEFAULTS.morningCheckin,
        afternoonPause: r.afternoonPause || DEFAULTS.afternoonPause,
        windDown: r.windDown || DEFAULTS.windDown,
      });
    }
  }, []);

  const requestPerm = async () => {
    if (perm === "unsupported") return;
    const r = await Notification.requestPermission();
    setPerm(r);
    if (r === "granted") setEnabled(true);
  };

  const persist = (next: { enabled: boolean; times: typeof DEFAULTS }) => {
    update((d) => {
      d.settings.reminders = {
        enabled: next.enabled,
        morningCheckin: next.times.morningCheckin,
        afternoonPause: next.times.afternoonPause,
        windDown: next.times.windDown,
      };
    });
  };

  const toggleEnabled = async () => {
    if (!enabled) {
      if (perm !== "granted") {
        await requestPerm();
        if (Notification.permission !== "granted") return;
      }
      setEnabled(true);
      persist({ enabled: true, times });
    } else {
      setEnabled(false);
      persist({ enabled: false, times });
    }
  };

  const setTime = (key: keyof typeof DEFAULTS, val: string) => {
    const next = { ...times, [key]: val };
    setTimes(next);
    persist({ enabled, times: next });
  };

  if (perm === "unsupported") {
    return (
      <div className="card space-y-2">
        <div className="text-sm font-medium flex items-center gap-2">
          <BellOff className="h-4 w-4" /> 提醒
        </div>
        <p className="text-xs text-ink-500">這個瀏覽器不支援通知。建議在桌面 Chrome 或 Safari 上使用。</p>
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium flex items-center gap-2">
            {enabled ? <Bell className="h-4 w-4 text-calm-700" /> : <BellOff className="h-4 w-4" />}
            溫和的提醒
          </div>
          <p className="text-xs text-ink-500 mt-1">
            只在你開著這個 App 的分頁時提醒。不會打擾。
          </p>
        </div>
        <button onClick={toggleEnabled} className={enabled ? "btn-primary" : "btn-ghost"}>
          {enabled ? "已開啟" : "開啟通知"}
        </button>
      </div>

      {enabled && (
        <div className="space-y-3 pt-2 border-t border-ink-200/60 dark:border-ink-800">
          <Row label="早上打卡" value={times.morningCheckin} onChange={(v) => setTime("morningCheckin", v)} />
          <Row label="下午 Brain Pause" value={times.afternoonPause} onChange={(v) => setTime("afternoonPause", v)} />
          <Row label="睡前儀式" value={times.windDown} onChange={(v) => setTime("windDown", v)} />
          <p className="text-[11px] text-ink-400">
            提示：你需要保留一個 App 的分頁在背景。瀏覽器全關時，提醒會暫停。
          </p>
        </div>
      )}

      {!enabled && perm === "denied" && (
        <p className="text-xs text-warm-500">
          你的瀏覽器已封鎖通知。請到瀏覽器設定開啟此網站的通知權限。
        </p>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm">{label}</div>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input w-32 text-center"
      />
    </div>
  );
}
