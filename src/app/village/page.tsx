import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import VillageMap from "@/components/VillageMap";
import {
  ALL_BUILDING_TYPES,
  BUILDING_INFO,
  CENTER_MAX_LEVEL,
  GENERATOR_MAX_LEVEL,
  centerTierForLevel,
  centerUpgradeCost,
  generatorMoneyPerHour,
  generatorUpgradeCost,
  getVillageState,
  spritePath,
} from "@/lib/village";
import type { BuildingMarkerData } from "@/lib/villageMap";

export default async function VillagePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.groupId) redirect("/group/new");

  const { groupPoints, byType } = await getVillageState(user.groupId);

  const markers: BuildingMarkerData[] = ALL_BUILDING_TYPES.map((type) => {
    const isCenter = type === "VILLAGE_CENTER";
    const level = byType.get(type)?.level ?? 1;
    const info = BUILDING_INFO[type];

    if (isCenter) {
      const tier = centerTierForLevel(level);
      const cost = centerUpgradeCost(level);
      return {
        type,
        slug: info.slug,
        name: tier.name,
        emoji: tier.emoji,
        spriteUrl: spritePath(type, level),
        level,
        cost,
        currencyLabel: "money",
        canAfford: groupPoints.money >= cost,
        isMaxLevel: level >= CENTER_MAX_LEVEL,
        detailLabel: `${info.name} · Level ${level}/${CENTER_MAX_LEVEL}`,
      };
    }

    const cost = generatorUpgradeCost(level);
    return {
      type,
      slug: info.slug,
      name: info.name,
      emoji: info.emoji,
      spriteUrl: spritePath(type, level),
      level,
      cost,
      currencyLabel: "pts",
      canAfford: groupPoints.points >= cost,
      isMaxLevel: level >= GENERATOR_MAX_LEVEL,
      detailLabel: `Level ${level} · ${generatorMoneyPerHour(level)} money / hour`,
    };
  });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-xl font-semibold">Your village</h1>
        <p className="text-sm text-foreground/60">
          Everyone&apos;s updates and goals feed one shared total. No
          individual rankings — just what the group builds together. Drag
          to pan, scroll or pinch to zoom, and tap a building to upgrade it.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 rounded-2xl border border-border bg-card p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-foreground/50">
            Points
          </p>
          <p className="text-2xl font-semibold">{groupPoints.points}</p>
          <p className="text-xs text-foreground/50">
            Earned from posts &amp; goals · spend on the Zoo, Arena, Chicken
            Place, and Music Festival
          </p>
        </div>
        <div className="flex-1 rounded-2xl border border-border bg-card p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-foreground/50">
            Money
          </p>
          <p className="text-2xl font-semibold">{groupPoints.money}</p>
          <p className="text-xs text-foreground/50">
            Generated over time by your buildings · spend on the Village
            Center
          </p>
        </div>
      </div>

      <VillageMap markers={markers} />
    </main>
  );
}
