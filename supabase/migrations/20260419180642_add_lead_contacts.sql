-- Migration: add_lead_contacts
-- Version: 20260419180642
-- Dumped via MCP Supabase on 2026-04-23

create table public.lead_contacts (
  id              uuid primary key default gen_random_uuid(),
  lead_id         uuid not null references public.leads(id) on delete cascade,
  full_name       text not null,
  role            text,
  birth_date      date,
  birth_place     text,
  linkedin_url    text,
  source          text not null default 'openapi',
  raw             jsonb,
  created_at      timestamptz not null default now()
);
create index idx_lead_contacts_lead on public.lead_contacts(lead_id);
alter table public.lead_contacts enable row level security;
create policy "auth read contacts" on public.lead_contacts for select to authenticated using (true);
create policy "auth write contacts" on public.lead_contacts for all to authenticated using (true) with check (true);

-- Timestamp when contacts were last enriched for a lead
alter table public.leads add column if not exists contacts_enriched_at timestamptz;
alter table public.leads add column if not exists contacts_error text;;
