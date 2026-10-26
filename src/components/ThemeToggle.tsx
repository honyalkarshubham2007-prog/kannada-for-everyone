"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

// Follows the device by default; this button overrides it and remembers the choice.
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    setDark(t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);
  const toggle = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("kfe.theme", next); } catch { /* ignore */ }
    setDark(!dark);
  };
  return (
    <button className="btn-icon shrink-0" onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
