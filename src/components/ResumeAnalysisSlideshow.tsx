"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdviceItem, ResumeAnalysisSummary } from "@/lib/resumeMatch";

const KIND_LABELS: Record<AdviceItem["kind"], string> = {
  project: "🛠️ Project idea",
  certification: "🎓 Certification",
  resource: "📚 Do this",
};

function formatRemaining(availableAt: string): string {
  const ms = new Date(availableAt).getTime() - Date.now();
  if (ms <= 0) return "now";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function isCooldownActive(availableAt: string | null): boolean {
  return !!availableAt && new Date(availableAt).getTime() > Date.now();
}

export default function ResumeAnalysisSlideshow({
  analysis,
  onClose,
  deepDiveAvailableAt,
  onDeepDiveSuccess,
}: {
  analysis: ResumeAnalysisSummary;
  onClose: () => void;
  deepDiveAvailableAt: string | null;
  onDeepDiveSuccess: (advice: AdviceItem[], availableAt: string) => void;
}) {
  const sortedAdvice = useMemo(() => {
    const score = (item: AdviceItem) =>
      (item.resourceUrl ? 2 : 0) + (item.resourceImageUrl ? 1 : 0);
    return [...analysis.advice].sort((a, b) => score(b) - score(a));
  }, [analysis.advice]);
  const slideCount = 1 + sortedAdvice.length;
  const [index, setIndex] = useState(0);
  const [deepDiveLoadingIndex, setDeepDiveLoadingIndex] = useState<number | null>(
    null
  );
  const [deepDiveError, setDeepDiveError] = useState<{
    index: number;
    message: string;
  } | null>(null);

  const isOnCooldown = isCooldownActive(deepDiveAvailableAt);

  async function handleDeepDive(itemIndex: number) {
    setDeepDiveLoadingIndex(itemIndex);
    setDeepDiveError(null);
    try {
      const res = await fetch(`/api/resume-analysis/${analysis.id}/deep-dive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIndex }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDeepDiveError({
          index: itemIndex,
          message: data.error ?? "Something went wrong.",
        });
      } else {
        onDeepDiveSuccess(data.advice, data.availableAt);
      }
    } catch {
      setDeepDiveError({ index: itemIndex, message: "Something went wrong." });
    } finally {
      setDeepDiveLoadingIndex(null);
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
      else if (e.key === "ArrowRight")
        setIndex((i) => Math.min(slideCount - 1, i + 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slideCount, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <p className="text-xs text-foreground/40">
              {new Date(analysis.createdAt).toLocaleDateString()}
            </p>
            <h2 className="text-base font-semibold">
              {analysis.jobTitle ?? "Job posting"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-lg text-foreground/40 hover:text-foreground/60"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {index === 0 ? (
            <OverviewSlide
              matchingSkills={analysis.matchingSkills}
              missingSkills={analysis.missingSkills}
            />
          ) : (
            (() => {
              const item = sortedAdvice[index - 1];
              const itemIndex = analysis.advice.indexOf(item);
              return (
                <AdviceSlide
                  item={item}
                  onDeepDive={() => handleDeepDive(itemIndex)}
                  loading={deepDiveLoadingIndex === itemIndex}
                  error={
                    deepDiveError?.index === itemIndex ? deepDiveError.message : null
                  }
                  isOnCooldown={isOnCooldown}
                  cooldownText={
                    isOnCooldown ? formatRemaining(deepDiveAvailableAt!) : null
                  }
                />
              );
            })()
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border p-3">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((i) => i - 1)}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent-soft disabled:opacity-30"
          >
            ← Prev
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: slideCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 w-1.5 rounded-full ${
                    i === index ? "bg-accent" : "bg-border"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-foreground/40">
              {index + 1} / {slideCount}
            </span>
          </div>
          <button
            type="button"
            disabled={index === slideCount - 1}
            onClick={() => setIndex((i) => i + 1)}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent-soft disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

function OverviewSlide({
  matchingSkills,
  missingSkills,
}: {
  matchingSkills: string[];
  missingSkills: string[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
        Skills overview
      </h3>
      {matchingSkills.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-foreground/60">Matching</p>
          <div className="flex flex-wrap gap-1.5">
            {matchingSkills.map((s) => (
              <span
                key={s}
                className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
      {missingSkills.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-foreground/60">Missing</p>
          <div className="flex flex-wrap gap-1.5">
            {missingSkills.map((s) => (
              <span
                key={s}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
      <p className="text-xs text-foreground/40">
        → Here&apos;s how to close the gaps.
      </p>
    </div>
  );
}

function AdviceSlide({
  item,
  onDeepDive,
  loading,
  error,
  isOnCooldown,
  cooldownText,
}: {
  item: AdviceItem;
  onDeepDive: () => void;
  loading: boolean;
  error: string | null;
  isOnCooldown: boolean;
  cooldownText: string | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
          {KIND_LABELS[item.kind]}
        </span>
        <span className="rounded-full border border-border px-2 py-0.5 text-xs text-foreground/60">
          ⏱ {item.timeEstimate}
        </span>
      </div>
      <h3 className="text-lg font-semibold">{item.title}</h3>
      <p className="text-sm leading-relaxed text-foreground/80">{item.text}</p>

      {item.resourceUrl ? (
        <a
          href={item.resourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block cursor-pointer overflow-hidden rounded-xl border border-border transition hover:border-accent"
        >
          {item.resourceImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.resourceImageUrl}
              alt={item.resourceTitle ?? item.title}
              className="h-40 w-full object-cover transition group-hover:opacity-80"
            />
          )}
          <div
            className={`flex items-center justify-between gap-2 p-3 ${
              item.resourceImageUrl ? "bg-card" : "bg-accent-soft py-6"
            }`}
          >
            <span className="truncate text-sm font-medium text-accent">
              {item.resourceTitle ?? "View resource"}
            </span>
            <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
              Open ↗
            </span>
          </div>
        </a>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-xs text-foreground/40">
            No link found for this one yet.
          </p>
          {isOnCooldown ? (
            <p className="text-xs text-foreground/40">
              Deep dive available in {cooldownText}
            </p>
          ) : (
            <button
              type="button"
              onClick={onDeepDive}
              disabled={loading}
              className="rounded-full border border-accent px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent-soft disabled:opacity-40"
            >
              {loading ? "Researching…" : "🔎 Deep dive: find a link"}
            </button>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
