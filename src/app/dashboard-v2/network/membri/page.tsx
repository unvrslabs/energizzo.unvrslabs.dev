import Link from "next/link";
import { Building2, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MemberActionsV2 } from "@/components/admin-v2/member-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Membri · Admin v2" };

const MONTHS_IT = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()]} ${d.getFullYear()}`;
}

function onlyDigits(s: string | null): string {
  return (s ?? "").replace(/\D/g, "");
}

export default async function MembriPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("network_members")
    .select("id, phone, ragione_sociale, piva, referente, approved_at, last_login_at, revoked_at")
    .order("created_at", { ascending: false });

  const rows = data ?? [];

  // Recupero lead_id per ciascun membro tramite piva → per aprire la pagina profilo lead
  const pivas = rows.map((r) => r.piva).filter(Boolean) as string[];
  const leadIdByPiva = new Map<string, string>();
  if (pivas.length) {
    const { data: leads } = await supabase.from("leads").select("id, piva").in("piva", pivas);
    for (const l of (leads ?? []) as { id: string; piva: string }[]) {
      leadIdByPiva.set(l.piva, l.id);
    }
  }

  const GRID = "minmax(260px, 1.6fr) minmax(140px, 1fr) 170px 120px 130px 100px 120px";

  return (
    <div className="v2-card overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth: "1140px" }}>
          <div
            className="grid gap-3 px-4 py-3 v2-mono text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{
              gridTemplateColumns: GRID,
              color: "hsl(var(--v2-text-mute))",
              borderBottom: "1px solid hsl(var(--v2-border))",
            }}
          >
            <span>Azienda</span>
            <span>Referente</span>
            <span>WhatsApp</span>
            <span>Ammesso</span>
            <span>Ultimo accesso</span>
            <span>Stato</span>
            <span className="text-right">Azioni</span>
          </div>

          <ul>
            {rows.length === 0 ? (
              <li className="p-10 text-center text-sm" style={{ color: "hsl(var(--v2-text-mute))" }}>
                Nessun membro nel network.
              </li>
            ) : (
              rows.map((m) => {
                const revoked = !!m.revoked_at;
                const leadId = m.piva ? leadIdByPiva.get(m.piva) : null;
                const profileHref = leadId
                  ? `/dashboard-v2/lead/${leadId}`
                  : `/dashboard-v2/network/membri/${m.id}`;
                return (
                  <li
                    key={m.id}
                    className="grid gap-3 px-4 py-3 items-center"
                    style={{
                      gridTemplateColumns: GRID,
                      borderBottom: "1px solid hsl(var(--v2-border))",
                      opacity: revoked ? 0.5 : 1,
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="w-4 h-4 shrink-0" style={{ color: "hsl(var(--v2-text-mute))" }} />
                      <div className="min-w-0">
                        <Link
                          href={profileHref}
                          className="text-[13px] font-medium truncate block hover:underline"
                          style={{ color: "hsl(var(--v2-text))" }}
                        >
                          {m.ragione_sociale ?? "—"}
                        </Link>
                        <div className="v2-mono text-[10.5px] truncate" style={{ color: "hsl(var(--v2-text-mute))" }}>
                          {m.piva ?? "—"}
                        </div>
                      </div>
                    </div>

                    <span className="text-[12.5px] truncate" style={{ color: "hsl(var(--v2-text-dim))" }}>
                      {m.referente ?? "—"}
                    </span>

                    <Link
                      href={`https://wa.me/${onlyDigits(m.phone)}`}
                      target="_blank"
                      className="v2-mono text-[11.5px] inline-flex items-center gap-1 hover:underline"
                      style={{ color: "hsl(var(--v2-accent))" }}
                    >
                      <MessageCircle className="w-3 h-3" />
                      {m.phone}
                    </Link>

                    <span className="v2-mono text-[11px]" style={{ color: "hsl(var(--v2-text-dim))" }}>
                      {fmtDate(m.approved_at)}
                    </span>

                    <span className="v2-mono text-[11px]" style={{ color: "hsl(var(--v2-text-dim))" }}>
                      {m.last_login_at ? fmtDate(m.last_login_at) : "mai"}
                    </span>

                    <span
                      className="v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded w-fit"
                      style={{
                        background: revoked ? "hsl(var(--v2-danger) / 0.14)" : "hsl(var(--v2-accent) / 0.14)",
                        color: revoked ? "hsl(var(--v2-danger))" : "hsl(var(--v2-accent))",
                      }}
                    >
                      {revoked ? "Revocato" : "Attivo"}
                    </span>

                    <div className="flex justify-end">
                      <MemberActionsV2 id={m.id} revoked={revoked} />
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
