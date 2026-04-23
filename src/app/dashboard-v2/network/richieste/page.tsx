import Link from "next/link";
import { Building2, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { RequestActionsV2 } from "@/components/admin-v2/request-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Richieste · Admin v2" };

const MONTHS_IT = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];

function fmtDateTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()]} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function onlyDigits(s: string | null): string {
  return (s ?? "").replace(/\D/g, "");
}

export default async function RichiestePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("network_join_requests")
    .select("id, ragione_sociale, piva, referente, whatsapp, note, source, status, created_at")
    .order("created_at", { ascending: false });

  const rows = data ?? [];

  return (
    <div className="v2-card overflow-hidden">
      {/* Header row */}
      <div
        className="grid gap-3 px-4 py-3 v2-mono text-[10px] font-bold uppercase tracking-[0.14em]"
        style={{
          gridTemplateColumns: "minmax(0, 1.6fr) 150px minmax(0, 1fr) 140px 130px 110px auto",
          color: "hsl(var(--v2-text-mute))",
          borderBottom: "1px solid hsl(var(--v2-border))",
        }}
      >
        <span>Azienda</span>
        <span>P.IVA</span>
        <span>Referente</span>
        <span>WhatsApp</span>
        <span>Ricevuta</span>
        <span>Origine</span>
        <span className="text-right">Azioni</span>
      </div>

      <ul>
        {rows.length === 0 ? (
          <li className="p-10 text-center text-sm" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Nessuna richiesta.
          </li>
        ) : (
          rows.map((r) => (
            <li
              key={r.id}
              className="grid gap-3 px-4 py-3 items-center"
              style={{
                gridTemplateColumns: "minmax(0, 1.6fr) 150px minmax(0, 1fr) 140px 130px 110px auto",
                borderBottom: "1px solid hsl(var(--v2-border))",
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="w-4 h-4 shrink-0" style={{ color: "hsl(var(--v2-text-mute))" }} />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate" style={{ color: "hsl(var(--v2-text))" }}>
                    {r.ragione_sociale ?? "—"}
                  </div>
                  {r.note && (
                    <div className="text-[11px] mt-0.5 line-clamp-1" style={{ color: "hsl(var(--v2-text-mute))" }}>
                      {r.note}
                    </div>
                  )}
                </div>
              </div>

              <span className="v2-mono text-[11px]" style={{ color: "hsl(var(--v2-text-dim))" }}>
                {r.piva ?? "—"}
              </span>

              <span className="text-[12.5px] truncate" style={{ color: "hsl(var(--v2-text-dim))" }}>
                {r.referente ?? "—"}
              </span>

              {r.whatsapp ? (
                <Link
                  href={`https://wa.me/${onlyDigits(r.whatsapp)}`}
                  target="_blank"
                  className="v2-mono text-[11.5px] inline-flex items-center gap-1 hover:underline"
                  style={{ color: "hsl(var(--v2-accent))" }}
                >
                  <MessageCircle className="w-3 h-3" />
                  {r.whatsapp}
                </Link>
              ) : (
                <span className="v2-mono text-[11px]" style={{ color: "hsl(var(--v2-text-mute))" }}>—</span>
              )}

              <span className="v2-mono text-[11px]" style={{ color: "hsl(var(--v2-text-dim))" }}>
                {fmtDateTime(r.created_at)}
              </span>

              <span
                className="v2-mono text-[10px] uppercase tracking-[0.1em] font-bold"
                style={{ color: "hsl(var(--v2-text-mute))" }}
              >
                {r.source ?? "—"}
              </span>

              <div className="flex justify-end">
                <RequestActionsV2 id={r.id} status={r.status} />
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
