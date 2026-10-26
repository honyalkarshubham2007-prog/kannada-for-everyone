"use client";
import { useMemo, useState } from "react";
import ListenButton from "./ListenButton";
import Summary from "./Summary";
import { shuffle } from "@/lib/practice";
import type { Phrase } from "@/lib/types";

// See the Kannada, hear it, recall the meaning, then say whether you knew it.
export default function Flashcards({ pool, record, onExit, ordered = false }: { pool: Phrase[]; record: (id: string, correct: boolean) => void; onExit: () => void; ordered?: boolean }) {
  const [round, setRound] = useState(0);
  const deck = useMemo(() => (ordered ? pool : shuffle(pool)).slice(0, 10), [pool, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(false);
  const [known, setKnown] = useState(0);

  if (idx >= deck.length) {
    return <Summary score={known} total={deck.length} onExit={onExit}
      onAgain={ordered ? onExit : () => { setRound((r) => r + 1); setIdx(0); setKnown(0); setShown(false); }} />;
  }
  const p = deck[idx];
  const answer = (knew: boolean) => {
    record(p.id, knew);
    if (knew) setKnown((k) => k + 1);
    setIdx((i) => i + 1); setShown(false);
  };

  return (
    <section aria-label="Flashcards">
      <p className="mb-2 text-sm text-muted" aria-live="polite">Card {idx + 1} of {deck.length}</p>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden><div className="h-full bg-silk" style={{ width: `${(idx / deck.length) * 100}%` }} /></div>
      <div className="surface p-6 text-center">
        <p className="kn-lg">{p.kn}</p>
        <div className="mt-4 flex justify-center"><ListenButton text={p.kn} id={p.id} /></div>
        {shown ? (
          <div className="mt-5 border-t border-line pt-4">
            <p className="text-lg">{p.tr}</p>
            <p className="text-muted">{p.en}</p>
            {p.tip && <p className="mt-3 border-l-2 border-turmeric pl-3 text-left text-sm">{p.tip}</p>}
          </div>
        ) : <button className="btn-primary mt-5" onClick={() => setShown(true)}>Show meaning</button>}
      </div>
      {shown && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button className="chip justify-center" onClick={() => answer(false)}>Again</button>
          <button className="btn-primary justify-center" onClick={() => answer(true)}>Got it</button>
        </div>
      )}
    </section>
  );
}
