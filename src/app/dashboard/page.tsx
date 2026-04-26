import Link from "next/link";
import {
  Activity,
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
import { KpiTile } from "@/components/admin-v2/viz/kpi-tile";
import { Donut } from "@/components/admin-v2/viz/donut";
import { HeatStrip } from "@/components/admin-v2/viz/heat-strip";
import { ProgressRing } from "@/components/admin-v2/viz/progress-ring";
import { CountUp } from "@/components/admin-v2/viz/count-up";

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

  const since30d = new Date(Date.now() - 30 * 86400000).toISOString();
  const since14d = new Date(Date.now() - 14 * 86400000).toISOString();

  const [
    leadsTotal,
    membersActive,
    requestsPending,
    invitedNotCompleted,
    leads7d,
    recentRequestsRes,
    recentLeadsRes,
    categoriaDistribution,
    leadsCreatedSeries,
    membersApprovedSeries,
    requestsCreatedSeries,
    pipelineDistribution,
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
      .select("id, ragione_sociale, categoria, updated_at, macroarea")
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase.from("leads").select("categoria"),
    supabase
      .from("leads")
      .select("created_at")
      .gte("created_at", since30d),
    supabase
      .from("network_members")
      .select("approved_at")
      .gte("approved_at", since30d)
      .is("revoked_at", null),
    supabase
      .from("network_join_requests")
      .select("created_at")
      .gte("created_at", since14d),
    supabase.from("leads").select("status"),
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

  // Serie temporali 30 giorni (lead/giorno + membri/giorno + heatstrip combined)
  const seriesByDay = (rows: { [k: string]: string | null }[], key: string) => {
    const buckets = new Map<string, number>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
    for (const r of rows) {
      const ts = r[key];
      if (!ts) continue;
      const day = new Date(ts).toISOString().slice(0, 10);
      if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
    }
    return Array.from(buckets.entries()).map(([date, value]) => ({ date, value }));
  };

  const leadsSeries30 = seriesByDay(
    (leadsCreatedSeries.data ?? []) as { created_at: string | null }[],
    "created_at",
  );
  const membersSeries30 = seriesByDay(
    (membersApprovedSeries.data ?? []) as { approved_at: string | null }[],
    "approved_at",
  );
  const requestsSeries14 = (requestsCreatedSeries.data ?? []).length;

  // Heat strip combinata: somma giornaliera di tutte le attività
  const activitySeries30 = leadsSeries30.map((d, i) => ({
    date: d.date,
    value: d.value + (membersSeries30[i]?.value ?? 0),
    label: `${new Date(d.date).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}: ${d.value} lead + ${membersSeries30[i]?.value ?? 0} membri`,
  }));

  // Last 14gg sparkline = ultimi 14 punti delle serie 30gg
  const leadsSpark = leadsSeries30.slice(-14).map((d) => d.value);
  const membersSpark = membersSeries30.slice(-14).map((d) => d.value);

  // Pipeline distribuzione su pipeline_status (top 6 stadi)
  const pipelineCounts = (pipelineDistribution.data ?? []).reduce<
    Record<string, number>
  >((acc, row) => {
    const k = (row.status as string) ?? "n/d";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  const pipelineSlices = Object.entries(pipelineCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label: label.replace(/_/g, " "), value }));

  // Conversion ratios per progress rings
  const totalLeadsForRatio = totalLeads || 1;
  const ratioInvited = ((invitedOpen + activeMembers) / totalLeadsForRatio) * 100;
  const ratioMembers = (activeMembers / totalLeadsForRatio) * 100;

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
        <Link href="/dashboard/network" className="v2-btn v2-btn--primary">
          Apri Network
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* KPI row */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14,
        }}
      >
        <KpiTile
          code="LEADS"
          label="Reseller in pipeline"
          value={totalLeads}
          delta={newLast7d > 0 ? `+${newLast7d} 7gg` : "—"}
          trend={newLast7d > 0 ? "up" : "flat"}
          spark={leadsSpark}
          variant="accent"
          icon={<Users className="w-3.5 h-3.5" />}
        />
        <KpiTile
          code="MEMBERS"
          label="Network attivi"
          value={activeMembers}
          delta="live"
          trend="flat"
          spark={membersSpark}
          variant="info"
          icon={<UserCheck className="w-3.5 h-3.5" />}
        />
        <KpiTile
          code="PENDING"
          label="Richieste da valutare"
          value={pendingRequests}
          delta={pendingRequests > 0 ? "azione" : "—"}
          trend={pendingRequests > 0 ? "down" : "flat"}
          variant={pendingRequests > 0 ? "warn" : "accent"}
          icon={<UserPlus className="w-3.5 h-3.5" />}
        />
        <KpiTile
          code="REQUESTS"
          label="Richieste form 14gg"
          value={requestsSeries14}
          variant="accent"
          icon={<Activity className="w-3.5 h-3.5" />}
        />
      </section>

      {/* Activity heatstrip 30gg */}
      <section className="v2-card" style={{ padding: "16px 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} />
            <span className="v2-card-title">Attività ultimi 30 giorni</span>
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
              value={activitySeries30.reduce((s, d) => s + d.value, 0)}
              suffix=" eventi"
            />
          </span>
        </div>
        <HeatStrip data={activitySeries30} variant="accent" cellSize={18} />
      </section>

      {/* Bento */}
      <section className="v2-bento">
        {/* Funnel velocità con ProgressRings */}
        <div className="v2-card v2-col-4">
          <div className="v2-card-head flex items-center gap-2">
            <Target className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} />
            <span className="v2-card-title">Conversion funnel</span>
          </div>
          <div
            style={{
              padding: "20px 16px",
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 14,
              justifyItems: "center",
            }}
          >
            <ProgressRing
              value={Math.round(ratioInvited)}
              total={100}
              size={90}
              variant="info"
              label="Invitati / lead"
            />
            <ProgressRing
              value={Math.round(ratioMembers)}
              total={100}
              size={90}
              variant="accent"
              label="Membri / lead"
            />
            <ProgressRing
              value={activeMembers}
              total={100}
              size={90}
              variant="accent"
              label="Membri / cap"
              showPercent={false}
            />
            <ProgressRing
              value={pendingRequests}
              total={Math.max(pendingRequests, 10)}
              size={90}
              variant={pendingRequests > 0 ? "warn" : "accent"}
              label="Pending"
              showPercent={false}
            />
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
        <div className="v2-card v2-col-3">
          <div className="v2-card-head flex items-center gap-2">
            <Users className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-info))" }} />
            <span className="v2-card-title">Lead per categoria</span>
          </div>
          <div className="p-4 flex flex-col gap-2.5">
            {catRows.map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="v2-mono text-[11px] flex-1 truncate" style={{ color: "hsl(var(--v2-text-dim))" }}>
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
                <span className="v2-mono text-[11.5px] font-bold w-8 text-right" style={{ color: "hsl(var(--v2-text))" }}>
                  <CountUp value={count} />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline donut */}
        <div className="v2-card v2-col-3">
          <div className="v2-card-head flex items-center gap-2">
            <Target className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} />
            <span className="v2-card-title">Pipeline status</span>
          </div>
          <div style={{ padding: 16 }}>
            <Donut
              slices={pipelineSlices}
              size={130}
              centerValue={pipelineSlices.reduce((s, x) => s + x.value, 0)}
              centerLabel="totale"
            />
          </div>
        </div>

        {/* Recent leads */}
        <div className="v2-card v2-col-6">
          <div className="v2-card-head flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} />
              <span className="v2-card-title">Ultimi lead aggiornati</span>
            </div>
            <Link href="/dashboard/lead" className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em] hover:text-white transition-colors" style={{ color: "hsl(var(--v2-text-mute))" }}>
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
