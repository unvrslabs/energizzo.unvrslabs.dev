import {
  CheckCircle2,
  Clock,
  Inbox,
  Send,
  TrendingUp,
  Users2,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function NetworkOverviewPage() {
  const supabase = createAdminClient();

  const [
    { count: pendingRequests },
    { count: invitedTotal },
    { count: inProgress },
    { count: completed },
    { count: activeMembers },
  ] = await Promise.all([
    supabase
      .from("network_join_requests")
      .select("id", { count: "exact", head: true })
      .or("status.eq.pending,status.is.null"),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .not("survey_sent_at", "is", null),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("survey_status", "partial"),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("survey_status", "completed"),
    supabase
      .from("network_members")
      .select("id", { count: "exact", head: true })
      .is("revoked_at", null),
  ]);

  const invited = invitedTotal ?? 0;
  const done = completed ?? 0;
  const rate = invited > 0 ? Math.round((done / invited) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi
          icon={<Inbox className="h-4 w-4" />}
          label="Richieste pending"
          value={pendingRequests ?? 0}
          hint="Candidature dal form pubblico in attesa di approvazione."
        />
        <Kpi
          icon={<Send className="h-4 w-4" />}
          label="Invitati totali"
          value={invited}
          hint="Lead a cui hai inviato l'invito al network."
        />
        <Kpi
          icon={<Clock className="h-4 w-4" />}
          label="In corso"
          value={inProgress ?? 0}
          hint="Hanno aperto il questionario ma non l'hanno terminato."
        />
        <Kpi
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Completati"
          value={done}
          hint="Hanno finito il questionario e attivato l'accesso."
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.08] via-white/[0.02] to-transparent backdrop-blur-sm p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 border border-primary/40">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Tasso di risposta
                </p>
                <p className="text-2xl font-bold text-foreground">{rate}%</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {done} / {invited}
            </span>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all"
              style={{ width: `${Math.min(100, rate)}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            Invitati che hanno chiuso il questionario sul totale dei lead a cui
            hai mandato il link.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 border border-primary/40">
                <Users2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Membri network attivi
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {activeMembers ?? 0}
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              obiettivo 100
            </span>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all"
              style={{
                width: `${Math.min(100, Math.round(((activeMembers ?? 0) / 100) * 100))}%`,
              }}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            Reseller ammessi al network con accesso attivo alla piattaforma.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
          Funnel ingresso
        </p>
        <div className="flex items-center gap-3 text-sm">
          <FunnelStep
            label="Invitati"
            value={invited}
            color="from-sky-500/25 to-sky-500/5"
          />
          <span className="text-muted-foreground/40">→</span>
          <FunnelStep
            label="Aperti"
            value={(inProgress ?? 0) + done}
            color="from-amber-400/25 to-amber-400/5"
          />
          <span className="text-muted-foreground/40">→</span>
          <FunnelStep
            label="Completati"
            value={done}
            color="from-primary/30 to-primary/5"
          />
          <span className="text-muted-foreground/40">→</span>
          <FunnelStep
            label="Membri attivi"
            value={activeMembers ?? 0}
            color="from-emerald-500/30 to-emerald-500/5"
          />
        </div>
      </section>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-4">
      <div className="flex items-center gap-2 mb-2 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">
          {label}
        </span>
      </div>
      <p className="text-3xl font-bold text-foreground tabular-nums">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground/70 leading-relaxed">
        {hint}
      </p>
    </div>
  );
}

function FunnelStep({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className={`flex-1 rounded-xl border border-white/10 bg-gradient-to-br ${color} p-3 text-center`}
    >
      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
      <p className="text-xl font-bold text-foreground tabular-nums mt-0.5">
        {value}
      </p>
    </div>
  );
}
