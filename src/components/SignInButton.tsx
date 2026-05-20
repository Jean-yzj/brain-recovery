"use client";

import { useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { LogIn, LogOut, AlertCircle } from "lucide-react";

interface SessionLike {
  user?: { name?: string | null; email?: string | null; image?: string | null };
  error?: string;
  hasIntegrationAccess?: boolean;
}

interface Props {
  variant?: "default" | "card";
  provider?: "google" | "google-integration";
  callbackUrl?: string;
}

export default function SignInButton({
  variant = "default",
  provider = "google",
  callbackUrl,
}: Props) {
  const [session, setSession] = useState<SessionLike | null>(null);
  const [loading, setLoading] = useState(true);
  const targetCallbackUrl = callbackUrl ?? (variant === "card" ? "/schedule" : "/settings");

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
        <button
          type="button"
          onClick={() => signIn(provider, { callbackUrl: targetCallbackUrl })}
          className="card flex items-center justify-between hover:shadow-md transition"
        >
          <div>
            <div className="text-sm font-medium flex items-center gap-2">
              <LogIn className="h-4 w-4" /> 連接 Google 行事曆 / Tasks
            </div>
            <div className="text-xs text-ink-500 mt-1">
              只有在你要排入行事曆或提醒事項時，才會要求這兩個額外權限。
            </div>
          </div>
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={() => signIn(provider, { callbackUrl: targetCallbackUrl })}
        className="btn-primary"
      >
        <LogIn className="h-4 w-4" /> 用 Google 登入
      </button>
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
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/settings" })}
        className="btn-ghost px-3 py-1.5 text-xs"
      >
        <LogOut className="h-3.5 w-3.5" /> 登出
      </button>
    </div>
  );
}
