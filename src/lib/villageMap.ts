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
  cost: number;
  currencyLabel: "pts" | "money";
  canAfford: boolean;
  isMaxLevel: boolean;
  detailLabel: string;
};
