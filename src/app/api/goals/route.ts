import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { GOAL_COLOR_CATALOG } from "@/lib/goalColors";

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

  let dueDate: Date | null = null;
  if (body.dueDate != null && body.dueDate !== "") {
    const parsed = new Date(body.dueDate);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json(
        { error: "Invalid due date." },
        { status: 400 }
      );
    }
    dueDate = parsed;
  }

  let color: string | null = null;
  if (body.color != null) {
    if (!GOAL_COLOR_CATALOG[body.color]) {
      return NextResponse.json({ error: "Unknown color." }, { status: 400 });
    }
    color = body.color;
  }

  const goal = await prisma.goal.create({
    data: {
      description,
      period,
      dueDate,
      color,
      authorId: user.id,
      groupId: user.groupId,
    },
  });

  return NextResponse.json({ id: goal.id });
}
