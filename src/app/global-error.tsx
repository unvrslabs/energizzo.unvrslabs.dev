"use client";

/**
 * Global error boundary: cattura errori che bucano il root layout (es. errori
 * di hydration, errori durante client-side navigation, route segment crash
 * non catturati da error.tsx più granulari).
 *
 * Sostituisce il <html><body> di default — quindi serve include espliciti.
 * Stile minimale dark allineato ai tokens v2 (no Tailwind import qui perché
 * questa pagina viene servita anche se la build CSS è in errore).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="it">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "hsl(215 24% 8%)",
          color: "hsl(0 0% 96%)",
          fontFamily:
            "system-ui, -apple-system, 'Inter', sans-serif",
          fontFeatureSettings: "'cv11' 1, 'tnum' 1",
        }}
      >
        <div
          style={{
            maxWidth: 460,
            width: "100%",
            background: "hsl(215 17% 13%)",
            border: "1px solid hsl(215 14% 22%)",
            borderRadius: 14,
            padding: "28px 26px",
            boxShadow:
              "0 12px 40px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.04)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "hsl(358 75% 62%)",
              fontFamily:
                "ui-monospace, 'JetBrains Mono', monospace",
              marginBottom: 14,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                background: "hsl(358 75% 62%)",
                boxShadow: "0 0 8px hsl(358 75% 62% / 0.7)",
              }}
            />
            Errore applicazione
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: 8,
            }}
          >
            Qualcosa è andato storto.
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 13.5,
              color: "hsl(215 12% 62%)",
              lineHeight: 1.55,
              marginBottom: 20,
            }}
          >
            La pagina ha riscontrato un errore inatteso. Riprova oppure torna
            alla home. Se continua, ricarica con un hard refresh (Cmd+Shift+R).
          </p>
          {error.digest && (
            <div
              style={{
                fontFamily: "ui-monospace, 'JetBrains Mono', monospace",
                fontSize: 10.5,
                color: "hsl(215 10% 42%)",
                background: "hsl(215 24% 8%)",
                border: "1px solid hsl(215 14% 22%)",
                padding: "8px 10px",
                borderRadius: 7,
                marginBottom: 18,
                wordBreak: "break-all",
              }}
            >
              ref: {error.digest}
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "9px 16px",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 600,
                background: "hsl(158 72% 48% / 0.14)",
                border: "1px solid hsl(158 72% 48% / 0.5)",
                color: "hsl(158 72% 48%)",
                cursor: "pointer",
              }}
            >
              Riprova
            </button>
            <a
              href="/"
              style={{
                padding: "9px 16px",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 600,
                background: "hsl(215 17% 13%)",
                border: "1px solid hsl(215 14% 30%)",
                color: "hsl(0 0% 96%)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Torna alla home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
