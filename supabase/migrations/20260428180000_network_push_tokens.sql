-- Push tokens per app mobile Il Dispaccio (Expo Push API).
-- Un member può avere più device (iOS + Android), ognuno con il proprio token.
-- Token si rinfresca al login OTP e ad ogni avvio dell'app.

create table if not exists public.network_push_tokens (
  id bigserial primary key,
  member_id uuid not null references public.network_members(id) on delete cascade,
  expo_token text not null unique,
  platform text not null check (platform in ('ios', 'android')),
  device_name text,
  created_at timestamptz not null default now(),
  last_used_at timestamptz not null default now()
);

create index if not exists idx_network_push_tokens_member
  on public.network_push_tokens(member_id);

create index if not exists idx_network_push_tokens_last_used
  on public.network_push_tokens(last_used_at desc);

comment on table public.network_push_tokens is
  'Push tokens Expo per device mobile dei reseller. Aggiornati al login + avvio app.';
