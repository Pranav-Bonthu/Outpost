"use client";

import UpgradeButton from "@/components/UpgradeButton";
import type { BuildingMarkerData } from "@/lib/villageMap";

const ESTIMATED_CARD_WIDTH = 224;

export default function BuildingUpgradePopover({
  marker,
  anchorRect,
  onClose,
}: {
  marker: BuildingMarkerData;
  anchorRect: DOMRect;
  onClose: () => void;
}) {
  const centerX = anchorRect.left + anchorRect.width / 2;
  const clampedLeft = Math.min(
    Math.max(centerX, ESTIMATED_CARD_WIDTH / 2 + 8),
    (typeof window !== "undefined" ? window.innerWidth : centerX) -
      ESTIMATED_CARD_WIDTH / 2 -
      8
  );
  const top = anchorRect.bottom + 10;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className="fixed flex w-56 -translate-x-1/2 flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center shadow-lg"
        style={{ left: clampedLeft, top }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-medium">{marker.name}</h3>
        <p className="text-xs text-foreground/60">{marker.detailLabel}</p>
        <UpgradeButton
          slug={marker.slug}
          cost={marker.cost}
          currencyLabel={marker.currencyLabel}
          canAfford={marker.canAfford}
          isMaxLevel={marker.isMaxLevel}
        />
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-foreground/40 hover:text-foreground/60"
        >
          Close
        </button>
      </div>
    </div>
  );
}
