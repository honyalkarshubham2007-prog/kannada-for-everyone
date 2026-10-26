"use client";
import { useCallback, useEffect, useState } from "react";
import type { AIAnswer, Phrase } from "./types";

// All progress lives in localStorage. No login, no server.
const KEYS = { saved: "kfe.saved", lastSituation: "kfe.lastSituation", custom: "kfe.custom", aiCache: "kfe.aiCache", progress: "kfe.progress", srs: "kfe.srs" } as const;

function read<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode / full: ignore */ }
}

export function useSaved() {
  const [ids, setIds] = useState<string[]>([]);
  const [custom, setCustom] = useState<Record<string, Phrase>>({});
  const [ready, setReady] = useState(false);
  useEffect(() => { setIds(read<string[]>(KEYS.saved, [])); setCustom(read(KEYS.custom, {})); setReady(true); }, []);
  const toggle = useCallback((id: string, phrase?: Phrase) => {
    // AI phrases aren't in the bundled data, so keep a copy of them for the phrasebook.
    if (phrase && id.startsWith("ai-")) {
      const all = { ...read<Record<string, Phrase>>(KEYS.custom, {}), [id]: phrase };
      write(KEYS.custom, all); setCustom(all);
    }
    // Read fresh each time so several cards on one page never overwrite each other.
    const cur = read<string[]>(KEYS.saved, []);
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur];
    write(KEYS.saved, next);
    setIds(next);
  }, []);
  return { ids, custom, ready, toggle, has: (id: string) => ids.includes(id) };
}

export const getLastSituation = () => read<string | null>(KEYS.lastSituation, null);
export const setLastSituation = (id: string) => write(KEYS.lastSituation, id);

// Browser-side cache of AI answers (newest 40), so a repeat lookup never costs quota.
type CacheMap = Record<string, { t: number; a: AIAnswer }>;
export const getCachedAnswer = (key: string) => read<CacheMap>(KEYS.aiCache, {})[key]?.a ?? null;
export function setCachedAnswer(key: string, a: AIAnswer) {
  const m = { ...read<CacheMap>(KEYS.aiCache, {}), [key]: { t: Date.now(), a } };
  const keep = Object.entries(m).sort((x, y) => y[1].t - x[1].t).slice(0, 40);
  write(KEYS.aiCache, Object.fromEntries(keep));
}

// ---------- Practice progress: streak, phrases learned, spaced repetition ----------
export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const daysFromNow = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return dayKey(d); };
export const todayKey = () => dayKey(new Date());

type Progress = { streak: number; lastDay: string | null; learned: string[] };
const NO_PROGRESS: Progress = { streak: 0, lastDay: null, learned: [] };

// Leitner boxes: a right answer moves a phrase up a box (longer wait), a wrong one drops it to box 0 (due now).
export type Srs = Record<string, { box: number; due: string }>;
const INTERVAL_DAYS = [0, 1, 2, 4, 8, 16]; // wait before the next review, by box

export function useProgress() {
  const [p, setP] = useState<Progress>(NO_PROGRESS);
  const [srs, setSrs] = useState<Srs>({});
  useEffect(() => { setP(read<Progress>(KEYS.progress, NO_PROGRESS)); setSrs(read<Srs>(KEYS.srs, {})); }, []);

  // Call after every practice answer.
  const record = useCallback((id: string, correct: boolean) => {
    const cur = read<Progress>(KEYS.progress, NO_PROGRESS);
    const today = todayKey();
    const streak = cur.lastDay === today ? cur.streak : cur.lastDay === daysFromNow(-1) ? cur.streak + 1 : 1;
    const learned = correct && !cur.learned.includes(id) ? [...cur.learned, id] : cur.learned;
    const next = { streak, lastDay: today, learned };
    write(KEYS.progress, next); setP(next);

    const all = read<Srs>(KEYS.srs, {});
    const box = correct ? Math.min(5, (all[id]?.box ?? 0) + 1) : 0;
    const nextSrs = { ...all, [id]: { box, due: daysFromNow(INTERVAL_DAYS[box]) } };
    write(KEYS.srs, nextSrs); setSrs(nextSrs);
  }, []);

  const today = todayKey();
  const alive = p.lastDay === today || p.lastDay === daysFromNow(-1); // a missed day ends the streak
  return { streak: alive ? p.streak : 0, learned: p.learned, practisedToday: p.lastDay === today, srs, record };
}
