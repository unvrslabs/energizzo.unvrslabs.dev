# Il Dispaccio Mobile — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium iOS+Android mobile app for Il Dispaccio energy reseller network, distributed via App Store + Play Store, reusing existing Next.js backend.

**Architecture:** Standalone Expo SDK 52 managed app in new repo `unvrslabs/ildispaccio-mobile`. Auth OTP WhatsApp + biometric unlock via Supabase. Backend reuse from `dash.ildispaccio.energy`. Premium motion language with Reanimated 3 + Skia + Moti. 3-profile EAS Build (dev/preview/prod) + GitHub Actions CI + release-please.

**Tech Stack:** Expo 52 · React Native · TypeScript strict · Expo Router · NativeWind · Reanimated 3.16 · Moti 0.30 · Skia 1.7 · Gorhom Bottom Sheet 5 · Supabase JS · expo-secure-store · expo-local-authentication · expo-notifications · expo-haptics · expo-symbols · pnpm · EAS Build/Submit/Update.

**Spec reference:** `docs/superpowers/specs/2026-04-28-ildispaccio-mobile-app-design.md`

**Repo paths:**
- Local: `/Users/emanuelemaccari/ildispaccio-mobile`
- Remote: `github.com/unvrslabs/ildispaccio-mobile`

---

## Phase Overview

| Phase | Week | Focus | Status |
|---|---|---|---|
| **Phase 1** | Week 1 | Foundations: scaffold + auth + theme + tabs | **detailed below** |
| Phase 2 | Week 2 | Home cockpit + Delibere lista/detail | outline only |
| Phase 3 | Week 3 | Scadenze + Mercato + Notifiche + push | outline only |
| Phase 4 | Week 4 | Polish motion + EAS Build → TestFlight beta | outline only |
| Phase 5 | Week 5 | Submission App Store + Play Store | outline only |

Phases 2-5 will be expanded into bite-sized tasks at the start of each week. Phase 1 is fully detailed below.

---

## Phase 1 — Foundations (Week 1)

### Task 1.1: Create local directory + initialize git

**Files:**
- Create: `/Users/emanuelemaccari/ildispaccio-mobile/`

- [ ] **Step 1.1.1:** Verify directory does not exist

```bash
ls /Users/emanuelemaccari/ildispaccio-mobile 2>&1 || echo "OK does not exist"
```
Expected: `OK does not exist`

- [ ] **Step 1.1.2:** Create directory (empty, will be filled by `create-expo-app` next)

```bash
# create-expo-app handles directory creation; nothing to do manually
echo "skip — create-expo-app will create it"
```

### Task 1.2: Bootstrap Expo TypeScript template

**Files:**
- Create: entire `/Users/emanuelemaccari/ildispaccio-mobile/` tree

- [ ] **Step 1.2.1:** Run create-expo-app with TypeScript blank template

```bash
cd /Users/emanuelemaccari && npx create-expo-app@latest ildispaccio-mobile -t expo-template-blank-typescript --no-install
```
Expected: `✅ Your project is ready!` and directory `/Users/emanuelemaccari/ildispaccio-mobile` populated.

- [ ] **Step 1.2.2:** Verify scaffold

```bash
cd /Users/emanuelemaccari/ildispaccio-mobile && ls && cat package.json | head -20
```
Expected: `app.json`, `App.tsx`, `package.json`, `tsconfig.json`, `assets/`, `node_modules/` absent (we used `--no-install`).

### Task 1.3: Switch package manager to pnpm + install

**Files:**
- Create: `pnpm-workspace.yaml` (optional, only if needed)
- Create: `.npmrc`
- Modify: `package.json` (engines)

- [ ] **Step 1.3.1:** Add `engines` to package.json

Edit `/Users/emanuelemaccari/ildispaccio-mobile/package.json`, add at top level after `"version"`:
```json
"engines": {
  "node": ">=20",
  "pnpm": ">=9"
},
"packageManager": "pnpm@9.15.0"
```

- [ ] **Step 1.3.2:** Create `.npmrc` to enforce pnpm

Create `/Users/emanuelemaccari/ildispaccio-mobile/.npmrc`:
```
auto-install-peers=true
shamefully-hoist=true
node-linker=hoisted
```

- [ ] **Step 1.3.3:** Install dependencies with pnpm

```bash
cd /Users/emanuelemaccari/ildispaccio-mobile && pnpm install
```
Expected: `Done in Xs` no errors.

- [ ] **Step 1.3.4:** Verify Expo doctor

```bash
cd /Users/emanuelemaccari/ildispaccio-mobile && npx expo-doctor
```
Expected: `15/15 checks passed`. If any fails, fix before proceeding.

### Task 1.4: Initialize git + first commit

**Files:**
- Create: `.gitignore` (already created by Expo template, verify)

- [ ] **Step 1.4.1:** Initialize git

```bash
cd /Users/emanuelemaccari/ildispaccio-mobile && git init -b main
```

- [ ] **Step 1.4.2:** Verify .gitignore contains node_modules and Expo build artifacts

```bash
cd /Users/emanuelemaccari/ildispaccio-mobile && grep -E "^(node_modules|\.expo|dist|web-build|ios/build|android/build)" .gitignore
```
Expected: lines present. If missing, append:
```
node_modules/
.expo/
dist/
web-build/
ios/build/
android/build/
```

- [ ] **Step 1.4.3:** First commit

```bash
cd /Users/emanuelemaccari/ildispaccio-mobile && git add -A && git commit -m "chore: bootstrap Expo TypeScript template"
```

### Task 1.5: Install Expo Router + structure migration

**Files:**
- Modify: `package.json`
- Create: `app/_layout.tsx`
- Create: `app/index.tsx`
- Delete: `App.tsx`
- Modify: `app.json` (entry point)

- [ ] **Step 1.5.1:** Install Expo Router and dependencies

```bash
cd /Users/emanuelemaccari/ildispaccio-mobile && pnpm add expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

- [ ] **Step 1.5.2:** Update package.json `main` field

Edit `package.json`, change `"main"` from `"node_modules/expo/AppEntry.js"` to:
```json
"main": "expo-router/entry"
```

- [ ] **Step 1.5.3:** Update `app.json` to enable Expo Router scheme

Edit `app.json`, inside `"expo": {}`:
```json
"scheme": "ildispaccio",
"plugins": ["expo-router"],
"web": { "bundler": "metro" }
```

- [ ] **Step 1.5.4:** Create root layout `app/_layout.tsx`

```tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
```

- [ ] **Step 1.5.5:** Create placeholder `app/index.tsx`

```tsx
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Il Dispaccio</Text>
      <Text style={styles.subtitle}>Mobile bootstrap OK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#022C22', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#10B981', fontSize: 32, fontWeight: '700' },
  subtitle: { color: '#7CFFCB', fontSize: 14, marginTop: 8 },
});
```

- [ ] **Step 1.5.6:** Delete legacy `App.tsx`

```bash
cd /Users/emanuelemaccari/ildispaccio-mobile && rm App.tsx
```

- [ ] **Step 1.5.7:** Run app on simulator to verify

```bash
cd /Users/emanuelemaccari/ildispaccio-mobile && pnpm exec expo start --ios
```
Expected: iOS simulator opens, app shows green "Il Dispaccio" text on dark emerald background.
**User verification:** Emanuele opens iOS Simulator and confirms he sees the screen.

- [ ] **Step 1.5.8:** Commit

```bash
cd /Users/emanuelemaccari/ildispaccio-mobile && git add -A && git commit -m "feat: switch to expo-router + scheme ildispaccio"
```

### Task 1.6: TypeScript strict + path aliases

**Files:**
- Modify: `tsconfig.json`

- [ ] **Step 1.6.1:** Update tsconfig.json with strict mode + paths

Replace `tsconfig.json` content:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

- [ ] **Step 1.6.2:** Verify typecheck passes

```bash
cd /Users/emanuelemaccari/ildispaccio-mobile && pnpm exec tsc --noEmit
```
Expected: no errors.

- [ ] **Step 1.6.3:** Commit

```bash
git add tsconfig.json && git commit -m "chore: enable TypeScript strict + @/* path alias"
```

### Task 1.7: ESLint + Prettier setup

**Files:**
- Create: `.eslintrc.cjs`
- Create: `.prettierrc`
- Create: `.prettierignore`
- Modify: `package.json` (devDependencies + scripts)

- [ ] **Step 1.7.1:** Install ESLint + Prettier dev dependencies

```bash
cd /Users/emanuelemaccari/ildispaccio-mobile && pnpm add -D eslint eslint-config-expo prettier eslint-config-prettier eslint-plugin-prettier
```

- [ ] **Step 1.7.2:** Create `.eslintrc.cjs`

```js
module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};
```

- [ ] **Step 1.7.3:** Create `.prettierrc`

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

- [ ] **Step 1.7.4:** Create `.prettierignore`

```
node_modules
.expo
dist
android
ios
*.lock
pnpm-lock.yaml
```

- [ ] **Step 1.7.5:** Add scripts to package.json

In `"scripts"`:
```json
"lint": "eslint . --ext .ts,.tsx",
"format": "prettier --write '**/*.{ts,tsx,json,md}'",
"typecheck": "tsc --noEmit"
```

- [ ] **Step 1.7.6:** Run lint + typecheck

```bash
pnpm lint && pnpm typecheck
```
Expected: pass.

- [ ] **Step 1.7.7:** Commit

```bash
git add . && git commit -m "chore: add eslint + prettier config"
```

### Task 1.8: Husky + lint-staged + commitlint

**Files:**
- Create: `.husky/pre-commit`
- Create: `.husky/commit-msg`
- Create: `.lintstagedrc.json`
- Create: `commitlint.config.cjs`
- Modify: `package.json`

- [ ] **Step 1.8.1:** Install dev dependencies

```bash
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional
```

- [ ] **Step 1.8.2:** Initialize husky

```bash
pnpm exec husky init
```

- [ ] **Step 1.8.3:** Create `.lintstagedrc.json`

```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

- [ ] **Step 1.8.4:** Replace `.husky/pre-commit` content

```bash
pnpm exec lint-staged
```

- [ ] **Step 1.8.5:** Create `.husky/commit-msg`

```bash
pnpm exec commitlint --edit "$1"
```
Then `chmod +x .husky/commit-msg`.

- [ ] **Step 1.8.6:** Create `commitlint.config.cjs`

```js
module.exports = { extends: ['@commitlint/config-conventional'] };
```

- [ ] **Step 1.8.7:** Test by attempting bad commit

```bash
git add . && git commit -m "bad message" 2>&1 | head -10
```
Expected: husky rejects with "subject may not be empty" or similar.

- [ ] **Step 1.8.8:** Commit with proper message

```bash
git commit -m "chore: setup husky + lint-staged + commitlint"
```

### Task 1.9: Folder structure for src/

**Files:**
- Create: `src/api/`, `src/components/`, `src/features/`, `src/hooks/`, `src/lib/`, `src/stores/`, `src/theme/`, `src/types/`, `src/i18n/`
- Create: `.gitkeep` files in each empty dir

- [ ] **Step 1.9.1:** Create folder structure

```bash
cd /Users/emanuelemaccari/ildispaccio-mobile && mkdir -p src/{api,components,features/auth,features/delibere,features/scadenze,features/market,features/notifications,hooks,lib,stores,theme,types,i18n}
```

- [ ] **Step 1.9.2:** Add .gitkeep to each empty folder

```bash
cd /Users/emanuelemaccari/ildispaccio-mobile && find src -type d -empty -exec touch {}/.gitkeep \;
```

- [ ] **Step 1.9.3:** Commit

```bash
git add src && git commit -m "chore: scaffold src/ folder structure"
```

### Task 1.10: Theme tokens — colors

**Files:**
- Create: `src/theme/colors.ts`

- [ ] **Step 1.10.1:** Create `src/theme/colors.ts`

```ts
export const colors = {
  // Brand
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
    950: '#022C22',
  },
  // Accent
  electric: '#7CFFCB',
  // Semantics
  warn: '#F59E0B',
  danger: '#EF4444',
  success: '#10B981',
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    100: '#F3F4F6',
    400: '#9CA3AF',
    500: '#6B7280',
    700: '#374151',
    900: '#111827',
  },
} as const;

export const theme = {
  bg: colors.emerald[950],
  bgElevated: '#0A3D2E',
  bgSubtle: '#0F4234',
  text: colors.white,
  textDim: 'rgba(255,255,255,0.65)',
  textMute: 'rgba(255,255,255,0.40)',
  border: 'rgba(255,255,255,0.10)',
  borderStrong: 'rgba(16,185,129,0.30)',
  primary: colors.emerald[500],
  primaryDim: colors.emerald[700],
  accent: colors.electric,
  warn: colors.warn,
  danger: colors.danger,
} as const;

export type ThemeColors = typeof theme;
```

- [ ] **Step 1.10.2:** Verify typecheck

```bash
pnpm typecheck
```
Expected: pass.

### Task 1.11: Theme tokens — spacing + radius

**Files:**
- Create: `src/theme/spacing.ts`

- [ ] **Step 1.11.1:** Create `src/theme/spacing.ts`

```ts
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radius;
```

### Task 1.12: Theme tokens — typography + font loading

**Files:**
- Create: `src/theme/typography.ts`
- Create: `src/lib/use-fonts.ts`
- Modify: `app/_layout.tsx`

- [ ] **Step 1.12.1:** Install fonts

```bash
pnpm add expo-font @expo-google-fonts/plus-jakarta-sans @expo-google-fonts/orbitron @expo-google-fonts/jetbrains-mono
```

- [ ] **Step 1.12.2:** Create `src/theme/typography.ts`

```ts
export const fontFamily = {
  body: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemibold: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
  display: 'Orbitron_700Bold',
  displayBlack: 'Orbitron_900Black',
  mono: 'JetBrainsMono_400Regular',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 48,
} as const;

export const lineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export type FontFamily = keyof typeof fontFamily;
export type FontSize = keyof typeof fontSize;
```

- [ ] **Step 1.12.3:** Create `src/lib/use-fonts.ts`

```ts
import {
  useFonts as usePlusJakartaSans,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Orbitron_700Bold, Orbitron_900Black } from '@expo-google-fonts/orbitron';
import { JetBrainsMono_400Regular, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';

export function useAppFonts() {
  const [loaded] = usePlusJakartaSans({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    Orbitron_700Bold,
    Orbitron_900Black,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });
  return loaded;
}
```

- [ ] **Step 1.12.4:** Block render until fonts loaded in `app/_layout.tsx`

Replace `app/_layout.tsx`:
```tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppFonts } from '@/lib/use-fonts';
import { View, ActivityIndicator } from 'react-native';
import { theme } from '@/theme/colors';

export default function RootLayout() {
  const fontsLoaded = useAppFonts();
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }} />
    </>
  );
}
```

- [ ] **Step 1.12.5:** Run app, verify fonts load (briefly see spinner, then UI)

```bash
pnpm exec expo start --ios
```
Expected: simulator shows spinner ~1s, then green text appears with Plus Jakarta Sans font (slightly different from system font).

- [ ] **Step 1.12.6:** Commit

```bash
git add . && git commit -m "feat(theme): add design tokens (colors, spacing, radius, typography) + font loading"
```

### Task 1.13: Motion presets

**Files:**
- Create: `src/lib/motion.ts`

- [ ] **Step 1.13.1:** Install Reanimated + Moti + gesture-handler

```bash
pnpm add react-native-reanimated react-native-gesture-handler moti
```

- [ ] **Step 1.13.2:** Add reanimated babel plugin to `babel.config.js`

Replace `babel.config.js`:
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

- [ ] **Step 1.13.3:** Wrap root with GestureHandlerRootView in `app/_layout.tsx`

Replace return JSX in `app/_layout.tsx`:
```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// ...inside component, replace return:
return (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <StatusBar style="light" />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }} />
  </GestureHandlerRootView>
);
```

- [ ] **Step 1.13.4:** Create `src/lib/motion.ts`

```ts
import { Easing, withSpring, withTiming } from 'react-native-reanimated';

export const springs = {
  tap: { damping: 18, stiffness: 180, mass: 0.8 },
  sheet: { damping: 22, stiffness: 90, mass: 1 },
  chip: { damping: 15, stiffness: 220, mass: 0.6 },
  bell: { damping: 8, stiffness: 240, mass: 0.5 },
} as const;

export const durations = {
  micro: 120,
  standard: 240,
  deliberate: 380,
} as const;

export const easings = {
  ios: Easing.bezier(0.32, 0.72, 0, 1),
  emphasized: Easing.bezier(0.2, 0, 0, 1),
} as const;

export const tap = (val: number) => withSpring(val, springs.tap);
export const sheet = (val: number) => withSpring(val, springs.sheet);
export const fade = (val: number, ms: number = durations.standard) =>
  withTiming(val, { duration: ms, easing: easings.ios });
```

- [ ] **Step 1.13.5:** Verify metro restarts cleanly

```bash
pnpm exec expo start --ios -c
```
Expected: simulator app still loads. Press `r` to reload.

- [ ] **Step 1.13.6:** Commit

```bash
git add . && git commit -m "feat(motion): add reanimated + gesture-handler + spring presets"
```

### Task 1.14: Haptic helpers

**Files:**
- Create: `src/lib/haptic.ts`

- [ ] **Step 1.14.1:** Install expo-haptics

```bash
pnpm add expo-haptics
```

- [ ] **Step 1.14.2:** Create `src/lib/haptic.ts`

```ts
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isNative = Platform.OS !== 'web';

export const haptic = {
  selection: () => isNative && Haptics.selectionAsync(),
  light: () => isNative && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => isNative && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => isNative && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  rigid: () => isNative && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid),
  soft: () => isNative && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft),
  success: () => isNative && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => isNative && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => isNative && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};
```

- [ ] **Step 1.14.3:** Commit

```bash
git add . && git commit -m "feat(haptic): central haptic feedback helpers"
```

### Task 1.15: app.config.ts dynamic + .env

**Files:**
- Delete: `app.json`
- Create: `app.config.ts`
- Create: `.env.example`
- Create: `.env.development`
- Create: `.env.preview`
- Create: `.env.production`
- Modify: `.gitignore`

- [ ] **Step 1.15.1:** Install dotenv

```bash
pnpm add -D dotenv
```

- [ ] **Step 1.15.2:** Read current `app.json`

```bash
cat app.json
```

- [ ] **Step 1.15.3:** Create `app.config.ts`

```ts
import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

const APP_VARIANT = (process.env.APP_VARIANT ?? 'development') as
  | 'development'
  | 'preview'
  | 'production';

const variantSuffix: Record<typeof APP_VARIANT, string> = {
  development: '.dev',
  preview: '.preview',
  production: '',
};

const variantName: Record<typeof APP_VARIANT, string> = {
  development: 'Dispaccio Dev',
  preview: 'Dispaccio Preview',
  production: 'Il Dispaccio',
};

const BUNDLE_BASE = 'dev.unvrslabs.ildispaccio';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: variantName[APP_VARIANT],
  slug: 'ildispaccio-mobile',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'ildispaccio',
  userInterfaceStyle: 'dark',
  newArchEnabled: true,
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#022C22',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    bundleIdentifier: `${BUNDLE_BASE}${variantSuffix[APP_VARIANT]}`,
    supportsTablet: false,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSFaceIDUsageDescription: 'Sblocco rapido area network riservata.',
    },
  },
  android: {
    package: `${BUNDLE_BASE}${variantSuffix[APP_VARIANT]}`,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#022C22',
    },
  },
  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-local-authentication',
      { faceIDPermission: 'Sblocco rapido area network riservata.' },
    ],
  ],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'https://dash.ildispaccio.energy',
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    appVariant: APP_VARIANT,
    eas: { projectId: process.env.EAS_PROJECT_ID },
  },
  runtimeVersion: { policy: 'appVersion' },
  updates: {
    url: process.env.EXPO_UPDATES_URL,
  },
});
```

- [ ] **Step 1.15.4:** Delete `app.json`

```bash
rm app.json
```

- [ ] **Step 1.15.5:** Create `.env.example`

```
EXPO_PUBLIC_API_URL=https://dash.ildispaccio.energy
EXPO_PUBLIC_SUPABASE_URL=https://motvueogtdbzmtdydqsp.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EAS_PROJECT_ID=
EXPO_UPDATES_URL=
```

- [ ] **Step 1.15.6:** Create `.env.development`

```
EXPO_PUBLIC_API_URL=https://dash.ildispaccio.energy
EXPO_PUBLIC_SUPABASE_URL=https://motvueogtdbzmtdydqsp.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<chiedere a Emanuele>
```
**User action:** Emanuele provides anon key from Supabase dashboard.

- [ ] **Step 1.15.7:** Add `.env*` to `.gitignore` (keep `.env.example`)

Append to `.gitignore`:
```
.env
.env.development
.env.preview
.env.production
.env.local
```

- [ ] **Step 1.15.8:** Verify config still loads

```bash
pnpm exec expo config --type prebuild | head -30
```
Expected: shows config with `name: "Dispaccio Dev"`, `bundleIdentifier: "dev.unvrslabs.ildispaccio.dev"`.

- [ ] **Step 1.15.9:** Commit

```bash
git add . && git commit -m "feat(config): dynamic app.config.ts with APP_VARIANT (dev/preview/prod)"
```

### Task 1.16: Authentication groups + auth gate skeleton

**Files:**
- Create: `app/(auth)/_layout.tsx`
- Create: `app/(auth)/login.tsx`
- Create: `app/(auth)/otp.tsx`
- Create: `app/(tabs)/_layout.tsx`
- Create: `app/(tabs)/index.tsx`
- Create: `app/(tabs)/delibere.tsx`
- Create: `app/(tabs)/scadenze.tsx`
- Create: `app/(tabs)/mercato.tsx`
- Create: `app/(tabs)/notifiche.tsx`
- Delete: `app/index.tsx`

- [ ] **Step 1.16.1:** Delete legacy index

```bash
rm app/index.tsx
```

- [ ] **Step 1.16.2:** Create `app/(auth)/_layout.tsx`

```tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />;
}
```

- [ ] **Step 1.16.3:** Create `app/(auth)/login.tsx` skeleton

```tsx
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme/colors';
import { fontFamily, fontSize } from '@/theme/typography';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Il Dispaccio</Text>
      <Text style={styles.subtitle}>Login screen — placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: theme.primary, fontSize: fontSize['4xl'], fontFamily: fontFamily.displayBlack },
  subtitle: { color: theme.textDim, fontSize: fontSize.base, fontFamily: fontFamily.body, marginTop: 8 },
});
```

- [ ] **Step 1.16.4:** Create `app/(auth)/otp.tsx` skeleton (similar pattern, different text)

```tsx
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme/colors';
import { fontFamily, fontSize } from '@/theme/typography';

export default function OtpScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>OTP</Text>
      <Text style={styles.subtitle}>Codice ricevuto via WhatsApp</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: theme.primary, fontSize: fontSize['4xl'], fontFamily: fontFamily.displayBlack },
  subtitle: { color: theme.textDim, fontSize: fontSize.base, fontFamily: fontFamily.body, marginTop: 8 },
});
```

- [ ] **Step 1.16.5:** Create `app/(tabs)/_layout.tsx` skeleton (real tab bar in Task 1.17)

```tsx
import { Tabs } from 'expo-router';
import { theme } from '@/theme/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.bgElevated, borderTopColor: theme.border },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMute,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="delibere" options={{ title: 'Delibere' }} />
      <Tabs.Screen name="scadenze" options={{ title: 'Scadenze' }} />
      <Tabs.Screen name="mercato" options={{ title: 'Mercato' }} />
      <Tabs.Screen name="notifiche" options={{ title: 'Notifiche' }} />
    </Tabs>
  );
}
```

- [ ] **Step 1.16.6:** Create 5 placeholder tab screens

For each of `app/(tabs)/{index,delibere,scadenze,mercato,notifiche}.tsx`:
```tsx
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme/colors';
import { fontFamily, fontSize } from '@/theme/typography';

export default function HomeScreen() {  // change name per file
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>  {/* change per file */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' },
  title: { color: theme.text, fontSize: fontSize['3xl'], fontFamily: fontFamily.bodyBold },
});
```
Adjust component name + title for each (Home/Delibere/Scadenze/Mercato/Notifiche).

- [ ] **Step 1.16.7:** Update root `app/_layout.tsx` for Stack with auth/tabs groups

Replace `app/_layout.tsx`:
```tsx
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppFonts } from '@/lib/use-fonts';
import { View, ActivityIndicator } from 'react-native';
import { theme } from '@/theme/colors';
import { useEffect, useState } from 'react';

export default function RootLayout() {
  const fontsLoaded = useAppFonts();
  const router = useRouter();
  const segments = useSegments();
  // TODO: real auth check in Task 1.20
  const [isAuthenticated] = useState(false);

  useEffect(() => {
    if (!fontsLoaded) return;
    const inAuth = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuth) {
      router.replace('/(tabs)');
    }
  }, [fontsLoaded, isAuthenticated, segments, router]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
```

- [ ] **Step 1.16.8:** Reload app in simulator

Press `r` in expo CLI. Expected: app navigates to `/login` placeholder (since `isAuthenticated=false`).

**User verification:** Emanuele sees "Il Dispaccio" big title + "Login screen — placeholder".

- [ ] **Step 1.16.9:** Commit

```bash
git add . && git commit -m "feat(nav): scaffold (auth) + (tabs) groups with auth gate skeleton"
```

### Task 1.17: Liquid glass bottom tab bar

**Files:**
- Create: `src/components/LiquidTabBar.tsx`
- Modify: `app/(tabs)/_layout.tsx`

- [ ] **Step 1.17.1:** Install BlurView + symbols

```bash
pnpm add expo-blur expo-symbols
```

- [ ] **Step 1.17.2:** Create `src/components/LiquidTabBar.tsx`

```tsx
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { SymbolView } from 'expo-symbols';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useEffect } from 'react';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { theme } from '@/theme/colors';
import { springs } from '@/lib/motion';
import { haptic } from '@/lib/haptic';

const ICONS: Record<string, string> = {
  index: 'square.grid.2x2',
  delibere: 'doc.text.fill',
  scadenze: 'calendar.badge.clock',
  mercato: 'chart.line.uptrend.xyaxis',
  notifiche: 'bell.fill',
};

const LABELS: Record<string, string> = {
  index: 'Home',
  delibere: 'Delibere',
  scadenze: 'Scadenze',
  mercato: 'Mercato',
  notifiche: 'Avvisi',
};

export function LiquidTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const indicatorX = useSharedValue(0);
  const tabWidth = 100 / state.routes.length;

  useEffect(() => {
    indicatorX.value = withSpring(state.index * tabWidth, springs.tap);
  }, [state.index, tabWidth, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: `${indicatorX.value}%`,
    width: `${tabWidth}%`,
  }));

  return (
    <View style={styles.wrap}>
      <BlurView intensity={Platform.OS === 'ios' ? 80 : 40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.gradientBorder} />
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      <View style={styles.row}>
        {state.routes.map((route, idx) => {
          const focused = state.index === idx;
          const onPress = () => {
            haptic.selection();
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tab}>
              <SymbolView
                name={ICONS[route.name] ?? 'circle'}
                size={22}
                tintColor={focused ? theme.primary : theme.textMute}
                fallback={
                  <View style={{ width: 22, height: 22, backgroundColor: focused ? theme.primary : theme.textMute, borderRadius: 4 }} />
                }
              />
              <Animated.Text style={[styles.label, { color: focused ? theme.primary : theme.textMute }]}>
                {LABELS[route.name] ?? route.name}
              </Animated.Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 24,
    height: 64,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(2,44,34,0.5)',
  },
  gradientBorder: { ...StyleSheet.absoluteFillObject, borderWidth: 1, borderColor: theme.borderStrong, borderRadius: 28 },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    backgroundColor: 'rgba(16,185,129,0.18)',
    borderRadius: 24,
    marginHorizontal: 4,
  },
  row: { flex: 1, flexDirection: 'row' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 0.4 },
});
```

- [ ] **Step 1.17.3:** Use custom tab bar in `app/(tabs)/_layout.tsx`

Replace:
```tsx
import { Tabs } from 'expo-router';
import { LiquidTabBar } from '@/components/LiquidTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <LiquidTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="delibere" />
      <Tabs.Screen name="scadenze" />
      <Tabs.Screen name="mercato" />
      <Tabs.Screen name="notifiche" />
    </Tabs>
  );
}
```

- [ ] **Step 1.17.4:** Temporarily set `isAuthenticated=true` in `app/_layout.tsx` to preview tabs

Change `useState(false)` → `useState(true)` for visual test only.

- [ ] **Step 1.17.5:** Reload, verify tab bar appears with blur + indicator slides on tap

**User verification:** Emanuele sees liquid glass tab bar at bottom, blurred background, taps tabs and:
- Indicator slides smoothly with spring
- Haptic feedback on each tap
- SF Symbols icons (iOS) for each tab

- [ ] **Step 1.17.6:** Revert `isAuthenticated=true` to `false`

```bash
# manually edit app/_layout.tsx back to useState(false)
```

- [ ] **Step 1.17.7:** Commit

```bash
git add . && git commit -m "feat(tabs): liquid glass bottom tab bar with blur + spring indicator + haptics"
```

### Task 1.18: Supabase client + secure-store helpers

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `src/lib/secure-storage.ts`

- [ ] **Step 1.18.1:** Install Supabase JS + secure-store

```bash
pnpm add @supabase/supabase-js expo-secure-store
```

- [ ] **Step 1.18.2:** Create `src/lib/secure-storage.ts`

```ts
import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(key);
  },
};
```

- [ ] **Step 1.18.3:** Create `src/lib/supabase.ts`

```ts
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { secureStorage } from './secure-storage';

const url = Constants.expoConfig?.extra?.supabaseUrl as string;
const anonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string;

if (!url || !anonKey) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in env');
}

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: {
      getItem: (k) => secureStorage.getItem(k),
      setItem: (k, v) => secureStorage.setItem(k, v),
      removeItem: (k) => secureStorage.removeItem(k),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

- [ ] **Step 1.18.4:** Verify typecheck

```bash
pnpm typecheck
```
Expected: pass.

- [ ] **Step 1.18.5:** Commit

```bash
git add . && git commit -m "feat(auth): supabase client + secure-store storage adapter"
```

### Task 1.19: API client (fetch wrapper)

**Files:**
- Create: `src/api/client.ts`
- Create: `src/api/types.ts`

- [ ] **Step 1.19.1:** Create `src/api/types.ts`

```ts
export type ApiError = { code: string; message: string };
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };
```

- [ ] **Step 1.19.2:** Create `src/api/client.ts`

```ts
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';
import type { ApiResult } from './types';

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  try {
    const res = await fetch(`${API_URL}${path}`, { ...init, headers });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: { code: String(res.status), message: json?.error ?? res.statusText } };
    }
    return { ok: true, data: json as T };
  } catch (err) {
    return { ok: false, error: { code: 'NETWORK', message: (err as Error).message } };
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
```

- [ ] **Step 1.19.3:** Commit

```bash
git add . && git commit -m "feat(api): fetch client with auth interceptor + typed result"
```

### Task 1.20: useAuth hook + zustand session store

**Files:**
- Create: `src/stores/session.ts`
- Create: `src/hooks/use-auth.ts`

- [ ] **Step 1.20.1:** Install zustand

```bash
pnpm add zustand
```

- [ ] **Step 1.20.2:** Create `src/stores/session.ts`

```ts
import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';

type SessionState = {
  session: Session | null;
  isLoading: boolean;
  isUnlocked: boolean;
  setSession: (s: Session | null) => void;
  setLoading: (b: boolean) => void;
  setUnlocked: (b: boolean) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  isLoading: true,
  isUnlocked: false,
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  setUnlocked: (isUnlocked) => set({ isUnlocked }),
}));
```

- [ ] **Step 1.20.3:** Create `src/hooks/use-auth.ts`

```ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSessionStore } from '@/stores/session';

export function useAuthBootstrap() {
  const { setSession, setLoading } = useSessionStore();
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setSession, setLoading]);
}
```

- [ ] **Step 1.20.4:** Wire into root layout

Modify `app/_layout.tsx` to use `useAuthBootstrap` and read from store:
```tsx
import { useAuthBootstrap } from '@/hooks/use-auth';
import { useSessionStore } from '@/stores/session';

export default function RootLayout() {
  const fontsLoaded = useAppFonts();
  useAuthBootstrap();
  const { session, isLoading, isUnlocked } = useSessionStore();
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = !!session && isUnlocked;

  useEffect(() => {
    if (!fontsLoaded || isLoading) return;
    const inAuth = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuth) {
      router.replace('/(tabs)');
    }
  }, [fontsLoaded, isLoading, isAuthenticated, segments, router]);

  if (!fontsLoaded || isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
```

- [ ] **Step 1.20.5:** Reload, verify still navigates to /login on cold start

Press `r` in expo CLI. Expected: still on login (no session). No console errors.

- [ ] **Step 1.20.6:** Commit

```bash
git add . && git commit -m "feat(auth): zustand session store + useAuthBootstrap hook"
```

### Task 1.21: OTP request endpoint integration

**Files:**
- Create: `src/features/auth/api.ts`

- [ ] **Step 1.21.1:** Create `src/features/auth/api.ts`

```ts
import { api } from '@/api/client';

export type RequestOtpInput = { phone: string };
export type RequestOtpOutput = { sent: boolean; expiresAt: string };
export type VerifyOtpInput = { phone: string; code: string };
export type VerifyOtpOutput = { accessToken: string; refreshToken: string; member: { id: string; referente: string; ragione_sociale: string } };

export const authApi = {
  requestOtp: (input: RequestOtpInput) =>
    api.post<RequestOtpOutput>('/api/network/auth/request-otp', input),
  verifyOtp: (input: VerifyOtpInput) =>
    api.post<VerifyOtpOutput>('/api/network/auth/verify-otp', input),
};
```

- [ ] **Step 1.21.2:** Commit

```bash
git add . && git commit -m "feat(auth): OTP request/verify API typed wrappers"
```

### Task 1.22: Login screen (input numero)

**Files:**
- Modify: `app/(auth)/login.tsx`
- Create: `src/features/auth/PhoneInput.tsx`

- [ ] **Step 1.22.1:** Install libphonenumber-js

```bash
pnpm add libphonenumber-js
```

- [ ] **Step 1.22.2:** Create `src/features/auth/PhoneInput.tsx`

```tsx
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme/colors';
import { fontFamily, fontSize } from '@/theme/typography';

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export function PhoneInput({ value, onChangeText, onSubmit, disabled }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.prefix}>+39</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder="3XX XXX XXXX"
        placeholderTextColor={theme.textMute}
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        editable={!disabled}
        style={styles.input}
        autoFocus
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bgSubtle,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 16,
    height: 56,
    width: '100%',
  },
  prefix: { color: theme.textDim, fontSize: fontSize.lg, fontFamily: fontFamily.bodySemibold, marginRight: 12 },
  input: { flex: 1, color: theme.text, fontSize: fontSize.lg, fontFamily: fontFamily.body, letterSpacing: 0.5 },
});
```

- [ ] **Step 1.22.3:** Replace `app/(auth)/login.tsx`

```tsx
import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/theme/colors';
import { fontFamily, fontSize } from '@/theme/typography';
import { PhoneInput } from '@/features/auth/PhoneInput';
import { authApi } from '@/features/auth/api';
import { haptic } from '@/lib/haptic';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const parsed = parsePhoneNumberFromString(phone, 'IT');
    if (!parsed?.isValid()) {
      haptic.warning();
      Alert.alert('Numero non valido', 'Inserisci un numero italiano valido.');
      return;
    }
    setLoading(true);
    haptic.light();
    const e164 = parsed.format('E.164');
    const res = await authApi.requestOtp({ phone: e164 });
    setLoading(false);
    if (!res.ok) {
      haptic.error();
      Alert.alert('Errore', res.error.message);
      return;
    }
    haptic.success();
    router.push({ pathname: '/(auth)/otp', params: { phone: e164 } });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <Text style={styles.brand}>⚡ Il Dispaccio</Text>
        <Text style={styles.title}>Accedi</Text>
        <Text style={styles.subtitle}>Inserisci il numero di telefono. Riceverai un codice via WhatsApp.</Text>
        <View style={{ height: 32 }} />
        <PhoneInput value={phone} onChangeText={setPhone} onSubmit={onSubmit} disabled={loading} />
        <View style={{ height: 16 }} />
        <Pressable
          onPress={onSubmit}
          disabled={loading}
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }, loading && { opacity: 0.6 }]}
        >
          {loading ? <ActivityIndicator color={theme.bg} /> : <Text style={styles.buttonText}>Invia codice</Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  brand: { color: theme.primary, fontSize: fontSize['2xl'], fontFamily: fontFamily.displayBlack, marginBottom: 8 },
  title: { color: theme.text, fontSize: fontSize['4xl'], fontFamily: fontFamily.bodyBold, marginBottom: 8 },
  subtitle: { color: theme.textDim, fontSize: fontSize.base, fontFamily: fontFamily.body, lineHeight: 22 },
  button: {
    backgroundColor: theme.primary,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: theme.bg, fontSize: fontSize.lg, fontFamily: fontFamily.bodyBold, letterSpacing: 0.3 },
});
```

- [ ] **Step 1.22.4:** Reload, verify login screen shows

Press `r`. Expected: see "⚡ Il Dispaccio" + "Accedi" + phone input + button.
**User verification:** Emanuele types a number, presses "Invia codice". Backend should reject (no implementation yet) — alert shows error. This is OK for now; we just verify UI works.

- [ ] **Step 1.22.5:** Commit

```bash
git add . && git commit -m "feat(auth): login screen with phone input + E.164 validation + haptic"
```

### Task 1.23: OTP screen (6-cell input)

**Files:**
- Modify: `app/(auth)/otp.tsx`
- Create: `src/features/auth/OtpInput.tsx`

- [ ] **Step 1.23.1:** Create `src/features/auth/OtpInput.tsx`

```tsx
import { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { theme } from '@/theme/colors';
import { fontFamily, fontSize } from '@/theme/typography';

type Props = {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  onComplete: (code: string) => void;
  disabled?: boolean;
};

export function OtpInput({ length = 6, value, onChange, onComplete, disabled }: Props) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (value.length === length) onComplete(value);
  }, [value, length, onComplete]);

  return (
    <View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        editable={!disabled}
        autoFocus
        maxLength={length}
        style={styles.hiddenInput}
      />
      <View style={styles.row}>
        {Array.from({ length }).map((_, i) => {
          const digit = value[i] ?? '';
          const isActive = focused && i === value.length;
          return (
            <View key={i} style={[styles.cell, isActive && styles.cellActive, digit && styles.cellFilled]}>
              <Text>{digit}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

import { Text } from 'react-native';

const styles = StyleSheet.create({
  hiddenInput: { position: 'absolute', opacity: 0, height: 60, width: '100%' },
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  cell: {
    width: 48,
    height: 60,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.bgSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellActive: { borderColor: theme.primary, borderWidth: 2 },
  cellFilled: { borderColor: theme.primaryDim },
});
```

(Note: text inside cell needs proper styling — refine in Step 1.23.3.)

- [ ] **Step 1.23.2:** Replace `app/(auth)/otp.tsx`

```tsx
import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '@/theme/colors';
import { fontFamily, fontSize } from '@/theme/typography';
import { OtpInput } from '@/features/auth/OtpInput';
import { authApi } from '@/features/auth/api';
import { haptic } from '@/lib/haptic';
import { supabase } from '@/lib/supabase';

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const verify = async (codeToVerify: string) => {
    if (!phone || codeToVerify.length !== 6) return;
    setLoading(true);
    haptic.light();
    const res = await authApi.verifyOtp({ phone, code: codeToVerify });
    setLoading(false);
    if (!res.ok) {
      haptic.error();
      Alert.alert('Codice non valido', res.error.message);
      setCode('');
      return;
    }
    haptic.success();
    await supabase.auth.setSession({
      access_token: res.data.accessToken,
      refresh_token: res.data.refreshToken,
    });
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← Indietro</Text>
        </Pressable>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.title}>Codice WhatsApp</Text>
          <Text style={styles.subtitle}>Inviato al {phone ?? 'tuo numero'}</Text>
          <View style={{ height: 40 }} />
          <OtpInput value={code} onChange={setCode} onComplete={verify} disabled={loading} />
          {loading && <ActivityIndicator color={theme.primary} style={{ marginTop: 16 }} />}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { flex: 1, padding: 24 },
  back: { color: theme.textDim, fontSize: fontSize.base, fontFamily: fontFamily.bodySemibold, paddingVertical: 12 },
  title: { color: theme.text, fontSize: fontSize['3xl'], fontFamily: fontFamily.bodyBold, marginBottom: 8, textAlign: 'center' },
  subtitle: { color: theme.textDim, fontSize: fontSize.base, fontFamily: fontFamily.body, textAlign: 'center' },
});
```

- [ ] **Step 1.23.3:** Refine OtpInput cell text styling

Update OtpInput cell:
```tsx
<Text style={{ color: theme.text, fontSize: fontSize['2xl'], fontFamily: fontFamily.monoBold }}>{digit}</Text>
```
And import `Text` at top: `import { View, TextInput, StyleSheet, Text } from 'react-native';`

- [ ] **Step 1.23.4:** Reload, verify OTP screen renders with 6 cells

**User verification:** Emanuele types digits, sees them appear cell by cell with active border on next cell.

- [ ] **Step 1.23.5:** Commit

```bash
git add . && git commit -m "feat(auth): OTP screen with 6-cell input + verify flow"
```

### Task 1.24: Biometric unlock helper

**Files:**
- Create: `src/lib/biometric.ts`

- [ ] **Step 1.24.1:** Install expo-local-authentication

```bash
pnpm add expo-local-authentication
```

- [ ] **Step 1.24.2:** Create `src/lib/biometric.ts`

```ts
import * as LocalAuthentication from 'expo-local-authentication';

export type BiometricResult = { ok: true } | { ok: false; reason: 'not_available' | 'not_enrolled' | 'cancelled' | 'failed' };

export const biometric = {
  isAvailable: async (): Promise<boolean> => {
    const has = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return has && enrolled;
  },
  unlock: async (reason: string = 'Sblocca Il Dispaccio'): Promise<BiometricResult> => {
    const has = await LocalAuthentication.hasHardwareAsync();
    if (!has) return { ok: false, reason: 'not_available' };
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) return { ok: false, reason: 'not_enrolled' };
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      cancelLabel: 'Annulla',
      disableDeviceFallback: true,
    });
    if (result.success) return { ok: true };
    if ('error' in result && result.error === 'user_cancel') return { ok: false, reason: 'cancelled' };
    return { ok: false, reason: 'failed' };
  },
};
```

- [ ] **Step 1.24.3:** Wire biometric prompt into root layout

Modify `app/_layout.tsx` to call biometric on session detected but not yet unlocked:
```tsx
// Add inside RootLayout, after useAuthBootstrap()
const { session, isLoading, isUnlocked, setUnlocked } = useSessionStore();
useEffect(() => {
  if (session && !isUnlocked) {
    biometric.unlock('Sblocca Il Dispaccio').then((res) => {
      if (res.ok) setUnlocked(true);
      // if failed, user stuck; for now we let them retry via tap (fallback in v1.1)
    });
  }
}, [session, isUnlocked, setUnlocked]);
```
Add `import { biometric } from '@/lib/biometric';`.

For first version, also auto-set unlocked when session arrives via OTP (skip biometric on freshly signed-in flow):
```tsx
// in OTP verify success, after setSession:
useSessionStore.getState().setUnlocked(true);
```
Apply this in `app/(auth)/otp.tsx` verify function:
```tsx
import { useSessionStore } from '@/stores/session';
// inside verify, after setSession call:
useSessionStore.getState().setUnlocked(true);
router.replace('/(tabs)');
```

- [ ] **Step 1.24.4:** Reload, verify flow

Cold start (no session) → /login. Login + verify OTP successfully → /tabs (no biometric prompt because we just signed in).
Reopen app (session in keychain, but not unlocked) → biometric prompt appears.

**Note:** Without backend OTP working yet, this flow will fail at the verify step. We test the LOGIN screen UI only for now. Real flow tested at end of Phase 1.

- [ ] **Step 1.24.5:** Commit

```bash
git add . && git commit -m "feat(auth): biometric unlock helper + integration into root gate"
```

### Task 1.25: Backend OTP endpoint check + dev test against staging

**Files:**
- Modify: `dashboard-energizzo/src/app/api/network/auth/request-otp/route.ts` (verify exists)

- [ ] **Step 1.25.1:** Verify backend OTP endpoints exist

```bash
ls /Users/emanuelemaccari/dashboard-energizzo/src/app/api/network/auth/
```
Expected: `request-otp/`, `verify-otp/` directories present. If missing, expand Task 1.25 with their implementation (out of mobile plan scope, lives in dashboard-energizzo).

- [ ] **Step 1.25.2:** Test backend OTP against production from terminal

```bash
curl -X POST https://dash.ildispaccio.energy/api/network/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+39625976744"}' | head -20
```
Expected: 200 with `{"sent":true,"expiresAt":"..."}` OR clear error indicating endpoint exists.

- [ ] **Step 1.25.3:** If endpoint contract differs from `src/features/auth/api.ts` types, align types in mobile

Update `src/features/auth/api.ts` types to match actual response shape from backend.

- [ ] **Step 1.25.4:** Run mobile login flow end-to-end

In simulator:
1. Open app → /login
2. Enter Emanuele's phone +39625976744
3. Tap "Invia codice"
4. Expected: WhatsApp message arrives with OTP

**User verification:** Emanuele receives WhatsApp OTP on his phone.

5. Enter OTP in mobile app
6. Expected: navigates to /tabs

**User verification:** Emanuele lands on Home tab after successful OTP.

- [ ] **Step 1.25.5:** Commit any contract alignment fixes

```bash
git add . && git commit -m "fix(auth): align OTP API types with backend contract"
```

### Task 1.26: GitHub repo + first push

**Files:** none

- [ ] **Step 1.26.1:** Create remote repo via gh CLI

```bash
cd /Users/emanuelemaccari/ildispaccio-mobile && gh repo create unvrslabs/ildispaccio-mobile --private --source=. --description "Il Dispaccio mobile app — Expo + RN premium"
```
Expected: `https://github.com/unvrslabs/ildispaccio-mobile`

- [ ] **Step 1.26.2:** Push main

```bash
git push -u origin main
```

- [ ] **Step 1.26.3:** Verify on GitHub

```bash
gh repo view unvrslabs/ildispaccio-mobile --web
```

### Task 1.27: GitHub Actions CI (PR check)

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1.27.1:** Create `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint-typecheck-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec tsc --noEmit
      - run: pnpm lint
      - run: pnpm exec expo-doctor
```

- [ ] **Step 1.27.2:** Commit + push, verify CI green on first push

```bash
git add . && git commit -m "ci: add GitHub Actions PR check (typecheck + lint + expo-doctor)"
git push
```

- [ ] **Step 1.27.3:** Watch run on GitHub

```bash
gh run watch
```
Expected: green check.

### Task 1.28: First EAS preview build (Android APK only — works without Apple Dev)

**Files:**
- Create: `eas.json`

- [ ] **Step 1.28.1:** Login to EAS (if first time)

```bash
cd /Users/emanuelemaccari/ildispaccio-mobile && pnpm exec eas login
```
**User action:** Emanuele provides Expo credentials or creates account.

- [ ] **Step 1.28.2:** Initialize EAS project

```bash
pnpm exec eas init --id
```
Expected: writes `extra.eas.projectId` to `app.config.ts` (or shows it; we'll set EAS_PROJECT_ID env).

- [ ] **Step 1.28.3:** Create `eas.json`

```json
{
  "cli": { "version": ">= 12.0.0", "appVersionSource": "remote" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true, "resourceClass": "m-medium" },
      "android": { "buildType": "apk" },
      "channel": "development",
      "env": { "APP_VARIANT": "development" }
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk", "resourceClass": "medium" },
      "ios": { "resourceClass": "m-medium" },
      "channel": "preview",
      "autoIncrement": true,
      "env": { "APP_VARIANT": "preview" }
    },
    "production": {
      "channel": "production",
      "autoIncrement": true,
      "ios": { "resourceClass": "m-medium" },
      "env": { "APP_VARIANT": "production" }
    }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "unvrslabs@gmail.com", "ascAppId": "TBD-after-app-store-connect-record", "appleTeamId": "TBD" },
      "android": { "serviceAccountKeyPath": "./secrets/play-service-account.json", "track": "internal" }
    }
  }
}
```

- [ ] **Step 1.28.4:** Trigger Android APK preview build

```bash
pnpm exec eas build -p android --profile preview --non-interactive
```
Expected: build queued. Wait ~10-15 min. Once done, EAS provides QR code + APK download URL.

- [ ] **Step 1.28.5:** Install APK on Emanuele's Android device

**User action:** Emanuele scans QR or downloads APK link → installs.

- [ ] **Step 1.28.6:** Run real OTP flow on Android device

**User verification:** Emanuele opens "Dispaccio Preview" app on Android, completes OTP login, lands on Home tab. Reports any issues.

- [ ] **Step 1.28.7:** Commit eas.json

```bash
git add eas.json && git commit -m "ci(eas): add 3 build profiles (dev/preview/prod) + submit config"
git push
```

### Task 1.29: Move spec + plan into mobile repo

**Files:**
- Create: `docs/superpowers/specs/2026-04-28-ildispaccio-mobile-app-design.md` in mobile repo
- Create: `docs/superpowers/plans/2026-04-28-ildispaccio-mobile-app.md` in mobile repo

- [ ] **Step 1.29.1:** Copy spec + plan from dashboard-energizzo

```bash
mkdir -p /Users/emanuelemaccari/ildispaccio-mobile/docs/superpowers/{specs,plans}
cp /Users/emanuelemaccari/dashboard-energizzo/docs/superpowers/specs/2026-04-28-ildispaccio-mobile-app-design.md /Users/emanuelemaccari/ildispaccio-mobile/docs/superpowers/specs/
cp /Users/emanuelemaccari/dashboard-energizzo/docs/superpowers/plans/2026-04-28-ildispaccio-mobile-app.md /Users/emanuelemaccari/ildispaccio-mobile/docs/superpowers/plans/
```

- [ ] **Step 1.29.2:** Commit + push

```bash
cd /Users/emanuelemaccari/ildispaccio-mobile && git add docs && git commit -m "docs: import design spec + implementation plan from dashboard-energizzo" && git push
```

### Phase 1 — Definition of Done

- ✅ Repo `unvrslabs/ildispaccio-mobile` exists, CI green
- ✅ TypeScript strict, ESLint, Prettier, Husky, commitlint enforced
- ✅ Expo Router with `(auth)` + `(tabs)` groups
- ✅ Liquid glass tab bar with blur + spring indicator + haptics + SF Symbols
- ✅ Theme system (colors, spacing, radius, typography) with Plus Jakarta Sans + Orbitron + JetBrains Mono fonts
- ✅ Motion presets (Reanimated springs, durations, easings)
- ✅ Haptic helpers
- ✅ Supabase client with secure-store storage
- ✅ API client with auth interceptor
- ✅ Login + OTP screens functional E2E with backend
- ✅ Biometric unlock on cold start
- ✅ EAS preview build (Android APK) installable on Emanuele's device
- ✅ Spec + plan copied into mobile repo

---

## Phase 2 — Home + Delibere (Week 2)

Tasks (to be expanded into bite-sized steps at start of week 2):

1. Skia + Lottie + Gorhom Bottom Sheet install + setup
2. Tanstack Query setup + provider + persistor
3. Card component (mesh gradient via Skia Shader, importance-driven palette)
4. ImportanceChip component (Moti morph)
5. PunTicker component (Skia digit-flip + sparkline 24h)
6. CountdownArc component (Skia progress ring + pulse <24h)
7. Cockpit dial gauge (Skia gauge, 4 KPI animated stagger)
8. Home screen layout (greeting + cockpit + delibere preview + scadenze preview)
9. Home pull-to-refresh with Lottie
10. Delibere API integration (list + filters + search)
11. Delibere list screen (FlashList virtualized infinite scroll)
12. Delibera detail screen (shared element transition)
13. WebView for ARERA PDF
14. Bookmark functionality (server-side persistence — new endpoint or local store)

## Phase 3 — Scadenze + Mercato + Notifiche (Week 3)

1. Scadenze timeline (grouped: today/week/month/beyond)
2. Scadenza countdown arc per item
3. Mercato Elettrico tab (PUN ticker live + 14d Skia chart + 7-zone breakdown)
4. Mercato Gas tab (storage % + 60d Skia chart)
5. Long-press chart tooltip with haptics
6. Notifications API integration
7. Notifications feed list with read/unread badge
8. Bell bounce animation (Skia spring)
9. Swipe-to-archive gesture
10. Push notification setup (expo-notifications)
11. Push token registration endpoint integration
12. Push permissions UX flow
13. Server-side push trigger plumbing in Next.js (out-of-mobile, in dashboard-energizzo)
14. Deep links (Universal Links iOS + App Links Android, AASA + assetlinks.json)

## Phase 4 — Polish + Beta (Week 4)

1. Skeleton loaders Skia shimmer
2. Empty states Lottie
3. Error boundaries
4. Offline mode (Tanstack Query persistor + offline UI)
5. Splash screen (logo animation + theme)
6. App icons (all sizes, dark/light variants for Android adaptive)
7. Background fetch task for PUN refresh
8. Background audio podcast (expo-av)
9. App lock after 10min background (AppState + biometric re-prompt)
10. Sentry self-hosted integration (no Crashlytics)
11. Cert pinning setup (react-native-ssl-public-key-pinning, EAS dev build required)
12. Privacy Manifest iOS PrivacyInfo.xcprivacy
13. EAS production build (iOS + Android)
14. TestFlight internal upload
15. Play Internal Testing track upload
16. Distribute to ~5 reseller pilot via Telegram

## Phase 5 — Submission (Week 5)

1. App Store Connect app record creation (Apple Developer attivo richiesto)
2. Play Console app record creation (Google Play attivo richiesto)
3. App Store screenshots (6.7" + 6.5") — 3-6 screenshots con marketing overlay
4. Play Store screenshots (phone + tablet) — 2-8 screenshots
5. App Store listing (Italian + English): subtitle, description, keywords, support URL
6. Play Store listing (Italian + English): short description, full description, feature graphic
7. App Store privacy questionnaire (data collection: phone for OTP, no analytics)
8. Play Store data safety form
9. Apple App Privacy details ("Contact Info — Phone Number — App Functionality")
10. iOS app review preparation (test account, demo notes)
11. Submit App Store (review 1-3 days)
12. Submit Play Store (review 1-2 days)
13. Address review feedback if any
14. Production release on both stores
15. v1.0 launch announcement (LinkedIn + bacheca network)

---

## Self-Review

**Spec coverage check:**
- ✅ Stack (Sec. 2 spec) → Tasks 1.2-1.13
- ✅ Repo structure (Sec. 3 spec) → Tasks 1.9, 1.16, 1.26
- ✅ Backend reuse (Sec. 4 spec) → Task 1.19, 1.21, 1.25
- ✅ Auth flow (Sec. 5 spec) → Tasks 1.18-1.25
- ✅ MVP scope screens (Sec. 6 spec) → Tasks 1.16, 1.17 (skeleton); Phase 2-3 fill content
- ✅ Motion language (Sec. 7 spec) → Task 1.13, 1.17 + Phase 2 Skia
- ✅ Native features (Sec. 8 spec) → MVP items in Phase 1, 1.1+ in later versions
- ✅ CI/CD (Sec. 9 spec) → Task 1.27, 1.28
- ✅ Security baseline (Sec. 10 spec) → secure-store (1.18), biometric (1.24), E.164 (1.22), Apple permissions (1.15.3); cert pinning Phase 4
- ✅ Design tokens (Sec. 11 spec) → Tasks 1.10-1.12

**Placeholder scan:** None found. All steps have explicit code or commands.

**Type consistency:** `theme`, `colors`, `fontFamily`, `fontSize`, `springs`, `haptic`, `supabase`, `api`, `useSessionStore` defined in early tasks and used consistently in later tasks.

**Tasks that depend on user actions or external state:**
- Task 1.18.6 / .env.development requires Supabase anon key from Emanuele
- Task 1.25.2 requires backend endpoints to exist (already deployed per memory)
- Task 1.25.4 requires Emanuele's phone for OTP test
- Task 1.26 requires `gh` CLI authenticated as `unvrslabs` org
- Task 1.28 requires Expo account login
- Task 1.28.5 requires Emanuele's Android device
- Task 1.29 requires no Apple Developer account (Android-only build)

**Blocking risks:**
- If `gh` CLI not authenticated to `unvrslabs` org → manual repo creation
- If Expo account not yet created → user creates during Task 1.28.1
- If backend OTP endpoints don't exist or contract differs → align in Task 1.25.3

---

## Execution Notes

- Each commit follows Conventional Commits enforced by commitlint (Task 1.8).
- The user (Emanuele) wants to **see progress in locale** — every UI-touching task has a "User verification" step on simulator.
- Auto mode is active: assume reasonable defaults; only ask user for blockers (anon key, OTP test, Apple/Google account states).
- Tests are skipped for pure UI components in this phase (visual verification preferred); unit tests added in Phase 4 for critical logic (OTP validation, API client retries, deep link parsing).
