import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { summary, userKey } = body as { summary: unknown; userKey?: string };
  const apiKey = userKey || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "missing_key" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  const client = new Anthropic({ apiKey });

  const system = `你是一位溫和、不批判的「大腦狀態整理師」，靈感來自《大腦不疲勞》一書的 SHIFT 框架（睡眠 Sleep、激素 Hormones、發炎 Inflammation、食物 Food、科技使用 Technology）。

你的工作不是診斷或開處方，而是：
1. 整理使用者最近 7 天的紀錄，用日常語言講出來。
2. 找出 1–2 個明顯的模式（例如：「手機疲倦高的隔天，專注分數偏低」）。
3. 給 1 個本週可以做的微習慣（門檻越低越好）。

口吻：像一位懂得喘息的朋友，使用繁體中文。不要用「應該」「必須」這種命令語氣。
不要列出任何醫療診斷。如果使用者出現嚴重身體症狀，建議他去看醫生。

格式（Markdown）：
# 本週大腦疲勞報告

## 你這週的大腦狀態
（2–3 句，用一句話總結整體感受，不只是數字）

## 我看到的模式
（1–2 個具體觀察，可以引用數字）

## 下週只做這一件事
（一個很小的動作，3 分鐘以內，給出具體做法）

結尾用一句溫和的話收束。`;

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      system,
      messages: [
        {
          role: "user",
          content: `這是我最近 7–14 天的紀錄，請幫我整理一份本週的大腦疲勞報告：\n\n${JSON.stringify(summary, null, 2)}`,
        },
      ],
    });
    const text = msg.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("\n");
    return Response.json({ markdown: text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(
      JSON.stringify({ error: "api_error", message: msg }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
