"use client";

import { OtpLoginForm } from "@/components/auth/otp-login-form";

export function NetworkLoginForm({ next }: { next?: string }) {
  return (
    <OtpLoginForm
      apiBase="/api/network/auth"
      badgeLabel="Network · Area riservata"
      title="Accesso al cockpit reseller"
      subtitle="Solo per i membri del network Il Dispaccio. Ti inviamo un codice di accesso a 6 cifre sul tuo WhatsApp."
      phoneFooter="Network privato · solo numeri autorizzati"
      defaultRedirect="/network"
      next={next}
    />
  );
}
