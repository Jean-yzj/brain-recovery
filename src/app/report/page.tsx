"use client";

import { useEffect, useState } from "react";
import { load, pushChat, update } from "@/lib/storage";
import { AppData } from "@/lib/types";
import { fallbackReport, summarizeForAI } from "@/lib/summarize";
import Markdown from "@/components/Markdown";
import { Sparkles, Send, RefreshCw, KeyRound } from "lucide-react";
import Link from "next/link";
import ClientOnly from "@/components/ClientOnly";

function ReportInner() {
  const [data, setData] = useState<AppData>(load());
  const [tab, setTab] = useState<"report" | "chat">("report");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [input, setInput] = useState("");

  useEffect(() => {
    const onUpdate = () => setData(load());
    window.addEventListener("brain-recovery:update", onUpdate);
    return () => window.removeEventListener("brain-recovery:update", onUpdate);
  }, []);

  useEffect(() => {
    setReport(data.weeklyReports[0]?.markdown ?? "");
  }, [data.weeklyReports]);

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const summary = summarizeForAI(load());
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ summary, userKey: data.settings.apiKey }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "unknown" }));
        if (err.error === "missing_key") {
          // fallback locally
          const md = fallbackReport(load());
          setReport(md);
          update((d) => {
            d.weeklyReports.unshift({
              weekOf: new Date().toISOString().slice(0, 10),
              markdown: md,
              createdAt: Date.now(),
            });
            if (d.weeklyReports.length > 12) d.weeklyReports.length = 12;
          });
          setError("沒有 API Key，已產出基本版報告。設定 API Key 可獲得 AI 整理。");
          return;
        }
        throw new Error(err.message || err.error);
      }
      const { markdown } = await res.json();
      setReport(markdown);
      update((d) => {
        d.weeklyReports.unshift({
          weekOf: new Date().toISOString().slice(0, 10),
          markdown,
          createdAt: Date.now(),
        });
        if (d.weeklyReports.length > 12) d.weeklyReports.length = 12;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "產生失敗，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  const sendChat = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    pushChat({ role: "user", content: text, ts: Date.now() });
    setLoading(true);
    setError("");
    try {
      const cur = load();
      const summary = summarizeForAI(cur);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          summary,
          userKey: cur.settings.apiKey,
          messages: [...cur.chat.map((m) => ({ role: m.role, content: m.content }))],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "unknown" }));
        if (err.error === "missing_key") {
          pushChat({
            role: "assistant",
            content:
              "目前還沒有設定 API Key。請到設定頁加入你的 Anthropic API Key，我才能回應你。",
            ts: Date.now(),
          });
        } else {
          throw new Error(err.message || err.error);
        }
      } else {
        const { reply } = await res.json();
        pushChat({ role: "assistant", content: reply, ts: Date.now() });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "傳送失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="pt-2">
        <div className="text-sm text-ink-500">AI 大腦狀態整理</div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {tab === "report" ? "本週報告" : "和大腦助理聊聊"}
        </h1>
      </div>

      <div className="flex gap-1.5 p-1 rounded-full bg-ink-100 dark:bg-ink-800 w-fit">
        <button
          onClick={() => setTab("report")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            tab === "report" ? "bg-white dark:bg-ink-900 shadow-sm" : "text-ink-500"
          }`}
        >
          每週報告
        </button>
        <button
          onClick={() => setTab("chat")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            tab === "chat" ? "bg-white dark:bg-ink-900 shadow-sm" : "text-ink-500"
          }`}
        >
          AI 助理
        </button>
      </div>

      {!data.settings.apiKey && !process.env.NEXT_PUBLIC_HAS_KEY && (
        <Link
          href="/settings"
          className="card flex items-center justify-between hover:shadow-md transition"
        >
          <div>
            <div className="text-sm font-medium flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> 加入你的 Anthropic API Key
            </div>
            <div className="text-xs text-ink-500 mt-1">
              不設定也能用基本版報告。AI 整理需要 Key，存在你的瀏覽器，不會上傳。
            </div>
          </div>
        </Link>
      )}

      {error && (
        <div className="card border-warm-300 bg-warm-50 dark:bg-warm-500/10 text-sm">
          {error}
        </div>
      )}

      {tab === "report" && (
        <>
          {report ? (
            <div className="card">
              <Markdown>{report}</Markdown>
            </div>
          ) : (
            <div className="card text-sm text-ink-500">
              還沒有報告。按下方按鈕，把你的紀錄整理成本週洞察。
            </div>
          )}
          <button
            onClick={generate}
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> 整理中…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> {report ? "重新產出本週報告" : "產出本週報告"}
              </>
            )}
          </button>
        </>
      )}

      {tab === "chat" && (
        <>
          <div className="space-y-3 min-h-[200px]">
            {data.chat.length === 0 && (
              <div className="card text-sm text-ink-500">
                你可以跟我說：
                <br />「我今天好累，但又睡不著。」
                <br />「我最近一直滑手機停不下來。」
                <br />「我下午就想吃甜的，是不是壓力太大？」
              </div>
            )}
            {data.chat.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-calm-700 text-white rounded-br-sm"
                      : "bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-bl-sm"
                  }`}
                >
                  {m.role === "assistant" ? <Markdown>{m.content}</Markdown> : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-ink-500 animate-pulse">大腦助理整理中…</div>
            )}
          </div>
          <div className="sticky bottom-16 -mx-4 px-4 py-2 bg-gradient-to-t from-white via-white/90 dark:from-ink-950 dark:via-ink-950/90 to-transparent">
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendChat();
                  }
                }}
                placeholder="想跟大腦助理說什麼？"
                rows={2}
                className="input flex-1 resize-none"
              />
              <button
                onClick={sendChat}
                disabled={loading || !input.trim()}
                className="btn-primary disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <ClientOnly>
      <ReportInner />
    </ClientOnly>
  );
}
