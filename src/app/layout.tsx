import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Noto_Sans_Kannada, Noto_Serif_Kannada } from "next/font/google";
import TabBar from "@/components/TabBar";
import RegisterSW from "@/components/RegisterSW";
import "./globals.css";

const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans" });
const knSans = Noto_Sans_Kannada({ subsets: ["kannada"], variable: "--font-kn-sans" });
const knSerif = Noto_Serif_Kannada({ subsets: ["kannada"], variable: "--font-kn-serif" });

export const metadata: Metadata = {
  title: "ಕನ್ನಡ for Everyone",
  description: "Learn the Kannada you need today: autos, buses, restaurants, hospitals and more.",
};
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F0E6" },
    { media: "(prefers-color-scheme: dark)", color: "#181412" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${knSans.variable} ${knSerif.variable}`}>
      <body>
        {/* Applies a saved theme before first paint so there is no light flash in dark mode. */}
        <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('kfe.theme');if(t)document.documentElement.dataset.theme=t}catch(e){}" }} />
        <a href="#main" className="btn-primary sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]">Skip to content</a>
        <div id="main">{children}</div>
        <TabBar />
        <RegisterSW />
      </body>
    </html>
  );
}
