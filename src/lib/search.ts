import { allPhrases, situations } from "./phrases";
import { normalise } from "./text";
import type { AIAnswer, Phrase } from "./types";

const STOP = new Set(["the", "a", "an", "to", "is", "are", "in", "on", "of", "for", "me", "my", "i", "you", "please", "do", "does", "can", "it", "this", "that"]);

// Looks in the bundled phrasebook first. Works with English, transliteration or Kannada script.
// `strong` = every meaningful word matched, so Gemini isn't needed. `loose` = partial matches.
export function searchSeed(query: string): { strong: Phrase[]; loose: Phrase[] } {
  const n = normalise(query);
  const tokens = n.split(" ").filter((t) => t && !STOP.has(t));
  if (!tokens.length) return { strong: [], loose: [] };
  const scored = allPhrases.map((p) => {
    const hay = normalise(`${p.en} ${p.tr}`);
    const words = new Set(hay.split(" "));
    let hits = 0;
    for (const t of tokens) if (words.has(t) || p.kn.includes(t) || (t.length > 3 && hay.includes(t))) hits++;
    const all = hits === tokens.length;
    return { p, all, score: hits * 2 + (hay.includes(n) ? 4 : 0) + (all ? 3 : 0) };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
  return { strong: scored.filter((x) => x.all).slice(0, 3).map((x) => x.p), loose: scored.slice(0, 4).map((x) => x.p) };
}

// "People who look up X also need": the next phrases from the same situation.
export function relatedFromSeed(phrase: Phrase, exclude: string[] = [], count = 4): Phrase[] {
  const s = situations.find((x) => x.phrases.some((p) => p.id === phrase.id));
  if (!s) return [];
  const i = s.phrases.findIndex((p) => p.id === phrase.id);
  const ordered = [...s.phrases.slice(i + 1), ...s.phrases.slice(0, i)];
  return ordered.filter((p) => !exclude.includes(p.id)).slice(0, count);
}

// Small stable hash so an AI phrase keeps the same id (for Save) every time.
const hash = (s: string) => { let h = 5381; for (const c of s) h = ((h << 5) + h + c.codePointAt(0)!) | 0; return Math.abs(h).toString(36); };

export const aiPhrase = (kannada: string, transliteration: string, meaning: string, tip?: string): Phrase =>
  ({ id: `ai-${hash(kannada)}`, kn: kannada, tr: transliteration, en: meaning, tip: tip || undefined });

export const aiToPhrase = (a: AIAnswer) => aiPhrase(a.kannada, a.transliteration, a.meaning_english, a.usage_tip);
export const aiRelatedToPhrases = (a: AIAnswer) => a.related_phrases.map((r) => aiPhrase(r.kannada, r.transliteration, r.meaning_english));
