-- Migration: network_login_otp_schema
-- Version: 20260422135234
-- Dumped via MCP Supabase on 2026-04-23


-- 1. network_members: reseller ammessi al network
create table public.network_members (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  ragione_sociale text not null,
  piva text not null,
  referente text not null,
  join_request_id uuid references public.network_join_requests(id) on delete set null,
  approved_at timestamptz not null default now(),
  approved_by uuid references auth.users(id),
  last_login_at timestamptz,
  revoked_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
create index network_members_phone_active_idx
  on public.network_members (phone) where revoked_at is null;

-- 2. network_otp_codes: OTP one-time
create table public.network_otp_codes (
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
create index network_otp_phone_created_idx
  on public.network_otp_codes (phone, created_at desc);
create index network_otp_pending_idx
  on public.network_otp_codes (expires_at) where consumed_at is null;

-- 3. network_sessions: sessioni attive
create table public.network_sessions (
  token_hash text primary key,
  member_id uuid not null references public.network_members(id) on delete cascade,
  expires_at timestamptz not null,
  ip text,
  user_agent text,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index network_sessions_member_idx on public.network_sessions (member_id);
create index network_sessions_active_idx
  on public.network_sessions (expires_at) where revoked_at is null;

-- 4. RLS: tutte bloccate (solo service_role)
alter table public.network_members enable row level security;
alter table public.network_otp_codes enable row level security;
alter table public.network_sessions enable row level security;
;
