import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40 mt-8">
      <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-black tracking-tight gradient-text">
            Il Dispaccio
          </span>
          <span className="text-xs text-muted-foreground">
            Sponsorizzato da{" "}
            <a
              href="https://www.energizzo.it"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:opacity-80 transition-opacity"
            >
              Energizzo
            </a>
          </span>
        </div>

        <nav className="flex flex-wrap gap-5 text-xs text-muted-foreground">
          <Link
            href="https://dash.ildispaccio.energy"
            className="hover:text-foreground transition-colors"
          >
            Area riservata
          </Link>
          <Link href="#" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="#" className="hover:text-foreground transition-colors">
            Cookie
          </Link>
          <a
            href="mailto:emanuele@unvrslabs.dev"
            className="hover:text-foreground transition-colors"
          >
            Contatti
          </a>
        </nav>
      </div>

      <div className="border-t border-border/20">
        <div className="mx-auto max-w-6xl px-6 py-6 text-[11px] text-muted-foreground/60 text-center">
          © {new Date().getFullYear()} Il Dispaccio · Tutti i diritti riservati
        </div>
      </div>
    </footer>
  );
}
