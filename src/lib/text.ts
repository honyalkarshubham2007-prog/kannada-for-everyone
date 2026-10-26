// Normalise a query so "Bus!" and " bus " share one cache entry.
// \p{M} keeps Kannada vowel signs, which are combining marks.
export const normalise = (q: string) =>
  q.toLowerCase().normalize("NFC").replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
