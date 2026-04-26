"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Pencil, RotateCcw, X } from "lucide-react";

type Step = "idle" | "phone" | "otp" | "done";

const RESEND_COOLDOWN_SECONDS = 60;
const OTP_TTL_SECONDS = 300;

export function ChangePhoneForm({ currentPhone }: { currentPhone: string }) {
  const [step, setStep] = useState<Step>("idle");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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

  function reset() {
    setStep("idle");
    setPhone("");
    setOtp(["", "", "", "", "", ""]);
    setError(null);
    setSuccess(null);
  }

  async function requestOtp() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/network/me/change-phone/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Errore invio codice");
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
      const res = await fetch("/api/network/me/change-phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Errore verifica");
      setSuccess(`Numero aggiornato a ${data.phone}.`);
      setStep("done");
      // Forza un refresh dei dati server-side al prossimo render
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore imprevisto");
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(i: number, raw: string) {
    const v = raw.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
    if (next.every((c) => c.length === 1)) {
      setTimeout(() => verifyOtpFromArray(next), 50);
    }
  }

  async function verifyOtpFromArray(arr: string[]) {
    setOtp(arr);
    await verifyOtp();
  }

  function handleOtpKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) otpRefs.current[i + 1]?.focus();
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;
    e.preventDefault();
    const next = [...otp];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] ?? "";
    setOtp(next);
    const focusIdx = Math.min(pasted.length, 5);
    otpRefs.current[focusIdx]?.focus();
    if (pasted.length === 6) setTimeout(() => verifyOtpFromArray(next), 50);
  }

  if (step === "idle") {
    return (
      <button
        type="button"
        onClick={() => setStep("phone")}
        className="v2-btn v2-btn--ghost"
      >
        <Pencil className="w-3.5 h-3.5" />
        <span>Cambia numero</span>
      </button>
    );
  }

  if (step === "done") {
    return (
      <div
        className="flex items-center gap-2 text-[13px]"
        style={{ color: "hsl(var(--v2-accent))" }}
      >
        <Check className="w-4 h-4" />
        <span>{success}</span>
      </div>
    );
  }

  if (step === "phone") {
    return (
      <div className="flex flex-col gap-3" style={{ maxWidth: 360 }}>
        <div>
          <label
            className="v2-mono"
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "hsl(var(--v2-text-mute))",
              display: "block",
              marginBottom: 6,
            }}
          >
            Nuovo numero (formato +39…)
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="tel"
              autoFocus
              autoComplete="tel"
              placeholder="+39 333 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) requestOtp();
              }}
              className="v2-input"
              style={{ paddingLeft: 12 }}
              disabled={loading}
            />
          </div>
          <p
            className="v2-mono"
            style={{
              fontSize: 10,
              color: "hsl(var(--v2-text-mute))",
              marginTop: 6,
            }}
          >
            Riceverai un codice OTP via WhatsApp al nuovo numero.
          </p>
        </div>

        {error && (
          <div
            style={{
              fontSize: 12,
              color: "hsl(var(--v2-danger))",
              padding: "6px 10px",
              borderRadius: 6,
              background: "hsl(var(--v2-danger) / 0.08)",
              border: "1px solid hsl(var(--v2-danger) / 0.22)",
            }}
          >
            {error}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={requestOtp}
            disabled={loading || phone.trim().length < 6}
            className="v2-btn v2-btn--primary"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>Invia codice</span>
          </button>
          <button type="button" onClick={reset} className="v2-btn v2-btn--ghost">
            <X className="w-3.5 h-3.5" />
            <span>Annulla</span>
          </button>
        </div>
      </div>
    );
  }

  // step === "otp"
  return (
    <div className="flex flex-col gap-3" style={{ maxWidth: 360 }}>
      <div>
        <p
          style={{
            fontSize: 13,
            color: "hsl(var(--v2-text-dim))",
            marginBottom: 10,
          }}
        >
          Codice inviato a <strong style={{ color: "hsl(var(--v2-text))" }}>{phone}</strong>.
        </p>
        <div className="flex gap-1.5">
          {otp.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                otpRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={d}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(i, e)}
              onPaste={handleOtpPaste}
              disabled={loading}
              style={{
                width: 40,
                height: 48,
                textAlign: "center",
                fontSize: 18,
                fontWeight: 700,
                fontFamily: "var(--font-mono), monospace",
                color: "hsl(var(--v2-text))",
                background: "hsl(var(--v2-bg-elev))",
                border: "1px solid hsl(var(--v2-border))",
                borderRadius: 8,
                outline: "none",
              }}
            />
          ))}
        </div>
        <div
          className="v2-mono"
          style={{
            fontSize: 10,
            color: "hsl(var(--v2-text-mute))",
            marginTop: 8,
          }}
        >
          Scade tra {Math.floor(countdown / 60)}:
          {String(countdown % 60).padStart(2, "0")}
        </div>
      </div>

      {error && (
        <div
          style={{
            fontSize: 12,
            color: "hsl(var(--v2-danger))",
            padding: "6px 10px",
            borderRadius: 6,
            background: "hsl(var(--v2-danger) / 0.08)",
            border: "1px solid hsl(var(--v2-danger) / 0.22)",
          }}
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={verifyOtp}
          disabled={loading || otp.join("").length !== 6}
          className="v2-btn v2-btn--primary"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          <span>Verifica</span>
        </button>
        <button
          type="button"
          onClick={requestOtp}
          disabled={loading || cooldown > 0}
          className="v2-btn v2-btn--ghost"
          title="Reinvia codice"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{cooldown > 0 ? `Reinvia (${cooldown}s)` : "Reinvia"}</span>
        </button>
        <button type="button" onClick={reset} className="v2-btn v2-btn--ghost">
          <X className="w-3.5 h-3.5" />
          <span>Annulla</span>
        </button>
      </div>
    </div>
  );
}
