"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// Every failure maps to a plain sentence, so "Say it" never fails silently.
const ERRORS: Record<string, string> = {
  "not-allowed": "Microphone access is blocked. Allow it in your browser's site settings, then try again.",
  "service-not-allowed": "Microphone access is blocked. Allow it in your browser's site settings, then try again.",
  "no-speech": "I didn't hear anything. Tap Say it again and start speaking right away.",
  "audio-capture": "No microphone found on this device.",
  network: "The speech check needs an internet connection.",
  "language-not-supported": "This browser can't check Kannada speech. You can still listen and repeat.",
};

export function useRecognition() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const rec = useRef<any>(null);

  useEffect(() => {
    const w = window as any;
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  // onHeard gets the recogniser's best guesses (up to 3) so the caller can pick the closest.
  const start = useCallback((onHeard: (alternatives: string[]) => void, onError: (message: string) => void, lang = "kn-IN") => {
    const w = window as any;
    const R = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!R) { onError(ERRORS["language-not-supported"]); return; }
    speechSynthesis?.cancel(); // so the phone doesn't hear its own voice
    const r = new R();
    r.lang = lang; r.interimResults = false; r.maxAlternatives = 3;
    r.onresult = (e: any) => onHeard(Array.from(e.results[0] as ArrayLike<{ transcript: string }>).map((a) => a.transcript));
    r.onerror = (e: any) => onError(ERRORS[e.error] ?? "Couldn't check that. Try again.");
    r.onend = () => setListening(false);
    rec.current = r;
    try { setListening(true); r.start(); } catch { setListening(false); onError("Couldn't start the microphone. Try again."); }
  }, []);

  const stop = useCallback(() => rec.current?.stop(), []);
  return { supported, listening, start, stop };
}
