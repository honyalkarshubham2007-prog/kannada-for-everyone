import { NextResponse } from "next/server";
import { chatGemini, classifyError } from "@/lib/server/gemini";
import { allow, getChat, setChat } from "@/lib/server/cache";
import { findScenario } from "@/lib/scenarios";
import { normalise } from "@/lib/text";
import type { ChatTurn } from "@/lib/types";

export const runtime = "nodejs";

// POST { mode: "ask" | "coach", scenario?, messages: [{ role, text }] } -> ChatReply
export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }

  const mode = body?.mode === "coach" ? "coach" : "ask";
  const scenario = mode === "coach" ? findScenario(body?.scenario) : undefined;
  if (mode === "coach" && !scenario) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  // Keep prompts short (free tier): last 8 turns, 300 characters each, starting on a user turn.
  let history: ChatTurn[] = (Array.isArray(body?.messages) ? body.messages : [])
    .filter((m: any) => (m?.role === "user" || m?.role === "model") && typeof m?.text === "string" && m.text.trim())
    .map((m: any) => ({ role: m.role, text: m.text.trim().slice(0, 300) })).slice(-8);
  while (history.length && history[0].role !== "user") history.shift();
  if (mode === "ask" && !history.length) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  if (history.length && history[history.length - 1].role !== "user") return NextResponse.json({ error: "bad_request" }, { status: 400 });

  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const cacheKey = mode === "ask" && history.length === 1 ? `ask|${normalise(history[0].text)}` : null;
  const hit = cacheKey ? getChat(cacheKey) : undefined;
  if (hit) return NextResponse.json(hit);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allow(`chat:${ip}`, 12)) return NextResponse.json({ error: "rate" }, { status: 429 });

  try {
    const reply = await chatGemini(mode, scenario, history);
    if (cacheKey) setChat(cacheKey, reply);
    return NextResponse.json(reply);
  } catch (e) {
    const kind = classifyError(e);
    if (kind === "quota") return NextResponse.json({ error: "quota" }, { status: 429 });
    console.error("Gemini chat error:", e);
    return NextResponse.json({ error: kind }, { status: 502 });
  }
}
