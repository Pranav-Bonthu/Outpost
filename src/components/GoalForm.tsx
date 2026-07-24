"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GoalForm() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, period }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    setDescription("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
    >
      <input
        type="text"
        className="rounded-lg border border-border bg-transparent px-3 py-2 outline-none focus:border-accent"
        placeholder="e.g. Apply to 5 roles, finish the AWS cert…"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <div className="flex gap-2 text-xs">
        {(["weekly", "monthly"] as const).map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-full border px-3 py-1 font-medium capitalize ${
              period === p
                ? "border-accent bg-accent text-white"
                : "border-border text-foreground/70 hover:bg-accent-soft"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="self-end rounded-full bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Setting goal…" : "Set goal"}
      </button>
    </form>
  );
}
