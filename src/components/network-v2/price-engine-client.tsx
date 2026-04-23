"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Zap, Flame } from "lucide-react";
import {
  LUCE_TIPOLOGIE,
  LUCE_GROUPS_ORDER,
  LUCE_COMPONENTI_GROUPS,
  formatCompetenzaFatturazione,
  formatPeriodoKey,
  fatturazioneForCompetenza,
  formatOnere,
  type Commodity,
} from "@/lib/oneri/meta";

export type PeriodOption = {
  key: string;
  da: string;
  a: string;
  fallback: boolean;
};

export function PriceEngineClient({
  commodity,
  periods,
  selectedPeriodKey,
  data,
}: {
  commodity: Commodity;
  periods: PeriodOption[];
  selectedPeriodKey: string | null;
  data: Record<string, Record<string, unknown>> | null;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  function setCommodity(next: Commodity) {
    const params = new URLSearchParams(sp?.toString() ?? "");
    params.set("commodity", next);
    params.delete("mese"); // reset mese quando cambio commodity
    router.push(`/network/price-engine?${params.toString()}`);
  }

  function setPeriodo(k: string) {
    const params = new URLSearchParams(sp?.toString() ?? "");
    params.set("mese", k);
    params.set("commodity", commodity);
    router.push(`/network/price-engine?${params.toString()}`);
  }

  const selectedPeriod = periods.find((p) => p.key === selectedPeriodKey);

  // Group tipologie by famiglia
  const groupedRows = useMemo(() => {
    if (!data) return [];
    return LUCE_GROUPS_ORDER.map((groupName) => ({
      group: groupName,
      items: Object.entries(LUCE_TIPOLOGIE)
        .filter(([, meta]) => meta.group === groupName)
        .filter(([ot]) => data[ot])
        .map(([ot, meta]) => ({ ot, label: meta.label, values: data[ot] })),
    })).filter((g) => g.items.length > 0);
  }, [data]);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div
        className="v2-card p-3 flex items-center gap-3 flex-wrap"
        style={{ padding: "12px 16px" }}
      >
        {/* Commodity toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "hsl(var(--v2-bg-elev))", border: "1px solid hsl(var(--v2-border))" }}>
          <button
            type="button"
            onClick={() => setCommodity("luce")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors"
            style={{
              background: commodity === "luce" ? "hsl(var(--v2-accent) / 0.14)" : "transparent",
              color: commodity === "luce" ? "hsl(var(--v2-accent))" : "hsl(var(--v2-text-dim))",
              border: commodity === "luce" ? "1px solid hsl(var(--v2-accent) / 0.35)" : "1px solid transparent",
            }}
          >
            <Zap className="w-3.5 h-3.5" />
            Luce
          </button>
          <button
            type="button"
            onClick={() => setCommodity("gas")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors"
            style={{
              background: commodity === "gas" ? "hsl(var(--v2-accent) / 0.14)" : "transparent",
              color: commodity === "gas" ? "hsl(var(--v2-accent))" : "hsl(var(--v2-text-dim))",
              border: commodity === "gas" ? "1px solid hsl(var(--v2-accent) / 0.35)" : "1px solid transparent",
            }}
          >
            <Flame className="w-3.5 h-3.5" />
            Gas
          </button>
        </div>

        {/* Period select */}
        <div className="flex items-center gap-2">
          <span
            className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "hsl(var(--v2-text-mute))" }}
          >
            Competenza
          </span>
          <select
            value={selectedPeriodKey ?? ""}
            onChange={(e) => setPeriodo(e.target.value)}
            disabled={periods.length === 0}
            className="v2-input"
            style={{ minWidth: 280, padding: "7px 10px", fontSize: 13 }}
          >
            {periods.length === 0 && <option value="">Nessun periodo disponibile</option>}
            {periods.map((p) => (
              <option key={p.key} value={p.key}>
                {formatCompetenzaFatturazione(p.key)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Body */}
      {!data ? (
        <EmptyState commodity={commodity} />
      ) : (
        <div className="flex flex-col gap-5">
          {/* Period label + info */}
          {selectedPeriod && selectedPeriodKey && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="v2-mono text-[10px] font-semibold uppercase tracking-[0.18em] px-2 py-1 rounded"
                  style={{
                    color: "hsl(var(--v2-accent))",
                    background: "hsl(var(--v2-accent) / 0.1)",
                    border: "1px solid hsl(var(--v2-accent) / 0.28)",
                  }}
                >
                  Competenza {formatPeriodoKey(selectedPeriodKey)}
                </span>
                <span className="v2-mono text-[10px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
                  →
                </span>
                <span
                  className="v2-mono text-[10px] font-semibold uppercase tracking-[0.18em] px-2 py-1 rounded"
                  style={{
                    color: "hsl(var(--v2-text))",
                    background: "hsl(var(--v2-bg-elev))",
                    border: "1px solid hsl(var(--v2-border))",
                  }}
                >
                  Fatturazione {formatPeriodoKey(fatturazioneForCompetenza(selectedPeriodKey))}
                </span>
              </div>
              <span
                className="v2-mono text-[10.5px]"
                style={{ color: "hsl(var(--v2-text-mute))" }}
              >
                Periodo {formatRange(selectedPeriod.da, selectedPeriod.a)} · {Object.keys(data).length} tipologie · fonte ARERA
              </span>
            </div>
          )}

          {/* Componenti per famiglia */}
          {LUCE_COMPONENTI_GROUPS.map((cg) => (
            <section key={cg.title} className="v2-card overflow-hidden">
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid hsl(var(--v2-border))" }}
              >
                <div>
                  <div
                    className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: "hsl(var(--v2-accent))" }}
                  >
                    {cg.title}
                  </div>
                </div>
                <span
                  className="v2-mono text-[10px]"
                  style={{ color: "hsl(var(--v2-text-mute))" }}
                >
                  {cg.items.length} componenti
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid hsl(var(--v2-border))" }}>
                      <th
                        className="v2-mono text-left px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em]"
                        style={{ color: "hsl(var(--v2-text-mute))", position: "sticky", left: 0, background: "hsl(var(--v2-card))", minWidth: 240 }}
                      >
                        Tipologia
                      </th>
                      {cg.items.map((item) => (
                        <th
                          key={item.key}
                          className="v2-mono text-right px-3 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em]"
                          style={{ color: "hsl(var(--v2-text-mute))", minWidth: 140 }}
                        >
                          <div>{item.label}</div>
                          <div
                            style={{
                              fontSize: 9,
                              letterSpacing: "0.1em",
                              marginTop: 2,
                              color: "hsl(var(--v2-text-mute) / 0.7)",
                            }}
                          >
                            {item.unit}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {groupedRows.flatMap((g, gi) => [
                      <tr key={`sep-${gi}`}>
                        <td
                          colSpan={cg.items.length + 1}
                          className="v2-mono text-[10px] font-semibold uppercase tracking-[0.18em] px-4 py-1.5"
                          style={{
                            color: "hsl(var(--v2-text-mute))",
                            background: "hsl(var(--v2-bg-elev))",
                            borderBottom: "1px solid hsl(var(--v2-border))",
                          }}
                        >
                          {g.group}
                        </td>
                      </tr>,
                      ...g.items.map((row) => (
                        <tr
                          key={row.ot}
                          style={{ borderBottom: "1px solid hsl(var(--v2-border))" }}
                        >
                          <td
                            className="px-4 py-2.5 text-[12.5px] font-medium"
                            style={{
                              color: "hsl(var(--v2-text))",
                              position: "sticky",
                              left: 0,
                              background: "hsl(var(--v2-card))",
                            }}
                          >
                            <span className="v2-mono text-[10px] uppercase tracking-[0.12em] mr-2" style={{ color: "hsl(var(--v2-text-mute))" }}>
                              {row.ot}
                            </span>
                            {row.label}
                          </td>
                          {cg.items.map((item) => (
                            <td
                              key={item.key}
                              className="v2-mono px-3 py-2.5 text-[12.5px] text-right"
                              style={{ color: "hsl(var(--v2-text))", fontVariantNumeric: "tabular-nums" }}
                            >
                              {formatOnere(row.values[item.key])}
                            </td>
                          ))}
                        </tr>
                      )),
                    ])}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function formatRange(da: string, a: string): string {
  const fmt = (iso: string) => {
    const d = new Date(iso);
    const months = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];
    return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  };
  return `${fmt(da)} → ${fmt(a)}`;
}

function EmptyState({ commodity }: { commodity: Commodity }) {
  return (
    <div className="v2-card p-10 text-center flex flex-col items-center gap-3">
      <div
        className="inline-flex items-center justify-center w-12 h-12 rounded-xl"
        style={{
          background: "hsl(var(--v2-warn) / 0.08)",
          border: "1px solid hsl(var(--v2-warn) / 0.22)",
          color: "hsl(var(--v2-warn))",
        }}
      >
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[15px] font-semibold" style={{ color: "hsl(var(--v2-text))" }}>
          Nessun dato disponibile per il {commodity === "luce" ? "settore luce" : "gas naturale"}
        </p>
        <p className="text-[13px] mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
          I dati verranno popolati appena ARERA renderà disponibili i valori tariffari per questo periodo.
        </p>
      </div>
    </div>
  );
}
