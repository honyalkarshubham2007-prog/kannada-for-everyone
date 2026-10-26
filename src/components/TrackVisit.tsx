"use client";
import { useEffect } from "react";
import { setLastSituation } from "@/lib/storage";

// Remembers the last situation opened, for "Continue where you left off" on Home.
export default function TrackVisit({ id }: { id: string }) {
  useEffect(() => setLastSituation(id), [id]);
  return null;
}
