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
    a: "Il primo network editoriale e operativo dedicato ai reseller energia italiani. Non è un software, non è un'associazione: è un hub di contenuti curati (delibere, tariffe, podcast) + un report indipendente annuale + una community privata per CEO e COO del settore.",
  },
  {
    q: "Quanto costa l'accesso?",
    a: "L'accesso al network è gratuito, ora e per sempre. I costi operativi sono coperti da Energizzo, sponsor ufficiale. In cambio chiediamo la partecipazione al survey annuale che alimenta il report di settore.",
  },
  {
    q: "Come faccio a entrare?",
    a: "Compili il form con ragione sociale, P.IVA, referente e WhatsApp. Se il profilo rispetta i requisiti ricevi un invito editoriale con il tuo numero N/100 e un survey di 23 domande. Completato il survey attivi l'accesso al cockpit con OTP via WhatsApp.",
  },
  {
    q: "Cosa include il cockpit riservato?",
    a: "Home con ticker PUN/PSV/TTF live, archivio delibere ARERA con riassunti AI in bullet operativi, scadenze regolatorie, preview del price engine (beta Q2 2026) e archivio podcast con trascrizioni riservate.",
  },
  {
    q: "Cosa include il report privato?",
    a: "Il report privato della tua azienda contiene il posizionamento su costi operativi, switching rate, margine medio, adozione AI, esposizione morosità e compliance ARERA, confrontato in anonimato con i peer della tua fascia dimensionale.",
  },
  {
    q: "I miei dati sono al sicuro?",
    a: "Sì. Tutte le risposte sono aggregate: nessun dato individuale sarà mai pubblicato o associato al nome della tua azienda. Solo il benchmark di fascia viene condiviso, e solo con i partecipanti.",
  },
  {
    q: "Chi gestisce Il Dispaccio?",
    a: "Il Dispaccio è una piattaforma indipendente sponsorizzata da Energizzo. La sponsorizzazione copre i costi operativi: redazione, contenuti e community restano indipendenti dai vendor di settore.",
  },
];

export function FAQV2() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="lv2-section">
      <div className="lv2-container max-w-4xl">
        <div className="max-w-3xl mb-12">
          <div className="lv2-kicker mb-5">// FAQ</div>
          <h2 className="lv2-h2 mb-4">
            Domande <em>frequenti</em>.
          </h2>
          <p className="lv2-lede">Tutto quello che ti serve sapere prima di entrare.</p>
        </div>

        <div>
          {FAQS.map((item, idx) => {
            const open = openIdx === idx;
            return (
              <div key={item.q} className="lv2-faq-item">
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? null : idx)}
                  className="lv2-faq-button"
                  aria-expanded={open}
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
                    style={{ color: "hsl(var(--lv2-accent))" }}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className="lv2-faq-panel">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
