import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  CalendarClock,
  FileText,
  Mic,
  Play,
  TrendingUp,
} from "lucide-react";
import {
  DELIBERE,
  DELIBERE_DEADLINES,
  SAVED_DELIBERE_MOCK,
} from "@/lib/delibere/mock";
import { V2TickerRow } from "@/components/network-v2/ticker-row";
import { V2SectorChip } from "@/components/network-v2/sector-chip";
import { getNetworkMember } from "@/lib/network/session";

export const dynamic = "force-dynamic";

const MONTHS_IT = [
  "gen",
  "feb",
  "mar",
  "apr",
  "mag",
  "giu",
  "lug",
  "ago",
  "set",
  "ott",
  "nov",
  "dic",
];

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()]}`;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buongiorno";
  if (h < 18) return "Buon pomeriggio";
  return "Buonasera";
}

export default async function V2HomePage() {
  const member = await getNetworkMember();
  const firstName = (member?.referente ?? "").split(" ")[0] || "operatore";

  const latest = DELIBERE.slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  const upcoming = DELIBERE_DEADLINES.slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const saved = SAVED_DELIBERE_MOCK.map((s) => {
    const d = DELIBERE.find((x) => x.code === s.code);
    return d ? { ...d, savedAt: s.savedAt } : null;
  }).filter(Boolean);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <header className="flex items-end justify-between gap-4 flex-wrap pb-1">
        <div>
          <p className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Dashboard · {new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1" style={{ color: "hsl(var(--v2-text))" }}>
            {greeting()}, {firstName}.
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
            8 nuove delibere pubblicate · 1 scadenza live · PUN in salita del 25%
          </p>
        </div>
        <Link href="/network/delibere" className="v2-btn v2-btn--primary">
          Apri compliance
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Market snapshot */}
      <section>
        <SectionLabel icon={<TrendingUp />} label="Mercato · snapshot spot" />
        <V2TickerRow />
      </section>

      {/* Bento */}
      <section className="v2-bento">
        {/* Latest delibere — 8 cols */}
        <div className="v2-card v2-col-8">
          <div className="v2-card-head flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} />
              <span className="v2-card-title">Ultime delibere ARERA</span>
            </div>
            <Link
              href="/network/delibere"
              className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em] hover:text-white transition-colors"
              style={{ color: "hsl(var(--v2-text-mute))" }}
            >
              Tutte →
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: "hsl(var(--v2-border))" }}>
            {latest.map((d) => (
              <Link
                key={d.code}
                href={`/network/delibere?open=${encodeURIComponent(d.code)}`}
                className="v2-delibera-row"
              >
                <span className="v2-delibera-code">{d.code}</span>
                <span className="v2-delibera-date">{formatShortDate(d.date)}</span>
                <span className="v2-delibera-title">{d.title}</span>
                <span className="flex items-center gap-1">
                  {d.sectors.map((s) => (
                    <V2SectorChip key={s} sector={s} />
                  ))}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Deadlines — 4 cols */}
        <div className="v2-card v2-col-4">
          <div className="v2-card-head flex items-center gap-2">
            <CalendarClock className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-warn))" }} />
            <span className="v2-card-title">Scadenze in arrivo</span>
          </div>
          <ul className="p-2.5 flex flex-col gap-1">
            {upcoming.map((dl) => (
              <li
                key={dl.deliberaCode + dl.date}
                className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors"
              >
                <span className={`v2-sev v2-sev--${dl.severity} mt-1.5`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium" style={{ color: "hsl(var(--v2-text))" }}>
                    {dl.label}
                  </div>
                  <div className="v2-mono text-[10.5px] mt-0.5 flex items-center gap-2" style={{ color: "hsl(var(--v2-text-mute))" }}>
                    <span>{formatShortDate(dl.date)} {new Date(dl.date).getFullYear()}</span>
                    <span className="opacity-50">·</span>
                    <span>{dl.deliberaCode.split("/").slice(0, 2).join("/")}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Price Engine preview — 6 */}
        <div className="v2-card v2-col-6">
          <div className="v2-card-head flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-info))" }} />
              <span className="v2-card-title">Price Engine · preview</span>
            </div>
            <span className="v2-card-kicker">beta</span>
          </div>
          <div className="p-4">
            <div className="flex items-baseline gap-3 mb-3">
              <span className="v2-mono text-[36px] font-bold leading-none" style={{ color: "hsl(var(--v2-text))" }}>
                0,1124
              </span>
              <span className="text-xs" style={{ color: "hsl(var(--v2-text-mute))" }}>€/kWh · indicativo cliente BT domestico</span>
            </div>
            <MiniSpark />
            <p className="text-[12.5px] leading-relaxed mt-3" style={{ color: "hsl(var(--v2-text-dim))" }}>
              Il motore calcola prezzo finale cliente includendo spot + oneri + accise + spread commerciale. Configura scenari cliente per confronto pre/post delibera.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Link href="/network/price-engine" className="v2-btn v2-btn--primary">
                Apri motore
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <button type="button" className="v2-btn">Scarica template</button>
            </div>
          </div>
        </div>

        {/* Latest podcast — 6 */}
        <div className="v2-card v2-col-6">
          <div className="v2-card-head flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} />
              <span className="v2-card-title">Podcast · ultimo episodio</span>
            </div>
            <span className="v2-card-kicker">nuovo</span>
          </div>
          <div className="p-4 flex gap-4">
            <div
              className="w-24 h-24 rounded-lg shrink-0 grid place-items-center"
              style={{
                background: "linear-gradient(135deg, hsl(158 60% 32%), hsl(200 40% 24%))",
                border: "1px solid hsl(var(--v2-border-strong))",
              }}
            >
              <Mic className="w-8 h-8 opacity-70" style={{ color: "hsl(var(--v2-accent))" }} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="v2-mono text-[10.5px] font-semibold tracking-[0.14em] uppercase" style={{ color: "hsl(var(--v2-text-mute))" }}>
                Ep.12 · 47 min
              </div>
              <h4 className="text-[15px] font-semibold leading-snug mt-1" style={{ color: "hsl(var(--v2-text))" }}>
                PUN Index, Market Coupling e formule di indicizzazione: cosa cambia davvero per i reseller
              </h4>
              <p className="text-[12px] mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
                Con Marco Conti, ex-GME
              </p>
              <div className="flex items-center gap-2 mt-auto pt-3">
                <button type="button" className="v2-btn v2-btn--primary">
                  <Play className="w-3.5 h-3.5" fill="currentColor" />
                  Ascolta
                </button>
                <Link href="/network/podcast" className="v2-btn">Archivio</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Saved — 12 */}
        <div className="v2-card v2-col-12">
          <div className="v2-card-head flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-warn))" }} />
              <span className="v2-card-title">Salvate da te</span>
            </div>
            <span className="v2-card-kicker">{saved.length} elementi</span>
          </div>
          <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-2">
            {saved.map((d) => (
              d && (
                <Link
                  key={d.code}
                  href={`/network/delibere?open=${encodeURIComponent(d.code)}`}
                  className="v2-card v2-card--interactive p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="v2-delibera-code">{d.code}</span>
                    <div className="flex items-center gap-1">
                      {d.sectors.map((s) => (
                        <V2SectorChip key={s} sector={s} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[12.5px] leading-snug line-clamp-2" style={{ color: "hsl(var(--v2-text))" }}>
                    {d.title}
                  </p>
                  <span className="v2-mono text-[10px] mt-auto" style={{ color: "hsl(var(--v2-text-mute))" }}>
                    Salvata {formatShortDate(d.savedAt)}
                  </span>
                </Link>
              )
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2.5 pl-1">
      <span style={{ color: "hsl(var(--v2-text-mute))" }}>{icon}</span>
      <span className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
        {label}
      </span>
      <span className="flex-1 h-px" style={{ background: "hsl(var(--v2-border))" }} />
    </div>
  );
}

function MiniSpark() {
  // decorative inline svg sparkline — non-interactive, mock data
  const points = [12, 18, 14, 22, 19, 25, 30, 28, 35, 32, 40, 45, 42, 50];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const w = 360;
  const h = 56;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / (max - min)) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12" preserveAspectRatio="none">
      <defs>
        <linearGradient id="v2-spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(158 72% 48%)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(158 72% 48%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill="url(#v2-spark)" />
      <path d={path} fill="none" stroke="hsl(158 72% 55%)" strokeWidth="1.5" />
    </svg>
  );
}
