import { FileText, Mic, Radar } from "lucide-react";

function DelibereMini() {
  return (
    <div className="mt-5 rounded-lg border border-[hsl(var(--lv2-border))] bg-[hsl(var(--lv2-bg-elev))] p-3">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="lv2-mono"
          style={{
            fontSize: "9.5px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "hsl(var(--lv2-text-mute))",
          }}
        >
          Delibera 548/2025/R/eel
        </span>
        <span style={{ flex: 1 }} />
        <span
          className="lv2-mono"
          style={{
            fontSize: "9.5px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "2px 7px",
            borderRadius: 999,
            border: "1px solid hsl(var(--lv2-accent) / 0.3)",
            color: "hsl(var(--lv2-accent))",
            background: "hsl(var(--lv2-accent) / 0.1)",
          }}
        >
          AI summary
        </span>
      </div>
      <ul className="space-y-1.5 text-[12.5px] text-[hsl(var(--lv2-text-dim))] leading-snug">
        <li>• TRAS aggiornata, +0,12 €/MWh sui clienti BT</li>
        <li>• Nuovi obblighi di rendicontazione trimestrale</li>
        <li>• Impatto stimato sul margine: −0,8% medio</li>
      </ul>
    </div>
  );
}

function PodcastMini() {
  return (
    <div className="mt-5 rounded-lg border border-[hsl(var(--lv2-border))] bg-[hsl(var(--lv2-bg-elev))] p-3 flex items-center gap-3">
      <div
        className="grid place-items-center shrink-0"
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background:
            "linear-gradient(135deg, hsl(var(--lv2-accent)), hsl(var(--lv2-accent-soft)))",
          color: "hsl(215 30% 10%)",
          fontWeight: 800,
          fontSize: 14,
          fontFamily: "var(--font-mono), monospace",
        }}
      >
        01
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-[13px] truncate">
          STG verso il libero
        </div>
        <div
          className="lv2-mono"
          style={{
            fontSize: "10.5px",
            color: "hsl(var(--lv2-text-mute))",
            marginTop: 2,
          }}
        >
          Marco Bianchi · Head of Trading · 22 min
        </div>
      </div>
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          background: "hsl(var(--lv2-accent))",
          display: "grid",
          placeItems: "center",
          color: "hsl(215 30% 10%)",
          fontSize: 11,
        }}
      >
        ▶
      </span>
    </div>
  );
}

function ReportMini() {
  return (
    <div className="mt-5 rounded-lg border border-[hsl(var(--lv2-border))] bg-[hsl(var(--lv2-bg-elev))] p-3">
      <div className="flex items-center justify-between mb-2">
        <span
          className="lv2-mono"
          style={{
            fontSize: "9.5px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "hsl(var(--lv2-text-mute))",
          }}
        >
          Anno I — Autunno 2026
        </span>
        <span
          className="lv2-mono"
          style={{ fontSize: "10px", color: "hsl(var(--lv2-accent))" }}
        >
          100 / 100
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {[68, 82, 54, 91, 74, 88, 62, 79].map((v, i) => (
          <div
            key={i}
            style={{
              height: 38,
              borderRadius: 4,
              background: `linear-gradient(to top, hsl(var(--lv2-accent) / ${0.15 + v / 400}) 0%, hsl(var(--lv2-accent) / ${0.4 + v / 300}) ${v}%, transparent ${v}%)`,
              border: "1px solid hsl(var(--lv2-border))",
            }}
          />
        ))}
      </div>
    </div>
  );
}

const PILLARS = [
  {
    Icon: Radar,
    label: "I.",
    title: "Cockpit regolatorio",
    desc: "Delibere ARERA, circolari GME, decreti MASE. Ogni atto riassunto in bullet operativi da un agente AI: cosa cambia, chi è impattato, entro quando.",
    mini: <DelibereMini />,
  },
  {
    Icon: Mic,
    label: "II.",
    title: "Podcast &laquo;Il Reseller&raquo;",
    desc: "Interviste video 1 a 1 con CEO, trader, COO. Invito editoriale dedicato, briefing puntata, knowledge base e trascrizioni riservate ai membri.",
    mini: <PodcastMini />,
  },
  {
    Icon: FileText,
    label: "III.",
    title: "Report indipendente",
    desc: "Il primo benchmark annuale del settore reseller italiano. Switching, margini, AI, recupero crediti. Dati aggregati, restituiti come report privato al partecipante.",
    mini: <ReportMini />,
  },
];

export function PillarsV2() {
  return (
    <section id="piattaforma" className="lv2-section">
      <div className="lv2-container">
        <div className="max-w-3xl mb-14">
          <div className="lv2-kicker mb-5">// Il network</div>
          <h2 className="lv2-h2 mb-4">
            Tre pilastri, <em>un</em> unico hub operativo.
          </h2>
          <p className="lv2-lede">
            Tutto quello che un reseller energia italiano deve leggere,
            ascoltare e misurare, reso navigabile in un&apos;unica piattaforma
            riservata.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {PILLARS.map((p) => (
            <article key={p.title} className="lv2-card lv2-card--hover">
              <div className="flex items-start justify-between gap-4 mb-5">
                <span
                  className="lv2-serif"
                  style={{
                    fontStyle: "italic",
                    fontSize: 34,
                    fontWeight: 300,
                    color: "hsl(var(--lv2-accent))",
                    lineHeight: 1,
                  }}
                >
                  {p.label}
                </span>
                <span
                  className="grid place-items-center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    border: "1px solid hsl(var(--lv2-border-strong))",
                    background: "hsl(var(--lv2-bg-elev))",
                    color: "hsl(var(--lv2-accent))",
                  }}
                >
                  <p.Icon className="w-5 h-5" />
                </span>
              </div>
              <h3
                className="text-xl font-bold tracking-tight mb-2"
                dangerouslySetInnerHTML={{ __html: p.title }}
              />
              <p
                className="text-sm leading-relaxed"
                style={{ color: "hsl(var(--lv2-text-dim))" }}
              >
                {p.desc}
              </p>
              {p.mini}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
