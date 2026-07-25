import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
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
import { characterSpriteBaseUrl } from "@/lib/villageCharacters";
import {
  BUILDING_SLOTS,
  POND_SLOT,
  BIRDWATCH_SLOT,
  type ActivityMarkerData,
  type BuildingMarkerData,
  type PlayerMarkerData,
} from "@/lib/villageMap";

export default async function VillagePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.groupId) redirect("/group/new");

  const { groupPoints, byType } = await getVillageState(user.groupId);

  const members = await prisma.user.findMany({
    where: { groupId: user.groupId },
    orderBy: { name: "asc" },
  });

  const players: PlayerMarkerData[] = members.map((member) => ({
    userId: member.id,
    name: member.name,
    characterId: member.characterId,
    characterColor: member.characterColor,
    spriteBaseUrl: characterSpriteBaseUrl(member.characterId),
  }));

  const markers: BuildingMarkerData[] = ALL_BUILDING_TYPES.map((type) => {
    const isCenter = type === "VILLAGE_CENTER";
    const building = byType.get(type);
    const level = building?.level ?? 1;
    const info = BUILDING_INFO[type];
    const x = building?.x ?? BUILDING_SLOTS[type].x;
    const y = building?.y ?? BUILDING_SLOTS[type].y;

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
        x,
        y,
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
      x,
      y,
      cost,
      currencyLabel: "pts",
      canAfford: groupPoints.points >= cost,
      isMaxLevel: level >= GENERATOR_MAX_LEVEL,
      detailLabel: `Level ${level} · ${generatorMoneyPerHour(level)} money / hour`,
    };
  });

  const activityMarkers: ActivityMarkerData[] = [
    {
      id: "POND",
      kind: "fish",
      name: "Fishing Pond",
      emoji: "🎣",
      x: POND_SLOT.x,
      y: POND_SLOT.y,
    },
    {
      id: "BIRDWATCH_SPOT",
      kind: "bird",
      name: "Bird-Watching Spot",
      emoji: "🔭",
      x: BIRDWATCH_SLOT.x,
      y: BIRDWATCH_SLOT.y,
    },
  ];

  return (
    <main className="flex flex-1 min-h-0">
      <VillageMap
        markers={markers}
        groupPoints={groupPoints}
        players={players}
        activityMarkers={activityMarkers}
      />
    </main>
  );
}
