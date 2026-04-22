"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "#sezioni", label: "Sezioni" },
  { href: "#come-funziona", label: "Come Funziona" },
  { href: "#report", label: "Report" },
  { href: "#podcast", label: "Podcast" },
  { href: "#confronto", label: "Confronto" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-background/70 border-b border-border/40"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo-energizzo.png"
            alt="Il Dispaccio"
            width={32}
            height={32}
            className="rounded-lg"
            priority
          />
          <span className="font-display text-sm font-bold tracking-[0.2em] uppercase">
            Il Dispaccio
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          href="#iscrizione"
          className="btn-premium px-5 py-2 rounded-full font-semibold text-xs sm:text-sm"
        >
          Entra nel network
        </Link>
      </div>
    </header>
  );
}
