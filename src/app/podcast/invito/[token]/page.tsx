import { notFound } from "next/navigation";
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
  const episode = g.selected_episode_slug ? loadEpisode(g.selected_episode_slug) : null;
  const alreadyConfirmed = !!g.response_confirmed_at;

  return (
    <div className="min-h-screen py-10 px-4 md:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <WelcomeHero />

        <section className="liquid-glass rounded-2xl p-6 space-y-3">
          <h2 className="font-display text-xl tracking-wide">Di cosa si tratta</h2>
          <p className="text-sm leading-relaxed">
            <strong>&quot;Il Reseller&quot;</strong> è un podcast settimanale dedicato
            agli amministratori delegati e ai COO dei reseller energetici italiani. In
            ogni puntata affrontiamo un tema caldo del settore — margini, switching,
            regolazione ARERA, AI, M&amp;A — attraverso una conversazione 1 a 1 di circa
            20 minuti con un protagonista del mercato.
          </p>
          <p className="text-sm leading-relaxed">
            La puntata viene <strong>registrata in call via Zoom o Riverside</strong>{" "}
            (audio + video), poi montata e pubblicata su Spotify, Apple Podcasts e
            YouTube. Zero script, zero domande a sorpresa: il briefing completo che
            trovi sotto è esattamente ciò di cui parleremo.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Ti ringraziamo per aver scansionato la nostra card di invito e per il tempo
            che vorrai dedicarci. La tua voce arricchisce il confronto tra peer del
            settore.
          </p>
        </section>

        {!episode ? (
          <div className="liquid-glass rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Il tema della tua puntata è ancora in definizione. Ti ricontatteremo a
              breve.
            </p>
          </div>
        ) : (
          <>
            <section className="liquid-glass rounded-2xl p-6 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Argomento della tua puntata
              </p>
              <h2 className="font-display text-2xl tracking-wide">{episode.title}</h2>
            </section>

            <section className="liquid-glass rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-xl tracking-wide !mt-0">Come prepararti</h2>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-primary shrink-0">✓</span>
                  <span>
                    <strong>Leggi il briefing</strong> qui sotto: primer sul tema,
                    domande di apertura, 15 domande strutturate con talking points.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary shrink-0">✓</span>
                  <span>
                    <strong>Apri i link di approfondimento</strong>: rimandano alle
                    sintesi ARERA per avere i numeri in tasca durante la call.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary shrink-0">✓</span>
                  <span>
                    <strong>Parla in prima persona</strong>: la tua esperienza concreta
                    vale più della teoria.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary shrink-0">✓</span>
                  <span>
                    <strong>Numeri se li hai, aneddoti se li ricordi</strong>. Un
                    &quot;non lo so esattamente&quot; vale più di un dato inventato.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary shrink-0">✓</span>
                  <span>
                    <strong>Dissenso ok</strong>: se un dato o una domanda non ti
                    convincono, dillo. Rende la puntata migliore.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary shrink-0">✓</span>
                  <span>
                    <strong>20 minuti complessivi</strong>: taglia quando senti che la
                    risposta è completa, non serve esaurire tutto.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary shrink-0">✓</span>
                  <span>
                    <strong>Non devi imparare a memoria</strong>: è una conversazione,
                    non un esame.
                  </span>
                </li>
              </ul>
            </section>

            <section className="liquid-glass rounded-2xl p-6">
              <PublicEpisodeRenderer body={episode.body} token={token} />
            </section>
          </>
        )}

        <section className="liquid-glass rounded-2xl p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="font-display text-xl tracking-wide">Confermi la disponibilità?</h2>
            <p className="text-sm text-muted-foreground">
              Lascia il tuo nome e un recapito WhatsApp: ti contatteremo per fissare la
              data di registrazione.
            </p>
          </div>

          {alreadyConfirmed ? (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-sm">
              <p className="font-semibold text-emerald-300">
                Grazie {g.response_name ?? ""}, abbiamo ricevuto la tua conferma il{" "}
                {new Date(g.response_confirmed_at!).toLocaleDateString("it-IT")}.
              </p>
              <p className="text-emerald-200/80 mt-1">
                Ti contatteremo a breve sul numero che ci hai lasciato per fissare la
                registrazione.
              </p>
            </div>
          ) : (
            <InviteConfirmForm token={token} />
          )}
        </section>

        <footer className="text-center text-xs text-muted-foreground py-4">
          Prodotto da <span className="text-primary font-semibold">UNVRS Labs</span>
        </footer>
      </div>
    </div>
  );
}
