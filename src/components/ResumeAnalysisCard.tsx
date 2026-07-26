import type { AdviceItem } from "@/lib/resumeMatch";

type Analysis = {
  id: string;
  jobTitle: string | null;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  advice: AdviceItem[];
  createdAt: Date;
};

const KIND_LABELS: Record<AdviceItem["kind"], { emoji: string; label: string }> = {
  project: { emoji: "🛠️", label: "Project idea" },
  certification: { emoji: "🎓", label: "Certification" },
  resource: { emoji: "📚", label: "Do this" },
};

export default function ResumeAnalysisCard({ analysis }: { analysis: Analysis }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">
          {analysis.jobTitle ?? "Job posting"}
        </span>
        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
          {analysis.matchScore}/100 match
        </span>
      </div>

      {analysis.matchingSkills.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-foreground/60">Matching</p>
          <div className="flex flex-wrap gap-1.5">
            {analysis.matchingSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {analysis.missingSkills.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-foreground/60">Missing</p>
          <div className="flex flex-wrap gap-1.5">
            {analysis.missingSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {analysis.advice.length > 0 && (
        <div className="flex flex-col gap-1.5 border-t border-border pt-3">
          <p className="text-xs font-medium text-foreground/60">
            Go build your skills
          </p>
          <ul className="flex flex-col gap-3 text-sm leading-relaxed">
            {analysis.advice.map((item, i) => {
              const kind = KIND_LABELS[item.kind] ?? KIND_LABELS.resource;
              return (
                <li key={i} className="flex flex-col gap-0.5">
                  <span>
                    <span
                      title={kind.label}
                      className="mr-1.5 text-xs text-foreground/50"
                    >
                      {kind.emoji}
                    </span>
                    {item.text}
                  </span>
                  {item.resourceUrl && (
                    <a
                      href={item.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-5 text-xs text-accent underline underline-offset-2"
                    >
                      {item.resourceTitle ?? "View resource"} ↗
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <p className="text-xs text-foreground/40">
        {new Date(analysis.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
