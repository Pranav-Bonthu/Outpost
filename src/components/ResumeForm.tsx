"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResumeForm({
  initialResumeText,
}: {
  initialResumeText: string | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeText, setResumeText] = useState(initialResumeText ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSaved(false);
    setExtracting(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/profile/resume/extract-pdf", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setExtracting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setResumeText(data.text);
  }

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
        <div className="flex items-center justify-between gap-2">
          <span>
            Resume
            <span className="ml-1 text-xs font-normal text-foreground/60">
              Saved here once, it&apos;ll auto-fill on the resume check page.
            </span>
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={extracting}
            className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent-soft disabled:opacity-60"
          >
            {extracting ? "Reading PDF…" : "Upload PDF"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <textarea
          value={resumeText}
          onChange={(e) => {
            setResumeText(e.target.value);
            setSaved(false);
          }}
          placeholder="Paste your resume text, or upload a PDF above…"
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
