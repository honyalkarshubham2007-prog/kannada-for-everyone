// Placeholder for tabs built in later phases. Tells the person what will be here.
export default function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <main className="mx-auto max-w-md px-5 pt-14">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-3 text-muted">{text}</p>
    </main>
  );
}
