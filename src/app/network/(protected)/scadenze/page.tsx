import Link from "next/link";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { DELIBERE_DEADLINES } from "@/lib/delibere/mock";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Scadenze · Terminal",
};

const MONTHS_IT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()]} ${d.getFullYear()}`;
}

function daysTo(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

const SEV_LABEL: Record<string, string> = {
  live: "Live",
  imminent: "Imminente",
  upcoming: "In arrivo",
  far: "Pianificata",
};

export default function ScadenzeV2Page() {
  const ordered = [...DELIBERE_DEADLINES].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Compliance · Timeline
          </p>
          <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1" style={{ color: "hsl(var(--v2-text))" }}>
            Scadenze regolatorie
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
            Date chiave estratte dalle delibere ARERA · ordinate per imminenza
          </p>
        </div>
      </header>

      <div className="v2-card overflow-hidden">
        <ul>
          {ordered.map((dl) => {
            const days = daysTo(dl.date);
            return (
              <li
                key={dl.deliberaCode + dl.date}
                className="grid grid-cols-[24px_110px_1fr_auto_auto] gap-4 items-center px-5 py-4 hover:bg-white/[0.02]"
                style={{ borderBottom: "1px solid hsl(var(--v2-border))" }}
              >
                <span className={`v2-sev v2-sev--${dl.severity}`} />
                <span className="v2-mono text-[11.5px]" style={{ color: "hsl(var(--v2-text))" }}>
                  {fmtDate(dl.date)}
                </span>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-medium" style={{ color: "hsl(var(--v2-text))" }}>
                    {dl.label}
                  </div>
                  <div className="v2-mono text-[10.5px] mt-0.5" style={{ color: "hsl(var(--v2-text-mute))" }}>
                    {dl.deliberaCode}
                  </div>
                </div>
                <span
                  className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.14em] px-2 py-1 rounded"
                  style={{
                    color:
                      dl.severity === "live"
                        ? "hsl(var(--v2-danger))"
                        : dl.severity === "imminent"
                        ? "hsl(var(--v2-warn))"
                        : dl.severity === "upcoming"
                        ? "hsl(var(--v2-info))"
                        : "hsl(var(--v2-text-dim))",
                    background:
                      dl.severity === "live"
                        ? "hsl(var(--v2-danger) / 0.12)"
                        : dl.severity === "imminent"
                        ? "hsl(var(--v2-warn) / 0.12)"
                        : dl.severity === "upcoming"
                        ? "hsl(var(--v2-info) / 0.12)"
                        : "hsl(var(--v2-border))",
                  }}
                >
                  {SEV_LABEL[dl.severity]}
                </span>
                <span className="v2-mono text-[11.5px] w-16 text-right" style={{ color: "hsl(var(--v2-text-dim))" }}>
                  {days > 0 ? `+${days}g` : days === 0 ? "oggi" : `${days}g`}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <Link href="/network" className="v2-btn v2-btn--ghost self-start">
        <ArrowLeft className="w-3.5 h-3.5" />
        Torna alla dashboard
      </Link>
    </div>
  );
}
