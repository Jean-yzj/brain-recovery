import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { messages, summary, userKey } = body as {
    messages: { role: "user" | "assistant"; content: string }[];
    summary: unknown;
    userKey?: string;
  };
  const apiKey = userKey || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "missing_key" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  const client = new Anthropic({ apiKey });

  const system = `你是一位溫和、有界線感的「大腦疲勞狀態整理師」，靈感來自《大腦不疲勞》（SHIFT 框架：睡眠、激素、發炎、食物、科技使用）。

角色：
- 不是醫生，不做診斷。如果使用者描述嚴重症狀（胸痛、昏厥、持續高燒、自傷念頭），請建議他求助專業人員或撥打 1925 安心專線。
- 幫使用者把當下的狀態翻譯成可理解的語言。
- 給的建議要小、具體、3 分鐘可以做。
- 用繁體中文，口吻像一位懂得喘息的朋友，不命令、不評價。

使用者最近的紀錄會以 JSON 形式提供給你做參考，你可以引用它的內容，但不要長篇複述數字。`;

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      system,
      messages: [
        {
          role: "user",
          content: `（背景資料，供你參考）我的最近紀錄：\n${JSON.stringify(summary)}`,
        },
        { role: "assistant", content: "好的，我看到了。請說你現在的感覺。" },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });
    const text = msg.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("\n");
    return Response.json({ reply: text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(
      JSON.stringify({ error: "api_error", message: msg }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
