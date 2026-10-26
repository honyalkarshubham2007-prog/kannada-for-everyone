"use client";
import { Bookmark, BookmarkCheck } from "lucide-react";
import ListenButton from "./ListenButton";
import { useSaved } from "@/lib/storage";
import type { Phrase } from "@/lib/types";

// One phrase: Kannada first and largest, then how it sounds, then what it means.
export default function PhraseCard({ phrase }: { phrase: Phrase }) {
  const { has, toggle } = useSaved();
  const saved = has(phrase.id);
  return (
    <article className="surface p-4">
      <p className="kn-md">{phrase.kn}</p>
      <p className="mt-0.5">{phrase.tr}</p>
      <p className="text-sm text-muted">{phrase.en}</p>
      {phrase.tip && <p className="mt-3 border-l-2 border-turmeric pl-3 text-sm">{phrase.tip}</p>}
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="flex-1"><ListenButton text={phrase.kn} id={phrase.id} /></div>
        <button onClick={() => toggle(phrase.id, phrase)} aria-pressed={saved} className="chip">
          {saved ? <BookmarkCheck size={18} className="text-silk" /> : <Bookmark size={18} />}
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </article>
  );
}
