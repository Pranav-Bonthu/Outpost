"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LeaveGroupButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLeave() {
    setError(null);
    setLoading(true);

    const res = await fetch("/api/group/leave", { method: "POST" });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setConfirming(false);
    router.refresh();
  }

  if (!confirming) {
    return (
      <div className="flex flex-col gap-1">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="self-start rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Leave village
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-red-300 bg-red-50 p-3">
      <p className="text-sm text-red-700">
        Leave this village? If you&apos;re the last member, the village and
        everything in it will be deleted.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleLeave}
          disabled={loading}
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Leaving…" : "Yes, leave"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="rounded-full px-4 py-2 text-sm font-medium text-foreground/60 hover:bg-accent-soft"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
