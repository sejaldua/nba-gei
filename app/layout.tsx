import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
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
    "Quantifying how exciting NBA games are using win probability volatility. An interactive explorer across multiple seasons.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationMismatch
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        <ThemeProvider>
          <nav className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <Link href="/" className="text-lg font-bold tracking-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                NBA GEI
              </Link>
              <div className="flex items-center gap-6">
                <div className="flex gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <Link href="/" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                    Overview
                  </Link>
                  <Link href="/games" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                    Games
                  </Link>
                  <Link href="/teams" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                    Teams
                  </Link>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </nav>
          <main className="flex-1 px-6 py-8">
            <div className="max-w-6xl mx-auto">{children}</div>
          </main>
          <footer className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 text-center text-xs text-gray-500">
            Data from ESPN. Built by Sejal Dua.
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
