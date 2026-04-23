-- Migration: init_energizzo_crm
-- Version: 20260419173236
-- Dumped via MCP Supabase on 2026-04-23


create type pipeline_status as enum (
  'da_contattare','primo_contatto','qualificato','call_fissata','call_effettuata',
  'demo_fissata','demo_effettuata','proposta_inviata','negoziazione',
  'chiuso_vinto','chiuso_perso','non_interessato'
);

create type tipo_servizio as enum ('Dual (Ele+Gas)','Solo Elettrico','Solo Gas');

create table public.leads (
  id                uuid primary key default gen_random_uuid(),
  ragione_sociale   text not null,
  piva              text not null unique,
  id_arera          text,
  tipo_servizio     tipo_servizio not null,
  comune            text,
  provincia         text,
  indirizzo         text,
  dominio           text,
  sito_web          text,
  email_info        text,
  email_commerciale text,
  telefoni          text,
  gruppo            text,
  natura_giuridica  text,
  settori           text,
  latitude          double precision,
  longitude         double precision,
  email             text,
  status            pipeline_status not null default 'da_contattare',
  owner_id          uuid references auth.users(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_leads_status on public.leads(status);
create index idx_leads_provincia on public.leads(provincia);
create index idx_leads_tipo on public.leads(tipo_servizio);
create index idx_leads_rs_lower on public.leads(lower(ragione_sociale));

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

create table public.notes (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references public.leads(id) on delete cascade,
  body       text not null,
  author_id  uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index idx_notes_lead_id on public.notes(lead_id, created_at desc);

create table public.activity_log (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references public.leads(id) on delete cascade,
  event_type text not null,
  from_value text,
  to_value   text,
  author_id  uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index idx_activity_lead on public.activity_log(lead_id, created_at desc);

create or replace function public.log_status_change()
returns trigger language plpgsql as $$
begin
  if new.status is distinct from old.status then
    insert into public.activity_log (lead_id, event_type, from_value, to_value, author_id)
    values (new.id, 'status_change', old.status::text, new.status::text, auth.uid());
  end if;
  if new.email is distinct from old.email then
    insert into public.activity_log (lead_id, event_type, from_value, to_value, author_id)
    values (new.id, 'email_updated', old.email, new.email, auth.uid());
  end if;
  return new;
end $$;

create trigger trg_leads_audit
  after update on public.leads
  for each row execute function public.log_status_change();

alter table public.leads enable row level security;
alter table public.notes enable row level security;
alter table public.activity_log enable row level security;

create policy "authenticated read leads" on public.leads for select to authenticated using (true);
create policy "authenticated write leads" on public.leads for update to authenticated using (true) with check (true);
create policy "authenticated read notes" on public.notes for select to authenticated using (true);
create policy "authenticated insert notes" on public.notes for insert to authenticated with check (author_id = auth.uid());
create policy "authenticated read activity" on public.activity_log for select to authenticated using (true);
;
