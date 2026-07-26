import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { REACTION_EMOJIS } from "@/lib/reactions";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id: postId } = await params;
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.groupId !== user.groupId) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const body = await request.json();
  const emoji = REACTION_EMOJIS.includes(body.emoji) ? body.emoji : null;
  if (!emoji) {
    return NextResponse.json({ error: "Unknown emoji." }, { status: 400 });
  }

  const existing = await prisma.reaction.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
  });

  if (!existing) {
    await prisma.reaction.create({
      data: { postId, userId: user.id, emoji },
    });
    return NextResponse.json({ status: "added", emoji });
  }

  if (existing.emoji === emoji) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ status: "removed", emoji: null });
  }

  await prisma.reaction.update({
    where: { id: existing.id },
    data: { emoji },
  });
  return NextResponse.json({ status: "updated", emoji });
}
