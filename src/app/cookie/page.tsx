import type { Metadata } from "next";
import { LegalLayout } from "@/components/landing-v2/LegalLayout";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Informativa cookie di Il Dispaccio: tipologie di cookie utilizzati, finalità, durata e modalità di gestione del consenso.",
  alternates: { canonical: "https://ildispaccio.energy/cookie" },
  robots: { index: true, follow: true },
};

export default function CookiePage() {
  return (
    <LegalLayout kicker="// Legale · ePrivacy" title="Cookie Policy" updated="23 aprile 2026">
      <section>
        <h2>1. Cosa sono i cookie</h2>
        <p>
          I cookie sono piccoli file di testo che i siti visitati depositano sul
          dispositivo dell&apos;Utente. Consentono di far funzionare il sito, di
          ricordarne le preferenze e — previo consenso — di raccogliere statistiche
          anonime e profilare contenuti di marketing. Disciplina applicabile: art.
          122 D.Lgs. 196/2003 (ePrivacy) e GDPR (Reg. UE 2016/679).
        </p>
      </section>

      <section>
        <h2>2. Categorie di cookie utilizzati</h2>

        <h3>2.1 Cookie tecnici / necessari (consenso non richiesto)</h3>
        <p>
          Sono indispensabili al funzionamento del sito e all&apos;erogazione dei
          servizi esplicitamente richiesti:
        </p>
        <ul>
          <li>
            <code>ildispaccio_network</code> — cookie di sessione per l&apos;area
            riservata network. Durata: sessione / max 30 giorni.
          </li>
          <li>
            <code>ildispaccio_admin</code> — cookie di sessione per l&apos;area
            admin (<code>dash.ildispaccio.energy</code>). Durata: sessione.
          </li>
          <li>
            <code>ild-cookie-consent</code> (localStorage) — memorizza le
            preferenze di consenso cookie dell&apos;Utente. Durata: 12 mesi.
          </li>
          <li>
            <code>sb-*-auth-token</code> — cookie Supabase per autenticazione OTP.
            Durata: sessione.
          </li>
        </ul>

        <h3>2.2 Cookie analitici (consenso richiesto)</h3>
        <p>
          Attivati solo previo consenso tramite banner. Vengono utilizzati per
          raccogliere dati aggregati e anonimi sul numero di visitatori, pagine
          visualizzate, durata media della visita. I dati non permettono
          l&apos;identificazione dell&apos;Utente.
        </p>

        <h3>2.3 Cookie di marketing (consenso richiesto)</h3>
        <p>
          Attivati solo previo consenso tramite banner. Permettono di proporre
          contenuti coerenti con gli interessi dell&apos;Utente su piattaforme
          social (LinkedIn, X). Nessuna profilazione sensibile.
        </p>
      </section>

      <section>
        <h2>3. Gestione del consenso</h2>
        <p>
          Al primo accesso viene mostrato un banner che consente di:
        </p>
        <ul>
          <li>
            <strong>Accettare tutti</strong> i cookie (necessari, analisi,
            marketing).
          </li>
          <li>
            <strong>Rifiutare i cookie non necessari</strong> — mantengono attivi
            solo i cookie tecnici.
          </li>
          <li>
            <strong>Personalizzare</strong> il consenso per singola categoria.
          </li>
        </ul>
        <p>
          Il consenso viene memorizzato localmente nel browser per 12 mesi, salvo
          modifiche. È possibile modificare o revocare il consenso in qualsiasi
          momento cancellando i dati di navigazione del browser, oppure contattando{" "}
          <a href="mailto:membri@ildispaccio.energy">
            membri@ildispaccio.energy
          </a>
          .
        </p>
      </section>

      <section>
        <h2>4. Cookie di terze parti</h2>
        <p>
          Alcune funzionalità del sito possono attivare cookie di terze parti,
          elencati di seguito con link alle rispettive informative:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> (autenticazione, sessioni) —{" "}
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              supabase.com/privacy
            </a>
          </li>
          <li>
            <strong>Meta WhatsApp Business</strong> (invio OTP) —{" "}
            <a
              href="https://www.whatsapp.com/legal/business-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              whatsapp.com/legal/business-policy
            </a>
          </li>
          <li>
            <strong>LinkedIn Insight Tag</strong> (marketing, solo se consenso) —{" "}
            <a
              href="https://www.linkedin.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              linkedin.com/legal/privacy-policy
            </a>
          </li>
          <li>
            <strong>X (Twitter) Pixel</strong> (marketing, solo se consenso) —{" "}
            <a
              href="https://twitter.com/en/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              twitter.com/en/privacy
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Come disattivare i cookie dal browser</h2>
        <p>
          L&apos;Utente può configurare il proprio browser per bloccare o
          eliminare i cookie:
        </p>
        <ul>
          <li>
            Chrome:{" "}
            <a
              href="https://support.google.com/chrome/answer/95647"
              target="_blank"
              rel="noopener noreferrer"
            >
              support.google.com/chrome/answer/95647
            </a>
          </li>
          <li>
            Safari:{" "}
            <a
              href="https://support.apple.com/guide/safari/manage-cookies-sfri11471"
              target="_blank"
              rel="noopener noreferrer"
            >
              support.apple.com
            </a>
          </li>
          <li>
            Firefox:{" "}
            <a
              href="https://support.mozilla.org/kb/attivare-disattivare-cookie"
              target="_blank"
              rel="noopener noreferrer"
            >
              support.mozilla.org
            </a>
          </li>
          <li>
            Edge:{" "}
            <a
              href="https://support.microsoft.com/microsoft-edge"
              target="_blank"
              rel="noopener noreferrer"
            >
              support.microsoft.com/microsoft-edge
            </a>
          </li>
        </ul>
        <p>
          La disattivazione dei cookie tecnici necessari può compromettere il
          funzionamento del sito.
        </p>
      </section>

      <section>
        <h2>6. Contatti</h2>
        <p>
          Per qualsiasi domanda sull&apos;uso dei cookie:{" "}
          <a href="mailto:membri@ildispaccio.energy">
            membri@ildispaccio.energy
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  );
}
