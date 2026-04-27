# Il Dispaccio Mobile — Design Spec

**Data**: 2026-04-28
**Stato**: approvato per implementazione
**Autori**: IL DIRETTORE (orchestrator) + Il Creativo (UI/UX) + Il Mobiliere (mobile native) + L'Architetto (CI/CD) + La Sentinella (security)
**Repo target**: `unvrslabs/ildispaccio-mobile` (da creare)
**Local path**: `/Users/emanuelemaccari/ildispaccio-mobile`

---

## 1. Obiettivo

App mobile nativa iOS + Android per i reseller del network "Il Dispaccio". Versione mobile-first dell'area `/network/*` della dashboard web, distribuita su App Store e Google Play. Esperienza premium con motion language, micro-interactions e feature native (Face ID, push, deep links, background fetch). La dashboard web `dash.ildispaccio.energy` rimane intatta — il mobile riusa il backend Next.js esistente come API.

**Target qualità**: livello Robinhood Gold / Linear iOS / Revolut Pro.

**Audience**: reseller energetici italiani 30-55 anni, uso in mobilità tra clienti.

## 2. Stack

### Core
- **Expo SDK 52+ managed workflow** (no bare RN)
- **React Native** + **TypeScript** strict mode
- **Expo Router** (file-based routing)
- **NativeWind** (Tailwind per RN — riusa tokens del web)
- **Tanstack Query** (cache + offline + retry)
- **Supabase JS** + `expo-secure-store` per session

### Animation & UI
- `react-native-reanimated@^3.16` — gesture/scroll/layout 120fps su UI thread
- `moti@^0.30` — declarative mount/unmount + variants
- `react-native-gesture-handler@^2.22` — pan/swipe nativi
- `@shopify/react-native-skia@^1.7` — chart custom + gradient mesh + sparkline
- `lottie-react-native@^7.x` — empty states + onboarding
- `expo-blur@~14.x` — liquid glass tab bar + sheet backdrop
- `expo-linear-gradient@~14.x` — card mesh + ticker fade-edge
- `expo-haptics@~14.x` — selection/impact/notification
- `@gorhom/bottom-sheet@^5.x` — sheet con snap points
- `expo-image@~2.x` — cache + blurhash placeholder

### Native iOS/Android
- `expo-local-authentication@~14.0` — Face ID / Touch ID / Android Biometric
- `expo-secure-store@~14.0` — Keychain / EncryptedSharedPreferences
- `expo-notifications@~0.29` — push base
- `expo-symbols@~0.2` — SF Symbols nativi
- `expo-linking` — Universal Links + App Links
- `expo-background-fetch` + `expo-task-manager` — refresh PUN mattutino
- `expo-av@~15.0` — background audio podcast
- `react-native-safe-area-context@~5.0` — dynamic island/notch perfetti
- `expo-screen-capture` — screenshot prevention su schermate riservate

### Build & Deploy
- **EAS Build** (3 profili: development / preview / production)
- **EAS Submit** (TestFlight + Play Internal)
- **EAS Update** (OTA hotfix per JS-only changes)
- **GitHub Actions** CI con release-please

### Security extra
- `react-native-ssl-public-key-pinning` — certificate pinning con 2-key rotation
- `jail-monkey` — jailbreak/root detection (warning soft, non blocco)
- `libphonenumber-js` — normalizzazione E.164

## 3. Repo & Project structure

```
ildispaccio-mobile/
├── app/                          # Expo Router (file-based)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx             # input numero
│   │   └── otp.tsx               # input codice 6 cifre
│   ├── (tabs)/
│   │   ├── _layout.tsx           # bottom tab bar liquid glass
│   │   ├── index.tsx             # Home (cockpit dial 4 KPI + ticker)
│   │   ├── delibere.tsx
│   │   ├── scadenze.tsx
│   │   ├── mercato.tsx
│   │   └── notifiche.tsx
│   ├── delibera/[numero].tsx     # detail con shared element
│   ├── _layout.tsx               # root con auth gate + biometric
│   └── +not-found.tsx
├── src/
│   ├── api/                      # client fetch verso dash.ildispaccio.energy
│   │   ├── client.ts             # axios/fetch con auth interceptor
│   │   ├── delibere.ts
│   │   ├── scadenze.ts
│   │   ├── market.ts
│   │   └── push.ts
│   ├── components/               # UI riusabile
│   │   ├── Card.tsx              # con mesh gradient
│   │   ├── PunTicker.tsx         # Skia digit-flip
│   │   ├── CountdownArc.tsx      # Skia progress ring
│   │   ├── ImportanceChip.tsx    # Moti morph
│   │   ├── BottomSheet.tsx
│   │   ├── Skeleton.tsx          # Shimmer Skia
│   │   ├── ChartLine.tsx         # Skia chart
│   │   └── HapticPressable.tsx   # wrapper standard
│   ├── features/                 # business logic per dominio
│   │   ├── auth/                 # OTP + biometric flow
│   │   ├── delibere/
│   │   ├── scadenze/
│   │   ├── market/
│   │   └── notifications/
│   ├── hooks/                    # useAuth, useDelibere, useMarket, ...
│   ├── stores/                   # zustand: session, theme, settings
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── push.ts
│   │   ├── deeplink.ts
│   │   ├── pinning.ts
│   │   ├── haptic.ts             # pattern centralizzati
│   │   └── motion.ts             # spring presets condivisi
│   ├── theme/                    # tokens, typography, gradients
│   ├── i18n/                     # default it
│   └── types/
├── assets/
│   ├── icon.png 1024             # logo ⚡D
│   ├── adaptive-icon.png         # Android foreground
│   ├── splash.png 1284x2778
│   └── fonts/                    # PlusJakartaSans, Orbitron, JetBrainsMono
├── .github/workflows/
│   ├── ci.yml                    # PR check
│   ├── build-preview.yml         # push main → EAS preview
│   └── release.yml               # tag v* → EAS production + submit
├── .husky/pre-commit             # lint-staged
├── app.config.ts                 # dinamico (variant-aware)
├── eas.json                      # 3 build profiles
├── .env.example
├── babel.config.js               # expo-router/babel + reanimated/plugin LAST
├── metro.config.js
├── tsconfig.json                 # strict, paths @/*
├── .eslintrc.cjs
├── .prettierrc
├── .lintstagedrc.json
├── jest.config.ts
└── package.json                  # pnpm, Node 20
```

## 4. Backend (riuso)

L'app NON ha backend proprio. Riusa il Next.js esistente su `https://dash.ildispaccio.energy`.

### Endpoints già pronti (riusati as-is)
- `POST /api/network/auth/request-otp` — invia OTP via WaSender
- `POST /api/network/auth/verify-otp` — verifica codice → Supabase session
- `GET /api/network/delibere` — lista paginata
- `GET /api/network/delibere/[numero]` — detail
- `GET /api/network/scadenze` — lista futura
- `GET /api/network/market/pun` — PUN current + history
- `GET /api/network/market/gas-storage` — riempimento stoccaggi
- `GET /api/network/market/entsoe/*` — load + renewable forecast
- `GET /api/network/notifications` — feed
- `POST /api/network/notifications/[id]/read`

### Endpoints da aggiungere al Next.js
- `POST /api/network/push-token` — registra Expo push token bind a member_id
- `DELETE /api/network/push-token` — invalidazione su logout
- `DELETE /api/network/account` — soft-delete GDPR Art.17 (cron hard-delete dopo 30gg)

## 5. Auth flow

```
[App start]
   ↓
[Check secure-store: session + refresh_token?]
   ├─ NO  → /login (input numero) → /otp (codice) → /tabs
   └─ YES → [Biometric prompt] → /tabs (se ok) | /login (se 3 fail biometric)
            └─ se >10min in background → re-prompt biometric
```

### Dettagli
- OTP TTL 5 min server-side, bcrypt hash, single-use, lockout 5 fail = 30min ban IP+phone
- Biometric come **unlock locale** della session esistente, NON fattore primario
- Fallback biometric fail: re-OTP WhatsApp (no passcode OS)
- Logout = `SecureStore.deleteItemAsync` tutte le keys + `supabase.auth.signOut({scope:'global'})` + invalidazione push token server-side

## 6. Scope MVP (v1.0)

5 schermate via bottom tab bar liquid glass.

### 6.1 Home
- Header: greeting orario + nome reseller
- **Cockpit dial 4 KPI** (Skia gauge animati, stagger 60ms al mount):
  - PUN today (live ticker digit-flip + sparkline 24h inline + delta % vs ieri rosso/verde)
  - Stoccaggi gas %
  - Prossima scadenza (countdown arc)
  - N delibere alta importanza ultime 7gg
- Lista 3 ultime delibere (mesh gradient card per importanza)
- Lista 3 prossime scadenze (countdown arc + label)
- Pull-to-refresh custom Lottie ⚡

### 6.2 Delibere
- Lista virtualized infinite scroll (FlashList)
- Search bar pinned top con haptic on focus
- Filtri: settore (eel/gas/com), importanza (alta/media/bassa), bookmark
- Card: codice + titolo + sectors chip + importanza chip + parallax 0.4×
- Detail (shared element transition):
  - Hero header con gradient mesh
  - AI summary
  - Scadenze annidate
  - Link PDF ARERA originale (apre in `WebView` o native browser)
  - Bottone "Salva" → bookmark persistito server-side

### 6.3 Scadenze
- Timeline groupata: oggi / questa settimana / questo mese / oltre
- Ogni item: countdown arc + label + delibera-link
- Tap → naviga a detail delibera (shared element)
- Pulse animation arc <24h

### 6.4 Mercato
- Tab top: Elettrico | Gas
- **Elettrico**: PUN ticker live + Skia line chart 14gg + breakdown 7 zone
- **Gas**: storage % + Skia line chart 60gg
- Pull-to-refresh
- Long-press chart → tooltip values + haptic

### 6.5 Notifiche
- Feed cronologico con badge non-letto
- Tipologie: delibera alta/critica, scadenza ≤7gg, podcast nuovo
- Tap → naviga a entity
- Swipe-to-archive (gesture-handler)
- Bell bounce animation al push live

### Out of scope v1.0
Bacheca, membri, podcast video, price engine, Max Power chat, testi integrati, profilo (oltre logout). Aggiunti in v1.x dopo validazione utenti.

## 7. Motion language

### Principi
- **Spring physics defaults**: damping 18 / stiffness 180 per tap, 22/90 per sheet
- **Worklet-first**: tutto sul UI thread (`useAnimatedStyle` + `useDerivedValue`)
- **60→120fps ProMotion ready**: nessun `setInterval`, solo `useFrameCallback`
- **Curve Apple-grade**: `cubic-bezier(0.32, 0.72, 0, 1)` via `Easing.bezier`
- **Durate**: micro 120ms, standard 240ms, deliberate 380ms
- **Haptic-paired**: ogni transizione >200ms accoppiata a feedback tattile

### Micro-interactions distintive (10)
1. **Tab bar liquid glass** — blur 80 + indicator morph spring + haptic on press
2. **PUN ticker flip live** — Skia digit-flip + glow rosso↑/verde↓ + sparkline 24h inline
3. **Mesh gradient delibera card** — Skia Shader colore derivato da importanza+settore (ogni card unica)
4. **Countdown arc scadenze** — progress ring radiale + pulse haptic-paired sotto 24h
5. **Cockpit dial home** — 4 KPI con Skia gauge animati al mount, stagger 60ms
6. **Shared element list→detail** — transizione fluida card→hero
7. **Parallax scroll cards** — translateY 0.4× su `useAnimatedScrollHandler`
8. **Pull-to-refresh Lottie ⚡** — niente spinner default
9. **Long-press preview blur sheet** — gesture-handler + haptic impactMedium
10. **Bell notification bounce** — Skia spring damping 8 al push live

## 8. Feature native (roadmap completo)

### MVP v1.0
| Feature | Libreria | Priorità |
|---|---|---|
| Face ID / Touch ID / Biometric | `expo-local-authentication` | MVP |
| Secure storage Keychain/EncryptedSharedPrefs | `expo-secure-store` | MVP |
| OTP autofill iOS | `textContentType="oneTimeCode"` nativo | MVP |
| Push notifications | `expo-notifications` + Expo Push API | MVP |
| Universal Links + App Links | `expo-linking` + AASA + assetlinks.json | MVP |
| Haptic feedback patterns | `expo-haptics` | MVP |
| SF Symbols iOS | `expo-symbols` | MVP |
| Background fetch PUN | `expo-background-fetch` + task-manager | MVP |
| Background audio podcast | `expo-av` staysActiveInBackground | MVP |
| Safe area perfetto | `react-native-safe-area-context` | MVP |
| App lock dopo 10min background | custom + AppState + biometric | MVP |
| Pull-to-refresh haptic | `RefreshControl` + haptics | MVP |

### v1.1 (post-launch)
- OTP autofill Android (`expo-sms-retriever`)
- Notification quick actions ("Segna letto", "Ricordami")
- Rich push con grafico PUN (attachments)
- App Shortcuts iOS (`expo-quick-actions`)
- Share Extension (condividi delibera da Safari)
- Material You themed icons Android

### v1.2+ (killer features)
- **Live Activities iOS** — countdown scadenza in lock screen + Dynamic Island (richiede config plugin custom + ActivityKit native target)
- **Widgets home screen** iOS (WidgetKit/SwiftUI) + Android (Glance)
- Siri Shortcuts ("Ehi Siri, PUN oggi?") — App Intents native
- Spotlight Search index delibere
- Dynamic app icon (cambia colore se PUN > soglia)

### Esplicitamente skippato
- ~~Apple Watch companion~~ — fuori roadmap
- ~~Anti-debug / anti-tamper~~ — overkill per sensibilità media

## 9. Architettura CI/CD

### app.config.ts dinamico
Legge `APP_VARIANT=development|preview|production` da env. Output:
- `dev`: bundle `dev.unvrslabs.ildispaccio.dev`, name "Dispaccio Dev", icon variante
- `preview`: bundle `dev.unvrslabs.ildispaccio.preview`, name "Dispaccio Preview"
- `prod`: bundle `dev.unvrslabs.ildispaccio`, name "Il Dispaccio"

`version` letto da `package.json` (single source). `runtimeVersion: { policy: "appVersion" }`.

### eas.json (3 profili)
- **development**: `developmentClient: true`, simulator iOS, channel `development`
- **preview**: APK Android (per QR ai pilota via Telegram) + ad-hoc iOS, channel `preview`, autoIncrement
- **production**: store-ready, channel `production`, autoIncrement, `appVersionSource: remote`

### EAS Submit
- iOS: `eas submit -p ios --profile production --latest` → TestFlight
- Android: service account JSON cifrato (git-crypt o EXPO secrets) → Play Internal

### GitHub Actions
- **ci.yml** (PR su `main`): pnpm i, `tsc --noEmit`, `eslint .`, `jest --ci`, `npx expo-doctor`
- **build-preview.yml** (push `main`): `eas build -p all --profile preview --non-interactive --no-wait` + post link Telegram
- **release.yml** (tag `v*`): `eas build -p all --profile production --auto-submit-with-profile=production`

### Branch strategy
- `main` protected (require PR + 1 review + CI verde + linear history)
- Feature: `feat/xxx`, fix: `fix/xxx`
- Conventional Commits enforced via commitlint
- **release-please** auto-PR con changelog + bump `package.json` → merge → tag `vX.Y.Z`

### OTA strategy
- **OTA via Expo Updates**: bug fix JS, copy, piccoli UI tweaks
- **Build store**: cambi nativi (SDK upgrade, nuovi expo-modules, permessi, bundle id, asset native)
- **Channel mapping**: profilo EAS = channel
- **runtimeVersion `appVersion`**: bump `version` invalida OTA precedenti, evita JS incompatibile su nativo vecchio

### Secrets richiesti
- `EXPO_TOKEN`
- `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `ASC_APP_ID`, `APPLE_TEAM_ID`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` (base64)
- `SENTRY_AUTH_TOKEN`
- `TELEGRAM_BOT_TOKEN` (per notifica preview build)

## 10. Security baseline

### MUST (35h totali)
- Secure-store per tutti i token, **mai AsyncStorage**
- Refresh token rotation Supabase + access TTL 1h, refresh 30gg sliding
- Logout completo: cleanup Keychain + signOut global + invalidate push token
- Biometric come **unlock locale**, NON fattore primario (re-OTP fallback)
- `LAPolicy.deviceOwnerAuthenticationWithBiometrics` (no passcode OS fallback)
- HTTPS-only + Android `network_security_config.xml` `cleartextTrafficPermitted=false`
- Zero secrets server-side nel bundle (solo `SUPABASE_ANON_KEY` + JWT user)
- Rate limit OTP server-side: 3/15min, 10/giorno + lockout 5 fail = 30min ban
- Normalizzazione E.164 con `libphonenumber-js`
- Push payload: solo `{type, entity_id, claim_jwt_short}` — no dati sensibili plaintext APNS/FCM
- Universal Links + App Links con asset verification (AASA + assetlinks.json)
- Whitelist path validi (`/network/*`, `/invito-network/[token]`)
- Privacy Manifest iOS `PrivacyInfo.xcprivacy` (Apple obbligatorio 2024+)
- No Crashlytics/Firebase Analytics → niente ATT prompt. Sentry self-hosted, `sendDefaultPii=false`
- Endpoint `DELETE /api/account` + UX in Profilo (Art.17 GDPR, soft-delete 30gg)
- Privacy Policy URL `ildispaccio.energy/privacy` (già live) linkata in App Store Connect + Play
- Permessi minimi: solo `NOTIFICATIONS` + `USE_BIOMETRIC` + giustificazione `NSFaceIDUsageDescription` "Sblocco rapido area network riservata"

### SHOULD (7h totali)
- **Certificate pinning** verso `dash.ildispaccio.energy` con `react-native-ssl-public-key-pinning` — 2 pin (current + backup), rotazione 6 mesi documentata
- `jail-monkey` jailbreak/root detection con warning soft (non blocco)
- Screenshot prevention `expo-screen-capture preventScreenCaptureAsync` su `/network/bacheca` e dettaglio membri (v1.1+)
- iOS app-switcher blur via `AppState` overlay
- Re-prompt biometric dopo 10min in background o cold start

## 11. Design tokens

### Color
- `emerald-500` `#10B981` primary
- `emerald-950` `#022C22` bg
- accent electric `#7CFFCB`
- warn `#F59E0B`
- danger `#EF4444`

### Spacing
4 / 8 / 12 / 16 / 24 / 32

### Radius
12 / 16 / 24 / full

### Typography
- Plus Jakarta Sans: 12 / 14 / 16 / 20 / 28
- Orbitron: 32 / 48 (display)
- JetBrains Mono: numeri PUN

## 12. Riferimenti visivi target

- **Robinhood Gold** — ticker live + dark emerald + transizioni sheet
- **Linear iOS** — typography density + command palette + spring snappy
- **Revolut Pro** — card stack parallax + gradient mesh + haptic richness
- **Arc Search** — blur layering + bottom sheet morphing
- **Bloomberg Terminal mobile** — data density professionale + mono numeric + flash update rosso/verde

## 13. Roadmap

### Settimana 1 — Fondamenta
- Scaffolding Expo + repo + CI/CD base
- `app.config.ts` dinamico + `eas.json` 3 profili
- Theme system (tokens, typography, motion presets)
- Auth OTP completo (login + otp screens + secure-store + biometric)
- Bottom tab bar liquid glass + 5 tab vuoti

### Settimana 2 — Home + Delibere
- Home cockpit dial 4 KPI (Skia gauge)
- PUN ticker live (Skia digit-flip)
- Mesh gradient delibera card (Skia Shader)
- Lista delibere virtualized + filtri + search
- Detail delibera con shared element transition

### Settimana 3 — Scadenze + Mercato + Notifiche
- Countdown arc Skia
- Timeline scadenze raggruppata
- Mercato Elettrico/Gas con Skia chart
- Feed notifiche + bell bounce
- Pipeline push completa (Expo Push API + endpoint Next.js + tabella `network_push_tokens`)

### Settimana 4 — Polish + Beta
- Haptic patterns rifiniti (success/warning/error)
- Skeleton loaders Skia shimmer
- Empty states Lottie
- Error boundaries + offline mode
- Splash screen + app icons
- EAS Build preview → QR Telegram ai pilota
- Sentry self-hosted integrato

### Settimana 5 — Submission
- TestFlight beta interno
- Play Internal Testing
- Privacy Manifest iOS
- App Store / Play listing assets (screenshots, descrizioni, categorie)
- Submit App Store + Play Store production
- Review iOS: 1-3gg | Review Android: 1-2gg

### v1.1 (settimana 7-8)
- Rich push + notification quick actions
- App Shortcuts iOS
- Share Extension
- OTP autofill Android
- Material You themed icons
- Screenshot prevention bacheca

### v1.2+ (mese 3+)
- Live Activities + Dynamic Island
- Widgets home screen iOS + Android
- Siri Shortcuts
- Spotlight Search

## 14. Cosa serve da Emanuele

| Item | Stato | Bloccante per | ETA |
|---|---|---|---|
| Apple Developer Program ($99/anno) | in attesa attivazione | TestFlight + App Store submit | settimana 5 |
| Google Play Console ($25 una tantum) | da fare domani | Play Internal + submit | settimana 5 |
| Bundle ID `dev.unvrslabs.ildispaccio` | confermato | — | — |
| Cert pinning autorizzato | confermato | — | — |
| Apple Watch | skippato definitivamente | — | — |

**Importante**: Apple/Google account NON bloccano sviluppo settimane 1-4. Lavoro inizia subito in locale con Expo Go + simulator iOS + emulator Android.

## 15. Decisioni d'ufficio (rimettibili in discussione)

- Expo managed (no bare RN) → meno frizione build native
- 5 tab in v1.0, **no Max Power chat in MVP** (richiede WS streaming, complica)
- Stessa palette web, no rebrand mobile
- Repo separato (no monorepo) → setup rapido, separazione team
- Apple Watch skippato definitivamente
- Cert pinning con 2-key rotation 6 mesi
- Sentry self-hosted (no Crashlytics → niente ATT prompt)
- release-please come single source release
- EAS credentials managed (no .p12 in repo)

## 16. KPI di successo

- **Tempo apertura → primo dato visibile**: <1.2s (cold start)
- **Frame rate sostenuto**: ≥60fps (target 120fps su ProMotion)
- **Crash-free sessions**: >99.5%
- **Push delivery rate**: >97%
- **Tempo OTP→login**: <8s (incluso WhatsApp delivery)
- **App size**: <80MB iOS, <60MB Android
- **Adoption rate** (% reseller installati / membri attivi): target 60% a 3 mesi
- **DAU/MAU**: target >40% a 3 mesi
- **App Store rating**: ≥4.5 stelle dopo 100 review
