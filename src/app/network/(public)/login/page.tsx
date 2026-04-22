import Link from "next/link";
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
    nextRaw && nextRaw.startsWith("/network") && !nextRaw.startsWith("/network/login")
      ? nextRaw
      : undefined;

  return (
    <main className="mesh-gradient relative min-h-screen flex flex-col">
      <header className="relative z-10 p-6 md:p-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/90 hover:text-foreground transition-colors"
        >
          <span className="text-primary">•</span> Il Dispaccio
        </Link>
      </header>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <NetworkLoginForm next={next} />
          <p className="text-center text-[11px] text-muted-foreground/70 mt-6">
            Non sei ancora nel network?{" "}
            <Link
              href="/#join"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Richiedi di entrare
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
