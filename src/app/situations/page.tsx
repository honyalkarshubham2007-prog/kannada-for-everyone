import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { situations } from "@/lib/phrases";
import { situationIcons } from "@/lib/icons";

export const metadata = { title: "Situations · Kannada for Everyone" };

export default function SituationsPage() {
  return (
    <main className="mx-auto max-w-md px-5 pt-10">
      <h1 className="text-[1.75rem] font-semibold leading-tight">Situations</h1>
      <p className="mt-1 text-muted">Pick where you are. Phrases, a real conversation, and what locals expect.</p>
      <ul className="surface mt-6 divide-y divide-line overflow-hidden">
        {situations.map((s) => {
          const Icon = situationIcons[s.icon];
          return (
            <li key={s.id}>
              <Link href={`/situations/${s.id}`} className="flex min-h-[72px] items-center gap-4 px-4 py-3 transition-colors hover:bg-line/40">
                <Icon size={22} className="shrink-0 text-silk" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="kn-md block text-[1.25rem]">{s.kn}</span>
                  <span className="block text-sm text-muted">{s.name} · {s.phrases.length} phrases</span>
                </span>
                <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
