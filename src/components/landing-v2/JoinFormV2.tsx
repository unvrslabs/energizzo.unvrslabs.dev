"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2, Lock, ArrowRight } from "lucide-react";

type Status = "idle" | "submitting" | "success" | "error";

export function JoinFormV2() {
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
      const message = err instanceof Error ? err.message : "Errore imprevisto";
      setErrorMsg(message);
      setStatus("error");
    }
  }

  return (
    <section id="richiedi" className="lv2-section">
      <div className="lv2-container max-w-5xl">
        <div
          className="lv2-card lv2-card--emerald"
          style={{ padding: "clamp(32px, 5vw, 56px)" }}
        >
          <div className="grid gap-10 lg:grid-cols-[1fr_480px] lg:gap-14 items-start">
            <div>
              <div className="lv2-kicker mb-5">// Richiedi l&apos;invito</div>
              <h2 className="lv2-h2 mb-5">
                Pronto a entrare <em>nel network</em>?
              </h2>
              <p className="lv2-lede mb-6">
                Il Dispaccio è un network chiuso. Ogni candidatura viene letta
                da un umano. Se il profilo rispetta i requisiti, ti ricontattiamo
                via WhatsApp con l&apos;invito editoriale.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Cockpit regolatorio con delibere AI",
                  "Podcast &laquo;Il Reseller&raquo; + knowledge base",
                  "Report indipendente annuale + benchmark privato",
                  "Community CEO e COO verticale",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm"
                    style={{ color: "hsl(var(--lv2-text-dim))" }}
                  >
                    <ArrowRight
                      className="w-4 h-4 mt-0.5 shrink-0"
                      style={{ color: "hsl(var(--lv2-accent))" }}
                    />
                    <span dangerouslySetInnerHTML={{ __html: item }} />
                  </li>
                ))}
              </ul>

              <div
                className="flex items-center gap-3 text-xs"
                style={{ color: "hsl(var(--lv2-text-mute))" }}
              >
                <Lock className="w-3.5 h-3.5" />
                <span
                  className="lv2-mono"
                  style={{ letterSpacing: "0.2em", textTransform: "uppercase" }}
                >
                  Accesso su invito · Nessuna quota
                </span>
              </div>
            </div>

            <div
              className="lv2-card"
              style={{
                padding: 24,
                background: "hsl(var(--lv2-bg-elev))",
                borderColor: "hsl(var(--lv2-border-strong))",
              }}
            >
              <div className="mb-5">
                <div
                  className="lv2-mono mb-2"
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "hsl(var(--lv2-accent))",
                  }}
                >
                  Candidatura — Anno I
                </div>
                <h3
                  className="font-bold"
                  style={{
                    fontSize: 18,
                    letterSpacing: "-0.015em",
                    color: "hsl(var(--lv2-text))",
                  }}
                >
                  Lascia i tuoi dati
                </h3>
              </div>

              {status === "success" ? (
                <div
                  className="flex items-start gap-3 rounded-xl p-4"
                  style={{
                    border: "1px solid hsl(var(--lv2-accent) / 0.35)",
                    background: "hsl(var(--lv2-accent) / 0.08)",
                  }}
                >
                  <CheckCircle2
                    className="w-5 h-5 shrink-0 mt-0.5"
                    style={{ color: "hsl(var(--lv2-accent))" }}
                  />
                  <div className="space-y-1">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "hsl(var(--lv2-text))" }}
                    >
                      Richiesta ricevuta.
                    </p>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "hsl(var(--lv2-text-dim))" }}
                    >
                      Valuteremo il profilo e ti ricontatteremo via WhatsApp.
                      Ogni richiesta è letta da un umano.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <FieldV2
                    label="Ragione sociale"
                    value={ragioneSociale}
                    onChange={setRagioneSociale}
                    placeholder="Energizzo S.r.l."
                    required
                    minLength={2}
                    maxLength={200}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <FieldV2
                      label="P.IVA"
                      value={piva}
                      onChange={setPiva}
                      placeholder="IT01234567890"
                      required
                      minLength={5}
                      maxLength={20}
                      pattern="[A-Za-z0-9]+"
                    />
                    <FieldV2
                      label="Referente"
                      value={referente}
                      onChange={setReferente}
                      placeholder="Nome Cognome"
                      required
                      minLength={2}
                      maxLength={200}
                    />
                  </div>
                  <FieldV2
                    label="WhatsApp"
                    value={whatsapp}
                    onChange={setWhatsapp}
                    placeholder="+39 333 1234567"
                    type="tel"
                    required
                    minLength={6}
                    maxLength={50}
                  />

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="lv2-btn-primary w-full"
                    style={{ marginTop: 8 }}
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
                  </button>

                  {status === "error" && errorMsg && (
                    <p
                      className="text-xs text-center"
                      style={{ color: "hsl(0 72% 62%)" }}
                    >
                      {errorMsg}
                    </p>
                  )}

                  <p
                    className="lv2-mono text-center"
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "hsl(var(--lv2-text-mute))",
                      marginTop: 12,
                    }}
                  >
                    Ogni candidatura è valutata individualmente
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldV2({
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
      <span
        className="lv2-mono block mb-1.5"
        style={{
          fontSize: "9.5px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          fontWeight: 600,
          color: "hsl(var(--lv2-text-mute))",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "hsl(var(--lv2-accent))", marginLeft: 4 }}>*</span>
        )}
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
        className="w-full outline-none"
        style={{
          borderRadius: 10,
          border: "1px solid hsl(var(--lv2-border))",
          background: "hsl(var(--lv2-card))",
          padding: "10px 12px",
          fontSize: 13.5,
          color: "hsl(var(--lv2-text))",
          transition: "border-color 160ms ease, background 160ms ease",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "hsl(var(--lv2-accent) / 0.5)";
          e.currentTarget.style.background = "hsl(var(--lv2-card-hover))";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "hsl(var(--lv2-border))";
          e.currentTarget.style.background = "hsl(var(--lv2-card))";
        }}
      />
    </label>
  );
}
