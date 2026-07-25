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
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-foreground/60">Advice</p>
          <ul className="flex flex-col gap-2 text-sm leading-relaxed">
            {analysis.advice.map((item, i) => (
              <li key={i}>
                {item.text}
                {item.resourceUrl && (
                  <>
                    {" — "}
                    <a
                      href={item.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline underline-offset-2"
                    >
                      {item.resourceTitle ?? "Resource"}
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-foreground/40">
        {new Date(analysis.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
