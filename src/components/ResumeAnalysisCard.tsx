import type { ResumeAnalysisSummary } from "@/lib/resumeMatch";

export default function ResumeAnalysisCard({
  analysis,
  onOpen,
}: {
  analysis: ResumeAnalysisSummary;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-left transition hover:border-accent hover:bg-accent-soft/40"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{analysis.jobTitle ?? "Job posting"}</span>
        <span className="shrink-0 text-xs text-foreground/40">
          {new Date(analysis.createdAt).toLocaleDateString()}
        </span>
      </div>

      {analysis.matchingSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {analysis.matchingSkills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            >
              {skill}
            </span>
          ))}
          {analysis.matchingSkills.length > 3 && (
            <span className="text-xs text-foreground/40">
              +{analysis.matchingSkills.length - 3} more
            </span>
          )}
        </div>
      )}

      <p className="text-xs text-foreground/60">
        {analysis.advice.length} way{analysis.advice.length === 1 ? "" : "s"}{" "}
        to close the gap →
      </p>
    </button>
  );
}
