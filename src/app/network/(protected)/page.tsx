import { Hammer } from "lucide-react";
import { getNetworkMember } from "@/lib/network/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Area riservata — Il Dispaccio",
  robots: { index: false, follow: false },
};

export default async function NetworkHomePage() {
  const member = await getNetworkMember();
  if (!member) return null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-xl text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 mb-6">
          <Hammer className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
            In costruzione
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Benvenuto nel network, {member.referente}.
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Stiamo costruendo il sito riservato ai membri del network Il
          Dispaccio. Qui a breve troverai tutti i contenuti, gli strumenti e
          la community pensati per te.
        </p>
        <p className="text-xs text-muted-foreground/60 leading-relaxed mt-6">
          Ti avviseremo su WhatsApp non appena sarà online.
        </p>
      </div>
    </div>
  );
}
