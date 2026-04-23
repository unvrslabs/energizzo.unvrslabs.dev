-- Migration: reset_test_responses
-- Version: 20260421194238
-- Dumped via MCP Supabase on 2026-04-23

-- Azzera risposte survey (test di Emanuele)
delete from survey_responses;

update leads
set survey_status = 'not_sent',
    survey_sent_at = null,
    survey_completed_at = null,
    survey_last_step_at = null
where survey_status != 'not_sent'
   or survey_sent_at is not null
   or survey_completed_at is not null
   or survey_last_step_at is not null;

-- Azzera risposte podcast (test) mantenendo l'ospite
update podcast_guests
set response_name = null,
    response_whatsapp = null,
    response_availability = null,
    response_confirmed_at = null,
    status = case
      when status = 'confirmed' and invited_at is not null then 'invited'
      when status = 'confirmed' then 'target'
      else status
    end
where response_confirmed_at is not null
   or response_name is not null
   or response_whatsapp is not null
   or response_availability is not null;;
