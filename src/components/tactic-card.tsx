"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ChevronDown, CircleDashed, CircleDot, CheckCircle2, Archive, Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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

export function TacticCard({ tactic, initialStatus, initialNotes }: Props) {
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
  const priorityColors: Record<string, string> = {
    P0: "bg-red-500/20 text-red-300 border-red-500/40",
    P1: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    P2: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  };

  return (
    <div
      className={cn(
        "glass rounded-lg transition-all",
        status === "fatto" && "opacity-70",
        status === "archiviato" && "opacity-40",
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 hover:bg-accent/5 transition-colors rounded-lg"
      >
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl shrink-0"
            style={{
              background: `linear-gradient(135deg, hsl(158 64% 42% / 0.15), hsl(180 50% 45% / 0.08))`,
              border: `1px solid hsl(158 64% 42% / 0.25)`,
            }}
          >
            {tactic.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-muted-foreground">#{tactic.number}</span>
              <h3 className="font-display text-lg font-bold">{tactic.title}</h3>
              <span
                className={cn(
                  "inline-block rounded-full border px-2 text-[10px] font-bold uppercase tracking-wider",
                  priorityColors[tactic.priority],
                )}
              >
                {tactic.priority}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{tactic.subtitle}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                💰 {tactic.cost}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                ⏱ {tactic.time}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {tactic.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/80 border border-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
              style={{
                borderColor: `${statusCfg.color}80`,
                background: `${statusCfg.color}20`,
                color: statusCfg.color,
              }}
            >
              {statusCfg.label}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                expanded && "rotate-180",
              )}
            />
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border/60 p-5 space-y-5">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Stato</p>
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
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-all",
                      active
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground",
                    )}
                    style={active ? { borderColor: cfg.color, background: `${cfg.color}25`, color: cfg.color } : undefined}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {tactic.sections.map((sec, i) => (
            <section key={i}>
              <h4 className="font-display text-xs font-semibold uppercase tracking-widest text-primary/90 mb-2">
                {sec.heading}
              </h4>
              {sec.body && (
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {sec.body}
                </p>
              )}
              {sec.bullets && sec.bullets.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {sec.bullets.map((b, j) => (
                    <li key={j} className="text-sm leading-relaxed text-foreground/85 flex gap-2">
                      <span className="text-primary shrink-0">→</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <div className="border-t border-border/60 pt-4">
            <h4 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Note personali / next step
            </h4>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Idee, prossimi step, contatti, deadline..."
              rows={4}
              className="text-sm"
            />
            <div className="flex justify-end mt-2">
              <Button size="sm" onClick={saveNotes} disabled={pending || notes === initialNotes}>
                <Save className="h-4 w-4" /> Salva note
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
