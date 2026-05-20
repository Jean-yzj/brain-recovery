import { NextRequest } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  const sessionData = session as unknown as {
    accessToken?: string;
    hasIntegrationAccess?: boolean;
  };
  const token = sessionData?.accessToken;
  if (!token) {
    return Response.json({ error: "unauth" }, { status: 401 });
  }
  if (!sessionData?.hasIntegrationAccess) {
    return Response.json({ error: "missing_scope" }, { status: 403 });
  }

  const body = await req.json();
  const { title, notes, dueISO } = body as {
    title: string;
    notes?: string;
    dueISO?: string;
  };

  if (!title) {
    return Response.json({ error: "missing_title" }, { status: 400 });
  }

  // Google Tasks API requires RFC 3339 with only date (no time) for `due`.
  let due: string | undefined;
  if (dueISO) {
    // pick midnight Z based on input
    const d = new Date(dueISO);
    d.setHours(0, 0, 0, 0);
    due = d.toISOString();
  }

  const task = {
    title,
    notes: notes ?? "由「大腦不疲勞」建立",
    due,
  };

  // Add to user's default task list (`@default`)
  const res = await fetch(
    "https://tasks.googleapis.com/tasks/v1/lists/@default/tasks",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
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
    title: data.title,
    due: data.due,
    selfLink: data.selfLink,
  });
}
