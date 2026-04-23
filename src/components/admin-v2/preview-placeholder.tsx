import Link from "next/link";
import { ArrowUpRight, Construction } from "lucide-react";

export function PreviewPlaceholder({
  kicker,
  title,
  description,
  currentHref,
  currentLabel,
  features,
  accent = "accent",
}: {
  kicker: string;
  title: string;
  description: string;
  currentHref: string;
  currentLabel: string;
  features: { title: string; body: string }[];
  accent?: "accent" | "warn" | "info";
}) {
  const accentColor =
    accent === "warn"
      ? "hsl(var(--v2-warn))"
      : accent === "info"
      ? "hsl(var(--v2-info))"
      : "hsl(var(--v2-accent))";

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            {kicker}
          </p>
          <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1" style={{ color: "hsl(var(--v2-text))" }}>
            {title}
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
            {description}
          </p>
        </div>
        <Link href={currentHref} className="v2-btn v2-btn--primary">
          {currentLabel}
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      <section
        className="v2-card p-8 md:p-12 flex flex-col items-center text-center gap-4"
        style={{ borderStyle: "dashed" }}
      >
        <div
          className="w-16 h-16 rounded-xl grid place-items-center"
          style={{
            background: `${accentColor} / 0.1`,
            border: `1px solid ${accentColor}44`,
          }}
        >
          <Construction className="w-8 h-8" style={{ color: accentColor }} />
        </div>
        <span
          className="v2-mono text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded"
          style={{
            color: accentColor,
            background: `${accentColor.replace(")", " / 0.1)")}`,
            border: `1px solid ${accentColor.replace(")", " / 0.25)")}`,
          }}
        >
          Redesign in lavorazione
        </span>
        <h2 className="text-xl font-semibold" style={{ color: "hsl(var(--v2-text))" }}>
          Questa sezione è ancora sulla dashboard attuale
        </h2>
        <p className="text-sm max-w-lg" style={{ color: "hsl(var(--v2-text-dim))" }}>
          Il chrome v2 e la home sono pronti. Prima di portare anche questa sezione nel nuovo stile vogliamo la tua approvazione sulle altre. Intanto apri la versione live qui sotto — funziona come sempre.
        </p>
        <Link href={currentHref} className="v2-btn v2-btn--primary mt-2">
          {currentLabel}
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      {features.length > 0 && (
        <>
          <div className="flex items-center gap-2 pl-1 mt-2">
            <span className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
              Cosa arriverà in v2
            </span>
          </div>
          <section className="v2-bento">
            {features.map((f) => (
              <div key={f.title} className="v2-card p-5 v2-col-4 flex flex-col gap-2">
                <h3 className="text-[14px] font-semibold" style={{ color: "hsl(var(--v2-text))" }}>
                  {f.title}
                </h3>
                <p className="text-[12.5px] leading-relaxed" style={{ color: "hsl(var(--v2-text-dim))" }}>
                  {f.body}
                </p>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
