import Link from "next/link";
import { NetworkLogoutButton } from "@/components/network/logout-button";

export function NetworkNavbar({ referente }: { referente: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[hsl(218,48%,14%)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link
          href="/network"
          className="flex items-center gap-2 text-sm font-semibold text-foreground"
        >
          <span className="text-primary">•</span> Il Dispaccio
          <span className="text-muted-foreground/60 text-xs font-normal">
            / network
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-muted-foreground">
            Ciao, <span className="text-foreground font-medium">{referente}</span>
          </span>
          <NetworkLogoutButton />
        </div>
      </div>
    </header>
  );
}
