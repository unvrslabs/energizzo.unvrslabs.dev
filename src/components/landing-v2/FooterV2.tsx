import Link from "next/link";

export function FooterV2() {
  return (
    <footer className="lv2-footer">
      <div className="lv2-container">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-3">
            <Link href="/" className="lv2-nav-brand" aria-label="Il Dispaccio">
              <img src="/logo-mark.png" alt="Il Dispaccio" className="lv2-nav-brand-mark" />
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "-0.015em",
                  color: "hsl(var(--lv2-text))",
                }}
              >
                Il Dispaccio
              </span>
            </Link>
            <p
              className="lv2-mono"
              style={{
                fontSize: "10.5px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "hsl(var(--lv2-text-mute))",
                maxWidth: 280,
                lineHeight: 1.6,
              }}
            >
              Il primo network italiano dei reseller energia · Sponsor ufficiale{" "}
              <a
                href="https://www.energizzo.it"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "hsl(var(--lv2-accent))" }}
              >
                energizzo
              </a>
            </p>
          </div>

          <nav className="flex flex-col gap-6 md:flex-row md:gap-12">
            <div className="flex flex-col gap-2.5">
              <span
                className="lv2-mono"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "hsl(var(--lv2-text-mute))",
                  fontWeight: 600,
                }}
              >
                Network
              </span>
              <Link
                href="/network/login"
                className="text-sm hover:text-white transition-colors"
                style={{ color: "hsl(var(--lv2-text-dim))" }}
              >
                Accedi al cockpit
              </Link>
              <a
                href="#richiedi"
                className="text-sm hover:text-white transition-colors"
                style={{ color: "hsl(var(--lv2-text-dim))" }}
              >
                Richiedi invito
              </a>
            </div>

            <div className="flex flex-col gap-2.5">
              <span
                className="lv2-mono"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "hsl(var(--lv2-text-mute))",
                  fontWeight: 600,
                }}
              >
                Contatti
              </span>
              <a
                href="mailto:emanuele@unvrslabs.dev"
                className="text-sm hover:text-white transition-colors"
                style={{ color: "hsl(var(--lv2-text-dim))" }}
              >
                Scrivici
              </a>
              <a
                href="https://www.energizzo.it"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:text-white transition-colors"
                style={{ color: "hsl(var(--lv2-text-dim))" }}
              >
                Energizzo
              </a>
            </div>

            <div className="flex flex-col gap-2.5">
              <span
                className="lv2-mono"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "hsl(var(--lv2-text-mute))",
                  fontWeight: 600,
                }}
              >
                Legale
              </span>
              <Link
                href="#"
                className="text-sm hover:text-white transition-colors"
                style={{ color: "hsl(var(--lv2-text-dim))" }}
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-sm hover:text-white transition-colors"
                style={{ color: "hsl(var(--lv2-text-dim))" }}
              >
                Cookie
              </Link>
            </div>
          </nav>
        </div>

        <div
          className="mt-10 pt-6 text-center"
          style={{ borderTop: "1px solid hsl(var(--lv2-border))" }}
        >
          <p
            className="lv2-mono"
            style={{
              fontSize: "10.5px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "hsl(var(--lv2-text-mute))",
            }}
          >
            © {new Date().getFullYear()} Il Dispaccio · Tutti i diritti
            riservati
          </p>
        </div>
      </div>
    </footer>
  );
}
