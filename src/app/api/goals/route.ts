import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const VALID_PERIODS = ["weekly", "monthly"] as const;

export async function POST(request: Request) {
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

  const body = await request.json();
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const period = VALID_PERIODS.includes(body.period) ? body.period : null;

  if (!description || !period) {
    return NextResponse.json(
      { error: "A goal needs a description and a valid period." },
      { status: 400 }
    );
  }

  const goal = await prisma.goal.create({
    data: {
      description,
      period,
      authorId: user.id,
      groupId: user.groupId,
    },
  });

  return NextResponse.json({ id: goal.id });
}
