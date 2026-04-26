-- Tabelle bacheca network: posts + commenti + reactions
-- Identità verificata via network_members.id (P.IVA + ragione sociale).
-- Soft-delete su posts/comments con flag deleted_by_admin per audit.

create table if not exists public.network_posts (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.network_members(id) on delete cascade,
  body text not null check (length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by_admin boolean not null default false
);

create index if not exists network_posts_recent_idx
  on public.network_posts (created_at desc)
  where deleted_at is null;

create index if not exists network_posts_member_idx
  on public.network_posts (member_id);

create table if not exists public.network_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.network_posts(id) on delete cascade,
  member_id uuid not null references public.network_members(id) on delete cascade,
  body text not null check (length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by_admin boolean not null default false
);

create index if not exists network_post_comments_post_idx
  on public.network_post_comments (post_id, created_at asc)
  where deleted_at is null;

create table if not exists public.network_post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.network_posts(id) on delete cascade,
  member_id uuid not null references public.network_members(id) on delete cascade,
  kind text not null check (kind in ('utile','approfondire')),
  created_at timestamptz not null default now(),
  unique (post_id, member_id, kind)
);

create index if not exists network_post_reactions_post_idx
  on public.network_post_reactions (post_id);

alter table public.network_posts enable row level security;
alter table public.network_post_comments enable row level security;
alter table public.network_post_reactions enable row level security;

create or replace function public.touch_network_post_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_network_post_updated_at on public.network_posts;
create trigger trg_touch_network_post_updated_at
  before update on public.network_posts
  for each row execute function public.touch_network_post_updated_at();
