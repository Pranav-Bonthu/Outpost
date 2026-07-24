import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import BuildingCard from "@/components/BuildingCard";
import UpgradeButton from "@/components/UpgradeButton";
import {
  BUILDING_INFO,
  CENTER_MAX_LEVEL,
  GENERATOR_TYPES,
  centerTierForLevel,
  centerUpgradeCost,
  getVillageState,
} from "@/lib/village";

export default async function VillagePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.groupId) redirect("/group/new");

  const { groupPoints, byType } = await getVillageState(user.groupId);

  const center = byType.get("VILLAGE_CENTER");
  const centerLevel = center?.level ?? 1;
  const tier = centerTierForLevel(centerLevel);
  const centerCost = centerUpgradeCost(centerLevel);
  const isCenterMax = centerLevel >= CENTER_MAX_LEVEL;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8">
      <div>
        <h1 className="text-xl font-semibold">Your village</h1>
        <p className="text-sm text-foreground/60">
          Everyone&apos;s updates and goals feed one shared total. No
          individual rankings — just what the group builds together.
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

      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center">
        <span className="text-6xl">{tier.emoji}</span>
        <h2 className="text-2xl font-semibold">{tier.name}</h2>
        <p className="text-sm text-foreground/60">
          {BUILDING_INFO.VILLAGE_CENTER.name} · Level {centerLevel}/
          {CENTER_MAX_LEVEL}
        </p>
        <div className="mt-2">
          <UpgradeButton
            slug={BUILDING_INFO.VILLAGE_CENTER.slug}
            cost={centerCost}
            currencyLabel="money"
            canAfford={groupPoints.money >= centerCost}
            isMaxLevel={isCenterMax}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground/70">
          Money-generating buildings
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {GENERATOR_TYPES.map((type) => {
            const building = byType.get(type);
            return (
              <BuildingCard
                key={type}
                type={type}
                level={building?.level ?? 1}
                points={groupPoints.points}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}
