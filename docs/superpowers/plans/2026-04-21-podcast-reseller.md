# Podcast "Il Reseller" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated Podcast area under `/dashboard/podcast` to the Energizzo CRM so Emanuele can prepare and track weekly podcast interviews with Italian energy resellers — pipeline ospiti linked to existing leads, question bank, hot topics, glossary, session notes, and rendered regulatory knowledge.

**Architecture:** New top-level route in the existing Next.js 15 App Router app, 6 new Supabase tables, FK-nullable link between `podcast_guests` and existing `leads(id)`, 5 markdown files under `content/podcast/` for regulatory sections, `react-markdown` for rendering, server actions (Zod + supabase/ssr) following the pattern already in `src/actions/`. Seed script tsx-executed once against the raw knowledge base file.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Supabase (project `motvueogtdbzmtdydqsp`), Tailwind, @hello-pangea/dnd (already installed), react-markdown + remark-gfm (new), shadcn-style components already in `src/components/ui/`.

**Deploy loop after each phase:**
```bash
cd /Users/emanuelemaccari/dashboard-energizzo && git push
ssh root@89.167.3.74 "cd /root/energizzo.unvrslabs.dev && git pull && pnpm install && pnpm build && pm2 restart energizzo-crm"
```

---

## File Structure

```
dashboard-energizzo/
├── content/podcast/                          # markdown knowledge base
│   ├── _source_raw.md                        # original user-supplied KB (seed input)
│   ├── 01-testi-integrati.md                 # TIVG + TIV + CCC (from §1)
│   ├── 02-stg.md                             # Servizio Tutele Graduali (§2)
│   ├── 03-timeline.md                        # fine tutela 2017-2027 (§3)
│   ├── 04-operativita-retail.md              # switching/morosità/portale (§4)
│   ├── 05-dati-mercato.md                    # Relazione ARERA 2025 (§5)
│   └── 09-mappa-decisori.md                  # meta-strategia pipeline (§9)
├── scripts/
│   └── seed_podcast.ts                       # idempotent upsert of questions/glossary/hot_topics
├── src/
│   ├── actions/
│   │   ├── podcast-guest.ts                  # CRUD guests + status transitions
│   │   ├── podcast-question.ts               # CRUD question bank + guest_questions
│   │   ├── podcast-hot-topic.ts              # CRUD hot topics
│   │   ├── podcast-glossary.ts               # CRUD glossary
│   │   └── podcast-session-notes.ts          # upsert notes + promote to glossary/topics
│   ├── app/dashboard/podcast/
│   │   ├── layout.tsx                        # sub-nav for podcast sections
│   │   ├── page.tsx                          # Home: next episode briefing
│   │   ├── ospiti/
│   │   │   ├── page.tsx                      # pipeline (tabella+kanban)
│   │   │   └── [id]/page.tsx                 # deep-link drawer
│   │   ├── domande/page.tsx
│   │   ├── temi-caldi/page.tsx
│   │   ├── glossario/page.tsx
│   │   └── knowledge/
│   │       ├── page.tsx                      # TOC + default content
│   │       └── [slug]/page.tsx               # renders content/podcast/<slug>.md
│   ├── components/podcast/
│   │   ├── guests-pipeline.tsx               # tabella/kanban switcher
│   │   ├── guest-drawer.tsx                  # tabs: dati, domande, note
│   │   ├── guest-add-from-lead.tsx           # modal search lead CRM
│   │   ├── guest-add-external.tsx            # modal form libero
│   │   ├── question-bank.tsx                 # filtri + search + editor
│   │   ├── hot-topics-board.tsx              # 3-col intensity grid
│   │   ├── glossary-view.tsx                 # search + filter + live mode
│   │   └── knowledge-renderer.tsx            # react-markdown wrapper
│   └── lib/
│       ├── types.ts                          # +PodcastGuest, PodcastQuestion, etc.
│       └── podcast-config.ts                 # status/theme/phase/intensity enums
```

Each file has one responsibility. Action files pair with a single table. Component files pair with a single view.

---

## Task 0: Install new dependencies

**Files:**
- Modify: `package.json` (deps added by pnpm)

- [ ] **Step 1: Add react-markdown + remark-gfm**

```bash
cd /Users/emanuelemaccari/dashboard-energizzo
pnpm add react-markdown remark-gfm
```

- [ ] **Step 2: Verify install**

```bash
grep -E "react-markdown|remark-gfm" package.json
```
Expected: both packages listed under `dependencies`.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(podcast): add react-markdown + remark-gfm deps"
```

---

## Task 1: Create Supabase tables + RLS

**Files:**
- Create: `docs/superpowers/plans/podcast-schema.sql` (local reference copy)

Apply via Supabase MCP. Project ref: `motvueogtdbzmtdydqsp`.

- [ ] **Step 1: Write SQL migration as a single file**

Save to `docs/superpowers/plans/podcast-schema.sql`:

```sql
-- podcast_guests
create table if not exists podcast_guests (
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
  invited_at timestamptz,
  recorded_at timestamptz,
  published_at timestamptz,
  episode_url text,
  episode_title text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (lead_id is not null or external_name is not null)
);
create index if not exists podcast_guests_status_idx on podcast_guests(status);
create index if not exists podcast_guests_lead_idx on podcast_guests(lead_id) where lead_id is not null;

-- podcast_questions
create table if not exists podcast_questions (
  id uuid primary key default gen_random_uuid(),
  theme text not null
    check (theme in ('margini','switching','arera','ai','m_a','people','trasversale')),
  phase text not null
    check (phase in ('apertura','approfondimento','chiusura','trappola')),
  body text not null,
  order_idx smallint not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists podcast_questions_theme_idx on podcast_questions(theme, phase) where archived = false;

-- podcast_guest_questions
create table if not exists podcast_guest_questions (
  guest_id uuid not null references podcast_guests(id) on delete cascade,
  question_id uuid not null references podcast_questions(id) on delete cascade,
  asked boolean not null default false,
  order_idx smallint not null default 0,
  primary key (guest_id, question_id)
);

-- podcast_hot_topics
create table if not exists podcast_hot_topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  intensity text not null default 'medio'
    check (intensity in ('bollente','medio','freddo')),
  suggested_questions text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists podcast_hot_topics_intensity_idx on podcast_hot_topics(intensity) where active = true;

-- podcast_glossary
create table if not exists podcast_glossary (
  id uuid primary key default gen_random_uuid(),
  term text not null unique,
  category text not null
    check (category in ('regolatore','testi_integrati','servizi','prezzo','processi','segmenti','evoluzioni')),
  definition text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists podcast_glossary_search_idx on podcast_glossary
  using gin (to_tsvector('italian', term || ' ' || definition));

-- podcast_session_notes (1:1 with guest)
create table if not exists podcast_session_notes (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null unique references podcast_guests(id) on delete cascade,
  duration_min smallint,
  key_insights text,
  new_terms text[] not null default '{}',
  new_hot_topics text[] not null default '{}',
  referrals text,
  quote_highlight text,
  energizzo_opportunity text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS: authenticated users read/write (same pattern as leads)
alter table podcast_guests enable row level security;
alter table podcast_questions enable row level security;
alter table podcast_guest_questions enable row level security;
alter table podcast_hot_topics enable row level security;
alter table podcast_glossary enable row level security;
alter table podcast_session_notes enable row level security;

create policy podcast_guests_auth on podcast_guests for all to authenticated using (true) with check (true);
create policy podcast_questions_auth on podcast_questions for all to authenticated using (true) with check (true);
create policy podcast_guest_questions_auth on podcast_guest_questions for all to authenticated using (true) with check (true);
create policy podcast_hot_topics_auth on podcast_hot_topics for all to authenticated using (true) with check (true);
create policy podcast_glossary_auth on podcast_glossary for all to authenticated using (true) with check (true);
create policy podcast_session_notes_auth on podcast_session_notes for all to authenticated using (true) with check (true);

-- updated_at trigger
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger podcast_guests_updated before update on podcast_guests
  for each row execute function set_updated_at();
create trigger podcast_questions_updated before update on podcast_questions
  for each row execute function set_updated_at();
create trigger podcast_hot_topics_updated before update on podcast_hot_topics
  for each row execute function set_updated_at();
create trigger podcast_glossary_updated before update on podcast_glossary
  for each row execute function set_updated_at();
create trigger podcast_session_notes_updated before update on podcast_session_notes
  for each row execute function set_updated_at();
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Use tool `mcp__claude_ai_Supabase__apply_migration` with:
- `project_id`: `motvueogtdbzmtdydqsp`
- `name`: `podcast_tables_initial`
- `query`: full SQL from Step 1

- [ ] **Step 3: Verify tables via MCP**

Use `mcp__claude_ai_Supabase__list_tables` filtered by `schemas: ["public"]`. Expect all 6 `podcast_*` tables present.

- [ ] **Step 4: Commit reference SQL**

```bash
git add docs/superpowers/plans/podcast-schema.sql
git commit -m "feat(podcast): apply supabase schema (guests, questions, topics, glossary, notes)"
```

---

## Task 2: Add podcast-related TypeScript types + config

**Files:**
- Create: `src/lib/podcast-config.ts`
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Write podcast-config.ts**

```typescript
// src/lib/podcast-config.ts

export const GUEST_STATUSES = [
  "target",
  "invited",
  "confirmed",
  "recorded",
  "published",
  "rejected",
] as const;
export type GuestStatus = (typeof GUEST_STATUSES)[number];

export const GUEST_STATUS_CONFIG: Record<GuestStatus, { label: string; color: string }> = {
  target: { label: "Target", color: "#64748b" },
  invited: { label: "Invitato", color: "#60a5fa" },
  confirmed: { label: "Confermato", color: "#a78bfa" },
  recorded: { label: "Registrato", color: "#f472b6" },
  published: { label: "Pubblicato", color: "#22c55e" },
  rejected: { label: "Rifiutato", color: "#ef4444" },
};

export const QUESTION_THEMES = [
  "margini",
  "switching",
  "arera",
  "ai",
  "m_a",
  "people",
  "trasversale",
] as const;
export type QuestionTheme = (typeof QUESTION_THEMES)[number];

export const QUESTION_THEME_LABEL: Record<QuestionTheme, string> = {
  margini: "Margini & modello economico",
  switching: "Switching & retention",
  arera: "Regole ARERA",
  ai: "AI & digitalizzazione",
  m_a: "M&A & futuro settore",
  people: "People & organizzazione",
  trasversale: "Trasversali",
};

export const QUESTION_PHASES = [
  "apertura",
  "approfondimento",
  "chiusura",
  "trappola",
] as const;
export type QuestionPhase = (typeof QUESTION_PHASES)[number];

export const HOT_TOPIC_INTENSITIES = ["bollente", "medio", "freddo"] as const;
export type HotTopicIntensity = (typeof HOT_TOPIC_INTENSITIES)[number];

export const HOT_TOPIC_INTENSITY_CONFIG: Record<HotTopicIntensity, { label: string; emoji: string }> = {
  bollente: { label: "Bollente", emoji: "🔥" },
  medio: { label: "Media intensità", emoji: "🌡️" },
  freddo: { label: "Freddo", emoji: "❄️" },
};

export const GLOSSARY_CATEGORIES = [
  "regolatore",
  "testi_integrati",
  "servizi",
  "prezzo",
  "processi",
  "segmenti",
  "evoluzioni",
] as const;
export type GlossaryCategory = (typeof GLOSSARY_CATEGORIES)[number];

export const GLOSSARY_CATEGORY_LABEL: Record<GlossaryCategory, string> = {
  regolatore: "Regolatore e istituzioni",
  testi_integrati: "Testi integrati",
  servizi: "Tipi di servizio",
  prezzo: "Componenti di prezzo",
  processi: "Processi operativi",
  segmenti: "Segmenti clientela",
  evoluzioni: "Evoluzioni in corso",
};

export const GUEST_TIERS = [1, 2, 3] as const;
export type GuestTier = (typeof GUEST_TIERS)[number];

export const GUEST_CATEGORIES = ["A", "B", "C", "D", "E", "F"] as const;
export type GuestCategory = (typeof GUEST_CATEGORIES)[number];

export const GUEST_CATEGORY_LABEL: Record<GuestCategory, string> = {
  A: "Multiutility locale / ex-municipalizzata",
  B: "Reseller puro indipendente",
  C: "Trader trasformato",
  D: "Brand digitale / nativo online",
  E: "Specializzato di nicchia",
  F: "Recente acquisizione PE",
};
```

- [ ] **Step 2: Extend types.ts**

Append to `src/lib/types.ts`:

```typescript
import type {
  GuestStatus,
  GuestTier,
  GuestCategory,
  QuestionTheme,
  QuestionPhase,
  HotTopicIntensity,
  GlossaryCategory,
} from "./podcast-config";

export type PodcastGuest = {
  id: string;
  lead_id: string | null;
  external_name: string | null;
  external_company: string | null;
  external_role: string | null;
  external_email: string | null;
  external_linkedin: string | null;
  tier: GuestTier | null;
  category: GuestCategory | null;
  status: GuestStatus;
  invited_at: string | null;
  recorded_at: string | null;
  published_at: string | null;
  episode_url: string | null;
  episode_title: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined fields
  lead?: Pick<Lead, "ragione_sociale" | "piva" | "email" | "telefoni" | "provincia"> | null;
};

export type PodcastQuestion = {
  id: string;
  theme: QuestionTheme;
  phase: QuestionPhase;
  body: string;
  order_idx: number;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

export type PodcastGuestQuestion = {
  guest_id: string;
  question_id: string;
  asked: boolean;
  order_idx: number;
  question?: PodcastQuestion;
};

export type PodcastHotTopic = {
  id: string;
  title: string;
  body: string | null;
  intensity: HotTopicIntensity;
  suggested_questions: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type PodcastGlossaryTerm = {
  id: string;
  term: string;
  category: GlossaryCategory;
  definition: string;
  created_at: string;
  updated_at: string;
};

export type PodcastSessionNotes = {
  id: string;
  guest_id: string;
  duration_min: number | null;
  key_insights: string | null;
  new_terms: string[];
  new_hot_topics: string[];
  referrals: string | null;
  quote_highlight: string | null;
  energizzo_opportunity: string | null;
  created_at: string;
  updated_at: string;
};
```

- [ ] **Step 3: Typecheck**

```bash
cd /Users/emanuelemaccari/dashboard-energizzo && pnpm exec tsc --noEmit
```
Expected: no errors related to podcast types.

- [ ] **Step 4: Commit**

```bash
git add src/lib/podcast-config.ts src/lib/types.ts
git commit -m "feat(podcast): add types and enum config for podcast domain"
```

---

## Task 3: Wire new Podcast nav item

**Files:**
- Modify: `src/components/nav-links.tsx`
- Modify: `src/app/dashboard/layout.tsx`

- [ ] **Step 1: Add Mic icon to NavLinks**

Replace ICONS block in `src/components/nav-links.tsx`:

```typescript
import { Users2, Target, Mic } from "lucide-react";

const ICONS = {
  users: Users2,
  target: Target,
  mic: Mic,
} as const;
```

- [ ] **Step 2: Register podcast route in layout**

Edit `src/app/dashboard/layout.tsx` inside the `NavLinks items={[...]}`:

```typescript
<NavLinks
  items={[
    { href: "/dashboard", label: "Lead", icon: "users" },
    { href: "/dashboard/strategia", label: "Strategia", icon: "target" },
    { href: "/dashboard/podcast", label: "Podcast", icon: "mic" },
  ]}
/>
```

- [ ] **Step 3: Create placeholder page to avoid 404**

Create `src/app/dashboard/podcast/page.tsx`:

```typescript
export default function PodcastHome() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl tracking-wide">Podcast "Il Reseller"</h1>
      <p className="text-muted-foreground text-sm">
        Pipeline ospiti, banca domande e knowledge base regolatoria — in arrivo.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Run dev and smoke test**

```bash
pnpm dev
```
Open http://localhost:3000/dashboard/podcast — expect placeholder page with nav pill "Podcast" highlighted when active.

- [ ] **Step 5: Commit**

```bash
git add src/components/nav-links.tsx src/app/dashboard/layout.tsx src/app/dashboard/podcast/page.tsx
git commit -m "feat(podcast): add Podcast nav entry + placeholder page"
```

- [ ] **Step 6: Deploy phase 0 (nav live on prod)**

```bash
git push
ssh root@89.167.3.74 "cd /root/energizzo.unvrslabs.dev && git pull && pnpm install && pnpm build && pm2 restart energizzo-crm"
```
Verify `https://energizzo.unvrslabs.dev/dashboard/podcast` renders placeholder.

---

## Task 4: Write podcast-guest server actions

**Files:**
- Create: `src/actions/podcast-guest.ts`

- [ ] **Step 1: Write full action module**

```typescript
// src/actions/podcast-guest.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { GUEST_STATUSES, GUEST_CATEGORIES } from "@/lib/podcast-config";

const guestStatusEnum = z.enum(GUEST_STATUSES as unknown as [string, ...string[]]);
const guestCategoryEnum = z.enum(GUEST_CATEGORIES as unknown as [string, ...string[]]);

const CreateFromLeadSchema = z.object({
  lead_id: z.string().uuid(),
  tier: z.number().int().min(1).max(3).optional(),
  category: guestCategoryEnum.optional(),
  notes: z.string().optional(),
});

export async function createGuestFromLead(input: unknown) {
  const parsed = CreateFromLeadSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("podcast_guests")
    .insert({
      lead_id: parsed.lead_id,
      tier: parsed.tier ?? null,
      category: parsed.category ?? null,
      notes: parsed.notes ?? null,
      status: "target",
    })
    .select("id")
    .single();
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/podcast/ospiti");
  return { ok: true as const, id: data.id };
}

const CreateExternalSchema = z.object({
  external_name: z.string().min(1),
  external_company: z.string().optional(),
  external_role: z.string().optional(),
  external_email: z.union([z.string().email(), z.literal("")]).optional(),
  external_linkedin: z.string().url().optional(),
  tier: z.number().int().min(1).max(3).optional(),
  category: guestCategoryEnum.optional(),
  notes: z.string().optional(),
});

export async function createExternalGuest(input: unknown) {
  const parsed = CreateExternalSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("podcast_guests")
    .insert({
      external_name: parsed.external_name,
      external_company: parsed.external_company ?? null,
      external_role: parsed.external_role ?? null,
      external_email: parsed.external_email || null,
      external_linkedin: parsed.external_linkedin ?? null,
      tier: parsed.tier ?? null,
      category: parsed.category ?? null,
      notes: parsed.notes ?? null,
      status: "target",
    })
    .select("id")
    .single();
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/podcast/ospiti");
  return { ok: true as const, id: data.id };
}

const UpdateStatusSchema = z.object({
  id: z.string().uuid(),
  status: guestStatusEnum,
});

export async function updateGuestStatus(input: unknown) {
  const parsed = UpdateStatusSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("podcast_guests")
    .update({ status: parsed.status })
    .eq("id", parsed.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/podcast/ospiti");
  return { ok: true as const };
}

const UpdateGuestSchema = z.object({
  id: z.string().uuid(),
  patch: z.object({
    tier: z.number().int().min(1).max(3).nullable().optional(),
    category: guestCategoryEnum.nullable().optional(),
    invited_at: z.string().datetime().nullable().optional(),
    recorded_at: z.string().datetime().nullable().optional(),
    published_at: z.string().datetime().nullable().optional(),
    episode_url: z.string().url().nullable().optional(),
    episode_title: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    external_name: z.string().nullable().optional(),
    external_company: z.string().nullable().optional(),
    external_role: z.string().nullable().optional(),
    external_email: z.string().email().nullable().optional(),
    external_linkedin: z.string().url().nullable().optional(),
  }),
});

export async function updateGuest(input: unknown) {
  const parsed = UpdateGuestSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("podcast_guests")
    .update(parsed.patch)
    .eq("id", parsed.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/dashboard/podcast/ospiti/${parsed.id}`);
  revalidatePath("/dashboard/podcast/ospiti");
  return { ok: true as const };
}

const DeleteSchema = z.object({ id: z.string().uuid() });

export async function deleteGuest(input: unknown) {
  const parsed = DeleteSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("podcast_guests").delete().eq("id", parsed.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/podcast/ospiti");
  return { ok: true as const };
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm exec tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/actions/podcast-guest.ts
git commit -m "feat(podcast): guest CRUD server actions"
```

---

## Task 5: Pipeline ospiti — data fetching + table view

**Files:**
- Create: `src/app/dashboard/podcast/ospiti/page.tsx`
- Create: `src/components/podcast/guests-pipeline.tsx`

- [ ] **Step 1: Server page that loads guests + leads mini-list for "add from lead"**

`src/app/dashboard/podcast/ospiti/page.tsx`:

```typescript
import { createClient } from "@/lib/supabase/server";
import { GuestsPipeline } from "@/components/podcast/guests-pipeline";
import type { PodcastGuest, Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OspitiPage() {
  const supabase = await createClient();

  const { data: guests } = await supabase
    .from("podcast_guests")
    .select(`
      *,
      lead:leads(ragione_sociale, piva, email, telefoni, provincia)
    `)
    .order("updated_at", { ascending: false });

  const { data: leads } = await supabase
    .from("leads")
    .select("id, ragione_sociale, piva, provincia, email, telefoni")
    .order("ragione_sociale");

  return (
    <GuestsPipeline
      guests={(guests ?? []) as PodcastGuest[]}
      leads={(leads ?? []) as Pick<Lead, "id" | "ragione_sociale" | "piva" | "provincia" | "email" | "telefoni">[]}
    />
  );
}
```

- [ ] **Step 2: Client component with table view + filter bar skeleton**

`src/components/podcast/guests-pipeline.tsx`:

```typescript
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Building2, UserSquare2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GUEST_STATUS_CONFIG, GUEST_CATEGORY_LABEL } from "@/lib/podcast-config";
import type { PodcastGuest, Lead } from "@/lib/types";

type LeadMini = Pick<Lead, "id" | "ragione_sociale" | "piva" | "provincia" | "email" | "telefoni">;

type Props = {
  guests: PodcastGuest[];
  leads: LeadMini[];
};

export function GuestsPipeline({ guests, leads }: Props) {
  const [view, setView] = useState<"tabella" | "kanban">("tabella");
  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((g) => {
      if (tierFilter !== null && g.tier !== tierFilter) return false;
      if (!q) return true;
      const name = g.lead?.ragione_sociale ?? g.external_company ?? g.external_name ?? "";
      return name.toLowerCase().includes(q);
    });
  }, [guests, query, tierFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl tracking-wide">Pipeline ospiti</h1>
        <div className="flex items-center gap-2">
          {/* placeholder buttons; wired in Task 6 */}
          <button className="inline-flex items-center gap-2 rounded-full px-4 h-9 text-sm font-semibold bg-primary/20 text-primary">
            <Plus className="h-4 w-4" /> Da lead CRM
          </button>
          <button className="inline-flex items-center gap-2 rounded-full px-4 h-9 text-sm font-semibold bg-white/5">
            <Plus className="h-4 w-4" /> Esterno
          </button>
        </div>
      </div>

      <div className="liquid-glass rounded-2xl p-3 flex items-center gap-3">
        <input
          type="search"
          placeholder="Cerca ospite…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm px-3"
        />
        <select
          value={tierFilter ?? ""}
          onChange={(e) => setTierFilter(e.target.value ? Number(e.target.value) : null)}
          className="bg-transparent text-sm border border-white/10 rounded-full px-3 h-9"
        >
          <option value="">Tutti i tier</option>
          <option value="1">Tier 1</option>
          <option value="2">Tier 2</option>
          <option value="3">Tier 3</option>
        </select>
        <div className="flex rounded-full border border-white/10 p-0.5">
          {(["tabella", "kanban"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-3 h-8 rounded-full text-xs font-semibold",
                view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {v === "tabella" ? "Tabella" : "Kanban"}
            </button>
          ))}
        </div>
      </div>

      {view === "tabella" ? (
        <GuestsTable guests={filtered} />
      ) : (
        <div className="text-muted-foreground text-sm p-10 text-center">
          Kanban disponibile nel prossimo task.
        </div>
      )}
      {/* silence unused-leads until add-from-lead modal wiring in Task 6 */}
      <span className="sr-only">{leads.length} lead disponibili</span>
    </div>
  );
}

function GuestsTable({ guests }: { guests: PodcastGuest[] }) {
  if (guests.length === 0) {
    return (
      <div className="liquid-glass rounded-2xl py-14 text-center text-muted-foreground text-sm">
        Nessun ospite ancora. Inizia aggiungendone uno dal CRM.
      </div>
    );
  }
  return (
    <div className="liquid-glass rounded-2xl overflow-hidden">
      <div className="grid grid-cols-[24px_1.5fr_100px_120px_140px_140px] items-center gap-0 bg-[hsl(215_35%_14%)] border-b border-primary/25 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
        <div className="px-3 py-3" />
        <div className="px-4 py-3">Ospite / Azienda</div>
        <div className="px-4 py-3">Tier</div>
        <div className="px-4 py-3">Categoria</div>
        <div className="px-4 py-3">Stato</div>
        <div className="px-4 py-3">Registrazione</div>
      </div>
      {guests.map((g, i) => {
        const name = g.lead?.ragione_sociale ?? g.external_company ?? g.external_name ?? "—";
        const sourceIcon = g.lead_id ? <Building2 className="h-3.5 w-3.5" /> : <UserSquare2 className="h-3.5 w-3.5" />;
        const status = GUEST_STATUS_CONFIG[g.status];
        return (
          <Link
            key={g.id}
            href={`/dashboard/podcast/ospiti/${g.id}`}
            className={cn(
              "grid grid-cols-[24px_1.5fr_100px_120px_140px_140px] items-center gap-0 border-b border-white/5 hover:bg-primary/5 transition-colors text-sm",
              i % 2 === 0 ? "bg-white/[0.015]" : "bg-transparent",
            )}
          >
            <div className="px-3 py-3 text-muted-foreground">{sourceIcon}</div>
            <div className="px-4 py-3 font-semibold truncate">{name}</div>
            <div className="px-4 py-3 text-muted-foreground">{g.tier ? `T${g.tier}` : "—"}</div>
            <div className="px-4 py-3 text-muted-foreground text-xs">
              {g.category ? GUEST_CATEGORY_LABEL[g.category].split(" ")[0] : "—"}
            </div>
            <div className="px-4 py-3">
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                style={{ backgroundColor: `${status.color}20`, color: status.color, border: `1px solid ${status.color}50` }}
              >
                {status.label}
              </span>
            </div>
            <div className="px-4 py-3 text-xs text-muted-foreground">
              {g.recorded_at ? new Date(g.recorded_at).toLocaleDateString("it-IT") : "—"}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Typecheck + dev smoke test**

```bash
pnpm exec tsc --noEmit && pnpm dev
```
Open `/dashboard/podcast/ospiti`. Expected: empty state "Nessun ospite ancora." (table has no rows since DB is empty).

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/podcast/ospiti src/components/podcast/guests-pipeline.tsx
git commit -m "feat(podcast): pipeline ospiti page + tabella view"
```

---

## Task 6: Add-from-lead + Add-external modals

**Files:**
- Create: `src/components/podcast/guest-add-from-lead.tsx`
- Create: `src/components/podcast/guest-add-external.tsx`
- Modify: `src/components/podcast/guests-pipeline.tsx`

- [ ] **Step 1: Add-from-lead modal**

`src/components/podcast/guest-add-from-lead.tsx`:

```typescript
"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createGuestFromLead } from "@/actions/podcast-guest";
import { useRouter } from "next/navigation";
import type { Lead } from "@/lib/types";

type LeadMini = Pick<Lead, "id" | "ragione_sociale" | "piva" | "provincia">;

export function GuestAddFromLead({
  open,
  onOpenChange,
  leads,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  leads: LeadMini[];
}) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return leads.slice(0, 30);
    return leads
      .filter((l) =>
        l.ragione_sociale.toLowerCase().includes(needle) || l.piva.includes(needle),
      )
      .slice(0, 30);
  }, [q, leads]);

  async function confirm() {
    if (!selected) return;
    const res = await createGuestFromLead({ lead_id: selected });
    if (!res.ok) {
      toast.error(res.error ?? "Errore creazione");
      return;
    }
    toast.success("Ospite aggiunto");
    onOpenChange(false);
    router.push(`/dashboard/podcast/ospiti/${res.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Aggiungi ospite da lead CRM</DialogTitle>
        </DialogHeader>
        <input
          autoFocus
          placeholder="Cerca ragione sociale o P.IVA…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm outline-none border border-white/10"
        />
        <div className="max-h-64 overflow-auto space-y-1">
          {matches.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelected(l.id)}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm ${
                selected === l.id ? "bg-primary/20 text-primary" : "hover:bg-white/5"
              }`}
            >
              <div className="font-semibold">{l.ragione_sociale}</div>
              <div className="text-xs text-muted-foreground">
                {l.piva} {l.provincia ? `· ${l.provincia}` : ""}
              </div>
            </button>
          ))}
          {matches.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-4">Nessun lead trovato.</div>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            className="px-4 h-9 rounded-full text-sm bg-white/5"
            onClick={() => onOpenChange(false)}
          >
            Annulla
          </button>
          <button
            onClick={confirm}
            disabled={!selected}
            className="px-4 h-9 rounded-full text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-50"
          >
            Aggiungi
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Add-external modal**

`src/components/podcast/guest-add-external.tsx`:

```typescript
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createExternalGuest } from "@/actions/podcast-guest";

export function GuestAddExternal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [form, setForm] = useState({
    external_name: "",
    external_company: "",
    external_role: "",
    external_email: "",
    external_linkedin: "",
  });
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.external_name.trim()) {
      toast.error("Il nome è obbligatorio");
      return;
    }
    const payload = {
      external_name: form.external_name.trim(),
      external_company: form.external_company.trim() || undefined,
      external_role: form.external_role.trim() || undefined,
      external_email: form.external_email.trim() || undefined,
      external_linkedin: form.external_linkedin.trim() || undefined,
    };
    const res = await createExternalGuest(payload);
    if (!res.ok) {
      toast.error(res.error ?? "Errore");
      return;
    }
    toast.success("Ospite esterno creato");
    onOpenChange(false);
    router.push(`/dashboard/podcast/ospiti/${res.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Aggiungi ospite esterno</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          {(
            [
              ["external_name", "Nome *"],
              ["external_company", "Azienda"],
              ["external_role", "Ruolo"],
              ["external_email", "Email"],
              ["external_linkedin", "LinkedIn URL"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
              <input
                type={key === "external_email" ? "email" : key === "external_linkedin" ? "url" : "text"}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-white/5 rounded-lg px-3 py-2 outline-none border border-white/10"
              />
            </label>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 h-9 rounded-full text-sm bg-white/5"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 h-9 rounded-full text-sm font-semibold bg-primary text-primary-foreground"
            >
              Crea ospite
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Wire modals into pipeline**

Modify `src/components/podcast/guests-pipeline.tsx`:
- Add `useState` for `addLeadOpen` and `addExternalOpen`
- Replace placeholder buttons with `onClick={() => setAddLeadOpen(true)}` and `onClick={() => setAddExternalOpen(true)}`
- Render `<GuestAddFromLead open={addLeadOpen} onOpenChange={setAddLeadOpen} leads={leads} />` and `<GuestAddExternal open={addExternalOpen} onOpenChange={setAddExternalOpen} />` at end of returned JSX
- Remove the `sr-only` placeholder line about leads count

- [ ] **Step 4: Manual smoke test**

`pnpm dev` → open pipeline ospiti → click "Da lead CRM" → search for an existing lead (e.g. "+Energia") → confirm → verify row appears on list after redirect back.

- [ ] **Step 5: Commit**

```bash
git add src/components/podcast/guest-add-from-lead.tsx src/components/podcast/guest-add-external.tsx src/components/podcast/guests-pipeline.tsx
git commit -m "feat(podcast): add guest modals (from lead CRM + external)"
```

---

## Task 7: Kanban view with drag-drop

**Files:**
- Modify: `src/components/podcast/guests-pipeline.tsx`

- [ ] **Step 1: Add kanban subcomponent using existing @hello-pangea/dnd**

In `guests-pipeline.tsx`, below `GuestsTable`, add:

```typescript
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { useTransition } from "react";
import { updateGuestStatus } from "@/actions/podcast-guest";
import { GUEST_STATUSES, type GuestStatus } from "@/lib/podcast-config";

function GuestsKanban({ guests }: { guests: PodcastGuest[] }) {
  const [local, setLocal] = useState<Record<string, GuestStatus>>({});
  const [, startTransition] = useTransition();

  const withOverrides = guests.map((g) => (local[g.id] ? { ...g, status: local[g.id] } : g));

  function onDragEnd(r: DropResult) {
    if (!r.destination) return;
    if (r.destination.droppableId === r.source.droppableId) return;
    const next = r.destination.droppableId as GuestStatus;
    setLocal((p) => ({ ...p, [r.draggableId]: next }));
    startTransition(async () => {
      const res = await updateGuestStatus({ id: r.draggableId, status: next });
      if (!res.ok) {
        toast.error(`Errore: ${res.error}`);
        setLocal((p) => {
          const c = { ...p };
          delete c[r.draggableId];
          return c;
        });
      } else {
        toast.success(`→ ${GUEST_STATUS_CONFIG[next].label}`);
      }
    });
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 scroll-x-contained">
        {GUEST_STATUSES.map((s) => {
          const items = withOverrides.filter((g) => g.status === s);
          return (
            <div key={s} className="glass rounded-lg p-3 w-[280px] shrink-0 flex flex-col">
              <div className="flex items-center justify-between mb-3 px-1">
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: GUEST_STATUS_CONFIG[s].color }}
                >
                  {GUEST_STATUS_CONFIG[s].label}
                </span>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <Droppable droppableId={s}>
                {(prov) => (
                  <div ref={prov.innerRef} {...prov.droppableProps} className="space-y-2 min-h-[40px]">
                    {items.map((g, idx) => {
                      const name = g.lead?.ragione_sociale ?? g.external_company ?? g.external_name ?? "—";
                      return (
                        <Draggable key={g.id} draggableId={g.id} index={idx}>
                          {(d) => (
                            <Link
                              href={`/dashboard/podcast/ospiti/${g.id}`}
                              ref={d.innerRef}
                              {...d.draggableProps}
                              {...d.dragHandleProps}
                              className="block rounded-lg bg-white/5 p-3 text-sm hover:bg-white/10 transition-colors"
                            >
                              <div className="font-semibold truncate">{name}</div>
                              {g.tier && (
                                <div className="text-[10px] text-muted-foreground mt-1">Tier {g.tier}</div>
                              )}
                            </Link>
                          )}
                        </Draggable>
                      );
                    })}
                    {prov.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
```

Also import `toast` from `sonner` at top of file if not present.

- [ ] **Step 2: Replace placeholder kanban block in `GuestsPipeline`**

Replace the `{view === "tabella" ? <GuestsTable ... /> : <div>…</div>}` block with:

```typescript
{view === "tabella" ? <GuestsTable guests={filtered} /> : <GuestsKanban guests={filtered} />}
```

- [ ] **Step 3: Manual smoke test**

Create 2-3 ospiti, switch to kanban, drag between columns, confirm status persists after refresh.

- [ ] **Step 4: Commit**

```bash
git add src/components/podcast/guests-pipeline.tsx
git commit -m "feat(podcast): kanban view with drag-drop status updates"
```

---

## Task 8: Guest detail drawer (skeleton with Dati tab)

**Files:**
- Create: `src/app/dashboard/podcast/ospiti/[id]/page.tsx`
- Create: `src/components/podcast/guest-drawer.tsx`

- [ ] **Step 1: Server page**

`src/app/dashboard/podcast/ospiti/[id]/page.tsx`:

```typescript
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GuestDrawer } from "@/components/podcast/guest-drawer";
import type { PodcastGuest, PodcastQuestion, PodcastGuestQuestion, PodcastSessionNotes } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function GuestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: guest } = await supabase
    .from("podcast_guests")
    .select(`*, lead:leads(ragione_sociale, piva, email, telefoni, provincia)`)
    .eq("id", id)
    .single();

  if (!guest) notFound();

  const { data: gq } = await supabase
    .from("podcast_guest_questions")
    .select(`*, question:podcast_questions(*)`)
    .eq("guest_id", id)
    .order("order_idx");

  const { data: allQuestions } = await supabase
    .from("podcast_questions")
    .select("*")
    .eq("archived", false)
    .order("theme")
    .order("order_idx");

  const { data: notes } = await supabase
    .from("podcast_session_notes")
    .select("*")
    .eq("guest_id", id)
    .maybeSingle();

  return (
    <GuestDrawer
      guest={guest as PodcastGuest}
      guestQuestions={(gq ?? []) as PodcastGuestQuestion[]}
      allQuestions={(allQuestions ?? []) as PodcastQuestion[]}
      notes={(notes ?? null) as PodcastSessionNotes | null}
    />
  );
}
```

- [ ] **Step 2: Drawer shell with tabs**

`src/components/podcast/guest-drawer.tsx`:

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Mail, Phone, Linkedin } from "lucide-react";
import { toast } from "sonner";
import { updateGuest, updateGuestStatus } from "@/actions/podcast-guest";
import { GUEST_STATUSES, GUEST_STATUS_CONFIG, GUEST_CATEGORIES, GUEST_CATEGORY_LABEL } from "@/lib/podcast-config";
import type { PodcastGuest, PodcastQuestion, PodcastGuestQuestion, PodcastSessionNotes } from "@/lib/types";

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

  const displayName = guest.lead?.ragione_sociale ?? guest.external_company ?? guest.external_name ?? "Ospite";

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
        {guest.external_role && <p className="text-sm text-muted-foreground">{guest.external_role}</p>}
        {guest.lead?.piva && <p className="text-xs font-mono text-muted-foreground">P.IVA {guest.lead.piva}</p>}
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
        <p className="text-muted-foreground text-sm p-10 text-center liquid-glass rounded-2xl">
          Tab domande — implementato nel prossimo task.
        </p>
      )}
      {tab === "note" && (
        <p className="text-muted-foreground text-sm p-10 text-center liquid-glass rounded-2xl">
          Tab note — implementato nel prossimo task.
        </p>
      )}
      {/* suppress unused-vars while tabs not yet wired */}
      <span className="sr-only">{allQuestions.length}{notes?.id ?? ""}</span>
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
          <a href={guest.external_linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary">
            <Linkedin className="h-4 w-4" /> LinkedIn
          </a>
        )}
        {guest.lead_id && (
          <Link href={`/dashboard/leads/${guest.lead_id}`} className="block text-xs text-primary underline">
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
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Messaggio invito</h2>
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
                onBlur={(e) => saveField({ [key]: e.target.value ? new Date(e.target.value).toISOString() : null })}
                className="block w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 mt-1"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="liquid-glass rounded-2xl p-5 space-y-2 md:col-span-2">
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Note strategiche</h2>
        <textarea
          defaultValue={guest.notes ?? ""}
          onBlur={(e) => saveField({ notes: e.target.value || null })}
          rows={4}
          className="w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 text-sm"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Smoke test**

Create a guest, open its detail page, edit tier + status, click "Copia" on invite template, refresh — values persist.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/podcast/ospiti/\[id\]/page.tsx src/components/podcast/guest-drawer.tsx
git commit -m "feat(podcast): guest detail drawer with Dati tab"
```

---

## Task 9: Question-bank actions + Domande tab in drawer

**Files:**
- Create: `src/actions/podcast-question.ts`
- Modify: `src/components/podcast/guest-drawer.tsx`

- [ ] **Step 1: Question actions**

```typescript
// src/actions/podcast-question.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { QUESTION_THEMES, QUESTION_PHASES } from "@/lib/podcast-config";

const themeEnum = z.enum(QUESTION_THEMES as unknown as [string, ...string[]]);
const phaseEnum = z.enum(QUESTION_PHASES as unknown as [string, ...string[]]);

const CreateSchema = z.object({
  theme: themeEnum,
  phase: phaseEnum,
  body: z.string().min(1),
});

export async function createQuestion(input: unknown) {
  const parsed = CreateSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("podcast_questions").insert(parsed);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/podcast/domande");
  return { ok: true as const };
}

const UpdateSchema = z.object({
  id: z.string().uuid(),
  patch: z.object({
    body: z.string().min(1).optional(),
    theme: themeEnum.optional(),
    phase: phaseEnum.optional(),
    archived: z.boolean().optional(),
  }),
});

export async function updateQuestion(input: unknown) {
  const parsed = UpdateSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("podcast_questions").update(parsed.patch).eq("id", parsed.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/podcast/domande");
  return { ok: true as const };
}

const AttachSchema = z.object({
  guest_id: z.string().uuid(),
  question_ids: z.array(z.string().uuid()).min(1),
});

export async function attachQuestionsToGuest(input: unknown) {
  const parsed = AttachSchema.parse(input);
  const supabase = await createClient();
  // get current max order_idx
  const { data: existing } = await supabase
    .from("podcast_guest_questions")
    .select("order_idx")
    .eq("guest_id", parsed.guest_id)
    .order("order_idx", { ascending: false })
    .limit(1);
  let start = existing?.[0]?.order_idx ?? -1;
  const rows = parsed.question_ids.map((qid) => ({
    guest_id: parsed.guest_id,
    question_id: qid,
    order_idx: ++start,
  }));
  const { error } = await supabase.from("podcast_guest_questions").upsert(rows, {
    onConflict: "guest_id,question_id",
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/dashboard/podcast/ospiti/${parsed.guest_id}`);
  return { ok: true as const };
}

const DetachSchema = z.object({
  guest_id: z.string().uuid(),
  question_id: z.string().uuid(),
});

export async function detachQuestion(input: unknown) {
  const parsed = DetachSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("podcast_guest_questions")
    .delete()
    .eq("guest_id", parsed.guest_id)
    .eq("question_id", parsed.question_id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/dashboard/podcast/ospiti/${parsed.guest_id}`);
  return { ok: true as const };
}

const ToggleAskedSchema = z.object({
  guest_id: z.string().uuid(),
  question_id: z.string().uuid(),
  asked: z.boolean(),
});

export async function toggleAsked(input: unknown) {
  const parsed = ToggleAskedSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("podcast_guest_questions")
    .update({ asked: parsed.asked })
    .eq("guest_id", parsed.guest_id)
    .eq("question_id", parsed.question_id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/dashboard/podcast/ospiti/${parsed.guest_id}`);
  return { ok: true as const };
}
```

- [ ] **Step 2: Replace Domande tab placeholder in guest-drawer.tsx**

Replace the `{tab === "domande" && <p>…</p>}` block with inline component:

```typescript
{tab === "domande" && (
  <DomandeTab guestId={guest.id} guestQuestions={guestQuestions} allQuestions={allQuestions} />
)}
```

Add below `DatiTab` component definition:

```typescript
import { Check, Trash2, Plus as PlusIcon } from "lucide-react";
import { attachQuestionsToGuest, detachQuestion, toggleAsked } from "@/actions/podcast-question";
import { QUESTION_THEME_LABEL, QUESTION_THEMES } from "@/lib/podcast-config";

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
                      on ? c.delete(q.id) : c.add(q.id);
                      return c;
                    })
                  }
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm border ${
                    on ? "bg-primary/20 border-primary" : "bg-white/5 border-white/10 hover:bg-white/10"
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
                Nessuna domanda disponibile per il filtro scelto.
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
            Nessuna domanda selezionata. Usa "Aggiungi da banca" sopra.
          </div>
        )}
      </div>
    </div>
  );
}
```

Also: remove the `{allQuestions.length}{notes?.id}` sr-only line from the main component once `allQuestions` is passed to `DomandeTab`.

- [ ] **Step 3: Smoke test**

Create guest → open → Domande tab → click "Aggiungi da banca" (will be empty until seed in Task 14 but modal must render without crashing).

- [ ] **Step 4: Commit**

```bash
git add src/actions/podcast-question.ts src/components/podcast/guest-drawer.tsx
git commit -m "feat(podcast): guest question selection + asked toggle"
```

---

## Task 10: Session-notes actions + Note tab

**Files:**
- Create: `src/actions/podcast-session-notes.ts`
- Create: `src/actions/podcast-hot-topic.ts` (minimal upsert for promotion)
- Create: `src/actions/podcast-glossary.ts` (minimal upsert for promotion)
- Modify: `src/components/podcast/guest-drawer.tsx`

- [ ] **Step 1: session-notes action**

```typescript
// src/actions/podcast-session-notes.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const UpsertSchema = z.object({
  guest_id: z.string().uuid(),
  duration_min: z.number().int().nullable().optional(),
  key_insights: z.string().nullable().optional(),
  new_terms: z.array(z.string()).optional(),
  new_hot_topics: z.array(z.string()).optional(),
  referrals: z.string().nullable().optional(),
  quote_highlight: z.string().nullable().optional(),
  energizzo_opportunity: z.string().nullable().optional(),
});

export async function upsertSessionNotes(input: unknown) {
  const parsed = UpsertSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("podcast_session_notes")
    .upsert(
      {
        guest_id: parsed.guest_id,
        duration_min: parsed.duration_min ?? null,
        key_insights: parsed.key_insights ?? null,
        new_terms: parsed.new_terms ?? [],
        new_hot_topics: parsed.new_hot_topics ?? [],
        referrals: parsed.referrals ?? null,
        quote_highlight: parsed.quote_highlight ?? null,
        energizzo_opportunity: parsed.energizzo_opportunity ?? null,
      },
      { onConflict: "guest_id" },
    );
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/dashboard/podcast/ospiti/${parsed.guest_id}`);
  return { ok: true as const };
}
```

- [ ] **Step 2: hot-topic action (for promotion button)**

```typescript
// src/actions/podcast-hot-topic.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { HOT_TOPIC_INTENSITIES } from "@/lib/podcast-config";

const intensityEnum = z.enum(HOT_TOPIC_INTENSITIES as unknown as [string, ...string[]]);

const CreateSchema = z.object({
  title: z.string().min(1),
  body: z.string().nullable().optional(),
  intensity: intensityEnum.default("medio"),
  suggested_questions: z.array(z.string()).default([]),
});

export async function createHotTopic(input: unknown) {
  const parsed = CreateSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("podcast_hot_topics").insert(parsed);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/podcast/temi-caldi");
  return { ok: true as const };
}

const UpdateSchema = z.object({
  id: z.string().uuid(),
  patch: z.object({
    title: z.string().min(1).optional(),
    body: z.string().nullable().optional(),
    intensity: intensityEnum.optional(),
    suggested_questions: z.array(z.string()).optional(),
    active: z.boolean().optional(),
  }),
});

export async function updateHotTopic(input: unknown) {
  const parsed = UpdateSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("podcast_hot_topics").update(parsed.patch).eq("id", parsed.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/podcast/temi-caldi");
  return { ok: true as const };
}
```

- [ ] **Step 3: glossary action**

```typescript
// src/actions/podcast-glossary.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { GLOSSARY_CATEGORIES } from "@/lib/podcast-config";

const catEnum = z.enum(GLOSSARY_CATEGORIES as unknown as [string, ...string[]]);

const UpsertSchema = z.object({
  term: z.string().min(1),
  category: catEnum,
  definition: z.string().min(1),
});

export async function upsertTerm(input: unknown) {
  const parsed = UpsertSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("podcast_glossary").upsert(parsed, { onConflict: "term" });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/podcast/glossario");
  return { ok: true as const };
}

const UpdateSchema = z.object({
  id: z.string().uuid(),
  patch: z.object({
    term: z.string().min(1).optional(),
    category: catEnum.optional(),
    definition: z.string().min(1).optional(),
  }),
});

export async function updateTerm(input: unknown) {
  const parsed = UpdateSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("podcast_glossary").update(parsed.patch).eq("id", parsed.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/podcast/glossario");
  return { ok: true as const };
}

const DeleteSchema = z.object({ id: z.string().uuid() });

export async function deleteTerm(input: unknown) {
  const parsed = DeleteSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("podcast_glossary").delete().eq("id", parsed.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/podcast/glossario");
  return { ok: true as const };
}
```

- [ ] **Step 4: Wire Note tab in drawer**

In `guest-drawer.tsx`, replace the `tab === "note"` placeholder block with:

```typescript
{tab === "note" && <NoteTab guestId={guest.id} notes={notes} />}
```

Add `NoteTab` at bottom of file:

```typescript
import { upsertSessionNotes } from "@/actions/podcast-session-notes";
import { createHotTopic } from "@/actions/podcast-hot-topic";
import { upsertTerm } from "@/actions/podcast-glossary";
import { GLOSSARY_CATEGORIES, GLOSSARY_CATEGORY_LABEL, HOT_TOPIC_INTENSITIES, HOT_TOPIC_INTENSITY_CONFIG } from "@/lib/podcast-config";
import { Sparkles } from "lucide-react";

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
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {value.map((t, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-primary/20 text-primary px-2 py-0.5 text-xs"
          >
            {t}
            <button onClick={() => onChange(value.filter((_, j) => j !== i))} className="hover:text-foreground">
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

function NoteTab({ guestId, notes }: { guestId: string; notes: PodcastSessionNotes | null }) {
  const [form, setForm] = useState<PodcastSessionNotes>(() =>
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
            onChange={(e) => setForm((f) => ({ ...f, duration_min: e.target.value ? Number(e.target.value) : null }))}
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
            onChange={(e) => setForm((f) => ({ ...f, energizzo_opportunity: e.target.value }))}
            rows={2}
            className="w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10 mt-1"
          />
        </label>
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <button
              disabled={form.new_terms.length === 0}
              onClick={() => setPromoteTermOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 disabled:opacity-40"
            >
              <Sparkles className="h-3 w-3" /> Promuovi termini a Glossario
            </button>
            <button
              disabled={form.new_hot_topics.length === 0}
              onClick={() => setPromoteTopicOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 disabled:opacity-40"
            >
              <Sparkles className="h-3 w-3" /> Promuovi temi caldi
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
  const [rows, setRows] = useState<{ term: string; category: string; definition: string }[]>(
    terms.map((t) => ({ term: t, category: "regolatore", definition: "" })),
  );

  async function confirm() {
    for (const r of rows) {
      if (!r.term.trim() || !r.definition.trim()) continue;
      await upsertTerm({ term: r.term.trim(), category: r.category, definition: r.definition.trim() });
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
                onChange={(e) => setRows((p) => p.map((x, j) => (j === i ? { ...x, term: e.target.value } : x)))}
                className="bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
              />
              <select
                value={r.category}
                onChange={(e) => setRows((p) => p.map((x, j) => (j === i ? { ...x, category: e.target.value } : x)))}
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
                onChange={(e) => setRows((p) => p.map((x, j) => (j === i ? { ...x, definition: e.target.value } : x)))}
                rows={2}
                placeholder="Definizione…"
                className="col-span-2 bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={() => onOpenChange(false)} className="px-4 h-9 rounded-full text-sm bg-white/5">
            Annulla
          </button>
          <button onClick={confirm} className="px-4 h-9 rounded-full text-sm font-semibold bg-primary text-primary-foreground">
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
  const [rows, setRows] = useState(titles.map((t) => ({ title: t, intensity: "medio", body: "" })));

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
                onChange={(e) => setRows((p) => p.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                className="bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
              />
              <select
                value={r.intensity}
                onChange={(e) => setRows((p) => p.map((x, j) => (j === i ? { ...x, intensity: e.target.value } : x)))}
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
                onChange={(e) => setRows((p) => p.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))}
                rows={2}
                placeholder="Descrizione…"
                className="col-span-2 bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={() => onOpenChange(false)} className="px-4 h-9 rounded-full text-sm bg-white/5">
            Annulla
          </button>
          <button onClick={confirm} className="px-4 h-9 rounded-full text-sm font-semibold bg-primary text-primary-foreground">
            Conferma
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/actions/podcast-session-notes.ts src/actions/podcast-hot-topic.ts src/actions/podcast-glossary.ts src/components/podcast/guest-drawer.tsx
git commit -m "feat(podcast): session notes tab with promotion to glossary/topics"
```

---

## Task 11: Deploy phase 1 (guests end-to-end)

- [ ] **Step 1: Typecheck + build**

```bash
pnpm exec tsc --noEmit && pnpm build
```
Expected: build succeeds.

- [ ] **Step 2: Push and deploy**

```bash
git push
ssh root@89.167.3.74 "cd /root/energizzo.unvrslabs.dev && git pull && pnpm install && pnpm build && pm2 restart energizzo-crm"
```

- [ ] **Step 3: Prod smoke test**

Open `https://energizzo.unvrslabs.dev/dashboard/podcast/ospiti`, create an ospite from lead CRM, move across kanban, edit notes. Report back.

---

## Task 12: Banca domande standalone page

**Files:**
- Create: `src/app/dashboard/podcast/domande/page.tsx`
- Create: `src/components/podcast/question-bank.tsx`

- [ ] **Step 1: Server page**

```typescript
// src/app/dashboard/podcast/domande/page.tsx
import { createClient } from "@/lib/supabase/server";
import { QuestionBank } from "@/components/podcast/question-bank";
import type { PodcastQuestion } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DomandePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("podcast_questions")
    .select("*")
    .eq("archived", false)
    .order("theme")
    .order("order_idx");
  return <QuestionBank questions={(data ?? []) as PodcastQuestion[]} />;
}
```

- [ ] **Step 2: Client component**

```typescript
// src/components/podcast/question-bank.tsx
"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Archive } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createQuestion, updateQuestion } from "@/actions/podcast-question";
import {
  QUESTION_THEMES,
  QUESTION_THEME_LABEL,
  QUESTION_PHASES,
  type QuestionPhase,
  type QuestionTheme,
} from "@/lib/podcast-config";
import type { PodcastQuestion } from "@/lib/types";

export function QuestionBank({ questions }: { questions: PodcastQuestion[] }) {
  const [activeTheme, setActiveTheme] = useState<QuestionTheme>("margini");
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return questions.filter(
      (x) => x.theme === activeTheme && (!needle || x.body.toLowerCase().includes(needle)),
    );
  }, [questions, activeTheme, q]);

  const byPhase = (p: QuestionPhase) => filtered.filter((x) => x.phase === p);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl tracking-wide">Banca domande</h1>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-full px-4 h-9 text-sm font-semibold bg-primary text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Nuova domanda
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUESTION_THEMES.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTheme(t)}
            className={`px-3 h-8 rounded-full text-xs font-semibold ${
              activeTheme === t ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground"
            }`}
          >
            {QUESTION_THEME_LABEL[t]}
          </button>
        ))}
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cerca nel testo delle domande…"
        className="w-full bg-white/5 rounded-lg px-4 py-2 text-sm outline-none border border-white/10"
      />

      <div className="grid md:grid-cols-2 gap-4">
        {QUESTION_PHASES.map((phase) => (
          <div key={phase} className="liquid-glass rounded-2xl p-4 space-y-2">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground">{phase}</h2>
            <div className="space-y-1">
              {byPhase(phase).map((qn) => (
                <div key={qn.id} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground">•</span>
                  <span className="flex-1">{qn.body}</span>
                  <button
                    onClick={async () => {
                      const r = await updateQuestion({ id: qn.id, patch: { archived: true } });
                      if (!r.ok) toast.error(r.error ?? "Errore");
                      else toast.success("Archiviata");
                    }}
                    className="text-muted-foreground hover:text-destructive"
                    title="Archivia"
                  >
                    <Archive className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {byPhase(phase).length === 0 && (
                <div className="text-xs text-muted-foreground italic">Nessuna domanda.</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <AddQuestionDialog open={addOpen} onOpenChange={setAddOpen} defaultTheme={activeTheme} />
    </div>
  );
}

function AddQuestionDialog({
  open,
  onOpenChange,
  defaultTheme,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultTheme: QuestionTheme;
}) {
  const [theme, setTheme] = useState<QuestionTheme>(defaultTheme);
  const [phase, setPhase] = useState<QuestionPhase>("approfondimento");
  const [body, setBody] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    const r = await createQuestion({ theme, phase, body: body.trim() });
    if (!r.ok) {
      toast.error(r.error ?? "Errore");
      return;
    }
    toast.success("Domanda creata");
    setBody("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuova domanda</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as QuestionTheme)}
              className="bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
            >
              {QUESTION_THEMES.map((t) => (
                <option key={t} value={t}>
                  {QUESTION_THEME_LABEL[t]}
                </option>
              ))}
            </select>
            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value as QuestionPhase)}
              className="bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
            >
              {QUESTION_PHASES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Testo della domanda…"
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => onOpenChange(false)} className="px-4 h-9 rounded-full text-sm bg-white/5">
              Annulla
            </button>
            <button type="submit" className="px-4 h-9 rounded-full text-sm font-semibold bg-primary text-primary-foreground">
              Crea
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/podcast/domande src/components/podcast/question-bank.tsx
git commit -m "feat(podcast): banca domande page (filtri tema/fase + CRUD)"
```

---

## Task 13: Temi caldi page

**Files:**
- Create: `src/app/dashboard/podcast/temi-caldi/page.tsx`
- Create: `src/components/podcast/hot-topics-board.tsx`

- [ ] **Step 1: Server page**

```typescript
// src/app/dashboard/podcast/temi-caldi/page.tsx
import { createClient } from "@/lib/supabase/server";
import { HotTopicsBoard } from "@/components/podcast/hot-topics-board";
import type { PodcastHotTopic } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TemiCaldiPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("podcast_hot_topics")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });
  return <HotTopicsBoard topics={(data ?? []) as PodcastHotTopic[]} />;
}
```

- [ ] **Step 2: Client board**

```typescript
// src/components/podcast/hot-topics-board.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Archive } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createHotTopic, updateHotTopic } from "@/actions/podcast-hot-topic";
import {
  HOT_TOPIC_INTENSITIES,
  HOT_TOPIC_INTENSITY_CONFIG,
  type HotTopicIntensity,
} from "@/lib/podcast-config";
import type { PodcastHotTopic } from "@/lib/types";

export function HotTopicsBoard({ topics }: { topics: PodcastHotTopic[] }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<PodcastHotTopic | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl tracking-wide">Temi caldi</h1>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-full px-4 h-9 text-sm font-semibold bg-primary text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Nuovo tema
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {HOT_TOPIC_INTENSITIES.map((intensity) => {
          const list = topics.filter((t) => t.intensity === intensity);
          const cfg = HOT_TOPIC_INTENSITY_CONFIG[intensity];
          return (
            <div key={intensity} className="space-y-3">
              <div className="text-sm font-semibold">
                {cfg.emoji} {cfg.label} · {list.length}
              </div>
              {list.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setEditing(t)}
                  className="block w-full text-left liquid-glass rounded-2xl p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="text-sm font-semibold">{t.title}</div>
                  {t.body && <div className="text-xs text-muted-foreground mt-1 line-clamp-3">{t.body}</div>}
                  {t.suggested_questions.length > 0 && (
                    <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t.suggested_questions.length} domande suggerite
                    </div>
                  )}
                </button>
              ))}
              {list.length === 0 && (
                <div className="text-xs text-muted-foreground italic p-4">Nessun tema.</div>
              )}
            </div>
          );
        })}
      </div>

      <TopicDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        initial={null}
      />
      <TopicDialog
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        initial={editing}
      />
    </div>
  );
}

function TopicDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: PodcastHotTopic | null;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [intensity, setIntensity] = useState<HotTopicIntensity>(initial?.intensity ?? "medio");
  const [suggested, setSuggested] = useState(initial?.suggested_questions.join("\n") ?? "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const suggestedArr = suggested.split("\n").map((s) => s.trim()).filter(Boolean);
    if (initial) {
      const r = await updateHotTopic({
        id: initial.id,
        patch: { title: title.trim(), body: body || null, intensity, suggested_questions: suggestedArr },
      });
      if (!r.ok) toast.error(r.error ?? "Errore");
      else toast.success("Aggiornato");
    } else {
      const r = await createHotTopic({
        title: title.trim(),
        body: body || null,
        intensity,
        suggested_questions: suggestedArr,
      });
      if (!r.ok) toast.error(r.error ?? "Errore");
      else toast.success("Creato");
    }
    onOpenChange(false);
  }

  async function archive() {
    if (!initial) return;
    const r = await updateHotTopic({ id: initial.id, patch: { active: false } });
    if (!r.ok) toast.error(r.error ?? "Errore");
    else {
      toast.success("Archiviato");
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Modifica tema" : "Nuovo tema"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titolo"
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
          />
          <select
            value={intensity}
            onChange={(e) => setIntensity(e.target.value as HotTopicIntensity)}
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
          >
            {HOT_TOPIC_INTENSITIES.map((i) => (
              <option key={i} value={i}>
                {HOT_TOPIC_INTENSITY_CONFIG[i].emoji} {HOT_TOPIC_INTENSITY_CONFIG[i].label}
              </option>
            ))}
          </select>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Descrizione…"
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
          />
          <textarea
            value={suggested}
            onChange={(e) => setSuggested(e.target.value)}
            rows={4}
            placeholder="Domande suggerite, una per riga…"
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
          />
          <div className="flex justify-between pt-2">
            {initial && (
              <button type="button" onClick={archive} className="inline-flex items-center gap-1.5 text-xs text-destructive">
                <Archive className="h-3 w-3" /> Archivia
              </button>
            )}
            <div className="ml-auto flex gap-2">
              <button type="button" onClick={() => onOpenChange(false)} className="px-4 h-9 rounded-full text-sm bg-white/5">
                Annulla
              </button>
              <button type="submit" className="px-4 h-9 rounded-full text-sm font-semibold bg-primary text-primary-foreground">
                Salva
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/podcast/temi-caldi src/components/podcast/hot-topics-board.tsx
git commit -m "feat(podcast): temi caldi board (3 intensità, edit inline)"
```

---

## Task 14: Glossario page with live mode

**Files:**
- Create: `src/app/dashboard/podcast/glossario/page.tsx`
- Create: `src/components/podcast/glossary-view.tsx`

- [ ] **Step 1: Server page**

```typescript
// src/app/dashboard/podcast/glossario/page.tsx
import { createClient } from "@/lib/supabase/server";
import { GlossaryView } from "@/components/podcast/glossary-view";
import type { PodcastGlossaryTerm } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function GlossarioPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("podcast_glossary").select("*").order("term");
  return <GlossaryView terms={(data ?? []) as PodcastGlossaryTerm[]} />;
}
```

- [ ] **Step 2: Client view**

```typescript
// src/components/podcast/glossary-view.tsx
"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Radio, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { upsertTerm, updateTerm, deleteTerm } from "@/actions/podcast-glossary";
import {
  GLOSSARY_CATEGORIES,
  GLOSSARY_CATEGORY_LABEL,
  type GlossaryCategory,
} from "@/lib/podcast-config";
import type { PodcastGlossaryTerm } from "@/lib/types";

export function GlossaryView({ terms }: { terms: PodcastGlossaryTerm[] }) {
  const [q, setQ] = useState("");
  const [cats, setCats] = useState<Set<GlossaryCategory>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(terms[0]?.id ?? null);
  const [live, setLive] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return terms.filter((t) => {
      if (cats.size > 0 && !cats.has(t.category)) return false;
      if (!needle) return true;
      return t.term.toLowerCase().includes(needle) || t.definition.toLowerCase().includes(needle);
    });
  }, [terms, q, cats]);

  const selected = terms.find((t) => t.id === selectedId) ?? filtered[0] ?? null;

  return (
    <div className={live ? "fixed inset-0 z-50 bg-background p-4" : "space-y-4"}>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl tracking-wide">Glossario</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLive((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-full px-3 h-9 text-xs font-semibold ${
              live ? "bg-destructive text-destructive-foreground" : "bg-white/5"
            }`}
          >
            <Radio className="h-3.5 w-3.5" /> {live ? "Esci live" : "Modalità live"}
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-full px-4 h-9 text-sm font-semibold bg-primary text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Nuovo
          </button>
        </div>
      </div>

      <input
        autoFocus={live}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cerca termine o definizione…"
        className="w-full bg-white/5 rounded-lg px-4 py-3 text-lg outline-none border border-white/10"
      />

      {!live && (
        <div className="flex flex-wrap gap-2">
          {GLOSSARY_CATEGORIES.map((c) => {
            const on = cats.has(c);
            return (
              <button
                key={c}
                onClick={() =>
                  setCats((p) => {
                    const n = new Set(p);
                    on ? n.delete(c) : n.add(c);
                    return n;
                  })
                }
                className={`px-3 h-7 rounded-full text-xs ${
                  on ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground"
                }`}
              >
                {GLOSSARY_CATEGORY_LABEL[c]}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid md:grid-cols-[320px_1fr] gap-4">
        <div className="liquid-glass rounded-2xl p-2 max-h-[60vh] overflow-auto">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm ${
                selectedId === t.id ? "bg-primary/20 text-primary" : "hover:bg-white/5"
              }`}
            >
              <div className="font-semibold">{t.term}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {GLOSSARY_CATEGORY_LABEL[t.category]}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-6">Nessun termine.</div>
          )}
        </div>

        <div className="liquid-glass rounded-2xl p-5">
          {selected ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-xl">{selected.term}</h2>
                {!live && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditOpen(true)}
                      className="text-xs text-primary"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Eliminare "${selected.term}"?`)) return;
                        const r = await deleteTerm({ id: selected.id });
                        if (!r.ok) toast.error(r.error ?? "Errore");
                        else toast.success("Eliminato");
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                {GLOSSARY_CATEGORY_LABEL[selected.category]}
              </div>
              <div className="text-sm whitespace-pre-wrap">{selected.definition}</div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">Seleziona un termine.</div>
          )}
        </div>
      </div>

      <TermDialog open={addOpen} onOpenChange={setAddOpen} initial={null} />
      {selected && (
        <TermDialog open={editOpen} onOpenChange={setEditOpen} initial={selected} />
      )}
    </div>
  );
}

function TermDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: PodcastGlossaryTerm | null;
}) {
  const [term, setTerm] = useState(initial?.term ?? "");
  const [category, setCategory] = useState<GlossaryCategory>(initial?.category ?? "regolatore");
  const [definition, setDefinition] = useState(initial?.definition ?? "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!term.trim() || !definition.trim()) return;
    const r = initial
      ? await updateTerm({ id: initial.id, patch: { term: term.trim(), category, definition: definition.trim() } })
      : await upsertTerm({ term: term.trim(), category, definition: definition.trim() });
    if (!r.ok) {
      toast.error(r.error ?? "Errore");
      return;
    }
    toast.success(initial ? "Aggiornato" : "Creato");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Modifica termine" : "Nuovo termine"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Termine (es. TIVG)"
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as GlossaryCategory)}
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
          >
            {GLOSSARY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {GLOSSARY_CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
          <textarea
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            rows={5}
            placeholder="Definizione…"
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => onOpenChange(false)} className="px-4 h-9 rounded-full text-sm bg-white/5">
              Annulla
            </button>
            <button type="submit" className="px-4 h-9 rounded-full text-sm font-semibold bg-primary text-primary-foreground">
              Salva
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/podcast/glossario src/components/podcast/glossary-view.tsx
git commit -m "feat(podcast): glossario con search, categorie, modalità live"
```

---

## Task 15: Seed script + content files

**Files:**
- Create: `content/podcast/_source_raw.md` (copy the user-supplied KB into repo)
- Create: `content/podcast/01-testi-integrati.md` through `content/podcast/09-mappa-decisori.md` (split from source)
- Create: `scripts/seed_podcast.ts`

- [ ] **Step 1: Save raw knowledge base**

User must paste the knowledge base into `content/podcast/_source_raw.md`. If the original file is lost, the canonical copy is referenced in the spec commit `8a69ae2` prompt history. For now:

```bash
touch content/podcast/_source_raw.md
```

Then the user opens the file and pastes the full 15k-word markdown (the one originally shared). Commit it.

```bash
git add content/podcast/_source_raw.md
git commit -m "content(podcast): add raw knowledge base source file"
```

- [ ] **Step 2: Write seed script**

`scripts/seed_podcast.ts`:

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !service) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, service);

const ROOT = join(process.cwd(), "content/podcast");
const raw = readFileSync(join(ROOT, "_source_raw.md"), "utf-8");

// 1) Split sections into individual .md files
function splitBySection(source: string): Record<string, string> {
  // Matches "# SEZIONE N — Title" (em-dash or hyphen)
  const parts = source.split(/^# SEZIONE \d+\s*[—-]\s*/gm);
  // first element is the preamble before §1, discard
  const headings = source.match(/^# SEZIONE \d+\s*[—-]\s*.*$/gm) ?? [];
  const result: Record<string, string> = {};
  headings.forEach((h, i) => {
    const body = parts[i + 1] ?? "";
    const titleMatch = h.match(/^# SEZIONE (\d+)\s*[—-]\s*(.*)$/);
    if (!titleMatch) return;
    const num = titleMatch[1].padStart(2, "0");
    const slug = titleMatch[2]
      .toLowerCase()
      .replace(/[àáâã]/g, "a")
      .replace(/[èéê]/g, "e")
      .replace(/[ìí]/g, "i")
      .replace(/[òóô]/g, "o")
      .replace(/[ùú]/g, "u")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const filename = `${num}-${slug}.md`;
    result[filename] = `# ${titleMatch[2]}\n\n${body.trim()}`;
  });
  return result;
}

function writeSectionFiles() {
  const files = splitBySection(raw);
  for (const [name, content] of Object.entries(files)) {
    const path = join(ROOT, name);
    writeFileSync(path, content);
    console.log(`Wrote ${name} (${content.length} chars)`);
  }
}

// 2) Parse glossary (§6) — lines like "**TERM** — definition"
type GlosRow = { term: string; category: string; definition: string };
function parseGlossary(source: string): GlosRow[] {
  const sec = source.split(/^# SEZIONE 6\s*[—-]/m)[1]?.split(/^# SEZIONE/m)[0] ?? "";
  const rows: GlosRow[] = [];
  let currentCategory = "regolatore";
  const catMap: Record<string, string> = {
    "regolatore e istituzioni": "regolatore",
    "i testi integrati": "testi_integrati",
    "tipi di servizio": "servizi",
    "componenti di prezzo": "prezzo",
    "processi operativi": "processi",
    "segmenti di clientela": "segmenti",
    "evoluzioni in corso": "evoluzioni",
  };
  for (const line of sec.split("\n")) {
    const catMatch = line.match(/^##\s+(.+?)\s*$/);
    if (catMatch) {
      const key = catMatch[1].toLowerCase();
      for (const [needle, cat] of Object.entries(catMap)) {
        if (key.includes(needle)) currentCategory = cat;
      }
      continue;
    }
    const termMatch = line.match(/^\*\*(.+?)\*\*\s*[—-]\s*(.+)$/);
    if (termMatch) {
      rows.push({ term: termMatch[1].trim(), category: currentCategory, definition: termMatch[2].trim() });
    }
  }
  return rows;
}

// 3) Parse questions (§7) — look for numbered list items under "### Apertura/Approfondimento/Chiusura"
type QRow = { theme: string; phase: string; body: string };
function parseQuestions(source: string): QRow[] {
  const sec = source.split(/^# SEZIONE 7\s*[—-]/m)[1]?.split(/^# SEZIONE/m)[0] ?? "";
  const themeMap: Record<string, string> = {
    margini: "margini",
    switching: "switching",
    "regole arera": "arera",
    "ai, digitalizzazione": "ai",
    "m&a": "m_a",
    people: "people",
    trasversali: "trasversale",
    trasversale: "trasversale",
  };
  const phaseMap: Record<string, string> = {
    apertura: "apertura",
    approfondimento: "approfondimento",
    "chiusura trasversale": "chiusura",
    chiusura: "chiusura",
    "trappole da evitare": "trappola",
  };
  const rows: QRow[] = [];
  let currentTheme = "trasversale";
  let currentPhase = "approfondimento";
  for (const line of sec.split("\n")) {
    const h2 = line.match(/^##\s+TEMA\s+\d+\s*[—-]\s*(.+?)\s*$/i);
    if (h2) {
      const key = h2[1].toLowerCase();
      for (const [needle, th] of Object.entries(themeMap)) {
        if (key.includes(needle)) currentTheme = th;
      }
      continue;
    }
    const h3 = line.match(/^###\s+(.+?)\s*$/);
    if (h3) {
      const key = h3[1].toLowerCase();
      for (const [needle, ph] of Object.entries(phaseMap)) {
        if (key.includes(needle)) currentPhase = ph;
      }
      continue;
    }
    const q = line.match(/^\d+\.\s+(.+)$/);
    if (q) {
      const body = q[1].replace(/^["“]|["”]$/g, "").trim();
      if (body.length > 15) rows.push({ theme: currentTheme, phase: currentPhase, body });
    }
  }
  return rows;
}

// 4) Parse hot topics (§8)
type HotRow = { title: string; body: string; intensity: string };
function parseHotTopics(source: string): HotRow[] {
  const sec = source.split(/^# SEZIONE 8\s*[—-]/m)[1]?.split(/^# SEZIONE/m)[0] ?? "";
  const rows: HotRow[] = [];
  let intensity = "medio";
  const intensityMap: Array<[RegExp, string]> = [
    [/BOLLENTI/i, "bollente"],
    [/MEDIA INTENSITÀ/i, "medio"],
    [/FREDDI/i, "freddo"],
  ];
  const blocks = sec.split(/^###\s+\d+\.\s+/m);
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    // update intensity if the preceding header changed
    for (const [rx, v] of intensityMap) {
      if (rx.test(b)) intensity = v;
    }
    const firstLineMatch = b.match(/^(.+?)\n([\s\S]*?)(?=\n###|$)/);
    if (!firstLineMatch || i === 0) continue;
    const title = firstLineMatch[1].trim();
    const body = firstLineMatch[2].trim().slice(0, 500);
    if (title.length > 2 && title.length < 200) rows.push({ title, body, intensity });
  }
  return rows;
}

async function main() {
  console.log("1) Splitting sections to files…");
  mkdirSync(ROOT, { recursive: true });
  writeSectionFiles();

  console.log("2) Upserting glossary…");
  const glossary = parseGlossary(raw);
  console.log(`  Found ${glossary.length} terms`);
  if (glossary.length) {
    const { error } = await supabase.from("podcast_glossary").upsert(glossary, { onConflict: "term" });
    if (error) console.error("  glossary error:", error.message);
  }

  console.log("3) Upserting questions…");
  const questions = parseQuestions(raw);
  console.log(`  Found ${questions.length} questions`);
  if (questions.length) {
    // dedupe by body (DB has no unique on body, so we check first)
    const { data: existing } = await supabase.from("podcast_questions").select("body");
    const existSet = new Set((existing ?? []).map((x: any) => x.body));
    const fresh = questions.filter((q) => !existSet.has(q.body));
    if (fresh.length) {
      const { error } = await supabase.from("podcast_questions").insert(fresh);
      if (error) console.error("  questions error:", error.message);
      console.log(`  inserted ${fresh.length} new questions`);
    } else {
      console.log("  all questions already present");
    }
  }

  console.log("4) Upserting hot topics…");
  const topics = parseHotTopics(raw);
  console.log(`  Found ${topics.length} topics`);
  if (topics.length) {
    const { data: existing } = await supabase.from("podcast_hot_topics").select("title");
    const existSet = new Set((existing ?? []).map((x: any) => x.title));
    const fresh = topics.filter((t) => !existSet.has(t.title));
    if (fresh.length) {
      const { error } = await supabase.from("podcast_hot_topics").insert(fresh);
      if (error) console.error("  topics error:", error.message);
      console.log(`  inserted ${fresh.length} new topics`);
    } else {
      console.log("  all topics already present");
    }
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 3: Add npm script**

In `package.json` scripts add:

```json
"seed:podcast": "tsx scripts/seed_podcast.ts"
```

- [ ] **Step 4: Set SUPABASE_SERVICE_ROLE_KEY in .env.local**

Manual step — copy from Supabase dashboard `Settings → API → service_role` (secret). Save to `.env.local`:

```
SUPABASE_SERVICE_ROLE_KEY=<key>
```

This file is already in `.gitignore`.

- [ ] **Step 5: Run seed**

```bash
pnpm seed:podcast
```
Expected output: wrote section files, upserted terms/questions/topics counts.

- [ ] **Step 6: Review split MD files, cleanup if ugly**

Open `content/podcast/0*.md`. If any section is mangled by the split regex, fix manually. Commit what you want kept.

- [ ] **Step 7: Verify in UI**

Open `/dashboard/podcast/domande`, `/glossario`, `/temi-caldi` — content visible.

- [ ] **Step 8: Commit**

```bash
git add scripts/seed_podcast.ts package.json content/podcast/
git commit -m "feat(podcast): seed script + content MD files from KB source"
```

---

## Task 16: Knowledge viewer (markdown render)

**Files:**
- Create: `src/app/dashboard/podcast/knowledge/page.tsx`
- Create: `src/app/dashboard/podcast/knowledge/[slug]/page.tsx`
- Create: `src/components/podcast/knowledge-renderer.tsx`
- Create: `src/lib/podcast-content.ts` (helper to load MD files)

- [ ] **Step 1: Content loader helper**

```typescript
// src/lib/podcast-content.ts
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "content/podcast");

export type KnowledgeDoc = { slug: string; title: string; body: string };

export function listDocs(): { slug: string; title: string }[] {
  return readdirSync(DIR)
    .filter((f) => /^\d{2}-.+\.md$/.test(f) && !f.startsWith("_"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const content = readFileSync(join(DIR, f), "utf-8");
      const titleLine = content.split("\n").find((l) => l.startsWith("# "));
      const title = titleLine?.replace(/^#\s*/, "") ?? slug;
      return { slug, title };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function loadDoc(slug: string): KnowledgeDoc | null {
  const safe = slug.replace(/[^a-z0-9-]/g, "");
  const path = join(DIR, `${safe}.md`);
  try {
    const body = readFileSync(path, "utf-8");
    const titleLine = body.split("\n").find((l) => l.startsWith("# "));
    return { slug: safe, title: titleLine?.replace(/^#\s*/, "") ?? safe, body };
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Knowledge renderer component**

```typescript
// src/components/podcast/knowledge-renderer.tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function KnowledgeRenderer({ body }: { body: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-a:text-primary prose-table:text-xs">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
    </div>
  );
}
```

- [ ] **Step 3: Index page with TOC**

```typescript
// src/app/dashboard/podcast/knowledge/page.tsx
import Link from "next/link";
import { listDocs } from "@/lib/podcast-content";

export const dynamic = "force-static";

export default function KnowledgeIndex() {
  const docs = listDocs();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl tracking-wide">Knowledge base regolatoria</h1>
      <div className="liquid-glass rounded-2xl p-5 space-y-2">
        {docs.map((d) => (
          <Link
            key={d.slug}
            href={`/dashboard/podcast/knowledge/${d.slug}`}
            className="block rounded-lg px-3 py-2 hover:bg-white/5"
          >
            <span className="text-sm font-semibold">{d.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Slug page**

```typescript
// src/app/dashboard/podcast/knowledge/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { loadDoc, listDocs } from "@/lib/podcast-content";
import { KnowledgeRenderer } from "@/components/podcast/knowledge-renderer";

export const dynamic = "force-static";

export function generateStaticParams() {
  return listDocs().map((d) => ({ slug: d.slug }));
}

export default async function KnowledgeDocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = loadDoc(slug);
  if (!doc) notFound();
  return (
    <div className="space-y-4">
      <Link href="/dashboard/podcast/knowledge" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Knowledge
      </Link>
      <div className="liquid-glass rounded-2xl p-6">
        <KnowledgeRenderer body={doc.body} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Install @tailwindcss/typography if not present**

```bash
pnpm add -D @tailwindcss/typography
```

Add to `tailwind.config.ts` plugins array:

```typescript
import typography from "@tailwindcss/typography";
// ...
plugins: [typography],
```

- [ ] **Step 6: Smoke test**

`pnpm dev` → `/dashboard/podcast/knowledge` → click one section → render verified.

- [ ] **Step 7: Commit**

```bash
git add src/app/dashboard/podcast/knowledge src/components/podcast/knowledge-renderer.tsx src/lib/podcast-content.ts package.json pnpm-lock.yaml tailwind.config.ts
git commit -m "feat(podcast): knowledge viewer with markdown render"
```

---

## Task 17: Home dashboard

**Files:**
- Replace: `src/app/dashboard/podcast/page.tsx`
- Create: `src/components/podcast/podcast-home.tsx`

- [ ] **Step 1: Server page**

```typescript
// src/app/dashboard/podcast/page.tsx
import { createClient } from "@/lib/supabase/server";
import { PodcastHome } from "@/components/podcast/podcast-home";
import type { PodcastGuest, PodcastHotTopic, PodcastGuestQuestion } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PodcastHomePage() {
  const supabase = await createClient();

  const [{ data: guestsAll }, { data: topTopics }, { data: nextGuestRows }] = await Promise.all([
    supabase.from("podcast_guests").select("status"),
    supabase
      .from("podcast_hot_topics")
      .select("*")
      .eq("active", true)
      .eq("intensity", "bollente")
      .limit(3),
    supabase
      .from("podcast_guests")
      .select(`*, lead:leads(ragione_sociale, piva)`)
      .eq("status", "confirmed")
      .not("recorded_at", "is", null)
      .order("recorded_at", { ascending: true })
      .limit(1),
  ]);

  const next = (nextGuestRows?.[0] ?? null) as PodcastGuest | null;
  let nextQuestions: PodcastGuestQuestion[] = [];
  if (next) {
    const { data: gq } = await supabase
      .from("podcast_guest_questions")
      .select(`*, question:podcast_questions(*)`)
      .eq("guest_id", next.id)
      .order("order_idx")
      .limit(10);
    nextQuestions = (gq ?? []) as PodcastGuestQuestion[];
  }

  const stats = {
    total: guestsAll?.length ?? 0,
    invited: guestsAll?.filter((g: any) => g.status === "invited").length ?? 0,
    confirmed: guestsAll?.filter((g: any) => g.status === "confirmed").length ?? 0,
    published: guestsAll?.filter((g: any) => g.status === "published").length ?? 0,
  };

  return (
    <PodcastHome
      stats={stats}
      nextGuest={next}
      nextQuestions={nextQuestions}
      hotTopics={(topTopics ?? []) as PodcastHotTopic[]}
    />
  );
}
```

- [ ] **Step 2: Client home**

```typescript
// src/components/podcast/podcast-home.tsx
"use client";

import Link from "next/link";
import { Users2, MailCheck, CalendarCheck2, Podcast, ArrowRight, Flame } from "lucide-react";
import type { PodcastGuest, PodcastHotTopic, PodcastGuestQuestion } from "@/lib/types";

type Stats = { total: number; invited: number; confirmed: number; published: number };

export function PodcastHome({
  stats,
  nextGuest,
  nextQuestions,
  hotTopics,
}: {
  stats: Stats;
  nextGuest: PodcastGuest | null;
  nextQuestions: PodcastGuestQuestion[];
  hotTopics: PodcastHotTopic[];
}) {
  const items = [
    { label: "Totale ospiti", value: stats.total, icon: Users2 },
    { label: "Invitati", value: stats.invited, icon: MailCheck },
    { label: "Confermati", value: stats.confirmed, icon: CalendarCheck2 },
    { label: "Pubblicati", value: stats.published, icon: Podcast },
  ];

  const nextName =
    nextGuest?.lead?.ragione_sociale ?? nextGuest?.external_company ?? nextGuest?.external_name ?? null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((it) => (
          <div key={it.label} className="liquid-glass rounded-[1.5rem] p-5 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                  {it.label}
                </p>
                <p className="mt-1.5 text-4xl font-black tabular-nums">{it.value}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/10">
                <it.icon className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="liquid-glass rounded-2xl p-5">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Prossima intervista</h2>
          {nextGuest ? (
            <div className="mt-2">
              <div className="font-display text-xl">{nextName ?? "—"}</div>
              {nextGuest.recorded_at && (
                <div className="text-sm text-muted-foreground mt-1">
                  {new Date(nextGuest.recorded_at).toLocaleString("it-IT", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </div>
              )}
              <Link
                href={`/dashboard/podcast/ospiti/${nextGuest.id}`}
                className="inline-flex items-center gap-1 text-sm text-primary mt-3"
              >
                Apri briefing <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              Nessun ospite confermato con data registrazione futura.
            </p>
          )}
        </div>

        <div className="liquid-glass rounded-2xl p-5">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-orange-400" /> Temi bollenti
          </h2>
          {hotTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-2">Nessun tema bollente attivo.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {hotTopics.map((t) => (
                <Link
                  key={t.id}
                  href="/dashboard/podcast/temi-caldi"
                  className="block rounded-lg px-3 py-2 hover:bg-white/5"
                >
                  <div className="text-sm font-semibold">{t.title}</div>
                  {t.body && <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{t.body}</div>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {nextGuest && nextQuestions.length > 0 && (
        <div className="liquid-glass rounded-2xl p-5">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
            Briefing domande · {nextQuestions.filter((q) => q.asked).length}/{nextQuestions.length} asked
          </h2>
          <div className="mt-3 space-y-1">
            {nextQuestions.map((gq) => (
              <div key={gq.question_id} className="flex items-start gap-2 text-sm">
                <span className={gq.asked ? "text-emerald-400" : "text-muted-foreground"}>
                  {gq.asked ? "✓" : "•"}
                </span>
                <span className={gq.asked ? "line-through text-muted-foreground" : ""}>
                  {gq.question?.body}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/podcast/page.tsx src/components/podcast/podcast-home.tsx
git commit -m "feat(podcast): home dashboard with stats, next episode, briefing"
```

---

## Task 18: Final deploy + acceptance check

- [ ] **Step 1: Full typecheck + build**

```bash
pnpm exec tsc --noEmit && pnpm build
```
Expected: build succeeds.

- [ ] **Step 2: Push + deploy**

```bash
git push
ssh root@89.167.3.74 "cd /root/energizzo.unvrslabs.dev && git pull && pnpm install && pnpm build && pm2 restart energizzo-crm"
```

- [ ] **Step 3: Run production seed (one-time)**

On the VPS (SUPABASE_SERVICE_ROLE_KEY already in `.env.local`):

```bash
ssh root@89.167.3.74 "cd /root/energizzo.unvrslabs.dev && pnpm seed:podcast"
```

Verify output: terms / questions / topics counts > 0.

- [ ] **Step 4: Acceptance walkthrough (from spec §11)**

On https://energizzo.unvrslabs.dev:
1. Aggiungi ospite da lead CRM (2 click)
2. Aggiungi ospite esterno (form)
3. Drag-drop status in kanban
4. Seleziona 10 domande da banca, riordina
5. Flagga asked=true durante sessione live
6. Compila note post, promuovi termine a glossario
7. Apri glossario, cerca "TIVG" (<1s)
8. Apri Knowledge, leggi un file MD con tabelle renderizzate
9. Riesegui `pnpm seed:podcast`, verifica "all present, no duplicates"

---

## Self-Review

**Spec coverage check:**

| Spec section | Implementing task(s) |
|---|---|
| §3 routing (7 routes) | Task 3 (home), 5 (ospiti), 8 (detail), 12 (domande), 13 (temi-caldi), 14 (glossario), 16 (knowledge) |
| §4.1 podcast_guests | Task 1 schema, Task 4 actions |
| §4.2 podcast_questions | Task 1 schema, Task 9 actions |
| §4.3 podcast_guest_questions | Task 1 schema, Task 9 actions |
| §4.4 podcast_hot_topics | Task 1 schema, Task 10 actions |
| §4.5 podcast_glossary | Task 1 schema, Task 10 actions |
| §4.6 podcast_session_notes | Task 1 schema, Task 10 actions |
| §4.7 content MD files | Task 15 (seed + split) |
| §5.1 Home | Task 17 |
| §5.2 Pipeline ospiti | Task 5, 6, 7 |
| §5.3 Dettaglio ospite | Task 8, 9, 10 |
| §5.4 Banca domande | Task 12 |
| §5.5 Temi caldi | Task 13 |
| §5.6 Glossario | Task 14 |
| §5.7 Knowledge | Task 16 |
| §6 flusso settimanale | Implicit across tasks 5-10 + 17 |
| §7 content pipeline | Task 15 |
| §8 stack + riuso | All tasks use existing components |
| §11 acceptance criteria | Task 18 §4 |

No gaps.

**Placeholder scan:** No TBD/TODO/vague handling left. One explicit manual step in Task 15 Step 1 (user pastes raw KB into repo) — this is necessary because the knowledge base was provided via chat attachment, not as a file in the repo.

**Type consistency:** Verified: `GuestStatus`, `QuestionTheme`, `QuestionPhase`, `HotTopicIntensity`, `GlossaryCategory` names are used consistently across config, types, actions, and components. Server actions follow same pattern: `{ ok: true } | { ok: false, error }`.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-21-podcast-reseller.md`. Two execution options:

**1. Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration. 18 tasks across 10 phases.

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
