# Spec — Login Reseller via WhatsApp OTP

> Data: 2026-04-22
> Ambito: Il Dispaccio — landing `ildispaccio.energy`, area riservata `/network/*`

## Obiettivo

Permettere ai reseller **ammessi** al network Il Dispaccio di accedere a un'area riservata (`ildispaccio.energy/network`) autenticandosi con il loro numero WhatsApp + codice OTP inviato via WhatsApp (WaSender API).

Il flusso completo dell'utente:

1. Reseller compila il form `NetworkJoinCard` su `ildispaccio.energy` → insert in `network_join_requests`
2. **Emanuele approva manualmente** (via Supabase SQL editor) inserendo il record in `network_members`. L'admin UI è **fuori scope** per questa iterazione.
3. Reseller visita `/network/login` → digita il suo numero WhatsApp → server manda OTP 6 cifre via WaSender
4. Reseller inserisce OTP → session cookie httpOnly → redirect a `/network`

## Non-obiettivi (questa iterazione)

- **Admin UI di approvazione** — Emanuele approva a mano via Supabase (insert in `network_members`)
- Notifica WhatsApp di benvenuto post-approvazione automatica
- Contenuti completi area riservata (solo dashboard minimale: saluto + anagrafica + placeholder sezioni future)
- Gestione multi-utente per azienda (un solo referente per P.IVA)
- Self-service registrazione (resta gated: prima form, poi approvazione manuale)
- Recupero numero cambiato (edge case, si modifica a mano in DB)

## Perché custom auth (non Supabase Auth)

1. `auth.users` è usato solo per admin. Mescolare reseller creerebbe confusione RLS e rischio.
2. Supabase Phone Auth richiede SMS provider (Twilio/MessageBird), non WhatsApp. Hook custom SMS è possibile ma complica senza dare vantaggi rispetto a custom.
3. I reseller non hanno bisogno di feature Supabase Auth (magic link, password reset, ecc.) — solo OTP WhatsApp.
4. Controllo pieno su rate limit, audit, revoche.

Il custom auth vive interamente sotto il prefisso `/network` — middleware, cookie, tabelle tutte separate. Zero contaminazione col flusso admin.

## Modello dati

### Tabelle nuove (Supabase `motvueogtdbzmtdydqsp`)

```sql
-- Reseller ammessi al network
create table public.network_members (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,               -- E.164 normalizzato (es. +393331234567)
  ragione_sociale text not null,
  piva text not null,
  referente text not null,
  join_request_id uuid references public.network_join_requests(id) on delete set null,
  approved_at timestamptz not null default now(),
  approved_by uuid references auth.users(id),
  last_login_at timestamptz,
  revoked_at timestamptz,                   -- soft delete (ban/esclusione)
  notes text,
  created_at timestamptz not null default now()
);

create index on public.network_members (phone) where revoked_at is null;

-- OTP codes (one-time)
create table public.network_otp_codes (
  id uuid primary key default gen_random_uuid(),
  phone text not null,                      -- E.164
  code_hash text not null,                  -- SHA-256 hex (code + pepper)
  expires_at timestamptz not null,
  attempts smallint not null default 0,
  consumed_at timestamptz,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index on public.network_otp_codes (phone, created_at desc);
create index on public.network_otp_codes (expires_at) where consumed_at is null;

-- Sessioni attive (token cookie hash)
create table public.network_sessions (
  token_hash text primary key,              -- SHA-256 hex del cookie value
  member_id uuid not null references public.network_members(id) on delete cascade,
  expires_at timestamptz not null,
  ip text,
  user_agent text,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index on public.network_sessions (member_id);
create index on public.network_sessions (expires_at) where revoked_at is null;
```

### RLS

Le tre tabelle **non** sono esposte al client browser (accesso solo da Route Handler con `service_role` key). RLS enabled + **zero policy** = nessun accesso anon/authenticated. Documentato qui per non aprire la superficie per errore.

```sql
alter table public.network_members enable row level security;
alter table public.network_otp_codes enable row level security;
alter table public.network_sessions enable row level security;
-- nessuna policy = tutto bloccato tranne service_role
```

### Approvazione manuale (fuori scope UI, documentato per Emanuele)

Quando Emanuele vuole ammettere un reseller, esegue questo insert su Supabase SQL editor (prendendo i dati da `network_join_requests`):

```sql
insert into public.network_members (phone, ragione_sociale, piva, referente, join_request_id)
values (
  '+393331234567',           -- phone E.164 (normalizza WhatsApp dal request)
  'Acme Energia SRL',
  '12345678901',
  'Mario Rossi',
  '<uuid del network_join_requests>'
);
```

Il numero **deve essere in E.164** (`+39...`). Nessuna modifica alla tabella `network_join_requests`.

## Flusso API `/api/network/auth/*`

Tutti i Route Handler Next.js, Node runtime, `export const runtime = "nodejs"`. Usano Supabase `service_role` lato server.

### `POST /api/network/auth/request-otp`

**Input**: `{ phone: string }` (accetta "+39 333 1234567" → normalizza E.164)

**Logica**:
1. Valida + normalizza phone a E.164 (solo `+` seguito da 8-15 cifre; se manca `+` e inizia con `3` → prefisso `+39`)
2. Rate limit: **max 3 OTP pending/inviati per phone negli ultimi 15 minuti** (conta `network_otp_codes` dove `created_at > now() - '15 min'`)
3. Lookup: `SELECT id FROM network_members WHERE phone = ? AND revoked_at IS NULL`
4. **Risposta sempre uguale** (`{ ok: true, expiresInSeconds: 300 }`) per evitare enumeration
5. Se member esiste: genera OTP 6 cifre numeriche, hash = SHA-256(code + pepper), insert in `network_otp_codes` con `expires_at = now() + 5 min`, invia WhatsApp via WaSender
6. Se member non esiste o rate-limit: non fa nulla (risposta identica)
7. Se WaSender fallisce → logga `console.error`, marca OTP come revocato (update `consumed_at = now()` con marker), non throwa al client (già risposto `ok: true`). Il reseller non riceverà OTP e dovrà ritentare.

**Output**: `{ ok: true, expiresInSeconds: 300 }` sempre

**Errori**:
- 400 se phone syntax invalida
- 429 se **troppo** aggressivo (> 10 richieste in 1 min dallo stesso IP) → lato edge, layer separato

### `POST /api/network/auth/verify-otp`

**Input**: `{ phone: string, code: string }`

**Logica**:
1. Normalizza phone, valida code (6 cifre)
2. Recupera ultimo OTP non consumato e non scaduto: `SELECT * FROM network_otp_codes WHERE phone = ? AND consumed_at IS NULL AND expires_at > now() ORDER BY created_at DESC LIMIT 1`
3. Incrementa `attempts`. Se `attempts > 5` → invalida tutti gli OTP del numero, 429
4. Verifica hash. Se mismatch → 400 "Codice errato"
5. Marca OTP `consumed_at = now()`. Invalida anche altri OTP pending stesso phone (sicurezza).
6. Genera `session_token = randomBytes(32).toString("base64url")`, hash SHA-256 per storage
7. Insert in `network_sessions` con `expires_at = now() + 30 giorni`
8. Update `network_members.last_login_at`
9. Set cookie `ildispaccio_network=<token>` httpOnly, secure, sameSite=lax, maxAge 30gg, path `/`, domain `.ildispaccio.energy` (in prod) o default (in dev)
10. Return `{ ok: true, redirect: "/network" }`

**Errori**: 400 input malformato / OTP errato / scaduto. 429 troppi tentativi.

### `POST /api/network/auth/logout`

Invalida il cookie (revoked_at sulla sessione + cookie maxAge=0).

### `GET /api/network/me`

Legge cookie, hash, query `network_sessions` join `network_members`. Se valido ritorna `{ id, ragione_sociale, piva, referente, phone, approved_at }`. Altrimenti 401.

## Middleware

Update di `src/middleware.ts`:

1. `isPublicRoute` include anche:
   - `/network/login`
   - `/network/api/*` (rotte OTP)
2. Nuova funzione `isNetworkProtectedRoute(pathname)` = `pathname === "/network" || pathname.startsWith("/network/")` ma NOT `/network/login` e NOT `/network/api/*`
3. Per host pubblico: se rotta è protetta → verifica cookie `ildispaccio_network` → se assente → redirect `/network/login?next=<pathname>`
4. Admin host continua a rifiutare `/network/*` → redirect a public

La verifica cookie nel middleware fa solo check di presenza cookie (non query DB per performance). La validazione completa avviene server-side in `/network/layout.tsx` (RSC).

## UI

### `/network/login` (page, client component)

Due step in una sola pagina, transizione smooth:

- **Step 1**: input numero WhatsApp con flag IT default, pulsante "Invia codice"
- **Step 2**: input OTP 6 cifre (6 input separati autofocus), countdown 5:00, link "Reinvia codice" (disabilitato per 60s dopo invio)

Sfondo `.mesh-gradient`, card `.dispaccio-card`, logo Il Dispaccio in alto, testo di rassicurazione "Solo per i membri del network. Il codice è valido 5 minuti."

Errori inline (numero non valido, codice errato, troppi tentativi).

### `/network` (server component, protected)

Layout protetto:
- `src/app/network/layout.tsx` (server): valida session da cookie + DB, se invalida redirect `/network/login`. Se valida passa il member ai children via React Context client (o prop drilling).
- `src/app/network/page.tsx`: dashboard minimale — "Benvenuto, {referente}" + card con anagrafica azienda + 3 placeholder card per "Report riservato", "Delibere", "Community" (coming soon).
- Navbar network custom con logout button.

## Integrazione WaSender

Utility `src/lib/wasender.ts`:

```ts
export async function sendWhatsAppText(phone: string, text: string): Promise<void>
```

Env vars nuove:
- `WASENDER_API_URL` (es. `https://www.wasenderapi.com/api`)
- `WASENDER_API_KEY`
- `WASENDER_SESSION_ID` (se WaSender multi-session)
- `NETWORK_OTP_PEPPER` (random 32 byte hex, pepper per hash OTP)
- `NETWORK_SESSION_COOKIE_DOMAIN` (prod: `.ildispaccio.energy`, dev: vuoto)

Template messaggi:
- **OTP**: `Il Dispaccio - Codice accesso: {code}\nValido 5 minuti. Non condividerlo con nessuno.`

## Sicurezza

- OTP hash SHA-256 con pepper (non salvare plaintext)
- Session token: 32 byte random, hash SHA-256 in DB, value solo in cookie
- Cookie httpOnly + secure + sameSite=lax
- Rate limit OTP per phone (3 / 15 min) e per IP (10 / min) su `request-otp`
- Rate limit verify (5 tentativi / codice)
- No user enumeration (risposta identica se member esiste o no)
- Sanitizzazione phone → E.164
- CSRF: Route Handler `POST` accetta solo `Content-Type: application/json`; per ora basta sameSite=lax sul cookie
- Log `console.error` per errori WaSender + OTP attempt failures (monitoring futuro)

## Accettazione

Il feature si considera completa quando:
1. Un phone presente in `network_members` (inserito a mano da Emanuele) può ottenere OTP via WhatsApp ed effettuare login → cookie settato → accede a `/network`
2. Un phone NON presente riceve risposta identica ma nessun WhatsApp → non riesce ad accedere
3. OTP scaduto / errato restituisce errore specifico senza rivelare l'esistenza del numero
4. Logout pulisce cookie e invalida sessione in DB
5. Middleware redirige correttamente rotte protette → `/network/login`
6. Deploy VPS live su `ildispaccio.energy/network/login` funzionante
