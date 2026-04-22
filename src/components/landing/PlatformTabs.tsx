"use client";

import { useState } from "react";

type TabId = "normativa" | "mercato" | "contenuti" | "community";

interface TabCard {
  pill: string;
  title: string;
  desc: string;
}

const TABS: { id: TabId; label: string }[] = [
  { id: "normativa", label: "Normativa" },
  { id: "mercato", label: "Mercato" },
  { id: "contenuti", label: "Contenuti" },
  { id: "community", label: "Community" },
];

const CONTENT: Record<TabId, TabCard[]> = {
  normativa: [
    {
      pill: "ARERA",
      title: "Delibere ARERA",
      desc: "Ogni delibera rilevante decifrata in meno di una pagina: cosa cambia e come adeguarti.",
    },
    {
      pill: "GME",
      title: "Circolari GME",
      desc: "Aggiornamenti su mercati MGP, MI, MSD e dispacciamento con impatto operativo immediato.",
    },
    {
      pill: "MASE",
      title: "Decreti MASE",
      desc: "Decreti ministeriali e consultazioni pubbliche spiegati senza burocratese.",
    },
    {
      pill: "Oneri",
      title: "Update tariffe",
      desc: "Oneri di sistema, componenti UC, ARIM e TRAS aggiornati in tempo reale.",
    },
  ],
  mercato: [
    {
      pill: "Spot",
      title: "PUN orario",
      desc: "Prezzo Unico Nazionale orario e trend settimanali con commento sui driver di mercato.",
    },
    {
      pill: "Gas",
      title: "PSV gas",
      desc: "Curve PSV day-ahead e front month, confronto con TTF e spread impliciti.",
    },
    {
      pill: "STG",
      title: "Aste STG",
      desc: "Esiti, strategie osservate e implicazioni per chi acquista servizio di ultima istanza.",
    },
    {
      pill: "Switching",
      title: "Benchmark switching",
      desc: "Tassi di switching in entrata/uscita per cluster dimensionale, aggiornati mensilmente.",
    },
  ],
  contenuti: [
    {
      pill: "Audio",
      title: "Podcast",
      desc: '"Il Reseller": 10 episodi a stagione con voci operative del mercato energia italiano.',
    },
    {
      pill: "Weekly",
      title: "Newsletter",
      desc: "Ogni venerdì: 5 cose che sono successe questa settimana nel mercato reseller.",
    },
    {
      pill: "Long form",
      title: "Deep dive",
      desc: "Analisi lunghe su temi complessi: concentrazione, M&A, AI, recupero crediti, CER.",
    },
    {
      pill: "Voices",
      title: "Interviste",
      desc: "Interviste scritte con CEO, direttori commerciali e responsabili trading.",
    },
  ],
  community: [
    {
      pill: "CEO only",
      title: "Forum CEO",
      desc: "Canale privato riservato a CEO e COO: domande rapide, risposte dai peer.",
    },
    {
      pill: "Live",
      title: "Eventi live",
      desc: "Tavole tecniche ARERA, cene off-the-record, roundtable su temi verticali.",
    },
    {
      pill: "1-to-1",
      title: "Mentorship",
      desc: "Match diretti tra reseller in fase early e manager di aziende consolidate.",
    },
    {
      pill: "Ask me",
      title: "Q&A esperti",
      desc: "Sessioni mensili con avvocati, fiscalisti, trader e head of compliance del settore.",
    },
  ],
};

export function PlatformTabs() {
  const [active, setActive] = useState<TabId>("normativa");
  const cards = CONTENT[active];

  return (
    <section
      id="piattaforma"
      className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20 md:py-24"
    >
      <div className="mb-8 sm:mb-12 max-w-3xl">
        <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-primary mb-3 font-mono">
          // Il network
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
          Un hub completo per chi vende energia in Italia
        </h2>
        <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-muted-foreground">
          Oltre 80 fonti monitorate, 100+ reseller nel network, un report
          annuale. Dal giorno zero sei operativo.
        </p>
      </div>

      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex sm:flex-wrap gap-2 mb-6 sm:mb-8 overflow-x-auto scroll-x-contained">
        {TABS.map((t) => {
          const selected = active === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={`shrink-0 whitespace-nowrap px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all ${
                selected
                  ? "bg-primary text-primary-foreground shadow-[0_4px_20px_hsl(158_64%_42%/0.4)]"
                  : "liquid-glass text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={selected}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <article
            key={c.title}
            className="dispaccio-card dispaccio-card-hover p-6 animate-fade-in-up"
          >
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-[0.15em] mb-4">
              {c.pill}
            </span>
            <h3 className="text-lg font-bold tracking-tight mb-2">
              {c.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {c.desc}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
