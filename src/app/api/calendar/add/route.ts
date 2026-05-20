import { NextRequest } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  const token = (session as unknown as { accessToken?: string })?.accessToken;
  if (!token) {
    return Response.json({ error: "unauth" }, { status: 401 });
  }

  const body = await req.json();
  const {
    summary,
    description,
    startISO,
    endISO,
    reminderMin = 5,
  } = body as {
    summary: string;
    description?: string;
    startISO: string;
    endISO: string;
    reminderMin?: number;
  };

  if (!summary || !startISO || !endISO) {
    return Response.json({ error: "missing_fields" }, { status: 400 });
  }

  const timeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Taipei";

  // Google Calendar event color ID 1 = Lavender 薰衣草
  // 由本 App 建立的事件統一用薰衣草色，方便在行事曆裡一眼識別
  const event = {
    summary,
    description: description ?? "由「大腦不疲勞」建立",
    start: { dateTime: startISO, timeZone },
    end: { dateTime: endISO, timeZone },
    colorId: "1",
    reminders: {
      useDefault: false,
      overrides: [{ method: "popup", minutes: reminderMin }],
    },
    source: {
      title: "大腦不疲勞",
      url: "https://brain-recovery.zeabur.app",
    },
  };

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const txt = await res.text();
    return Response.json(
      { error: "google_error", detail: txt },
      { status: res.status }
    );
  }
  const data = await res.json();
  return Response.json({
    id: data.id,
    htmlLink: data.htmlLink,
    start: data.start,
    end: data.end,
  });
}
