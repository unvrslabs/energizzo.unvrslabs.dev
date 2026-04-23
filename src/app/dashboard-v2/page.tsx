import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  Mic,
  Send,
  Target,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAdminMember } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

const MONTHS_IT = [
  "gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic",
];

function fmtRelative(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "adesso";
  if (m < 60) return `${m} min fa`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h fa`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}g fa`;
  const dt = new Date(iso);
  return `${dt.getDate()} ${MONTHS_IT[dt.getMonth()]}`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buongiorno";
  if (h < 18) return "Buon pomeriggio";
  return "Buonasera";
}

export default async function DashboardV2Home() {
  const admin = await getAdminMember();
  const supabase = await createClient();

  const [
    leadsTotal,
    membersActive,
    requestsPending,
    invitedNotCompleted,
    leads7d,
    recentRequestsRes,
    recentLeadsRes,
    categoriaDistribution,
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase
      .from("network_members")
      .select("*", { count: "exact", head: true })
      .is("revoked_at", null),
    supabase
      .from("network_join_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .not("survey_sent_at", "is", null)
      .neq("survey_status", "completed"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
    supabase
      .from("network_join_requests")
      .select("id, ragione_sociale, referente, created_at, status, whatsapp")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("leads")
      .select("id, ragione_sociale, categoria, network_status, updated_at, macroarea")
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase.from("leads").select("categoria"),
  ]);

  const totalLeads = leadsTotal.count ?? 0;
  const activeMembers = membersActive.count ?? 0;
  const pendingRequests = requestsPending.count ?? 0;
  const invitedOpen = invitedNotCompleted.count ?? 0;
  const newLast7d = leads7d.count ?? 0;

  const recentRequests = recentRequestsRes.data ?? [];
  const recentLeads = recentLeadsRes.data ?? [];

  const catCounts = (categoriaDistribution.data ?? []).reduce<Record<string, number>>(
    (acc, row) => {
      const k = row.categoria ?? "N/D";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    },
    {},
  );
  const catRows = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const catMax = Math.max(...catRows.map(([, v]) => v), 1);

  const firstName = (admin?.nome ?? "").split(" ")[0] || "admin";

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <header className="flex items-end justify-between gap-4 flex-wrap pb-1">
        <div>
          <p className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Admin · {new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1" style={{ color: "hsl(var(--v2-text))" }}>
            {greeting()}, {firstName}.
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
            {pendingRequests > 0
              ? `${pendingRequests} richieste network da valutare · ${newLast7d} nuovi lead ultimi 7 giorni`
              : `${newLast7d} nuovi lead ultimi 7 giorni · tutte le richieste processate`}
          </p>
        </div>
        <Link href="/dashboard-v2/network" className="v2-btn v2-btn--primary">
          Apri Network
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* KPI row */}
      <section>
        <div className="v2-ticker-row">
          <KpiCell code="LEADS" label="Reseller in pipeline" value={totalLeads.toString()} delta={`+${newLast7d}`} trend={newLast7d > 0 ? "up" : "flat"} />
          <KpiCell code="MEMBERS" label="Network attivi" value={activeMembers.toString()} delta="live" trend="flat" />
          <KpiCell code="PENDING" label="Richieste da valutare" value={pendingRequests.toString()} delta={pendingRequests > 0 ? "!" : "—"} trend={pendingRequests > 0 ? "down" : "flat"} />
        </div>
      </section>

      {/* Bento */}
      <section className="v2-bento">
        {/* Pipeline funnel */}
        <div className="v2-card v2-col-4">
          <div className="v2-card-head flex items-center gap-2">
            <Target className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} />
            <span className="v2-card-title">Funnel network</span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <FunnelStage label="Lead totali" value={totalLeads} max={totalLeads || 1} />
            <FunnelStage label="Invitati" value={invitedOpen + activeMembers} max={totalLeads || 1} color="info" />
            <FunnelStage label="Survey completate → membri" value={activeMembers} max={totalLeads || 1} color="accent" />
            <FunnelStage label="Richieste da form" value={pendingRequests} max={totalLeads || 1} color="warn" />
          </div>
        </div>

        {/* Recent requests */}
        <div className="v2-card v2-col-8">
          <div className="v2-card-head flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-warn))" }} />
              <span className="v2-card-title">Richieste network recenti</span>
            </div>
            <Link href="/dashboard/network/richieste" className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em] hover:text-white transition-colors" style={{ color: "hsl(var(--v2-text-mute))" }}>
              Tutte →
            </Link>
          </div>
          {recentRequests.length === 0 ? (
            <div className="p-10 text-center text-sm" style={{ color: "hsl(var(--v2-text-mute))" }}>
              Nessuna richiesta recente.
            </div>
          ) : (
            <ul>
              {recentRequests.map((r) => (
                <li
                  key={r.id}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-4 md:px-5 py-3"
                  style={{ borderTop: "1px solid hsl(var(--v2-border))" }}
                >
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-medium truncate" style={{ color: "hsl(var(--v2-text))" }}>
                      {r.ragione_sociale ?? "—"}
                    </div>
                    <div className="text-[11.5px] mt-0.5 truncate" style={{ color: "hsl(var(--v2-text-mute))" }}>
                      {r.referente ?? "—"} {r.whatsapp ? `· ${r.whatsapp}` : ""}
                    </div>
                  </div>
                  <StatusPill status={r.status} />
                  <span className="v2-mono text-[11px] hidden md:inline" style={{ color: "hsl(var(--v2-text-mute))" }}>
                    {fmtRelative(r.created_at)}
                  </span>
                  <Link
                    href={`/dashboard/network/richieste`}
                    className="v2-btn v2-btn--ghost"
                    style={{ padding: "6px 8px" }}
                    aria-label="Apri"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Category distribution */}
        <div className="v2-card v2-col-6">
          <div className="v2-card-head flex items-center gap-2">
            <Users className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-info))" }} />
            <span className="v2-card-title">Distribuzione per categoria</span>
          </div>
          <div className="p-4 flex flex-col gap-2.5">
            {catRows.map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="v2-mono text-[11px] w-48 truncate" style={{ color: "hsl(var(--v2-text-dim))" }}>
                  {cat.replace(/_/g, " ")}
                </span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--v2-border))" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(count / catMax) * 100}%`,
                      background: "linear-gradient(90deg, hsl(var(--v2-accent)), hsl(158 60% 36%))",
                    }}
                  />
                </div>
                <span className="v2-mono text-[11.5px] font-bold w-10 text-right" style={{ color: "hsl(var(--v2-text))" }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent leads */}
        <div className="v2-card v2-col-6">
          <div className="v2-card-head flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} />
              <span className="v2-card-title">Ultimi lead aggiornati</span>
            </div>
            <Link href="/dashboard-v2/lead" className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em] hover:text-white transition-colors" style={{ color: "hsl(var(--v2-text-mute))" }}>
              Tutti →
            </Link>
          </div>
          <ul>
            {recentLeads.map((l) => (
              <li
                key={l.id}
                className="grid grid-cols-[1fr_auto_auto] gap-3 items-center px-4 py-2.5"
                style={{ borderTop: "1px solid hsl(var(--v2-border))" }}
              >
                <span className="text-[12.5px] font-medium truncate" style={{ color: "hsl(var(--v2-text))" }}>
                  {l.ragione_sociale ?? "—"}
                </span>
                <span className="v2-mono text-[10px] px-1.5 py-0.5 rounded hidden md:inline" style={{
                  color: "hsl(var(--v2-text-dim))",
                  background: "hsl(var(--v2-bg-elev))",
                }}>
                  {l.categoria ?? "—"}
                </span>
                <span className="v2-mono text-[10.5px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
                  {fmtRelative(l.updated_at)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick actions */}
        <div className="v2-card v2-col-12">
          <div className="v2-card-head flex items-center gap-2">
            <Send className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-text-dim))" }} />
            <span className="v2-card-title">Azioni rapide</span>
          </div>
          <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            <QuickAction href="/dashboard/network/richieste" icon={<UserPlus className="w-4 h-4" />} label="Valuta richieste" value={`${pendingRequests} pending`} />
            <QuickAction href="/dashboard" icon={<Users className="w-4 h-4" />} label="Kanban lead" value={`${totalLeads} in pipeline`} />
            <QuickAction href="/dashboard/podcast/episodi" icon={<Mic className="w-4 h-4" />} label="Podcast" value="Episodi + ospiti" />
            <QuickAction href="/dashboard/strategia" icon={<Target className="w-4 h-4" />} label="Strategia" value="Obiettivi + tattiche" />
          </div>
        </div>
      </section>
    </div>
  );
}

function KpiCell({
  code,
  label,
  value,
  delta,
  trend,
}: {
  code: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
}) {
  return (
    <div className="v2-ticker-cell">
      <div className="v2-ticker-head">
        <span className="v2-ticker-code">{code}</span>
        <span className={`v2-delta v2-delta--${trend}`}>{delta}</span>
      </div>
      <div>
        <span className="v2-ticker-value">{value}</span>
      </div>
      <span className="v2-ticker-label">{label}</span>
    </div>
  );
}

function FunnelStage({
  label,
  value,
  max,
  color = "default",
}: {
  label: string;
  value: number;
  max: number;
  color?: "default" | "accent" | "info" | "warn";
}) {
  const pct = Math.min(100, (value / max) * 100);
  const bg = {
    default: "hsl(var(--v2-text-dim))",
    accent: "hsl(var(--v2-accent))",
    info: "hsl(var(--v2-info))",
    warn: "hsl(var(--v2-warn))",
  }[color];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px]" style={{ color: "hsl(var(--v2-text-dim))" }}>
          {label}
        </span>
        <span className="v2-mono text-[12px] font-bold" style={{ color: "hsl(var(--v2-text))" }}>
          {value}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--v2-border))" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: bg }} />
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string | null }) {
  const cfg: Record<string, { bg: string; fg: string; label: string; icon: React.ReactNode }> = {
    pending: {
      bg: "hsl(var(--v2-warn) / 0.12)",
      fg: "hsl(var(--v2-warn))",
      label: "Pending",
      icon: <Clock className="w-3 h-3" />,
    },
    approved: {
      bg: "hsl(var(--v2-accent) / 0.12)",
      fg: "hsl(var(--v2-accent))",
      label: "Approvato",
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    rejected: {
      bg: "hsl(var(--v2-danger) / 0.12)",
      fg: "hsl(var(--v2-danger))",
      label: "Rifiutato",
      icon: <Mail className="w-3 h-3" />,
    },
  };
  const c = cfg[status ?? ""] ?? {
    bg: "hsl(var(--v2-border))",
    fg: "hsl(var(--v2-text-dim))",
    label: status ?? "—",
    icon: <FileText className="w-3 h-3" />,
  };
  return (
    <span
      className="v2-mono inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded"
      style={{ background: c.bg, color: c.fg }}
    >
      {c.icon}
      {c.label}
    </span>
  );
}

function QuickAction({ href, icon, label, value }: { href: string; icon: React.ReactNode; label: string; value: string }) {
  return (
    <Link
      href={href}
      className="v2-card v2-card--interactive p-4 flex items-center gap-3"
    >
      <span
        className="w-9 h-9 rounded-lg grid place-items-center"
        style={{
          background: "hsl(var(--v2-bg-elev))",
          border: "1px solid hsl(var(--v2-border))",
          color: "hsl(var(--v2-text-dim))",
        }}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-semibold" style={{ color: "hsl(var(--v2-text))" }}>
          {label}
        </div>
        <div className="text-[11px] truncate" style={{ color: "hsl(var(--v2-text-mute))" }}>
          {value}
        </div>
      </div>
      <ArrowUpRight className="w-4 h-4" style={{ color: "hsl(var(--v2-text-mute))" }} />
    </Link>
  );
}
