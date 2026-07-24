import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { awardGroupPoints, POINTS_PER_GOAL_HIT } from "@/lib/points";

const VALID_STATUSES = ["in_progress", "hit", "missed"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id: goalId } = await params;
  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal || goal.groupId !== user.groupId) {
    return NextResponse.json({ error: "Goal not found." }, { status: 404 });
  }
  if (goal.authorId !== user.id) {
    return NextResponse.json(
      { error: "Only the goal's author can update it." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const status = VALID_STATUSES.includes(body.status) ? body.status : null;
  if (!status) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const shouldAwardPoints = status === "hit" && !goal.pointsAwarded;

  await prisma.goal.update({
    where: { id: goalId },
    data: {
      status,
      ...(shouldAwardPoints ? { pointsAwarded: true } : {}),
    },
  });

  if (shouldAwardPoints) {
    await awardGroupPoints(user.groupId!, POINTS_PER_GOAL_HIT);
  }

  return NextResponse.json({ ok: true });
}
