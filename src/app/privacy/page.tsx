import type { Metadata } from "next";
import { LegalLayout } from "@/components/landing-v2/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Informativa privacy di Il Dispaccio ai sensi del Regolamento UE 2016/679 (GDPR) e del D.Lgs. 196/2003 e successive modifiche.",
  alternates: { canonical: "https://ildispaccio.energy/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalLayout kicker="// Legale · GDPR" title="Privacy Policy" updated="23 aprile 2026">
      <section>
        <h2>1. Titolare del trattamento</h2>
        <p>
          Il titolare del trattamento dei dati personali raccolti tramite il sito
          <strong> ildispaccio.energy</strong> e il sottodominio{" "}
          <strong>dash.ildispaccio.energy</strong> è <strong>UNVRS Labs</strong>.
          Contatto per l&apos;esercizio dei diritti privacy:{" "}
          <a href="mailto:membri@ildispaccio.energy">membri@ildispaccio.energy</a>.
        </p>
      </section>

      <section>
        <h2>2. Tipologie di dati raccolti</h2>
        <p>I dati personali trattati comprendono:</p>
        <ul>
          <li>
            <strong>Dati identificativi e di contatto</strong>: ragione sociale,
            partita IVA, nome e cognome del referente, indirizzo e-mail, numero di
            telefono mobile (WhatsApp).
          </li>
          <li>
            <strong>Dati aziendali</strong> forniti tramite il survey editoriale
            (23 domande): fascia fatturato, numero clienti, canali acquisizione,
            margine medio, adozione di strumenti digitali, esposizione morosità,
            compliance regolatoria.
          </li>
          <li>
            <strong>Dati di autenticazione</strong>: hash OTP (one-time password)
            inviati via WhatsApp, cookie di sessione strettamente necessari.
          </li>
          <li>
            <strong>Dati tecnici</strong>: indirizzo IP, user-agent, timestamp di
            accesso, log di sicurezza.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Finalità e base giuridica del trattamento</h2>
        <ul>
          <li>
            <strong>Gestione del network e invio contenuti editoriali</strong>{" "}
            (delibere, podcast, report): base giuridica art. 6.1(b) GDPR —
            esecuzione di misure precontrattuali e contrattuali.
          </li>
          <li>
            <strong>Autenticazione OTP via WhatsApp</strong>: base giuridica art.
            6.1(b) GDPR — esecuzione del servizio richiesto.
          </li>
          <li>
            <strong>Elaborazione del report di settore in forma aggregata e
            anonima</strong>: base giuridica art. 6.1(f) GDPR — legittimo interesse
            dell&apos;Utente e della community a ricevere benchmark di mercato.
          </li>
          <li>
            <strong>Obblighi di legge</strong> (contabilità, sicurezza informatica,
            tracciamento accessi): base giuridica art. 6.1(c) GDPR.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Modalità del trattamento e tempi di conservazione</h2>
        <p>
          I dati sono trattati con strumenti elettronici, con misure tecniche e
          organizzative adeguate (cifratura TLS in transito, database protetti,
          accessi amministrativi con OTP). I dati sono conservati per il tempo
          strettamente necessario alle finalità per cui sono stati raccolti:
        </p>
        <ul>
          <li>
            Dati account membro network: per tutta la durata del rapporto + 24
            mesi.
          </li>
          <li>Dati survey: 5 anni (tempo medio di validità del benchmark).</li>
          <li>Log tecnici di sicurezza: 12 mesi.</li>
          <li>
            Dati di contatto per newsletter/editoriale: fino a revoca del consenso.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Destinatari e trasferimenti extra-UE</h2>
        <p>
          I dati possono essere comunicati a fornitori di servizi che agiscono
          come responsabili del trattamento ex art. 28 GDPR, tra cui:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> (infrastruttura database e autenticazione) —
            regione UE, DPA firmato.
          </li>
          <li>
            <strong>WaSender / Meta WhatsApp</strong> (invio OTP via WhatsApp) —
            trasferimento extra-UE con clausole contrattuali standard (SCC) UE.
          </li>
          <li>
            <strong>Anthropic</strong> (generazione riassunti AI delle delibere in
            forma anonima, senza dati personali) — trasferimento extra-UE con SCC.
          </li>
          <li>
            <strong>Hetzner</strong> (hosting infrastrutturale) — regione UE.
          </li>
        </ul>
        <p>
          Non viene effettuata alcuna attività di profilazione automatizzata che
          produca effetti giuridici sull&apos;Utente.
        </p>
      </section>

      <section>
        <h2>6. Diritti dell&apos;interessato</h2>
        <p>Ai sensi degli artt. 15–22 GDPR l&apos;Utente può esercitare:</p>
        <ul>
          <li>Diritto di accesso ai propri dati.</li>
          <li>Diritto di rettifica e aggiornamento.</li>
          <li>
            Diritto di cancellazione (&quot;diritto all&apos;oblio&quot;) nei limiti
            previsti dalla legge.
          </li>
          <li>Diritto di limitazione del trattamento.</li>
          <li>Diritto alla portabilità dei dati.</li>
          <li>Diritto di opposizione al trattamento.</li>
          <li>Diritto di revocare il consenso in qualsiasi momento.</li>
          <li>
            Diritto di proporre reclamo al <strong>Garante per la Protezione dei
            Dati Personali</strong> (<a href="https://www.garanteprivacy.it">
              www.garanteprivacy.it
            </a>
            ).
          </li>
        </ul>
        <p>
          Le richieste vanno inoltrate a{" "}
          <a href="mailto:membri@ildispaccio.energy">membri@ildispaccio.energy</a>.
          La risposta avviene entro 30 giorni dalla ricezione.
        </p>
      </section>

      <section>
        <h2>7. Cookie</h2>
        <p>
          Il sito utilizza cookie tecnici necessari al funzionamento e, previo
          consenso, cookie analitici e di marketing. Maggiori dettagli nella{" "}
          <a href="/cookie">Cookie Policy dedicata</a>.
        </p>
      </section>

      <section>
        <h2>8. Modifiche alla presente informativa</h2>
        <p>
          La presente informativa può essere aggiornata per adeguamenti normativi o
          modifiche dei servizi. La data di ultimo aggiornamento è indicata in
          testa al documento. Modifiche sostanziali saranno comunicate ai membri
          del network via e-mail.
        </p>
      </section>
    </LegalLayout>
  );
}
