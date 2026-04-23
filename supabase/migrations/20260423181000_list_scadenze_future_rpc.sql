-- Migration: list_scadenze_future_rpc
-- RPC per listing scadenze future: scansiona ai_scadenze (jsonb array),
-- filtra per data >= today, ritorna già ordinato. Evita full scan app-side.

CREATE OR REPLACE FUNCTION public.list_scadenze_future()
RETURNS TABLE (
  delibera_id integer,
  delibera_numero text,
  delibera_titolo text,
  date text,
  label text,
  tipo text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    d.id AS delibera_id,
    d.numero AS delibera_numero,
    d.titolo AS delibera_titolo,
    s->>'date' AS date,
    s->>'label' AS label,
    s->>'tipo' AS tipo
  FROM public.delibere_cache d,
       LATERAL jsonb_array_elements(d.ai_scadenze) AS s
  WHERE d.ai_scadenze IS NOT NULL
    AND jsonb_typeof(d.ai_scadenze) = 'array'
    AND (s->>'date') ~ '^\d{4}-\d{2}-\d{2}$'
    AND (s->>'date') >= to_char(now() AT TIME ZONE 'Europe/Rome', 'YYYY-MM-DD')
    AND coalesce(s->>'label', '') <> ''
  ORDER BY s->>'date' ASC, d.id;
$$;

GRANT EXECUTE ON FUNCTION public.list_scadenze_future() TO service_role;
