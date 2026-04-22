import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";

type Mark = "yes" | "no" | "partial";

interface Row {
  label: string;
  dispaccio: { mark: Mark; note?: string };
  arera: { mark: Mark; note?: string };
  assoc: { mark: Mark; note?: string };
  linkedin: { mark: Mark; note?: string };
}

const ROWS: Row[] = [
  {
    label: "Delibere decifrate",
    dispaccio: { mark: "yes", note: "Commento AI + operatività" },
    arera: { mark: "no", note: "Testo integrale" },
    assoc: { mark: "partial", note: "Convegni sporadici" },
    linkedin: { mark: "no", note: "Rumor senza fonti" },
  },
  {
    label: "Benchmark tariffario",
    dispaccio: { mark: "yes", note: "Live, anonimo" },
    arera: { mark: "partial", note: "Dati storici" },
    assoc: { mark: "no", note: "Non disponibile" },
    linkedin: { mark: "no", note: "Non disponibile" },
  },
  {
    label: "Podcast tecnico",
    dispaccio: { mark: "yes", note: "Settimanale, 1 a 1" },
    arera: { mark: "no" },
    assoc: { mark: "no" },
    linkedin: { mark: "partial", note: "Contenuti brandizzati" },
  },
  {
    label: "Community peer",
    dispaccio: { mark: "yes", note: "CEO e COO verticali" },
    arera: { mark: "no" },
    assoc: { mark: "partial", note: "Direttivo selezionato" },
    linkedin: { mark: "partial", note: "Generalista" },
  },
  {
    label: "Report indipendente",
    dispaccio: { mark: "yes", note: "Annuale, anonimo" },
    arera: { mark: "no" },
    assoc: { mark: "no" },
    linkedin: { mark: "no" },
  },
  {
    label: "Aggiornamenti",
    dispaccio: { mark: "yes", note: "Continui, curati" },
    arera: { mark: "partial", note: "Raw feed" },
    assoc: { mark: "partial", note: "Newsletter" },
    linkedin: { mark: "no", note: "Algoritmo" },
  },
  {
    label: "Tempo di accesso",
    dispaccio: { mark: "yes", note: "Immediato" },
    arera: { mark: "partial", note: "Navigazione faticosa" },
    assoc: { mark: "partial", note: "Attendi evento" },
    linkedin: { mark: "partial", note: "Scrolling" },
  },
];

function MarkCell({
  data,
  highlight = false,
}: {
  data: { mark: Mark; note?: string };
  highlight?: boolean;
}) {
  const icon =
    data.mark === "yes" ? (
      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
    ) : data.mark === "no" ? (
      <XCircle className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
    ) : (
      <MinusCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
    );

  return (
    <td
      className={`px-4 py-4 align-top text-xs sm:text-sm ${
        highlight ? "bg-primary/5" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        {icon}
        {data.note && (
          <span
            className={
              highlight
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            }
          >
            {data.note}
          </span>
        )}
      </div>
    </td>
  );
}

const ALTERNATIVES: {
  key: "arera" | "assoc" | "linkedin";
  label: string;
}[] = [
  { key: "arera", label: "ARERA / GME" },
  { key: "assoc", label: "Associazioni" },
  { key: "linkedin", label: "LinkedIn / Social" },
];

function MarkInline({ data }: { data: { mark: Mark; note?: string } }) {
  const icon =
    data.mark === "yes" ? (
      <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
    ) : data.mark === "no" ? (
      <XCircle className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
    ) : (
      <MinusCircle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      {icon}
      <span className="text-muted-foreground">
        {data.note ?? (data.mark === "no" ? "Non disponibile" : "—")}
      </span>
    </span>
  );
}

export function ComparisonTable() {
  return (
    <section
      id="confronto"
      className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20 md:py-24"
    >
      <div className="mb-8 sm:mb-12 max-w-3xl">
        <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-primary mb-3 font-mono">
          // Alternativa a
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
          Dove andavi prima
        </h2>
        <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-muted-foreground">
          Il Dispaccio sostituisce fonti frammentate, lente e dispersive.
        </p>
      </div>

      {/* Mobile: stacked cards */}
      <div className="space-y-3 md:hidden">
        {ROWS.map((r) => (
          <article
            key={r.label}
            className="dispaccio-card p-4 space-y-3"
          >
            <h3 className="text-sm font-bold tracking-tight">{r.label}</h3>
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-1.5">
                Il Dispaccio
              </p>
              <div className="flex items-center gap-2">
                {r.dispaccio.mark === "yes" ? (
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                ) : r.dispaccio.mark === "no" ? (
                  <XCircle className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                ) : (
                  <MinusCircle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                )}
                <span className="text-sm text-foreground font-medium">
                  {r.dispaccio.note ?? "—"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-1.5 pt-1">
              {ALTERNATIVES.map((alt) => (
                <div key={alt.key} className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70 shrink-0 pt-0.5">
                    {alt.label}
                  </span>
                  <div className="text-right">
                    <MarkInline data={r[alt.key]} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block dispaccio-card overflow-hidden">
        <div className="overflow-x-auto scroll-x-contained">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-primary/20">
                <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Cosa cerchi
                </th>
                <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-primary bg-primary/5">
                  Il Dispaccio
                </th>
                <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  ARERA / GME
                </th>
                <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  Associazioni
                </th>
                <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  LinkedIn / Social
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, idx) => (
                <tr
                  key={r.label}
                  className={
                    idx !== ROWS.length - 1 ? "border-b border-primary/10" : ""
                  }
                >
                  <td className="px-4 py-4 text-sm font-semibold align-top">
                    {r.label}
                  </td>
                  <MarkCell data={r.dispaccio} highlight />
                  <MarkCell data={r.arera} />
                  <MarkCell data={r.assoc} />
                  <MarkCell data={r.linkedin} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
