import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!user.groupId) {
    return NextResponse.json(
      { error: "You're not in a village." },
      { status: 400 }
    );
  }

  const groupId = user.groupId;

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { groupId: null },
      });

      const remaining = await tx.user.count({ where: { groupId } });
      if (remaining === 0) {
        await tx.group.delete({ where: { id: groupId } });
      }

      return { deleted: remaining === 0 };
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
