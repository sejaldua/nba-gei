import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NBA Game Excitement Index",
  description:
    "Quantifying how exciting NBA games are using win probability volatility.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f5f0e8] text-stone-900">
        <header className="px-6 py-5">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Link href="/" className="group flex items-baseline gap-2">
              <span className="text-base font-semibold tracking-tight text-stone-900">Game Excitement Index</span>
            </Link>
            <nav className="flex gap-5 text-sm text-stone-500">
              <Link href="/" className="hover:text-stone-900 transition-colors">
                Overview
              </Link>
              <Link href="/games" className="hover:text-stone-900 transition-colors">
                Games
              </Link>
              <Link href="/teams" className="hover:text-stone-900 transition-colors">
                Teams
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 px-6 pb-16">
          <div className="max-w-3xl mx-auto">{children}</div>
        </main>
        <footer className="px-6 py-6 text-center text-xs text-stone-400">
          Win probability data from ESPN. Built by Sejal Dua.
        </footer>
      </body>
    </html>
  );
}
