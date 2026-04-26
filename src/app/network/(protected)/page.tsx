import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  CalendarClock,
  FileText,
} from "lucide-react";
import { SAVED_DELIBERE_MOCK } from "@/lib/delibere/mock";
import { listDelibere } from "@/lib/delibere/db";
import { deriveSectorsFromNumero } from "@/lib/delibere/api";
import { listScadenzeFuture } from "@/lib/delibere/scadenze";
import { getLatestGasStorage, listGasStorageHistory } from "@/lib/market/storage-db";
import { getLatestPun, listPunHistory } from "@/lib/market/power-pun-db";
import { V2SectorChip } from "@/components/network-v2/sector-chip";
import { DeliberaRowRich } from "@/components/network-v2/delibera-row-rich";
import { GasStorageCard } from "@/components/network-v2/gas-storage-card";
import { ElectricityCard } from "@/components/network-v2/electricity-card";
import { PodcastPreviewCard } from "@/components/network-v2/podcast-preview-card";
import { LoadForecastMini, RenewableForecastMini } from "@/components/network-v2/entsoe-cards";
import { getLatestEntsoe } from "@/lib/market/entsoe-db";
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
  const [
    member,
    allDelibere,
    allScadenze,
    gasLatest,
    gasHistory,
    punLatest,
    punHistory,
    loadRow,
    renewRow,
  ] = await Promise.all([
    getNetworkMember(),
    listDelibere({ limit: 200 }),
    listScadenzeFuture(),
    getLatestGasStorage(),
    listGasStorageHistory(60),
    getLatestPun(),
    listPunHistory(14),
    getLatestEntsoe("load_forecast"),
    getLatestEntsoe("renewable_forecast"),
  ]);

  const punWeekAgo = punLatest
    ? punHistory.find((row) => {
        const diff =
          (new Date(punLatest.price_day).getTime() -
            new Date(row.price_day).getTime()) /
          86400000;
        return diff >= 6.5 && diff <= 8;
      }) ?? null
    : null;
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
      importanza: d.ai_importanza,
      summary: d.ai_summary,
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
          <div>
            {latest.length === 0 ? (
              <div className="p-6 text-center text-sm" style={{ color: "hsl(var(--v2-text-mute))" }}>
                Nessuna delibera indicizzata.
              </div>
            ) : (
              latest.map((d) => (
                <DeliberaRowRich key={d.code} d={d} />
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

        {/* Cockpit mercato — 4 card v2-col-6 (2x2 grid) */}
        <ElectricityCard latest={punLatest} weekAgo={punWeekAgo} history={punHistory} />
        <GasStorageCard latest={gasLatest} history={gasHistory} />
        <LoadForecastMini payload={loadRow?.payload as never} />
        <RenewableForecastMini payload={renewRow?.payload as never} />

        {/* Podcast video preview — 12 */}
        <PodcastPreviewCard />

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

