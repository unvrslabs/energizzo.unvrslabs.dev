import { Mic, Hammer } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Podcast — Il Dispaccio",
  robots: { index: false, follow: false },
};

export default function NetworkPodcast() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-xl text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30 text-primary mb-5">
          <Mic className="h-7 w-7" />
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 mb-4">
          <Hammer className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
            In costruzione
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Il Reseller · Podcast.
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Conversazioni con CEO e COO del settore reseller energia italiano.
          Accesso in anteprima agli episodi e alle interviste complete prima
          della pubblicazione pubblica.
        </p>
        <p className="text-xs text-muted-foreground/60 leading-relaxed mt-4">
          Ti avviseremo su WhatsApp non appena sarà online.
        </p>
      </div>
    </div>
  );
}
