"use client";

import { useState } from "react";
import {
  MAX_DRAFT_CHARS,
  type CoverLetterFeedbackItem,
  type CoverLetterSummary,
} from "@/lib/coverLetterCritique";

const FEEDBACK_KIND_LABELS: Record<CoverLetterFeedbackItem["kind"], string> = {
  strength: "✅ Strength",
  weakness: "⚠️ Weakness",
  suggestion: "💡 Suggestion",
};

export default function CoverLetterSlide({
  analysisId,
  coverLetter,
  onSaved,
}: {
  analysisId: string;
  coverLetter: CoverLetterSummary | null;
  onSaved: (coverLetter: CoverLetterSummary) => void;
}) {
  const [draftText, setDraftText] = useState(coverLetter?.draftText ?? "");
  const [saving, setSaving] = useState(false);
  const [critiquing, setCritiquing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const trimmedLength = draftText.trim().length;
  const disabled = trimmedLength === 0 || trimmedLength > MAX_DRAFT_CHARS;

  async function handleSaveDraft() {
    setSaving(true);
    setError(null);
    setSavedNotice(false);
    try {
      const res = await fetch(`/api/resume-analysis/${analysisId}/cover-letter`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftText }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        onSaved(data);
        setSavedNotice(true);
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleGetFeedback() {
    setCritiquing(true);
    setError(null);
    setSavedNotice(false);
    try {
      const res = await fetch(
        `/api/resume-analysis/${analysisId}/cover-letter/critique`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draftText }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        onSaved(data);
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setCritiquing(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
          Cover letter
        </h3>
        <span className="text-xs text-foreground/40">
          {trimmedLength.toLocaleString()} / {MAX_DRAFT_CHARS.toLocaleString()}
        </span>
      </div>

      <textarea
        value={draftText}
        onChange={(e) => setDraftText(e.target.value)}
        placeholder="Write your cover letter for this job here…"
        rows={8}
        className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm leading-relaxed focus:border-accent focus:outline-none"
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={disabled || saving}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent-soft disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save draft"}
        </button>
        <button
          type="button"
          onClick={handleGetFeedback}
          disabled={disabled || critiquing}
          className="rounded-full border border-accent px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent-soft disabled:opacity-40"
        >
          {critiquing ? "Reviewing…" : "🔎 Get AI feedback"}
        </button>
        {savedNotice && (
          <span className="text-xs text-foreground/40">Saved.</span>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {coverLetter?.critique && (
        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm leading-relaxed text-foreground/80">
              {coverLetter.critique.summary}
            </p>
          </div>
          {coverLetter.critiquedAt && (
            <p className="text-xs text-foreground/40">
              Last reviewed {new Date(coverLetter.critiquedAt).toLocaleDateString()}
            </p>
          )}
          <div className="flex flex-col gap-2">
            {coverLetter.critique.feedback.map((item, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 rounded-xl border border-border p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                    {FEEDBACK_KIND_LABELS[item.kind]}
                  </span>
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/70">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
