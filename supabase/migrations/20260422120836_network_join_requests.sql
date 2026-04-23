-- Migration: network_join_requests
-- Version: 20260422120836
-- Dumped via MCP Supabase on 2026-04-23

create table if not exists public.network_join_requests (
  id uuid primary key default gen_random_uuid(),
  ragione_sociale text not null check (length(ragione_sociale) between 2 and 200),
  piva text not null check (length(piva) between 5 and 20),
  referente text not null check (length(referente) between 2 and 200),
  whatsapp text not null check (length(whatsapp) between 6 and 50),
  note text,
  source text default 'ildispaccio_landing',
  ip inet,
  user_agent text,
  status text default 'pending' check (status in ('pending','accepted','rejected','contacted')),
  created_at timestamptz default now()
);

alter table public.network_join_requests enable row level security;

drop policy if exists "anon_insert_network_join" on public.network_join_requests;
create policy "anon_insert_network_join" on public.network_join_requests
  for insert to anon with check (true);

drop policy if exists "auth_all_network_join" on public.network_join_requests;
create policy "auth_all_network_join" on public.network_join_requests
  for all to authenticated using (true) with check (true);

create index if not exists network_join_requests_created_at_idx
  on public.network_join_requests (created_at desc);
create index if not exists network_join_requests_status_idx
  on public.network_join_requests (status);;
