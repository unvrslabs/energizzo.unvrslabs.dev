import { Mic } from "lucide-react";
import { PodcastV2Tabs } from "@/components/admin-v2/podcast-tabs";

export const dynamic = "force-dynamic";

export default function PodcastV2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
          Content · Podcast production
        </p>
        <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1 flex items-center gap-2" style={{ color: "hsl(var(--v2-text))" }}>
          <Mic className="w-6 h-6" style={{ color: "hsl(var(--v2-accent))" }} />
          Il Dispaccio Podcast
        </h1>
        <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
          Editor episodi · rubrica ospiti · briefing · knowledge regolatoria
        </p>
      </header>

      <PodcastV2Tabs />

      {children}
    </div>
  );
}
