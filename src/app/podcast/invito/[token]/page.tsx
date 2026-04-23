import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { loadEpisode } from "@/lib/podcast-content";
import { PublicEpisodeRenderer } from "@/components/podcast/public-episode-renderer";
import { InviteConfirmForm } from "@/components/podcast/invite-confirm-form";
import { WelcomeHero } from "@/components/podcast/welcome-hero";
import type { PodcastGuest } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function InvitoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: guest } = await supabase.rpc("fetch_podcast_invite", { p_token: token });

  if (!guest) notFound();

  const g = guest as PodcastGuest;
  const guestName =
    g.lead?.ragione_sociale ?? g.external_company ?? g.external_name ?? null;
  const episode = g.selected_episode_slug ? loadEpisode(g.selected_episode_slug) : null;
  const alreadyConfirmed = !!g.response_confirmed_at;

  const prep = [
    {
      title: "Leggi il briefing qui sotto",
      body:
        "Primer sul tema, domande di apertura, 15 domande strutturate con talking points.",
    },
    {
      title: "Apri i link di approfondimento",
      body: "Rimandano alle sintesi ARERA per avere i numeri in tasca durante la call.",
    },
    {
      title: "Parla in prima persona",
      body: "La tua esperienza concreta vale più della teoria.",
    },
    {
      title: "Numeri se li hai, aneddoti se li ricordi",
      body: "Un \"non lo so esattamente\" vale più di un dato inventato.",
    },
    {
      title: "Dissenso ok",
      body: "Se un dato o una domanda non ti convincono, dillo. Rende la puntata migliore.",
    },
    {
      title: "20 minuti complessivi",
      body: "Taglia quando senti che la risposta è completa, non serve esaurire tutto.",
    },
  ];

  return (
    <>
      {/* Body nero al primo paint per evitare flash del mesh-gradient globale */}
      <style>{`
        body {
          background: #0a0a0f !important;
          background-image: none !important;
          color: #f4f4f8;
        }
      `}</style>

      <main className="invpod-page">
        <div className="invpod-container">
          <WelcomeHero guestName={guestName} />

          {/* Di cosa si tratta */}
          <section className="invpod-card">
            <span className="invpod-card-kicker">Di cosa si tratta</span>
            <p className="invpod-prose">
              <strong>&ldquo;Il Reseller&rdquo;</strong> è un podcast settimanale
              dedicato agli amministratori delegati e ai COO dei reseller
              energetici italiani. In ogni puntata affrontiamo un tema caldo del
              settore — margini, switching, regolazione ARERA, AI, M&amp;A —
              attraverso una conversazione 1 a 1 di circa 20 minuti con un
              protagonista del mercato.
            </p>
            <p className="invpod-prose">
              La puntata viene <strong>registrata in call via Zoom o Riverside</strong>{" "}
              (audio + video), poi montata e pubblicata su Spotify, Apple
              Podcasts e YouTube. Zero script, zero domande a sorpresa: il
              briefing completo che trovi sotto è esattamente ciò di cui
              parleremo.
            </p>
            <p className="invpod-prose invpod-prose-dim">
              Ti ringraziamo per aver scansionato la nostra card di invito e per
              il tempo che vorrai dedicarci.
            </p>
          </section>

          {/* Episodio assegnato */}
          {episode ? (
            <section className="invpod-episode">
              <span className="invpod-episode-label">
                <span className="invpod-episode-dot" />
                Argomento della tua puntata
              </span>
              <h2 className="invpod-episode-title">{episode.title}</h2>
            </section>
          ) : (
            <section className="invpod-card invpod-card-center">
              <p className="invpod-prose-dim">
                Il tema della tua puntata è ancora in definizione. Ti
                ricontatteremo a breve.
              </p>
            </section>
          )}

          {/* Come prepararti */}
          {episode && (
            <section className="invpod-card">
              <span className="invpod-card-kicker">Come prepararti</span>
              <ul className="invpod-prep">
                {prep.map((p, i) => (
                  <li key={i}>
                    <span className="invpod-prep-check" aria-hidden>
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    <span className="invpod-prep-body">
                      <strong>{p.title}</strong> — {p.body}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Briefing */}
          {episode && (
            <section className="invpod-card">
              <span className="invpod-card-kicker">Briefing puntata</span>
              <div className="invpod-briefing">
                <PublicEpisodeRenderer body={episode.body} token={token} />
              </div>
            </section>
          )}

          {/* Form conferma */}
          <section className="invpod-confirm">
            <div className="invpod-confirm-head">
              <h2 className="invpod-confirm-title">
                {alreadyConfirmed ? "Conferma ricevuta" : "Confermi la disponibilità?"}
              </h2>
              {!alreadyConfirmed && (
                <p className="invpod-confirm-sub">
                  Lasciaci il tuo nome e un recapito WhatsApp: ti contatteremo
                  per fissare la data di registrazione.
                </p>
              )}
            </div>

            {alreadyConfirmed ? (
              <div className="invpod-confirmed">
                <CheckCircle2 className="w-5 h-5" style={{ color: "#22c55e" }} />
                <div>
                  <p className="invpod-confirmed-name">
                    Grazie {g.response_name ?? ""}, abbiamo ricevuto la tua
                    conferma il{" "}
                    {new Date(g.response_confirmed_at!).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    .
                  </p>
                  <p className="invpod-confirmed-body">
                    Ti contatteremo a breve sul numero che ci hai lasciato per
                    fissare la registrazione.
                  </p>
                </div>
              </div>
            ) : (
              <InviteConfirmForm token={token} />
            )}
          </section>

          <footer className="invpod-footer">
            <div>
              <div className="invpod-footer-brand">Il Dispaccio</div>
              <div className="invpod-footer-meta">
                Network italiano reseller energia
              </div>
            </div>
            <div className="invpod-footer-sponsor">
              <span className="invpod-footer-sponsor-label">Sponsor</span>
              <span className="invpod-footer-sponsor-name">Energizzo</span>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
