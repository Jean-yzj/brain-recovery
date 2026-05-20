"use client";

import { useEffect, useState } from "react";
import { LogIn, LogOut, AlertCircle } from "lucide-react";

interface SessionLike {
  user?: { name?: string | null; email?: string | null; image?: string | null };
  error?: string;
}

interface Props {
  variant?: "default" | "card";
}

export default function SignInButton({ variant = "default" }: Props) {
  const [session, setSession] = useState<SessionLike | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const data = await res.json();
      setSession(data && data.user ? data : null);
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  if (loading) {
    return <div className="text-xs text-ink-400">…</div>;
  }

  if (!session?.user) {
    if (variant === "card") {
      return (
        <a
          href="/api/auth/signin?callbackUrl=/schedule"
          className="card flex items-center justify-between hover:shadow-md transition"
        >
          <div>
            <div className="text-sm font-medium flex items-center gap-2">
              <LogIn className="h-4 w-4" /> 用 Google 登入
            </div>
            <div className="text-xs text-ink-500 mt-1">
              啟用「排入行事曆 / 提醒事項」功能。每個人只看到自己的資料。
            </div>
          </div>
        </a>
      );
    }
    return (
      <a href="/api/auth/signin?callbackUrl=/settings" className="btn-primary">
        <LogIn className="h-4 w-4" /> 用 Google 登入
      </a>
    );
  }

  const errored = session.error === "RefreshError";

  return (
    <div className="flex items-center gap-3">
      {session.user.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={session.user.image}
          alt=""
          className="w-9 h-9 rounded-full border border-ink-200 dark:border-ink-800"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {session.user.name || "已登入"}
        </div>
        <div className="text-xs text-ink-500 truncate">
          {session.user.email}
        </div>
        {errored && (
          <div className="flex items-center gap-1 text-[11px] text-warm-500 mt-0.5">
            <AlertCircle className="h-3 w-3" />
            授權過期，請重新登入
          </div>
        )}
      </div>
      <a
        href="/api/auth/signout?callbackUrl=/settings"
        className="btn-ghost px-3 py-1.5 text-xs"
      >
        <LogOut className="h-3.5 w-3.5" /> 登出
      </a>
    </div>
  );
}
