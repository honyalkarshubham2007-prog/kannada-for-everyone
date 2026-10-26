import type { Config } from "tailwindcss";

// Colours are CSS variables (see globals.css) so dark mode swaps one set of tokens.
const c = (v: string) => `rgb(var(--${v}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: c("paper"), card: c("card"), ink: c("ink"), muted: c("muted"),
        line: c("line"), silk: c("silk"), turmeric: c("turmeric"), stone: c("stone"),
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        kn: ["var(--font-kn-sans)", "sans-serif"],
        "kn-serif": ["var(--font-kn-serif)", "serif"],
      },
      boxShadow: {
        // Soft, layered, realistic: a contact shadow plus a diffuse one.
        card: "0 1px 1px rgb(var(--ink) / .05), 0 6px 18px -8px rgb(var(--ink) / .14)",
        float: "0 2px 4px rgb(var(--ink) / .08), 0 14px 32px -10px rgb(var(--ink) / .28)",
      },
      borderRadius: { xl2: "1.25rem" },
    },
  },
  plugins: [],
};
export default config;
