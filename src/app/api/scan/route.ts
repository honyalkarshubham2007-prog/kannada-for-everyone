import { NextResponse } from "next/server";
import { classifyError, scanGemini } from "@/lib/server/gemini";
import { allow } from "@/lib/server/cache";

export const runtime = "nodejs";
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BASE64 = 2_000_000; // about 1.5 MB of image; the browser shrinks photos well below this

// POST { image: base64 (no data: prefix), mime } -> AIScan. The photo is passed to Gemini and not stored.
export async function POST(req: Request) {
  let b: any;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }
  const image = typeof b?.image === "string" ? b.image : "";
  if (!image || !TYPES.includes(b?.mime)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  if (image.length > MAX_BASE64) return NextResponse.json({ error: "too_large" }, { status: 413 });
  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allow(`scan:${ip}`, 6)) return NextResponse.json({ error: "rate" }, { status: 429 });

  try {
    return NextResponse.json(await scanGemini(b.mime, image));
  } catch (e) {
    const kind = classifyError(e);
    if (kind === "quota") return NextResponse.json({ error: "quota" }, { status: 429 });
    console.error("Gemini scan error:", e);
    return NextResponse.json({ error: kind }, { status: 502 });
  }
}
