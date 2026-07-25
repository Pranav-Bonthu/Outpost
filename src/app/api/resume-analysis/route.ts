import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { analyzeResumeMatch, MAX_INPUT_CHARS } from "@/lib/resumeMatch";

export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json();
  const resumeText =
    typeof body.resumeText === "string" ? body.resumeText.trim() : "";
  const jobText = typeof body.jobText === "string" ? body.jobText.trim() : "";

  if (
    !resumeText ||
    !jobText ||
    resumeText.length > MAX_INPUT_CHARS ||
    jobText.length > MAX_INPUT_CHARS
  ) {
    return NextResponse.json(
      {
        error: `Paste both a resume and a job posting (each under ${MAX_INPUT_CHARS.toLocaleString()} characters).`,
      },
      { status: 400 }
    );
  }

  try {
    const result = await analyzeResumeMatch(resumeText, jobText);
    const analysis = await prisma.resumeAnalysis.create({
      data: {
        authorId: user.id,
        resumeText,
        jobText,
        jobTitle: result.jobTitle,
        matchScore: result.matchScore,
        matchingSkills: JSON.stringify(result.matchingSkills),
        missingSkills: JSON.stringify(result.missingSkills),
        advice: JSON.stringify(result.advice),
      },
    });
    return NextResponse.json({ id: analysis.id });
  } catch (err) {
    if (err instanceof Error && err.message === "AI_REQUEST_FAILED") {
      return NextResponse.json(
        { error: "The AI analysis failed. Please try again." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const analyses = await prisma.resumeAnalysis.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ analyses });
}
