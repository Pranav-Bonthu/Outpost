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

  const strict = body.strict === true;
  const budgetFriendly = body.budgetFriendly === true;
  const projectsOnly = body.projectsOnly === true;
  const timeBoxed = body.timeBoxed === true;
  const longTerm = body.longTerm === true;
  const teamFriendly = body.teamFriendly === true;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      try {
        const result = await analyzeResumeMatch(
          resumeText,
          jobText,
          { strict, budgetFriendly, projectsOnly, timeBoxed, longTerm, teamFriendly },
          (progress) => send({ type: "status", ...progress })
        );
        const analysis = await prisma.resumeAnalysis.create({
          data: {
            authorId: user.id,
            resumeText,
            jobText,
            jobTitle: result.jobTitle,
            matchingSkills: JSON.stringify(result.matchingSkills),
            missingSkills: JSON.stringify(result.missingSkills),
            advice: JSON.stringify(result.advice),
          },
        });
        send({
          type: "done",
          id: analysis.id,
          analysis: {
            id: analysis.id,
            jobTitle: result.jobTitle,
            matchingSkills: result.matchingSkills,
            missingSkills: result.missingSkills,
            advice: result.advice,
            createdAt: analysis.createdAt,
            coverLetter: null,
          },
        });
      } catch (err) {
        const message =
          err instanceof Error && err.message === "AI_REQUEST_FAILED"
            ? "The AI analysis failed. Please try again."
            : "Something went wrong.";
        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
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
