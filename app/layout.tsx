import type { Metadata } from "next";
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";

import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const fontMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Autonomous Content Factory",
  description:
    "A minimal production-ready AI workflow that researches, writes, and validates marketing campaigns from a single source of truth.",
  metadataBase: new URL("https://autonomous-content-factory.vercel.app"),
  openGraph: {
    title: "Autonomous Content Factory",
    description:
      "Research, generate, and review product marketing campaigns with a single streamlined AI workflow.",
    url: "https://autonomous-content-factory.vercel.app",
    siteName: "Autonomous Content Factory",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning className="relative min-h-screen bg-background text-foreground antialiased">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(94,98,255,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(151,71,255,0.16),_transparent_50%)]" />
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border/60 bg-background/80">
            <div className="mx-auto flex w-full max-w-6xl items-center px-6 py-6 text-xs text-muted-foreground md:px-10">
              <span>© {new Date().getFullYear()} Autonomous Content Factory</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
