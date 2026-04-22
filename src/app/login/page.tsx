import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
    <main className="mesh-gradient relative min-h-screen flex flex-col">
      <header className="relative z-10 p-6 md:p-8">
        <Link
          href="https://ildispaccio.energy"
          className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm px-4 py-2 text-sm font-semibold text-foreground/90 hover:text-foreground hover:bg-white/[0.08] hover:border-primary/30 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-primary transition-transform group-hover:-translate-x-0.5" />
          <span className="gradient-text">Il Dispaccio</span>
        </Link>
      </header>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <OtpLoginForm
            apiBase="/api/admin/auth"
            badgeLabel="Admin"
            title="Il Dispaccio · Admin"
            subtitle="Accesso riservato al team. Ti inviamo un codice di accesso sul tuo WhatsApp autorizzato."
            phoneFooter="Solo i numeri admin autorizzati possono accedere."
            defaultRedirect="/dashboard"
            next={next}
          />
        </div>
      </div>
    </main>
  );
}
