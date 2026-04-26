"use client";

import { Activity, Bot, FileText, Send, Sparkles } from "lucide-react";
import { Donut, type DonutSlice } from "@/components/admin-v2/viz/donut";
import { HeatStrip } from "@/components/admin-v2/viz/heat-strip";
import { Sparkline } from "@/components/admin-v2/viz/sparkline";
import { CountUp } from "@/components/admin-v2/viz/count-up";

type SocialPostLite = {
  tipo: string;
  status: string;
  generated_by: string;
  created_at: string;
  scheduled_at: string | null;
  published_linkedin_at: string | null;
  published_x_at: string | null;
};

const TIPO_LABEL: Record<string, string> = {
  delibera: "Delibera",
  market: "Mercato",
  scadenza: "Scadenza",
  digest: "Digest",
  educational: "Educational",
  podcast: "Podcast",
  libero: "Libero",
};

const TIPO_COLOR: Record<string, string> = {
  delibera: "hsl(var(--v2-accent))",
  market: "hsl(var(--v2-info))",
  scadenza: "hsl(var(--v2-warn))",
  digest: "hsl(var(--v2-text-dim))",
  educational: "hsl(158 50% 45%)",
  podcast: "hsl(280 60% 55%)",
  libero: "hsl(var(--v2-danger))",
};

export function SocialOverview({ posts }: { posts: SocialPostLite[] }) {
  // KPI counts
  const draft = posts.filter((p) => p.status === "bozza").length;
  const approved = posts.filter(
    (p) => p.status === "approvato" || p.status === "schedulato",
  ).length;

  const cutoff30 = Date.now() - 30 * 86400000;
  const cutoff7 = Date.now() - 7 * 86400000;

  const published30 = posts.filter((p) => {
    const liT = p.published_linkedin_at
      ? new Date(p.published_linkedin_at).getTime()
      : 0;
    const xT = p.published_x_at
      ? new Date(p.published_x_at).getTime()
      : 0;
    const t = Math.max(liT, xT);
    return t > 0 && t >= cutoff30;
  }).length;

  const auto7 = posts.filter(
    (p) =>
      p.generated_by === "auto" &&
      new Date(p.created_at).getTime() >= cutoff7,
  ).length;

  // Sparkline 14gg created
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const createdBuckets = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    createdBuckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const p of posts) {
    const day = new Date(p.created_at).toISOString().slice(0, 10);
    if (createdBuckets.has(day))
      createdBuckets.set(day, (createdBuckets.get(day) ?? 0) + 1);
  }
  const createdSpark14 = Array.from(createdBuckets.values());

  // HeatStrip 30gg pubblicazioni
  const publishBuckets = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    publishBuckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const p of posts) {
    const dates = [p.published_linkedin_at, p.published_x_at].filter(
      Boolean,
    ) as string[];
    for (const ts of dates) {
      const day = new Date(ts).toISOString().slice(0, 10);
      if (publishBuckets.has(day))
        publishBuckets.set(day, (publishBuckets.get(day) ?? 0) + 1);
    }
  }
  const publishHeat = Array.from(publishBuckets.entries()).map(
    ([date, value]) => ({
      date,
      value,
      label: `${new Date(date).toLocaleDateString("it-IT", {
        day: "numeric",
        month: "short",
      })}: ${value} pubblicazioni`,
    }),
  );

  // Donut per tipo (solo post pubblicati o approvati)
  const tipoCounts = posts.reduce<Record<string, number>>((acc, p) => {
    if (p.status === "skip" || p.status === "bozza") return acc;
    acc[p.tipo] = (acc[p.tipo] ?? 0) + 1;
    return acc;
  }, {});
  const tipoSlices: DonutSlice[] = Object.entries(tipoCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({
      label: TIPO_LABEL[key] ?? key,
      value,
      color: TIPO_COLOR[key] ?? "hsl(var(--v2-text-dim))",
    }));

  return (
    <div className="v2-card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Header riga unica */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid hsl(var(--v2-border))",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div className="flex items-center gap-2">
          <Activity
            className="w-3.5 h-3.5"
            style={{ color: "hsl(var(--v2-accent))" }}
          />
          <span className="v2-card-title">Social pipeline</span>
        </div>
        {createdSpark14.some((v) => v > 0) && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              className="v2-mono"
              style={{
                fontSize: 9.5,
                color: "hsl(var(--v2-text-mute))",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Generati 14gg
            </span>
            <Sparkline
              data={createdSpark14}
              width={100}
              height={24}
              variant="accent"
            />
          </div>
        )}
      </div>

      {/* Body: 3 colonne — Stats | Donut tipo | Heat 30gg */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(200px, 240px) minmax(0, 1fr) minmax(0, 1.4fr)",
          gap: 1,
          background: "hsl(var(--v2-border))",
        }}
      >
        {/* Col 1: Quick stats */}
        <div
          style={{
            background: "hsl(var(--v2-card))",
            padding: "20px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            justifyContent: "center",
          }}
        >
          <QuickStat
            icon={<FileText className="w-4 h-4" />}
            label="Bozze da approvare"
            value={draft}
            tint="warn"
          />
          <QuickStat
            icon={<Sparkles className="w-4 h-4" />}
            label="Approvati / schedulati"
            value={approved}
            tint="info"
          />
          <QuickStat
            icon={<Send className="w-4 h-4" />}
            label="Pubblicati 30gg"
            value={published30}
            tint="accent"
          />
          <QuickStat
            icon={<Bot className="w-4 h-4" />}
            label="Auto-generati 7gg"
            value={auto7}
            tint="info"
          />
        </div>

        {/* Col 2: Donut tipo */}
        <div
          style={{
            background: "hsl(var(--v2-card))",
            padding: "20px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            className="v2-mono"
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "hsl(var(--v2-text-mute))",
            }}
          >
            Distribuzione per tipo
          </div>
          {tipoSlices.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "grid",
                placeItems: "center",
                color: "hsl(var(--v2-text-mute))",
                fontSize: 11.5,
                textAlign: "center",
              }}
            >
              Nessun post live
            </div>
          ) : (
            <Donut
              slices={tipoSlices}
              size={130}
              centerValue={tipoSlices.reduce((s, x) => s + x.value, 0)}
              centerLabel="post"
            />
          )}
        </div>

        {/* Col 3: Heat 30gg */}
        <div
          style={{
            background: "hsl(var(--v2-card))",
            padding: "20px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div
              className="v2-mono"
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "hsl(var(--v2-text-mute))",
              }}
            >
              Pubblicazioni 30gg
            </div>
            <span
              className="v2-mono"
              style={{
                fontSize: 10.5,
                color: "hsl(var(--v2-text-mute))",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              <CountUp
                value={publishHeat.reduce((s, d) => s + d.value, 0)}
                suffix=" eventi"
              />
            </span>
          </div>
          <HeatStrip data={publishHeat} variant="accent" cellSize={14} gap={3} />
        </div>
      </div>
    </div>
  );
}

function QuickStat({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tint: "accent" | "info" | "warn" | "danger";
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          display: "grid",
          placeItems: "center",
          background: `hsl(var(--v2-${tint}) / 0.14)`,
          color: `hsl(var(--v2-${tint}))`,
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="v2-mono"
          style={{
            fontSize: 9.5,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "hsl(var(--v2-text-mute))",
            marginBottom: 2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 22,
            fontWeight: 700,
            color: "hsl(var(--v2-text))",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          <CountUp value={value} />
        </div>
      </div>
    </div>
  );
}
