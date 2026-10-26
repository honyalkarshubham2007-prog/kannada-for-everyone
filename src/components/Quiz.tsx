"use client";
import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import ListenButton from "./ListenButton";
import Summary from "./Summary";
import { distractors, shuffle } from "@/lib/practice";
import type { Phrase } from "@/lib/types";

// Hear the Kannada, pick what it means. The text is one tap away for devices with no Kannada voice.
export default function Quiz({ pool, record, onExit, ordered = false }: { pool: Phrase[]; record: (id: string, correct: boolean) => void; onExit: () => void; ordered?: boolean }) {
  const [round, setRound] = useState(0);
  const questions = useMemo(
    () => (ordered ? pool : shuffle(pool)).slice(0, 10).map((answer) => ({ answer, options: shuffle([answer, ...distractors(answer)]) })),
    [pool, round], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showText, setShowText] = useState(false);

  if (idx >= questions.length) {
    return <Summary score={score} total={questions.length} onExit={onExit}
      onAgain={ordered ? onExit : () => { setRound((r) => r + 1); setIdx(0); setScore(0); setPicked(null); setShowText(false); }} />;
  }
  const { answer, options } = questions[idx];
  const choose = (p: Phrase) => {
    if (picked) return;
    setPicked(p.id);
    if (p.id === answer.id) { setScore((s) => s + 1); record(answer.id, true); } else record(answer.id, false);
  };
  const next = () => { setIdx((i) => i + 1); setPicked(null); setShowText(false); };

  return (
    <section aria-label="Listen and pick">
      <p className="mb-2 text-sm text-muted">Question {idx + 1} of {questions.length}</p>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden><div className="h-full bg-silk" style={{ width: `${(idx / questions.length) * 100}%` }} /></div>
      <div className="surface p-5">
        <p className="font-medium">What does this mean?</p>
        <div className="mt-3"><ListenButton text={answer.kn} id={answer.id} /></div>
        {showText || picked ? <p className="kn-md mt-3">{answer.kn}</p>
          : <button className="chip mt-3" onClick={() => setShowText(true)}>Can&apos;t hear it? Show the text</button>}
      </div>
      <ul className="mt-4 space-y-2">
        {options.map((o) => {
          const right = picked && o.id === answer.id, wrong = picked === o.id && o.id !== answer.id;
          return (
            <li key={o.id}>
              <button onClick={() => choose(o)} disabled={Boolean(picked)}
                className={`flex min-h-[56px] w-full items-center justify-between gap-3 rounded-xl2 border px-4 py-3 text-left transition-colors ${right ? "border-turmeric bg-turmeric/15" : wrong ? "border-silk bg-silk/10" : "border-line bg-card hover:border-silk/50"}`}>
                <span>{o.en}</span>
                {right && <Check size={20} className="shrink-0 text-turmeric" aria-label="Correct answer" />}
                {wrong && <X size={20} className="shrink-0 text-silk" aria-label="Your answer, not correct" />}
              </button>
            </li>
          );
        })}
      </ul>
      {picked && (
        <div className="mt-4 space-y-3" aria-live="polite">
          <p className="font-medium">{picked === answer.id ? "Right." : "Not quite."} <span className="font-normal text-muted">{answer.tr}</span></p>
          <button className="btn-primary" onClick={next}>{idx + 1 === questions.length ? "See score" : "Next"}</button>
        </div>
      )}
    </section>
  );
}
