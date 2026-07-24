# Outpost

A small, cooperative accountability app for a friend group doing a job
search together. Post tagged updates, comment on each other's posts, set
goals the whole group can see, and grow one shared "village" as points
add up. No individual rankings — only shared group progress.

## Stack

Next.js (App Router) + Prisma/SQLite + NextAuth (credentials).

## Running it locally

```bash
npm install
npx prisma migrate deploy   # creates dev.db from the committed migrations
npm run dev
```

Open http://localhost:3000. The first person to sign up creates the
group and shares the invite code with everyone else, who join via the
"Join with a code" option.

`.env` already contains `DATABASE_URL` and `AUTH_SECRET` for local dev.
For a real deployment, generate a fresh `AUTH_SECRET` (`openssl rand
-base64 32`) and don't reuse the local one.

## How the village economy works

Two shared currencies, five buildings, no individual ownership of any of it:

- **Points** — earned by the group: **+10** per post, **+25** per goal
  marked "hit" (`src/lib/points.ts`). Points are *spent* to upgrade the
  four money-generating buildings: Zoo, Arena, Fried Chicken Place, and
  Music Festival.
- **Money** — generated passively by those four buildings, based on
  each one's level (`generatorMoneyPerHour` in `src/lib/village.ts`).
  There's no cron job: elapsed real time since a building's last
  check-in is settled lazily, the moment anyone loads the village page
  or attempts an upgrade (`settleIncome`). Money is *spent* to upgrade
  the Village Center, which is what sets the village's overall tier
  (Campsite → ... → City).
- All costs/rates are simple linear formulas in `src/lib/village.ts`
  (`generatorUpgradeCost`, `centerUpgradeCost`) — easy to retune.
- Buildings currently render as emoji placeholders
  (`BUILDING_INFO` in `src/lib/village.ts`); swap in real art per
  building/level later without touching any logic.

## Project layout

- `prisma/schema.prisma` — data model (User, Group, Post, Comment, Goal,
  GroupPoints, Building).
- `src/app/api/*` — route handlers for signup, group create/join,
  posts, comments, goals, building upgrades.
- `src/app/{feed,goals,village}` — the three main authenticated views.
- `src/lib/points.ts` — post/goal point awards.
- `src/lib/village.ts` — building types, cost/rate curves, passive
  income settlement, village center tiers.
