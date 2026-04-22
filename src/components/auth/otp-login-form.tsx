"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Loader2,
  Lock,
  MessageCircle,
  RotateCcw,
} from "lucide-react";

type Step = "phone" | "otp";

const RESEND_COOLDOWN_SECONDS = 60;
const OTP_TTL_SECONDS = 300;

export type OtpLoginFormProps = {
  apiBase: string;
  badgeLabel: string;
  title: string;
  subtitle: string;
  phoneFooter: string;
  defaultRedirect: string;
  next?: string;
};

export function OtpLoginForm({
  apiBase,
  badgeLabel,
  title,
  subtitle,
  phoneFooter,
  defaultRedirect,
  next,
}: OtpLoginFormProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [countdown, setCountdown] = useState(OTP_TTL_SECONDS);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    if (step !== "otp") return;
    setCountdown(OTP_TTL_SECONDS);
    const t = setInterval(() => setCountdown((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [step]);

  async function requestOtp() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Errore invio codice");
      }
      setStep("otp");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore imprevisto");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Inserisci tutte le 6 cifre.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Codice non valido");
      }
      window.location.href = next || data.redirect || defaultRedirect;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore imprevisto");
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(idx: number, value: string) {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      const n = [...otp];
      n[idx] = "";
      setOtp(n);
      return;
    }
    const n = [...otp];
    for (let i = 0; i < digits.length && idx + i < 6; i++) {
      n[idx + i] = digits[i];
    }
    setOtp(n);
    const target = Math.min(idx + digits.length, 5);
    otpRefs.current[target]?.focus();
  }

  function handleOtpKey(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  }

  function mmss(total: number): string {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-white/[0.02] to-transparent backdrop-blur-sm p-6 md:p-8">
      <div
        aria-hidden
        className="absolute -top-24 -right-16 w-64 h-64 rounded-full bg-primary/15 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-accent/10 blur-3xl pointer-events-none"
      />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1">
            <Lock className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              {badgeLabel}
            </span>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight tracking-tight mb-2">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {subtitle}
        </p>

        <AnimatePresence mode="wait">
          {step === "phone" ? (
            <motion.form
              key="phone"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              onSubmit={(e) => {
                e.preventDefault();
                requestOtp();
              }}
              className="space-y-4"
            >
              <label className="block">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
                  Numero WhatsApp
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+39 333 1234567"
                  required
                  autoFocus
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-base text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary/40 focus:bg-white/[0.07] focus:ring-2 focus:ring-primary/20"
                />
              </label>

              <motion.button
                type="submit"
                disabled={loading || phone.length < 6}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-shadow hover:shadow-primary/40 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Invio in corso…
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    Invia codice su WhatsApp
                  </>
                )}
              </motion.button>

              {error && (
                <p className="text-xs text-red-400 text-center">{error}</p>
              )}

              <p className="text-[11px] text-muted-foreground/70 leading-relaxed text-center pt-1">
                {phoneFooter}
              </p>
            </motion.form>
          ) : (
            <motion.form
              key="otp"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              onSubmit={(e) => {
                e.preventDefault();
                verifyOtp();
              }}
              className="space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    Codice ricevuto su WhatsApp
                  </span>
                  <span
                    className={`text-[10px] font-mono ${countdown < 30 ? "text-red-400" : "text-muted-foreground"}`}
                  >
                    {countdown > 0 ? `Scade tra ${mmss(countdown)}` : "Scaduto"}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKey(idx, e)}
                      className="aspect-square w-full rounded-xl border border-white/10 bg-white/[0.04] text-center text-xl font-bold text-foreground outline-none transition-colors focus:border-primary/40 focus:bg-white/[0.07] focus:ring-2 focus:ring-primary/20"
                    />
                  ))}
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading || otp.join("").length !== 6}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-shadow hover:shadow-primary/40 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifica…
                  </>
                ) : (
                  <>
                    Accedi
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              {error && (
                <p className="text-xs text-red-400 text-center">{error}</p>
              )}

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setError(null);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Cambia numero
                </button>
                <button
                  type="button"
                  disabled={cooldown > 0 || loading}
                  onClick={requestOtp}
                  className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-3 h-3" />
                  {cooldown > 0 ? `Reinvia in ${cooldown}s` : "Reinvia codice"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
