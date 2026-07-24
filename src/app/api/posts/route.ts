import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { awardGroupPoints, POINTS_PER_POST } from "@/lib/points";

const VALID_TAGS = [
  "Application",
  "Referral",
  "Certification",
  "Project",
  "Networking",
  "Other",
] as const;

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

  const post = await prisma.post.create({
    data: {
      text,
      tag,
      optionalLink,
      authorId: user.id,
      groupId: user.groupId,
    },
  });

  await awardGroupPoints(user.groupId, POINTS_PER_POST);

  return NextResponse.json({ id: post.id });
}
