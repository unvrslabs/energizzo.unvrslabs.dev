import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import { listScadenzeFuture, SCADENZA_LABEL, type ScadenzaTipo, type ScadenzaView } from "@/lib/delibere/scadenze";
import { ScadenzaCountdown } from "@/components/network-v2/scadenza-countdown";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Scadenze · Terminal",
};

const MONTHS_IT = [
  "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
  "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
];
const MONTHS_IT_SHORT = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];

function monthKey(iso: string) {
  return iso.slice(0, 7);
}
function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return `${MONTHS_IT[m - 1]} ${y}`;
}

const TIPO_COLOR: Record<ScadenzaTipo, { fg: string; bg: string; border: string }> = {
  entrata_vigore: {
    fg: "hsl(var(--v2-accent))",
    bg: "hsl(var(--v2-accent) / 0.1)",
    border: "hsl(var(--v2-accent) / 0.28)",
  },
  adempimento: {
    fg: "hsl(var(--v2-warn))",
    bg: "hsl(var(--v2-warn) / 0.1)",
    border: "hsl(var(--v2-warn) / 0.28)",
  },
  consultazione: {
    fg: "hsl(var(--v2-info))",
    bg: "hsl(var(--v2-info) / 0.1)",
    border: "hsl(var(--v2-info) / 0.28)",
  },
  asta: {
    fg: "hsl(var(--v2-danger))",
    bg: "hsl(var(--v2-danger) / 0.1)",
    border: "hsl(var(--v2-danger) / 0.28)",
  },
  scadenza: {
    fg: "hsl(var(--v2-text))",
    bg: "hsl(var(--v2-bg-elev))",
    border: "hsl(var(--v2-border-strong))",
  },
  reporting: {
    fg: "hsl(var(--v2-info))",
    bg: "hsl(var(--v2-info) / 0.08)",
    border: "hsl(var(--v2-info) / 0.22)",
  },
};

export default async function ScadenzePage() {
  const scadenze = await listScadenzeFuture();

  // Raggruppa per mese
  const byMonth = new Map<string, ScadenzaView[]>();
  for (const s of scadenze) {
    const k = monthKey(s.date);
    if (!byMonth.has(k)) byMonth.set(k, []);
    byMonth.get(k)!.push(s);
  }
  const months = Array.from(byMonth.keys()).sort();

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p
            className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "hsl(var(--v2-text-mute))" }}
          >
            Compliance · Timeline
          </p>
          <h1
            className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1"
            style={{ color: "hsl(var(--v2-text))" }}
          >
            Scadenze regolatorie
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
            {scadenze.length} scadenze estratte dai PDF delle delibere ARERA · ordinamento per data
          </p>
        </div>
      </header>

      {scadenze.length === 0 ? (
        <div className="v2-card p-10 text-center flex flex-col items-center gap-3">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl"
            style={{
              background: "hsl(var(--v2-accent) / 0.1)",
              border: "1px solid hsl(var(--v2-accent) / 0.28)",
              color: "hsl(var(--v2-accent))",
            }}
          >
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[15px] font-semibold" style={{ color: "hsl(var(--v2-text))" }}>
              Nessuna scadenza futura
            </p>
            <p className="text-[13px] mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
              Le scadenze vengono estratte automaticamente dai PDF delle delibere ARERA quando
              viene generato il sommario AI.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {months.map((mk) => {
            const items = byMonth.get(mk)!;
            return (
              <section key={mk} className="v2-card overflow-hidden">
                <div
                  className="px-5 py-3 flex items-center justify-between"
                  style={{ borderBottom: "1px solid hsl(var(--v2-border))" }}
                >
                  <div
                    className="v2-mono text-[11px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: "hsl(var(--v2-accent))" }}
                  >
                    {monthLabel(mk)}
                  </div>
                  <span
                    className="v2-mono text-[10.5px]"
                    style={{ color: "hsl(var(--v2-text-mute))" }}
                  >
                    {items.length} {items.length === 1 ? "scadenza" : "scadenze"}
                  </span>
                </div>
                <ul>
                  {items.map((s, idx) => {
                    const col = TIPO_COLOR[s.tipo] ?? TIPO_COLOR.scadenza;
                    return (
                      <li
                        key={`${s.deliberaId}-${idx}`}
                        style={{ borderBottom: idx < items.length - 1 ? "1px solid hsl(var(--v2-border))" : undefined }}
                      >
                        <Link
                          href={`/network/delibere?open=${encodeURIComponent(s.deliberaNumero)}`}
                          className="grid gap-4 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors"
                          style={{ gridTemplateColumns: "auto 1fr auto" }}
                        >
                          <ScadenzaCountdown date={s.date} size="lg" />
                          <div className="min-w-0 flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="v2-mono text-[9.5px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
                                style={{ color: col.fg, background: col.bg, border: `1px solid ${col.border}` }}
                              >
                                {SCADENZA_LABEL[s.tipo] ?? s.tipo}
                              </span>
                              <span
                                className="v2-mono text-[10px]"
                                style={{ color: "hsl(var(--v2-text-mute))" }}
                              >
                                {s.deliberaNumero}
                              </span>
                            </div>
                            <p
                              className="text-[13.5px] leading-snug font-medium"
                              style={{ color: "hsl(var(--v2-text))" }}
                            >
                              {s.label}
                            </p>
                            <p
                              className="text-[11.5px] line-clamp-1"
                              style={{ color: "hsl(var(--v2-text-mute))" }}
                            >
                              {s.deliberaTitolo}
                            </p>
                          </div>
                          <ArrowRight
                            className="w-4 h-4 shrink-0"
                            style={{ color: "hsl(var(--v2-text-mute))" }}
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
