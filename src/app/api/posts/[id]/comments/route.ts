import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

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
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json(
      { error: "Comment text is required." },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.create({
    data: { text, postId, authorId: user.id },
  });

  return NextResponse.json({ id: comment.id });
}
