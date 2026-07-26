"use client";

import { useState } from "react";
import ResumeCheckForm from "@/components/ResumeCheckForm";
import ResumeAnalysisCard from "@/components/ResumeAnalysisCard";
import ResumeAnalysisSlideshow from "@/components/ResumeAnalysisSlideshow";
import type { ResumeAnalysisSummary } from "@/lib/resumeMatch";

export default function ResumeCheckClient({
  resumeText,
  analyses,
}: {
  resumeText: string | null;
  analyses: ResumeAnalysisSummary[];
}) {
  const [openAnalysis, setOpenAnalysis] = useState<ResumeAnalysisSummary | null>(
    null
  );

  return (
    <>
      <ResumeCheckForm resumeText={resumeText} onAnalysisComplete={setOpenAnalysis} />

      <div className="flex flex-col gap-3">
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
        />
      )}
    </>
  );
}
