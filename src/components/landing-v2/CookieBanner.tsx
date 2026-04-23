"use client";

import { useEffect, useState } from "react";
import { X, Settings2 } from "lucide-react";

const STORAGE_KEY = "ild-cookie-consent";
const VERSION = 1;

type Consent = {
  version: number;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
};

function loadConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Consent;
    if (parsed.version !== VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveConsent(analytics: boolean, marketing: boolean) {
  const consent: Consent = {
    version: VERSION,
    necessary: true,
    analytics,
    marketing,
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    /* storage unavailable */
  }
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = loadConsent();
    if (!existing) setVisible(true);
  }, []);

  const accept = (a: boolean, m: boolean) => {
    saveConsent(a, m);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="ild-cookie-root" role="dialog" aria-labelledby="cookie-title">
      <div className="ild-cookie-card">
        {!customize ? (
          <>
            <div className="ild-cookie-head">
              <div>
                <div className="ild-cookie-kicker">// Cookie · GDPR</div>
                <div id="cookie-title" className="ild-cookie-title">
                  Questo sito usa i cookie
                </div>
              </div>
              <button
                type="button"
                aria-label="Chiudi (rifiuta non necessari)"
                onClick={() => accept(false, false)}
                className="ild-cookie-close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="ild-cookie-body">
              Usiamo cookie tecnici necessari al funzionamento del sito e, previo tuo
              consenso, cookie di analisi e marketing per migliorare l&apos;esperienza.
              Puoi accettare tutto, rifiutare i non necessari o personalizzare le
              preferenze. Dettagli nella{" "}
              <a href="/cookie" className="ild-cookie-link">
                Cookie Policy
              </a>
              .
            </p>
            <div className="ild-cookie-actions">
              <button
                type="button"
                onClick={() => accept(true, true)}
                className="ild-cookie-btn ild-cookie-btn-primary"
              >
                Accetta tutti
              </button>
              <button
                type="button"
                onClick={() => accept(false, false)}
                className="ild-cookie-btn ild-cookie-btn-ghost"
              >
                Rifiuta non necessari
              </button>
              <button
                type="button"
                onClick={() => setCustomize(true)}
                className="ild-cookie-btn ild-cookie-btn-link"
              >
                <Settings2 className="w-3.5 h-3.5" />
                Personalizza
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="ild-cookie-head">
              <div>
                <div className="ild-cookie-kicker">// Preferenze</div>
                <div id="cookie-title" className="ild-cookie-title">
                  Scegli cosa accettare
                </div>
              </div>
              <button
                type="button"
                aria-label="Torna indietro"
                onClick={() => setCustomize(false)}
                className="ild-cookie-close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="ild-cookie-options">
              <label className="ild-cookie-option ild-cookie-option-locked">
                <div className="ild-cookie-option-head">
                  <span className="ild-cookie-option-label">Necessari</span>
                  <span className="ild-cookie-toggle ild-cookie-toggle-on ild-cookie-toggle-locked">
                    <span className="ild-cookie-toggle-knob" />
                  </span>
                </div>
                <p className="ild-cookie-option-desc">
                  Essenziali al funzionamento del sito (sessione, consenso cookie,
                  preferenze). Sempre attivi.
                </p>
              </label>

              <label className="ild-cookie-option">
                <div className="ild-cookie-option-head">
                  <span className="ild-cookie-option-label">Analisi</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={analytics}
                    onClick={() => setAnalytics((v) => !v)}
                    className={`ild-cookie-toggle ${analytics ? "ild-cookie-toggle-on" : ""}`}
                  >
                    <span className="ild-cookie-toggle-knob" />
                  </button>
                </div>
                <p className="ild-cookie-option-desc">
                  Ci aiutano a capire come viene usato il sito in modo anonimo e
                  aggregato. Nessun dato personale condiviso.
                </p>
              </label>

              <label className="ild-cookie-option">
                <div className="ild-cookie-option-head">
                  <span className="ild-cookie-option-label">Marketing</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={marketing}
                    onClick={() => setMarketing((v) => !v)}
                    className={`ild-cookie-toggle ${marketing ? "ild-cookie-toggle-on" : ""}`}
                  >
                    <span className="ild-cookie-toggle-knob" />
                  </button>
                </div>
                <p className="ild-cookie-option-desc">
                  Permettono di proporti contenuti coerenti con i tuoi interessi su
                  piattaforme terze. Nessuna profilazione sensibile.
                </p>
              </label>
            </div>

            <div className="ild-cookie-actions">
              <button
                type="button"
                onClick={() => accept(analytics, marketing)}
                className="ild-cookie-btn ild-cookie-btn-primary"
              >
                Salva preferenze
              </button>
              <button
                type="button"
                onClick={() => accept(true, true)}
                className="ild-cookie-btn ild-cookie-btn-ghost"
              >
                Accetta tutti
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
