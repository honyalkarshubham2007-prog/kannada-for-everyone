"use client";
import { useState } from "react";
import { ArrowLeft, Flame, Headphones, Layers, Mic, Repeat } from "lucide-react";
import Flashcards from "./Flashcards";
import Quiz from "./Quiz";
import SayIt from "./SayIt";
import { allPhrases, findPhrase, situations } from "@/lib/phrases";
import { shuffle } from "@/lib/practice";
import { todayKey, useProgress, useSaved } from "@/lib/storage";
import type { Phrase } from "@/lib/types";

type Mode = "flash" | "quiz" | "say";
const MODES = [
  { id: "flash" as const, title: "Flashcards", blurb: "See the Kannada, recall the meaning.", Icon: Layers },
  { id: "quiz" as const, title: "Listen and pick", blurb: "Hear it, choose what it means.", Icon: Headphones },
  { id: "say" as const, title: "Say it", blurb: "Speak the phrase and get a check.", Icon: Mic },
];

export default function PracticeView() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [deck, setDeck] = useState("smart");
  const [session, setSession] = useState<{ pool: Phrase[]; key: number }>({ pool: [], key: 0 });
  const saved = useSaved();
  const progress = useProgress();

  const lookup = (id: string) => findPhrase(id) ?? saved.custom[id];
  const today = todayKey();
  const dueIds = Object.entries(progress.srs).filter(([, v]) => v.due <= today)
    .sort((a, b) => a[1].box - b[1].box || a[1].due.localeCompare(b[1].due)).map(([id]) => id); // weakest and most overdue first
  const allSeen = Object.keys(progress.srs).length >= allPhrases.length;

  // Smart review: what's due first, then phrases you haven't tried yet. Built once per session.
  const buildPool = (): Phrase[] => {
    if (deck === "smart") {
      const seen = new Set(Object.keys(progress.srs));
      const fresh = shuffle(allPhrases.filter((p) => !seen.has(p.id)));
      return [...(dueIds.map(lookup).filter(Boolean) as Phrase[]), ...fresh].slice(0, 10);
    }
    if (deck === "all") return allPhrases;
    if (deck === "saved") return saved.ids.map(lookup).filter(Boolean) as Phrase[];
    return situations.find((s) => s.id === deck)?.phrases ?? [];
  };

  const empty = !saved.ready ? false : deck === "saved" ? saved.ids.length === 0 : deck === "smart" ? dueIds.length === 0 && allSeen : false;
  const start = (m: Mode) => { setSession((s) => ({ pool: buildPool(), key: s.key + 1 })); setMode(m); };

  if (mode) {
    const props = { pool: session.pool, record: progress.record, onExit: () => setMode(null), ordered: deck === "smart" };
    return (
      <main className="mx-auto max-w-md px-5 pt-8">
        <button className="mb-4 inline-flex min-h-[44px] items-center gap-1 text-sm text-muted hover:text-ink" onClick={() => setMode(null)}>
          <ArrowLeft size={16} aria-hidden /> Back to practice
        </button>
        {mode === "flash" && <Flashcards key={session.key} {...props} />}
        {mode === "quiz" && <Quiz key={session.key} {...props} />}
        {mode === "say" && <SayIt key={session.key} {...props} />}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md space-y-6 px-5 pt-10">
      <header>
        <h1 className="text-[1.75rem] font-semibold leading-tight">Practice</h1>
        <p className="mt-1 text-muted">Ten minutes a day beats an hour on Sunday.</p>
      </header>

      <section className="surface space-y-3 p-4" aria-label="Your progress">
        <div className="flex items-center gap-4">
          <Flame size={28} className={progress.streak ? "text-turmeric" : "text-stone"} aria-hidden />
          <div>
            <p className="font-medium">{progress.streak ? `${progress.streak}-day streak` : "No streak yet"}</p>
            <p className="text-sm text-muted">
              {progress.learned.length} {progress.learned.length === 1 ? "phrase" : "phrases"} learned
              {progress.streak && !progress.practisedToday ? " · practise today to keep it going" : ""}
              {!progress.streak ? " · practise today to start one" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 border-t border-line pt-3">
          <Repeat size={24} className="text-silk" aria-hidden />
          <p className="text-sm"><span className="font-medium">{dueIds.length} due for review today.</span> <span className="text-muted">Phrases you miss come back sooner. Ones you know wait longer.</span></p>
        </div>
      </section>

      <div>
        <label htmlFor="deck" className="mb-2 block text-sm font-medium">Practise from</label>
        <select id="deck" value={deck} onChange={(e) => setDeck(e.target.value)} className="surface h-12 w-full px-3">
          <option value="smart">Smart review ({dueIds.length} due)</option>
          <option value="all">All phrases ({allPhrases.length})</option>
          <option value="saved">My saved phrases ({saved.ids.length})</option>
          {situations.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.phrases.length})</option>)}
        </select>
      </div>

      {empty && (
        <p className="surface p-4 text-sm" role="status">
          {deck === "smart" ? "Nothing is due today. Nice. Practise any other set, or come back tomorrow." : "Nothing saved yet. Tap Save on a phrase, or pick another set above."}
        </p>
      )}

      <ul className="surface divide-y divide-line overflow-hidden">
        {MODES.map(({ id, title, blurb, Icon }) => (
          <li key={id}>
            <button disabled={empty || !saved.ready} onClick={() => start(id)}
              className="flex min-h-[72px] w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-line/40 disabled:opacity-50">
              <Icon size={22} className="shrink-0 text-silk" aria-hidden />
              <span><span className="block font-medium">{title}</span><span className="text-sm text-muted">{blurb}</span></span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
