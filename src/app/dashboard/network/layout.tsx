import { createClient } from "@/lib/supabase/server";
import { NetworkV2Tabs } from "@/components/admin-v2/network-tabs";

export const dynamic = "force-dynamic";

export default async function NetworkV2Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const [pending, invited, inProgress, completed, members] = await Promise.all([
    supabase
      .from("network_join_requests")
      .select("*", { count: "exact", head: true })
      .or("status.eq.pending,status.is.null"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .not("survey_sent_at", "is", null)
      .neq("survey_status", "completed"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("survey_status", "partial"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("survey_status", "completed"),
    supabase
      .from("network_members")
      .select("*", { count: "exact", head: true })
      .is("revoked_at", null),
  ]);

  const pendingC = pending.count ?? 0;
  const invitedC = invited.count ?? 0;
  const inProgressC = inProgress.count ?? 0;
  const completedC = completed.count ?? 0;
  const membersC = members.count ?? 0;

  const totalInvited = invitedC + completedC;
  const responseRate = totalInvited > 0 ? Math.round((completedC / totalInvited) * 100) : 0;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
          CRM · Network reseller
        </p>
        <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1" style={{ color: "hsl(var(--v2-text))" }}>
          Gestione network
        </h1>
        <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
          {pendingC > 0 ? `${pendingC} richieste da valutare · ` : ""}
          {membersC} membri attivi · tasso risposta {responseRate}%
        </p>
      </header>

      {/* KPI ticker row */}
      <div className="v2-ticker-row">
        <KpiCell code="PENDING" label="Richieste da valutare" value={String(pendingC)} tint={pendingC > 0 ? "warn" : "accent"} />
        <KpiCell code="INVITED" label="Invitati totali" value={String(totalInvited)} tint="info" detail={`${inProgressC} in corso`} />
        <KpiCell code="MEMBERS" label="Membri attivi" value={String(membersC)} tint="accent" detail={`${responseRate}% conversion`} />
      </div>

      <NetworkV2Tabs counts={{ richieste: pendingC, invitati: invitedC, membri: membersC }} />

      {children}
    </div>
  );
}

function KpiCell({
  code,
  label,
  value,
  tint,
  detail,
}: {
  code: string;
  label: string;
  value: string;
  tint: "accent" | "warn" | "info" | "danger";
  detail?: string;
}) {
  const color =
    tint === "warn"
      ? "hsl(var(--v2-warn))"
      : tint === "info"
      ? "hsl(var(--v2-info))"
      : tint === "danger"
      ? "hsl(var(--v2-danger))"
      : "hsl(var(--v2-accent))";
  return (
    <div className="v2-ticker-cell">
      <div className="v2-ticker-head">
        <span className="v2-ticker-code">{code}</span>
        {detail && <span className="v2-mono text-[10.5px]" style={{ color }}>{detail}</span>}
      </div>
      <div>
        <span className="v2-ticker-value" style={{ color }}>{value}</span>
      </div>
      <span className="v2-ticker-label">{label}</span>
    </div>
  );
}
