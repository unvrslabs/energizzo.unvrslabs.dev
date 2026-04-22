"use client";

import { OtpLoginForm } from "@/components/auth/otp-login-form";

export function NetworkLoginForm({ next }: { next?: string }) {
  return (
    <OtpLoginForm
      apiBase="/api/network/auth"
      badgeLabel="Area riservata"
      title="Accesso al network"
      subtitle="Solo per i membri del network Il Dispaccio. Ti inviamo un codice di accesso su WhatsApp."
      phoneFooter="Network privato. Solo i numeri autorizzati possono accedere."
      defaultRedirect="/network"
      next={next}
    />
  );
}
