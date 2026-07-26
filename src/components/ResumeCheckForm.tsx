"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResumeCheckForm() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [strict, setStrict] = useState(false);
  const [budgetFriendly, setBudgetFriendly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/resume-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, jobText, strict, budgetFriendly }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    setResumeText("");
    setJobText("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
            📄 Your resume
          </label>
          <textarea
            className="min-h-56 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
            placeholder="Paste your resume text…"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
            💼 Job posting
          </label>
          <textarea
            className="min-h-56 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
            placeholder="Paste the job posting…"
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground/60">
          What are you looking for?
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStrict((s) => !s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              strict
                ? "border-accent bg-accent text-white"
                : "border-border text-foreground/70 hover:bg-accent-soft"
            }`}
          >
            🔍 Super critical
          </button>
          <button
            type="button"
            onClick={() => setBudgetFriendly((b) => !b)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              budgetFriendly
                ? "border-accent bg-accent text-white"
                : "border-border text-foreground/70 hover:bg-accent-soft"
            }`}
          >
            💸 Free/cheap only
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="self-end rounded-full bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Analyzing — this can take up to 30 seconds…" : "Check match"}
      </button>
    </form>
  );
}
