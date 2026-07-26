# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Outpost — a cooperative accountability web app for a small friend group
doing a job search together. Members post tagged updates, comment,
set group-visible goals, and jointly grow a shared "village" through a
small two-currency building economy. No per-person rankings anywhere —
everything (points, money, buildings) is shared at the Group level.

## Commands

```bash
npm install
npx prisma migrate deploy   # apply committed migrations to a fresh dev.db
npm run dev                 # start Next.js (Turbopack) on localhost:3000
npm run build                # production build (also runs the TS type check)
npm run lint                 # eslint (flat config, eslint.config.mjs)
npx tsc --noEmit -p tsconfig.json   # type-check only, no build
```

There is no test suite in this repo yet.

After any change to `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name <description>   # creates + applies a migration
npx prisma generate                            # regenerate the client (see below)
```

**Environment note:** on this machine Node isn't on the system `PATH`; a
portable Node install lives at
`%LOCALAPPDATA%\node-portable\node-v22.14.0-win-x64`. Prefix it onto
`PATH` for any shell invoking `node`/`npm`/`npx` in this repo.

## Architecture

**Prisma client generation is non-default.** The schema uses the newer
`"prisma-client"` generator (not `prisma-client-js`), output to
`src/generated/prisma` (gitignored — must run `npx prisma generate`
after cloning or after any schema change). Two consequences that are
easy to trip over:
- Import from the `/client` subpath, not the package root:
  `import { PrismaClient } from "@/generated/prisma/client"`.
- This generator ships no bundled query engine — `PrismaClient` must be
  constructed with a driver adapter. The singleton in `src/lib/prisma.ts`
  wires up `@prisma/adapter-libsql` (the `@libsql/client` driver) against
  `DATABASE_URL`, with an optional `TURSO_AUTH_TOKEN`. The schema's
  `datasource` provider stays `"sqlite"` either way — locally
  `DATABASE_URL="file:./dev.db"` opens the same on-disk file this
  generator has always used (no separate SQLite driver needed for dev);
  in production `DATABASE_URL` instead points at a remote Turso/libSQL
  database (`libsql://<db>.turso.io`) with `TURSO_AUTH_TOKEN` set,
  since Vercel's serverless functions have no persistent local disk.

**Auth** is NextAuth v5 (beta) with the Credentials provider and JWT
sessions (no `Session` table — the cookie itself is the source of
truth). Config lives in `src/lib/auth.ts`, which sets `trustHost: true`
so Auth.js accepts the host it's actually deployed behind (Vercel
preview/production domains) instead of requiring an exact `AUTH_URL`
match. `src/lib/session.ts` exports `getCurrentUser()`, which layers a
Prisma lookup (including the user's `Group`) on top of `auth()` and is
what most server components use. Session typing is augmented in
`src/types/next-auth.d.ts`.

**Deployment (Vercel + Turso):** the app is designed to deploy to
Vercel's free Hobby tier with the database on Turso's free tier — see
`.env.example` for the required production environment variables
(`DATABASE_URL`, `TURSO_AUTH_TOKEN`, `AUTH_SECRET`). Provisioning the
actual Vercel project and Turso database are one-time manual steps
done through their dashboards/CLIs, not something this codebase
automates. Applying schema migrations to Turso, however, **cannot** go
through `prisma migrate deploy` — libSQL's remote protocol isn't one
Prisma's migration engine understands (only the `@prisma/adapter-libsql`
*client* driver adapter speaks it), so `prisma.config.ts`'s
`datasource.url` has no way to reach it either. Instead,
`scripts/turso-migrate.mjs` applies each `prisma/migrations/*/migration.sql`
file directly over the same libSQL client the app uses, tracking
applied state in a `_prisma_migrations` bookkeeping table so re-runs
skip what's already applied.

This runs **automatically** as the last step of `npm run build`
(`scripts/turso-migrate-on-deploy.mjs` — a thin guard that only invokes
`turso-migrate.mjs` when `DATABASE_URL` is a `libsql://` URL, so local
builds against `dev.db` are unaffected), which means every Vercel
deployment applies its own pending migrations before going live — a
migration can no longer ship without being applied to production, and
if the migration itself fails, the build fails and Vercel keeps the
previous deployment live instead of promoting broken code. (This was
added after exactly that gap caused a production outage: a migration
was committed and deployed but never applied to Turso, breaking every
authenticated page.) To run it by hand — e.g. against a freshly
provisioned Turso database before the first deploy, or to debug —
invoke the underlying script directly:

```bash
DATABASE_URL="libsql://<db>.turso.io" TURSO_AUTH_TOKEN="<token>" node scripts/turso-migrate.mjs
```

**Data model / v1 constraint:** a `User` belongs to at most one `Group`
(single-group membership, invite-code join, no multi-group support).
`Group` owns `Post`, `Goal`, `GroupPoints`, and `Building` — all shared
group-wide, never per-user.

**The village economy** (`src/lib/village.ts`) is the least obvious
part of the system:
- Two currencies on `GroupPoints`: `points` (earned via
  `awardGroupPoints` in `src/lib/points.ts` — +10/post, +25/goal hit)
  and `money`.
- `points` are *spent* to upgrade the four generator buildings (Zoo,
  Arena, Chicken Place, Music Festival — `GENERATOR_TYPES`). Each
  generator passively produces `money` based on its level.
- There is no cron job for income. `settleIncome(groupId)` computes
  money earned since each building's `lastCollectedAt` from elapsed
  wall-clock time and is called lazily — on every village page load and
  before every upgrade attempt — then advances `lastCollectedAt`. It
  intentionally only touches the timestamp when `pending > 0`, to avoid
  bleeding fractional accrual on rapid repeated calls.
- `money` is *spent* to upgrade `VILLAGE_CENTER`, whose level maps to
  the overall village tier/name shown on the page (`CENTER_TIERS`,
  8 tiers).
- The upgrade route (`src/app/api/buildings/[type]/upgrade/route.ts`)
  does the balance check + deduct + level increment inside a single
  `prisma.$transaction` for atomicity.
- Cost/rate curves (`generatorUpgradeCost`, `centerUpgradeCost`,
  `generatorMoneyPerHour`) are simple linear formulas — tune freely.
- Buildings render generated pixel-art sprites, one PNG per level, at
  `public/sprites/<slug>/level-N.png` (`spritePath()` in
  `src/lib/village.ts`, driven by the `SPRITE_LEVELS` map). Any
  `BuildingType` not listed there falls back to its `BUILDING_INFO`
  emoji — that's the path to follow when adding art for a new
  building. Prompts used to generate the existing set (via the
  PixelLab MCP server) are in `docs/sprite-prompts.md`. There is no
  site-wide background texture — every page just sits on the plain
  theme `background-color` (`globals.css`).

**The village page is a fullscreen interactive map, not a static list**
(`src/app/village/page.tsx` + `src/components/VillageMap.tsx`):
- `src/lib/villageMap.ts` defines a fixed "world" coordinate space
  (`WORLD_WIDTH`/`WORLD_HEIGHT`, `BUILDING_SLOTS` keyed by
  `BuildingType`, `FUTURE_SLOTS` for two reserved-but-unbuilt plots).
  This file is deliberately Prisma-free (only a type-only
  `BuildingType` import, erased at compile time) so it's safe to
  import from client components — unlike `village.ts`, which imports
  `@/lib/prisma` at module scope and would break the client bundle if
  ever imported from a `"use client"` file. **Any new interactive
  village component must stay presentational**: resolve everything
  from `village.ts`/Prisma in `village/page.tsx` (server component)
  into a plain `BuildingMarkerData[]` prop array, the same way
  `UpgradeButton` already takes primitives instead of a `BuildingType`.
- `village/page.tsx` is a thin wrapper: it fetches `groupPoints` and
  builds `markers`, then renders `<VillageMap markers={markers}
  groupPoints={groupPoints} />` filling the full flex-1 area below
  `Nav` (the `html`/`body`/layout flex chain, with `min-h-0` down each
  link, gives the map a definite fullscreen height with no hardcoded
  nav-height math).
- `VillageMap.tsx` (`"use client"`) wraps `react-zoom-pan-pinch`'s
  `TransformWrapper`/`TransformComponent` (sized to `100%`/`100%` of
  its fullscreen wrapper) around the world div, whose background is a
  single generated scene image (`public/sprites/village-map/
  world-background.png`, authored at 400×300 and scaled 4× via CSS to
  `WORLD_WIDTH`×`WORLD_HEIGHT` with `image-rendering: pixelated`) —
  forest border, clearing, paths, and the pond are all baked into this
  one image rather than composited from repeating tiles. On top of it:
  `BuildingMarker` sprites/emoji and dashed `FUTURE_SLOTS` placeholders,
  absolutely positioned by world coordinates. `VillageHud` renders as a
  sibling of `TransformWrapper` (so pan/zoom never affects it) —
  a small top-right pill pair showing points/money with generated
  icons (`public/sprites/hud/points-icon.png`, `money-icon.png`).
- Clicking a `BuildingMarker` opens `BuildingUpgradePopover`, which
  embeds the existing, unmodified `UpgradeButton`. Positioning uses the
  clicked marker's post-transform `getBoundingClientRect()` rendered as
  `position: fixed` in screen space — no matrix-inversion needed to
  account for the current pan/zoom — and the popover simply closes on
  the wrapper's `onTransform` callback rather than tracking a moving
  anchor.
- The two future slots have no backing `Building` row and need no
  schema change; add a real building later by giving it a
  `BuildingType` enum value + `BUILDING_INFO` entry + a `BUILDING_SLOTS`
  coordinate, same as any other building.

**Request flow convention:** server components (pages under
`src/app/{feed,goals,village}`) fetch data directly via Prisma/`getCurrentUser`
and pass plain data down; interactive bits (forms, upgrade/status
buttons) are small `"use client"` components that `fetch()` the
matching route handler under `src/app/api/*` and call
`router.refresh()` on success. There is no separate service/repository
layer — route handlers do auth check, validation, and Prisma calls
inline.
