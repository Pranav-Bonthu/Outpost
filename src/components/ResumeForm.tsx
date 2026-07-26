"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResumeForm({
  initialResumeText,
}: {
  initialResumeText: string | null;
}) {
  const router = useRouter();
  const [resumeText, setResumeText] = useState(initialResumeText ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);

    const res = await fetch("/api/profile/resume", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
    >
      <label className="flex flex-col gap-1 text-sm">
        Resume
        <span className="text-xs font-normal text-foreground/60">
          Saved here once, it&apos;ll auto-fill on the resume check page.
        </span>
        <textarea
          value={resumeText}
          onChange={(e) => {
            setResumeText(e.target.value);
            setSaved(false);
          }}
          placeholder="Paste your resume text…"
          className="min-h-32 rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && !error && (
        <p className="text-sm text-foreground/60">Resume saved.</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="self-end rounded-full bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save resume"}
      </button>
    </form>
  );
}
