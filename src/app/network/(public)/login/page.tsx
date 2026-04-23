import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { NetworkLoginForm } from "@/components/network/login-form";

export const metadata = {
  title: "Accesso network — Il Dispaccio",
  description: "Area riservata ai membri del network Il Dispaccio.",
  robots: { index: false, follow: false },
};

export default async function NetworkLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextRaw = params.next;
  const next =
    nextRaw &&
    nextRaw.startsWith("/network") &&
    !nextRaw.startsWith("/network/login")
      ? nextRaw
      : undefined;

  return (
    <div className="lv2">
      <div className="lv2-login-shell">
        <header className="lv2-login-topbar">
          <Link
            href="/"
            className="lv2-login-back"
            aria-label="Torna a Il Dispaccio"
          >
            <span className="lv2-login-back-arrow">
              <ArrowLeft className="w-3 h-3" />
            </span>
            <span>Il Dispaccio</span>
          </Link>

          <span className="lv2-login-topbar-meta hidden sm:inline-flex items-center gap-2">
            <Sparkles className="w-3 h-3" style={{ color: "hsl(var(--lv2-accent))" }} />
            Area membri
          </span>
        </header>

        <main className="lv2-login-main">
          <div className="w-full max-w-[440px]">
            <NetworkLoginForm next={next} />
            <p className="lv2-login-switch">
              Non sei ancora nel network?{" "}
              <Link href="/#richiedi">Richiedi di entrare</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
