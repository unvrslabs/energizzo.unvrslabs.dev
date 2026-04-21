# Podcast "Il Reseller" — Design Spec

**Data**: 2026-04-21
**Progetto**: Energizzo CRM
**Tattica GTM**: Podcast-Trojan (P0, strategy.ts id `podcast-trojan`)
**Stato**: Design approvato, pronto per plan

---

## 1. Contesto e obiettivo

La tattica Podcast-Trojan è la P0 del GTM Energizzo: un podcast settimanale ("Il Reseller" / "Watt Matters") in cui si intervistano AD/COO di reseller energetici italiani. I target sono largamente gli stessi 819 reseller ARERA già presenti nel CRM Energizzo. Il flusso settimanale richiede knowledge base regolatoria, banca domande, pipeline ospiti e capture note post-intervista.

La knowledge base `knowledge_base_podcast_energia.md` (9 sezioni, ~15.000 parole) va organizzata in una vista operativa accessibile dal CRM esistente. MVP lean: 5 viste editabili per il flusso settimanale + 1 vista markdown per la normativa di riferimento.

**Obiettivo utente**: preparare un'intervista in 90 minuti (scelta ospite → tema → 10 domande → numeri chiave) e catturare insight post-intervista che alimentino la KB stessa.

**Non obiettivo**: tracciare metriche podcast (download, ascolti). Non è una piattaforma podcast, è uno strumento di preparazione.

---

## 2. Decisioni architetturali

| Decisione | Scelta | Motivazione |
|---|---|---|
| Dove vive | Dentro Energizzo CRM (`/dashboard/podcast`) | Stesso stack/auth, ospiti = lead CRM esistenti, coerente con GTM |
| Scope MVP | Lean: 5 viste editabili + Knowledge markdown | Focus sul flusso settimanale, normativa come reference passivo |
| Rapporto ospite ↔ lead | Tabella `podcast_guests` con FK nullable a `leads` | Copre caso dominante (ospite = lead) + apre a esterni (ARERA, analisti) |

---

## 3. Architettura routing

Nuova top-level area accanto a Lead e Strategia. Terzo pulsante nell'header `NavLinks`.

```
/dashboard/podcast                 → Home settimanale (next episode briefing)
/dashboard/podcast/ospiti          → Pipeline ospiti (Tabella + Kanban per stato)
/dashboard/podcast/ospiti/[id]     → Dettaglio ospite (drawer: invito, domande, note)
/dashboard/podcast/domande         → Banca domande (filtri tema + fase, search)
/dashboard/podcast/temi-caldi      → Temi caldi (card grid per intensità)
/dashboard/podcast/glossario       → Glossario (search + filtri categoria, modalità live)
/dashboard/podcast/knowledge       → Normativa + dati mercato (markdown render)
```

---

## 4. Schema dati (Supabase, Postgres)

6 tabelle nuove. Zero modifiche a `leads`. Tutte con RLS `authenticated` (stesso pattern attuale).

### 4.1 `podcast_guests`

Pipeline ospiti. FK nullable a `leads` per coprire anche ospiti esterni (ex-ARERA, associazioni, analisti).

```sql
create table podcast_guests (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  external_name text,
  external_company text,
  external_role text,
  external_email text,
  external_linkedin text,
  tier smallint check (tier between 1 and 3),
  category char(1) check (category in ('A','B','C','D','E','F')),
  status text not null default 'target'
    check (status in ('target','invited','confirmed','recorded','published','rejected')),
  invited_at timestamptz,     -- quando è stato inviato il DM/invito
  recorded_at timestamptz,    -- data registrazione: può essere futura (prevista) o passata (effettiva);
                              -- la distinzione si desume da status (confirmed = futura, recorded/published = avvenuta)
  published_at timestamptz,   -- quando l'episodio è stato pubblicato
  episode_url text,
  episode_title text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- invariante: o lead_id o external_name devono essere presenti
  check (lead_id is not null or external_name is not null)
);
create index on podcast_guests(status);
create index on podcast_guests(lead_id) where lead_id is not null;
```

### 4.2 `podcast_questions`

Banca domande seed dalla sezione 7 (70+ domande su 6 temi).

```sql
create table podcast_questions (
  id uuid primary key default gen_random_uuid(),
  theme text not null
    check (theme in ('margini','switching','arera','ai','m_a','people','trasversale')),
  phase text not null
    check (phase in ('apertura','approfondimento','chiusura','trappola')),
  body text not null,
  order_idx smallint not null default 0,
  archived bool not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on podcast_questions(theme, phase) where archived = false;
```

### 4.3 `podcast_guest_questions`

Selezione domande per ospite (many-to-many con flag "asked").

```sql
create table podcast_guest_questions (
  guest_id uuid not null references podcast_guests(id) on delete cascade,
  question_id uuid not null references podcast_questions(id) on delete cascade,
  asked bool not null default false,
  order_idx smallint not null default 0,
  primary key (guest_id, question_id)
);
```

### 4.4 `podcast_hot_topics`

Temi caldi dalla sezione 8, editabili dopo ogni intervista.

```sql
create table podcast_hot_topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  intensity text not null default 'medio'
    check (intensity in ('bollente','medio','freddo')),
  suggested_questions text[] default '{}',
  active bool not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on podcast_hot_topics(intensity) where active = true;
```

### 4.5 `podcast_glossary`

Glossario dalla sezione 6, ricercabile.

```sql
create table podcast_glossary (
  id uuid primary key default gen_random_uuid(),
  term text not null unique,
  category text not null
    check (category in ('regolatore','testi_integrati','servizi','prezzo','processi','segmenti','evoluzioni')),
  definition text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on podcast_glossary using gin (to_tsvector('italian', term || ' ' || definition));
```

### 4.6 `podcast_session_notes`

Note post-intervista (vista nuova, non in file sorgente). Una per ospite.

```sql
create table podcast_session_notes (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null unique references podcast_guests(id) on delete cascade,
  duration_min smallint,
  key_insights text,
  new_terms text[] default '{}',
  new_hot_topics text[] default '{}',
  referrals text,
  quote_highlight text,
  energizzo_opportunity text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 4.7 Contenuto markdown (fuori DB)

Sezioni 1-5 della knowledge base vivono come file `.md` in `content/podcast/`:

```
content/podcast/
  01-testi-integrati.md    (TIVG, TIV, CCC)
  02-stg.md                (Servizio Tutele Graduali)
  03-timeline.md           (Fine tutela 2017-2027)
  04-operativita-retail.md (Switching, Morosità, Portale Offerte)
  05-dati-mercato.md       (Relazione ARERA 2025)
```

Checked in git, renderizzati a runtime con `react-markdown`.

---

## 5. Viste e componenti

### 5.1 Home `/dashboard/podcast`

**Scopo**: colpo d'occhio sulla prossima intervista + alert temi caldi.

**Layout**:
- Riga 1: 4 stats card (stile `stats-cards.tsx`): ospiti totali, invitati, confermati, pubblicati
- Riga 2 sinistra: **Card prossima intervista** (primo guest con `status='confirmed'` ordinato per `recorded_at` asc)
  - Nome ospite, azienda, tier, data registrazione
  - Bottone "Apri briefing" → `/dashboard/podcast/ospiti/[id]`
- Riga 2 destra: **Top 3 temi bollenti** (cards compatte)
- Riga 3: **Briefing snapshot** — se l'ospite confirmed ha domande già selezionate, mostra le prime 10 con toggle asked (utile come ripasso)

**Stato vuoto**: se nessun guest confirmed, card CTA "Aggiungi il tuo primo ospite" → `/dashboard/podcast/ospiti`

### 5.2 Pipeline ospiti `/dashboard/podcast/ospiti`

**Scopo**: CRM degli ospiti, stile analogo al CRM lead esistente.

**Layout**:
- FilterBar (tier, categoria, source: lead/esterno, search)
- View toggle: **Tabella** / **Kanban** (riuso pattern di `dashboard-client.tsx`)
- **Tabella**: colonne nome, azienda, ruolo, tier, categoria, status, invited_at, recorded_at
  - Prima colonna con source badge (🏢 lead CRM / 👤 esterno)
- **Kanban**: 6 colonne per status (target, invited, confirmed, recorded, published, rejected), drag-drop via `@hello-pangea/dnd` (già in deps)

**Bottoni azione top-right**:
- "+ Da lead CRM" → modal: search tra 819 lead, preseleziona, crea `podcast_guests` con `lead_id` popolato
- "+ Esterno" → modal form libero (external_name, external_company, external_role, external_email, external_linkedin)

**Click riga/card** → drawer dettaglio (sheet da destra, stile lead-drawer).

### 5.3 Dettaglio ospite `/dashboard/podcast/ospiti/[id]`

Drawer con tab interne:

**Tab "Dati"**:
- Se `lead_id`: pull dati da leads (ragione_sociale, piva, email, telefoni). Campi read-only + link "Apri lead CRM"
- Se esterno: form editabile
- Campi editabili sempre: tier, categoria, status, notes
- Timeline: invited_at, recorded_at, published_at (date inputs)
- Azione "Copia messaggio invito LinkedIn" (template hardcoded dal file)

**Tab "Domande"**:
- Lista domande selezionate per questo ospite (sortable drag-drop → `order_idx`)
- Ogni riga: checkbox `asked`, body, theme/phase badge
- Bottone "+ Aggiungi da banca" → modal multi-select con filtri (tema, fase, search)
- Bottone "Rimuovi" per ogni riga

**Tab "Note post-intervista"**:
- Form editabile `podcast_session_notes` (upsert)
- Campi: duration_min, key_insights (textarea), new_terms (tag input), new_hot_topics (tag input), referrals (textarea), quote_highlight (input), energizzo_opportunity (textarea)
- 2 bottoni dorati di "promozione":
  - "Promuovi new_terms a Glossario" → apre modal per categoria + conferma, insert in `podcast_glossary`
  - "Promuovi new_hot_topics a Temi Caldi" → apre modal per intensità + conferma, insert in `podcast_hot_topics`

### 5.4 Banca domande `/dashboard/podcast/domande`

**Layout**:
- Sidebar: 7 tab temi (Margini, Switching, ARERA, AI, M&A, People, Trasversale)
- Main: lista domande del tema attivo, raggruppate per fase (apertura/approfondimento/chiusura/trappola)
- Ogni domanda: body + badge fase + bottoni edit/archive
- Top: search full-text (ILIKE su `body`)
- Bottone "+ Nuova domanda" (modal con tema, fase, body)

### 5.5 Temi caldi `/dashboard/podcast/temi-caldi`

**Layout**:
- 3 colonne per `intensity` (🔥 Bollente, 🌡️ Medio, ❄️ Freddo)
- Card per tema (stile `tactic-card.tsx`): titolo, body, suggested_questions come bullet list
- Edit inline: click card → drawer edit (title, body, intensity, suggested_questions come textarea con una domanda per riga)
- Bottone "Archivia" per soft-delete (`active=false`)

### 5.6 Glossario `/dashboard/podcast/glossario`

**Layout**:
- Sidebar sinistra: filtri categoria (checkbox multi), search box
- Lista centrale: termini ordinati alfabeticamente (virtualizzata se >100)
- Pannello destro: definizione termine selezionato
- Toggle top-right "Modalità live" → layout compatto full-screen, ideale su iPad durante registrazione (sidebar collassata, search sempre in focus)
- Bottone "+ Nuovo termine"

### 5.7 Knowledge `/dashboard/podcast/knowledge`

**Layout**:
- Sidebar sinistra: TOC dei 5 file MD (Testi Integrati / STG / Timeline / Operatività Retail / Dati Mercato)
- Main: render del file selezionato con `react-markdown` + `remark-gfm` (tabelle + headings)
- Navigation tramite scroll + anchor per heading
- Cerca full-text sui file via API route server-side (grep sui file MD in `content/podcast/`)
- URL ARERA nei file restano cliccabili (target _blank)

---

## 6. Flusso operativo settimanale (UX narrative)

1. **Lunedì — scegli ospite**: `/ospiti` kanban → trascina card da "target" a "invited". Apri drawer → tab Dati → bottone "Copia messaggio invito LinkedIn" → paste nel DM LinkedIn. Imposta `invited_at`.
2. **Risposta ospite**: drawer ospite → cambio status a "confirmed" + set `recorded_at`.
3. **Giovedì — briefing (30 min)**: drawer ospite → tab Domande → "Aggiungi da banca" → filtri su 1-2 temi rilevanti → seleziona 10 domande. Riordina drag-drop.
4. **Venerdì — intervista**: iPad. Apri `/glossario` in modalità live su un tab; briefing ospite sull'altro. Flagga `asked=true` sulle domande man mano.
5. **Sabato — capture**: drawer ospite → tab Note post-intervista → compila i campi. Usa i due bottoni dorati per promuovere new_terms e new_hot_topics nelle rispettive KB. Imposta `published_at` quando l'episodio esce.

Questo flusso è il "protocollo 90 minuti" del file fatto in UI.

---

## 7. Content pipeline (seed iniziale)

Script `scripts/seed_podcast.ts` (tsx, eseguibile una tantum):

**Input**: `knowledge_base_podcast_energia.md` (salvato in `content/podcast/_source_raw.md` prima dell'esecuzione)

**Output**:
1. Parse sezioni 1-5 → split in file `.md` separati in `content/podcast/` (commit manuale dopo esecuzione)
2. Parse sezione 6 (glossario) → upsert in `podcast_glossary` riga per riga (regex su pattern `**TERMINE** — definizione`)
3. Parse sezione 7 (domande) → upsert in `podcast_questions` con theme/phase inferiti dai H3 e dalle intestazioni "Apertura / Approfondimento / Chiusura / Trappole da evitare"
4. Parse sezione 8 (temi caldi) → upsert in `podcast_hot_topics` con intensity inferita dal gruppo (🔥 bollenti / 🌡️ medi / ❄️ freddi)
5. Sezione 9 → **non seedata** in `podcast_guests`. Resta come markdown in `content/podcast/09-mappa-decisori.md` (categorie e strategia di approccio).

**Idempotenza**: upsert su chiavi naturali:
- glossario: `term` (unique)
- domande: hash SHA256 del body (dedupe, non in schema ma logica script)
- temi: `title`

Lo script usa `SUPABASE_SERVICE_ROLE_KEY` (bypass RLS) via `.env.local`.

---

## 8. Stack e riuso

- **Frontend**: Next.js 15 App Router (esistente), TypeScript strict, Tailwind + shadcn-style UI (esistente)
- **Backend**: Supabase (esistente, project `motvueogtdbzmtdydqsp`)
- **Markdown**: `react-markdown` + `remark-gfm` (nuove deps)
- **Drag-drop**: `@hello-pangea/dnd` (già in deps per kanban lead)
- **Riuso**: classi `liquid-glass`, `scroll-contained`, `status-badge`, `filter-bar`, `stats-cards`, pattern `dashboard-client.tsx` per view toggle, `lead-drawer.tsx` come template per `guest-drawer.tsx`
- **Nav**: estendere `NavLinks` con terzo item `{ href: "/dashboard/podcast", label: "Podcast", icon: "mic" }` (icona lucide `Mic`)

---

## 9. Fuori scope (MVP)

Rimandati a iterazioni successive:

- Ricerca globale cross-sezione
- Integrazione Calendar/scheduling + promemoria automatici
- Export briefing sheet PDF
- Versionamento modifiche (audit log)
- Alert nuove delibere ARERA (scraper settimanale)
- Countdown 31 marzo 2027
- Widget "numero della settimana"
- Metriche podcast (download, ascolti) — non in scope, usi piattaforma podcast nativa

---

## 10. Rischi noti

- **Parsing sezione 7**: le domande sono in formato prosa, non tabellare. Lo script deve gestire numerazione e distinguere apertura/approfondimento/chiusura dai H3 locali. Possibile manual review dopo seed.
- **Knowledge markdown dimensione**: i 5 file `.md` possono pesare 30-100KB ciascuno. Render lato client con `react-markdown` dovrebbe reggere, ma se lento valutare code-splitting per route.
- **Ospiti esterni senza PIVA**: il costruttore `external_*` è duplicato rispetto a `leads`. Se in futuro vuoi "promuovere" un esterno a lead CRM, servirà una migrazione manuale. Accettabile per MVP.
- **RLS**: stesse policy di `leads` (authenticated read/write). Se serve separare chi vede cosa (es. solo admin vede note strategiche) è lavoro post-MVP.

---

## 11. Acceptance criteria (definizione di "fatto")

1. Posso aggiungere un ospite da un lead dei 819 con 2 click
2. Posso aggiungere un ospite esterno con form libero
3. Posso spostare l'ospite nel kanban e lo stato persiste
4. Posso selezionare 10 domande dalla banca e riordinarle drag-drop
5. Durante l'intervista flagga `asked` su una domanda con un click
6. Dopo l'intervista compilo note post e promuovo un nuovo termine al glossario con 2 click
7. Apro il glossario su iPad in modalità live e cerco "TIVG" in <1 sec
8. Apro Knowledge e leggo il TIVG renderizzato con tabelle e link
9. Il seed script popola domande + glossario + temi caldi senza duplicati se rieseguito

---

## 12. Next step

Questo spec va seguito da un implementation plan dettagliato (skill `writing-plans`) che spezzi il lavoro in step atomici con verificabilità locale per ciascuno.
