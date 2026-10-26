import { Suspense } from "react";
import SearchView from "@/components/SearchView";

export const metadata = { title: "Look up · Kannada for Everyone" };

// useSearchParams needs a Suspense boundary in the App Router.
export default function SearchPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-md px-5 pt-10"><div className="h-14 animate-pulse rounded-xl2 bg-line/50" /></main>}>
      <SearchView />
    </Suspense>
  );
}
