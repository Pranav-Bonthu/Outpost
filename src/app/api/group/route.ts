import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInviteCode } from "@/lib/inviteCode";
import { ensureGroupEconomy } from "@/lib/village";

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
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json(
      { error: "Group name is required." },
      { status: 400 }
    );
  }

  let inviteCode = generateInviteCode();
  for (let attempts = 0; attempts < 5; attempts++) {
    const clash = await prisma.group.findUnique({ where: { inviteCode } });
    if (!clash) break;
    inviteCode = generateInviteCode();
  }

  const group = await prisma.group.create({
    data: { name, inviteCode },
  });

  await ensureGroupEconomy(group.id);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { groupId: group.id },
  });

  return NextResponse.json({ id: group.id, inviteCode: group.inviteCode });
}
