"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Archive,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  CircleDot,
  Loader2,
  Save,
} from "lucide-react";
import { updateTactic } from "@/actions/update-tactic";
import { TACTIC_STATUS_CONFIG, type Tactic, type TacticStatus } from "@/lib/strategy";
import { cn } from "@/lib/utils";

type Props = {
  tactic: Tactic;
  initialStatus: TacticStatus;
  initialNotes: string;
};

const STATUS_ICONS: Record<TacticStatus, React.ComponentType<{ className?: string }>> = {
  da_fare: CircleDashed,
  in_corso: CircleDot,
  fatto: CheckCircle2,
  archiviato: Archive,
};

const PRIORITY_COLOR: Record<string, string> = {
  P0: "hsl(358 75% 66%)",
  P1: "hsl(var(--v2-warn))",
  P2: "hsl(var(--v2-info))",
};

export function TacticCardV2({ tactic, initialStatus, initialNotes }: Props) {
  const [status, setStatus] = useState<TacticStatus>(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();

  function saveStatus(next: TacticStatus) {
    const previous = status;
    setStatus(next);
    startTransition(async () => {
      const res = await updateTactic({ id: tactic.id, status: next });
      if (!res.ok) {
        setStatus(previous);
        toast.error(`Errore: ${res.error}`);
      } else {
        toast.success(`Stato → ${TACTIC_STATUS_CONFIG[next].label}`);
      }
    });
  }

  function saveNotes() {
    startTransition(async () => {
      const res = await updateTactic({ id: tactic.id, notes });
      if (!res.ok) toast.error(`Errore: ${res.error}`);
      else toast.success("Note salvate");
    });
  }

  const statusCfg = TACTIC_STATUS_CONFIG[status];
  const priorityColor = PRIORITY_COLOR[tactic.priority] ?? "hsl(var(--v2-text-dim))";

  return (
    <div
      className="v2-card"
      style={{
        opacity: status === "fatto" ? 0.65 : status === "archiviato" ? 0.4 : 1,
        transition: "opacity 200ms ease",
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 rounded-xl transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl grid place-items-center text-2xl shrink-0"
            style={{
              background: "hsl(var(--v2-bg-elev))",
              border: "1px solid hsl(var(--v2-border))",
            }}
          >
            {tactic.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="v2-mono text-[11px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
                #{tactic.number}
              </span>
              <h3 className="text-[16px] font-semibold tracking-tight" style={{ color: "hsl(var(--v2-text))" }}>
                {tactic.title}
              </h3>
              <span
                className="v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded"
                style={{
                  color: priorityColor,
                  background: `${priorityColor}1a`,
                  border: `1px solid ${priorityColor}44`,
                }}
              >
                {tactic.priority}
              </span>
            </div>
            <p className="text-[13px] mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
              {tactic.subtitle}
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <span className="v2-mono text-[10.5px] uppercase tracking-[0.1em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
                💰 {tactic.cost}
              </span>
              <span className="v2-mono text-[10.5px] uppercase tracking-[0.1em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
                ⏱ {tactic.time}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {tactic.tags.map((tag) => (
                <span
                  key={tag}
                  className="v2-mono text-[10px] px-1.5 py-0.5 rounded"
                  style={{
                    background: "hsl(var(--v2-accent) / 0.1)",
                    color: "hsl(var(--v2-accent))",
                    border: "1px solid hsl(var(--v2-accent) / 0.2)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className="v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded inline-flex items-center gap-1.5"
              style={{
                borderColor: `${statusCfg.color}88`,
                border: `1px solid ${statusCfg.color}55`,
                background: `${statusCfg.color}1a`,
                color: statusCfg.color,
              }}
            >
              {statusCfg.label}
            </span>
            <ChevronDown
              className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")}
              style={{ color: "hsl(var(--v2-text-mute))" }}
            />
          </div>
        </div>
      </button>

      {expanded && (
        <div className="p-5 flex flex-col gap-5" style={{ borderTop: "1px solid hsl(var(--v2-border))" }}>
          <div>
            <p className="v2-mono text-[10px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: "hsl(var(--v2-text-mute))" }}>
              Stato
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(TACTIC_STATUS_CONFIG) as TacticStatus[]).map((s) => {
                const Icon = STATUS_ICONS[s];
                const cfg = TACTIC_STATUS_CONFIG[s];
                const active = s === status;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => saveStatus(s)}
                    disabled={pending}
                    className="v2-btn"
                    style={{
                      fontSize: "11.5px",
                      padding: "4px 10px",
                      borderColor: active ? cfg.color : "hsl(var(--v2-border-strong))",
                      background: active ? `${cfg.color}22` : "hsl(var(--v2-card))",
                      color: active ? cfg.color : "hsl(var(--v2-text-dim))",
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {tactic.sections.map((sec, i) => (
            <section key={i}>
              <h4 className="v2-mono text-[10px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: "hsl(var(--v2-accent))" }}>
                {sec.heading}
              </h4>
              {sec.body && (
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: "hsl(var(--v2-text))" }}>
                  {sec.body}
                </p>
              )}
              {sec.bullets && sec.bullets.length > 0 && (
                <ul className="mt-2 flex flex-col gap-1.5">
                  {sec.bullets.map((b, j) => (
                    <li key={j} className="text-[13px] leading-relaxed flex gap-2" style={{ color: "hsl(var(--v2-text))" }}>
                      <span className="shrink-0" style={{ color: "hsl(var(--v2-accent))" }}>
                        →
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <div style={{ borderTop: "1px solid hsl(var(--v2-border))", paddingTop: "16px" }}>
            <h4 className="v2-mono text-[10px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: "hsl(var(--v2-text-mute))" }}>
              Note personali / next step
            </h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Idee, prossimi step, contatti, deadline..."
              rows={4}
              className="w-full rounded-md p-3 text-[13px] outline-none resize-y"
              style={{
                background: "hsl(var(--v2-bg-elev))",
                border: "1px solid hsl(var(--v2-border))",
                color: "hsl(var(--v2-text))",
                fontFamily: "inherit",
              }}
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={saveNotes}
                disabled={pending || notes === initialNotes}
                className="v2-btn v2-btn--primary"
              >
                {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Salva note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
