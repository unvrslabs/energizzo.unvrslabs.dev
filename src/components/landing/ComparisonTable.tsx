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

export function ComparisonTable() {
  return (
    <section id="confronto" className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <div className="mb-12 max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-primary mb-3 font-mono">
          // Alternativa a
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1]">
          Dove andavi prima
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
          Il Dispaccio sostituisce fonti frammentate, lente e dispersive.
        </p>
      </div>

      <div className="dispaccio-card overflow-hidden">
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
