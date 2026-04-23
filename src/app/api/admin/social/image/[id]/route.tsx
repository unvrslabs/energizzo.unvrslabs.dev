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

const BG_GRADIENT =
  "radial-gradient(ellipse at 20% 20%, #0e3d2d 0%, #061a17 55%, #020a0a 100%)";
const ACCENT = "#4fd1a1";
const TEXT = "#f4fcf8";
const MUTE = "#6b9b8a";
const DIM = "#9fc4b5";

function siteKicker(width: number) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: width > 1100 ? "14px" : "10px",
        fontSize: width > 1100 ? "18px" : "14px",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: ACCENT,
        fontWeight: 700,
      }}
    >
      <div
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: ACCENT,
          boxShadow: `0 0 16px ${ACCENT}`,
        }}
      />
      IL DISPACCIO
    </div>
  );
}

function footerMeta(text: string, width: number) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: width > 1100 ? "15px" : "12px",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: MUTE,
        fontWeight: 600,
      }}
    >
      <span>{text}</span>
      <span>ildispaccio.energy</span>
    </div>
  );
}

function QuoteCard({
  data,
  width,
  height,
}: {
  data: Record<string, unknown>;
  width: number;
  height: number;
}) {
  const titolo = String(data.titolo ?? "");
  const sottotitolo = String(data.sottotitolo ?? "");
  const numero = String(data.numero ?? data.numero_delibera ?? "");
  const footer = String(data.footer ?? numero ?? "Delibera · analisi AI");
  const bigFont = width > 1100 ? 56 : 36;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: width > 1100 ? "72px" : "48px",
        background: BG_GRADIENT,
        fontFamily: "system-ui",
      }}
    >
      {siteKicker(width)}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {numero ? (
          <div
            style={{
              fontSize: width > 1100 ? "20px" : "14px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: ACCENT,
              fontWeight: 600,
            }}
          >
            {numero}
          </div>
        ) : null}
        <div
          style={{
            fontSize: `${bigFont}px`,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.12,
            color: TEXT,
            display: "flex",
          }}
        >
          {titolo || "Analisi regolatoria"}
        </div>
        {sottotitolo ? (
          <div
            style={{
              fontSize: width > 1100 ? "26px" : "18px",
              color: DIM,
              lineHeight: 1.4,
              display: "flex",
              maxWidth: "90%",
            }}
          >
            {sottotitolo}
          </div>
        ) : null}
      </div>
      {footerMeta(footer, width)}
    </div>
  );
}

function DataCard({
  data,
  width,
  height,
}: {
  data: Record<string, unknown>;
  width: number;
  height: number;
}) {
  const label = String(data.label ?? data.titolo ?? "PUN");
  const valore = String(data.valore_grande ?? data.valore ?? "—");
  const variazione = String(data.variazione ?? "");
  const sottotitolo = String(data.sottotitolo ?? data.periodo ?? "");
  const footer = String(data.footer ?? "Mercato energia · settimana");
  const deltaPositive = variazione.trim().startsWith("+");
  const deltaColor = variazione
    ? deltaPositive
      ? "#ff7a7a"
      : "#4fd1a1"
    : MUTE;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: width > 1100 ? "72px" : "48px",
        background: BG_GRADIENT,
        fontFamily: "system-ui",
      }}
    >
      {siteKicker(width)}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            fontSize: width > 1100 ? "28px" : "20px",
            color: MUTE,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {label}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "32px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: width > 1100 ? "160px" : "110px",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: TEXT,
            }}
          >
            {valore}
          </div>
          {variazione ? (
            <div
              style={{
                fontSize: width > 1100 ? "52px" : "36px",
                fontWeight: 700,
                color: deltaColor,
                marginBottom: width > 1100 ? "16px" : "10px",
              }}
            >
              {variazione}
            </div>
          ) : null}
        </div>
        {sottotitolo ? (
          <div
            style={{
              fontSize: width > 1100 ? "24px" : "18px",
              color: DIM,
              lineHeight: 1.4,
            }}
          >
            {sottotitolo}
          </div>
        ) : null}
      </div>
      {footerMeta(footer, width)}
    </div>
  );
}

function ScadenzaCard({
  data,
  width,
  height,
}: {
  data: Record<string, unknown>;
  width: number;
  height: number;
}) {
  const data_label = String(data.data ?? data.data_scadenza ?? "—");
  const titolo = String(data.titolo ?? data.label ?? "Scadenza regolatoria");
  const sottotitolo = String(data.sottotitolo ?? "");
  const daysLeft = String(data.giorni_mancanti ?? "");
  const footer = String(data.footer ?? "Scadenza ARERA");

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: width > 1100 ? "72px" : "48px",
        background: BG_GRADIENT,
        fontFamily: "system-ui",
      }}
    >
      {siteKicker(width)}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            gap: "18px",
            alignItems: "center",
            fontSize: width > 1100 ? "24px" : "18px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#ff9f5a",
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#ff9f5a",
              boxShadow: "0 0 12px #ff9f5a",
            }}
          />
          SCADENZA · {data_label}
          {daysLeft ? <span style={{ color: DIM }}>· {daysLeft} giorni</span> : null}
        </div>
        <div
          style={{
            fontSize: width > 1100 ? "64px" : "42px",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            color: TEXT,
            display: "flex",
          }}
        >
          {titolo}
        </div>
        {sottotitolo ? (
          <div
            style={{
              fontSize: width > 1100 ? "24px" : "18px",
              color: DIM,
              lineHeight: 1.4,
              display: "flex",
            }}
          >
            {sottotitolo}
          </div>
        ) : null}
      </div>
      {footerMeta(footer, width)}
    </div>
  );
}

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
    .select("image_template,image_data")
    .eq("id", id)
    .maybeSingle();
  if (error || !post) {
    return new Response("Post not found", { status: 404 });
  }

  const template = (post.image_template as string | null) ?? "quote_card";
  const data = (post.image_data as Record<string, unknown>) ?? {};

  let element: JSX.Element;
  switch (template) {
    case "data_card":
      element = <DataCard data={data} width={dims.width} height={dims.height} />;
      break;
    case "scadenza_card":
      element = <ScadenzaCard data={data} width={dims.width} height={dims.height} />;
      break;
    case "quote_card":
    default:
      element = <QuoteCard data={data} width={dims.width} height={dims.height} />;
  }

  return new ImageResponse(element, {
    ...dims,
    headers: {
      "cache-control": "private, max-age=60",
    },
  });
}
