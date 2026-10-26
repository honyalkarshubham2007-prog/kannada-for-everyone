"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PhraseCard from "./PhraseCard";
import SearchBar from "./SearchBar";
import { aiRelatedToPhrases, aiToPhrase, relatedFromSeed, searchSeed } from "@/lib/search";
import { getCachedAnswer, setCachedAnswer } from "@/lib/storage";
import { normalise } from "@/lib/text";
import type { AIAnswer, Phrase } from "@/lib/types";

type Err = "quota" | "rate" | "not_configured" | "offline" | "server" | "model" | "key";
type View = { status: "idle" | "loading" | "done"; strong: Phrase[]; loose: Phrase[]; ai: AIAnswer | null; err: Err | null };
const EMPTY: View = { status: "idle", strong: [], loose: [], ai: null, err: null };

// Plain-language errors: what happened and what to do.
const MESSAGES: Record<Err, string> = {
  model: "The AI model named in GEMINI_MODEL isn't available any more. Set GEMINI_MODEL=gemini-3.5-flash in .env.local and restart.",
  key: "Google rejected the API key. Copy it again into .env.local (no quotes or spaces) and restart.",
  quota: "The AI has reached its free limit for now. Here are the closest phrases from the phrasebook. Try again in a minute.",
  rate: "That's a lot of lookups at once. Wait a few seconds and try again.",
  not_configured: "AI lookup isn't switched on for this site yet (no GEMINI_API_KEY). The phrasebook still works.",
  offline: "You seem to be offline. Showing what the phrasebook has.",
  server: "The AI didn't answer this time. Try again, or browse Situations.",
};
const IDEAS = ["bus", "how much", "thank you", "toilet", "stop here", "less spicy"];

export default function SearchView() {
  const q = useSearchParams().get("q")?.trim() ?? "";
  const [view, setView] = useState<View>(EMPTY);
  const ticket = useRef(0); // ignore answers from an older search

  const run = useCallback(async (query: string, forceAI: boolean) => {
    const me = ++ticket.current;
    const seed = searchSeed(query);
    // 1) Seed data first: free, instant, works offline.
    if (!forceAI && seed.strong.length) { setView({ status: "done", strong: seed.strong, loose: seed.loose, ai: null, err: null }); return; }
    setView({ status: "loading", strong: forceAI ? seed.strong : [], loose: seed.loose, ai: null, err: null });
    // 2) Browser cache, 3) the server route (which has its own cache, then Gemini).
    const key = normalise(query);
    const cached = getCachedAnswer(key);
    if (cached) { setView((v) => ({ ...v, status: "done", ai: cached })); return; }
    try {
      const res = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
      const data = await res.json().catch(() => ({}));
      if (me !== ticket.current) return;
      if (!res.ok) {
        const err: Err = res.status === 429 ? (data.error === "rate" ? "rate" : "quota") : res.status === 503 ? "not_configured" : data.error === "model" || data.error === "key" ? data.error : "server";
        setView((v) => ({ ...v, status: "done", err }));
        return;
      }
      setCachedAnswer(key, data as AIAnswer);
      setView((v) => ({ ...v, status: "done", ai: data as AIAnswer }));
    } catch {
      if (me === ticket.current) setView((v) => ({ ...v, status: "done", err: "offline" }));
    }
  }, []);

  useEffect(() => { if (q) run(q, false); else { ticket.current++; setView(EMPTY); } }, [q, run]);

  const top = view.strong[0];
  const seedRelated = top ? relatedFromSeed(top, view.strong.map((p) => p.id)) : [];

  return (
    <main className="mx-auto max-w-md space-y-6 px-5 pt-10">
      <h1 className="text-[1.75rem] font-semibold leading-tight">Look up</h1>
      <SearchBar key={q} initial={q} />

      {!q && (
        <section>
          <p className="mb-3 text-muted">Type English, or Kannada written in English letters. Try one of these:</p>
          <div className="flex flex-wrap gap-2">
            {IDEAS.map((i) => <Link key={i} href={`/search?q=${encodeURIComponent(i)}`} className="chip">{i}</Link>)}
          </div>
        </section>
      )}

      {view.status === "loading" && (
        <div className="space-y-3" aria-live="polite" aria-label="Looking that up">
          <div className="h-36 animate-pulse rounded-xl2 bg-line/50" />
          <p className="text-sm text-muted">Asking the coach…</p>
        </div>
      )}

      {view.err && <p role="alert" className="surface border-silk/40 p-4 text-sm">{MESSAGES[view.err]}</p>}

      {view.strong.length > 0 && (
        <section className="space-y-3" aria-labelledby="found">
          <h2 id="found" className="text-base font-semibold">In the phrasebook</h2>
          {view.strong.map((p) => <PhraseCard key={p.id} phrase={p} />)}
          {seedRelated.length > 0 && (
            <>
              <h2 className="pt-3 text-base font-semibold">People who look up &ldquo;{q}&rdquo; also need</h2>
              {seedRelated.map((p) => <PhraseCard key={p.id} phrase={p} />)}
            </>
          )}
        </section>
      )}

      {view.ai && (view.ai.kannada ? (
        <section className="space-y-3" aria-labelledby="ai">
          <h2 id="ai" className="text-base font-semibold">From the coach</h2>
          <PhraseCard phrase={aiToPhrase(view.ai)} />
          {view.ai.related_phrases.length > 0 && (
            <>
              <h2 className="pt-3 text-base font-semibold">People who look up &ldquo;{q}&rdquo; also need</h2>
              {aiRelatedToPhrases(view.ai).map((p) => <PhraseCard key={p.id} phrase={p} />)}
            </>
          )}
        </section>
      ) : (
        <section className="surface p-5">
          <p className="font-medium">I&apos;m not sure about that one.</p>
          <p className="mt-1 text-sm text-muted">{view.ai.usage_tip || "Try different words, or a shorter phrase."}</p>
          <Link href="/situations" className="btn-primary mt-4">Browse situations</Link>
        </section>
      ))}

      {view.err && view.strong.length === 0 && view.loose.length > 0 && (
        <section className="space-y-3" aria-labelledby="close">
          <h2 id="close" className="text-base font-semibold">Closest in the phrasebook</h2>
          {view.loose.map((p) => <PhraseCard key={p.id} phrase={p} />)}
        </section>
      )}

      {view.status === "done" && !view.ai && !view.err && view.strong.length > 0 && (
        <button className="chip w-full justify-center" onClick={() => run(q, true)}>Not what you meant? Ask the AI instead</button>
      )}
    </main>
  );
}
