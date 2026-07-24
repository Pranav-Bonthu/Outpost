import type { BuildingType } from "@/generated/prisma/client";

export const WORLD_WIDTH = 1600;
export const WORLD_HEIGHT = 1200;

export const CLEARING_RECT = { x: 300, y: 200, width: 1000, height: 800 };
export const POND_RECT = { x: 40, y: 470, width: 256, height: 192 };

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

export const PATH_SEGMENTS: Array<{ from: BuildingType; to: BuildingType }> = [
  { from: "VILLAGE_CENTER", to: "ZOO" },
  { from: "VILLAGE_CENTER", to: "ARENA" },
  { from: "VILLAGE_CENTER", to: "CHICKEN_PLACE" },
  { from: "VILLAGE_CENTER", to: "MUSIC_FESTIVAL" },
];

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

export function pathSegmentStyle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  tileHeight = 64
) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return {
    left: a.x,
    top: a.y - tileHeight / 2,
    width: length,
    height: tileHeight,
    transform: `rotate(${angle}deg)`,
    transformOrigin: "0 50%",
  } as const;
}
