"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { ClipboardList, Check, Clock, Send, Filter, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SURVEY_STATUS_CONFIG,
  SURVEY_QUESTION_LABELS,
  SURVEY_QUESTION_ORDER,
  type SurveyStatus,
} from "@/lib/survey-questions";
import type { Lead, SurveyResponse } from "@/lib/types";

type Row = {
  lead: Lead;
  response: SurveyResponse | null;
};

type Props = { rows: Row[] };

const FILTERS: { v: SurveyStatus | "all"; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { v: "all", label: "Tutti", icon: Filter },
  { v: "sent", label: "Inviata", icon: Send },
  { v: "partial", label: "In corso", icon: Clock },
  { v: "completed", label: "Compilata", icon: Check },
];

export function ReportDashboard({ rows }: Props) {
  const [filter, setFilter] = useState<SurveyStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c = { all: rows.length, sent: 0, partial: 0, completed: 0 };
    for (const r of rows) {
      if (r.lead.survey_status === "sent") c.sent++;
      else if (r.lead.survey_status === "partial") c.partial++;
      else if (r.lead.survey_status === "completed") c.completed++;
    }
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && r.lead.survey_status !== filter) return false;
      if (!q) return true;
      return (
        r.lead.ragione_sociale.toLowerCase().includes(q) ||
        r.lead.piva.includes(q)
      );
    });
  }, [rows, filter, query]);

  const completionRate = rows.length > 0 ? (counts.completed / rows.length) * 100 : 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl tracking-wide flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" /> Report 2026
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Lead a cui è stato inviato il link del report. Chi ha risposto, quante domande ha
          completato, e risposte dettagliate.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Inviati"
          value={rows.length}
          icon={Send}
          accent="from-sky-400/30 to-sky-400/0"
        />
        <StatCard
          label="In corso"
          value={counts.partial}
          icon={Clock}
          accent="from-amber-400/30 to-amber-400/0"
        />
        <StatCard
          label="Compilati"
          value={counts.completed}
          icon={Check}
          accent="from-emerald-400/30 to-emerald-400/0"
        />
        <StatCard
          label="Tasso risposta"
          value={`${completionRate.toFixed(0)}%`}
          icon={ClipboardList}
          accent="from-primary/30 to-primary/0"
        />
      </div>

      <div className="liquid-glass rounded-2xl p-3 flex items-center gap-3 flex-wrap">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca ragione sociale o P.IVA..."
          className="flex-1 min-w-[200px] bg-transparent outline-none text-sm px-3"
        />
        <div className="flex rounded-full border border-white/10 p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-semibold",
                filter === f.v
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <f.icon className="h-3.5 w-3.5" /> {f.label}
              <span className="text-[10px] opacity-70">
                {f.v === "all" ? counts.all : counts[f.v as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="liquid-glass rounded-2xl py-14 text-center text-muted-foreground text-sm">
          Nessun lead nel filtro corrente.
        </div>
      ) : (
        <div className="liquid-glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[24px_1.8fr_140px_160px_140px_40px] items-center bg-[hsl(215_35%_14%)] border-b border-primary/25 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
            <div />
            <div className="px-4 py-3">Lead</div>
            <div className="px-4 py-3">Stato</div>
            <div className="px-4 py-3">Inviato</div>
            <div className="px-4 py-3">Completato</div>
            <div />
          </div>
          {filtered.map((row) => {
            const expanded = expandedId === row.lead.id;
            const stCfg = SURVEY_STATUS_CONFIG[row.lead.survey_status];
            const answered = row.response
              ? Object.keys(row.response.answers).filter(
                  (k) => row.response!.answers[k] !== null && row.response!.answers[k] !== "",
                ).length
              : 0;
            return (
              <div key={row.lead.id} className="border-b border-white/5">
                <button
                  onClick={() => setExpandedId(expanded ? null : row.lead.id)}
                  className="w-full grid grid-cols-[24px_1.8fr_140px_160px_140px_40px] items-center text-left text-sm hover:bg-primary/5"
                >
                  <div className="px-3 py-3 text-muted-foreground">
                    {expanded ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="px-4 py-3 min-w-0">
                    <div className="font-semibold truncate">{row.lead.ragione_sociale}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      {row.lead.piva}
                      {row.lead.provincia && <> · {row.lead.provincia}</>}
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                        stCfg.color,
                      )}
                    >
                      {stCfg.label}
                    </span>
                    {row.response && (
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {answered}/{SURVEY_QUESTION_ORDER.length} risposte
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3 text-xs text-muted-foreground">
                    {row.lead.survey_sent_at
                      ? formatDistanceToNow(new Date(row.lead.survey_sent_at), {
                          locale: it,
                          addSuffix: true,
                        })
                      : "—"}
                  </div>
                  <div className="px-4 py-3 text-xs">
                    {row.lead.survey_completed_at ? (
                      <span className="text-emerald-300">
                        {formatDistanceToNow(new Date(row.lead.survey_completed_at), {
                          locale: it,
                          addSuffix: true,
                        })}
                      </span>
                    ) : row.lead.survey_last_step_at ? (
                      <span className="text-amber-300">
                        attivo{" "}
                        {formatDistanceToNow(new Date(row.lead.survey_last_step_at), {
                          locale: it,
                          addSuffix: true,
                        })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                  <Link
                    href={`/dashboard/leads/${row.lead.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-3 text-xs text-primary hover:underline"
                    title="Apri scheda lead"
                  >
                    →
                  </Link>
                </button>

                {expanded && row.response && (
                  <ReportAnswers response={row.response} />
                )}
                {expanded && !row.response && (
                  <div className="px-4 py-5 bg-background/40 text-sm text-muted-foreground italic">
                    Nessuna risposta ancora. Il lead non ha ancora cliccato il link o non ha
                    compilato alcuna domanda.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="liquid-glass rounded-[1.5rem] p-4 relative overflow-hidden">
      <div
        className={`absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br ${accent} blur-2xl opacity-60`}
        aria-hidden
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
            {label}
          </p>
          <p className="mt-1 text-3xl font-black tabular-nums">{value}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 border border-white/10">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function ReportAnswers({ response }: { response: SurveyResponse }) {
  return (
    <div className="bg-background/40 px-4 py-4 space-y-2">
      {SURVEY_QUESTION_ORDER.map((qid) => {
        const v = response.answers[qid];
        if (v === undefined || v === null || v === "") return null;
        const label = SURVEY_QUESTION_LABELS[qid] ?? qid;
        return (
          <div key={qid} className="glass rounded-md p-3 text-sm">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <span className="font-mono text-primary">{qid}</span> · {label}
            </p>
            <div className="mt-1 text-sm">
              {Array.isArray(v) ? (
                <ul className="list-disc list-inside space-y-0.5">
                  {v.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="whitespace-pre-wrap break-words">{v}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
