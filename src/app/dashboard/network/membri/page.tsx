import Link from "next/link";
import { Building2, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MemberActionsV2 } from "@/components/admin-v2/member-actions";
import {
  MembriOverview,
  type MembriOverviewData,
  tierFromInviteNumber,
} from "@/components/admin-v2/network/membri-overview";

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

  // Aggregati per overview: pesca leads per match piva → invite_number + provincia
  const pivas = rows.map((r) => r.piva).filter(Boolean) as string[];
  const { data: leadRows } = pivas.length
    ? await supabase
        .from("leads")
        .select("piva, invite_number, provincia")
        .in("piva", pivas)
    : { data: [] };
  const leadByPiva = new Map<
    string,
    { invite_number: number | null; provincia: string | null }
  >();
  for (const l of (leadRows ?? []) as {
    piva: string;
    invite_number: number | null;
    provincia: string | null;
  }[]) {
    if (!leadByPiva.has(l.piva)) {
      leadByPiva.set(l.piva, {
        invite_number: l.invite_number,
        provincia: l.provincia,
      });
    }
  }

  const activeRows = rows.filter((r) => !r.revoked_at);

  // Tier counts
  const tierCounts = { founder: 0, pioneer: 0, early: 0, member: 0 };
  for (const m of activeRows) {
    const inv = leadByPiva.get(m.piva)?.invite_number ?? null;
    const tier = tierFromInviteNumber(inv);
    tierCounts[tier]++;
  }

  // Sparkline 14gg approved/giorno
  const buckets = new Map<string, number>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const m of activeRows) {
    if (!m.approved_at) continue;
    const day = new Date(m.approved_at).toISOString().slice(0, 10);
    if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
  }
  const approvedSpark14 = Array.from(buckets.values());

  // Approved this/prev month
  const now = new Date();
  const startOfThisMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).getTime();
  const startOfPrevMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1,
  ).getTime();
  let approvedThisMonth = 0;
  let approvedPrevMonth = 0;
  for (const m of activeRows) {
    if (!m.approved_at) continue;
    const t = new Date(m.approved_at).getTime();
    if (t >= startOfThisMonth) approvedThisMonth++;
    else if (t >= startOfPrevMonth) approvedPrevMonth++;
  }

  // Top province (top 6)
  const provinceCounts = new Map<string, number>();
  for (const m of activeRows) {
    const prov = leadByPiva.get(m.piva)?.provincia;
    if (!prov) continue;
    provinceCounts.set(prov, (provinceCounts.get(prov) ?? 0) + 1);
  }
  const topProvinces = Array.from(provinceCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  const overviewData: MembriOverviewData = {
    total: rows.length,
    active: activeRows.length,
    revoked: rows.length - activeRows.length,
    tierCounts,
    approvedSpark14,
    topProvinces,
    approvedThisMonth,
    approvedPrevMonth,
  };

  const GRID = "minmax(260px, 1.6fr) minmax(140px, 1fr) 170px 120px 130px 100px 120px";

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p
          className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "hsl(var(--v2-text-mute))" }}
        >
          Network · Reseller approvati
        </p>
        <h1
          className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1"
          style={{ color: "hsl(var(--v2-text))" }}
        >
          Membri
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "hsl(var(--v2-text-dim))" }}
        >
          {activeRows.length} attivi su {rows.length} totali · tier in base a
          invite_number progressivo
        </p>
      </header>

      <MembriOverview data={overviewData} />

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
                const profileHref = `/dashboard/network/membri/${m.id}`;
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
    </div>
  );
}
