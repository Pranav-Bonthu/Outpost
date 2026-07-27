import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { MAX_DRAFT_CHARS, toCoverLetterSummary } from "@/lib/coverLetterCritique";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;
  const row = await prisma.resumeAnalysis.findUnique({ where: { id } });
  if (!row || row.authorId !== user.id) {
    return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const draftText = typeof body.draftText === "string" ? body.draftText.trim() : "";

  if (!draftText || draftText.length > MAX_DRAFT_CHARS) {
    return NextResponse.json(
      {
        error: `Write a cover letter draft under ${MAX_DRAFT_CHARS.toLocaleString()} characters.`,
      },
      { status: 400 }
    );
  }

  const saved = await prisma.coverLetter.upsert({
    where: { resumeAnalysisId: id },
    create: { resumeAnalysisId: id, draftText },
    update: { draftText },
  });

  return NextResponse.json(toCoverLetterSummary(saved));
}
