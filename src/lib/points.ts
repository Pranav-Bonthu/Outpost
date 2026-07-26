import { prisma } from "@/lib/prisma";

export const POINTS_PER_POST = 10;
export const POINTS_PER_GOAL_HIT = 25;
export const POST_GOAL_PROGRESS_STEP = 10;

export async function awardGroupPoints(groupId: string, amount: number) {
  await prisma.groupPoints.upsert({
    where: { groupId },
    create: { groupId, points: amount, money: 0 },
    update: { points: { increment: amount } },
  });
}
