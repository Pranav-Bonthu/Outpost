"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type StreamEvent =
  | { type: "status"; message: string; percent: number }
  | { type: "done"; id: string }
  | { type: "error"; message: string };

export default function ResumeCheckForm() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [strict, setStrict] = useState(false);
  const [budgetFriendly, setBudgetFriendly] = useState(false);
  const [projectsOnly, setProjectsOnly] = useState(false);
  const [timeBoxed, setTimeBoxed] = useState(false);
  const [longTerm, setLongTerm] = useState(false);
  const [teamFriendly, setTeamFriendly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Starting analysis…");
  const [percent, setPercent] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const startedAt = Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setStatus("Starting analysis…");
    setPercent(5);
    setElapsed(0);

    let resultError: string | null = null;
    let succeeded = false;

    try {
      const res = await fetch("/api/resume-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobText,
          strict,
          budgetFriendly,
          projectsOnly,
          timeBoxed,
          longTerm,
          teamFriendly,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        resultError = data.error ?? "Something went wrong.";
      } else if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            const event = JSON.parse(line) as StreamEvent;
            if (event.type === "status") {
              setStatus(event.message);
              setPercent(event.percent);
            } else if (event.type === "error") {
              resultError = event.message;
            } else if (event.type === "done") {
              succeeded = true;
            }
          }
        }
      } else {
        resultError = "Something went wrong.";
      }
    } catch {
      resultError = "Something went wrong.";
    }

    if (succeeded && !resultError) {
      setPercent(100);
      setResumeText("");
      setJobText("");
      setLoading(false);
      router.refresh();
    } else {
      setError(resultError ?? "Something went wrong.");
      setLoading(false);
    }
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
          <button
            type="button"
            onClick={() => setProjectsOnly((p) => !p)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              projectsOnly
                ? "border-accent bg-accent text-white"
                : "border-border text-foreground/70 hover:bg-accent-soft"
            }`}
          >
            🛠️ Projects only
          </button>
          <button
            type="button"
            onClick={() => setTimeBoxed((t) => !t)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              timeBoxed
                ? "border-accent bg-accent text-white"
                : "border-border text-foreground/70 hover:bg-accent-soft"
            }`}
          >
            ⏱️ 2 hours or less
          </button>
          <button
            type="button"
            onClick={() => setLongTerm((l) => !l)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              longTerm
                ? "border-accent bg-accent text-white"
                : "border-border text-foreground/70 hover:bg-accent-soft"
            }`}
          >
            📅 Long-term
          </button>
          <button
            type="button"
            onClick={() => setTeamFriendly((t) => !t)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              teamFriendly
                ? "border-accent bg-accent text-white"
                : "border-border text-foreground/70 hover:bg-accent-soft"
            }`}
          >
            👥 Do as a team
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading && (
        <div className="flex flex-col gap-1.5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-accent-soft">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-xs text-foreground/60">
            {status} ({elapsed}s)
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="self-end rounded-full bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Analyzing…" : "Check match"}
      </button>
    </form>
  );
}
