// End-of-session screen shared by all three practice modes.
export default function Summary({ score, total, onAgain, onExit }: { score: number; total: number; onAgain: () => void; onExit: () => void }) {
  return (
    <section className="surface p-6 text-center" aria-live="polite">
      <p className="text-3xl font-semibold">{score} of {total}</p>
      <p className="mt-1 text-muted">{score === total ? "All of them. Try a different set next." : score >= total / 2 ? "Good going. The ones you missed will come back." : "That's how it starts. Go again while it's fresh."}</p>
      <div className="mt-5 flex justify-center gap-3">
        <button className="btn-primary" onClick={onAgain}>Practise again</button>
        <button className="chip" onClick={onExit}>Back</button>
      </div>
    </section>
  );
}
