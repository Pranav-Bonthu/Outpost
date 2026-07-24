import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  SLUG_TO_BUILDING_TYPE,
  CENTER_MAX_LEVEL,
  GENERATOR_MAX_LEVEL,
  centerUpgradeCost,
  generatorUpgradeCost,
  settleIncome,
} from "@/lib/village";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!user.groupId) {
    return NextResponse.json(
      { error: "You need to join a group first." },
      { status: 400 }
    );
  }

  const { type: slug } = await params;
  const buildingType = SLUG_TO_BUILDING_TYPE[slug];
  if (!buildingType) {
    return NextResponse.json({ error: "Unknown building." }, { status: 404 });
  }

  await settleIncome(user.groupId);

  const groupId = user.groupId;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const building = await tx.building.findUnique({
        where: { groupId_type: { groupId, type: buildingType } },
      });
      const groupPoints = await tx.groupPoints.findUnique({
        where: { groupId },
      });
      if (!building || !groupPoints) {
        throw new Error("NOT_FOUND");
      }

      const isCenter = buildingType === "VILLAGE_CENTER";
      const maxLevel = isCenter ? CENTER_MAX_LEVEL : GENERATOR_MAX_LEVEL;
      const cost = isCenter
        ? centerUpgradeCost(building.level)
        : generatorUpgradeCost(building.level);

      if (building.level >= maxLevel) {
        throw new Error("MAX_LEVEL");
      }

      const balance = isCenter ? groupPoints.money : groupPoints.points;
      if (balance < cost) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      const updatedBuilding = await tx.building.update({
        where: { id: building.id },
        data: { level: { increment: 1 } },
      });

      await tx.groupPoints.update({
        where: { groupId },
        data: isCenter
          ? { money: { decrement: cost } }
          : { points: { decrement: cost } },
      });

      return { level: updatedBuilding.level, cost };
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === "MAX_LEVEL") {
      return NextResponse.json(
        { error: "This building is already at its max level." },
        { status: 400 }
      );
    }
    if (err instanceof Error && err.message === "INSUFFICIENT_FUNDS") {
      return NextResponse.json(
        { error: "Not enough to afford this upgrade yet." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
