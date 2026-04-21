"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Mail,
  Phone,
  Linkedin,
  Check,
  Trash2,
  Plus as PlusIcon,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { updateGuest, updateGuestStatus } from "@/actions/podcast-guest";
import {
  attachQuestionsToGuest,
  detachQuestion,
  toggleAsked,
} from "@/actions/podcast-question";
import { upsertSessionNotes } from "@/actions/podcast-session-notes";
import { createHotTopic } from "@/actions/podcast-hot-topic";
import { upsertTerm } from "@/actions/podcast-glossary";
import {
  GUEST_STATUSES,
  GUEST_STATUS_CONFIG,
  GUEST_CATEGORIES,
  GUEST_CATEGORY_LABEL,
  QUESTION_THEME_LABEL,
  QUESTION_THEMES,
  GLOSSARY_CATEGORIES,
  GLOSSARY_CATEGORY_LABEL,
  HOT_TOPIC_INTENSITIES,
  HOT_TOPIC_INTENSITY_CONFIG,
  type GlossaryCategory,
  type HotTopicIntensity,
} from "@/lib/podcast-config";
import type {
  PodcastGuest,
  PodcastQuestion,
  PodcastGuestQuestion,
  PodcastSessionNotes,
} from "@/lib/types";

type Props = {
  guest: PodcastGuest;
  guestQuestions: PodcastGuestQuestion[];
  allQuestions: PodcastQuestion[];
  notes: PodcastSessionNotes | null;
};

const INVITE_TEMPLATE = (name: string) =>
  `Ciao ${name || "[nome]"}, lancio un podcast settimanale dedicato ai CEO dei reseller energetici italiani. Formato: 20 minuti, una conversazione 1:1, zero script, temi margini-switching-regolazione-futuro. Mi interesserebbe molto averti come ospite. Posso mandarti i dettagli?`;

export function GuestDrawer({ guest, guestQuestions, allQuestions, notes }: Props) {
  const [tab, setTab] = useState<"dati" | "domande" | "note">("dati");

  const displayName =
    guest.lead?.ragione_sociale ??
    guest.external_company ??
    guest.external_name ??
    "Ospite";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/podcast/ospiti"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Pipeline
        </Link>
      </div>

      <div className="liquid-glass rounded-2xl p-5 space-y-1">
        <h1 className="font-display text-2xl tracking-wide">{displayName}</h1>
        {guest.external_role && (
          <p className="text-sm text-muted-foreground">{guest.external_role}</p>
        )}
        {guest.lead?.piva && (
          <p className="text-xs font-mono text-muted-foreground">P.IVA {guest.lead.piva}</p>
        )}
      </div>

      <div className="flex rounded-full border border-white/10 p-0.5 w-fit">
        {(["dati", "domande", "note"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 h-8 rounded-full text-xs font-semibold capitalize ${
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {t === "dati" ? "Dati" : t === "domande" ? `Domande (${guestQuestions.length})` : "Note post"}
          </button>
        ))}
      </div>

      {tab === "dati" && <DatiTab guest={guest} />}
      {tab === "domande" && (
        <DomandeTab
          guestId={guest.id}
          guestQuestions={guestQuestions}
          allQuestions={allQuestions}
        />
      )}
      {tab === "note" && <NoteTab guestId={guest.id} notes={notes} />}
    </div>
  );
}

function DatiTab({ guest }: { guest: PodcastGuest }) {
  const email = guest.lead?.email ?? guest.external_email;
  const tel = guest.lead?.telefoni ?? null;
  const name = guest.lead?.ragione_sociale ?? guest.external_name ?? "";

  async function saveField(patch: Record<string, unknown>) {
    const res = await updateGuest({ id: guest.id, patch });
    if (!res.ok) toast.error(res.error ?? "Errore");
    else toast.success("Salvato");
  }

  async function setStatus(next: string) {
    const res = await updateGuestStatus({ id: guest.id, status: next });
    if (!res.ok) toast.error(res.error ?? "Errore");
    else toast.success("Stato aggiornato");
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="liquid-glass rounded-2xl p-5 space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Contatto</h2>
        {email && (
          <a href={`mailto:${email}`} className="flex items-center gap-2 text-sm text-primary">
            <Mail className="h-4 w-4" /> {email}
          </a>
        )}
        {tel && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" /> {tel}
          </div>
        )}
        {guest.external_linkedin && (
          <a
            href={guest.external_linkedin}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-primary"
          >
            <Linkedin className="h-4 w-4" /> LinkedIn
          </a>
        )}
        {guest.lead_id && (
          <Link
            href={`/dashboard/leads/${guest.lead_id}`}
            className="block text-xs text-primary underline"
          >
            Apri scheda lead CRM →
          </Link>
        )}
      </div>

      <div className="liquid-glass rounded-2xl p-5 space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Classificazione</h2>
        <label className="block text-sm">
          <span className="text-xs text-muted-foreground">Tier</span>
          <select
            defaultValue={guest.tier ?? ""}
            onBlur={(e) => saveField({ tier: e.target.value ? Number(e.target.value) : null })}
            className="block w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 mt-1"
          >
            <option value="">—</option>
            {[1, 2, 3].map((n) => (
              <option key={n} value={n}>
                Tier {n}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-xs text-muted-foreground">Categoria</span>
          <select
            defaultValue={guest.category ?? ""}
            onBlur={(e) => saveField({ category: e.target.value || null })}
            className="block w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 mt-1"
          >
            <option value="">—</option>
            {GUEST_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c} — {GUEST_CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-xs text-muted-foreground">Stato</span>
          <select
            defaultValue={guest.status}
            onChange={(e) => setStatus(e.target.value)}
            className="block w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 mt-1"
          >
            {GUEST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {GUEST_STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="liquid-glass rounded-2xl p-5 space-y-3 md:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
            Messaggio invito
          </h2>
          <button
            onClick={() => {
              navigator.clipboard.writeText(INVITE_TEMPLATE(name));
              toast.success("Copiato negli appunti");
            }}
            className="inline-flex items-center gap-1.5 text-xs text-primary"
          >
            <Copy className="h-3 w-3" /> Copia
          </button>
        </div>
        <p className="text-sm whitespace-pre-wrap">{INVITE_TEMPLATE(name)}</p>
      </div>

      <div className="liquid-glass rounded-2xl p-5 space-y-3 md:col-span-2">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Timeline</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {(
            [
              ["invited_at", "Invitato"],
              ["recorded_at", "Registrazione"],
              ["published_at", "Pubblicato"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm">
              <span className="text-xs text-muted-foreground">{label}</span>
              <input
                type="datetime-local"
                defaultValue={guest[key] ? guest[key]!.slice(0, 16) : ""}
                onBlur={(e) =>
                  saveField({
                    [key]: e.target.value ? new Date(e.target.value).toISOString() : null,
                  })
                }
                className="block w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 mt-1"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="liquid-glass rounded-2xl p-5 space-y-2 md:col-span-2">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
          Note strategiche
        </h2>
        <textarea
          defaultValue={guest.notes ?? ""}
          onBlur={(e) => saveField({ notes: e.target.value || null })}
          rows={4}
          className="w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-sm"
        />
      </div>

      <InvitoPodcastBox guest={guest} />
    </div>
  );
}

function InvitoPodcastBox({ guest }: { guest: PodcastGuest }) {
  async function saveField(patch: Record<string, unknown>) {
    const res = await updateGuest({ id: guest.id, patch });
    if (!res.ok) toast.error(res.error ?? "Errore");
    else toast.success("Salvato");
  }

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://energizzo.unvrslabs.dev";
  const inviteUrl = guest.invite_token
    ? `${origin}/podcast/invito/${guest.invite_token}`
    : null;

  return (
    <div className="liquid-glass rounded-2xl p-5 space-y-3 md:col-span-2">
      <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
        Invito podcast
      </h2>

      <label className="block text-sm">
        <span className="text-xs text-muted-foreground">Episodio assegnato</span>
        <select
          defaultValue={guest.selected_episode_slug ?? ""}
          onChange={(e) => saveField({ selected_episode_slug: e.target.value || null })}
          className="block w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 mt-1"
        >
          <option value="">— Nessuno —</option>
          <option value="01-transizione-stg-mercato-libero">01 · STG verso libero</option>
          <option value="02-aste-stg-aggressive">02 · Aste STG aggressive</option>
          <option value="03-concentrazione-m-and-a">03 · Concentrazione & M&amp;A</option>
          <option value="04-nuova-bolletta-2025">04 · Nuova bolletta 2025</option>
          <option value="05-ai-leva-di-margine">05 · AI leva di margine</option>
          <option value="06-recupero-crediti-post-2022">06 · Recupero crediti post-2022</option>
          <option value="07-cer-comunita-energetiche">07 · CER</option>
          <option value="08-telemarketing-teleselling">08 · Telemarketing</option>
          <option value="09-unbundling-marchio">09 · Unbundling marchio</option>
          <option value="10-smart-meter-gas">10 · Smart meter gas</option>
        </select>
      </label>

      {inviteUrl && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={inviteUrl}
              className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-xs font-mono border border-white/10"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(inviteUrl);
                toast.success("Link copiato");
              }}
              className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-3 h-9 text-xs font-semibold"
            >
              <Copy className="h-3 w-3" /> Copia
            </button>
            <a
              href={inviteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full bg-white/5 px-3 h-9 text-xs font-semibold"
            >
              Apri
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            Invia questo link (WhatsApp, QR code su card fisica, email). La pagina è
            pubblica, no login richiesto.
          </p>
        </div>
      )}

      {guest.response_confirmed_at ? (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm space-y-1">
          <p className="font-semibold text-emerald-300">
            ✓ Confermato il{" "}
            {new Date(guest.response_confirmed_at).toLocaleString("it-IT", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <p className="text-xs text-emerald-200/80">
            <span className="text-emerald-300/80">{guest.response_name}</span> ·{" "}
            <a href={`https://wa.me/${(guest.response_whatsapp ?? "").replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="underline">
              {guest.response_whatsapp}
            </a>
          </p>
          {guest.response_availability && (
            <p className="text-xs text-emerald-200/80 italic">
              &ldquo;{guest.response_availability}&rdquo;
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          In attesa di conferma. Lo stato dell&apos;ospite si aggiornerà a &quot;Confermato&quot;
          quando invia il form.
        </p>
      )}
    </div>
  );
}

function DomandeTab({
  guestId,
  guestQuestions,
  allQuestions,
}: {
  guestId: string;
  guestQuestions: PodcastGuestQuestion[];
  allQuestions: PodcastQuestion[];
}) {
  const [adderOpen, setAdderOpen] = useState(false);
  const [themeFilter, setThemeFilter] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const attachedIds = new Set(guestQuestions.map((gq) => gq.question_id));
  const available = allQuestions.filter(
    (q) => !attachedIds.has(q.id) && (themeFilter === "" || q.theme === themeFilter),
  );

  async function attach() {
    if (selected.size === 0) return;
    const res = await attachQuestionsToGuest({
      guest_id: guestId,
      question_ids: Array.from(selected),
    });
    if (!res.ok) toast.error(res.error ?? "Errore");
    else {
      toast.success(`${selected.size} domande aggiunte`);
      setSelected(new Set());
      setAdderOpen(false);
    }
  }

  async function remove(qid: string) {
    const res = await detachQuestion({ guest_id: guestId, question_id: qid });
    if (!res.ok) toast.error(res.error ?? "Errore");
  }

  async function flipAsked(qid: string, next: boolean) {
    const res = await toggleAsked({ guest_id: guestId, question_id: qid, asked: next });
    if (!res.ok) toast.error(res.error ?? "Errore");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          {guestQuestions.length} domande selezionate
        </span>
        <button
          onClick={() => setAdderOpen((v) => !v)}
          className="inline-flex items-center gap-2 text-sm text-primary"
        >
          <PlusIcon className="h-4 w-4" /> {adderOpen ? "Chiudi banca" : "Aggiungi da banca"}
        </button>
      </div>

      {adderOpen && (
        <div className="liquid-glass rounded-2xl p-4 space-y-3">
          <select
            value={themeFilter}
            onChange={(e) => setThemeFilter(e.target.value)}
            className="bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
          >
            <option value="">Tutti i temi</option>
            {QUESTION_THEMES.map((t) => (
              <option key={t} value={t}>
                {QUESTION_THEME_LABEL[t]}
              </option>
            ))}
          </select>
          <div className="max-h-72 overflow-auto space-y-1">
            {available.map((q) => {
              const on = selected.has(q.id);
              return (
                <button
                  key={q.id}
                  onClick={() =>
                    setSelected((p) => {
                      const c = new Set(p);
                      if (on) c.delete(q.id);
                      else c.add(q.id);
                      return c;
                    })
                  }
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm border ${
                    on
                      ? "bg-primary/20 border-primary"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {QUESTION_THEME_LABEL[q.theme]} · {q.phase}
                  </div>
                  <div className="mt-0.5">{q.body}</div>
                </button>
              );
            })}
            {available.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-6">
                Nessuna domanda disponibile.
              </div>
            )}
          </div>
          <button
            onClick={attach}
            disabled={selected.size === 0}
            className="w-full h-9 rounded-full text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-50"
          >
            Aggiungi {selected.size} domande
          </button>
        </div>
      )}

      <div className="space-y-2">
        {guestQuestions.map((gq) => (
          <div
            key={gq.question_id}
            className="liquid-glass rounded-xl p-3 flex items-start gap-3"
          >
            <button
              onClick={() => flipAsked(gq.question_id, !gq.asked)}
              className={`mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                gq.asked ? "bg-primary border-primary" : "border-white/20"
              }`}
              title={gq.asked ? "Già chiesta" : "Da chiedere"}
            >
              {gq.asked && <Check className="h-3 w-3 text-primary-foreground" />}
            </button>
            <div className="flex-1 min-w-0">
              {gq.question && (
                <>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {QUESTION_THEME_LABEL[gq.question.theme]} · {gq.question.phase}
                  </div>
                  <div className="text-sm mt-0.5">{gq.question.body}</div>
                </>
              )}
            </div>
            <button
              onClick={() => remove(gq.question_id)}
              className="text-muted-foreground hover:text-destructive"
              title="Rimuovi"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {guestQuestions.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-8 liquid-glass rounded-2xl">
            Nessuna domanda selezionata. Usa &quot;Aggiungi da banca&quot; sopra.
          </div>
        )}
      </div>
    </div>
  );
}

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div className="space-y-2 mt-1">
      <div className="flex flex-wrap gap-1">
        {value.map((t, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-primary/20 text-primary px-2 py-0.5 text-xs"
          >
            {t}
            <button
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="hover:text-foreground"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && draft.trim()) {
            e.preventDefault();
            onChange([...value, draft.trim()]);
            setDraft("");
          }
        }}
        placeholder={placeholder}
        className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
      />
    </div>
  );
}

function NoteTab({
  guestId,
  notes,
}: {
  guestId: string;
  notes: PodcastSessionNotes | null;
}) {
  const [form, setForm] = useState<PodcastSessionNotes>(
    () =>
      notes ?? {
        id: "",
        guest_id: guestId,
        duration_min: null,
        key_insights: null,
        new_terms: [],
        new_hot_topics: [],
        referrals: null,
        quote_highlight: null,
        energizzo_opportunity: null,
        created_at: "",
        updated_at: "",
      },
  );
  const [promoteTermOpen, setPromoteTermOpen] = useState(false);
  const [promoteTopicOpen, setPromoteTopicOpen] = useState(false);

  async function save() {
    const res = await upsertSessionNotes({
      guest_id: guestId,
      duration_min: form.duration_min,
      key_insights: form.key_insights,
      new_terms: form.new_terms,
      new_hot_topics: form.new_hot_topics,
      referrals: form.referrals,
      quote_highlight: form.quote_highlight,
      energizzo_opportunity: form.energizzo_opportunity,
    });
    if (!res.ok) toast.error(res.error ?? "Errore");
    else toast.success("Note salvate");
  }

  return (
    <div className="space-y-4">
      <div className="liquid-glass rounded-2xl p-5 space-y-3">
        <label className="block text-sm">
          <span className="text-xs text-muted-foreground">Durata (min)</span>
          <input
            type="number"
            value={form.duration_min ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                duration_min: e.target.value ? Number(e.target.value) : null,
              }))
            }
            className="block w-32 bg-white/5 rounded-lg px-3 py-2 border border-white/10 mt-1"
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs text-muted-foreground">Insight chiave</span>
          <textarea
            value={form.key_insights ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, key_insights: e.target.value }))}
            rows={4}
            className="w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 mt-1"
          />
        </label>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-muted-foreground">Nuovi termini (slang, sigle)</span>
            <TagInput
              value={form.new_terms}
              onChange={(v) => setForm((f) => ({ ...f, new_terms: v }))}
              placeholder="Scrivi e premi Enter…"
            />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Nuovi temi caldi</span>
            <TagInput
              value={form.new_hot_topics}
              onChange={(v) => setForm((f) => ({ ...f, new_hot_topics: v }))}
              placeholder="Scrivi e premi Enter…"
            />
          </div>
        </div>
        <label className="block text-sm">
          <span className="text-xs text-muted-foreground">Quote highlight</span>
          <input
            value={form.quote_highlight ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, quote_highlight: e.target.value }))}
            className="w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 mt-1"
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs text-muted-foreground">Referral suggeriti</span>
          <textarea
            value={form.referrals ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, referrals: e.target.value }))}
            rows={2}
            className="w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 mt-1"
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs text-muted-foreground">Opportunità Energizzo</span>
          <textarea
            value={form.energizzo_opportunity ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, energizzo_opportunity: e.target.value }))
            }
            rows={2}
            className="w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 mt-1"
          />
        </label>
        <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
          <div className="flex gap-2">
            <button
              disabled={form.new_terms.length === 0}
              onClick={() => setPromoteTermOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 disabled:opacity-40"
            >
              <Sparkles className="h-3 w-3" /> Promuovi termini
            </button>
            <button
              disabled={form.new_hot_topics.length === 0}
              onClick={() => setPromoteTopicOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 disabled:opacity-40"
            >
              <Sparkles className="h-3 w-3" /> Promuovi temi
            </button>
          </div>
          <button
            onClick={save}
            className="px-4 h-9 rounded-full text-sm font-semibold bg-primary text-primary-foreground"
          >
            Salva note
          </button>
        </div>
      </div>

      <PromoteTermsDialog
        open={promoteTermOpen}
        onOpenChange={setPromoteTermOpen}
        terms={form.new_terms}
        onDone={() => setForm((f) => ({ ...f, new_terms: [] }))}
      />
      <PromoteTopicsDialog
        open={promoteTopicOpen}
        onOpenChange={setPromoteTopicOpen}
        titles={form.new_hot_topics}
        onDone={() => setForm((f) => ({ ...f, new_hot_topics: [] }))}
      />
    </div>
  );
}

function PromoteTermsDialog({
  open,
  onOpenChange,
  terms,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  terms: string[];
  onDone: () => void;
}) {
  const [rows, setRows] = useState<
    { term: string; category: GlossaryCategory; definition: string }[]
  >(terms.map((t) => ({ term: t, category: "regolatore" as GlossaryCategory, definition: "" })));

  async function confirm() {
    for (const r of rows) {
      if (!r.term.trim() || !r.definition.trim()) continue;
      await upsertTerm({
        term: r.term.trim(),
        category: r.category,
        definition: r.definition.trim(),
      });
    }
    toast.success(`${rows.length} termini promossi`);
    onDone();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Promuovi termini a Glossario</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr] gap-2">
              <input
                value={r.term}
                onChange={(e) =>
                  setRows((p) =>
                    p.map((x, j) => (j === i ? { ...x, term: e.target.value } : x)),
                  )
                }
                className="bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
              />
              <select
                value={r.category}
                onChange={(e) =>
                  setRows((p) =>
                    p.map((x, j) =>
                      j === i ? { ...x, category: e.target.value as GlossaryCategory } : x,
                    ),
                  )
                }
                className="bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
              >
                {GLOSSARY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {GLOSSARY_CATEGORY_LABEL[c]}
                  </option>
                ))}
              </select>
              <textarea
                value={r.definition}
                onChange={(e) =>
                  setRows((p) =>
                    p.map((x, j) => (j === i ? { ...x, definition: e.target.value } : x)),
                  )
                }
                rows={2}
                placeholder="Definizione…"
                className="col-span-2 bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 h-9 rounded-full text-sm bg-white/5"
          >
            Annulla
          </button>
          <button
            onClick={confirm}
            className="px-4 h-9 rounded-full text-sm font-semibold bg-primary text-primary-foreground"
          >
            Conferma
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PromoteTopicsDialog({
  open,
  onOpenChange,
  titles,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  titles: string[];
  onDone: () => void;
}) {
  const [rows, setRows] = useState<
    { title: string; intensity: HotTopicIntensity; body: string }[]
  >(titles.map((t) => ({ title: t, intensity: "medio" as HotTopicIntensity, body: "" })));

  async function confirm() {
    for (const r of rows) {
      if (!r.title.trim()) continue;
      await createHotTopic({
        title: r.title.trim(),
        intensity: r.intensity,
        body: r.body.trim() || null,
        suggested_questions: [],
      });
    }
    toast.success(`${rows.length} temi promossi`);
    onDone();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Promuovi a Temi caldi</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_150px] gap-2">
              <input
                value={r.title}
                onChange={(e) =>
                  setRows((p) =>
                    p.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
                  )
                }
                className="bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
              />
              <select
                value={r.intensity}
                onChange={(e) =>
                  setRows((p) =>
                    p.map((x, j) =>
                      j === i ? { ...x, intensity: e.target.value as HotTopicIntensity } : x,
                    ),
                  )
                }
                className="bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
              >
                {HOT_TOPIC_INTENSITIES.map((it) => (
                  <option key={it} value={it}>
                    {HOT_TOPIC_INTENSITY_CONFIG[it].emoji} {HOT_TOPIC_INTENSITY_CONFIG[it].label}
                  </option>
                ))}
              </select>
              <textarea
                value={r.body}
                onChange={(e) =>
                  setRows((p) =>
                    p.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)),
                  )
                }
                rows={2}
                placeholder="Descrizione…"
                className="col-span-2 bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 h-9 rounded-full text-sm bg-white/5"
          >
            Annulla
          </button>
          <button
            onClick={confirm}
            className="px-4 h-9 rounded-full text-sm font-semibold bg-primary text-primary-foreground"
          >
            Conferma
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
