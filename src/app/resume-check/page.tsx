import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ResumeCheckClient from "@/components/ResumeCheckClient";
import {
  normalizeAdviceItem,
  type AdviceItem,
  type ResumeAnalysisSummary,
} from "@/lib/resumeMatch";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function computeDeepDiveAvailableAt(lastDeepDiveAt: Date | null): string | null {
  if (!lastDeepDiveAt) return null;
  const elapsedMs = Date.now() - lastDeepDiveAt.getTime();
  return elapsedMs < ONE_DAY_MS
    ? new Date(lastDeepDiveAt.getTime() + ONE_DAY_MS).toISOString()
    : null;
}

export default async function ResumeCheckPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rows = await prisma.resumeAnalysis.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const analyses: ResumeAnalysisSummary[] = rows.map((row) => ({
    id: row.id,
    jobTitle: row.jobTitle,
    matchingSkills: JSON.parse(row.matchingSkills) as string[],
    missingSkills: JSON.parse(row.missingSkills) as string[],
    advice: (JSON.parse(row.advice) as Partial<AdviceItem>[]).map(
      normalizeAdviceItem
    ),
    createdAt: row.createdAt.toISOString(),
  }));

  const deepDiveAvailableAt = computeDeepDiveAvailableAt(user.lastDeepDiveAt);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-xl font-semibold">Resume ↔ job match</h1>
        <p className="text-sm text-foreground/60">
          Paste a job posting to see where you match, where you fall short,
          and how to close the gap.
        </p>
      </div>

      <ResumeCheckClient
        resumeText={user.resumeText}
        analyses={analyses}
        deepDiveAvailableAt={deepDiveAvailableAt}
      />
    </main>
  );
}
