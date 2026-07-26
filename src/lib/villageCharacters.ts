// Preset village characters, mirroring how BUILDING_INFO/SPRITE_LEVELS in
// village.ts catalog static visual game entities as plain TS constants
// rather than DB rows. Kept Prisma-free so it can be imported from client
// components (CharacterPicker, PlayerCharacter), same discipline as
// villageMap.ts.

export const CHARACTER_CATALOG: Record<
  string,
  { id: string; slug: string; name: string }
> = {
  WANDERER: { id: "WANDERER", slug: "wanderer", name: "Wanderer" },
  SCOUT: { id: "SCOUT", slug: "scout", name: "Scout" },
};

// CSS filter recipes applied to the character sprite at render time — a
// full uniform-tint recolor, not a true outfit-only palette swap. Cheap
// (free at render) vs. pre-baking every character x tint x direction x
// frame combination as separate PNGs.
export const CHARACTER_TINTS: Record<
  string,
  { id: string; name: string; filter: string }
> = {
  DEFAULT: { id: "DEFAULT", name: "Default", filter: "none" },
  AMBER: {
    id: "AMBER",
    name: "Amber",
    filter: "hue-rotate(-20deg) saturate(1.2)",
  },
  MOSS: {
    id: "MOSS",
    name: "Moss",
    filter: "hue-rotate(70deg) saturate(1.1)",
  },
  SLATE: {
    id: "SLATE",
    name: "Slate",
    filter: "hue-rotate(160deg) saturate(0.9)",
  },
  PLUM: {
    id: "PLUM",
    name: "Plum",
    filter: "hue-rotate(220deg) saturate(1.15)",
  },
};

export type CharacterDirection = "down" | "up" | "left" | "right";

// Frames per walk-cycle direction (PixelLab's "walking-4-frames" template).
export const CHARACTER_FRAME_COUNT = 4;

export function characterSpriteBaseUrl(id: string | null | undefined) {
  if (!id) return null;
  const entry = CHARACTER_CATALOG[id];
  if (!entry) return null;
  return `/sprites/characters/${entry.slug}`;
}
