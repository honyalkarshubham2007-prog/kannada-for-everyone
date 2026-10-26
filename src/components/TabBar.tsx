"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, MessageCircle, Layers, Bookmark } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/situations", label: "Situations", Icon: Map },
  { href: "/ask", label: "Ask", Icon: MessageCircle },
  { href: "/practice", label: "Practice", Icon: Layers },
  { href: "/saved", label: "Saved", Icon: Bookmark },
];

// Floating pill, detached from the screen edge. Centred on desktop too.
export default function TabBar() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pb-[env(safe-area-inset-bottom)]">
      <ul className="flex w-full max-w-md items-center justify-between rounded-full border border-line bg-card/80 p-1.5 shadow-float backdrop-blur-md">
        {tabs.map(({ href, label, Icon }) => {
          const active = href === "/" ? (path === "/" || path.startsWith("/search") || path.startsWith("/scan")) : path.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link href={href} aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 rounded-full py-2 text-xs font-medium transition-colors ${active ? "bg-silk/10 text-silk" : "text-muted hover:text-ink"}`}>
                <Icon size={20} strokeWidth={active ? 2.3 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
