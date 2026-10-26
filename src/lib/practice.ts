import { allPhrases } from "./phrases";
import { normalise } from "./text";
import type { Phrase } from "./types";

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Three wrong answers for the quiz: other phrases with a different meaning.
export const distractors = (answer: Phrase, n = 3): Phrase[] =>
  shuffle(allPhrases.filter((p) => p.en !== answer.en)).slice(0, n);

function levenshtein(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

// 0 to 1. Spaces are ignored because speech recognition often splits Kannada words differently.
export function similarity(heard: string, target: string) {
  const x = normalise(heard).replace(/\s/g, ""), y = normalise(target).replace(/\s/g, "");
  if (!x || !y) return 0;
  return 1 - levenshtein(x, y) / Math.max(x.length, y.length);
}
