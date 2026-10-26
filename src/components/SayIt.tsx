"use client";
import { useMemo, useState } from "react";
import { Mic } from "lucide-react";
import ListenButton from "./ListenButton";
import Summary from "./Summary";
import { shuffle, similarity } from "@/lib/practice";
import { useRecognition } from "@/lib/recognition";
import type { Phrase } from "@/lib/types";

type Result = { heard: string; score: number };

// Say the phrase, the browser's speech recogniser (kn-IN) listens, we compare what it heard.
// This is an approximate check, not a pronunciation grade.
export default function SayIt({ pool, record, onExit, ordered = false }: { pool: Phrase[]; record: (id: string, correct: boolean) => void; onExit: () => void; ordered?: boolean }) {
  const [round, setRound] = useState(0);
  const deck = useMemo(() => (ordered ? pool : shuffle(pool)).slice(0, 5), [pool, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [idx, setIdx] = useState(0);
  const [great, setGreat] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { supported, listening, start } = useRecognition();

  if (idx >= deck.length) {
    return <Summary score={great} total={deck.length} onExit={onExit}
      onAgain={ordered ? onExit : () => { setRound((r) => r + 1); setIdx(0); setGreat(0); setResult(null); setError(null); }} />;
  }
  const p = deck[idx];
  const sayIt = () => {
    setResult(null); setError(null);
    start((alts) => {
      const best = alts.map((heard) => ({ heard, score: similarity(heard, p.kn) })).sort((a, b) => b.score - a.score)[0];
      setResult(best);
      if (best.score >= 0.8) { setGreat((g) => g + 1); record(p.id, true); } else record(p.id, false);
    }, setError);
  };
  const next = () => { setIdx((i) => i + 1); setResult(null); setError(null); };
  const verdict = !result ? "" : result.score >= 0.8 ? "That sounded right." : result.score >= 0.5 ? "Close. Listen again and try once more." : "Not yet. Listen again and try once more.";

  return (
    <section aria-label="Say it">
      <p className="mb-2 text-sm text-muted">Phrase {idx + 1} of {deck.length}</p>
      <div className="surface p-6 text-center">
        <p className="kn-lg">{p.kn}</p>
        <p className="mt-1 text-lg">{p.tr}</p>
        <p className="text-muted">{p.en}</p>
        <div className="mt-4 flex justify-center"><ListenButton text={p.kn} id={p.id} /></div>
      </div>

      {supported === false ? (
        <p className="surface mt-4 p-4 text-sm" role="status">This browser can&apos;t check speech. Chrome on Android or desktop works best. You can still listen, say it out loud, and move on.</p>
      ) : (
        <button className="btn-primary mt-4 w-full justify-center" onClick={sayIt} disabled={listening || supported === null}>
          <Mic size={20} aria-hidden /> {listening ? "Listening…" : result ? "Try again" : "Say it"}
        </button>
      )}

      <div aria-live="polite" className="mt-4 space-y-2">
        {error && <p role="alert" className="surface border-silk/40 p-4 text-sm">{error}</p>}
        {result && (
          <div className="surface p-4">
            <p className="font-medium">{verdict}</p>
            <p className="mt-1 text-sm text-muted">I heard: {result.heard || "nothing clear"}</p>
          </div>
        )}
      </div>
      {(result || error || supported === false) && (
        <button className="chip mt-3" onClick={next}>{idx + 1 === deck.length ? "See score" : "Next phrase"}</button>
      )}
    </section>
  );
}
