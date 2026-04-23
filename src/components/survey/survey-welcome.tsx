"use client";

import { ArrowRight } from "lucide-react";
import type { LeadForSurvey } from "@/lib/survey/survey-client";

/**
 * Welcome invito · stile editoriale riservato.
 * Palette monocroma + unico accent emerald scuro. Nessuna emoji, solo tipografia.
 */
export function SurveyWelcome({
  lead,
  onStart,
}: {
  lead: LeadForSurvey;
  onStart: () => void;
}) {
  const totalInvites = 100;
  const numeroPadded =
    lead.invite_number != null ? String(lead.invite_number).padStart(3, "0") : "—";
  const today = new Date().toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="invito-welcome">
      <div className="invito-sheet">
        {/* Header: confidenziale + numero */}
        <header className="invito-header">
          <div className="invito-header-line">
            <span className="invito-kicker">Documento riservato</span>
            <span className="invito-divider" aria-hidden />
            <span className="invito-kicker">{today}</span>
          </div>

          <div className="invito-brand-row">
            <svg
              className="invito-monogram"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1" />
              <text
                x="20"
                y="26"
                textAnchor="middle"
                fontFamily="Newsreader, serif"
                fontSize="18"
                fontStyle="italic"
                fill="currentColor"
              >
                D
              </text>
            </svg>
            <span className="invito-brand">Il Dispaccio</span>
          </div>

          <div className="invito-number-plate">
            <span className="invito-number-label">Invito nominale</span>
            <span className="invito-number-big">
              N.&nbsp;{numeroPadded}
              <span className="invito-number-total"> / {String(totalInvites).padStart(3, "0")}</span>
            </span>
          </div>
        </header>

        <div className="invito-rule" />

        {/* Titolo + intro */}
        <section className="invito-intro">
          <h1 className="invito-title">
            <em>Complimenti,</em>
            <br />
            {lead.ragione_sociale}.
          </h1>
          <p className="invito-lede">
            Siamo lieti di comunicarvi che la vostra azienda è stata selezionata
            per entrare nella prima ondata del network <em>Il Dispaccio</em> —
            100 reseller energia italiani riuniti in un circolo chiuso.
          </p>
        </section>

        <div className="invito-rule" />

        {/* Ragione della scelta */}
        <section className="invito-block">
          <span className="invito-block-label">I · La selezione</span>
          <p className="invito-body">
            Il Dispaccio non è aperto a tutti. Ogni membro è scelto uno a uno
            per il peso nel mercato reseller italiano. Voi siete{" "}
            <strong>uno dei 100</strong> professionisti della prima ondata.
            Questo documento è personale e non trasferibile.
          </p>
        </section>

        <section className="invito-block">
          <span className="invito-block-label">II · La finestra</span>
          <p className="invito-body">
            La vostra posizione resta riservata per <strong>72 ore</strong>.
            Per attivarla occorre completare il questionario d'ingresso —
            circa <strong>due minuti</strong>. Trascorso il termine,
            l'invito decade e il posto passa al prossimo in lista.
          </p>
        </section>

        <section className="invito-block">
          <span className="invito-block-label">III · Cosa riceverete</span>
          <ul className="invito-list">
            <li>
              <strong>Delibere ARERA intelligenti</strong>{" "}
              <span className="invito-hyphen">—</span> ogni atto sommarizzato
              dall'AI con bullet operativi, file originali ARERA allegati e
              chat con agente AI per chiedere qualsiasi cosa: implicazioni,
              interpretazioni, prima/dopo, scadenze, formulari.
            </li>
            <li>
              <strong>Tutti i valori del retail market</strong>{" "}
              <span className="invito-hyphen">—</span> per luce e gas:
              mercato all'ingrosso, commercializzazione, dispacciamento,
              oneri di sistema, servizi di rete, accisa. Aggiornamenti
              continui e prima/dopo applicato ai vostri contratti tipo.
            </li>
            <li>
              <strong>Il Reseller</strong>{" "}
              <span className="invito-hyphen">—</span> podcast con CEO e COO
              del settore, accessibile in anteprima ai membri.
            </li>
            <li>
              <strong>Eventi riservati</strong>{" "}
              <span className="invito-hyphen">—</span> tavoli di lavoro,
              incontri con regulator e player di primo piano.
            </li>
            <li>
              <strong>Report annuale di mercato</strong>{" "}
              <span className="invito-hyphen">—</span> benchmark indipendente
              del reseller Italia, aggregato dai dati dei membri, pubblicato
              una volta l'anno.
            </li>
            <li>
              <strong>Community chiusa</strong>{" "}
              <span className="invito-hyphen">—</span> scambio diretto tra
              reseller ammessi. Zero fornitori, zero consulenti, zero broker.
            </li>
          </ul>
        </section>

        <section className="invito-block">
          <span className="invito-block-label">IV · Gratuito. Per sempre.</span>
          <p className="invito-body">
            L'ammissione al network è <strong>gratuita</strong> e tutte le
            funzionalità lo resteranno. Nessuna fee d'ingresso, nessun
            abbonamento, nessuna carta di credito richiesta — ora né in futuro.
          </p>
        </section>

        <section className="invito-block">
          <span className="invito-block-label">V · Come si attiva</span>
          <p className="invito-body">
            Compilate il questionario d'ingresso: serve a calibrare i
            contenuti che il network farà vedere alla vostra azienda per primi.
            Al termine lasciate il vostro WhatsApp e accedete immediatamente
            all'area riservata — nessuna attesa, nessuna approvazione manuale.
          </p>
        </section>

        <div className="invito-rule invito-rule--short" />

        {/* CTA */}
        <section className="invito-cta-block">
          <button type="button" onClick={onStart} className="invito-cta">
            Attiva il mio accesso
            <ArrowRight className="invito-cta-icon" />
          </button>
          <p className="invito-cta-note">
            Il progresso viene salvato automaticamente: potete interrompere e
            riprendere in qualsiasi momento, dallo stesso dispositivo o da un
            altro.
          </p>
        </section>

        <div className="invito-rule" />

        {/* Footer firmato */}
        <footer className="invito-footer">
          <div className="invito-sign">
            <span className="invito-sign-cursive">Il Dispaccio</span>
            <span className="invito-sign-meta">
              Network italiano reseller energia
            </span>
            <span className="invito-sign-sponsor">
              <span className="invito-sponsor-label">Sponsorizzato da</span>
              <span className="invito-sponsor-name">Energizzo</span>
            </span>
          </div>
          <div className="invito-stamp">
            <span className="invito-stamp-label">Inv.</span>
            <span className="invito-stamp-number">{numeroPadded}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
