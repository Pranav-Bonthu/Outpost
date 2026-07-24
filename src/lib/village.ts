import { prisma } from "@/lib/prisma";
import type { BuildingType } from "@/generated/prisma/client";

export const CENTER_TIERS = [
  { level: 1, name: "Campsite", emoji: "⛺" },
  { level: 2, name: "Cabin", emoji: "🛖" },
  { level: 3, name: "Cottage", emoji: "🏠" },
  { level: 4, name: "Farmstead", emoji: "🏡" },
  { level: 5, name: "Hamlet", emoji: "🏘️" },
  { level: 6, name: "Village", emoji: "🏰" },
  { level: 7, name: "Town", emoji: "🌆" },
  { level: 8, name: "City", emoji: "🌃" },
] as const;

export const CENTER_MAX_LEVEL = CENTER_TIERS.length;
export const GENERATOR_MAX_LEVEL = 10;

export const GENERATOR_TYPES: BuildingType[] = [
  "ZOO",
  "ARENA",
  "CHICKEN_PLACE",
  "MUSIC_FESTIVAL",
];

export const ALL_BUILDING_TYPES: BuildingType[] = [
  "VILLAGE_CENTER",
  ...GENERATOR_TYPES,
];

export const BUILDING_INFO: Record<
  BuildingType,
  { name: string; emoji: string; slug: string }
> = {
  VILLAGE_CENTER: { name: "Village Center", emoji: "🏰", slug: "village-center" },
  ZOO: { name: "Zoo", emoji: "🦁", slug: "zoo" },
  ARENA: { name: "Arena", emoji: "🏟️", slug: "arena" },
  CHICKEN_PLACE: {
    name: "Fried Chicken Place",
    emoji: "🍗",
    slug: "chicken-place",
  },
  MUSIC_FESTIVAL: {
    name: "Music Festival",
    emoji: "🎪",
    slug: "music-festival",
  },
};

export const SLUG_TO_BUILDING_TYPE: Record<string, BuildingType> =
  Object.fromEntries(
    Object.entries(BUILDING_INFO).map(([type, info]) => [
      info.slug,
      type as BuildingType,
    ])
  );

// Buildings with a generated sprite ladder in /public/sprites/<slug>/level-N.png.
// Add a type here once its full level range has real art; others keep the emoji.
const SPRITE_LEVELS: Partial<Record<BuildingType, number>> = {
  ZOO: 10,
  ARENA: 10,
  CHICKEN_PLACE: 10,
  MUSIC_FESTIVAL: 10,
  VILLAGE_CENTER: 8,
};

export function spritePath(type: BuildingType, level: number) {
  const maxSpriteLevel = SPRITE_LEVELS[type];
  if (!maxSpriteLevel) return null;
  const clamped = Math.min(Math.max(level, 1), maxSpriteLevel);
  return `/sprites/${BUILDING_INFO[type].slug}/level-${clamped}.png`;
}

export function centerTierForLevel(level: number) {
  const index = Math.min(Math.max(level, 1), CENTER_MAX_LEVEL) - 1;
  return CENTER_TIERS[index];
}

export function generatorUpgradeCost(currentLevel: number) {
  return currentLevel * 100;
}

export function generatorMoneyPerHour(level: number) {
  return level * 5;
}

export function centerUpgradeCost(currentLevel: number) {
  return currentLevel * 500;
}

export async function ensureGroupEconomy(groupId: string) {
  await prisma.groupPoints.upsert({
    where: { groupId },
    create: { groupId, points: 0, money: 0 },
    update: {},
  });

  for (const type of ALL_BUILDING_TYPES) {
    await prisma.building.upsert({
      where: { groupId_type: { groupId, type } },
      create: { groupId, type },
      update: {},
    });
  }
}

// Lazily settles passive income: computes money earned since each generator
// building's last check-in based on elapsed real time, with no cron job.
export async function settleIncome(groupId: string) {
  const buildings = await prisma.building.findMany({
    where: { groupId, type: { in: GENERATOR_TYPES } },
  });

  const now = new Date();
  let earned = 0;

  for (const building of buildings) {
    const hoursElapsed =
      (now.getTime() - building.lastCollectedAt.getTime()) / (1000 * 60 * 60);
    const pending = Math.floor(
      hoursElapsed * generatorMoneyPerHour(building.level)
    );
    if (pending > 0) {
      earned += pending;
      await prisma.building.update({
        where: { id: building.id },
        data: { lastCollectedAt: now },
      });
    }
  }

  if (earned > 0) {
    await prisma.groupPoints.upsert({
      where: { groupId },
      create: { groupId, points: 0, money: earned },
      update: { money: { increment: earned } },
    });
  }
}

export async function getVillageState(groupId: string) {
  await settleIncome(groupId);

  const [groupPoints, buildings] = await Promise.all([
    prisma.groupPoints.upsert({
      where: { groupId },
      create: { groupId, points: 0, money: 0 },
      update: {},
    }),
    prisma.building.findMany({ where: { groupId } }),
  ]);

  const byType = new Map(buildings.map((b) => [b.type, b]));

  return { groupPoints, byType };
}
