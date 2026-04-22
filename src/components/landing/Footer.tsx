import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40 mt-8">
      <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-energizzo.png"
            alt="Il Dispaccio"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-[0.2em] uppercase">
              Il Dispaccio
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
              by UNVRS Labs
            </span>
          </div>
        </div>

        <nav className="flex flex-wrap gap-5 text-xs text-muted-foreground">
          <Link
            href="https://dash.ildispaccio.energy"
            className="hover:text-foreground transition-colors"
          >
            Area riservata
          </Link>
          <Link
            href="#"
            className="hover:text-foreground transition-colors"
          >
            Privacy
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
          © {new Date().getFullYear()} UNVRS Labs S.r.l. — Tutti i diritti
          riservati
        </div>
      </div>
    </footer>
  );
}
