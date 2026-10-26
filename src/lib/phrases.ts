import raw from "@/data/situations.json";
import type { PhraseWithSituation, Situation } from "./types";

// The JSON stores phrases as compact arrays: [kn, transliteration, english, tip?].
// Ids are prefix + position (auto-1, auto-2...). Only ever append, so saved ids stay valid.
type Raw = { id: string; p: string; name: string; kn: string; icon: string; blurb: string;
  phrases: string[][]; convo: string[][]; tips: string[]; avoid: string[] };

export const situations: Situation[] = (raw as unknown as Raw[]).map((s) => ({
  id: s.id, p: s.p, name: s.name, kn: s.kn, icon: s.icon, blurb: s.blurb, tips: s.tips, avoid: s.avoid,
  phrases: s.phrases.map(([kn, tr, en, tip], i) => ({ id: `${s.p}-${i + 1}`, kn, tr, en, tip })),
  conversation: s.convo.map(([w, kn, tr, en]) => ({ who: w === "y" ? "you" : "them", kn, tr, en })),
}));

export const allPhrases: PhraseWithSituation[] = situations.flatMap((s) =>
  s.phrases.map((p) => ({ ...p, situationId: s.id }))
);

export const findPhrase = (id: string) => allPhrases.find((p) => p.id === id);
export const findSituation = (id: string) => situations.find((s) => s.id === id);

// One phrase per calendar day. Emergency phrases are left out of the daily pick.
export function phraseOfTheDay(date = new Date()): PhraseWithSituation {
  const pool = allPhrases.filter((p) => p.situationId !== "emergency");
  const day = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  return pool[day % pool.length];
}
