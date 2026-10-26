"use client";
import ListenButton from "./ListenButton";
import type { Turn } from "@/lib/types";

// Two-way sample conversation. "You" lines sit right, the other person's lines sit left.
export default function Conversation({ turns, situationId }: { turns: Turn[]; situationId: string }) {
  return (
    <ol className="space-y-3">
      {turns.map((t, i) => (
        <li key={i} className={`flex ${t.who === "you" ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-[88%] rounded-xl2 border p-3 ${t.who === "you" ? "border-silk/30 bg-silk/10" : "border-line bg-card"}`}>
            <p className="text-xs font-medium text-muted">{t.who === "you" ? "You" : "Them"}</p>
            <p className="kn-md text-[1.25rem]">{t.kn}</p>
            <p className="text-sm">{t.tr}</p>
            <p className="text-sm text-muted">{t.en}</p>
            <div className="mt-2"><ListenButton text={t.kn} id={`${situationId}-c${i + 1}`} /></div>
          </div>
        </li>
      ))}
    </ol>
  );
}
