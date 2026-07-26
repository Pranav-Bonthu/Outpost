import Link from "next/link";

export default function ResumeStatusBox({
  resumeText,
}: {
  resumeText: string | null | undefined;
}) {
  const trimmed = resumeText?.trim();

  if (trimmed) {
    const preview = trimmed.slice(0, 140);
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-accent-soft/40 px-3 py-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-xs font-semibold text-foreground/70">
            ✓ Resume on file
          </span>
          <span className="truncate text-xs text-foreground/50">
            {preview}
            {trimmed.length > 140 ? "…" : ""}
          </span>
        </div>
        <Link
          href="/profile"
          className="shrink-0 text-xs font-medium text-accent hover:underline"
        >
          Edit in profile
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-card px-3 py-2">
      <span className="text-xs text-foreground/60">
        No resume on file yet — add one to run a check.
      </span>
      <Link
        href="/profile"
        className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white"
      >
        Add resume
      </Link>
    </div>
  );
}
