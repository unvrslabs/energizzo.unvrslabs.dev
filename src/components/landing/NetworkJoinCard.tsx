"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Send, CheckCircle2, Loader2 } from "lucide-react";

type Status = "idle" | "submitting" | "success" | "error";

export function NetworkJoinCard() {
  const [ragioneSociale, setRagioneSociale] = useState("");
  const [piva, setPiva] = useState("");
  const [referente, setReferente] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/network-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ragione_sociale: ragioneSociale,
          piva,
          referente,
          whatsapp,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Errore invio richiesta");
      }
      setStatus("success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Errore imprevisto";
      setErrorMsg(message);
      setStatus("error");
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-white/[0.02] to-transparent backdrop-blur-sm p-6 md:p-7">
      {/* corner glow */}
      <div
        aria-hidden
        className="absolute -top-24 -right-16 w-64 h-64 rounded-full bg-primary/15 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-accent/10 blur-3xl pointer-events-none"
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1">
            <Lock className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Accesso su invito
            </span>
          </div>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-foreground leading-tight tracking-tight mb-2">
          Richiedi di entrare nel network
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          Il Dispaccio è un network chiuso. Compila la richiesta e verrai
          inserito in lista d&apos;attesa. Valutiamo caso per caso.
        </p>

        {status === "success" ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4"
          >
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Richiesta ricevuta.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Valuteremo il profilo e ti ricontatteremo via WhatsApp. Ogni
                richiesta è letta da un umano.
              </p>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field
              label="Ragione sociale"
              value={ragioneSociale}
              onChange={setRagioneSociale}
              placeholder="Energizzo S.r.l."
              required
              minLength={2}
              maxLength={200}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="P.IVA"
                value={piva}
                onChange={setPiva}
                placeholder="IT01234567890"
                required
                minLength={5}
                maxLength={20}
                pattern="[A-Za-z0-9]+"
              />
              <Field
                label="Referente"
                value={referente}
                onChange={setReferente}
                placeholder="Nome Cognome"
                required
                minLength={2}
                maxLength={200}
              />
            </div>
            <Field
              label="WhatsApp"
              value={whatsapp}
              onChange={setWhatsapp}
              placeholder="+39 333 1234567"
              type="tel"
              required
              minLength={6}
              maxLength={50}
            />

            <motion.button
              type="submit"
              disabled={status === "submitting"}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-shadow hover:shadow-primary/40 disabled:opacity-70"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Invio in corso…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Invia richiesta
                </>
              )}
            </motion.button>

            {status === "error" && errorMsg && (
              <p className="text-xs text-red-400 text-center">{errorMsg}</p>
            )}

            <p className="text-[11px] text-muted-foreground/70 leading-relaxed text-center pt-1">
              L&apos;invio della richiesta non comporta l&apos;ammissione
              automatica al network. Ogni candidatura viene valutata
              individualmente dal team.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  minLength,
  maxLength,
  pattern,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
        {label}
        {required && <span className="text-primary"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        pattern={pattern}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary/40 focus:bg-white/[0.07] focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
