import Link from "next/link";
import { Mic, Play, Clock, Video, ArrowRight } from "lucide-react";

export function PodcastPreviewCard({
  episodeNumber = "12",
  duration = "47 min",
  title = "PUN Index, Market Coupling e formule di indicizzazione: cosa cambia davvero per i reseller",
  guest = "Con Marco Conti · ex-GME",
  publishedLabel = "Nuovo episodio",
}: {
  episodeNumber?: string;
  duration?: string;
  title?: string;
  guest?: string;
  publishedLabel?: string;
} = {}) {
  return (
    <div className="v2-card v2-col-12 overflow-hidden">
      <div className="v2-card-head flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} />
          <span className="v2-card-title">Podcast &ldquo;Il Reseller&rdquo;</span>
        </div>
        <Link
          href="/network/podcast"
          className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em] hover:text-white transition-colors"
          style={{ color: "hsl(var(--v2-text-mute))" }}
        >
          Archivio →
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-0">
        {/* Video preview 16:9 */}
        <div
          className="relative group cursor-pointer"
          style={{
            aspectRatio: "16 / 9",
            background:
              "linear-gradient(135deg, hsl(215 30% 14%) 0%, hsl(158 40% 20%) 60%, hsl(200 45% 22%) 100%)",
            borderRight: "1px solid hsl(var(--v2-border))",
            overflow: "hidden",
          }}
        >
          {/* Decorative bokeh */}
          <div
            aria-hidden
            className="absolute -top-10 -right-10 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: "hsl(var(--v2-accent) / 0.22)", filter: "blur(60px)" }}
          />
          <div
            aria-hidden
            className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: "hsl(200 70% 58% / 0.18)", filter: "blur(60px)" }}
          />

          {/* REC badge top-left */}
          <div
            className="absolute top-3 left-3 flex items-center gap-1.5"
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              background: "hsl(215 30% 8% / 0.72)",
              border: "1px solid hsl(0 0% 100% / 0.06)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              className="relative inline-flex h-1.5 w-1.5"
              style={{ background: "hsl(0 72% 62%)", borderRadius: 999 }}
            />
            <span
              className="v2-mono font-semibold uppercase tracking-[0.18em]"
              style={{ fontSize: "9.5px", color: "hsl(var(--v2-text))" }}
            >
              Video · 4K
            </span>
          </div>

          {/* Ep. badge top-right */}
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5"
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              background: "hsl(215 30% 8% / 0.72)",
              border: "1px solid hsl(0 0% 100% / 0.06)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Video
              className="w-3 h-3"
              style={{ color: "hsl(var(--v2-accent))" }}
            />
            <span
              className="v2-mono font-semibold uppercase tracking-[0.16em]"
              style={{ fontSize: "10px", color: "hsl(var(--v2-text))" }}
            >
              Ep. {episodeNumber}
            </span>
          </div>

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  background: "hsl(var(--v2-accent) / 0.3)",
                  filter: "blur(20px)",
                  transform: "scale(1.3)",
                }}
              />
              <div
                className="relative grid place-items-center transition-transform duration-200 group-hover:scale-105"
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 999,
                  background:
                    "linear-gradient(135deg, hsl(var(--v2-accent)), hsl(var(--v2-accent) / 0.85))",
                  color: "hsl(215 30% 10%)",
                  boxShadow:
                    "0 16px 40px hsl(var(--v2-accent) / 0.35), inset 0 1px 0 hsl(0 0% 100% / 0.28)",
                }}
              >
                <Play
                  className="w-8 h-8"
                  fill="currentColor"
                  style={{ transform: "translateX(2px)" }}
                />
              </div>
            </div>
          </div>

          {/* Bottom overlay: duration + published badge */}
          <div
            className="absolute bottom-0 inset-x-0 p-3 flex items-end justify-between gap-3"
            style={{
              background:
                "linear-gradient(to top, hsl(215 30% 5% / 0.8), hsl(215 30% 5% / 0.4) 60%, transparent)",
            }}
          >
            <span
              className="v2-mono inline-flex items-center gap-1.5"
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 6,
                background: "hsl(215 30% 8% / 0.6)",
                border: "1px solid hsl(0 0% 100% / 0.08)",
                color: "hsl(var(--v2-text))",
                backdropFilter: "blur(6px)",
              }}
            >
              <Clock className="w-3 h-3" />
              {duration}
            </span>
            <span
              className="v2-mono font-semibold uppercase tracking-[0.14em]"
              style={{
                fontSize: 10,
                color: "hsl(var(--v2-accent))",
                padding: "3px 8px",
                borderRadius: 999,
                background: "hsl(var(--v2-accent) / 0.14)",
                border: "1px solid hsl(var(--v2-accent) / 0.3)",
              }}
            >
              {publishedLabel}
            </span>
          </div>
        </div>

        {/* Metadata panel */}
        <div className="p-5 flex flex-col gap-3">
          <div
            className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "hsl(var(--v2-text-mute))" }}
          >
            Episodio {episodeNumber} · video
          </div>
          <h3
            className="font-semibold leading-tight"
            style={{
              color: "hsl(var(--v2-text))",
              fontSize: 16,
              letterSpacing: "-0.015em",
              lineHeight: 1.3,
            }}
          >
            {title}
          </h3>
          <p
            className="text-[12.5px] leading-relaxed"
            style={{ color: "hsl(var(--v2-text-dim))" }}
          >
            {guest}
          </p>
          <div className="flex items-center gap-2 mt-auto pt-2 flex-wrap">
            <button type="button" className="v2-btn v2-btn--primary">
              <Play className="w-3.5 h-3.5" fill="currentColor" />
              Guarda episodio
            </button>
            <Link href="/network/podcast" className="v2-btn">
              Archivio
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
