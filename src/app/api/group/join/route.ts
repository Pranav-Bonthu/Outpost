import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (existingUser?.groupId) {
    return NextResponse.json(
      { error: "You already belong to a group." },
      { status: 409 }
    );
  }

  const body = await request.json();
  const inviteCode =
    typeof body.inviteCode === "string"
      ? body.inviteCode.toUpperCase().trim()
      : "";
  if (!inviteCode) {
    return NextResponse.json(
      { error: "Invite code is required." },
      { status: 400 }
    );
  }

  const group = await prisma.group.findUnique({ where: { inviteCode } });
  if (!group) {
    return NextResponse.json(
      { error: "No group found with that invite code." },
      { status: 404 }
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { groupId: group.id },
  });

  return NextResponse.json({ id: group.id });
}
