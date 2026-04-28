import { ExternalLink, Leaf, Zap, Wind, ArrowLeftRight, AlertTriangle } from "lucide-react";
import { PSR_LABELS } from "@/lib/market/entsoe-fetchers";

const MONTHS_IT = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];
function fmtDay(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return `${d.getUTCDate()} ${MONTHS_IT[d.getUTCMonth()]}`;
}

// ═══════════════════════════════════════════════════════════════
// GENERATION MIX (A75)
// ═══════════════════════════════════════════════════════════════

type GenMixPayload = {
  reference_day: string;
  by_type_mwh: Record<string, number>;
  total_mwh: number;
  renewable_pct: number;
  fossil_pct: number;
  other_pct: number;
  top_source: { psr: string; label: string; share_pct: number };
};

export function GenerationMixCard({ payload }: { payload: GenMixPayload | null }) {
  if (!payload) return <CardEmpty title="Mix generazione" Icon={Leaf} />;

  const sorted = Object.entries(payload.by_type_mwh)
    .map(([psr, mwh]) => ({
      psr,
      label: PSR_LABELS[psr] ?? psr,
      mwh,
      pct: (mwh / payload.total_mwh) * 100,
    }))
    .sort((a, b) => b.mwh - a.mwh);

  return (
    <div className="v2-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} />
          <span className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-accent))" }}>
            Mix generazione · {fmtDay(payload.reference_day)}
          </span>
        </div>
        <span className="v2-mono text-[10px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
          zona Nord · proxy IT
        </span>
      </div>

      {/* Big KPI: rinnovabili */}
      <div className="flex items-end gap-6 flex-wrap">
        <div>
          <div className="v2-mono text-[10px] uppercase tracking-[0.16em] mb-1" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Rinnovabili
          </div>
          <div className="flex items-baseline gap-1">
            <span className="v2-mono" style={{ fontSize: 42, fontWeight: 700, color: "hsl(var(--v2-accent))", letterSpacing: "-0.02em" }}>
              {payload.renewable_pct.toFixed(1)}
            </span>
            <span className="v2-mono" style={{ fontSize: 14, color: "hsl(var(--v2-text-dim))" }}>%</span>
          </div>
        </div>
        <div>
          <div className="v2-mono text-[10px] uppercase tracking-[0.16em] mb-1" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Fossili
          </div>
          <div className="flex items-baseline gap-1">
            <span className="v2-mono" style={{ fontSize: 32, fontWeight: 700, color: "hsl(var(--v2-danger))", letterSpacing: "-0.02em" }}>
              {payload.fossil_pct.toFixed(1)}
            </span>
            <span className="v2-mono" style={{ fontSize: 12, color: "hsl(var(--v2-text-dim))" }}>%</span>
          </div>
        </div>
        <div>
          <div className="v2-mono text-[10px] uppercase tracking-[0.16em] mb-1" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Altro
          </div>
          <div className="flex items-baseline gap-1">
            <span className="v2-mono" style={{ fontSize: 24, fontWeight: 700, color: "hsl(var(--v2-text-dim))" }}>
              {payload.other_pct.toFixed(1)}
            </span>
            <span className="v2-mono" style={{ fontSize: 11, color: "hsl(var(--v2-text-mute))" }}>%</span>
          </div>
        </div>
      </div>

      {/* Stacked bar */}
      <div style={{ display: "flex", height: 10, borderRadius: 6, overflow: "hidden", background: "hsl(var(--v2-border))" }}>
        {sorted.map((s) => {
          const renewSet = new Set(["B01","B09","B11","B12","B15","B16","B18","B19"]);
          const fossilSet = new Set(["B02","B04","B05","B06","B17"]);
          const color = renewSet.has(s.psr)
            ? "hsl(var(--v2-accent))"
            : fossilSet.has(s.psr)
              ? "hsl(var(--v2-danger))"
              : "hsl(var(--v2-text-mute))";
          return (
            <div
              key={s.psr}
              title={`${s.label}: ${s.pct.toFixed(1)}%`}
              style={{
                width: `${s.pct}%`,
                background: color,
                opacity: 0.85,
              }}
            />
          );
        })}
      </div>

      {/* Breakdown tabella 6 righe top */}
      <div className="flex flex-col gap-1.5">
        {sorted.slice(0, 6).map((s) => (
          <div key={s.psr} className="flex items-center justify-between text-[12.5px]">
            <span style={{ color: "hsl(var(--v2-text-dim))" }}>{s.label}</span>
            <span className="flex items-baseline gap-2">
              <span className="v2-mono" style={{ color: "hsl(var(--v2-text-mute))" }}>
                {(s.mwh / 1000).toFixed(1)} GWh
              </span>
              <span className="v2-mono font-semibold" style={{ color: "hsl(var(--v2-text))", minWidth: 44, textAlign: "right" }}>
                {s.pct.toFixed(1)}%
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="v2-mono text-[10.5px] pt-2" style={{ color: "hsl(var(--v2-text-mute))", borderTop: "1px solid hsl(var(--v2-border))" }}>
        Fonte top: <strong style={{ color: "hsl(var(--v2-text))" }}>{payload.top_source.label}</strong> · {payload.top_source.share_pct.toFixed(1)}% del mix
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LOAD FORECAST (A65)
// ═══════════════════════════════════════════════════════════════

type LoadPayload = {
  reference_day: string;
  hourly_mw: number[];
  peak_mw: number;
  peak_hour: number;
  min_mw: number;
  min_hour: number;
  avg_mw: number;
  total_mwh: number;
};

export function LoadForecastCard({ payload }: { payload: LoadPayload | null }) {
  if (!payload) return <CardEmpty title="Domanda elettrica" Icon={Zap} />;

  const fmtHour = (h: number) => `${String(h).padStart(2, "0")}:00`;
  const hourly = payload.hourly_mw;
  const max = Math.max(...hourly);
  const min = Math.min(...hourly);
  const range = max - min || 1;

  return (
    <div className="v2-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-info))" }} />
          <span className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-info))" }}>
            Domanda elettrica · {fmtDay(payload.reference_day)}
          </span>
        </div>
        <span className="v2-mono text-[10px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
          forecast · IT totale
        </span>
      </div>

      <div className="flex items-end gap-6 flex-wrap">
        <div>
          <div className="v2-mono text-[10px] uppercase tracking-[0.16em] mb-1" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Picco previsto
          </div>
          <div className="flex items-baseline gap-1">
            <span className="v2-mono" style={{ fontSize: 36, fontWeight: 700, color: "hsl(var(--v2-warn))", letterSpacing: "-0.02em" }}>
              {(payload.peak_mw / 1000).toFixed(1)}
            </span>
            <span className="v2-mono" style={{ fontSize: 13, color: "hsl(var(--v2-text-dim))" }}>GW</span>
            <span className="v2-mono text-[11px]" style={{ color: "hsl(var(--v2-text-mute))", marginLeft: 4 }}>
              alle {fmtHour(payload.peak_hour)}
            </span>
          </div>
        </div>
        <div>
          <div className="v2-mono text-[10px] uppercase tracking-[0.16em] mb-1" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Media
          </div>
          <div className="v2-mono" style={{ fontSize: 22, fontWeight: 700, color: "hsl(var(--v2-text))" }}>
            {(payload.avg_mw / 1000).toFixed(1)} <span style={{ fontSize: 11, fontWeight: 400, color: "hsl(var(--v2-text-dim))" }}>GW</span>
          </div>
        </div>
        <div>
          <div className="v2-mono text-[10px] uppercase tracking-[0.16em] mb-1" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Minimo
          </div>
          <div className="v2-mono" style={{ fontSize: 22, fontWeight: 700, color: "hsl(var(--v2-accent))" }}>
            {(payload.min_mw / 1000).toFixed(1)} <span style={{ fontSize: 11, fontWeight: 400, color: "hsl(var(--v2-text-dim))" }}>GW</span>
            <span className="v2-mono text-[11px]" style={{ color: "hsl(var(--v2-text-mute))", marginLeft: 4, fontWeight: 400 }}>
              alle {fmtHour(payload.min_hour)}
            </span>
          </div>
        </div>
      </div>

      {/* Bars orarie 24h */}
      <div className="flex items-end gap-[2px]" style={{ height: 80 }}>
        {hourly.map((v, i) => {
          const h = ((v - min) / range) * 100;
          const isPeak = v === max;
          return (
            <div
              key={i}
              title={`${fmtHour(i)}: ${(v / 1000).toFixed(2)} GW`}
              style={{
                flex: 1,
                height: `${Math.max(6, h)}%`,
                background: isPeak
                  ? "hsl(var(--v2-warn))"
                  : "hsl(var(--v2-info) / 0.5)",
                borderRadius: "2px 2px 0 0",
              }}
            />
          );
        })}
      </div>
      <div className="flex justify-between v2-mono text-[9.5px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
        <span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>
      </div>

      <div className="v2-mono text-[10.5px] pt-2" style={{ color: "hsl(var(--v2-text-mute))", borderTop: "1px solid hsl(var(--v2-border))" }}>
        Totale giornata: <strong style={{ color: "hsl(var(--v2-text))" }}>{(payload.total_mwh / 1000).toFixed(0)} GWh</strong>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RENEWABLE FORECAST (A69)
// ═══════════════════════════════════════════════════════════════

type RenewablePayload = {
  reference_day: string;
  solar_hourly_mw: number[];
  wind_hourly_mw: number[];
  solar_peak_mw: number;
  wind_peak_mw: number;
  solar_total_mwh: number;
  wind_total_mwh: number;
  combined_total_mwh: number;
};

export function RenewableForecastCard({ payload }: { payload: RenewablePayload | null }) {
  if (!payload) return <CardEmpty title="Forecast rinnovabili" Icon={Wind} />;

  const solar = payload.solar_hourly_mw;
  const wind = payload.wind_hourly_mw;
  const maxSolar = solar.length ? Math.max(...solar) : 0;
  const maxWind = wind.length ? Math.max(...wind) : 0;
  const maxBoth = Math.max(maxSolar, maxWind, 1);

  return (
    <div className="v2-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wind className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} />
          <span className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-accent))" }}>
            Forecast rinnovabili · {fmtDay(payload.reference_day)}
          </span>
        </div>
        <span className="v2-mono text-[10px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
          IT totale
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div
          className="rounded-lg p-3"
          style={{ background: "hsl(45 100% 55% / 0.08)", border: "1px solid hsl(45 100% 55% / 0.25)" }}
        >
          <div className="v2-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: "hsl(var(--v2-text-mute))" }}>
            ☀️ Solare
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="v2-mono" style={{ fontSize: 28, fontWeight: 700, color: "hsl(45 100% 60%)", letterSpacing: "-0.02em" }}>
              {(payload.solar_peak_mw / 1000).toFixed(1)}
            </span>
            <span className="v2-mono text-[11px]" style={{ color: "hsl(var(--v2-text-dim))" }}>GW picco</span>
          </div>
          <div className="v2-mono text-[10px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            {(payload.solar_total_mwh / 1000).toFixed(0)} GWh · giornata
          </div>
          <Sparkline values={solar} max={maxBoth} color="hsl(45 100% 60%)" />
        </div>

        <div
          className="rounded-lg p-3"
          style={{ background: "hsl(var(--v2-info) / 0.08)", border: "1px solid hsl(var(--v2-info) / 0.25)" }}
        >
          <div className="v2-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: "hsl(var(--v2-text-mute))" }}>
            💨 Eolico
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="v2-mono" style={{ fontSize: 28, fontWeight: 700, color: "hsl(var(--v2-info))", letterSpacing: "-0.02em" }}>
              {(payload.wind_peak_mw / 1000).toFixed(1)}
            </span>
            <span className="v2-mono text-[11px]" style={{ color: "hsl(var(--v2-text-dim))" }}>GW picco</span>
          </div>
          <div className="v2-mono text-[10px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            {(payload.wind_total_mwh / 1000).toFixed(0)} GWh · giornata
          </div>
          <Sparkline values={wind} max={maxBoth} color="hsl(var(--v2-info))" />
        </div>
      </div>

      <div className="v2-mono text-[10.5px] pt-2" style={{ color: "hsl(var(--v2-text-mute))", borderTop: "1px solid hsl(var(--v2-border))" }}>
        Combinato: <strong style={{ color: "hsl(var(--v2-text))" }}>{(payload.combined_total_mwh / 1000).toFixed(0)} GWh</strong> di rinnovabile previsto
      </div>
    </div>
  );
}

function Sparkline({ values, max, color }: { values: number[]; max: number; color: string }) {
  if (values.length === 0) return <div style={{ height: 40 }} />;
  const w = 200;
  const h = 40;
  const step = w / Math.max(1, values.length - 1);
  const path = values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(2)} ${(h - (v / max) * h).toFixed(2)}`)
    .join(" ");
  const area =
    `M 0 ${h} ` + values.map((v, i) => `L ${(i * step).toFixed(2)} ${(h - (v / max) * h).toFixed(2)}`).join(" ") + ` L ${w} ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" style={{ marginTop: 8 }}>
      <path d={area} fill={color} opacity="0.15" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// CROSS BORDER FLOWS (A11)
// ═══════════════════════════════════════════════════════════════

type FlowsPayload = {
  reference_day: string;
  borders: Array<{
    country: string;
    country_label: string;
    import_mwh: number;
    export_mwh: number;
    net_mwh: number;
  }>;
  total_net_import_mwh: number;
};

export function CrossBorderCard({ payload }: { payload: FlowsPayload | null }) {
  if (!payload) return <CardEmpty title="Scambi cross-border" Icon={ArrowLeftRight} />;

  const total = payload.total_net_import_mwh;
  const maxAbs = Math.max(
    ...payload.borders.map((b) => Math.max(Math.abs(b.import_mwh), Math.abs(b.export_mwh))),
    1,
  );

  return (
    <div className="v2-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-info))" }} />
          <span className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-info))" }}>
            Scambi cross-border · {fmtDay(payload.reference_day)}
          </span>
        </div>
        <span className="v2-mono text-[10px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
          zona Nord · physical flows
        </span>
      </div>

      <div className="flex items-end gap-2 flex-wrap">
        <div>
          <div className="v2-mono text-[10px] uppercase tracking-[0.16em] mb-1" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Net import
          </div>
          <div className="flex items-baseline gap-1">
            <span className="v2-mono" style={{ fontSize: 36, fontWeight: 700, color: total > 0 ? "hsl(var(--v2-accent))" : "hsl(var(--v2-warn))", letterSpacing: "-0.02em" }}>
              {total > 0 ? "+" : ""}{(total / 1000).toFixed(1)}
            </span>
            <span className="v2-mono" style={{ fontSize: 12, color: "hsl(var(--v2-text-dim))" }}>GWh</span>
          </div>
          <div className="v2-mono text-[11px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            {total > 0 ? "Italia riceve" : "Italia esporta"}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {payload.borders.map((b) => {
          const impPct = (b.import_mwh / maxAbs) * 50;
          const expPct = (b.export_mwh / maxAbs) * 50;
          return (
            <div key={b.country}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12.5px] font-semibold" style={{ color: "hsl(var(--v2-text))" }}>
                  {b.country_label} <span className="v2-mono text-[10px]" style={{ color: "hsl(var(--v2-text-mute))" }}>· {b.country}</span>
                </span>
                <span className="v2-mono text-[11.5px] font-semibold" style={{ color: b.net_mwh > 0 ? "hsl(var(--v2-accent))" : "hsl(var(--v2-warn))" }}>
                  net {b.net_mwh > 0 ? "+" : ""}{(b.net_mwh / 1000).toFixed(1)} GWh
                </span>
              </div>
              {/* Dual bar: import verde a sinistra, export arancio a destra */}
              <div className="flex items-center" style={{ height: 6, background: "hsl(var(--v2-border))", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${50 - impPct}%` }} />
                <div style={{ width: `${impPct}%`, background: "hsl(var(--v2-accent))", height: "100%" }} />
                <div style={{ width: "1px", height: "100%", background: "hsl(var(--v2-text-mute))" }} />
                <div style={{ width: `${expPct}%`, background: "hsl(var(--v2-warn))", height: "100%" }} />
                <div style={{ width: `${50 - expPct}%` }} />
              </div>
              <div className="flex justify-between v2-mono text-[9.5px] mt-0.5" style={{ color: "hsl(var(--v2-text-mute))" }}>
                <span>← import {(b.import_mwh / 1000).toFixed(1)}</span>
                <span>export {(b.export_mwh / 1000).toFixed(1)} →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// UNAVAILABILITY (A80) — MVP: link out to ENTSO-E Transparency
// ═══════════════════════════════════════════════════════════════

export function UnavailabilityCard() {
  return (
    <div className="v2-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-warn))" }} />
          <span className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-warn))" }}>
            Centrali fuori servizio
          </span>
        </div>
        <span
          className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
          style={{
            color: "hsl(var(--v2-text-mute))",
            background: "hsl(var(--v2-bg-elev))",
            border: "1px solid hsl(var(--v2-border))",
          }}
        >
          beta
        </span>
      </div>
      <p className="text-[12.5px] leading-relaxed" style={{ color: "hsl(var(--v2-text-dim))" }}>
        Lista centrali di produzione fuori servizio (manutenzione, guasto, rampa di uscita).
        Il dato più impattante sul PUN italiano sono le <strong style={{ color: "hsl(var(--v2-text))" }}>centrali nucleari francesi offline</strong>:
        ogni GW fuori servizio in Francia può spostare il PUN di +5-10 €/MWh.
      </p>
      <p className="text-[12px] leading-relaxed" style={{ color: "hsl(var(--v2-text-mute))" }}>
        ENTSO-E pubblica eventi via XML zippato che richiede parser dedicato.
        Integrazione completa in arrivo: per ora puoi consultare la dashboard ufficiale.
      </p>
      <a
        href="https://transparency.entsoe.eu/outage-domain/r2/unavailabilityInTransmissionGrid/show"
        target="_blank"
        rel="noopener noreferrer"
        className="v2-btn v2-btn--ghost"
        style={{ alignSelf: "flex-start", fontSize: 12 }}
      >
        <ExternalLink className="w-3.5 h-3.5" />
        ENTSO-E Transparency · Outages
      </a>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOME MINI CARDS (v2-col-6 per home network)
// ═══════════════════════════════════════════════════════════════

export function GenerationMixMini({ payload }: { payload: GenMixPayload | null }) {
  return (
    <div className="v2-card v2-col-6 flex flex-col">
      <div className="v2-card-head flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} />
          <span className="v2-card-title">Mix rinnovabili</span>
        </div>
        <span
          className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
          style={{
            color: "hsl(var(--v2-accent))",
            background: "hsl(var(--v2-accent) / 0.08)",
            border: "1px solid hsl(var(--v2-accent) / 0.28)",
          }}
        >
          ENTSO-E
        </span>
      </div>
      {payload ? (
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <span className="v2-mono" style={{ fontSize: 48, fontWeight: 700, lineHeight: 0.95, color: "hsl(var(--v2-accent))", letterSpacing: "-0.03em" }}>
              {payload.renewable_pct.toFixed(1)}
            </span>
            <span className="v2-mono" style={{ fontSize: 14, fontWeight: 600, color: "hsl(var(--v2-text-dim))" }}>% mix elettrico</span>
          </div>
          <div
            style={{
              display: "flex",
              height: 8,
              borderRadius: 4,
              overflow: "hidden",
              background: "hsl(var(--v2-border))",
            }}
          >
            <div style={{ width: `${payload.renewable_pct}%`, background: "hsl(var(--v2-accent))" }} />
            <div style={{ width: `${payload.fossil_pct}%`, background: "hsl(var(--v2-danger))" }} />
            <div style={{ width: `${payload.other_pct}%`, background: "hsl(var(--v2-text-mute))" }} />
          </div>
          <div className="flex gap-3 text-[11.5px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            <span>🟢 Rinnovabili <strong style={{ color: "hsl(var(--v2-accent))" }}>{payload.renewable_pct.toFixed(1)}%</strong></span>
            <span>🔴 Fossili <strong style={{ color: "hsl(var(--v2-danger))" }}>{payload.fossil_pct.toFixed(1)}%</strong></span>
          </div>
          <div className="text-[11.5px]" style={{ color: "hsl(var(--v2-text-dim))" }}>
            Top fonte: <strong style={{ color: "hsl(var(--v2-text))" }}>{payload.top_source.label}</strong> ({payload.top_source.share_pct.toFixed(1)}%)
          </div>
        </div>
      ) : (
        <div className="p-5 text-[12.5px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
          Sincronizzazione mix in corso.
        </div>
      )}
    </div>
  );
}

export function RenewableForecastMini({
  payload,
}: {
  payload: RenewablePayload | null;
}) {
  const maxBoth = payload
    ? Math.max(
        ...(payload.solar_hourly_mw ?? [0]),
        ...(payload.wind_hourly_mw ?? [0]),
        1,
      )
    : 1;
  return (
    <div className="v2-card v2-col-6 flex flex-col">
      <div className="v2-card-head flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wind className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} />
          <span className="v2-card-title">Forecast rinnovabili</span>
        </div>
        <span
          className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
          style={{
            color: "hsl(var(--v2-accent))",
            background: "hsl(var(--v2-accent) / 0.08)",
            border: "1px solid hsl(var(--v2-accent) / 0.28)",
          }}
        >
          ENTSO-E
        </span>
      </div>
      {payload ? (
        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div
              style={{
                padding: 10,
                borderRadius: 9,
                background: "hsl(45 100% 55% / 0.06)",
                border: "1px solid hsl(45 100% 55% / 0.22)",
              }}
            >
              <div
                className="v2-mono text-[10px] uppercase tracking-[0.16em] mb-1"
                style={{ color: "hsl(var(--v2-text-mute))" }}
              >
                ☀️ Solare
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span
                  className="v2-mono"
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: "hsl(45 100% 60%)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {(payload.solar_peak_mw / 1000).toFixed(1)}
                </span>
                <span
                  className="v2-mono text-[10.5px]"
                  style={{ color: "hsl(var(--v2-text-dim))" }}
                >
                  GW picco
                </span>
              </div>
              <SparklineMini
                values={payload.solar_hourly_mw ?? []}
                max={maxBoth}
                color="hsl(45 100% 60%)"
              />
              <div
                className="v2-mono text-[10px]"
                style={{ color: "hsl(var(--v2-text-mute))", marginTop: 4 }}
              >
                {(payload.solar_total_mwh / 1000).toFixed(0)} GWh giornata
              </div>
            </div>
            <div
              style={{
                padding: 10,
                borderRadius: 9,
                background: "hsl(var(--v2-info) / 0.06)",
                border: "1px solid hsl(var(--v2-info) / 0.22)",
              }}
            >
              <div
                className="v2-mono text-[10px] uppercase tracking-[0.16em] mb-1"
                style={{ color: "hsl(var(--v2-text-mute))" }}
              >
                💨 Eolico
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span
                  className="v2-mono"
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: "hsl(var(--v2-info))",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {(payload.wind_peak_mw / 1000).toFixed(1)}
                </span>
                <span
                  className="v2-mono text-[10.5px]"
                  style={{ color: "hsl(var(--v2-text-dim))" }}
                >
                  GW picco
                </span>
              </div>
              <SparklineMini
                values={payload.wind_hourly_mw ?? []}
                max={maxBoth}
                color="hsl(var(--v2-info))"
              />
              <div
                className="v2-mono text-[10px]"
                style={{ color: "hsl(var(--v2-text-mute))", marginTop: 4 }}
              >
                {(payload.wind_total_mwh / 1000).toFixed(0)} GWh giornata
              </div>
            </div>
          </div>
          {/* Stacked bar combinato */}
          <div>
            <div
              className="v2-mono text-[10px]"
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "hsl(var(--v2-text-mute))",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                marginBottom: 5,
                fontWeight: 600,
              }}
            >
              <span>Mix rinnovabile giornata</span>
              <span>
                <strong style={{ color: "hsl(var(--v2-accent))" }}>
                  {(payload.combined_total_mwh / 1000).toFixed(0)}
                </strong>{" "}
                GWh
              </span>
            </div>
            <div
              style={{
                height: 8,
                borderRadius: 4,
                overflow: "hidden",
                background: "hsl(var(--v2-border))",
                display: "flex",
              }}
            >
              {payload.combined_total_mwh > 0 && (
                <>
                  <div
                    style={{
                      flex: payload.solar_total_mwh,
                      background: "hsl(45 100% 60%)",
                    }}
                    title={`Solare ${((payload.solar_total_mwh / payload.combined_total_mwh) * 100).toFixed(0)}%`}
                  />
                  <div
                    style={{
                      flex: payload.wind_total_mwh,
                      background: "hsl(var(--v2-info))",
                    }}
                    title={`Eolico ${((payload.wind_total_mwh / payload.combined_total_mwh) * 100).toFixed(0)}%`}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 text-[12.5px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
          Forecast rinnovabili in sincronizzazione.
        </div>
      )}
    </div>
  );
}

function SparklineMini({
  values,
  max,
  color,
}: {
  values: number[];
  max: number;
  color: string;
}) {
  if (values.length === 0) return null;
  const w = 160;
  const h = 30;
  const step = w / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => ({
    x: i * step,
    y: h - (v / max) * (h - 2) - 1,
  }));
  const path = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const area = `M 0 ${h} ${pts
    .map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ")} L ${w} ${h} Z`;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={h}
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      <path d={area} fill={color} opacity="0.2" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}

export function LoadForecastMini({ payload }: { payload: LoadPayload | null }) {
  // Convenzione: domanda elettrica = giallo/arancio (energia)
  return (
    <div className="v2-card v2-col-6 flex flex-col">
      <div className="v2-card-head flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-warn))" }} />
          <span className="v2-card-title">Domanda elettrica · oggi</span>
        </div>
        <span
          className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
          style={{
            color: "hsl(var(--v2-warn))",
            background: "hsl(var(--v2-warn) / 0.08)",
            border: "1px solid hsl(var(--v2-warn) / 0.28)",
          }}
        >
          FORECAST
        </span>
      </div>
      {payload ? (
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <span className="v2-mono" style={{ fontSize: 48, fontWeight: 700, lineHeight: 0.95, color: "hsl(var(--v2-warn))", letterSpacing: "-0.03em" }}>
              {(payload.peak_mw / 1000).toFixed(1)}
            </span>
            <span className="v2-mono" style={{ fontSize: 14, fontWeight: 600, color: "hsl(var(--v2-text-dim))" }}>GW picco</span>
          </div>
          <div className="v2-mono text-[11.5px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            alle {String(payload.peak_hour).padStart(2, "0")}:00 · giornata {(payload.total_mwh / 1000).toFixed(0)} GWh
          </div>
          <MiniBars values={payload.hourly_mw} color="hsl(var(--v2-warn) / 0.55)" peakColor="hsl(var(--v2-warn))" />
          <div className="text-[11.5px]" style={{ color: "hsl(var(--v2-text-dim))" }}>
            Media {(payload.avg_mw / 1000).toFixed(1)} GW · Min {(payload.min_mw / 1000).toFixed(1)} GW
          </div>
        </div>
      ) : (
        <div className="p-5 text-[12.5px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
          Forecast domanda in sincronizzazione.
        </div>
      )}
    </div>
  );
}

function MiniBars({ values, color, peakColor }: { values: number[]; color: string; peakColor: string }) {
  if (values.length === 0) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  return (
    <div className="flex items-end gap-[2px]" style={{ height: 40 }}>
      {values.map((v, i) => {
        const h = ((v - min) / range) * 100;
        const isPeak = v === max;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${Math.max(8, h)}%`,
              background: isPeak ? peakColor : color,
              opacity: isPeak ? 1 : 0.55,
              borderRadius: "2px 2px 0 0",
            }}
          />
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CARD EMPTY
// ═══════════════════════════════════════════════════════════════

function CardEmpty({
  title,
  Icon,
}: {
  title: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}) {
  return (
    <div className="v2-card p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-text-mute))" }} />
        <span className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
          {title}
        </span>
      </div>
      <div className="text-[12.5px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
        Dato ENTSO-E in sincronizzazione. Apparirà al prossimo ciclo di aggiornamento.
      </div>
    </div>
  );
}
