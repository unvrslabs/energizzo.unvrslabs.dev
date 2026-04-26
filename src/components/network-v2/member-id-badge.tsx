import { Zap } from "lucide-react";

const NETWORK_CAP = 100;

/**
 * Badge "gaming" che mostra l'ID progressivo del membro nel network.
 * Stile cockpit/console: numero HUGE display font, gradient emerald,
 * scanline e mesh sottile, corner brackets stile sci-fi.
 */
export function MemberIdBadge({
  inviteNumber,
  approvedAt,
}: {
  inviteNumber: number | null;
  approvedAt: string;
}) {
  const padded = inviteNumber !== null ? String(inviteNumber).padStart(3, "0") : "—";
  const cap = String(NETWORK_CAP).padStart(3, "0");
  const since = new Date(approvedAt).toLocaleDateString("it-IT", {
    month: "short",
    year: "numeric",
  });

  return (
    <div
      style={{
        position: "relative",
        background:
          "linear-gradient(135deg, hsl(var(--v2-card)) 0%, hsl(var(--v2-bg-elev)) 100%)",
        border: "1px solid hsl(var(--v2-accent) / 0.32)",
        borderRadius: 14,
        padding: "22px 24px",
        overflow: "hidden",
        boxShadow:
          "0 0 0 1px hsl(var(--v2-accent) / 0.08) inset, 0 12px 32px hsl(var(--v2-accent) / 0.08)",
      }}
    >
      {/* Layer 1: scanline orizzontali */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, hsl(var(--v2-accent) / 0.022) 3px, hsl(var(--v2-accent) / 0.022) 4px)",
          pointerEvents: "none",
        }}
      />
      {/* Layer 2: glow radiale dietro al numero */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          right: 24,
          transform: "translateY(-50%)",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, hsl(var(--v2-accent) / 0.18) 0%, transparent 65%)",
          pointerEvents: "none",
          filter: "blur(8px)",
        }}
      />
      {/* Corner brackets */}
      <CornerBracket position="tl" />
      <CornerBracket position="tr" />
      <CornerBracket position="bl" />
      <CornerBracket position="br" />

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        {/* Sinistra: kicker + numero gigante */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
          <div
            className="v2-mono"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "hsl(var(--v2-accent))",
            }}
          >
            <Zap className="w-3 h-3" />
            <span>Member ID</span>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "hsl(var(--v2-accent))",
                boxShadow: "0 0 6px hsl(var(--v2-accent) / 0.8)",
                animation: "v2-pulse 2s ease-in-out infinite",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              lineHeight: 0.9,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display), var(--font-mono), monospace",
                fontWeight: 800,
                fontSize: "clamp(56px, 9vw, 96px)",
                letterSpacing: "-0.04em",
                color: "hsl(var(--v2-text))",
                background:
                  "linear-gradient(180deg, hsl(var(--v2-text)) 0%, hsl(var(--v2-accent)) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 0 32px hsl(var(--v2-accent) / 0.25)",
              }}
            >
              #{padded}
            </span>
            <span
              className="v2-mono"
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "hsl(var(--v2-text-mute))",
                letterSpacing: "0.04em",
              }}
            >
              / {cap}
            </span>
          </div>
          <div
            className="v2-mono"
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "hsl(var(--v2-text-mute))",
            }}
          >
            Network member · attivo da {since}
          </div>
        </div>

        {/* Destra: meta info — barra power */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            minWidth: 200,
          }}
        >
          <PowerStat
            label="Slot occupati"
            current={inviteNumber ?? 0}
            total={NETWORK_CAP}
          />
          <div
            className="v2-mono"
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "hsl(var(--v2-text-mute))",
              lineHeight: 1.6,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Tier</span>
              <span style={{ color: "hsl(var(--v2-accent))" }}>
                {tierLabel(inviteNumber)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Status</span>
              <span style={{ color: "hsl(var(--v2-text))" }}>Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CornerBracket({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const size = 14;
  const thickness = 1.5;
  const color = "hsl(var(--v2-accent) / 0.55)";
  const offset = 10;
  const base: React.CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    pointerEvents: "none",
  };
  const map: Record<typeof position, React.CSSProperties> = {
    tl: {
      ...base,
      top: offset,
      left: offset,
      borderLeft: `${thickness}px solid ${color}`,
      borderTop: `${thickness}px solid ${color}`,
    },
    tr: {
      ...base,
      top: offset,
      right: offset,
      borderRight: `${thickness}px solid ${color}`,
      borderTop: `${thickness}px solid ${color}`,
    },
    bl: {
      ...base,
      bottom: offset,
      left: offset,
      borderLeft: `${thickness}px solid ${color}`,
      borderBottom: `${thickness}px solid ${color}`,
    },
    br: {
      ...base,
      bottom: offset,
      right: offset,
      borderRight: `${thickness}px solid ${color}`,
      borderBottom: `${thickness}px solid ${color}`,
    },
  };
  return <span aria-hidden style={map[position]} />;
}

function PowerStat({
  label,
  current,
  total,
}: {
  label: string;
  current: number;
  total: number;
}) {
  const pct = Math.min(100, Math.max(0, (current / total) * 100));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        className="v2-mono"
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "hsl(var(--v2-text-mute))",
        }}
      >
        <span>{label}</span>
        <span style={{ color: "hsl(var(--v2-text))" }}>
          {current}/{total}
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: "hsl(var(--v2-border))",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, hsl(var(--v2-accent) / 0.6), hsl(var(--v2-accent)))",
            boxShadow: "0 0 12px hsl(var(--v2-accent) / 0.5)",
            transition: "width 600ms ease",
          }}
        />
      </div>
    </div>
  );
}

function tierLabel(n: number | null): string {
  if (n === null) return "—";
  if (n <= 10) return "Founder";
  if (n <= 30) return "Pioneer";
  if (n <= 60) return "Early";
  return "Member";
}
