-- Migration: strategy_tactics
-- Version: 20260419183131
-- Dumped via MCP Supabase on 2026-04-23

create type tactic_status as enum ('da_fare', 'in_corso', 'fatto', 'archiviato');

create table public.strategy_tactics (
  id          text primary key,
  status      tactic_status not null default 'da_fare',
  notes       text,
  owner_id    uuid references auth.users(id),
  updated_at  timestamptz not null default now()
);

create trigger trg_strategy_updated_at
  before update on public.strategy_tactics
  for each row execute function public.set_updated_at();

alter table public.strategy_tactics enable row level security;
create policy "auth read tactics" on public.strategy_tactics for select to authenticated using (true);
create policy "auth write tactics" on public.strategy_tactics for all to authenticated using (true) with check (true);

-- Pre-insert the 7 tactics so they exist regardless
insert into public.strategy_tactics (id) values
  ('podcast-trojan'),
  ('report-magnete'),
  ('linkedin-sniper'),
  ('cena-milano'),
  ('mini-tool-demo'),
  ('pacco-fisico'),
  ('speaking-eventi')
on conflict do nothing;;
