import Link from "next/link";
import { Flame } from "lucide-react";
import { listEpisodes } from "@/lib/podcast-content";

export const dynamic = "force-dynamic";

const INTENSITY_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  bollente: { label: "🔥 Bollente", bg: "bg-orange-500/20", text: "text-orange-300" },
  medio: { label: "🌡️ Medio", bg: "bg-yellow-500/20", text: "text-yellow-300" },
  freddo: { label: "❄️ Freddo", bg: "bg-blue-500/20", text: "text-blue-300" },
};

export default function EpisodiIndex() {
  const episodes = listEpisodes();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl tracking-wide">Episodi preparati</h1>
        <p className="text-sm text-muted-foreground mt-1">
          10 puntate pre-scritte, una per tema caldo. Ogni episodio: 15 domande con risposte
          attese, talking points e argomenti collegati — così arrivi preparato all&apos;intervista.
        </p>
      </div>

      {episodes.length === 0 ? (
        <div className="liquid-glass rounded-2xl p-6 text-sm text-muted-foreground">
          Nessun episodio ancora caricato in{" "}
          <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">
            content/podcast/episodi/
          </code>
          .
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {episodes.map((ep) => {
            const intensity = ep.intensity ? INTENSITY_BADGE[ep.intensity] : null;
            return (
              <Link
                key={ep.slug}
                href={`/dashboard/podcast/episodi/${ep.slug}`}
                className="liquid-glass rounded-2xl p-5 hover:bg-white/5 transition-colors block space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  {ep.numero !== null && (
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Episodio {String(ep.numero).padStart(2, "0")}
                    </span>
                  )}
                  {intensity && (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${intensity.bg} ${intensity.text}`}
                    >
                      {intensity.label}
                    </span>
                  )}
                </div>
                <div className="font-display text-lg tracking-wide">{ep.title}</div>
                {ep.subtitle && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{ep.subtitle}</p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
