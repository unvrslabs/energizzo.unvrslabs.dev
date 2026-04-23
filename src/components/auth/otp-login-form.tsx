"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Loader2,
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
    <div className="lv2-login-card">
      <div className="lv2-login-header">
        <span className="lv2-login-badge">
          <span className="lv2-login-badge-dot" />
          {badgeLabel}
        </span>
      </div>

      <h1 className="lv2-login-title">{title}</h1>
      <p className="lv2-login-subtitle">{subtitle}</p>

      {step === "phone" ? (
        <form
          key="phone"
          onSubmit={(e) => {
            e.preventDefault();
            requestOtp();
          }}
          className="space-y-4"
        >
          <label className="block">
            <span className="lv2-login-label">Numero WhatsApp</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+39 333 1234567"
              required
              autoFocus
              className="lv2-login-input"
            />
          </label>

          <button
            type="submit"
            disabled={loading || phone.length < 6}
            className="lv2-btn-primary w-full"
            style={{ padding: "13px 22px" }}
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
          </button>

          {error && <p className="lv2-login-error">{error}</p>}

          <p className="lv2-login-footer-note">{phoneFooter}</p>
        </form>
      ) : (
        <form
          key="otp"
          onSubmit={(e) => {
            e.preventDefault();
            verifyOtp();
          }}
          className="space-y-4"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="lv2-login-label" style={{ marginBottom: 0 }}>
                Codice ricevuto su WhatsApp
              </span>
              <span
                className="lv2-mono"
                style={{
                  fontSize: "10.5px",
                  letterSpacing: "0.12em",
                  color:
                    countdown < 30
                      ? "hsl(0 72% 62%)"
                      : "hsl(var(--lv2-text-mute))",
                }}
              >
                {countdown > 0 ? `scade ${mmss(countdown)}` : "scaduto"}
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
                  className="lv2-login-otp-cell"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otp.join("").length !== 6}
            className="lv2-btn-primary w-full"
            style={{ padding: "13px 22px" }}
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
          </button>

          {error && <p className="lv2-login-error">{error}</p>}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setError(null);
              }}
              className="lv2-login-link"
            >
              ← Cambia numero
            </button>
            <button
              type="button"
              disabled={cooldown > 0 || loading}
              onClick={requestOtp}
              className="lv2-login-link lv2-login-link--accent inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              {cooldown > 0 ? `Reinvia in ${cooldown}s` : "Reinvia codice"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
