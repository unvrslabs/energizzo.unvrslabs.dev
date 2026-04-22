"use client";

import {
  ArrowRight,
  Award,
  Calendar,
  Clock,
  FileText,
  Gift,
  Mic,
  Receipt,
  ShieldCheck,
  Sparkles,
  Users2,
} from "lucide-react";
import type { LeadForSurvey } from "@/lib/survey/survey-client";

export function SurveyWelcome({
  lead,
  onStart,
}: {
  lead: LeadForSurvey;
  onStart: () => void;
}) {
  return (
    <div className="fixed inset-0 overflow-y-auto">
      <div className="min-h-full px-6 py-16 sm:py-20 flex items-center">
        <div className="mx-auto max-w-3xl w-full animate-fade-in-up space-y-6">
          <header className="relative liquid-glass-card p-8 sm:p-10 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 text-primary px-3 py-1 text-[10px] uppercase tracking-[0.25em] font-bold">
              <ShieldCheck className="h-3 w-3" />
              Azienda selezionata
            </div>
            <div className="flex items-start gap-4">
              <div className="shrink-0 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40">
                <Award className="h-7 w-7 text-primary" strokeWidth={1.75} />
              </div>
              <div className="space-y-2">
                <h1 className="font-display text-3xl sm:text-5xl tracking-tight leading-[1.05]">
                  Complimenti.
                </h1>
                <p className="text-base sm:text-lg leading-relaxed">
                  <strong>{lead.ragione_sociale}</strong> sei stata
                  selezionata per entrare nel primo network italiano dei
                  reseller energia:{" "}
                  <span className="text-primary font-semibold">
                    Il Dispaccio
                  </span>
                  .
                </p>
              </div>
            </div>
          </header>

          <section className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/[0.08] via-white/[0.02] to-transparent backdrop-blur-sm p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/40">
                <Users2 className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-xl tracking-wide">
                  Sei uno dei 100 professionisti selezionati.
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Il Dispaccio non è aperto a tutti. Ogni membro viene scelto
                  uno a uno sulla base del peso nel mercato reseller italiano.
                  Questa è la prima ondata: cento aziende, tu sei dentro.
                </p>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-400/[0.08] via-white/[0.02] to-transparent backdrop-blur-sm p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20 border border-amber-400/40">
                <Clock className="h-5 w-5 text-amber-300" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-xl tracking-wide">
                  Hai 72 ore per decidere.
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  La tua posizione resta riservata per{" "}
                  <strong className="text-foreground">3 giorni</strong>. Per
                  attivarla basta un breve questionario (3–5 minuti). Dopo quel
                  termine il posto passa al prossimo in lista d&apos;attesa.
                </p>
              </div>
            </div>
          </section>

          <section className="liquid-glass-card p-6 sm:p-7 space-y-3">
            <h2 className="font-display text-xl tracking-wide">
              Cosa ottieni entrando
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Per ringraziarti dei pochi minuti che spenderai a compilare il
              questionario, ricevi accesso completo e gratuito a tutti gli
              strumenti del network:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <Feature
                icon={FileText}
                title="Delibere intelligenti ARERA"
                body="Ogni delibera ARERA letta dall'AI e restituita in italiano operativo: cosa cambia, per chi, da quando, cosa devi fare tu lunedì mattina. Niente PDF da 80 pagine, un brief da 2 minuti."
              />
              <Feature
                icon={Receipt}
                title="Oneri, accise, componenti"
                body="Ogni variazione di oneri di sistema, accise, UC, ASOS, ARIM spiegata come se ne parlassi con tuo cugino. Con il prima/dopo applicato ai tuoi contratti tipo."
              />
              <Feature
                icon={Mic}
                title="Il Reseller · Podcast"
                body="Conversazioni con CEO e COO del settore. Accesso in anteprima agli episodi prima che escano pubblicamente."
              />
              <Feature
                icon={Calendar}
                title="Eventi esclusivi"
                body="Incontri offline riservati ai membri: tavoli di lavoro, aperitivi di settore, meeting con regulator e player di primo piano."
              />
              <Feature
                icon={Sparkles}
                title="Report di mercato"
                body="Benchmark mensile indipendente del mercato reseller Italia. Dati aggregati dalla community, niente fonti terze riciclate."
              />
              <Feature
                icon={Users2}
                title="Community riservata"
                body="Scambio diretto tra reseller ammessi. Zero fornitori, zero consulenti, zero broker, zero spam."
              />
            </div>
          </section>

          <section className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/[0.12] via-primary/[0.04] to-transparent backdrop-blur-sm p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/40">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl tracking-wide mb-1">
                  100% gratuito. Per sempre.
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  L&apos;iscrizione al network è gratuita e tutte le
                  funzionalità lo resteranno. Non ci sarà{" "}
                  <strong className="text-foreground">mai</strong> alcun costo
                  per la tua azienda: niente fee di ingresso, niente
                  abbonamento, niente versioni a pagamento, niente carta di
                  credito da inserire.
                </p>
              </div>
            </div>
          </section>

          <section className="liquid-glass-card p-6 sm:p-7 space-y-2">
            <h2 className="font-display text-xl tracking-wide">
              Come attivi l&apos;accesso
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Compila il questionario di ingresso (
              <strong className="text-foreground">
                24 domande, 3–5 minuti
              </strong>
              ). Serve a capire come sei posizionato e a calibrare i contenuti
              che il network ti farà vedere per primi.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Alla fine lasci il tuo WhatsApp e{" "}
              <strong className="text-foreground">
                accedi subito alla piattaforma
              </strong>
              : zero attese, zero approvazioni manuali, zero email di conferma.
            </p>
          </section>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={onStart}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold h-12 px-7 text-base shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow"
            >
              Attiva il mio accesso <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-xs text-muted-foreground">
              Il progresso viene salvato: puoi riprendere in qualsiasi momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="liquid-glass-hover rounded-[1.25rem] p-4">
      <div
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
        style={{
          background:
            "linear-gradient(135deg, hsl(158 64% 42% / 0.25), hsl(160 70% 36% / 0.15))",
          border: "1px solid hsl(158 64% 42% / 0.3)",
        }}
      >
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h3 className="mt-3 font-display text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
        {body}
      </p>
    </div>
  );
}
