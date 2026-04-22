"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function FreeNetworkSection() {
  return (
    <section
      aria-label="Network gratuito"
      className="relative mx-auto max-w-5xl px-6 py-16 md:py-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-primary/[0.02] to-transparent backdrop-blur-sm"
      >
        {/* emerald corner glows */}
        <div
          aria-hidden
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none"
        />

        <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-10 p-8 md:p-10 lg:p-12">
          {/* Left: label + big "€0" */}
          <div className="flex flex-col items-center md:items-start gap-4 md:gap-5 shrink-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                100% Gratuito
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span
                className="block text-6xl md:text-7xl font-black tracking-tight text-primary"
                style={{ lineHeight: 1.1, paddingBottom: "0.1em" }}
              >
                €0
              </span>
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Per sempre
              </span>
            </div>
          </div>

          {/* Divider on md+ */}
          <div
            aria-hidden
            className="hidden md:block w-px self-stretch bg-gradient-to-b from-transparent via-white/10 to-transparent"
          />

          {/* Right: pitch */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4">
            <h3 className="text-xl md:text-2xl font-semibold text-foreground leading-snug text-balance">
              Il network è completamente gratuito.{" "}
              <span className="text-primary">Ora e sempre.</span>
            </h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
              Tutti i servizi del Dispaccio — delibere ARERA decifrate,
              benchmark tariffario, podcast &quot;Il Reseller&quot;, eventi
              privati, report indipendente e community peer-to-peer — sono
              offerti gratuitamente ai reseller operativi del mercato italiano.
              Nessuna quota d&apos;ingresso, nessun abbonamento, nessun costo
              nascosto.
            </p>

            <motion.a
              href="#iscrizione"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="mt-1 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-shadow hover:shadow-primary/40"
            >
              Richiedi l&apos;accesso
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
