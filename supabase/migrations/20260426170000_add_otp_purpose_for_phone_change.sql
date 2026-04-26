-- Migration: add purpose + member_id to network_otp_codes
-- Per riusare la stessa tabella OTP sia per login che per cambio numero,
-- distinguendo via `purpose`. `member_id` è popolato solo quando un membro
-- autenticato richiede il cambio numero (per legare la richiesta al titolare).

alter table public.network_otp_codes
  add column if not exists purpose text not null default 'login'
    check (purpose in ('login','change_phone')),
  add column if not exists member_id uuid references public.network_members(id) on delete cascade;

create index if not exists network_otp_codes_purpose_member_idx
  on public.network_otp_codes (member_id, purpose, created_at desc)
  where purpose = 'change_phone';
