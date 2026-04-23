# Supabase schema

Project ref: `motvueogtdbzmtdydqsp`.

Le migration in `migrations/` sono state dumpate via MCP Supabase il 2026-04-23 dall'istanza cloud. Sono lo snapshot storico completo (38 file) e rappresentano lo stato attuale del DB.

## Workflow

**Nuova migration**:
```bash
supabase migration new <nome_snake_case>
# edita il file SQL generato
supabase db push    # applica in cloud
```

**Sync da cloud → locale** (se qualcuno applica a mano):
```bash
supabase db pull
```

**Rigenera types TypeScript** (`src/lib/supabase/database.types.ts`):
```bash
supabase gen types typescript --project-id motvueogtdbzmtdydqsp > src/lib/supabase/database.types.ts
```

## Dipendenze

- Richiede Supabase CLI: `brew install supabase/tap/supabase`
- Login: `supabase login` (token dal dashboard)
- Link: `supabase link --project-ref motvueogtdbzmtdydqsp`
