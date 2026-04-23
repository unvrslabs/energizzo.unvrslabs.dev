import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { OtpLoginForm } from "@/components/auth/otp-login-form";

export const metadata = {
  title: "Accesso admin — Il Dispaccio",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextRaw = params.next;
  const next =
    nextRaw && nextRaw.startsWith("/dashboard") ? nextRaw : undefined;

  return (
    <div className="lv2">
      <div className="lv2-login-shell">
        <header className="lv2-login-topbar">
          <Link
            href="https://ildispaccio.energy"
            className="lv2-login-back"
            aria-label="Torna al sito pubblico"
          >
            <span className="lv2-login-back-arrow">
              <ArrowLeft className="w-3 h-3" />
            </span>
            <span>ildispaccio.energy</span>
          </Link>

          <span className="lv2-login-topbar-meta hidden sm:inline-flex items-center gap-2">
            <Shield className="w-3 h-3" style={{ color: "hsl(var(--lv2-accent))" }} />
            Admin cockpit
          </span>
        </header>

        <main className="lv2-login-main">
          <OtpLoginForm
            apiBase="/api/admin/auth"
            badgeLabel="Admin · Team interno"
            title="Accesso al cockpit"
            subtitle="Solo il team UNVRS autorizzato. Ti inviamo un codice di accesso a 6 cifre sul tuo numero WhatsApp."
            phoneFooter="Solo i numeri admin autorizzati possono accedere"
            defaultRedirect="/dashboard"
            next={next}
          />
        </main>
      </div>
    </div>
  );
}
