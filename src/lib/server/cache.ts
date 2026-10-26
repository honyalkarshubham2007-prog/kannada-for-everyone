// Server-side helpers for the Gemini route. Memory only: it resets on a cold start, which is
// fine because the browser also keeps its own cache (see lib/storage.ts).
import type { AIAnswer } from "../types";

const answers = new Map<string, AIAnswer>();
const MAX = 300;

export const getAnswer = (key: string) => answers.get(key);
export function setAnswer(key: string, value: AIAnswer) {
  if (answers.size >= MAX) answers.delete(answers.keys().next().value as string); // drop the oldest
  answers.set(key, value);
}

// Small per-IP limit so one visitor can't burn the shared free quota.
const hits = new Map<string, number[]>();
export function allow(ip: string, limit = 8, windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) { hits.set(ip, recent); return false; }
  recent.push(now); hits.set(ip, recent);
  return true;
}

// Chat: only a first question with no history is cached (a mid-conversation reply depends on context).
import type { ChatReply } from "../types";
const chats = new Map<string, ChatReply>();
export const getChat = (key: string) => chats.get(key);
export function setChat(key: string, value: ChatReply) {
  if (chats.size >= MAX) chats.delete(chats.keys().next().value as string);
  chats.set(key, value);
}
