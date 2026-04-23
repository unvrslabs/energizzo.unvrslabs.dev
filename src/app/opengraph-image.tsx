import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Il Dispaccio — Il primo network dei reseller energia in Italia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(circle at 20% 20%, #0a3a2a 0%, #061a18 45%, #020a0a 100%)",
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "16px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#4fd1a1",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#4fd1a1",
              boxShadow: "0 0 16px #4fd1a1",
            }}
          />
          ildispaccio.energy
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: "#f4fcf8",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Il primo network</span>
            <span>
              dei <span style={{ color: "#4fd1a1" }}>reseller energia</span>
            </span>
            <span>in Italia.</span>
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#9fc4b5",
              maxWidth: "920px",
              lineHeight: 1.4,
            }}
          >
            Delibere ARERA decifrate, benchmark tariffario live, podcast
            editoriale e report indipendente annuale.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "14px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#6b9b8a",
            fontWeight: 600,
          }}
        >
          <span>Sponsor ufficiale · Energizzo</span>
          <span>100 posti · Anno I · €0</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
