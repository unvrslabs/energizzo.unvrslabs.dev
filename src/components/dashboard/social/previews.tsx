"use client";

export function LinkedInPreview({
  copy,
  hashtags,
  imageUrl,
}: {
  copy: string;
  hashtags: string[];
  imageUrl?: string | null;
}) {
  return (
    <div
      style={{
        border: "1px solid hsl(var(--v2-border))",
        borderRadius: 12,
        background: "hsl(var(--v2-card))",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          fontSize: 14,
          lineHeight: 1.5,
          color: "hsl(var(--v2-text))",
          whiteSpace: "pre-wrap",
        }}
      >
        {copy}
        {hashtags.length > 0 ? (
          <div style={{ marginTop: 12, color: "#0a66c2" }}>
            {hashtags.map((t) => `#${t.replace(/^#/, "")}`).join(" ")}
          </div>
        ) : null}
      </div>
      {imageUrl ? (
        <div
          style={{
            borderTop: "1px solid hsl(var(--v2-border))",
            background: "hsl(var(--v2-bg))",
          }}
        >
          <img
            src={imageUrl}
            alt="preview"
            style={{ width: "100%", display: "block" }}
          />
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: "10px 16px",
          borderTop: "1px solid hsl(var(--v2-border))",
          fontSize: 12,
          color: "hsl(var(--v2-text-mute))",
        }}
      >
        <span>👍 Mi piace</span>
        <span>💬 Commenta</span>
        <span>🔁 Condividi</span>
      </div>
    </div>
  );
}

export function XPreview({
  copy,
  hashtags,
  imageUrl,
}: {
  copy: string;
  hashtags: string[];
  imageUrl?: string | null;
}) {
  const threads = copy.split(/\n\n---\n\n/).map((t) => t.trim()).filter(Boolean);
  const isThread = threads.length > 1;

  return (
    <div
      style={{
        border: "1px solid hsl(var(--v2-border))",
        borderRadius: 12,
        background: "hsl(var(--v2-card))",
        overflow: "hidden",
      }}
    >
      {threads.map((tweet, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: 16,
            borderBottom:
              i < threads.length - 1 ? "1px solid hsl(var(--v2-border))" : "none",
          }}
        >
          {isThread && (
            <div
              className="v2-mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "hsl(var(--v2-accent))",
                fontWeight: 700,
              }}
            >
              {i + 1}/{threads.length}
            </div>
          )}
          <div
            style={{
              fontSize: 14,
              lineHeight: 1.45,
              color: "hsl(var(--v2-text))",
              whiteSpace: "pre-wrap",
            }}
          >
            {tweet}
          </div>
          {i === 0 && hashtags.length > 0 ? (
            <div style={{ color: "#1d9bf0", fontSize: 14 }}>
              {hashtags.map((t) => `#${t.replace(/^#/, "")}`).join(" ")}
            </div>
          ) : null}
          {i === 0 && imageUrl ? (
            <img
              src={imageUrl}
              alt="preview"
              style={{
                width: "100%",
                borderRadius: 10,
                marginTop: 6,
                border: "1px solid hsl(var(--v2-border))",
              }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
