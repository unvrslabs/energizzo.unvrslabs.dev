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
import { SAVED_DELIBERE_MOCK } from "@/lib/delibere/mock";
import { listDelibere } from "@/lib/delibere/db";
import { deriveSectorsFromNumero } from "@/lib/delibere/api";
import { listScadenzeFuture } from "@/lib/delibere/scadenze";
import { getLatestGasStorage, listGasStorageHistory } from "@/lib/market/storage-db";
import { V2SectorChip } from "@/components/network-v2/sector-chip";
import { GasStorageCard } from "@/components/network-v2/gas-storage-card";
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
  const [member, allDelibere, allScadenze, gasLatest, gasHistory] = await Promise.all([
    getNetworkMember(),
    listDelibere({ limit: 200 }),
    listScadenzeFuture(),
    getLatestGasStorage(),
    listGasStorageHistory(60),
  ]);
  const firstName = (member?.referente ?? "").split(" ")[0] || "operatore";

  const latest = allDelibere
    .filter((d) => deriveSectorsFromNumero(d.numero).length > 0)
    .slice(0, 4)
    .map((d) => ({
      code: d.numero,
      title: d.titolo,
      date:
        d.scraped_data_pubblicazione ??
        d.data_pubblicazione ??
        d.data_delibera ??
        d.api_created_at ??
        d.created_at,
      sectors: deriveSectorsFromNumero(d.numero),
    }));

  const upcoming = allScadenze.slice(0, 4);

  const saved = SAVED_DELIBERE_MOCK.map((s) => {
    const d = allDelibere.find((x) => x.numero === s.code);
    return d
      ? {
          code: d.numero,
          title: d.titolo,
          sectors: deriveSectorsFromNumero(d.numero),
          savedAt: s.savedAt,
        }
      : null;
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
            {allDelibere.length} delibere indicizzate · {upcoming.length} scadenze in arrivo
          </p>
        </div>
        <Link href="/network/delibere" className="v2-btn v2-btn--primary">
          Apri compliance
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

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
            {latest.length === 0 ? (
              <div className="p-6 text-center text-sm" style={{ color: "hsl(var(--v2-text-mute))" }}>
                Nessuna delibera indicizzata.
              </div>
            ) : (
              latest.map((d) => (
                <Link
                  key={d.code}
                  href={`/network/delibere?open=${encodeURIComponent(d.code)}`}
                  className="v2-delibera-row"
                >
                  <span className="v2-delibera-code">{d.code.split("/").slice(0, 2).join("/")}</span>
                  <span className="v2-delibera-date">{d.date ? formatShortDate(d.date) : "—"}</span>
                  <span className="v2-delibera-title">{d.title}</span>
                  <span className="flex items-center gap-1">
                    {d.sectors.map((s) => (
                      <V2SectorChip key={s} sector={s} />
                    ))}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Deadlines — 4 cols */}
        <div className="v2-card v2-col-4">
          <div className="v2-card-head flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-warn))" }} />
              <span className="v2-card-title">Scadenze in arrivo</span>
            </div>
            <Link
              href="/network/scadenze"
              className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em] hover:text-white transition-colors"
              style={{ color: "hsl(var(--v2-text-mute))" }}
            >
              Tutte →
            </Link>
          </div>
          <ul className="p-2.5 flex flex-col gap-1">
            {upcoming.length === 0 ? (
              <li className="px-3 py-4 text-center text-[12.5px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
                Nessuna scadenza futura
              </li>
            ) : (
              upcoming.map((dl, i) => {
                const days = Math.ceil((new Date(dl.date + "T12:00:00Z").getTime() - Date.now()) / 86400000);
                const sev = days <= 7 ? "live" : days <= 30 ? "imminent" : days <= 90 ? "upcoming" : "far";
                return (
                  <li key={`${dl.deliberaId}-${i}`}>
                    <Link
                      href={`/network/delibere?open=${encodeURIComponent(dl.deliberaNumero)}`}
                      className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors"
                    >
                      <span className={`v2-sev v2-sev--${sev} mt-1.5`} />
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[13px] font-medium line-clamp-2"
                          style={{ color: "hsl(var(--v2-text))", lineHeight: 1.35 }}
                        >
                          {dl.label}
                        </div>
                        <div className="v2-mono text-[10.5px] mt-1 flex items-center gap-2" style={{ color: "hsl(var(--v2-text-mute))" }}>
                          <span>{formatShortDate(dl.date)} {new Date(dl.date).getFullYear()}</span>
                          <span className="opacity-50">·</span>
                          <span>{dl.deliberaNumero.split("/").slice(0, 2).join("/")}</span>
                          <span className="opacity-50">·</span>
                          <span style={{ color: days <= 7 ? "hsl(var(--v2-danger))" : days <= 30 ? "hsl(var(--v2-warn))" : undefined }}>
                            +{days}g
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* Gas storage AGSI — 6 */}
        <GasStorageCard latest={gasLatest} history={gasHistory} />

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
