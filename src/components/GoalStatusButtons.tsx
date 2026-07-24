"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GoalStatusButtons({
  goalId,
  status,
}: {
  goalId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(next: "hit" | "missed" | "in_progress") {
    setLoading(true);
    const res = await fetch(`/api/goals/${goalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) router.refresh();
    setLoading(false);
  }

  if (status !== "in_progress") {
    return (
      <button
        type="button"
        disabled={loading}
        onClick={() => setStatus("in_progress")}
        className="rounded-full border border-border px-3 py-1 text-xs text-foreground/60 hover:bg-accent-soft"
      >
        Reopen
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => setStatus("hit")}
        className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-60"
      >
        Hit it (+25 pts)
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => setStatus("missed")}
        className="rounded-full border border-border px-3 py-1 text-xs text-foreground/60 hover:bg-accent-soft disabled:opacity-60"
      >
        Missed
      </button>
    </div>
  );
}
