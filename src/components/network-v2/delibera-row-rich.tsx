import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { V2SectorChip } from "@/components/network-v2/sector-chip";
import type { UiSector } from "@/lib/delibere/api";

const MONTHS_IT = [
  "gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic",
];

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()]}`;
}

const IMPORTANZA_META: Record<
  "critica" | "alta" | "normale" | "bassa",
  { color: string; bg: string; border: string; label: string; tint: string }
> = {
  critica: {
    color: "hsl(var(--v2-danger))",
    bg: "hsl(var(--v2-danger) / 0.12)",
    border: "hsl(var(--v2-danger) / 0.4)",
    label: "Critica",
    tint: "hsl(var(--v2-danger) / 0.6)",
  },
  alta: {
    color: "hsl(var(--v2-warn))",
    bg: "hsl(var(--v2-warn) / 0.12)",
    border: "hsl(var(--v2-warn) / 0.4)",
    label: "Alta",
    tint: "hsl(var(--v2-warn) / 0.55)",
  },
  normale: {
    color: "hsl(var(--v2-info))",
    bg: "hsl(var(--v2-info) / 0.10)",
    border: "hsl(var(--v2-info) / 0.3)",
    label: "Normale",
    tint: "hsl(var(--v2-info) / 0.4)",
  },
  bassa: {
    color: "hsl(var(--v2-text-mute))",
    bg: "hsl(var(--v2-text-mute) / 0.08)",
    border: "hsl(var(--v2-text-mute) / 0.25)",
    label: "Bassa",
    tint: "hsl(var(--v2-text-mute) / 0.4)",
  },
};

export type DeliberaRowRichItem = {
  code: string;
  title: string;
  date: string | null;
  sectors: UiSector[];
  importanza: "critica" | "alta" | "normale" | "bassa" | null;
  summary: string | null;
};

/**
 * Riga delibera "ricca" per home network e archivio delibere.
 * Densa ma leggibile: stripe importanza | header (codice+chip+data+NEW) |
 * titolo | AI summary preview.
 *
 * Modalità:
 * - default: Link a /network/delibere?open={code}
 * - selettore: passa onClick + active per usarla come selector lista
 */
export function DeliberaRowRich({
  d,
  onClick,
  active,
}: {
  d: DeliberaRowRichItem;
  onClick?: () => void;
  active?: boolean;
}) {
  const meta = d.importanza ? IMPORTANZA_META[d.importanza] : null;
  const isNew = d.date
    ? Date.now() - new Date(d.date).getTime() < 48 * 3600 * 1000
    : false;

  // Codice troncato 102/2026 (no suffix lungo come /R/eel)
  const shortCode = d.code.split("/").slice(0, 2).join("/");

  const baseStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "12px 14px 12px 18px",
    borderBottom: "1px solid hsl(var(--v2-border))",
    position: "relative",
    textDecoration: "none",
    transition: "background 140ms ease",
    background: active ? "hsl(var(--v2-accent) / 0.06)" : "transparent",
    boxShadow: active ? "inset 2px 0 0 hsl(var(--v2-accent))" : "none",
    cursor: "pointer",
  };

  const inner = (
    <>
      {/* Stripe importanza */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 8,
          bottom: 8,
          width: 3,
          borderRadius: 2,
          background: meta?.tint ?? "transparent",
        }}
      />

      {/* Riga 1: codice + sector chip + spacer + data + new dot + arrow */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 6,
        }}
      >
        <span
          className="v2-mono"
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "hsl(var(--v2-text))",
            letterSpacing: "0.02em",
          }}
        >
          {shortCode}
        </span>
        <div className="flex items-center gap-1">
          {d.sectors.map((s) => (
            <V2SectorChip key={s} sector={s} />
          ))}
        </div>
        {meta && d.importanza && (d.importanza === "critica" || d.importanza === "alta") && (
          <span
            className="v2-mono"
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: meta.color,
              background: meta.bg,
              padding: "1px 6px",
              borderRadius: 3,
              border: `1px solid ${meta.border}`,
            }}
            title={`Importanza ${meta.label}`}
          >
            {meta.label}
          </span>
        )}
        <div style={{ flex: 1 }} />
        {isNew && (
          <span
            className="v2-mono"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "hsl(var(--v2-accent))",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "hsl(var(--v2-accent))",
                boxShadow: "0 0 6px hsl(var(--v2-accent) / 0.7)",
                animation: "v2-pulse 2s ease-in-out infinite",
              }}
            />
            New
          </span>
        )}
        <span
          className="v2-mono"
          style={{
            fontSize: 11,
            color: "hsl(var(--v2-text-mute))",
          }}
        >
          {d.date ? formatShortDate(d.date) : "—"}
        </span>
        <ArrowRight
          className="w-3 h-3"
          style={{ color: "hsl(var(--v2-text-mute))", flexShrink: 0 }}
        />
      </div>

      {/* Titolo */}
      <div
        style={{
          fontSize: 13.5,
          lineHeight: 1.35,
          color: "hsl(var(--v2-text))",
          fontWeight: 500,
          display: "-webkit-box",
          WebkitLineClamp: 1,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {d.title}
      </div>

      {/* AI summary preview */}
      {d.summary && (
        <div
          style={{
            fontSize: 11.5,
            lineHeight: 1.4,
            color: "hsl(var(--v2-text-dim))",
            marginTop: 4,
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          <span
            className="v2-mono"
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "hsl(var(--v2-accent))",
              marginRight: 6,
            }}
          >
            AI
          </span>
          {d.summary}
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{ ...baseStyle, border: "none", color: "inherit" }}
        className="delibera-rich-row"
      >
        {inner}
      </button>
    );
  }

  return (
    <Link
      href={`/network/delibere?open=${encodeURIComponent(d.code)}`}
      style={baseStyle}
      className="delibera-rich-row"
    >
      {inner}
    </Link>
  );
}
