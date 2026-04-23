"use client";

import Link from "next/link";

const LINKS = [
  { label: "Piattaforma", href: "#piattaforma" },
  { label: "Moduli", href: "#moduli" },
  { label: "Come entri", href: "#come-entri" },
  { label: "Podcast", href: "#podcast" },
];

export function NavbarV2() {
  return (
    <div className="lv2-nav-wrap" aria-hidden={false}>
      {/* Pill centrale: brand + links + Accedi */}
      <nav className="lv2-nav" aria-label="Navigazione principale">
        <Link href="/" className="lv2-nav-brand" aria-label="Il Dispaccio">
          <img src="/logo-mark.png" alt="Il Dispaccio" className="lv2-nav-brand-mark" />
          <span>Il Dispaccio</span>
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
      </nav>

      {/* CTA separato sulla destra (solo desktop) */}
      <a href="#richiedi" className="lv2-nav-cta-detached hidden lg:inline-flex">
        Richiedi invito
      </a>

      {/* CTA mobile dentro al pill */}
      <a href="#richiedi" className="lv2-nav-cta-mobile lg:hidden">
        Richiedi invito
      </a>
    </div>
  );
}
