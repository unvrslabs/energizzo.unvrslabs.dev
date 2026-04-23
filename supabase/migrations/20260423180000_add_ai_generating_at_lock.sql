-- Migration: add_ai_generating_at_lock
-- Aggiunge colonne per lock atomico DB-based su generazione AI summary.
-- Sostituisce il lock in-process (Set<number>) con CAS via UPDATE ... WHERE ... RETURNING.

ALTER TABLE public.delibere_cache
  ADD COLUMN IF NOT EXISTS ai_generating_at timestamptz;

ALTER TABLE public.testi_integrati_cache
  ADD COLUMN IF NOT EXISTS ai_generating_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_delibere_ai_generating_at
  ON public.delibere_cache (ai_generating_at)
  WHERE ai_generating_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ti_ai_generating_at
  ON public.testi_integrati_cache (ai_generating_at)
  WHERE ai_generating_at IS NOT NULL;
