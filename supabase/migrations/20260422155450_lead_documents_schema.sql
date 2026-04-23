-- Migration: lead_documents_schema
-- Version: 20260422155450
-- Dumped via MCP Supabase on 2026-04-23


-- 1. Bucket privato per documenti lead
insert into storage.buckets (id, name, public)
values ('lead-documents', 'lead-documents', false)
on conflict (id) do nothing;

-- 2. Tabella metadata documenti
create table public.lead_documents (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  file_size bigint not null,
  mime_type text,
  tag text,
  uploaded_by uuid references public.admin_members(id) on delete set null,
  uploaded_by_name text,
  created_at timestamptz not null default now()
);

create index lead_documents_lead_idx on public.lead_documents (lead_id, created_at desc);

alter table public.lead_documents enable row level security;
-- Nessuna policy = solo service_role può accedere
;
