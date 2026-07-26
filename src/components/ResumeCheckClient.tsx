"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ResumeCheckForm from "@/components/ResumeCheckForm";
import ResumeAnalysisCard from "@/components/ResumeAnalysisCard";
import ResumeAnalysisSlideshow from "@/components/ResumeAnalysisSlideshow";
import type { AdviceItem, ResumeAnalysisSummary } from "@/lib/resumeMatch";

export default function ResumeCheckClient({
  resumeText,
  analyses,
  deepDiveAvailableAt,
}: {
  resumeText: string | null;
  analyses: ResumeAnalysisSummary[];
  deepDiveAvailableAt: string | null;
}) {
  const router = useRouter();
  const [openAnalysis, setOpenAnalysis] = useState<ResumeAnalysisSummary | null>(
    null
  );
  const [availableAt, setAvailableAt] = useState(deepDiveAvailableAt);

  function handleDeepDiveSuccess(advice: AdviceItem[], nextAvailableAt: string) {
    setAvailableAt(nextAvailableAt);
    setOpenAnalysis((prev) => (prev ? { ...prev, advice } : prev));
    router.refresh();
  }

  return (
    <>
      <ResumeCheckForm resumeText={resumeText} onAnalysisComplete={setOpenAnalysis} />

      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground/70">
            Past checks
          </h2>
          <p className="text-xs text-foreground/50">
            Results from job postings you&apos;ve checked before — not the one above.
          </p>
        </div>
        {analyses.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-foreground/50">
            No checks yet. Paste a job posting above to get started.
          </p>
        )}
        {analyses.map((analysis) => (
          <ResumeAnalysisCard
            key={analysis.id}
            analysis={analysis}
            onOpen={() => setOpenAnalysis(analysis)}
          />
        ))}
      </div>

      {openAnalysis && (
        <ResumeAnalysisSlideshow
          key={openAnalysis.id}
          analysis={openAnalysis}
          onClose={() => setOpenAnalysis(null)}
          deepDiveAvailableAt={availableAt}
          onDeepDiveSuccess={handleDeepDiveSuccess}
        />
      )}
    </>
  );
}
