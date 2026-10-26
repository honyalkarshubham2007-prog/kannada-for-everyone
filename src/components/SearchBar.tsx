"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

// Submit-only (no call per keystroke) to respect the Gemini free tier.
// Phase 3 makes /search?q=... run seed-data lookup first, then Gemini.
export default function SearchBar({ initial = "" }: { initial?: string }) {
  const [q, setQ] = useState(initial);
  const router = useRouter();
  return (
    <form role="search" onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`); }}
      className="surface flex items-center gap-3 px-4">
      <Search size={20} className="text-muted" aria-hidden />
      <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search a word or phrase"
        placeholder="Type a word: bus, how much, thank you"
        className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted" />
      <button type="submit" className="btn-primary h-10">Look up</button>
    </form>
  );
}
