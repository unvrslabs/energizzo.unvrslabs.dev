import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadEpisode } from "@/lib/podcast-content";
import { KnowledgeRenderer } from "@/components/podcast/knowledge-renderer";
import { InviteConfirmForm } from "@/components/podcast/invite-confirm-form";
import type { PodcastGuest } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function InvitoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // validate UUID shape before hitting DB
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    notFound();
  }

  const supabase = await createClient();
  const { data: guest } = await supabase.rpc("fetch_podcast_invite", { p_token: token });

  if (!guest) notFound();

  const g = guest as PodcastGuest;
  const displayName =
    g.lead?.ragione_sociale ?? g.external_company ?? g.external_name ?? "Ospite";
  const episode = g.selected_episode_slug ? loadEpisode(g.selected_episode_slug) : null;
  const alreadyConfirmed = !!g.response_confirmed_at;

  return (
    <div className="min-h-screen py-10 px-4 md:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="liquid-glass rounded-[1.5rem] p-8 text-center space-y-3">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Podcast &quot;Il Reseller&quot;
          </p>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight">
            Sei stato selezionato 🎙️
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Grazie per aver scansionato la card di invito. Questa pagina è stata preparata
            solo per {displayName}: trovi il tema della conversazione, le domande che ti
            faremo e i materiali per prepararti. In fondo puoi confermarci la tua
            disponibilità.
          </p>
        </header>

        {!episode ? (
          <div className="liquid-glass rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Il tema della tua puntata è ancora in definizione. Ti ricontatteremo a breve.
            </p>
          </div>
        ) : (
          <>
            <section className="liquid-glass rounded-2xl p-6 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Argomento della puntata
              </p>
              <h2 className="font-display text-2xl tracking-wide">{episode.title}</h2>
            </section>

            <section className="liquid-glass rounded-2xl p-6">
              <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-a:text-primary prose-table:text-xs">
                <h2 className="!mt-0">Come prepararti</h2>
                <p className="text-sm">
                  Sotto trovi tre cose utili: (1) un <strong>briefing</strong> introduttivo
                  sul tema, (2) tutte le <strong>domande</strong> che ti faremo (sia quelle
                  di presentazione sia le strutturate), (3) <strong>link</strong> alle
                  fonti ARERA e sintesi operative per avere i dati in tasca. Non serve
                  imparare a memoria: l&apos;obiettivo è una conversazione, non un esame.
                </p>
                <h2>Suggerimenti per le risposte</h2>
                <ul>
                  <li>
                    <strong>Parla in prima persona</strong>: la tua esperienza concreta vale
                    più della teoria.
                  </li>
                  <li>
                    <strong>Numeri se li hai</strong>, aneddoti se li ricordi. Un &quot;non
                    lo so esattamente&quot; è meglio di un dato inventato.
                  </li>
                  <li>
                    <strong>Dissenso ok</strong>: se un dato o una domanda non ti
                    convincono, dillo. Aggiunge valore alla puntata.
                  </li>
                  <li>
                    <strong>20 minuti complessivi</strong>: taglia quando senti che la
                    risposta è completa, non serve esaurire ogni sottotema.
                  </li>
                </ul>
              </div>
            </section>

            <section className="liquid-glass rounded-2xl p-6">
              <KnowledgeRenderer body={episode.body} />
            </section>
          </>
        )}

        <section className="liquid-glass rounded-2xl p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="font-display text-xl tracking-wide">Confermi la disponibilità?</h2>
            <p className="text-sm text-muted-foreground">
              Lascia il tuo recapito WhatsApp e il nome: ti contatteremo per fissare la data
              di registrazione.
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
            <InviteConfirmForm token={token} defaultName={displayName} />
          )}
        </section>

        <footer className="text-center text-xs text-muted-foreground py-4">
          Prodotto da <span className="text-primary font-semibold">UNVRS Labs</span> ·
          energizzo.unvrslabs.dev
        </footer>
      </div>
    </div>
  );
}
