export type Rarity = "COMMON" | "UNCOMMON" | "RARE" | "LEGENDARY";

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  COMMON: 60,
  UNCOMMON: 25,
  RARE: 12,
  LEGENDARY: 3,
};

export const RARITY_LABEL: Record<Rarity, string> = {
  COMMON: "Common",
  UNCOMMON: "Uncommon",
  RARE: "Rare",
  LEGENDARY: "Legendary",
};

export const RARITY_BADGE_CLASS: Record<Rarity, string> = {
  COMMON: "bg-foreground/10 text-foreground/60",
  UNCOMMON: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  RARE: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  LEGENDARY: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
};

export function pickWeightedSpecies<T extends string>(
  catalog: Record<T, { rarity: Rarity }>
): T {
  const entries = Object.entries(catalog) as [T, { rarity: Rarity }][];
  const total = entries.reduce(
    (sum, [, info]) => sum + RARITY_WEIGHTS[info.rarity],
    0
  );

  let roll = Math.random() * total;
  for (const [species, info] of entries) {
    roll -= RARITY_WEIGHTS[info.rarity];
    if (roll <= 0) return species;
  }
  return entries[entries.length - 1][0];
}
