"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResumeCheckForm() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/resume-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, jobText }),
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
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
    >
      <textarea
        className="min-h-32 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
        placeholder="Paste your resume text…"
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        required
      />
      <textarea
        className="min-h-32 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
        placeholder="Paste the job posting…"
        value={jobText}
        onChange={(e) => setJobText(e.target.value)}
        required
      />
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
