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
  const resumeText =
    typeof body.resumeText === "string" ? body.resumeText.trim() : "";

  if (resumeText.length > MAX_INPUT_CHARS) {
    return NextResponse.json(
      { error: `Resume must be under ${MAX_INPUT_CHARS.toLocaleString()} characters.` },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { resumeText: resumeText || null },
  });

  return NextResponse.json({ resumeText: updated.resumeText });
}
