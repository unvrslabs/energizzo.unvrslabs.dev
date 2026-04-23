-- Migration: admin_login_otp_schema
-- Version: 20260422141630
-- Dumped via MCP Supabase on 2026-04-23


-- 1. admin_members
create table public.admin_members (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  nome text not null,
  role text not null default 'admin',
  last_login_at timestamptz,
  revoked_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
create index admin_members_phone_active_idx
  on public.admin_members (phone) where revoked_at is null;

-- 2. admin_otp_codes
create table public.admin_otp_codes (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts smallint not null default 0,
  consumed_at timestamptz,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index admin_otp_phone_created_idx
  on public.admin_otp_codes (phone, created_at desc);
create index admin_otp_pending_idx
  on public.admin_otp_codes (expires_at) where consumed_at is null;

-- 3. admin_sessions
create table public.admin_sessions (
  token_hash text primary key,
  member_id uuid not null references public.admin_members(id) on delete cascade,
  expires_at timestamptz not null,
  ip text,
  user_agent text,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index admin_sessions_member_idx on public.admin_sessions (member_id);
create index admin_sessions_active_idx
  on public.admin_sessions (expires_at) where revoked_at is null;

-- 4. RLS bloccate
alter table public.admin_members enable row level security;
alter table public.admin_otp_codes enable row level security;
alter table public.admin_sessions enable row level security;

-- 5. Seed admins
insert into public.admin_members (phone, nome) values
  ('+34625976744', 'Emanuele'),
  ('+393298530293', 'Admin');

-- 6. Rimuovo FK notes.author_id -> auth.users per disaccoppiare da Supabase Auth
do $$
declare
  fk_name text;
begin
  select conname into fk_name
  from pg_constraint
  where conrelid = 'public.notes'::regclass
    and contype = 'f'
    and conkey = (select array_agg(a.attnum) from pg_attribute a where a.attrelid = 'public.notes'::regclass and a.attname = 'author_id');
  if fk_name is not null then
    execute 'alter table public.notes drop constraint ' || quote_ident(fk_name);
  end if;
end$$;
;
