-- Migration: add_invite_number_to_leads
-- Version: 20260423111000
-- Dumped via MCP Supabase on 2026-04-23

-- 1) Aggiungi colonna invite_number
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS invite_number integer;

-- 2) Unique index parziale (solo valori non null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_invite_number
  ON public.leads(invite_number)
  WHERE invite_number IS NOT NULL;

-- 3) Backfill: numera i lead già invitati in ordine di survey_sent_at
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY survey_sent_at ASC, created_at ASC) AS n
  FROM public.leads
  WHERE survey_sent_at IS NOT NULL AND invite_number IS NULL
)
UPDATE public.leads
   SET invite_number = numbered.n
  FROM numbered
 WHERE public.leads.id = numbered.id;

-- 4) mark_survey_sent: assegna invite_number se non esiste
CREATE OR REPLACE FUNCTION public.mark_survey_sent(p_lead_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_next integer;
begin
  update public.leads
     set survey_status = case when survey_status in ('not_sent') then 'sent' else survey_status end,
         survey_sent_at = coalesce(survey_sent_at, now())
   where id = p_lead_id;

  -- Assegna il prossimo invite_number se mancante
  if not exists (select 1 from public.leads where id = p_lead_id and invite_number is not null) then
    select coalesce(max(invite_number), 0) + 1 into v_next from public.leads;
    update public.leads set invite_number = v_next where id = p_lead_id and invite_number is null;
  end if;
end;
$function$;

-- 5) get_lead_for_survey: ritorna anche invite_number
-- Drop first because return type is changing
DROP FUNCTION IF EXISTS public.get_lead_for_survey(uuid);
CREATE FUNCTION public.get_lead_for_survey(p_token uuid)
 RETURNS TABLE(id uuid, ragione_sociale text, piva text, tipo_servizio text, provincia text, survey_completed boolean, invite_number integer)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select l.id, l.ragione_sociale, l.piva, l.tipo_servizio::text, l.provincia,
         coalesce((select r.completed from public.survey_responses r where r.token = p_token limit 1), false) as survey_completed,
         l.invite_number
  from public.leads l
  where l.survey_token = p_token;
$function$;;
