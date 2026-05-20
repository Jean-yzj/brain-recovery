import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const token = (session as unknown as { accessToken?: string })?.accessToken;
  if (!token) {
    return Response.json({ error: "unauth" }, { status: 401 });
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const url = new URL(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events"
  );
  url.searchParams.set("timeMin", start.toISOString());
  url.searchParams.set("timeMax", end.toISOString());
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "50");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text();
    return Response.json({ error: "google_error", detail: txt }, { status: res.status });
  }
  const data = await res.json();
  const events = (data.items ?? []).map((e: {
    id: string;
    summary?: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
    htmlLink?: string;
    location?: string;
    description?: string;
  }) => ({
    id: e.id,
    summary: e.summary ?? "(無標題)",
    start: e.start?.dateTime ?? e.start?.date,
    end: e.end?.dateTime ?? e.end?.date,
    allDay: !!e.start?.date && !e.start?.dateTime,
    location: e.location,
    description: e.description,
    htmlLink: e.htmlLink,
  }));
  return Response.json({ events });
}
