"use client";

import { Headphones, Mic, Radio } from "lucide-react";

/**
 * Hero moderno per invito podcast — premium podcast network look.
 * Nessuna emoji/confetti: gradient sweep, monogram, typography bold.
 */
export function WelcomeHero({ guestName }: { guestName?: string | null }) {
  return (
    <header className="invpod-hero">
      <div className="invpod-hero-glow" aria-hidden />
      <div className="invpod-hero-grid" aria-hidden />

      <div className="invpod-hero-inner">
        <div className="invpod-hero-kicker">
          <span className="invpod-hero-dot" />
          <span>Ospite selezionato · Podcast privato</span>
        </div>

        <div className="invpod-hero-logo-row">
          <div className="invpod-hero-logo" aria-hidden>
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="invpod-hero-show">Il Reseller</div>
            <div className="invpod-hero-show-meta">Podcast · Il Dispaccio</div>
          </div>
        </div>

        <h1 className="invpod-hero-title">
          {guestName ? (
            <>
              <span className="invpod-hero-title-dim">Complimenti,</span>
              <br />
              {guestName}.
            </>
          ) : (
            <>
              <span className="invpod-hero-title-dim">Complimenti.</span>
              <br />
              Sei stato selezionato.
            </>
          )}
        </h1>

        <p className="invpod-hero-lead">
          Sei tra i pochi professionisti invitati a registrare una puntata di{" "}
          <strong>Il Reseller</strong> — il podcast dedicato agli operatori del
          mercato energia retail italiano.
        </p>

        <div className="invpod-hero-ticker">
          <TickerItem icon={<Mic className="w-3.5 h-3.5" />} label="Audio + video" />
          <TickerItem icon={<Radio className="w-3.5 h-3.5" />} label="~20 min" />
          <TickerItem icon={<Headphones className="w-3.5 h-3.5" />} label="Spotify · Apple · YouTube" />
        </div>
      </div>
    </header>
  );
}

function TickerItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="invpod-ticker-item">
      {icon}
      {label}
    </span>
  );
}
