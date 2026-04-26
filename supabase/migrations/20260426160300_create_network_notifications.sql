-- Migration: network_notifications
-- Sistema notifiche per i membri network. Fan-out al momento di creazione
-- (1 riga per ogni membro approvato attivo) — semplice, efficiente con <500 membri.
--
-- Eventi v1:
--   1. delibera_alta      → delibera con ai_importanza in ('critica','alta')
--   2. scadenza_imminente → scadenza dentro 7 giorni (creata da cron daily)
--   3. podcast_published  → podcast_guests passa a status='published'
--
-- Tutti gli inserimenti passano da public.create_broadcast_notification(...)
-- che fa fan-out su tutti i membri attivi.

create table if not exists public.network_notifications (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.network_members(id) on delete cascade,
  type text not null check (type in ('delibera_alta','scadenza_imminente','podcast_published')),
  title text not null,
  body text,
  link text,
  severity text not null default 'medium' check (severity in ('low','medium','high')),
  payload jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  -- Dedup key: una stessa fonte (es. delibera X) non genera 2 notifiche per lo stesso membro
  dedup_key text,
  unique (member_id, dedup_key)
);

create index if not exists network_notifications_member_unread_idx
  on public.network_notifications (member_id, read_at, created_at desc);

create index if not exists network_notifications_member_recent_idx
  on public.network_notifications (member_id, created_at desc);

-- RLS: i membri leggono solo le proprie notifiche
alter table public.network_notifications enable row level security;

-- Le query passano sempre da admin client (service_role) come tutto il resto
-- del network di Il Dispaccio (vedi src/lib/supabase/server.ts).
-- Quindi RLS è restrittiva di default ma il service_role la bypassa.

-- ───────────────────────────────────────────────────────────────────
-- Helper: fan-out broadcast su tutti i membri attivi
-- ───────────────────────────────────────────────────────────────────
create or replace function public.create_broadcast_notification(
  p_type text,
  p_title text,
  p_body text,
  p_link text,
  p_severity text,
  p_payload jsonb,
  p_dedup_key text
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer := 0;
begin
  insert into public.network_notifications
    (member_id, type, title, body, link, severity, payload, dedup_key)
  select
    m.id, p_type, p_title, p_body, p_link, p_severity, p_payload, p_dedup_key
  from public.network_members m
  where m.approved_at is not null
    and m.revoked_at is null
  on conflict (member_id, dedup_key) do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

-- ───────────────────────────────────────────────────────────────────
-- Trigger 1: delibere_cache importanza 'critica' o 'alta'
-- Si scatena quando una delibera viene marcata importanza alta
-- (sia su INSERT che su UPDATE quando ai_importanza cambia a alta/critica).
-- ───────────────────────────────────────────────────────────────────
create or replace function public.notify_delibera_alta()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link text;
  v_severity text;
begin
  if new.ai_importanza is null or new.ai_importanza not in ('critica','alta') then
    return new;
  end if;

  -- UPDATE: notifica solo se prima NON era critica/alta
  if tg_op = 'UPDATE' then
    if old.ai_importanza is not distinct from new.ai_importanza then
      return new;
    end if;
    if old.ai_importanza in ('critica','alta') then
      return new;
    end if;
  end if;

  v_link := '/network/delibere?open=' || new.numero;
  v_severity := case when new.ai_importanza = 'critica' then 'high' else 'medium' end;

  perform public.create_broadcast_notification(
    'delibera_alta',
    'Delibera ' || coalesce(new.ai_importanza, 'alta') || ': ' || new.numero,
    coalesce(new.titolo, ''),
    v_link,
    v_severity,
    jsonb_build_object('delibera_id', new.id, 'numero', new.numero, 'importanza', new.ai_importanza),
    'delibera_alta:' || new.id::text
  );

  return new;
end;
$$;

drop trigger if exists trg_notify_delibera_alta on public.delibere_cache;
create trigger trg_notify_delibera_alta
  after insert or update of ai_importanza on public.delibere_cache
  for each row execute function public.notify_delibera_alta();

-- ───────────────────────────────────────────────────────────────────
-- Trigger 2: podcast_guests passa a status='published'
-- ───────────────────────────────────────────────────────────────────
create or replace function public.notify_podcast_published()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link text;
  v_title text;
begin
  if new.status is distinct from 'published' then
    return new;
  end if;

  -- UPDATE: notifica solo se prima NON era published
  if tg_op = 'UPDATE' and old.status is not distinct from 'published' then
    return new;
  end if;

  v_link := coalesce(new.episode_url, '/network/podcast');
  v_title := 'Nuovo episodio: ' || coalesce(new.episode_title, new.external_name, 'Il Dispaccio Podcast');

  perform public.create_broadcast_notification(
    'podcast_published',
    v_title,
    case
      when new.external_company is not null
        then 'Con ' || coalesce(new.external_name,'') || ' · ' || new.external_company
      else null
    end,
    v_link,
    'medium',
    jsonb_build_object('guest_id', new.id, 'episode_url', new.episode_url),
    'podcast_published:' || new.id::text
  );

  return new;
end;
$$;

drop trigger if exists trg_notify_podcast_published on public.podcast_guests;
create trigger trg_notify_podcast_published
  after insert or update of status on public.podcast_guests
  for each row execute function public.notify_podcast_published();

-- ───────────────────────────────────────────────────────────────────
-- RPC: scadenze imminenti (per cron giornaliero)
-- Ritorna scadenze che cadono entro N giorni e che non sono già notificate
-- (dedup tramite dedup_key sulla data + delibera).
-- ───────────────────────────────────────────────────────────────────
create or replace function public.list_scadenze_imminenti(p_days integer default 7)
returns table (
  delibera_id bigint,
  delibera_numero text,
  delibera_titolo text,
  scadenza_date date,
  scadenza_label text,
  scadenza_tipo text,
  giorni_residui integer,
  dedup_key text
)
language sql
security definer
set search_path = public
as $$
  select
    d.id::bigint as delibera_id,
    d.numero as delibera_numero,
    d.titolo as delibera_titolo,
    (s->>'date')::date as scadenza_date,
    (s->>'label')::text as scadenza_label,
    (s->>'tipo')::text as scadenza_tipo,
    (((s->>'date')::date) - current_date)::integer as giorni_residui,
    'scadenza_imminente:' || d.id::text || ':' || (s->>'date') || ':' || md5(coalesce(s->>'label','')) as dedup_key
  from public.delibere_cache d,
       lateral jsonb_array_elements(coalesce(d.ai_scadenze, '[]'::jsonb)) s
  where (s->>'date') is not null
    and (s->>'date')::date >= current_date
    and (s->>'date')::date <= current_date + (p_days || ' days')::interval
  order by (s->>'date')::date asc;
$$;
