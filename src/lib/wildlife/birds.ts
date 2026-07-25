import type { BirdSpecies } from "@/generated/prisma/client";
import { pickWeightedSpecies, type Rarity } from "@/lib/wildlife/shared";

export const BIRD_INFO: Record<
  BirdSpecies,
  { name: string; description: string; rarity: Rarity; slug: string }
> = {
  SPARROW: {
    name: "House Sparrow",
    description:
      "A cheerful, ever-present little bird that's not shy around people.",
    rarity: "COMMON",
    slug: "sparrow",
  },
  PIGEON: {
    name: "Common Pigeon",
    description:
      "Plump, gray, and utterly unbothered by the world around it.",
    rarity: "COMMON",
    slug: "pigeon",
  },
  ROBIN: {
    name: "American Robin",
    description:
      "Orange-breasted and cheerful, the classic sign that spring has arrived.",
    rarity: "COMMON",
    slug: "robin",
  },
  CARDINAL: {
    name: "Northern Cardinal",
    description:
      "A brilliant flash of red that's impossible to miss against green leaves.",
    rarity: "COMMON",
    slug: "cardinal",
  },
  BLUE_JAY: {
    name: "Blue Jay",
    description:
      "Loud, bold, and strikingly blue — the self-appointed lookout of the forest.",
    rarity: "UNCOMMON",
    slug: "blue-jay",
  },
  WOODPECKER: {
    name: "Pileated Woodpecker",
    description: "A crimson-crested drummer that echoes through the trees.",
    rarity: "UNCOMMON",
    slug: "woodpecker",
  },
  BARN_OWL: {
    name: "Barn Owl",
    description:
      "A ghostly, heart-faced hunter that only shows itself at dusk.",
    rarity: "UNCOMMON",
    slug: "barn-owl",
  },
  RED_TAILED_HAWK: {
    name: "Red-Tailed Hawk",
    description:
      "A soaring raptor with a piercing cry, master of the open sky.",
    rarity: "RARE",
    slug: "red-tailed-hawk",
  },
  SNOWY_EGRET: {
    name: "Snowy Egret",
    description:
      "An elegant white wader with delicate plumes, rarely spotted this far inland.",
    rarity: "RARE",
    slug: "snowy-egret",
  },
  GOLDEN_PHOENIX_FINCH: {
    name: "Golden Phoenix Finch",
    description:
      "A near-mythical finch whose feathers glow like embers — most call it a legend.",
    rarity: "LEGENDARY",
    slug: "golden-phoenix-finch",
  },
};

export function birdSpritePath(species: BirdSpecies) {
  return `/sprites/birds/${BIRD_INFO[species].slug}.png`;
}

export function pickRandomBird(): BirdSpecies {
  return pickWeightedSpecies(BIRD_INFO);
}
