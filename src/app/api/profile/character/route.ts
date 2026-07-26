import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CHARACTER_CATALOG, CHARACTER_TINTS } from "@/lib/villageCharacters";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json();
  const data: { characterId?: string | null; characterColor?: string | null } = {};

  if (body.characterId !== undefined) {
    if (body.characterId !== null && !CHARACTER_CATALOG[body.characterId]) {
      return NextResponse.json({ error: "Unknown character." }, { status: 400 });
    }
    data.characterId = body.characterId;
  }

  if (body.characterColor !== undefined) {
    if (body.characterColor !== null && !CHARACTER_TINTS[body.characterColor]) {
      return NextResponse.json({ error: "Unknown color." }, { status: 400 });
    }
    data.characterColor = body.characterColor;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
  });

  return NextResponse.json({
    characterId: updated.characterId,
    characterColor: updated.characterColor,
  });
}
