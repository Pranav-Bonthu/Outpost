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
    <main className="flex flex-1 min-h-0">
      <VillageMap markers={markers} groupPoints={groupPoints} />
    </main>
  );
}
