"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  Hash,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Mic,
  Phone,
  Save,
  Send,
  ShieldCheck,
  Tag,
  UserSearch,
  Users2,
} from "lucide-react";
import { StatusSelect } from "@/components/status-select";
import { LeadPodcastInviteV2 } from "./podcast-invite-v2";
import { LeadDocumentsV2 } from "./documents-v2";
import { SurveyEmailComposerV2 } from "./survey-email-composer-v2";
import { enrichContacts } from "@/actions/enrich-contacts";
import { markSurveySent } from "@/actions/survey";
import { updateLeadEmail, updateLeadContacts } from "@/actions/update-lead";
import { addNote } from "@/actions/add-note";
import { getSurveyUrl } from "@/lib/public-urls";
import { CATEGORIA_CONFIG, STATUS_CONFIG, type Categoria } from "@/lib/status-config";
import { SURVEY_QUESTION_LABELS, SURVEY_QUESTION_ORDER } from "@/lib/survey-questions";
import { firstPhone } from "@/lib/utils";
import type { ActivityEvent, Lead, LeadContact, Note, PodcastGuest, SurveyResponse } from "@/lib/types";

export type MembershipInfo = {
  id: string;
  phone: string;
  referente: string | null;
  approved_at: string | null;
  last_login_at: string | null;
  revoked_at: string | null;
  notes: string | null;
};

export function LeadProfileV2({
  lead,
  membership,
  initialNotes = [],
  initialActivity = [],
  initialContacts = [],
  initialSurvey = null,
  initialPodcastGuest = null,
  backHref = "/dashboard/lead",
  backLabel = "Torna ai lead",
}: {
  lead: Lead;
  membership?: MembershipInfo | null;
  initialNotes?: Note[];
  initialActivity?: ActivityEvent[];
  initialContacts?: LeadContact[];
  initialSurvey?: SurveyResponse | null;
  initialPodcastGuest?: PodcastGuest | null;
  backHref?: string;
  backLabel?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(lead.email ?? "");
  const [phone, setPhone] = useState(lead.telefono ?? "");
  const [whatsapp, setWhatsapp] = useState(lead.whatsapp ?? "");
  const [noteBody, setNoteBody] = useState("");
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [contacts, setContacts] = useState<LeadContact[]>(initialContacts);
  const activity = initialActivity;
  const survey = initialSurvey;
  const [copied, setCopied] = useState(false);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [savingEmail, startEmailTransition] = useTransition();
  const [savingContacts, startContactsTransition] = useTransition();
  const [savingNote, startNoteTransition] = useTransition();
  const [enriching, startEnrichTransition] = useTransition();
  const [markingSent, startMarkSentTransition] = useTransition();

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  const tel = lead.telefono ?? firstPhone(lead.telefoni);
  const emailToUse = lead.email || lead.email_info;
  const surveyLink = getSurveyUrl(lead.survey_token);
  const statusCfg = STATUS_CONFIG[lead.status];
  const catCfg = lead.categoria ? CATEGORIA_CONFIG[lead.categoria as Categoria] : null;

  function saveEmail() {
    startEmailTransition(async () => {
      const res = await updateLeadEmail({ id: lead.id, email });
      if (!res.ok) toast.error(`Errore: ${res.error}`);
      else toast.success("Email aggiornata");
    });
  }

  function saveContacts() {
    startContactsTransition(async () => {
      const res = await updateLeadContacts({ id: lead.id, patch: { telefono: phone, whatsapp } });
      if (!res.ok) toast.error(`Errore: ${res.error}`);
      else toast.success("Contatti aggiornati");
    });
  }

  function runEnrich() {
    startEnrichTransition(async () => {
      const res = await enrichContacts({ lead_id: lead.id, piva: lead.piva });
      if (!res.ok) {
        toast.error(`Errore: ${res.error}`);
        return;
      }
      if (res.count === 0) toast.info("Nessun titolare trovato");
      else toast.success(`${res.count} titolari trovati`);
      router.refresh();
    });
  }

  async function copySurveyLink() {
    try {
      await navigator.clipboard.writeText(surveyLink);
      setCopied(true);
      toast.success("Link invito copiato");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossibile copiare");
    }
  }

  function markSent() {
    startMarkSentTransition(async () => {
      const res = await markSurveySent({ lead_id: lead.id });
      if (!res.ok) toast.error(`Errore: ${res.error}`);
      else toast.success("Invito marcato come inviato");
    });
  }

  function saveNote() {
    if (!noteBody.trim()) return;
    const body = noteBody.trim();
    startNoteTransition(async () => {
      const res = await addNote({ lead_id: lead.id, body });
      if (!res.ok) {
        toast.error(`Errore: ${res.error}`);
        return;
      }
      toast.success("Nota aggiunta");
      setNoteBody("");
      // ottimistic: aggiungi subito in cima con id temporaneo
      const optimistic: Note = {
        id: `tmp-${Date.now()}`,
        lead_id: lead.id,
        body,
        author_id: null,
        created_at: new Date().toISOString(),
      } as Note;
      setNotes((prev) => [optimistic, ...prev]);
      // e refresh server per avere id vero
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <Link href={backHref} className="v2-btn v2-btn--ghost w-fit">
        <ArrowLeft className="w-3.5 h-3.5" />
        {backLabel}
      </Link>

      {/* Header hero */}
      <header className="v2-card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-12 h-12 rounded-xl grid place-items-center shrink-0"
              style={{ background: "hsl(var(--v2-bg-elev))", border: "1px solid hsl(var(--v2-border))" }}
            >
              <Building2 className="w-6 h-6" style={{ color: "hsl(var(--v2-accent))" }} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight truncate" style={{ color: "hsl(var(--v2-text))" }}>
                {lead.ragione_sociale}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className="v2-mono text-[10.5px] px-2 py-0.5 rounded"
                  style={{ background: "hsl(var(--v2-bg-elev))", color: "hsl(var(--v2-text-dim))", border: "1px solid hsl(var(--v2-border))" }}
                >
                  P.IVA {lead.piva}
                </span>
                {lead.invite_number != null && (
                  <span
                    className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.12em] px-2 py-1 rounded inline-flex items-center gap-1.5"
                    style={{
                      background: "hsl(var(--v2-warn) / 0.1)",
                      color: "hsl(var(--v2-warn))",
                      border: "1px solid hsl(var(--v2-warn) / 0.3)",
                    }}
                    title="Numero invito nominale"
                  >
                    Inv. N.&nbsp;{String(lead.invite_number).padStart(3, "0")}
                  </span>
                )}
                {membership && !membership.revoked_at && (
                  <span
                    className="v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded inline-flex items-center gap-1.5"
                    style={{
                      background: "hsl(var(--v2-accent) / 0.14)",
                      color: "hsl(var(--v2-accent))",
                      border: "1px solid hsl(var(--v2-accent) / 0.35)",
                    }}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    Membro network
                  </span>
                )}
                {membership?.revoked_at && (
                  <span
                    className="v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded inline-flex items-center gap-1.5"
                    style={{
                      background: "hsl(var(--v2-danger) / 0.14)",
                      color: "hsl(var(--v2-danger))",
                      border: "1px solid hsl(var(--v2-danger) / 0.35)",
                    }}
                  >
                    Revocato
                  </span>
                )}
                <span
                  className="v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded inline-flex items-center gap-1.5"
                  style={{ background: `${statusCfg.color}18`, color: statusCfg.color, border: `1px solid ${statusCfg.color}44` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusCfg.color }} />
                  {statusCfg.label}
                </span>
                {catCfg && (
                  <span
                    className="v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded inline-flex items-center gap-1.5"
                    style={{ background: `${catCfg.color}18`, color: catCfg.color, border: `1px solid ${catCfg.color}44` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: catCfg.color }} />
                    {String(lead.categoria).replace(/_/g, " ").replace("DISPACCIATORE", "DISP.")}
                  </span>
                )}
                <span
                  className="v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded"
                  style={{
                    background:
                      lead.tipo_servizio === "Dual (Ele+Gas)"
                        ? "hsl(var(--v2-accent) / 0.12)"
                        : lead.tipo_servizio === "Solo Elettrico"
                        ? "hsl(38 92% 55% / 0.12)"
                        : "hsl(200 70% 55% / 0.12)",
                    color:
                      lead.tipo_servizio === "Dual (Ele+Gas)"
                        ? "hsl(var(--v2-accent))"
                        : lead.tipo_servizio === "Solo Elettrico"
                        ? "hsl(38 92% 62%)"
                        : "hsl(200 70% 62%)",
                  }}
                >
                  {lead.tipo_servizio}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lead.sito_web && (
              <a href={lead.sito_web} target="_blank" rel="noreferrer" className="v2-btn">
                <Globe className="w-3.5 h-3.5" />
                Sito
              </a>
            )}
            {emailToUse && (
              <a href={`mailto:${emailToUse}`} className="v2-btn">
                <Mail className="w-3.5 h-3.5" />
                Email
              </a>
            )}
            {tel && (
              <a href={`tel:${tel.replace(/\D/g, "")}`} className="v2-btn">
                <Phone className="w-3.5 h-3.5" />
                Chiama
              </a>
            )}
          </div>
        </div>

        <div className="mt-5">
          <StatusSelect id={lead.id} value={lead.status} />
        </div>
      </header>

      {/* Membership network card — visibile solo se è membro */}
      {membership && (
        <section
          className="v2-card"
          style={{
            borderColor: membership.revoked_at
              ? "hsl(var(--v2-danger) / 0.4)"
              : "hsl(var(--v2-accent) / 0.4)",
          }}
        >
          <div className="v2-card-head flex items-center gap-2">
            <ShieldCheck
              className="w-3.5 h-3.5"
              style={{
                color: membership.revoked_at
                  ? "hsl(var(--v2-danger))"
                  : "hsl(var(--v2-accent))",
              }}
            />
            <span className="v2-card-title">Membership network</span>
          </div>
          <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            <MembershipField
              label="Stato"
              value={
                <span
                  className="v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded w-fit inline-block"
                  style={{
                    background: membership.revoked_at
                      ? "hsl(var(--v2-danger) / 0.14)"
                      : "hsl(var(--v2-accent) / 0.14)",
                    color: membership.revoked_at
                      ? "hsl(var(--v2-danger))"
                      : "hsl(var(--v2-accent))",
                  }}
                >
                  {membership.revoked_at ? "Revocato" : "Attivo"}
                </span>
              }
            />
            <MembershipField
              label="Ammesso il"
              value={
                <span className="v2-mono text-[13px]" style={{ color: "hsl(var(--v2-text))" }}>
                  {membership.approved_at
                    ? new Date(membership.approved_at).toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              }
            />
            <MembershipField
              label="Ultimo accesso"
              icon={<Clock className="w-3 h-3" />}
              value={
                <span className="v2-mono text-[13px]" style={{ color: "hsl(var(--v2-text))" }}>
                  {membership.last_login_at
                    ? new Date(membership.last_login_at).toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "mai"}
                </span>
              }
            />
            <MembershipField
              label="Phone membership"
              icon={<MessageCircle className="w-3 h-3" />}
              value={
                <a
                  href={`https://wa.me/${membership.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="v2-mono text-[13px] hover:underline"
                  style={{ color: "hsl(var(--v2-accent))" }}
                >
                  {membership.phone}
                </a>
              }
            />
          </div>
          {membership.notes && (
            <div
              className="mx-5 mb-5 p-3 rounded-lg text-[12.5px] leading-relaxed"
              style={{
                background: "hsl(var(--v2-bg-elev))",
                border: "1px solid hsl(var(--v2-border))",
                color: "hsl(var(--v2-text-dim))",
              }}
            >
              <div className="v2-mono text-[10px] font-bold uppercase tracking-[0.18em] mb-1.5" style={{ color: "hsl(var(--v2-text-mute))" }}>
                Note membership
              </div>
              {membership.notes}
            </div>
          )}
        </section>
      )}

      {/* Two columns bento */}
      <div className="v2-bento">
        {/* LEFT COLUMN: Anagrafica + Contatti + Titolari + Documenti */}
        <div className="v2-col-6 flex flex-col gap-5">
          {/* Anagrafica ARERA */}
          <section className="v2-card">
            <div className="v2-card-head">
              <span className="v2-card-title">Anagrafica ARERA</span>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <InfoRow icon={MapPin} label="Indirizzo" value={lead.indirizzo} />
              <InfoRow icon={Users2} label="Gruppo" value={lead.gruppo && lead.gruppo !== "NESSUNO" ? lead.gruppo : null} />
              <InfoRow icon={Building2} label="Natura giuridica" value={lead.natura_giuridica} />
              <InfoRow icon={Hash} label="ID ARERA" value={lead.id_arera} mono />
              <InfoRow icon={Tag} label="Settori" value={lead.settori} />
              <InfoRow icon={MapPin} label="Comune" value={lead.comune} />
              <InfoRow icon={MapPin} label="Provincia" value={lead.provincia} />
              <InfoRow icon={Tag} label="Macro-area" value={lead.macroarea} />
              {lead.sito_web && (
                <div className="flex items-start gap-3 text-sm">
                  <Globe className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(var(--v2-text-mute))" }} />
                  <div className="flex-1 min-w-0">
                    <div className="v2-mono text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
                      Sito web
                    </div>
                    <a
                      href={lead.sito_web}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[13px] hover:underline break-all mt-0.5"
                      style={{ color: "hsl(var(--v2-accent))" }}
                    >
                      {lead.dominio} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Contatti editabili */}
          <section className="v2-card">
            <div className="v2-card-head">
              <span className="v2-card-title">Contatti verificati</span>
            </div>
            <div className="p-5 flex flex-col gap-5">
              <FieldBlock
                icon={Mail}
                label="Email"
                value={email}
                onChange={setEmail}
                placeholder="mario.rossi@dominio.it"
                proposals={[lead.email_info, lead.email_commerciale].filter(Boolean) as string[]}
              />
              <FieldBlock
                icon={Phone}
                label="Telefono"
                value={phone}
                onChange={setPhone}
                placeholder="+39 ..."
                proposals={
                  lead.telefoni
                    ? lead.telefoni.split(/[;,\n]/).map((s) => s.trim()).filter(Boolean)
                    : []
                }
              />
              <FieldBlock
                icon={MessageCircle}
                label="WhatsApp"
                value={whatsapp}
                onChange={setWhatsapp}
                placeholder="+39 ..."
              />
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={saveEmail}
                  disabled={savingEmail || email === (lead.email ?? "")}
                  className="v2-btn v2-btn--primary"
                >
                  {savingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Salva email
                </button>
                <button
                  type="button"
                  onClick={saveContacts}
                  disabled={
                    savingContacts ||
                    (phone === (lead.telefono ?? "") && whatsapp === (lead.whatsapp ?? ""))
                  }
                  className="v2-btn v2-btn--primary"
                >
                  {savingContacts ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Salva telefono + whatsapp
                </button>
                {lead.whatsapp && (
                  <a
                    href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="v2-btn"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Apri chat
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* Titolari / Amministratori */}
          <section className="v2-card">
            <div className="v2-card-head flex items-center justify-between">
              <span className="v2-card-title">Titolari / Amministratori</span>
              <button
                type="button"
                onClick={runEnrich}
                disabled={enriching}
                className="v2-btn"
                style={{ padding: "4px 10px", fontSize: "11.5px" }}
              >
                {enriching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserSearch className="w-3.5 h-3.5" />}
                {enriching ? "Cerco..." : contacts.length > 0 ? "Aggiorna" : "Cerca"}
              </button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {lead.contacts_error && (
                <p
                  className="text-[12px] p-3 rounded-md"
                  style={{
                    background: "hsl(var(--v2-danger) / 0.1)",
                    border: "1px solid hsl(var(--v2-danger) / 0.3)",
                    color: "hsl(var(--v2-danger))",
                  }}
                >
                  {lead.contacts_error}
                </p>
              )}
              {contacts.length === 0 && !enriching && !lead.contacts_error && (
                <p className="text-[12.5px] italic" style={{ color: "hsl(var(--v2-text-mute))" }}>
                  Clicca "Cerca" per recuperare amministratori da OpenAPI.
                </p>
              )}
              <div className="flex flex-col gap-2">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-lg"
                    style={{ background: "hsl(var(--v2-bg-elev))", border: "1px solid hsl(var(--v2-border))" }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-medium text-[13px]" style={{ color: "hsl(var(--v2-text))" }}>
                          {c.full_name}
                        </p>
                        {c.is_legal_rep && (
                          <span
                            className="v2-mono text-[9px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded"
                            style={{ background: "hsl(var(--v2-accent) / 0.14)", color: "hsl(var(--v2-accent))" }}
                          >
                            Legale
                          </span>
                        )}
                        {c.source === "shareholder" && (
                          <span
                            className="v2-mono text-[9px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded"
                            style={{ background: "hsl(var(--v2-warn) / 0.14)", color: "hsl(var(--v2-warn))" }}
                          >
                            Socio
                          </span>
                        )}
                      </div>
                      {c.role && (
                        <p className="v2-mono text-[10.5px] uppercase tracking-[0.1em] mt-1" style={{ color: "hsl(var(--v2-text-mute))" }}>
                          {c.role}
                          {c.percent_share != null && (
                            <span className="ml-1.5 normal-case" style={{ color: "hsl(var(--v2-accent))" }}>
                              {c.percent_share}%
                            </span>
                          )}
                        </p>
                      )}
                      {(c.birth_place || c.birth_date) && (
                        <p className="text-[10.5px] mt-1" style={{ color: "hsl(var(--v2-text-mute))" }}>
                          {c.birth_place}
                          {c.birth_place && c.birth_date ? " · " : ""}
                          {c.birth_date ? new Date(c.birth_date).toLocaleDateString("it-IT") : ""}
                        </p>
                      )}
                      {c.tax_code && (
                        <p className="v2-mono text-[10.5px] mt-0.5" style={{ color: "hsl(var(--v2-text-mute))" }}>
                          {c.tax_code}
                        </p>
                      )}
                    </div>
                    {c.linkedin_url && (
                      <a
                        href={c.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        title="LinkedIn"
                        className="v2-btn v2-btn--ghost"
                        style={{ padding: "6px 8px" }}
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Documents */}
          <section className="v2-card">
            <div className="v2-card-head">
              <span className="v2-card-title">Documenti</span>
            </div>
            <div className="p-5">
              <LeadDocumentsV2 leadId={lead.id} />
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Network + Podcast + Note + Activity */}
        <div className="v2-col-6 flex flex-col gap-5">
          {/* Invito al network */}
          <section className="v2-card">
            <div className="v2-card-head flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} />
                <span className="v2-card-title">Invito al network</span>
              </div>
              <SurveyStatusPill status={lead.survey_status} />
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <code
                  className="flex-1 min-w-0 truncate rounded px-2 py-1.5 v2-mono text-[11px]"
                  style={{ background: "hsl(var(--v2-bg-elev))", border: "1px solid hsl(var(--v2-border))", color: "hsl(var(--v2-text-dim))" }}
                >
                  {surveyLink}
                </code>
                <button type="button" onClick={copySurveyLink} className="v2-btn">
                  {copied ? <Check className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copiato" : "Copia"}
                </button>
              </div>
              {lead.survey_status === "not_sent" && (
                <button type="button" onClick={markSent} disabled={markingSent} className="v2-btn v2-btn--primary w-fit">
                  {markingSent ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Segna come invitato
                </button>
              )}
              {lead.survey_sent_at && lead.survey_status !== "completed" && (
                <p className="text-[11px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
                  Invitato {formatDistanceToNow(new Date(lead.survey_sent_at), { locale: it, addSuffix: true })}
                  {lead.survey_last_step_at && (
                    <>
                      {" · ultima attività "}
                      {formatDistanceToNow(new Date(lead.survey_last_step_at), { locale: it, addSuffix: true })}
                    </>
                  )}
                </p>
              )}
              {lead.survey_completed_at && (
                <p className="text-[11px]" style={{ color: "hsl(var(--v2-accent))" }}>
                  Completato {formatDistanceToNow(new Date(lead.survey_completed_at), { locale: it, addSuffix: true })}
                </p>
              )}

              <div className="mt-2">
                <SurveyEmailComposerV2
                  leadId={lead.id}
                  companyName={lead.ragione_sociale}
                  defaultRecipientName={contacts.find((c) => c.is_legal_rep)?.full_name}
                />
              </div>

              {survey && Object.keys(survey.answers).length > 0 && (() => {
                const filled = SURVEY_QUESTION_ORDER.filter((qid) => {
                  const v = survey.answers[qid];
                  return v !== undefined && v !== null && v !== "";
                });
                if (filled.length === 0) return null;
                return (
                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setSurveyOpen((o) => !o)}
                      className="flex items-center justify-between gap-2 w-full px-3 py-2 rounded-md transition-colors"
                      style={{
                        background: "hsl(var(--v2-bg-elev))",
                        border: "1px solid hsl(var(--v2-border))",
                        color: "hsl(var(--v2-text))",
                      }}
                    >
                      <span className="flex items-center gap-2 v2-mono text-[10.5px] font-bold uppercase tracking-[0.14em]">
                        {surveyOpen ? (
                          <ChevronDown className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-text-mute))" }} />
                        )}
                        Risposte questionario
                      </span>
                      <span
                        className="v2-mono text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: "hsl(var(--v2-accent) / 0.14)",
                          color: "hsl(var(--v2-accent))",
                        }}
                      >
                        {filled.length} / {SURVEY_QUESTION_ORDER.length}
                      </span>
                    </button>

                    {surveyOpen && (
                      <div className="flex flex-col gap-2">
                        {filled.map((qid) => {
                          const v = survey.answers[qid];
                          const label = SURVEY_QUESTION_LABELS[qid] ?? qid;
                          return (
                            <div
                              key={qid}
                              className="p-3 rounded-md"
                              style={{ background: "hsl(var(--v2-bg-elev))", border: "1px solid hsl(var(--v2-border))" }}
                            >
                              <p className="v2-mono text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
                                <span style={{ color: "hsl(var(--v2-accent))" }}>{qid}</span> · {label}
                              </p>
                              <div className="mt-1.5 text-[13px]" style={{ color: "hsl(var(--v2-text))" }}>
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
                  </div>
                );
              })()}
            </div>
          </section>

          {/* Podcast invite */}
          <section className="v2-card">
            <div className="v2-card-head flex items-center gap-2">
              <Mic className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} />
              <span className="v2-card-title">Invito podcast</span>
            </div>
            <div className="p-5">
              <LeadPodcastInviteV2 leadId={lead.id} initialGuest={initialPodcastGuest} />
            </div>
          </section>

          {/* Notes */}
          <section className="v2-card">
            <div className="v2-card-head flex items-center justify-between">
              <span className="v2-card-title">Note</span>
              <span className="v2-mono text-[10px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
                {notes.length}
              </span>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <textarea
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                placeholder="Scrivi una nota (chiamata, follow-up, obiezioni...)"
                rows={3}
                className="w-full rounded-md p-3 text-[13px] outline-none"
                style={{
                  background: "hsl(var(--v2-bg-elev))",
                  border: "1px solid hsl(var(--v2-border))",
                  color: "hsl(var(--v2-text))",
                  fontFamily: "inherit",
                }}
              />
              <button
                type="button"
                onClick={saveNote}
                disabled={savingNote || !noteBody.trim()}
                className="v2-btn v2-btn--primary w-fit"
              >
                {savingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Aggiungi nota
              </button>
              <div className="flex flex-col gap-2">
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-md text-[13px]"
                    style={{ background: "hsl(var(--v2-bg-elev))", border: "1px solid hsl(var(--v2-border))", color: "hsl(var(--v2-text))" }}
                  >
                    <p className="whitespace-pre-wrap">{n.body}</p>
                    <p className="v2-mono text-[10px] mt-2" style={{ color: "hsl(var(--v2-text-mute))" }}>
                      {formatDistanceToNow(new Date(n.created_at), { locale: it, addSuffix: true })}
                    </p>
                  </div>
                ))}
                {notes.length === 0 && (
                  <p className="text-[12.5px] italic" style={{ color: "hsl(var(--v2-text-mute))" }}>
                    Nessuna nota
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Activity log */}
          <section className="v2-card">
            <div className="v2-card-head">
              <span className="v2-card-title">Cronologia attività</span>
            </div>
            <div className="p-5">
              <ul
                className="flex flex-col gap-2 pl-4"
                style={{ borderLeft: "2px solid hsl(var(--v2-border))" }}
              >
                {activity.map((e) => (
                  <li
                    key={e.id}
                    className="-ml-[8px] pl-3 relative text-[12.5px]"
                    style={{ color: "hsl(var(--v2-text-dim))" }}
                  >
                    <span
                      className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full"
                      style={{ background: "hsl(var(--v2-accent))" }}
                    />
                    <p style={{ color: "hsl(var(--v2-text))" }}>
                      {e.event_type === "status_change" && (
                        <>
                          Status: <span className="v2-mono text-[11px]">{e.from_value ?? "—"}</span> → <span className="v2-mono text-[11px]">{e.to_value}</span>
                        </>
                      )}
                      {e.event_type !== "status_change" && (e.event_type ?? "evento")}
                    </p>
                    <p className="v2-mono text-[10px] mt-0.5" style={{ color: "hsl(var(--v2-text-mute))" }}>
                      {formatDistanceToNow(new Date(e.created_at), { locale: it, addSuffix: true })}
                    </p>
                  </li>
                ))}
                {activity.length === 0 && (
                  <p className="text-[12.5px] italic" style={{ color: "hsl(var(--v2-text-mute))" }}>
                    Nessuna attività registrata
                  </p>
                )}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 text-[13px]">
      <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(var(--v2-text-mute))" }} />
      <div className="flex-1 min-w-0">
        <div className="v2-mono text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
          {label}
        </div>
        <div
          className={`mt-0.5 break-words ${mono ? "v2-mono text-[12px]" : ""}`}
          style={{ color: "hsl(var(--v2-text))" }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function FieldBlock({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  proposals,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  proposals?: string[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 v2-mono text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-md px-3 py-2 text-[13px] outline-none"
        style={{
          background: "hsl(var(--v2-bg-elev))",
          border: "1px solid hsl(var(--v2-border))",
          color: "hsl(var(--v2-text))",
        }}
      />
      {proposals && proposals.length > 0 && (
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <span style={{ color: "hsl(var(--v2-text-mute))" }}>Proposte:</span>
          {proposals.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(p)}
              className="v2-mono hover:underline"
              style={{ color: "hsl(var(--v2-accent))" }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MembershipField({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div
        className="flex items-center gap-1.5 v2-mono text-[9.5px] font-bold uppercase tracking-[0.18em]"
        style={{ color: "hsl(var(--v2-text-mute))" }}
      >
        {icon}
        {label}
      </div>
      <div className="mt-1">{value}</div>
    </div>
  );
}

function SurveyStatusPill({ status }: { status: string | null }) {
  const cfg: Record<string, { bg: string; fg: string; label: string }> = {
    not_sent: { bg: "hsl(var(--v2-border))", fg: "hsl(var(--v2-text-mute))", label: "Non inviato" },
    sent: { bg: "hsl(var(--v2-info) / 0.14)", fg: "hsl(var(--v2-info))", label: "Inviato" },
    partial: { bg: "hsl(var(--v2-warn) / 0.14)", fg: "hsl(var(--v2-warn))", label: "In corso" },
    completed: { bg: "hsl(var(--v2-accent) / 0.14)", fg: "hsl(var(--v2-accent))", label: "Completato" },
  };
  const c = cfg[status ?? "not_sent"] ?? cfg.not_sent;
  return (
    <span
      className="v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded"
      style={{ background: c.bg, color: c.fg }}
    >
      {c.label}
    </span>
  );
}
