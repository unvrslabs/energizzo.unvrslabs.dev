"use client";

import { useEffect, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import { ExternalLink, Globe, Mail, Phone, Save, Building2, MapPin, Hash, Users2, Tag, Send, Linkedin, UserSearch, Loader2, Copy, ClipboardList, Check, MessageCircle, FileText, Mic } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "./status-badge";
import { StatusSelect } from "./status-select";
import { SurveyBadge } from "./survey-badge";
import { enrichContacts } from "@/actions/enrich-contacts";
import { markSurveySent } from "@/actions/survey";
import { SurveyEmailComposer } from "./survey-email-composer";
import { LeadPodcastInvite } from "./lead-podcast-invite";
import type { Lead, Note, ActivityEvent, LeadContact, SurveyResponse } from "@/lib/types";
import { STATUS_CONFIG, type Status } from "@/lib/status-config";
import { SURVEY_QUESTION_LABELS, SURVEY_QUESTION_ORDER } from "@/lib/survey-questions";
import { firstPhone, cn } from "@/lib/utils";
import { updateLeadEmail, updateLeadContacts } from "@/actions/update-lead";
import { addNote } from "@/actions/add-note";
import { createClient } from "@/lib/supabase/client";

const SURVEY_BASE_URL =
  process.env.NEXT_PUBLIC_SURVEY_BASE_URL ?? "https://report.unvrslabs.dev";

type Props = {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
};

export function LeadDrawer({ lead, open, onClose }: Props) {
  const [email, setEmail] = useState(lead?.email ?? "");
  const [phone, setPhone] = useState(lead?.telefoni ?? "");
  const [whatsapp, setWhatsapp] = useState(lead?.whatsapp ?? "");
  const [noteBody, setNoteBody] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [contacts, setContacts] = useState<LeadContact[]>([]);
  const [survey, setSurvey] = useState<SurveyResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [savingEmail, startEmailTransition] = useTransition();
  const [savingContacts, startContactsTransition] = useTransition();
  const [savingNote, startNoteTransition] = useTransition();
  const [enriching, startEnrichTransition] = useTransition();
  const [markingSent, startMarkSentTransition] = useTransition();

  useEffect(() => {
    setEmail(lead?.email ?? "");
    setPhone(lead?.telefoni ?? "");
    setWhatsapp(lead?.whatsapp ?? "");
    setNoteBody("");
    setCopied(false);
    if (!lead) return;
    const supabase = createClient();
    void (async () => {
      const [n, a, c, s] = await Promise.all([
        supabase.from("notes").select("*").eq("lead_id", lead.id).order("created_at", { ascending: false }),
        supabase.from("activity_log").select("*").eq("lead_id", lead.id).order("created_at", { ascending: false }).limit(50),
        supabase.from("lead_contacts").select("*").eq("lead_id", lead.id).order("created_at", { ascending: true }),
        supabase.from("survey_responses").select("*").eq("lead_id", lead.id).maybeSingle(),
      ]);
      setNotes((n.data as Note[]) ?? []);
      setActivity((a.data as ActivityEvent[]) ?? []);
      setContacts((c.data as LeadContact[]) ?? []);
      setSurvey((s.data as SurveyResponse | null) ?? null);
    })();
  }, [lead]);

  if (!lead) return null;

  const tel = firstPhone(lead.telefoni);
  const emailToUse = lead.email || lead.email_info;

  function saveEmail() {
    if (!lead) return;
    startEmailTransition(async () => {
      const res = await updateLeadEmail({ id: lead.id, email });
      if (!res.ok) toast.error(`Errore: ${res.error}`);
      else toast.success("Email aggiornata");
    });
  }

  function saveContacts() {
    if (!lead) return;
    startContactsTransition(async () => {
      const res = await updateLeadContacts({
        id: lead.id,
        patch: { telefoni: phone, whatsapp },
      });
      if (!res.ok) toast.error(`Errore: ${res.error}`);
      else toast.success("Contatti aggiornati");
    });
  }

  function runEnrich() {
    if (!lead) return;
    startEnrichTransition(async () => {
      const res = await enrichContacts({ lead_id: lead.id, piva: lead.piva });
      if (!res.ok) {
        toast.error(`Errore: ${res.error}`);
        return;
      }
      if (res.count === 0) toast.info("Nessun titolare trovato");
      else toast.success(`${res.count} titolari trovati`);
      const supabase = createClient();
      const { data } = await supabase
        .from("lead_contacts")
        .select("*")
        .eq("lead_id", lead.id)
        .order("created_at", { ascending: true });
      setContacts((data as LeadContact[]) ?? []);
    });
  }

  const surveyLink = lead ? `${SURVEY_BASE_URL}/s/${lead.survey_token}` : "";

  async function copySurveyLink() {
    if (!surveyLink) return;
    try {
      await navigator.clipboard.writeText(surveyLink);
      setCopied(true);
      toast.success("Link report copiato");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossibile copiare il link");
    }
  }

  function markSent() {
    if (!lead) return;
    startMarkSentTransition(async () => {
      const res = await markSurveySent({ lead_id: lead.id });
      if (!res.ok) toast.error(`Errore: ${res.error}`);
      else toast.success("Report marcato come inviato");
    });
  }

  function saveNote() {
    if (!lead || !noteBody.trim()) return;
    const body = noteBody.trim();
    startNoteTransition(async () => {
      const res = await addNote({ lead_id: lead.id, body });
      if (!res.ok) {
        toast.error(`Errore: ${res.error}`);
        return;
      }
      toast.success("Nota aggiunta");
      setNoteBody("");
      const supabase = createClient();
      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("lead_id", lead.id)
        .order("created_at", { ascending: false });
      setNotes((data as Note[]) ?? []);
    });
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 border-b border-border/60">
            <div className="flex items-start justify-between gap-3 pr-8 mb-4">
              <div className="min-w-0">
                <h2 className="font-display text-xl font-bold leading-tight">{lead.ragione_sociale}</h2>
                <p className="mt-1 text-xs text-muted-foreground font-mono">P.IVA {lead.piva}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <StatusBadge status={lead.status} />
              <span
                className={cn(
                  "inline-block rounded-md border px-2 py-0.5 text-xs font-medium",
                  lead.tipo_servizio === "Dual (Ele+Gas)" && "border-emerald-500/50 text-emerald-300 bg-emerald-500/10",
                  lead.tipo_servizio === "Solo Elettrico" && "border-yellow-500/50 text-yellow-300 bg-yellow-500/10",
                  lead.tipo_servizio === "Solo Gas" && "border-blue-500/50 text-blue-300 bg-blue-500/10",
                )}
              >
                {lead.tipo_servizio}
              </span>
            </div>
            <StatusSelect id={lead.id} value={lead.status} />

            <div className="mt-4 grid grid-cols-3 gap-2">
              <ActionButton disabled={!lead.sito_web} href={lead.sito_web ?? undefined} label="Sito" icon={Globe} />
              <ActionButton
                disabled={!emailToUse}
                href={emailToUse ? `mailto:${emailToUse}` : undefined}
                label="Email"
                icon={Mail}
              />
              <ActionButton
                disabled={!tel}
                href={tel ? `tel:${tel.replace(/\D/g, "")}` : undefined}
                label="Chiama"
                icon={Phone}
              />
            </div>
          </div>

          <div className="p-6 space-y-6">
            <section className="space-y-3">
              <h3 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">Anagrafica ARERA</h3>
              <InfoRow icon={MapPin} label="Indirizzo" value={lead.indirizzo} />
              <InfoRow icon={Users2} label="Gruppo" value={lead.gruppo && lead.gruppo !== "NESSUNO" ? lead.gruppo : null} />
              <InfoRow icon={Building2} label="Natura giuridica" value={lead.natura_giuridica} />
              <InfoRow icon={Hash} label="ID ARERA" value={lead.id_arera} mono />
              <InfoRow icon={Tag} label="Settori" value={lead.settori} />
              {lead.sito_web && (
                <div className="flex items-start gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Sito web</div>
                    <a
                      href={lead.sito_web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline break-all"
                    >
                      {lead.dominio} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </section>

            <Separator />

            <section className="space-y-3">
              <h3 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> Email verificata
              </h3>
              <div className="space-y-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mario.rossi@dominio.it"
                />
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="text-muted-foreground">Proposte:</span>
                  {lead.email_info && (
                    <button
                      type="button"
                      onClick={() => setEmail(lead.email_info!)}
                      className="text-primary hover:underline font-mono"
                    >
                      {lead.email_info}
                    </button>
                  )}
                  {lead.email_commerciale && (
                    <button
                      type="button"
                      onClick={() => setEmail(lead.email_commerciale!)}
                      className="text-primary hover:underline font-mono"
                    >
                      {lead.email_commerciale}
                    </button>
                  )}
                </div>
                <Button size="sm" onClick={saveEmail} disabled={savingEmail || email === (lead.email ?? "")}>
                  <Save className="h-4 w-4" /> {savingEmail ? "Salvo..." : "Salva"}
                </Button>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> Telefono
              </h3>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+39 ..."
              />
            </section>

            <section className="space-y-3">
              <h3 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp verificato
              </h3>
              <Input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+39 ..."
              />
              {lead.whatsapp && (
                <a
                  href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:underline"
                >
                  <MessageCircle className="h-3 w-3" /> Apri chat WhatsApp
                </a>
              )}
            </section>

            <Button
              size="sm"
              onClick={saveContacts}
              disabled={
                savingContacts ||
                (phone === (lead.telefoni ?? "") && whatsapp === (lead.whatsapp ?? ""))
              }
            >
              <Save className="h-4 w-4" /> {savingContacts ? "Salvo..." : "Salva telefono + whatsapp"}
            </Button>

            <Separator />

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Titolari / Amministratori
                </h3>
                <Button size="sm" variant="outline" onClick={runEnrich} disabled={enriching}>
                  {enriching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserSearch className="h-3.5 w-3.5" />}
                  {enriching ? "Cerco..." : contacts.length > 0 ? "Aggiorna" : "Cerca"}
                </Button>
              </div>
              {lead.contacts_error && (
                <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-2">
                  {lead.contacts_error}
                </p>
              )}
              {contacts.length === 0 && !enriching && (
                <p className="text-xs text-muted-foreground italic">
                  Clicca &quot;Cerca&quot; per recuperare amministratori da OpenAPI.
                </p>
              )}
              <div className="space-y-2">
                {contacts.map((c) => (
                  <div key={c.id} className="glass rounded-md p-3 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-medium text-sm">{c.full_name}</p>
                        {c.is_legal_rep && (
                          <span className="inline-block rounded border border-primary/50 bg-primary/10 text-primary px-1.5 text-[9px] font-bold uppercase tracking-wider">
                            Legale
                          </span>
                        )}
                        {c.source === "shareholder" && (
                          <span className="inline-block rounded border border-yellow-500/50 bg-yellow-500/10 text-yellow-300 px-1.5 text-[9px] font-bold uppercase tracking-wider">
                            Socio
                          </span>
                        )}
                      </div>
                      {c.role && (
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">
                          {c.role}
                          {c.percent_share != null && (
                            <span className="ml-1.5 text-primary font-mono normal-case">{c.percent_share}%</span>
                          )}
                        </p>
                      )}
                      {(c.birth_place || c.birth_date) && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {c.birth_place}
                          {c.birth_place && c.birth_date ? " · " : ""}
                          {c.birth_date ? new Date(c.birth_date).toLocaleDateString("it-IT") : ""}
                        </p>
                      )}
                      {c.tax_code && (
                        <p className="text-[10px] font-mono text-muted-foreground/70 mt-0.5">{c.tax_code}</p>
                      )}
                    </div>
                    {c.linkedin_url && (
                      <a
                        href={c.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Cerca su LinkedIn"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 hover:border-[#0A66C2] hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] transition-colors shrink-0"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {lead.telefoni && (
              <>
                <Separator />
                <section className="space-y-2">
                  <h3 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">Telefoni</h3>
                  <div className="flex flex-col gap-1">
                    {lead.telefoni.split(",").map((t, i) => {
                      const raw = t.trim();
                      const digits = raw.replace(/\D/g, "");
                      return (
                        <a
                          key={i}
                          href={`tel:${digits}`}
                          className="inline-flex items-center gap-2 text-sm hover:text-primary transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5" /> {raw}
                        </a>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

            <Separator />

            <section className="space-y-3">
              <h3 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <ClipboardList className="h-3.5 w-3.5" /> Report 2026
                </span>
                <SurveyBadge status={lead.survey_status} />
              </h3>

              <div className="glass rounded-md p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <code className="flex-1 min-w-0 truncate rounded-sm bg-background/40 border border-border/40 px-2 py-1.5 text-[11px] font-mono text-muted-foreground">
                    {surveyLink}
                  </code>
                  <Button size="sm" variant="outline" onClick={copySurveyLink}>
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copiato" : "Copia"}
                  </Button>
                </div>
                {lead.survey_status === "not_sent" && (
                  <Button size="sm" variant="outline" onClick={markSent} disabled={markingSent}>
                    <Send className="h-3.5 w-3.5" />
                    {markingSent ? "Salvo..." : "Segna come inviata"}
                  </Button>
                )}
                {lead.survey_sent_at && lead.survey_status !== "completed" && (
                  <p className="text-[10px] text-muted-foreground">
                    Inviata {formatDistanceToNow(new Date(lead.survey_sent_at), { locale: it, addSuffix: true })}
                    {lead.survey_last_step_at && (
                      <> · ultima attività {formatDistanceToNow(new Date(lead.survey_last_step_at), { locale: it, addSuffix: true })}</>
                    )}
                  </p>
                )}
                {lead.survey_completed_at && (
                  <p className="text-[10px] text-emerald-300">
                    Completata {formatDistanceToNow(new Date(lead.survey_completed_at), { locale: it, addSuffix: true })}
                  </p>
                )}
              </div>

              <div className="liquid-glass-card-sm p-4 mt-3">
                <SurveyEmailComposer
                  leadId={lead.id}
                  companyName={lead.ragione_sociale}
                  defaultRecipientName={contacts.find((c) => c.is_legal_rep)?.full_name}
                />
              </div>

              {survey && Object.keys(survey.answers).length > 0 && (
                <div className="space-y-2">
                  {SURVEY_QUESTION_ORDER.map((qid) => {
                    const v = survey.answers[qid];
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
              )}
              {(!survey || Object.keys(survey.answers).length === 0) && (
                <p className="text-xs text-muted-foreground italic">
                  Nessuna risposta ancora. Copia il link e invialo al lead.
                </p>
              )}
            </section>

            <Separator />

            <LeadPodcastInvite leadId={lead.id} />

            <Separator />

            <section className="space-y-3">
              <h3 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                <span>Note</span>
                <span className="text-[10px] text-muted-foreground/70 font-mono">{notes.length}</span>
              </h3>
              <div className="space-y-2">
                <Textarea
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder="Scrivi una nota (chiamata, follow-up, obiezioni, ecc.)..."
                  rows={3}
                />
                <Button size="sm" onClick={saveNote} disabled={savingNote || !noteBody.trim()}>
                  <Send className="h-4 w-4" /> {savingNote ? "Salvo..." : "Aggiungi nota"}
                </Button>
              </div>
              <div className="space-y-2">
                {notes.map((n) => (
                  <div key={n.id} className="glass rounded-md p-3 text-sm">
                    <p className="whitespace-pre-wrap">{n.body}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {formatDistanceToNow(new Date(n.created_at), { locale: it, addSuffix: true })}
                    </p>
                  </div>
                ))}
                {notes.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">Nessuna nota</p>
                )}
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <h3 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">Cronologia attività</h3>
              <div className="space-y-2 border-l-2 border-border/60 pl-4">
                {activity.map((e) => (
                  <ActivityItem key={e.id} event={e} />
                ))}
                {activity.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">Nessuna attività registrata</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className={cn("break-words", mono && "font-mono")}>{value}</div>
      </div>
    </div>
  );
}

function ActionButton({
  href,
  label,
  icon: Icon,
  disabled,
}: {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}) {
  const target = href && href.startsWith("http") ? "_blank" : undefined;
  const rel = target ? "noopener noreferrer" : undefined;
  if (disabled || !href) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-md border border-border/40 p-3 opacity-40 cursor-not-allowed">
        <Icon className="h-4 w-4" />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
    );
  }
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className="flex flex-col items-center gap-1 rounded-md border border-border/60 p-3 hover:border-primary hover:bg-primary/10 transition-all"
    >
      <Icon className="h-4 w-4" />
      <span className="text-[10px] uppercase tracking-wider">{label}</span>
    </a>
  );
}

const EPISODE_LABELS: Record<string, string> = {
  "01-transizione-stg-mercato-libero": "01 · STG verso libero",
  "02-aste-stg-aggressive": "02 · Aste STG aggressive",
  "03-concentrazione-m-and-a": "03 · Concentrazione & M&A",
  "04-nuova-bolletta-2025": "04 · Nuova bolletta 2025",
  "05-ai-leva-di-margine": "05 · AI leva di margine",
  "06-recupero-crediti-post-2022": "06 · Recupero crediti post-2022",
  "07-cer-comunita-energetiche": "07 · CER",
  "08-telemarketing-teleselling": "08 · Telemarketing",
  "09-unbundling-marchio": "09 · Unbundling marchio",
  "10-smart-meter-gas": "10 · Smart meter gas",
};

const GUEST_STATUS_LABEL: Record<string, string> = {
  target: "Target",
  invited: "Invitato",
  confirmed: "Confermato",
  recorded: "Registrato",
  published: "Pubblicato",
  rejected: "Rifiutato",
};

function ActivityItem({ event }: { event: ActivityEvent }) {
  const when = formatDistanceToNow(new Date(event.created_at), { locale: it, addSuffix: true });

  const wrap = (dotClass: string, icon: React.ReactNode, body: React.ReactNode) => (
    <div className="relative text-xs">
      <span
        className={cn(
          "absolute -left-[1.38rem] top-0.5 h-4 w-4 rounded-full flex items-center justify-center",
          dotClass,
        )}
      >
        {icon}
      </span>
      {body}
      <p className="text-[10px] text-muted-foreground">{when}</p>
    </div>
  );

  if (event.event_type === "status_change" && event.from_value && event.to_value) {
    const from = STATUS_CONFIG[event.from_value as Status]?.label ?? event.from_value;
    const to = STATUS_CONFIG[event.to_value as Status]?.label ?? event.to_value;
    return wrap(
      "bg-primary/80",
      <div className="h-1.5 w-1.5 rounded-full bg-background" />,
      <p>
        Stato lead: <span className="text-muted-foreground">{from}</span> → <strong>{to}</strong>
      </p>,
    );
  }
  if (event.event_type === "email_updated") {
    return wrap(
      "bg-blue-500/80",
      <Mail className="h-2.5 w-2.5 text-background" />,
      <p>Email aggiornata {event.to_value ? `→ ${event.to_value}` : ""}</p>,
    );
  }
  if (event.event_type === "note_added") {
    return wrap(
      "bg-slate-500",
      <FileText className="h-2.5 w-2.5 text-background" />,
      <p>Nota aggiunta</p>,
    );
  }
  if (event.event_type === "podcast_guest_added") {
    return wrap(
      "bg-fuchsia-500/80",
      <Mic className="h-2.5 w-2.5 text-background" />,
      <p>Aggiunto a pipeline podcast</p>,
    );
  }
  if (event.event_type === "podcast_invite_sent") {
    const ep = event.to_value ? EPISODE_LABELS[event.to_value] ?? event.to_value : null;
    return wrap(
      "bg-fuchsia-500/80",
      <Send className="h-2.5 w-2.5 text-background" />,
      <p>
        Invito podcast inviato{ep && <> · <strong>{ep}</strong></>}
      </p>,
    );
  }
  if (event.event_type === "podcast_invite_confirmed") {
    return wrap(
      "bg-emerald-500",
      <Check className="h-2.5 w-2.5 text-background" />,
      <p>
        Invito podcast confermato{event.to_value && <> da <strong>{event.to_value}</strong></>}
      </p>,
    );
  }
  if (event.event_type === "podcast_status_change") {
    const from = GUEST_STATUS_LABEL[event.from_value ?? ""] ?? event.from_value;
    const to = GUEST_STATUS_LABEL[event.to_value ?? ""] ?? event.to_value;
    return wrap(
      "bg-fuchsia-500/60",
      <Mic className="h-2.5 w-2.5 text-background" />,
      <p>
        Stato ospite: <span className="text-muted-foreground">{from}</span> → <strong>{to}</strong>
      </p>,
    );
  }
  if (event.event_type === "report_link_sent") {
    return wrap(
      "bg-amber-500/80",
      <Send className="h-2.5 w-2.5 text-background" />,
      <p>Link report inviato</p>,
    );
  }
  if (event.event_type === "report_completed") {
    return wrap(
      "bg-emerald-500",
      <Check className="h-2.5 w-2.5 text-background" />,
      <p>Report completato</p>,
    );
  }
  return wrap(
    "bg-muted-foreground/60",
    null,
    <p>{event.event_type}</p>,
  );
}
