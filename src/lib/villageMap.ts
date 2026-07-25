import type { BuildingType } from "@/generated/prisma/client";

export const WORLD_WIDTH = 1600;
export const WORLD_HEIGHT = 1200;

export type FutureSlotId = "FUTURE_SLOT_1" | "FUTURE_SLOT_2";
export type MapSlotId = BuildingType | FutureSlotId;

export const BUILDING_SLOTS: Record<BuildingType, { x: number; y: number }> = {
  VILLAGE_CENTER: { x: 800, y: 500 },
  ZOO: { x: 550, y: 340 },
  ARENA: { x: 1050, y: 340 },
  CHICKEN_PLACE: { x: 550, y: 700 },
  MUSIC_FESTIVAL: { x: 1050, y: 700 },
};

export const FUTURE_SLOTS: Record<FutureSlotId, { x: number; y: number }> = {
  FUTURE_SLOT_1: { x: 750, y: 880 },
  FUTURE_SLOT_2: { x: 950, y: 880 },
};

export type BuildingMarkerData = {
  type: BuildingType;
  slug: string;
  name: string;
  emoji: string;
  spriteUrl: string | null;
  level: number;
  x: number;
  y: number;
  cost: number;
  currencyLabel: "pts" | "money";
  canAfford: boolean;
  isMaxLevel: boolean;
  detailLabel: string;
};

export type ActivityId = "POND" | "BIRDWATCH_SPOT";

export const POND_SLOT = { x: 1380, y: 360 };
export const BIRDWATCH_SLOT = { x: 1250, y: 480 };

export type ActivityMarkerData = {
  id: ActivityId;
  kind: "fish" | "bird";
  name: string;
  emoji: string;
  x: number;
  y: number;
};

export type PlayerMarkerData = {
  userId: string;
  name: string;
  characterId: string | null;
  characterColor: string | null;
  spriteBaseUrl: string | null;
};

// Superset of the BUILDING_SLOTS cluster with margin, kept clear of the
// forest border/pond baked into world-background.png. There's no exposed
// collision data for that image, so this is hand-tuned by eye (same as
// BUILDING_SLOTS itself) rather than derived from anything measurable.
export const WALKABLE_BOUNDS = {
  minX: 420,
  maxX: 1180,
  minY: 420,
  maxY: 800,
};
