import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CasaCalc PR — Presupuesto de obra",
  description:
    "Calculadora local de gastos para construir una casa en Puerto Rico (USD).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${dmSans.variable} ${fraunces.variable} antialiased`}>
        <div className="min-h-screen">
          <header className="border-b border-[var(--line)]/80 bg-[rgba(245,248,249,0.75)] backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-4 px-4 py-4 sm:px-6">
              <Link href="/" className="brand-mark text-2xl text-[var(--bg-deep)] sm:text-3xl">
                CasaCalc <span className="text-[var(--accent)]">PR</span>
              </Link>
              <p className="text-sm text-[var(--ink-muted)]">
                Puerto Rico · USD · local
              </p>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
