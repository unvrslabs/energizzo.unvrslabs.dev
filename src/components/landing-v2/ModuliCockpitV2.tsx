import {
  FileText,
  BookOpen,
  CalendarClock,
  Activity,
  Flame,
  Mic,
  type LucideIcon,
} from "lucide-react";

type Modulo = {
  Icon: LucideIcon;
  title: string;
  tagline: string;
  items: string[];
  badge?: string;
};

const MODULI: Modulo[] = [
  {
    Icon: FileText,
    title: "Delibere ARERA",
    tagline: "433 atti indicizzati · summary AI su click",
    badge: "AI",
    items: [
      "Sync automatico dall'API ARERA ogni 4 ore",
      "Agente AI estrae 4 bullet operativi dal PDF",
      "Badge rosso automatico sui cambi tariffari",
      "Date pubblicazione reali scrapate da ARERA",
    ],
  },
  {
    Icon: BookOpen,
    title: "Testi Integrati",
    tagline: "61 testi consolidati ARERA",
    items: [
      "TIT, TIV, TIS, TIUC, TIMOE e tutti gli altri",
      "Link bidirezionale alla delibera di riferimento",
      "Summary AI on-demand con preview hover",
      "Download PDF proxied (bypassa 403 storage)",
    ],
  },
  {
    Icon: CalendarClock,
    title: "Scadenze regolatorie",
    tagline: "Estratte dai PDF via AI",
    badge: "AI",
    items: [
      "Date di entrata vigore, adempimenti, consultazioni",
      "Raggruppate per mese, severity giorni mancanti",
      "Link diretto alla delibera fonte",
      "Tipologia colorata (adempimento, asta, reporting…)",
    ],
  },
  {
    Icon: Activity,
    title: "Price Engine",
    tagline: "Oneri tariffari ARERA mese per mese",
    items: [
      "Toggle Luce / Gas · select competenza mese",
      "13 tipologie OT × 18 componenti (ASOS, ARIM, TAU, UC6, MIS, TRAS…)",
      "Sincronizzazione giornaliera da Energizzo API",
      "URL deep-linkable per condividere il mese",
    ],
  },
  {
    Icon: Flame,
    title: "Mercato gas",
    tagline: "Stoccaggi Italia live",
    badge: "nuovo",
    items: [
      "Riempimento %, iniezione/prelievo, trend 24h",
      "Grafico 12 mesi con markers min/max/oggi",
      "Tabella 14 giorni + KPI capacità",
      "Fonte AGSI+ (Stogit · Edison · IGS)",
    ],
  },
  {
    Icon: Mic,
    title: "Podcast video",
    tagline: "&ldquo;Il Reseller&rdquo; · 10 episodi/stagione",
    items: [
      "Interviste video 1 a 1 di 20 minuti",
      "Invito editoriale dedicato per gli ospiti",
      "Knowledge base e trascrizioni riservate",
      "Ospiti del network propongono temi",
    ],
  },
];

export function ModuliCockpitV2() {
  return (
    <section id="moduli" className="lv2-section">
      <div className="lv2-container">
        <div className="max-w-3xl mb-14">
          <div className="lv2-kicker mb-5">// Nell&apos;area riservata trovi</div>
          <h2 className="lv2-h2 mb-4">
            6 moduli operativi, <em>un</em> unico login.
          </h2>
          <p className="lv2-lede">
            Ogni modulo è pensato per un momento del tuo lavoro:
            leggere la normativa, pianificare le scadenze, simulare le bollette,
            monitorare il mercato.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {MODULI.map((m) => (
            <article key={m.title} className="lv2-card lv2-card--hover flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div
                  className="grid place-items-center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "hsl(var(--lv2-accent) / 0.12)",
                    color: "hsl(var(--lv2-accent))",
                    border: "1px solid hsl(var(--lv2-accent) / 0.28)",
                  }}
                >
                  <m.Icon className="w-5 h-5" />
                </div>
                {m.badge && (
                  <span
                    className="lv2-mono"
                    style={{
                      fontSize: "9.5px",
                      fontWeight: 700,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      padding: "3px 8px",
                      borderRadius: 999,
                      color: "hsl(var(--lv2-accent))",
                      background: "hsl(var(--lv2-accent) / 0.12)",
                      border: "1px solid hsl(var(--lv2-accent) / 0.3)",
                    }}
                  >
                    {m.badge}
                  </span>
                )}
              </div>

              <div>
                <h3
                  className="text-[17px] font-bold tracking-tight"
                  style={{ color: "hsl(var(--lv2-text))", letterSpacing: "-0.015em" }}
                  dangerouslySetInnerHTML={{ __html: m.title }}
                />
                <p
                  className="text-[12.5px] mt-1"
                  style={{ color: "hsl(var(--lv2-text-mute))" }}
                  dangerouslySetInnerHTML={{ __html: m.tagline }}
                />
              </div>

              <ul className="flex flex-col gap-1.5 text-[13px]" style={{ color: "hsl(var(--lv2-text-dim))" }}>
                {m.items.map((item) => (
                  <li key={item} className="flex gap-2.5 items-start">
                    <span
                      className="shrink-0 mt-1.5"
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 999,
                        background: "hsl(var(--lv2-accent))",
                      }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
