"use client";
import Link from "next/link";
import PhraseCard from "@/components/PhraseCard";
import { allPhrases, findPhrase } from "@/lib/phrases";
import { useSaved } from "@/lib/storage";

// "My Phrasebook". Reads only local seed data, so it works offline once the page has been opened.
export default function SavedPage() {
  const { ids, custom, ready } = useSaved();
  const phrases = ids.map((id) => findPhrase(id) ?? custom[id]).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <main className="mx-auto max-w-md px-5 pt-10">
      <h1 className="text-[1.75rem] font-semibold leading-tight">My phrasebook</h1>
      <p className="mt-1 text-muted">Phrases you save live on this device and work offline.</p>

      {!ready ? (
        <div className="mt-6 h-40 animate-pulse rounded-xl2 bg-line/50" aria-label="Loading saved phrases" />
      ) : phrases.length === 0 ? (
        <div className="surface mt-6 p-5">
          <p className="font-medium">Nothing saved yet.</p>
          <p className="mt-1 text-sm text-muted">Tap Save on any phrase and it lands here. There are {allPhrases.length} to start with.</p>
          <Link href="/situations" className="btn-primary mt-4">Browse situations</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-muted">{phrases.length} saved</p>
          {phrases.map((p) => <PhraseCard key={p.id} phrase={p} />)}
        </div>
      )}
    </main>
  );
}
