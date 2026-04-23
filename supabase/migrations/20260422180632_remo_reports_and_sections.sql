-- Migration: remo_reports_and_sections
-- Version: 20260422180632
-- Dumped via MCP Supabase on 2026-04-23


create table if not exists public.remo_reports (
  id uuid primary key default gen_random_uuid(),
  month date not null,
  category text not null check (category in ('luce','gas')),
  pdf_url text,
  published_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (month, category)
);

create table if not exists public.remo_sections (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.remo_reports(id) on delete cascade,
  order_index int not null,
  slug text not null,
  group_slug text not null,
  group_label text not null,
  type text not null check (type in ('intro','table','text')),
  title text not null,
  subtitle text,
  description text,
  columns jsonb,
  rows jsonb,
  footnote text,
  created_at timestamptz default now()
);

create index if not exists remo_sections_report_order_idx
  on public.remo_sections (report_id, order_index);

create index if not exists remo_reports_month_cat_idx
  on public.remo_reports (month desc, category);

alter table public.remo_reports enable row level security;
alter table public.remo_sections enable row level security;
;
