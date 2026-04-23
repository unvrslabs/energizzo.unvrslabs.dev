import Link from "next/link";
import { TrendingUp, Flame, Zap } from "lucide-react";
import { MercatoTabs } from "@/components/network-v2/mercato-tabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mercato · Terminal",
};

export default function MercatoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p
            className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "hsl(var(--v2-text-mute))" }}
          >
            Mercato · Dati operativi
          </p>
          <h1
            className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1 flex items-center gap-2.5"
            style={{ color: "hsl(var(--v2-text))" }}
          >
            <TrendingUp className="w-6 h-6" style={{ color: "hsl(var(--v2-accent))" }} />
            Mercato energia
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
            Dati di mercato gratuiti e verificati · aggiornamento giornaliero
          </p>
        </div>
      </header>
      <MercatoTabs />
      {children}
    </div>
  );
}
