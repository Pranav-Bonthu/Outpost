import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { MAX_INPUT_CHARS } from "@/lib/resumeMatch";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json();
  const cvText = typeof body.cvText === "string" ? body.cvText.trim() : "";

  if (cvText.length > MAX_INPUT_CHARS) {
    return NextResponse.json(
      { error: `CV must be under ${MAX_INPUT_CHARS.toLocaleString()} characters.` },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { cvText: cvText || null },
  });

  return NextResponse.json({ cvText: updated.cvText });
}
