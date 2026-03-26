import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Amuchie Ambassadors Loyalty Portal",
  description:
    "Official loyalty portal for Sir Stanley Amuchie's 2027 Imo State gubernatorial campaign.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.className} min-h-screen antialiased bg-gradient-to-b from-emerald-950 via-green-950 to-zinc-950 text-zinc-100`}
      >
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.14),_transparent_52%)]" />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="min-h-screen">
            <header className="sticky top-0 z-40 border-b border-zinc-700/70 bg-zinc-950/80 backdrop-blur">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
                <Link href="/" className="inline-flex items-center gap-2.5">
                  <Image
                    src="/amuchie-logo.svg"
                    alt="Amuchie Ambassadors Logo"
                    width={34}
                    height={34}
                    className="rounded-md"
                    priority
                  />
                  <span className="bg-gradient-to-r from-emerald-200 via-yellow-300 to-amber-300 bg-clip-text text-sm font-extrabold tracking-[0.08em] text-transparent sm:text-base">
                    AMUCHIE AMBASSADORS
                  </span>
                </Link>
                <nav className="flex items-center gap-2 text-xs sm:text-sm">
                  <Link
                    href="/ezinwa"
                    className="rounded-lg border border-emerald-300/40 bg-emerald-300/10 px-3 py-1.5 text-emerald-200 hover:bg-emerald-300/20"
                  >
                    Meet Amuchie
                  </Link>
                  <Link
                    href="/programs?tab=all"
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-200 hover:bg-zinc-900"
                  >
                    Programs
                  </Link>
                  <Link
                    href="/news"
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-200 hover:bg-zinc-900"
                  >
                    News &amp; Updates
                  </Link>
                  <Link
                    href="/protected"
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-200 hover:bg-zinc-900"
                  >
                    Dashboard
                  </Link>
                </nav>
              </div>
            </header>

            <div>{children}</div>

            <footer className="mt-10 border-t border-zinc-700/70 bg-zinc-950/70">
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p>Amuchie Ambassadors Loyalty Portal</p>
                <p>Goodlight Foundation Impact Dashboard</p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
