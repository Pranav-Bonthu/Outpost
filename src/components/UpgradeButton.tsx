"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UpgradeButton({
  slug,
  cost,
  currencyLabel,
  canAfford,
  isMaxLevel,
}: {
  slug: string;
  cost: number;
  currencyLabel: string;
  canAfford: boolean;
  isMaxLevel: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setError(null);
    setLoading(true);
    const res = await fetch(`/api/buildings/${slug}/upgrade`, {
      method: "POST",
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }
    router.refresh();
  }

  if (isMaxLevel) {
    return (
      <span className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground/50">
        Max level
      </span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={loading || !canAfford}
        className="rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Upgrading…" : `Upgrade — ${cost} ${currencyLabel}`}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
