"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Mic, RotateCcw } from "lucide-react";
import PhraseCard from "./PhraseCard";
import ListenButton from "./ListenButton";
import { aiPhrase, searchSeed } from "@/lib/search";
import { useRecognition } from "@/lib/recognition";
import { scenarios, findScenario } from "@/lib/scenarios";
import type { ChatReply, ChatTurn, Phrase } from "@/lib/types";

type Mode = "ask" | "coach";
type Err = "quota" | "rate" | "not_configured" | "offline" | "server" | "model" | "key";
type Msg = { role: "user"; text: string } | { role: "model"; reply: ChatReply } | { role: "error"; err: Err; fallback: Phrase[] };

const MESSAGES: Record<Err, string> = {
  model: "The AI model named in GEMINI_MODEL isn't available any more. Set GEMINI_MODEL=gemini-3.5-flash in .env.local and restart.",
  key: "Google rejected the API key. Copy it again into .env.local (no quotes or spaces) and restart.",
  quota: "The AI has reached its free limit for now. Try again in a minute.",
  rate: "That's a lot of messages at once. Wait a few seconds and try again.",
  not_configured: "AI chat isn't switched on yet: this site has no GEMINI_API_KEY. Add it to .env.local and restart (steps are in the README).",
  offline: "You seem to be offline. Check your connection and try again.",
  server: "The AI didn't answer this time. Try again.",
};
const STARTERS = ["How do I say sorry, I don't understand?", "How do I greet an older person politely?", "What do I say when the bus is crowded?"];

// What the server needs: plain text turns. A model turn is summarised as its message + Kannada line.
const toHistory = (msgs: Msg[]): ChatTurn[] =>
  msgs.flatMap((m): ChatTurn[] =>
    m.role === "user" ? [{ role: "user", text: m.text }]
    : m.role === "model" ? [{ role: "model", text: `${m.reply.message} ${m.reply.kannada}`.trim() }] : []);

function Reply({ r, label, showHint }: { r: ChatReply; label?: string; showHint: boolean }) {
  return (
    <div className="space-y-3">
      {r.message && <p>{r.message}</p>}
      {r.correction.kannada && (
        <div className="surface border-turmeric/60 p-4">
          <p className="text-sm font-medium text-muted">A smoother way to say it</p>
          <p className="kn-md">{r.correction.kannada}</p>
          <p>{r.correction.transliteration}</p>
          {r.correction.why && <p className="text-sm text-muted">{r.correction.why}</p>}
          <div className="mt-2"><ListenButton text={r.correction.kannada} /></div>
        </div>
      )}
      {r.kannada && (
        <div>
          {label && <p className="mb-1 text-sm text-muted">{label} says</p>}
          <PhraseCard phrase={aiPhrase(r.kannada, r.transliteration, r.meaning_english, r.usage_tip)} />
        </div>
      )}
      {showHint && r.next_hint.kannada && (
        <details className="surface p-4">
          <summary className="min-h-[28px] cursor-pointer text-sm font-medium">Give me a hint</summary>
          <p className="kn-md mt-2">{r.next_hint.kannada}</p>
          <p>{r.next_hint.transliteration}</p>
          <p className="text-sm text-muted">{r.next_hint.meaning_english}</p>
          <div className="mt-2"><ListenButton text={r.next_hint.kannada} /></div>
        </details>
      )}
      {r.learn_next && <p className="surface border-silk/40 p-4 text-sm"><span className="font-medium">Learn next: </span>{r.learn_next}</p>}
      {r.related_phrases.length > 0 && (
        <details>
          <summary className="min-h-[44px] cursor-pointer py-2 text-sm font-medium">More phrases like this</summary>
          <div className="space-y-3">{r.related_phrases.map((p) => <PhraseCard key={p.kannada} phrase={aiPhrase(p.kannada, p.transliteration, p.meaning_english)} />)}</div>
        </details>
      )}
    </div>
  );
}

export default function AskView() {
  const [mode, setMode] = useState<Mode>("ask");
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Record<Mode, Msg[]>>({ ask: [], coach: [] });
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const live = useRef(msgs); live.current = msgs;   // latest messages, safe to read inside async code
  const endRef = useRef<HTMLDivElement>(null);
  const scenario = findScenario(scenarioId);
  const mic = useRecognition();
  const [speakKannada, setSpeakKannada] = useState(false);
  const [micMsg, setMicMsg] = useState<string | null>(null);

  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    endRef.current?.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "end" });
  }, [msgs, busy]);

  // text === null means "just ask the AI again / start the scene" (used by Try again and by Coach start).
  const send = useCallback(async (m: Mode, sc: string | null, text: string | null) => {
    const prior = live.current[m].filter((x) => x.role !== "error");
    const next: Msg[] = text ? [...prior, { role: "user", text }] : prior;
    setMsgs((s) => ({ ...s, [m]: next }));
    setBusy(true);
    const fail = (err: Err) => setMsgs((s) => ({ ...s, [m]: [...next, { role: "error", err, fallback: m === "ask" && text ? searchSeed(text).loose.slice(0, 3) : [] }] }));
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: m, scenario: sc, messages: toHistory(next) }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) fail(res.status === 429 ? (data.error === "rate" ? "rate" : "quota") : res.status === 503 ? "not_configured" : data.error === "model" || data.error === "key" ? data.error : "server");
      else setMsgs((s) => ({ ...s, [m]: [...next, { role: "model", reply: data as ChatReply }] }));
    } catch { fail("offline"); }
    finally { setBusy(false); }
  }, []);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const t = draft.trim();
    if (!t || busy) return;
    setDraft("");
    send(mode, scenarioId, t);
  };
  // Voice input fills the box so you can check the words before sending.
  const listen = () => {
    setMicMsg(null);
    mic.start((alts) => setDraft(alts[0] ?? ""), setMicMsg, mode === "coach" && speakKannada ? "kn-IN" : "en-IN");
  };
  const startScene = (id: string) => { setScenarioId(id); setMsgs((s) => ({ ...s, coach: [] })); live.current = { ...live.current, coach: [] }; send("coach", id, null); };
  const resetScene = () => { setScenarioId(null); setMsgs((s) => ({ ...s, coach: [] })); };

  const list = msgs[mode];
  const lastModel = [...list].reverse().findIndex((x) => x.role === "model");
  const lastModelIndex = lastModel === -1 ? -1 : list.length - 1 - lastModel;
  const showPicker = mode === "coach" && !scenario;

  return (
    <main className="mx-auto max-w-md px-5 pt-10">
      <h1 className="text-[1.75rem] font-semibold leading-tight">Ask</h1>
      <p className="mt-1 text-muted">{mode === "ask" ? "Ask anything about getting by in Kannada." : "Practise a real scene. I'll play the other person and fix your Kannada gently."}</p>

      <div role="tablist" aria-label="Mode" className="mt-5 flex rounded-full border border-line bg-card p-1">
        {(["ask", "coach"] as const).map((m) => (
          <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
            className={`min-h-[44px] flex-1 rounded-full text-sm font-medium transition-colors ${mode === m ? "bg-silk text-paper" : "text-muted hover:text-ink"}`}>
            {m === "ask" ? "Ask" : "Coach"}
          </button>
        ))}
      </div>

      {showPicker && (
        <ul className="surface mt-6 divide-y divide-line overflow-hidden">
          {scenarios.map((s) => (
            <li key={s.id}>
              <button onClick={() => startScene(s.id)} className="flex min-h-[72px] w-full flex-col items-start justify-center px-4 py-3 text-left transition-colors hover:bg-line/40">
                <span className="font-medium">{s.title}</span>
                <span className="text-sm text-muted">{s.blurb}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {mode === "coach" && scenario && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted">Scene: {scenario.title}</p>
          <button className="chip" onClick={resetScene}><RotateCcw size={16} aria-hidden /> New scene</button>
        </div>
      )}

      {mode === "ask" && list.length === 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {STARTERS.map((s) => <button key={s} className="chip text-left" onClick={() => send("ask", null, s)}>{s}</button>)}
        </div>
      )}

      <div className="mt-6 space-y-5" aria-live="polite">
        {list.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end"><p className="max-w-[85%] rounded-xl2 bg-silk px-4 py-2 text-paper">{m.text}</p></div>
          ) : m.role === "model" ? (
            <Reply key={i} r={m.reply} label={mode === "coach" ? scenario?.character : undefined} showHint={mode === "coach" && i === lastModelIndex} />
          ) : (
            <div key={i} role="alert" className="surface space-y-3 border-silk/40 p-4">
              <p className="text-sm">{MESSAGES[m.err]}</p>
              {m.fallback.length > 0 && <p className="text-sm font-medium">Closest in the phrasebook</p>}
              {m.fallback.map((p) => <PhraseCard key={p.id} phrase={p} />)}
              {m.err !== "not_configured" && <button className="chip" onClick={() => send(mode, scenarioId, null)}><RotateCcw size={16} aria-hidden /> Try again</button>}
            </div>
          ),
        )}
        {busy && <div className="h-24 animate-pulse rounded-xl2 bg-line/50" aria-label="Thinking" />}
        <div ref={endRef} />
      </div>

      {!showPicker && (
        <form onSubmit={submit} className="sticky bottom-24 mt-6 flex items-center gap-2 rounded-full border border-line bg-card/90 p-1.5 pl-4 shadow-float backdrop-blur-md">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={300}
            aria-label={mode === "ask" ? "Your question" : "Your reply"}
            placeholder={mode === "ask" ? "Ask in English…" : "Reply in English or Kannada…"}
            className="h-11 min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted" />
          {mic.supported !== false && (
            <button type="button" onClick={listen} disabled={busy || mic.listening} aria-label={mic.listening ? "Listening" : "Speak instead of typing"}
              className={`btn-icon ${mic.listening ? "border-silk text-silk" : ""}`}><Mic size={20} /></button>
          )}
          <button type="submit" disabled={busy || !draft.trim()} aria-label="Send" className="btn-icon bg-silk text-paper disabled:opacity-40"><ArrowUp size={20} /></button>
        </form>
      )}
      <div aria-live="polite" className="mt-3 space-y-2 text-sm">
        {mic.listening && <p role="status">Listening… speak now.</p>}
        {micMsg && <p role="alert" className="surface border-silk/40 p-3">{micMsg}</p>}
        {mic.supported === false && <p className="text-muted">Voice input isn&apos;t supported in this browser. Typing works everywhere.</p>}
        {mode === "coach" && scenario && mic.supported !== false && (
          <button type="button" className="chip" onClick={() => setSpeakKannada((v) => !v)} aria-pressed={speakKannada}>
            Voice language: {speakKannada ? "ಕನ್ನಡ" : "English"}
          </button>
        )}
      </div>
    </main>
  );
}
