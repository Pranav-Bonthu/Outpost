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
  wires up `@prisma/adapter-better-sqlite3` against `DATABASE_URL`.

**Auth** is NextAuth v5 (beta) with the Credentials provider and JWT
sessions (no `Session` table — the cookie itself is the source of
truth). Config lives in `src/lib/auth.ts`; `src/lib/session.ts` exports
`getCurrentUser()`, which layers a Prisma lookup (including the user's
`Group`) on top of `auth()` and is what most server components use.
Session typing is augmented in `src/types/next-auth.d.ts`.

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
  PixelLab MCP server) are in `docs/sprite-prompts.md`. The site-wide
  page background (`globals.css`, `body::before`) is a separate
  seamless leaf-tile texture at `public/sprites/background-tile.png`,
  rendered as a fixed, low-`opacity` overlay behind everything — not
  to be confused with the village map's own background (next point).

**The village page is an interactive map, not a static list**
(`src/app/village/page.tsx` + `src/components/VillageMap.tsx`):
- `src/lib/villageMap.ts` defines a fixed "world" coordinate space
  (`WORLD_WIDTH`/`WORLD_HEIGHT`, `BUILDING_SLOTS` keyed by
  `BuildingType`, `FUTURE_SLOTS` for two reserved-but-unbuilt plots,
  `PATH_SEGMENTS`) plus `pathSegmentStyle()`, a pure geometry helper
  that turns two points into a rotated CSS strip. This file is
  deliberately Prisma-free (only a type-only `BuildingType` import,
  erased at compile time) so it's safe to import from client
  components — unlike `village.ts`, which imports `@/lib/prisma` at
  module scope and would break the client bundle if ever imported from
  a `"use client"` file. **Any new interactive village component must
  stay presentational**: resolve everything from `village.ts`/Prisma
  in `village/page.tsx` (server component) into a plain
  `BuildingMarkerData[]` prop array, the same way `UpgradeButton`
  already takes primitives instead of a `BuildingType`.
- `VillageMap.tsx` (`"use client"`) wraps `react-zoom-pan-pinch`'s
  `TransformWrapper`/`TransformComponent` around a composed scene:
  a repeating forest tile (border), a repeating clearing tile (center
  patch), a standalone pond sprite (left side), rotated path-tile
  strips connecting buildings, then `BuildingMarker` sprites/emoji and
  dashed `FUTURE_SLOTS` placeholders, all absolutely positioned by
  world coordinates.
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
