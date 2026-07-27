import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import LiveRefresh from "@/components/LiveRefresh";
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
import { FISH_INFO, fishSpritePath } from "@/lib/wildlife/fish";
import { BIRD_INFO, birdSpritePath } from "@/lib/wildlife/birds";
import type { FishSpecies, BirdSpecies } from "@/generated/prisma/client";
import {
  BUILDING_SLOTS,
  POND_SLOT,
  BIRDWATCH_SLOT,
  type ActivityMarkerData,
  type BuildingMarkerData,
  type PlayerMarkerData,
  type VillageCollectionData,
} from "@/lib/villageMap";

export default async function VillagePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.groupId) redirect("/group/new");

  const [{ groupPoints, byType }, members, fishCatches, birdSightings] =
    await Promise.all([
      getVillageState(user.groupId),
      prisma.user.findMany({
        where: { groupId: user.groupId },
        orderBy: { name: "asc" },
      }),
      prisma.fishCatch.findMany({
        where: { groupId: user.groupId },
        include: { catcher: { select: { name: true } } },
      }),
      prisma.birdSighting.findMany({
        where: { groupId: user.groupId },
        include: { catcher: { select: { name: true } } },
      }),
    ]);

  const caughtFish = new Map(
    fishCatches.map((c) => [c.species, { catcherName: c.catcher.name }])
  );
  const caughtBirds = new Map(
    birdSightings.map((c) => [c.species, { catcherName: c.catcher.name }])
  );

  const collection: VillageCollectionData = {
    fish: (Object.entries(FISH_INFO) as [FishSpecies, (typeof FISH_INFO)[FishSpecies]][]).map(
      ([species, info]) => {
        const caught = caughtFish.get(species);
        return {
          species,
          name: info.name,
          description: info.description,
          rarity: info.rarity,
          spriteUrl: fishSpritePath(species),
          caught: !!caught,
          catcherName: caught?.catcherName,
        };
      }
    ),
    birds: (Object.entries(BIRD_INFO) as [BirdSpecies, (typeof BIRD_INFO)[BirdSpecies]][]).map(
      ([species, info]) => {
        const caught = caughtBirds.get(species);
        return {
          species,
          name: info.name,
          description: info.description,
          rarity: info.rarity,
          spriteUrl: birdSpritePath(species),
          caught: !!caught,
          catcherName: caught?.catcherName,
        };
      }
    ),
  };

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
      <LiveRefresh />
      <VillageMap
        markers={markers}
        groupPoints={groupPoints}
        players={players}
        activityMarkers={activityMarkers}
        collection={collection}
      />
    </main>
  );
}
