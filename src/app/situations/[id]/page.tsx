import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PhraseCard from "@/components/PhraseCard";
import Conversation from "@/components/Conversation";
import TrackVisit from "@/components/TrackVisit";
import { findSituation, situations } from "@/lib/phrases";

export function generateStaticParams() {
  return situations.map((s) => ({ id: s.id }));
}

export default function SituationPage({ params }: { params: { id: string } }) {
  const s = findSituation(params.id);
  if (!s) notFound();

  return (
    <main className="mx-auto max-w-md space-y-8 px-5 pt-8">
      <TrackVisit id={s.id} />
      <header>
        <Link href="/situations" className="inline-flex min-h-[44px] items-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowLeft size={16} aria-hidden /> All situations
        </Link>
        <h1 className="kn-lg mt-1">{s.kn}</h1>
        <p className="text-lg">{s.name}</p>
        <p className="text-muted">{s.blurb}</p>
      </header>

      <section aria-labelledby="phrases" className="space-y-3">
        <h2 id="phrases" className="text-base font-semibold">Phrases</h2>
        {s.phrases.map((p) => <PhraseCard key={p.id} phrase={p} />)}
      </section>

      <section aria-labelledby="convo" className="space-y-3">
        <h2 id="convo" className="text-base font-semibold">How it sounds in real life</h2>
        <Conversation turns={s.conversation} situationId={s.id} />
      </section>

      <section aria-labelledby="notes" className="surface space-y-4 p-5">
        <h2 id="notes" className="text-base font-semibold">Good to know</h2>
        <ul className="space-y-2 border-l-2 border-turmeric pl-3 text-sm">
          {s.tips.map((t) => <li key={t}>{t}</li>)}
        </ul>
        <h3 className="text-base font-semibold">Better not to</h3>
        <ul className="space-y-2 border-l-2 border-silk pl-3 text-sm">
          {s.avoid.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </section>
    </main>
  );
}
