"use client";
import { useCallback, useEffect, useState } from "react";

export type SpeakState = "idle" | "speaking" | "no-audio";

// 1) Web Speech API with lang kn-IN. 2) If the device has no Kannada voice, play a recorded
// file from /public/audio/<phrase-id>.mp3. 3) If neither works, say so (state "no-audio").
// Phase 3 can add Gemini speech as a third source.
export function useSpeak() {
  const [state, setState] = useState<SpeakState>("idle");
  const [hasVoice, setHasVoice] = useState<boolean | null>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window)) { setHasVoice(false); return; }
    const check = () => setHasVoice(speechSynthesis.getVoices().some((v) => v.lang.toLowerCase().startsWith("kn")));
    check();
    speechSynthesis.addEventListener("voiceschanged", check);
    return () => speechSynthesis.removeEventListener("voiceschanged", check);
  }, []);

  const playRecording = useCallback((id: string | undefined, slow: boolean) => {
    if (!id) { setState("no-audio"); return; }
    const a = new Audio(`/audio/${id}.mp3`);
    a.playbackRate = slow ? 0.7 : 1;
    a.onplay = () => setState("speaking");
    a.onended = () => setState("idle");
    a.onerror = () => setState("no-audio");
    a.play().catch(() => setState("no-audio"));
  }, []);

  const speak = useCallback((text: string, slow = false, id?: string) => {
    if (typeof window === "undefined" || hasVoice === false) { playRecording(id, slow); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "kn-IN";
    u.rate = slow ? 0.6 : 0.95;
    u.onstart = () => setState("speaking");
    u.onend = () => setState("idle");
    u.onerror = (e) => { if (e.error !== "interrupted" && e.error !== "canceled") playRecording(id, slow); };
    setState("idle");
    speechSynthesis.speak(u);
  }, [hasVoice, playRecording]);

  return { speak, state };
}
