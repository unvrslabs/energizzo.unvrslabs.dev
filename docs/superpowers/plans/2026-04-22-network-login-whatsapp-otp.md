# Plan — Login Reseller via WhatsApp OTP

> Spec: [2026-04-22-network-login-whatsapp-otp.md](../specs/2026-04-22-network-login-whatsapp-otp.md)
> Repo: `unvrslabs/energizzo.unvrslabs.dev` — path locale `/Users/emanuelemaccari/dashboard-energizzo`
> Deploy target: `ildispaccio.energy/network/login`

## Ordine di esecuzione

### 0. Prerequisiti (blocker)

Necessari prima di partire con l'implementazione:

- [ ] **Credenziali WaSender** da Emanuele:
  - URL base API
  - API key / bearer token
  - Formato payload atteso (phone, message) — confermare lo schema corretto
- [ ] Conferma che il numero mittente WhatsApp sia attivo/registrato
- [ ] `NETWORK_OTP_PEPPER`: genero io 32 byte random hex

### 1. Schema Supabase

**File**: nessuno nel repo. Eseguito via Supabase SQL editor.

Migration manuale in `motvueogtdbzmtdydqsp`:

```sql
-- 1. network_members
create table public.network_members (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  ragione_sociale text not null,
  piva text not null,
  referente text not null,
  join_request_id uuid references public.network_join_requests(id) on delete set null,
  approved_at timestamptz not null default now(),
  approved_by uuid references auth.users(id),
  last_login_at timestamptz,
  revoked_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
create index network_members_phone_active_idx
  on public.network_members (phone) where revoked_at is null;

-- 2. network_otp_codes
create table public.network_otp_codes (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts smallint not null default 0,
  consumed_at timestamptz,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index network_otp_phone_created_idx
  on public.network_otp_codes (phone, created_at desc);
create index network_otp_pending_idx
  on public.network_otp_codes (expires_at) where consumed_at is null;

-- 3. network_sessions
create table public.network_sessions (
  token_hash text primary key,
  member_id uuid not null references public.network_members(id) on delete cascade,
  expires_at timestamptz not null,
  ip text,
  user_agent text,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index network_sessions_member_idx on public.network_sessions (member_id);
create index network_sessions_active_idx
  on public.network_sessions (expires_at) where revoked_at is null;

-- 4. RLS: lock down (solo service_role passa)
alter table public.network_members enable row level security;
alter table public.network_otp_codes enable row level security;
alter table public.network_sessions enable row level security;
```

**Verifica post-migrazione**:
```sql
select count(*) from public.network_members;      -- 0
select count(*) from public.network_otp_codes;    -- 0
select count(*) from public.network_sessions;     -- 0
```

### 2. Env vars

Aggiungere a `.env.local` (locale) e `/root/energizzo.unvrslabs.dev/.env.local` (VPS):

```
# Already present
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...                # VERIFICARE che esista, altrimenti aggiungere
TELEGRAM_PODCAST_BOT_TOKEN=...
TELEGRAM_PODCAST_CHAT_ID=...

# Nuovi (da aggiungere)
WASENDER_API_URL=https://...
WASENDER_API_KEY=...
WASENDER_SESSION_ID=...                      # se applicabile
NETWORK_OTP_PEPPER=<32 byte hex>
NETWORK_SESSION_COOKIE_DOMAIN=.ildispaccio.energy
```

**Check**: verificare se `SUPABASE_SERVICE_ROLE_KEY` esiste già o va recuperata da Supabase dashboard.

### 3. Libreria WaSender

**File nuovo**: `src/lib/wasender.ts`

```ts
// Funzione unica: sendWhatsAppText(phone, text)
// - valida env
// - POST a WASENDER_API_URL con body richiesto
// - throw su errore
// - timeout 10s
```

Interfaccia esatta dipende dalla documentazione WaSender — adatto al ricevere le credenziali.

### 4. Utility phone + crypto

**File nuovo**: `src/lib/network/phone.ts`

```ts
export function normalizePhoneE164(raw: string): string | null
// - rimuove spazi, (, ), -, .
// - se inizia con "+": tiene così (valida poi)
// - se inizia con "00": sostituisce con "+"
// - se inizia con "3" (9 o 10 cifre): prepend "+39"
// - se inizia con "39" (11-12 cifre): prepend "+"
// - regex finale: ^\+[1-9]\d{7,14}$
// - ritorna null se invalido
```

**File nuovo**: `src/lib/network/crypto.ts`

```ts
export function hashOtp(code: string): string
// sha256(code + NETWORK_OTP_PEPPER)

export function generateOtpCode(): string
// random 6 digits, zero-padded (crypto.randomInt)

export function generateSessionToken(): string
// 32 bytes → base64url

export function hashSessionToken(token: string): string
// sha256(token)
```

Usa `node:crypto` (edge incompat — ecco perché Route Handler Node).

### 5. Supabase admin client (service_role)

**File nuovo** (se non esiste già): `src/lib/supabase/service.ts`

```ts
// Verifica prima se esiste `src/lib/supabase/admin.ts` per evitare duplicati
// Crea client con SUPABASE_SERVICE_ROLE_KEY, persistSession false
export function createSupabaseService(): SupabaseClient
```

**Verifica**: memoria dice `src/lib/supabase/{client,server,middleware,admin}.ts` esiste già → riuso `admin.ts` se compatibile, altrimenti nuovo `service.ts`.

### 6. Route Handler OTP

**File nuovo**: `src/app/api/network/auth/request-otp/route.ts`
**File nuovo**: `src/app/api/network/auth/verify-otp/route.ts`
**File nuovo**: `src/app/api/network/auth/logout/route.ts`
**File nuovo**: `src/app/api/network/me/route.ts`

Tutti con:
```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
```

**request-otp**:
- zod valida `{ phone }`
- normalizePhoneE164 → 400 se null
- IP dal header `x-forwarded-for`
- rate limit phone: `count(network_otp_codes) where phone = ? and created_at > now() - '15 min'` → se `>= 3` → risposta `{ ok: true }` senza inviare
- query member: `select id from network_members where phone = ? and revoked_at is null` (maybeSingle)
- se member: genera code, insert otp con `expires_at = now() + 5 min`, invia WaSender, try/catch (errore → console.error, risposta comunque `ok: true`)
- risposta `{ ok: true, expiresInSeconds: 300 }`

**verify-otp**:
- zod valida `{ phone, code }` (code regex `^\d{6}$`)
- normalizePhoneE164
- select ultimo otp pending: `select * from network_otp_codes where phone = ? and consumed_at is null and expires_at > now() order by created_at desc limit 1`
- se null → 400 "Codice non valido o scaduto"
- update attempts += 1 (atomic via RPC o optimistic)
- se attempts > 5 DOPO incremento → invalida tutti otp del phone + 429
- verifica hash(code + pepper) === code_hash. Se mismatch → 400
- marca `consumed_at = now()` su questo otp + tutti gli altri pending del phone
- select member id by phone
- genera session token, hash, insert session con `expires_at = now() + 30 days`
- update `network_members.last_login_at = now()`
- set cookie via `cookies()` from `next/headers`:
  ```ts
  cookies().set({
    name: "ildispaccio_network",
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    domain: process.env.NETWORK_SESSION_COOKIE_DOMAIN || undefined,
  });
  ```
- risposta `{ ok: true, redirect: "/network" }`

**logout**:
- legge cookie → hash → update `network_sessions` set `revoked_at = now()` where token_hash = ?
- delete cookie (set maxAge=0)
- risposta `{ ok: true }`

**/me**:
- legge cookie → hash → join `network_sessions` ⋈ `network_members`
- se valido ritorna member info, else 401

### 7. Session validator (server-side utility)

**File nuovo**: `src/lib/network/session.ts`

```ts
export async function getNetworkMember(): Promise<NetworkMember | null>
// - legge cookie "ildispaccio_network" da next/headers
// - hash + query service role
// - valida expires_at + revoked_at
// - ritorna member o null
```

Usato da `/network/layout.tsx` e `/api/network/me`.

### 8. Middleware

**File modificato**: `src/middleware.ts`

Modifiche:
```ts
function isPublicRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/report/") ||
    pathname.startsWith("/podcast/invito") ||
    pathname.startsWith("/api/podcast-invite") ||
    pathname.startsWith("/api/network-join") ||
    pathname === "/network/login" ||
    pathname.startsWith("/api/network/")        // OTP + logout + me
  );
}

function isNetworkProtectedRoute(pathname: string): boolean {
  return (
    (pathname === "/network" || pathname.startsWith("/network/")) &&
    pathname !== "/network/login" &&
    !pathname.startsWith("/network/api/")       // (non useremo questo prefisso, ma difensivo)
  );
}

// Nel branch PUBLIC_HOSTS:
if (isNetworkProtectedRoute(pathname)) {
  const cookie = request.cookies.get("ildispaccio_network");
  if (!cookie) {
    const url = new URL("/network/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
}
```

Il check DB per validità cookie avviene in `/network/layout.tsx` (più robusto di farlo in middleware edge-safe).

### 9. UI login

**File nuovo**: `src/app/network/login/page.tsx` (client component o mix server+client)
**File nuovo**: `src/components/network/login-form.tsx` (client)

Design:
- Layout fullscreen `.mesh-gradient`, centrato
- Card `.dispaccio-card` max-w-md
- Logo Il Dispaccio + titolo "Accesso network"
- **Step 1**: input phone con placeholder "+39 333 1234567", button "Invia codice"
- **Step 2**: 6 input OTP con autofocus progressivo, countdown "Scade tra 4:52", link "Reinvia" (disabilitato 60s)
- Stati loading + errori inline (rossi)
- A successo: `window.location.href = redirect || "/network"`

**File nuovo**: `src/app/network/layout.tsx` (server)

```ts
import { getNetworkMember } from "@/lib/network/session";
import { redirect } from "next/navigation";

export default async function NetworkLayout({ children }) {
  const pathname = ...;  // Or use headers() to check
  // Solo /network/login è escluso dalla protezione in questo layout
  // Ma /network/login ha il suo layout? No — è dentro /network/ → eredita
  // Quindi devo gestire diversamente: uso route group oppure check path
}
```

**Scelta**: route groups per separare login da protetto:
- `src/app/network/(public)/login/page.tsx` → niente layout protetto
- `src/app/network/(protected)/layout.tsx` → valida session, se invalida redirect
- `src/app/network/(protected)/page.tsx` → dashboard minimale

Nota: i route groups `(public)` e `(protected)` non compaiono nell'URL. URL restano `/network/login` e `/network`.

### 10. Dashboard minimale

**File nuovo**: `src/app/network/(protected)/page.tsx` (server)
**File nuovo**: `src/components/network/navbar.tsx` (client) — logo + "Ciao, {referente}" + logout button

Contenuto:
- Hero: "Benvenuto nel network, {referente}"
- Card anagrafica: ragione_sociale, P.IVA, phone mascherato
- 3 card placeholder ("Report riservato", "Delibere ARERA", "Community") con badge "In arrivo"

### 11. Logout

**File nuovo**: `src/components/network/logout-button.tsx` (client)

```ts
async function handleLogout() {
  await fetch("/api/network/auth/logout", { method: "POST" });
  window.location.href = "/";
}
```

### 12. Test locale

Checklist manuale (Emanuele fa approvazione + test):
1. `pnpm dev` su localhost
2. Emanuele inserisce test member: `insert into network_members (phone, ragione_sociale, piva, referente) values ('+39...suo numero reale...', 'Test SRL', 'IT00000000000', 'Emanuele');`
3. Apre `http://localhost:3000/network/login` (con header Host override se serve testing host-based, altrimenti skip middleware in dev)
4. Inserisce numero → riceve OTP su WhatsApp → verifica → accede
5. Test negativo: numero NON registrato → nessun OTP, "se sei nel network riceverai il codice"
6. Test scadenza: aspetta 6 min → OTP non funziona
7. Test attempts: inserisce codice sbagliato 5 volte → lock
8. Test logout: click logout → cookie eliminato, accesso bloccato
9. Test middleware: `/network` senza cookie → redirect `/network/login`

### 13. Deploy

1. `pnpm build` locale → verifica no errori TS/lint
2. `git add -A && git commit -m "feat(network): add WhatsApp OTP login for approved resellers"`
3. `git push origin main`
4. SSH VPS:
   - aggiungere env vars nuove a `/root/energizzo.unvrslabs.dev/.env.local`
   - `cd /root/energizzo.unvrslabs.dev && git pull && pnpm install --prod=false && pnpm build && pm2 restart energizzo-crm --update-env`
5. Test su `https://ildispaccio.energy/network/login` con Emanuele come primo member approvato
6. Verifica log PM2 per eventuali errori WaSender

## Struttura file finale

```
src/
├── app/
│   ├── api/
│   │   └── network/
│   │       ├── auth/
│   │       │   ├── request-otp/route.ts       [NEW]
│   │       │   ├── verify-otp/route.ts        [NEW]
│   │       │   └── logout/route.ts            [NEW]
│   │       └── me/route.ts                    [NEW]
│   ├── network/
│   │   ├── (public)/
│   │   │   └── login/
│   │   │       └── page.tsx                   [NEW]
│   │   └── (protected)/
│   │       ├── layout.tsx                     [NEW]
│   │       └── page.tsx                       [NEW]
│   └── ...
├── components/
│   ├── network/
│   │   ├── login-form.tsx                     [NEW]
│   │   ├── navbar.tsx                         [NEW]
│   │   └── logout-button.tsx                  [NEW]
│   └── ...
├── lib/
│   ├── network/
│   │   ├── phone.ts                           [NEW]
│   │   ├── crypto.ts                          [NEW]
│   │   └── session.ts                         [NEW]
│   ├── wasender.ts                            [NEW]
│   └── supabase/
│       └── admin.ts | service.ts              [VERIFY/NEW]
├── middleware.ts                              [MODIFIED]
```

## Rischi / cose da monitorare

1. **WaSender quota / rate limit API**: se fallisce siamo ciechi — logging accurato
2. **Numeri duplicati**: un member con phone uguale a un altro viene bloccato da `unique` — gestire errore in insert manuale Emanuele
3. **Cookie domain in dev**: se `NETWORK_SESSION_COOKIE_DOMAIN=.ildispaccio.energy` viene settato in dev, il cookie non parte su localhost — quindi leave empty in dev
4. **Race condition OTP**: due richieste OTP concorrenti → possibile 2 OTP validi simultanei → mitigato invalidando vecchi otp in verify
5. **Buffer Nginx JWT**: già configurati in memoria Emanuele — cookie nostro è ~44 byte, no problem
6. **Refresh pagina login in Step 2**: stato OTP perso → deve ritentare. OK accettabile.

## Open questions (risolvibili in implementazione)

- Formato payload WaSender esatto (aspetto doc da Emanuele)
- Prefisso bot WhatsApp per intestazione messaggio (branding "Il Dispaccio" come sender name?)
- Log file PM2 per debug — `pm2 logs energizzo-crm`
