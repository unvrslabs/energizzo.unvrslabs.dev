"use client";

import Link from "next/link";

const LINKS = [
  { label: "Piattaforma", href: "#piattaforma" },
  { label: "Come entri", href: "#come-entri" },
  { label: "Report", href: "#report" },
  { label: "Podcast", href: "#podcast" },
];

export function NavbarV2() {
  return (
    <nav className="lv2-nav" aria-label="Navigazione principale">
      <Link href="/v2" className="lv2-nav-brand" aria-label="Il Dispaccio">
        <span className="lv2-nav-brand-mark">D</span>
        <span>
          Il Dispaccio<span className="lv2-mono" style={{ fontSize: "9.5px", letterSpacing: "0.18em", marginLeft: 6, color: "hsl(var(--lv2-text-mute))" }}>v26</span>
        </span>
      </Link>

      <span className="lv2-nav-sep" aria-hidden />

      <div className="lv2-nav-links flex items-center gap-1">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className="lv2-nav-link">
            {l.label}
          </a>
        ))}
      </div>

      <span className="lv2-nav-sep lv2-nav-links" aria-hidden />

      <Link href="/network/login" className="lv2-nav-ghost">
        Accedi
      </Link>
      <a href="#richiedi" className="lv2-nav-cta">
        Richiedi invito
      </a>
    </nav>
  );
}
