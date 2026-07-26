import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  awardGroupPoints,
  POINTS_PER_POST,
  POST_GOAL_PROGRESS_STEP,
} from "@/lib/points";
import { POST_TAGS as VALID_TAGS } from "@/lib/postTags";

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
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const tag = VALID_TAGS.includes(body.tag) ? body.tag : null;
  const optionalLink =
    typeof body.optionalLink === "string" && body.optionalLink.trim()
      ? body.optionalLink.trim()
      : null;

  if (!text || !tag) {
    return NextResponse.json(
      { error: "A post needs text and a valid tag." },
      { status: 400 }
    );
  }

  const goalId =
    typeof body.goalId === "string" && body.goalId ? body.goalId : null;

  let goal = null;
  if (goalId) {
    goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || goal.groupId !== user.groupId) {
      return NextResponse.json({ error: "Goal not found." }, { status: 404 });
    }
    if (goal.authorId !== user.id) {
      return NextResponse.json(
        { error: "You can only link your own goals." },
        { status: 403 }
      );
    }
    if (goal.status !== "in_progress") {
      return NextResponse.json(
        { error: "Goal is not in progress." },
        { status: 400 }
      );
    }
  }

  const [post] = await prisma.$transaction([
    prisma.post.create({
      data: {
        text,
        tag,
        optionalLink,
        goalId,
        authorId: user.id,
        groupId: user.groupId,
      },
    }),
    ...(goal
      ? [
          prisma.goal.update({
            where: { id: goal.id },
            data: {
              progress: Math.min(
                100,
                goal.progress + POST_GOAL_PROGRESS_STEP
              ),
            },
          }),
        ]
      : []),
  ]);

  await awardGroupPoints(user.groupId, POINTS_PER_POST);

  return NextResponse.json({ id: post.id });
}
