"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Camera, ChevronRight } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import ListenButton from "@/components/ListenButton";
import SearchBar from "@/components/SearchBar";
import { phraseOfTheDay, situations } from "@/lib/phrases";
import { situationIcons } from "@/lib/icons";
import { getLastSituation, useSaved } from "@/lib/storage";
import type { PhraseWithSituation } from "@/lib/types";

export default function HomePage() {
  // Chosen after mount so server and client HTML always match.
  const [today, setToday] = useState<PhraseWithSituation | null>(null);
  const [last, setLast] = useState<string | null>(null);
  const saved = useSaved();
  useEffect(() => { setToday(phraseOfTheDay()); setLast(getLastSituation()); }, []);

  const lastSituation = situations.find((s) => s.id === last);

  return (
    <main className="mx-auto max-w-md space-y-8 px-5 pt-10">
      <header className="flex items-start justify-between gap-3">
        <div>
        <h1 className="text-[1.75rem] font-semibold leading-tight">Namaskara.</h1>
        <p className="mt-1 text-muted">Learn the Kannada you need today.</p>
      </div>
        <ThemeToggle />
      </header>

      <section aria-labelledby="today" className="surface p-5">
        <h2 id="today" className="text-sm font-medium text-muted">Today&apos;s phrase</h2>
        {today ? (
          <>
            <p className="kn-lg mt-3">{today.kn}</p>
            <p className="mt-1 text-lg">{today.tr}</p>
            <p className="text-muted">{today.en}</p>
            {today.tip && <p className="mt-3 border-l-2 border-turmeric pl-3 text-sm">{today.tip}</p>}
            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="flex-1"><ListenButton text={today.kn} id={today.id} /></div>
              <button className="btn-icon" onClick={() => saved.toggle(today.id)}
                aria-label={saved.has(today.id) ? "Remove from saved" : "Save phrase"}>
                {saved.has(today.id) ? <BookmarkCheck size={20} className="text-silk" /> : <Bookmark size={20} />}
              </button>
                          </div>
          </>
        ) : <div className="mt-3 h-32 animate-pulse rounded-lg bg-line/50" aria-label="Loading today's phrase" />}
      </section>

      <SearchBar />

      <Link href="/scan" className="chip w-full justify-center"><Camera size={18} className="text-silk" aria-hidden />Read a sign with your camera</Link>

      <section aria-labelledby="sits">
        <h2 id="sits" className="mb-3 text-base font-semibold">Where do you need Kannada?</h2>
        <div className="flex flex-wrap gap-2">
          {situations.map((s) => {
            const Icon = situationIcons[s.icon];
            return (
              <Link key={s.id} href={`/situations/${s.id}`} className="chip">
                <Icon size={18} className="text-silk" aria-hidden />{s.name}
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="cont">
        <h2 id="cont" className="mb-3 text-base font-semibold">Continue where you left off</h2>
        {lastSituation ? (
          <Link href={`/situations/${lastSituation.id}`} className="surface flex items-center justify-between p-4">
            <span><span className="kn-md block">{lastSituation.kn}</span><span className="text-muted">{lastSituation.name}</span></span>
            <ChevronRight className="text-muted" />
          </Link>
        ) : (
          <p className="surface p-4 text-muted">Nothing yet. Pick a situation above and your place will be saved here.</p>
        )}
      </section>
    </main>
  );
}
