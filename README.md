# 🐾 Paw Guardians (Street Dog Tracker)

A community platform to locate, track, feed, vaccinate and care for street dogs through a shared
map — built for India-scale usage on slow mobile networks. One codebase for **iOS, Android and
Web**.

| Layer | Tech |
| --- | --- |
| App | Expo SDK 56 · React Native 0.85 · TypeScript (strict) · Expo Router · NativeWind 4 |
| State | TanStack Query 5 (server) · Zustand 5 (client) · React Hook Form + Zod |
| Backend | Supabase: Postgres + PostGIS, Auth, Storage, Realtime, Edge Functions |
| Maps | react-native-maps (Google) on iOS/Android · Google Maps JS (vis.gl) on web |
| Push | Expo Push Service (FCM/APNs) triggered by pg_net → `push-fanout` edge function |

## Quick start (local)

Prereqs: Node 20+, **Docker Desktop** (for local Supabase), watchman.

```bash
npm install

# 1. Start the local Supabase stack (Postgres+PostGIS, Auth, Storage, Realtime)
npx supabase start          # first run downloads containers
npx supabase status         # shows URL + anon key

# 2. Configure env
cp .env.example .env        # paste the URL + anon key from `supabase status`

# 3. Create schema + demo data (25 Bengaluru dogs, 3 users)
npm run db:reset            # applies supabase/migrations + seed.sql
npm run db:types            # regenerates src/types/database.ts

# 4. Run the app
npm run web                 # browser (fastest feedback loop)
npx expo run:ios            # custom dev client — REQUIRED for maps/push (not Expo Go)
npx expo run:android
```

Demo logins (seeded): `asha@example.com` (admin) / `ravi@example.com` / `meera@example.com`,
password `password123`.

> **Expo Go does not work** for maps, Google sign-in or push — those are custom native modules.
> Use `expo run:ios|android` locally or EAS dev builds. The web target works with no native setup.

## Environment variables

See [.env.example](.env.example). Public (`EXPO_PUBLIC_*`) values are bundled into the app;
build-time values (`GOOGLE_MAPS_ANDROID_KEY`, `GOOGLE_MAPS_IOS_KEY`, `GOOGLE_IOS_URL_SCHEME`) are
read by [app.config.ts](app.config.ts) during prebuild and baked into native binaries.

### Key setup, in the order you'll need it

1. **Maps (Google Cloud, personal account)** — enable *Maps SDK for Android*, *Maps SDK for iOS*,
   *Maps JavaScript API*, *Places API (New)*. Create one key per platform and restrict them.
   Android keys are bound to package `com.hm99.pawguardians` + SHA-1 — register **both** your
   debug keystore and the EAS keystore SHA-1 or release maps render blank. Until the iOS key is
   set, the app silently falls back to Apple Maps on iOS.
2. **EAS + push** — `npx eas init` (writes the projectId used for Expo push tokens). Android:
   add `google-services.json` (Firebase) and upload the FCM V1 service-account key to Expo.
   iOS: `eas credentials` for APNs (needs a paid Apple Developer account; test on real devices).
3. **Google sign-in** — create OAuth client IDs (web + iOS + Android w/ SHA-1). The **web** client
   ID goes into Supabase's Google provider config *and* `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   (audience mismatch is the #1 sign-in failure). Set `GOOGLE_IOS_URL_SCHEME` (reversed iOS id).

### Push fan-out wiring

DB triggers POST via `pg_net` to the edge function. Store the function URL + service-role key in
**Vault** so the same trigger works locally and in production:

```sql
select vault.create_secret('http://host.docker.internal:54321/functions/v1/push-fanout', 'push_fanout_url');
select vault.create_secret('<service_role_key>', 'push_fanout_key');
```

Run the function locally with `npx supabase functions serve push-fanout`. Missing secrets simply
disable fan-out — writes never fail because of it.

## Project layout

```
src/app/            Expo Router routes: (tabs) Map|Dogs|Add|Alerts|Profile,
                    (auth) sign-in/sign-up/upgrade, dog/new, dog/[id]/(feed|medical|
                    vaccinate|report|edit), emergency/[id], settings/, admin/ (role-gated)
src/components/     ui/ (Button, Input, Screen…), map/ (DogMap platform split + clustering),
                    dog/ (DogCard, badges, timeline, filter sheet), forms/
src/features/       <feature>/{api,hooks,schemas}.ts — auth, dogs, feeding, medical,
                    emergencies, notifications, follows, profile
src/lib/            supabase client, queryClient, images (compress+upload), location,
                    places, pushNotifications, dogStatus (single color/badge source)
src/stores/         zustand: authStore, mapStore (shared search center + filters)
supabase/           config.toml, migrations/ (11 ordered files), seed.sql,
                    functions/push-fanout/
```

### Architecture rules

- **Status colors/badges have ONE source**: [src/lib/dogStatus.ts](src/lib/dogStatus.ts) +
  [src/constants/palette.js](src/constants/palette.js) (shared with Tailwind). Feeding
  thresholds (<24h green, 24–72h yellow, else red) are mirrored only in
  `fn_feeding_status()` ([migration 10](supabase/migrations/20260613000010_rpcs.sql)).
- **Map SDKs never leak** outside `src/components/map/` (ESLint-enforced). Everything renders
  through the `<DogMap>` contract in DogMap.types.ts.
- **Denormalized columns on `dogs`** (last_fed_at, health, counters, location) are written only
  by SECURITY DEFINER triggers; clients have column-level grants for community-editable fields.
- **Keyset pagination everywhere** (activity id cursors); no `count(*)` on big tables.
- **Anonymous users can contribute** (add/feed/report — low friction); commenting and upvotes
  require a full account (`is_anonymous` JWT claim checked in RLS).

## Database

11 migrations create: profiles + user_settings (private, GIST-indexed last_known_location for
push fan-out) · dogs (hot table, PostGIS geography + denorms) · dog_photos · dog_locations
(append-only) · feeding/vaccination/medical records · emergency_reports · activity_logs (single
timeline source, trigger-written) · notifications (Realtime) · push_tokens · dog_follows ·
community stubs (comments, upvotes, trust_events, content_reports) · storage buckets + policies.

Key RPCs: `dogs_within_radius`, `dogs_in_bbox`, `nearby_duplicate_check`, `get_dog_timeline`,
`users_to_notify` / `followers_to_notify` (service-role only), `mark_all_notifications_read`,
`admin_soft_delete_dog`.

## Deploying

```bash
# Backend (hosted Supabase project)
npx supabase link --project-ref <ref>
npx supabase db push
npx supabase functions deploy push-fanout --no-verify-jwt
# then: enable anonymous sign-ins + Google provider in the dashboard, create the
# two Vault secrets (prod URL/key), confirm buckets exist.

# Apps
npx eas build --profile production --platform all
npx expo export --platform web   # deploy dist/ to Vercel/Netlify/EAS Hosting
```

## Roadmap

**Shipped (MVP)** — auth (email/Google/anonymous + upgrade), dog profiles + photos, GPS duplicate
detection, map with clustering + 9 filters, address search, feeding with staleness colors +
optimistic updates, medical/vaccination/sterilization records, merged activity timeline,
emergency reports with community lifecycle, nearby + followed-dog push, live Alerts inbox,
follows, notification prefs, role-gated admin shell, dark mode, EN/HI i18n foundation.

**Next (schema already shipped)** — comments + upvotes UI · report-inaccurate flow ·
trust-score events + verified badges · vaccination-due reminders (pg_cron over
`vaccination_records.next_due_at`) · admin: merge duplicates, moderate users, resolve
content_reports · offline mutation queue · QR code per dog profile · CAPTCHA (Turnstile) for
anonymous spam control.

**Later** — population heatmap (`ST_HexagonGrid`) · AI photo duplicate detection (embeddings) ·
NGO dashboard + rescue org integration · adoption/foster listings · leaderboard ·
activity_logs partitioning (pg_partman) at ~10M rows.
