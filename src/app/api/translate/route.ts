import { NextResponse } from "next/server";
import { askGemini, classifyError } from "@/lib/server/gemini";
import { allow, getAnswer, setAnswer } from "@/lib/server/cache";
import { normalise } from "@/lib/text";

export const runtime = "nodejs";

// POST { query } -> AIAnswer. The browser checks the seed phrasebook and its own cache first,
// so this only runs for things the phrasebook can't answer.
export async function POST(req: Request) {
  let query = "";
  try { query = String((await req.json())?.query ?? "").trim().slice(0, 120); } catch { /* fall through */ }
  if (!query) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const key = normalise(query);
  const hit = getAnswer(key);
  if (hit) return NextResponse.json(hit);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allow(ip)) return NextResponse.json({ error: "rate" }, { status: 429 });

  try {
    const answer = await askGemini(query);
    setAnswer(key, answer);
    return NextResponse.json(answer);
  } catch (e) {
    const kind = classifyError(e);
    if (kind === "quota") return NextResponse.json({ error: "quota" }, { status: 429 });
    console.error("Gemini error:", e);
    return NextResponse.json({ error: kind }, { status: 502 });
  }
}
