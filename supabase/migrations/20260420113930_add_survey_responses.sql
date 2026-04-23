-- Migration: add_survey_responses
-- Version: 20260420113930
-- Dumped via MCP Supabase on 2026-04-23

-- Survey token + status on leads
alter table public.leads add column if not exists survey_token uuid unique default gen_random_uuid();
alter table public.leads add column if not exists survey_status text default 'not_sent' check (survey_status in ('not_sent','sent','partial','completed'));
alter table public.leads add column if not exists survey_sent_at timestamptz;
alter table public.leads add column if not exists survey_completed_at timestamptz;
alter table public.leads add column if not exists survey_last_step_at timestamptz;

update public.leads set survey_token = gen_random_uuid() where survey_token is null;

-- Responses table
create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  token uuid not null unique,
  answers jsonb not null default '{}'::jsonb,
  current_step int not null default 0,
  completed boolean not null default false,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  user_agent text,
  ip_hash text
);
create index if not exists survey_responses_lead_id_idx on public.survey_responses(lead_id);

alter table public.survey_responses enable row level security;

drop policy if exists "auth read" on public.survey_responses;
create policy "auth read" on public.survey_responses
  for select using (auth.role() = 'authenticated');

-- Public RPCs for anon survey submission
create or replace function public.get_lead_for_survey(p_token uuid)
returns table (
  id uuid,
  ragione_sociale text,
  piva text,
  tipo_servizio text,
  provincia text,
  survey_completed boolean
)
language sql
security definer
set search_path = public
as $$
  select l.id, l.ragione_sociale, l.piva, l.tipo_servizio::text, l.provincia,
         coalesce((select r.completed from public.survey_responses r where r.token = p_token limit 1), false) as survey_completed
  from public.leads l
  where l.survey_token = p_token;
$$;

create or replace function public.save_survey_progress(p_token uuid, p_step int, p_answers jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_lead_id uuid;
begin
  select id into v_lead_id from public.leads where survey_token = p_token;
  if v_lead_id is null then raise exception 'Invalid token'; end if;

  insert into public.survey_responses (lead_id, token, answers, current_step, updated_at)
  values (v_lead_id, p_token, coalesce(p_answers, '{}'::jsonb), coalesce(p_step, 0), now())
  on conflict (token) do update
    set answers = public.survey_responses.answers || excluded.answers,
        current_step = greatest(public.survey_responses.current_step, excluded.current_step),
        updated_at = now()
    where public.survey_responses.completed = false;

  update public.leads
     set survey_status = case when survey_status = 'completed' then 'completed' else 'partial' end,
         survey_last_step_at = now()
   where id = v_lead_id;
end;
$$;

create or replace function public.complete_survey(p_token uuid, p_answers jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_lead_id uuid;
begin
  select id into v_lead_id from public.leads where survey_token = p_token;
  if v_lead_id is null then raise exception 'Invalid token'; end if;

  insert into public.survey_responses (lead_id, token, answers, completed, completed_at, updated_at)
  values (v_lead_id, p_token, coalesce(p_answers, '{}'::jsonb), true, now(), now())
  on conflict (token) do update
    set answers = excluded.answers,
        completed = true,
        completed_at = now(),
        updated_at = now();

  update public.leads
     set survey_status = 'completed',
         survey_completed_at = now(),
         survey_last_step_at = now()
   where id = v_lead_id;
end;
$$;

create or replace function public.mark_survey_sent(p_lead_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.leads
     set survey_status = case when survey_status in ('not_sent') then 'sent' else survey_status end,
         survey_sent_at = coalesce(survey_sent_at, now())
   where id = p_lead_id;
end;
$$;

grant execute on function public.get_lead_for_survey(uuid) to anon, authenticated;
grant execute on function public.save_survey_progress(uuid, int, jsonb) to anon, authenticated;
grant execute on function public.complete_survey(uuid, jsonb) to anon, authenticated;
grant execute on function public.mark_survey_sent(uuid) to authenticated;;
