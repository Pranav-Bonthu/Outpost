import type { FishSpecies } from "@/generated/prisma/client";
import { pickWeightedSpecies, type Rarity } from "@/lib/wildlife/shared";

export const FISH_INFO: Record<
  FishSpecies,
  { name: string; description: string; rarity: Rarity; slug: string }
> = {
  BLUEGILL: {
    name: "Bluegill",
    description:
      "A small, saucer-shaped panfish that nibbles at anything shiny.",
    rarity: "COMMON",
    slug: "bluegill",
  },
  MINNOW: {
    name: "Minnow",
    description:
      "Tiny and quick — more bait than trophy, but everyone starts somewhere.",
    rarity: "COMMON",
    slug: "minnow",
  },
  CATFISH: {
    name: "Channel Catfish",
    description:
      "A whiskered bottom-dweller that lurks in the muddy shallows.",
    rarity: "COMMON",
    slug: "catfish",
  },
  TROUT: {
    name: "Rainbow Trout",
    description:
      "Streaked with iridescent color, prized by anglers for its fight.",
    rarity: "COMMON",
    slug: "trout",
  },
  BASS: {
    name: "Largemouth Bass",
    description:
      "The pond's apex ambush predator, known for its wide, toothy grin.",
    rarity: "UNCOMMON",
    slug: "bass",
  },
  PIKE: {
    name: "Northern Pike",
    description:
      "Long, lean, and lightning-fast — it strikes before you see it.",
    rarity: "UNCOMMON",
    slug: "pike",
  },
  STURGEON: {
    name: "Lake Sturgeon",
    description:
      "An ancient, armor-plated giant that's been here longer than the village.",
    rarity: "UNCOMMON",
    slug: "sturgeon",
  },
  GOLDEN_KOI: {
    name: "Golden Koi",
    description:
      "A shimmering ornamental koi, said to bring luck to whoever lands it.",
    rarity: "RARE",
    slug: "golden-koi",
  },
  ANGLERFISH: {
    name: "Pond Anglerfish",
    description:
      "An impossible, glowing-lure oddity that shouldn't live in fresh water — but does.",
    rarity: "RARE",
    slug: "anglerfish",
  },
  LEVIATHAN_EEL: {
    name: "Leviathan Eel",
    description:
      "A mythic serpent of the deep pond, whispered about but rarely seen.",
    rarity: "LEGENDARY",
    slug: "leviathan-eel",
  },
};

export function fishSpritePath(species: FishSpecies) {
  return `/sprites/fish/${FISH_INFO[species].slug}.png`;
}

export function pickRandomFish(): FishSpecies {
  return pickWeightedSpecies(FISH_INFO);
}
