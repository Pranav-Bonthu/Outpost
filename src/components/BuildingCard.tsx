import UpgradeButton from "@/components/UpgradeButton";
import {
  BUILDING_INFO,
  GENERATOR_MAX_LEVEL,
  generatorMoneyPerHour,
  generatorUpgradeCost,
} from "@/lib/village";
import type { BuildingType } from "@/generated/prisma/client";

export default function BuildingCard({
  type,
  level,
  points,
}: {
  type: BuildingType;
  level: number;
  points: number;
}) {
  const info = BUILDING_INFO[type];
  const rate = generatorMoneyPerHour(level);
  const cost = generatorUpgradeCost(level);
  const isMaxLevel = level >= GENERATOR_MAX_LEVEL;

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-5 text-center">
      <span className="text-4xl">{info.emoji}</span>
      <h3 className="font-medium">{info.name}</h3>
      <p className="text-xs text-foreground/50">Level {level}</p>
      <p className="text-xs text-foreground/60">
        💰 {rate} money / hour
      </p>
      <div className="mt-1">
        <UpgradeButton
          slug={info.slug}
          cost={cost}
          currencyLabel="pts"
          canAfford={points >= cost}
          isMaxLevel={isMaxLevel}
        />
      </div>
    </div>
  );
}
