-- Migration: create_social_posts
-- Version: 20260424000000
-- Social posts generator + scheduler per il modulo /dashboard/social

do $$
begin
  if not exists (select 1 from pg_type where typname = 'social_post_tipo') then
    create type social_post_tipo as enum (
      'delibera','market','scadenza','digest','educational','podcast','libero'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'social_post_status') then
    create type social_post_status as enum (
      'bozza','approvato','schedulato','pubblicato','skip'
    );
  end if;
end $$;

create table if not exists social_posts (
  id uuid primary key default gen_random_uuid(),

  tipo social_post_tipo not null,
  fonte_kind text,
  fonte_id text,
  fonte_meta jsonb not null default '{}'::jsonb,

  hook text,
  copy_linkedin text not null default '',
  copy_x text not null default '',
  hashtags text[] not null default '{}',

  image_strategy jsonb not null default '{}'::jsonb,
  image_template text,
  image_data jsonb not null default '{}'::jsonb,
  image_ai_prompt text,
  image_url text,

  scheduled_at timestamptz,
  scheduled_lane text not null default 'both' check (scheduled_lane in ('linkedin','x','both')),

  status social_post_status not null default 'bozza',
  published_linkedin_at timestamptz,
  published_x_at timestamptz,

  ai_model text,
  ai_prompt_version text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists social_posts_scheduled_at_idx
  on social_posts(scheduled_at)
  where status in ('approvato','schedulato');

create index if not exists social_posts_status_tipo_idx
  on social_posts(status, tipo);

create index if not exists social_posts_fonte_idx
  on social_posts(fonte_kind, fonte_id);

create or replace function social_posts_set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists social_posts_updated_at on social_posts;
create trigger social_posts_updated_at
  before update on social_posts
  for each row execute function social_posts_set_updated_at();

alter table social_posts enable row level security;
