"use client";
import { useRef, useState } from "react";
import { Camera, Image as ImageIcon } from "lucide-react";
import PhraseCard from "./PhraseCard";
import { aiPhrase } from "@/lib/search";
import type { AIScan } from "@/lib/types";

type Err = "quota" | "rate" | "not_configured" | "offline" | "server" | "model" | "key" | "bad_image";
const MESSAGES: Record<Err, string> = {
  quota: "The AI has reached its free limit for now. Try again in a minute.",
  rate: "That's a lot of photos at once. Wait a few seconds and try again.",
  not_configured: "Sign reading isn't switched on yet: this site has no GEMINI_API_KEY (steps are in the README).",
  offline: "You seem to be offline. Reading a sign needs an internet connection.",
  server: "The AI couldn't read that photo. Try again.",
  model: "The AI model named in GEMINI_MODEL isn't available any more. Set GEMINI_MODEL=gemini-3.5-flash in .env.local and restart.",
  key: "Google rejected the API key. Copy it again into .env.local (no quotes or spaces) and restart.",
  bad_image: "That file couldn't be opened as a photo. Try another one.",
};

// Shrinks the photo in the browser (max 1280px, JPEG) so it uploads fast and stays inside API limits.
async function shrink(file: File): Promise<{ base64: string; preview: string }> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image(); img.src = url; await img.decode();
    const scale = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    const preview = c.toDataURL("image/jpeg", 0.8);
    return { base64: preview.split(",")[1], preview };
  } finally { URL.revokeObjectURL(url); }
}

export default function ScanView() {
  const [state, setState] = useState<"idle" | "working" | "done">("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AIScan | null>(null);
  const [err, setErr] = useState<Err | null>(null);
  const last = useRef<{ base64: string } | null>(null);

  const send = async (base64: string) => {
    setState("working"); setErr(null); setResult(null);
    try {
      const res = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: base64, mime: "image/jpeg" }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setErr(res.status === 429 ? (data.error === "rate" ? "rate" : "quota") : res.status === 503 ? "not_configured" : res.status === 413 ? "bad_image" : data.error === "model" || data.error === "key" ? data.error : "server");
      else setResult(data as AIScan);
    } catch { setErr("offline"); }
    finally { setState("done"); }
  };

  const pick = async (file?: File) => {
    if (!file) return;
    try {
      const { base64, preview } = await shrink(file);
      last.current = { base64 }; setPreview(preview);
      await send(base64);
    } catch { setErr("bad_image"); setState("done"); }
  };

  return (
    <main className="mx-auto max-w-md space-y-6 px-5 pt-10">
      <header>
        <h1 className="text-[1.75rem] font-semibold leading-tight">Read a sign</h1>
        <p className="mt-1 text-muted">Point your camera at a bus board, shop sign or notice. I&apos;ll read the Kannada for you.</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <label className="btn-primary cursor-pointer justify-center focus-within:outline focus-within:outline-2">
          <Camera size={20} aria-hidden /> Take a photo
          <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        </label>
        <label className="chip cursor-pointer justify-center focus-within:outline focus-within:outline-2">
          <ImageIcon size={18} aria-hidden /> Choose a photo
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        </label>
      </div>
      <p className="text-xs text-muted">Your photo is sent to Google&apos;s Gemini API to read the sign. This app doesn&apos;t save it.</p>

      {preview && <img src={preview} alt="The photo you chose" className="max-h-56 w-full rounded-xl2 border border-line object-cover" />}
      {state === "working" && <div className="h-32 animate-pulse rounded-xl2 bg-line/50" aria-label="Reading the sign" />}

      <div aria-live="polite" className="space-y-4">
        {err && (
          <div role="alert" className="surface space-y-3 border-silk/40 p-4">
            <p className="text-sm">{MESSAGES[err]}</p>
            {last.current && err !== "not_configured" && err !== "bad_image" && <button className="chip" onClick={() => send(last.current!.base64)}>Try again</button>}
          </div>
        )}
        {result && !result.found && (
          <p className="surface p-4 text-sm">I couldn&apos;t find Kannada text I could read. Move closer, hold the phone steady and use good light.</p>
        )}
        {result?.found && (
          <>
            <h2 className="text-base font-semibold">What the sign says</h2>
            <PhraseCard phrase={aiPhrase(result.kannada, result.transliteration, result.meaning_english, result.usage_tip)} />
            {result.other_text.length > 0 && (
              <>
                <h2 className="pt-2 text-base font-semibold">Other text on it</h2>
                {result.other_text.map((t) => <PhraseCard key={t.kannada} phrase={aiPhrase(t.kannada, t.transliteration, t.meaning_english)} />)}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
