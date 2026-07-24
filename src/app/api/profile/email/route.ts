import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json();
  const newEmail =
    typeof body.newEmail === "string" ? body.newEmail.toLowerCase().trim() : "";
  const currentPassword =
    typeof body.currentPassword === "string" ? body.currentPassword : "";

  if (!newEmail || !currentPassword) {
    return NextResponse.json(
      { error: "New email and current password are required." },
      { status: 400 }
    );
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: newEmail } });
  if (existing && existing.id !== user.id) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { email: newEmail },
  });

  return NextResponse.json({ email: newEmail });
}
