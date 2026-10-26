"use client";
import { Volume2, Turtle } from "lucide-react";
import { useSpeak } from "@/lib/speech";

// Normal + slow listen buttons. If the device has no Kannada voice and there's no
// recording for this phrase, it says so instead of staying silent.
export default function ListenButton({ text, id }: { text: string; id?: string }) {
  const { speak, state } = useSpeak();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className={`btn-icon ${state === "speaking" ? "border-silk text-silk" : ""}`} onClick={() => speak(text, false, id)} aria-label="Listen">
        <Volume2 size={20} />
      </button>
      <button className="btn-icon" onClick={() => speak(text, true, id)} aria-label="Listen slowly">
        <Turtle size={20} />
      </button>
      {state === "no-audio" && (
        <p role="status" className="w-full text-xs text-muted">
          No Kannada voice on this device, and no recorded audio for this one yet. Try Chrome on Android or Windows, or add a Kannada voice in your system's speech settings.
        </p>
      )}
    </div>
  );
}
