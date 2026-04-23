import Link from "next/link";
import { ArrowUpRight, Filter, Search, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MONTHS_IT = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
}

const CATEGORIA_COLOR: Record<string, string> = {
  RESELLER_PURO: "hsl(158 64% 58%)",
  DISPACCIATORE_DUAL: "hsl(270 50% 68%)",
  DISPACCIATORE_ELE: "hsl(38 92% 65%)",
  DISPACCIATORE_GAS: "hsl(200 70% 65%)",
  SOLO_PRODUTTORE: "hsl(15 80% 62%)",
};

const NETWORK_COLOR: Record<string, { bg: string; fg: string; label: string }> = {
  member: { bg: "hsl(var(--v2-accent) / 0.14)", fg: "hsl(var(--v2-accent))", label: "Membro" },
  invited: { bg: "hsl(var(--v2-warn) / 0.14)", fg: "hsl(var(--v2-warn))", label: "Invitato" },
  none: { bg: "hsl(var(--v2-border))", fg: "hsl(var(--v2-text-mute))", label: "—" },
};

export default async function DashboardV2LeadPage() {
  const supabase = await createClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("id, ragione_sociale, referente, piva, telefono, whatsapp, email, categoria, macroarea, network_status, status, created_at, updated_at, documents_count")
    .order("updated_at", { ascending: false })
    .limit(80);

  const rows = leads ?? [];
  const total = rows.length;
  const byCategory = rows.reduce<Record<string, number>>((acc, l) => {
    const k = l.categoria ?? "N/D";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            CRM · Lead
          </p>
          <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1" style={{ color: "hsl(var(--v2-text))" }}>
            Pipeline reseller
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
            {total} record più recenti · ordinati per ultimo aggiornamento · filtra per categoria o stato network
          </p>
        </div>
        <Link href="/dashboard" className="v2-btn v2-btn--primary">
          Apri Kanban (versione attuale)
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Toolbar */}
      <div className="v2-card p-3 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "hsl(var(--v2-text-mute))" }} />
          <input type="text" placeholder="Cerca per ragione sociale, PIVA, email…" className="v2-input" />
        </div>

        <button type="button" className="v2-btn">
          <Filter className="w-3.5 h-3.5" />
          Filtri
        </button>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {Object.entries(byCategory).slice(0, 5).map(([cat, n]) => (
            <span
              key={cat}
              className="v2-mono text-[10.5px] font-semibold px-2 py-1 rounded inline-flex items-center gap-1.5"
              style={{
                background: "hsl(var(--v2-bg-elev))",
                border: "1px solid hsl(var(--v2-border))",
                color: "hsl(var(--v2-text-dim))",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: CATEGORIA_COLOR[cat] ?? "hsl(var(--v2-text-mute))" }}
              />
              {cat.replace(/_/g, " ")}
              <span className="opacity-60">{n}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="v2-card overflow-hidden">
        {/* Header row */}
        <div
          className="grid gap-3 px-4 py-3 v2-mono text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.2fr) 140px 110px 90px 90px 40px",
            color: "hsl(var(--v2-text-mute))",
            borderBottom: "1px solid hsl(var(--v2-border))",
          }}
        >
          <span>Azienda</span>
          <span className="hidden md:block">Referente / WhatsApp</span>
          <span>Categoria</span>
          <span>Network</span>
          <span className="hidden lg:block">Area</span>
          <span>Aggiornato</span>
          <span />
        </div>

        {/* Rows */}
        <ul>
          {rows.map((l) => {
            const net = NETWORK_COLOR[l.network_status ?? "none"] ?? NETWORK_COLOR.none;
            const catColor = l.categoria ? CATEGORIA_COLOR[l.categoria] ?? "hsl(var(--v2-text-dim))" : "hsl(var(--v2-text-mute))";
            return (
              <li
                key={l.id}
                className="grid gap-3 px-4 py-3 items-center cursor-pointer transition-colors hover:bg-white/[0.02]"
                style={{
                  gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.2fr) 140px 110px 90px 90px 40px",
                  borderBottom: "1px solid hsl(var(--v2-border))",
                }}
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate" style={{ color: "hsl(var(--v2-text))" }}>
                    {l.ragione_sociale ?? "—"}
                  </div>
                  <div className="v2-mono text-[10.5px] truncate" style={{ color: "hsl(var(--v2-text-mute))" }}>
                    {l.piva ?? "—"}
                  </div>
                </div>

                <div className="min-w-0 hidden md:block">
                  <div className="text-[12.5px] truncate" style={{ color: "hsl(var(--v2-text-dim))" }}>
                    {l.referente ?? "—"}
                  </div>
                  <div className="v2-mono text-[10.5px] truncate" style={{ color: "hsl(var(--v2-text-mute))" }}>
                    {l.whatsapp ?? l.telefono ?? "—"}
                  </div>
                </div>

                <span
                  className="v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded inline-flex items-center gap-1.5 w-fit"
                  style={{
                    background: "hsl(var(--v2-bg-elev))",
                    border: `1px solid ${catColor}44`,
                    color: catColor,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: catColor }} />
                  {(l.categoria ?? "—").replace(/_/g, " ").replace("DISPACCIATORE", "DISP.")}
                </span>

                <span
                  className="v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded w-fit"
                  style={{ background: net.bg, color: net.fg }}
                >
                  {net.label}
                </span>

                <span className="v2-mono text-[11px] hidden lg:inline truncate" style={{ color: "hsl(var(--v2-text-dim))" }}>
                  {l.macroarea ?? "—"}
                </span>

                <span className="v2-mono text-[10.5px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
                  {fmtDate(l.updated_at)}
                </span>

                <Link
                  href={`/dashboard/leads/${l.id}`}
                  className="v2-btn v2-btn--ghost"
                  style={{ padding: "6px 8px" }}
                  aria-label="Apri drawer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            );
          })}
        </ul>

        {rows.length === 0 && (
          <div className="p-10 flex flex-col items-center gap-3 text-center">
            <Users className="w-8 h-8 opacity-40" />
            <p className="text-sm" style={{ color: "hsl(var(--v2-text-mute))" }}>
              Nessun lead trovato.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
