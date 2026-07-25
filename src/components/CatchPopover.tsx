"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FishSpecies, BirdSpecies } from "@/generated/prisma/client";
import { FISH_INFO, fishSpritePath } from "@/lib/wildlife/fish";
import { BIRD_INFO, birdSpritePath } from "@/lib/wildlife/birds";
import { RARITY_LABEL, RARITY_BADGE_CLASS } from "@/lib/wildlife/shared";

const ESTIMATED_CARD_WIDTH = 224;
const MIN_CASTING_MS = 900;

type CatchResult = { species: string; isNew: boolean; moneyRemaining: number };

export default function CatchPopover({
  kind,
  activityName,
  anchorRect,
  money,
  onClose,
}: {
  kind: "fish" | "bird";
  activityName: string;
  anchorRect: DOMRect;
  money: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "casting" | "result">("idle");
  const [result, setResult] = useState<CatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const centerX = anchorRect.left + anchorRect.width / 2;
  const clampedLeft = Math.min(
    Math.max(centerX, ESTIMATED_CARD_WIDTH / 2 + 8),
    (typeof window !== "undefined" ? window.innerWidth : centerX) -
      ESTIMATED_CARD_WIDTH / 2 -
      8
  );
  const top = anchorRect.bottom + 10;

  const verb = kind === "fish" ? "Cast a line" : "Scan the trees";
  const actionLabel = kind === "fish" ? "Go fishing" : "Go bird-watching";
  const endpoint = kind === "fish" ? "/api/fish" : "/api/birdwatch";
  const canAfford = money >= 1;

  async function handleAttempt() {
    setError(null);
    setPhase("casting");

    const [res] = await Promise.all([
      fetch(endpoint, { method: "POST" }),
      new Promise((resolve) => setTimeout(resolve, MIN_CASTING_MS)),
    ]);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      setPhase("idle");
      return;
    }

    const data: CatchResult = await res.json();
    setResult(data);
    setPhase("result");
    router.refresh();
  }

  function handleClose() {
    router.refresh();
    onClose();
  }

  const info =
    phase === "result" && result
      ? kind === "fish"
        ? FISH_INFO[result.species as FishSpecies]
        : BIRD_INFO[result.species as BirdSpecies]
      : null;
  const spriteUrl =
    phase === "result" && result
      ? kind === "fish"
        ? fishSpritePath(result.species as FishSpecies)
        : birdSpritePath(result.species as BirdSpecies)
      : null;

  return (
    <div className="fixed inset-0 z-50" onClick={handleClose}>
      <div
        className="fixed flex w-56 -translate-x-1/2 flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center shadow-lg"
        style={{ left: clampedLeft, top }}
        onClick={(e) => e.stopPropagation()}
      >
        {phase === "idle" && (
          <>
            <h3 className="font-medium">{activityName}</h3>
            <p className="text-xs text-foreground/60">{verb}? (1 💰)</p>
            <button
              type="button"
              onClick={handleAttempt}
              disabled={!canAfford}
              className="rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {actionLabel}
            </button>
            {!canAfford && (
              <p className="text-xs text-red-600">Not enough money yet.</p>
            )}
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="button"
              onClick={handleClose}
              className="text-xs text-foreground/40 hover:text-foreground/60"
            >
              Close
            </button>
          </>
        )}

        {phase === "casting" && (
          <>
            <h3 className="font-medium">{activityName}</h3>
            <span className="animate-bounce text-4xl">
              {kind === "fish" ? "🎣" : "🔭"}
            </span>
            <p className="text-xs text-foreground/60">
              {kind === "fish" ? "Waiting for a bite…" : "Watching quietly…"}
            </p>
          </>
        )}

        {phase === "result" && result && info && (
          <>
            {result.isNew && (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                ✨ New!
              </span>
            )}
            <Image
              src={spriteUrl!}
              alt={info.name}
              width={96}
              height={96}
              className="[image-rendering:pixelated] drop-shadow-md"
            />
            <h3 className="font-medium">{info.name}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${RARITY_BADGE_CLASS[info.rarity]}`}
            >
              {RARITY_LABEL[info.rarity]}
            </span>
            <p className="text-xs text-foreground/60">{info.description}</p>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white"
            >
              Nice!
            </button>
          </>
        )}
      </div>
    </div>
  );
}
