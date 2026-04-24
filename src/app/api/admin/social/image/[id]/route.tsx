import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { getAdminMember } from "@/lib/admin/session";

export const runtime = "nodejs";

type Format = "square" | "feed" | "landscape";

const DIMENSIONS: Record<Format, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  feed: { width: 1200, height: 627 },
  landscape: { width: 1600, height: 900 },
};

// ─── PALETTE + ELEMENTI COMUNI ──────────────────────────────
const BG_BASE = "#061a17";
const BG_GRADIENT = `
  radial-gradient(ellipse 80% 60% at 25% 20%, #0e4a35 0%, #061a17 55%, #020a0a 100%),
  linear-gradient(180deg, #061a17 0%, #020a08 100%)
`;
const ACCENT = "#4fd1a1";
const ACCENT_DIM = "#2a8567";
const TEXT = "#f4fcf8";
const MUTE = "#7fa898";
const DIM = "#b6dacc";
const WARN = "#ff9f5a";
const DANGER = "#ff6b6b";

// ─── HELPERS UI ──────────────────────────────────────────────

function cornerBadge(label: string, kind: "info" | "warn" | "danger" = "info") {
  const color = kind === "warn" ? WARN : kind === "danger" ? DANGER : ACCENT;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 16px",
        borderRadius: 999,
        background: `${color}22`,
        border: `1px solid ${color}55`,
        fontSize: 22,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color,
        fontWeight: 800,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 12px ${color}`,
        }}
      />
      {label}
    </div>
  );
}

function brandFooter(extra?: string) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 20,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: MUTE,
        fontWeight: 700,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: ACCENT,
            boxShadow: `0 0 8px ${ACCENT}`,
          }}
        />
        IL DISPACCIO
      </div>
      {extra ? <span>{extra}</span> : null}
    </div>
  );
}

function gridPattern() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        backgroundImage: `
          linear-gradient(${ACCENT}08 1px, transparent 1px),
          linear-gradient(90deg, ${ACCENT}08 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        opacity: 0.6,
        pointerEvents: "none",
      }}
    />
  );
}

function frameShell(children: React.ReactNode) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background: BG_GRADIENT,
        backgroundColor: BG_BASE,
        fontFamily: "system-ui",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {gridPattern()}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${ACCENT} 0%, transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// QUOTE CARD (delibere / educational / libero)
// ═══════════════════════════════════════════════════════════════════

function QuoteCard({
  data,
  width,
}: {
  data: Record<string, unknown>;
  width: number;
}) {
  const kicker = String(data.kicker ?? data.footer ?? "DELIBERA · ANALISI");
  const numero = String(data.numero ?? "");
  const titolo = String(data.titolo ?? "Il settore che cambia.");
  const sottotitolo = String(data.sottotitolo ?? "");
  const scale = width > 1100 ? 1 : 0.7;

  return frameShell(
    <>
      {/* TOP: badge + numero grande */}
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {cornerBadge(kicker)}

        {numero && (
          <div
            style={{
              display: "flex",
              fontSize: 96 * scale,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: ACCENT,
              lineHeight: 1,
              fontFamily: "system-ui",
            }}
          >
            {numero}
          </div>
        )}
      </div>

      {/* MIDDLE: titolo HUGE */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div
          style={{
            width: 64,
            height: 4,
            background: ACCENT,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontSize: 92 * scale,
            fontWeight: 900,
            letterSpacing: "-0.035em",
            lineHeight: 1.02,
            color: TEXT,
            display: "flex",
            maxWidth: "92%",
          }}
        >
          {titolo}
        </div>
        {sottotitolo && (
          <div
            style={{
              fontSize: 28 * scale,
              color: DIM,
              lineHeight: 1.35,
              display: "flex",
              maxWidth: "88%",
              marginTop: 4,
            }}
          >
            {sottotitolo}
          </div>
        )}
      </div>

      {/* FOOTER */}
      {brandFooter("NETWORK RESELLER ENERGIA")}
    </>,
  );
}

// ═══════════════════════════════════════════════════════════════════
// DATA CARD (market / PUN / PSV / TTF)
// ═══════════════════════════════════════════════════════════════════

function DataCard({
  data,
  width,
}: {
  data: Record<string, unknown>;
  width: number;
}) {
  const kicker = String(data.kicker ?? data.label ?? "MERCATO · PUN");
  const label = String(data.label ?? "PUN");
  const valore = String(data.valore_grande ?? data.valore ?? "—");
  const unita = String(data.unita ?? "€/MWh");
  const variazione = String(data.variazione ?? "");
  const sottotitolo = String(data.sottotitolo ?? data.periodo ?? "");
  const isPositive = variazione.trim().startsWith("+");
  const isNegative = variazione.trim().startsWith("-");
  const deltaColor = isPositive
    ? DANGER // prezzo sale → rosso per reseller
    : isNegative
      ? ACCENT
      : MUTE;
  const arrow = isPositive ? "▲" : isNegative ? "▼" : "—";
  const scale = width > 1100 ? 1 : 0.7;

  return frameShell(
    <>
      {/* TOP */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {cornerBadge(kicker)}
      </div>

      {/* CENTER: valore HUGE + variazione */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 16,
        }}
      >
        <div
          style={{
            fontSize: 36 * scale,
            color: MUTE,
            fontFamily: "system-ui",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: 200 * scale,
              fontWeight: 900,
              letterSpacing: "-0.045em",
              lineHeight: 0.9,
              color: TEXT,
              display: "flex",
            }}
          >
            {valore}
          </div>
          <div
            style={{
              fontSize: 48 * scale,
              color: DIM,
              fontWeight: 600,
              display: "flex",
            }}
          >
            {unita}
          </div>
        </div>

        {variazione && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "10px 22px",
              borderRadius: 999,
              background: `${deltaColor}18`,
              border: `1px solid ${deltaColor}66`,
              marginTop: 8,
            }}
          >
            <div style={{ fontSize: 32 * scale, color: deltaColor }}>{arrow}</div>
            <div
              style={{
                fontSize: 42 * scale,
                fontWeight: 800,
                color: deltaColor,
                letterSpacing: "-0.01em",
              }}
            >
              {variazione}
            </div>
          </div>
        )}

        {sottotitolo && (
          <div
            style={{
              fontSize: 26 * scale,
              color: DIM,
              lineHeight: 1.4,
              display: "flex",
              maxWidth: "88%",
              marginTop: 8,
            }}
          >
            {sottotitolo}
          </div>
        )}
      </div>

      {brandFooter("MERCATO ENERGIA · LIVE")}
    </>,
  );
}

// ═══════════════════════════════════════════════════════════════════
// SCADENZA CARD
// ═══════════════════════════════════════════════════════════════════

function ScadenzaCard({
  data,
  width,
}: {
  data: Record<string, unknown>;
  width: number;
}) {
  const kicker = String(data.kicker ?? "SCADENZA · ARERA");
  const data_label = String(data.data ?? data.data_scadenza ?? "—");
  const dataParts = data_label.split(/[\s\/\-]/).filter(Boolean);
  const mainDate = dataParts[0] ?? data_label;
  const restDate = dataParts.slice(1).join(" ");
  const titolo = String(data.titolo ?? data.label ?? "Scadenza regolatoria");
  const sottotitolo = String(data.sottotitolo ?? "");
  const daysLeft = String(data.giorni_mancanti ?? "");
  const scale = width > 1100 ? 1 : 0.7;

  return frameShell(
    <>
      {/* TOP */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {cornerBadge(kicker, "warn")}
      </div>

      {/* CENTER: data HUGE + countdown + titolo */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 22,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: 220 * scale,
              fontWeight: 900,
              letterSpacing: "-0.06em",
              lineHeight: 0.85,
              color: WARN,
              display: "flex",
            }}
          >
            {mainDate}
          </div>
          {restDate && (
            <div
              style={{
                fontSize: 56 * scale,
                fontWeight: 700,
                color: TEXT,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              {restDate}
            </div>
          )}
        </div>

        {daysLeft && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 22px",
              borderRadius: 999,
              background: `${WARN}18`,
              border: `1px solid ${WARN}66`,
              fontSize: 28 * scale,
              fontWeight: 800,
              color: WARN,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              alignSelf: "flex-start",
            }}
          >
            ⏳ Mancano {daysLeft} giorni
          </div>
        )}

        <div
          style={{
            width: 64,
            height: 4,
            background: WARN,
            borderRadius: 2,
            marginTop: 8,
          }}
        />

        <div
          style={{
            fontSize: 62 * scale,
            fontWeight: 800,
            lineHeight: 1.05,
            color: TEXT,
            letterSpacing: "-0.02em",
            display: "flex",
            maxWidth: "92%",
          }}
        >
          {titolo}
        </div>

        {sottotitolo && (
          <div
            style={{
              fontSize: 26 * scale,
              color: DIM,
              lineHeight: 1.4,
              display: "flex",
              maxWidth: "88%",
            }}
          >
            {sottotitolo}
          </div>
        )}
      </div>

      {brandFooter("REGOLAZIONE ARERA")}
    </>,
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROUTE HANDLER
// ═══════════════════════════════════════════════════════════════════

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminMember();
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const url = new URL(req.url);
  const format = (url.searchParams.get("format") ?? "square") as Format;
  const dims = DIMENSIONS[format] ?? DIMENSIONS.square;

  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from("social_posts")
    .select("image_template,image_data,image_url")
    .eq("id", id)
    .maybeSingle();
  if (error || !post) {
    return new Response("Post not found", { status: 404 });
  }

  // Se c'è una URL Fal generata, proxy a quella invece di fare Satori template.
  // Funziona anche con format diversi perché Fal restituisce immagini quadrate high-res
  // (il browser/consumer fa resize dove serve).
  if (post.image_url && typeof post.image_url === "string") {
    try {
      const upstream = await fetch(post.image_url, { cache: "no-store" });
      if (upstream.ok) {
        return new Response(upstream.body, {
          status: 200,
          headers: {
            "content-type":
              upstream.headers.get("content-type") ?? "image/png",
            "cache-control": "private, max-age=300",
          },
        });
      }
    } catch {
      // fallback silenzioso al template
    }
  }

  const template = (post.image_template as string | null) ?? "quote_card";
  const data = (post.image_data as Record<string, unknown>) ?? {};

  let element: React.ReactElement;
  switch (template) {
    case "data_card":
      element = <DataCard data={data} width={dims.width} />;
      break;
    case "scadenza_card":
      element = <ScadenzaCard data={data} width={dims.width} />;
      break;
    case "quote_card":
    default:
      element = <QuoteCard data={data} width={dims.width} />;
  }

  return new ImageResponse(element, {
    ...dims,
    headers: {
      "cache-control": "private, max-age=60",
    },
  });
}
