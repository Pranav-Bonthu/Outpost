import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SLUG_TO_BUILDING_TYPE } from "@/lib/village";
import { WORLD_WIDTH, WORLD_HEIGHT } from "@/lib/villageMap";

export async function PATCH(
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

  const body = await request.json();
  const { x, y } = body;
  if (
    typeof x !== "number" ||
    typeof y !== "number" ||
    !Number.isFinite(x) ||
    !Number.isFinite(y)
  ) {
    return NextResponse.json({ error: "Invalid position." }, { status: 400 });
  }

  const clampedX = Math.round(Math.min(Math.max(x, 0), WORLD_WIDTH));
  const clampedY = Math.round(Math.min(Math.max(y, 0), WORLD_HEIGHT));

  const groupId = user.groupId;
  const updated = await prisma.building.upsert({
    where: { groupId_type: { groupId, type: buildingType } },
    create: { groupId, type: buildingType, x: clampedX, y: clampedY },
    update: { x: clampedX, y: clampedY },
  });

  return NextResponse.json({ x: updated.x, y: updated.y });
}
