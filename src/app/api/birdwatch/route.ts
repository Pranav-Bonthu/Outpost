import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { settleIncome } from "@/lib/village";
import { pickRandomBird } from "@/lib/wildlife/birds";

export async function POST() {
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

  const groupId = user.groupId;

  await settleIncome(groupId);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const groupPoints = await tx.groupPoints.findUnique({
        where: { groupId },
      });
      if (!groupPoints || groupPoints.money < 1) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      const species = pickRandomBird();

      const existing = await tx.birdSighting.findUnique({
        where: { groupId_species: { groupId, species } },
      });
      const isNew = !existing;

      await tx.groupPoints.update({
        where: { groupId },
        data: { money: { decrement: 1 } },
      });

      if (isNew) {
        await tx.birdSighting.create({
          data: { groupId, catcherId: user.id, species },
        });
      }

      return { species, isNew, moneyRemaining: groupPoints.money - 1 };
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === "INSUFFICIENT_FUNDS") {
      return NextResponse.json(
        { error: "Not enough money to go bird-watching yet." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
