# Paw Guardians — agent notes

Cross-platform (iOS/Android/Web) street-dog care app. Expo SDK 56 + Supabase. Read README.md for
setup; this file covers conventions that aren't obvious from the code.

## Commands

- `npx tsc --noEmit` — typecheck (strict; must stay clean)
- `npx expo lint` — ESLint (expo flat config + map-import guard)
- `npm run web` / `npx expo run:ios|android` — Expo Go does NOT work (native maps/push)
- `npm run db:reset` / `npm run db:types` — local Supabase (requires Docker)
- Verify bundling without launching: `npx expo export --platform web --output-dir /tmp/check`

## Hard rules

- Dog status colors/badges: ONLY via `src/lib/dogStatus.ts` + `src/constants/palette.js`
  (palette.js is CJS so tailwind.config.js shares it — don't convert to TS).
- Feeding thresholds live in exactly two files: `src/constants/feeding.ts` and
  `fn_feeding_status()` in `supabase/migrations/*_rpcs.sql`. Change both or neither.
- Never import react-native-maps / @vis.gl/react-google-maps outside `src/components/map/`
  (ESLint enforces). Map features go through the `DogMapProps` contract.
- TanStack query keys only from `src/constants/queryKeys.ts`.
- Denormalized `dogs` columns (last_fed_at, counters, location, has_active_emergency…) are
  trigger-owned — never write them from the client; column grants will reject it anyway.
- Keyset pagination only (no offset beyond the capped radius RPC, no count(*) on
  activity_logs/feeding_records).
- New tables: enable RLS + policies in the same migration; SECURITY DEFINER functions must
  `set search_path = public, extensions`.
- `supabase/functions/` is Deno — excluded from tsconfig/eslint; don't import app code into it.

## State of the build

- src/types/database.ts is hand-written pending first `npm run db:types` run (needs Docker);
  regenerate and reconcile when available.
- Push needs `npx eas init` (projectId) + FCM/APNs credentials before tokens register.
- iOS uses Apple Maps until GOOGLE_MAPS_IOS_KEY is set (see app.config.ts extra flag).
- Community features (comments/upvotes/trust/reports) have schema + RLS but stub UI.
