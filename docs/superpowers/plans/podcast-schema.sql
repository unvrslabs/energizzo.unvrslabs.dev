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
