"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface QA {
  q: string;
  a: string;
}

const FAQS: QA[] = [
  {
    q: "Cos'è Il Dispaccio?",
    a: "Il Dispaccio è il primo network editoriale e operativo dedicato ai reseller energia italiani. Non è un software, non è un'associazione: è un hub di contenuti curati (delibere, tariffe, podcast, eventi) + un report indipendente annuale + una community privata per CEO e COO del settore.",
  },
  {
    q: "Quanto costa l'accesso?",
    a: "Per i venditori energia operativi in Italia l'accesso al network è gratuito, in cambio della partecipazione al sondaggio annuale che alimenta il report di settore. Nessun abbonamento, nessuna quota.",
  },
  {
    q: "Come faccio a entrare?",
    a: "Compila il form di richiesta che trovi in cima alla pagina con ragione sociale, P.IVA, referente e WhatsApp. La tua candidatura verrà presa in carico e analizzata: se il profilo rispetta i requisiti ti ricontattiamo e ti spieghiamo la procedura di ammissione.",
  },
  {
    q: "Cosa include il report privato?",
    a: "Il report privato della tua azienda contiene il posizionamento su costi operativi, switching rate, margine medio, adozione AI, esposizione morosità e compliance ARERA, confrontato in anonimato con i peer della tua fascia dimensionale.",
  },
  {
    q: "I miei dati sono al sicuro?",
    a: "Sì. Tutte le risposte sono aggregate: nessun dato individuale sarà mai pubblicato o associato al nome della tua azienda. Solo il benchmark di fascia verrà condiviso, e solo con i partecipanti.",
  },
  {
    q: "Il podcast dove lo vedo?",
    a: "Il Reseller è un podcast video. Ogni episodio viene pubblicato su YouTube, LinkedIn, Instagram, X e direttamente sulla piattaforma del Dispaccio. I membri del network hanno accesso anche alle trascrizioni complete e alla knowledge base degli episodi, e possono proporre temi e ospiti.",
  },
  {
    q: "Chi gestisce Il Dispaccio?",
    a: "Il Dispaccio è una piattaforma indipendente sponsorizzata da Energizzo. La sponsorizzazione copre i costi operativi: redazione, contenuti e community restano indipendenti dai vendor di settore.",
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-4xl px-6 py-20 sm:py-24">
      <div className="mb-12 max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-primary mb-3 font-mono">
          // FAQ
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1]">
          Domande frequenti
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
          Tutto quello che ti serve sapere.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((item, idx) => {
          const open = openIdx === idx;
          const panelId = `faq-panel-${idx}`;
          const buttonId = `faq-button-${idx}`;
          return (
            <div
              key={item.q}
              className="dispaccio-card dispaccio-card-hover p-5"
            >
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIdx(open ? null : idx)}
                className="w-full flex items-center justify-between gap-4 text-left"
              >
                <h3 className="text-base sm:text-lg font-bold tracking-tight">
                  {item.q}
                </h3>
                <ChevronDown
                  className={`h-5 w-5 text-primary flex-shrink-0 transition-transform duration-300 ${
                    open ? "rotate-180" : ""
                  }`}
                  aria-hidden
                />
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={`grid transition-all duration-300 ease-out ${
                  open
                    ? "grid-rows-[1fr] opacity-100 mt-4"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
