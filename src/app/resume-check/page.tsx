import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ResumeCheckForm from "@/components/ResumeCheckForm";
import ResumeAnalysisCard from "@/components/ResumeAnalysisCard";
import type { AdviceItem } from "@/lib/resumeMatch";

export default async function ResumeCheckPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rows = await prisma.resumeAnalysis.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const analyses = rows.map((row) => ({
    id: row.id,
    jobTitle: row.jobTitle,
    matchScore: row.matchScore,
    matchingSkills: JSON.parse(row.matchingSkills) as string[],
    missingSkills: JSON.parse(row.missingSkills) as string[],
    advice: JSON.parse(row.advice) as AdviceItem[],
    createdAt: row.createdAt,
  }));

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-xl font-semibold">Resume ↔ job match</h1>
        <p className="text-sm text-foreground/60">
          Paste your resume and a job posting to see where you match, where
          you fall short, and how to close the gap.
        </p>
      </div>

      <ResumeCheckForm />

      <div className="flex flex-col gap-4">
        {analyses.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-foreground/50">
            No checks yet. Paste a resume and a job posting above to get
            started.
          </p>
        )}
        {analyses.map((analysis) => (
          <ResumeAnalysisCard key={analysis.id} analysis={analysis} />
        ))}
      </div>
    </main>
  );
}
