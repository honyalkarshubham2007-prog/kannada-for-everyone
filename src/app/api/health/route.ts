import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Open /api/health to check the setup. It reports whether a key is present, never the key itself.
export function GET() {
  return NextResponse.json({
    geminiKeyFound: Boolean(process.env.GEMINI_API_KEY),
    model: process.env.GEMINI_MODEL || "gemini-3.5-flash (default)",
  });
}
