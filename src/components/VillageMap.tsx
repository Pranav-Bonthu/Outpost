"use client";

import { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import BuildingMarker from "@/components/BuildingMarker";
import BuildingUpgradePopover from "@/components/BuildingUpgradePopover";
import VillageHud from "@/components/VillageHud";
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  BUILDING_SLOTS,
  FUTURE_SLOTS,
  type BuildingMarkerData,
} from "@/lib/villageMap";
import type { BuildingType } from "@/generated/prisma/client";

export default function VillageMap({
  markers,
  groupPoints,
}: {
  markers: BuildingMarkerData[];
  groupPoints: { points: number; money: number };
}) {
  const [active, setActive] = useState<{
    marker: BuildingMarkerData;
    rect: DOMRect;
  } | null>(null);

  const markerByType = new Map(markers.map((m) => [m.type, m]));

  function handleMarkerClick(id: string, rect: DOMRect) {
    const marker = markerByType.get(id as BuildingType);
    if (marker) setActive({ marker, rect });
  }

  return (
    <div className="relative w-full flex-1 min-h-0 overflow-hidden bg-background">
      <TransformWrapper
        initialScale={0.5}
        minScale={0.3}
        maxScale={2}
        centerOnInit
        limitToBounds={false}
        onTransform={() => setActive(null)}
      >
        <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
          <div
            className="relative"
            style={{
              width: WORLD_WIDTH,
              height: WORLD_HEIGHT,
              backgroundImage:
                'url("/sprites/village-map/world-background.png")',
              backgroundSize: `${WORLD_WIDTH}px ${WORLD_HEIGHT}px`,
              backgroundRepeat: "no-repeat",
              imageRendering: "pixelated",
            }}
          >
            {markers.map((m) => (
              <BuildingMarker
                key={m.type}
                id={m.type}
                x={BUILDING_SLOTS[m.type].x}
                y={BUILDING_SLOTS[m.type].y}
                spriteUrl={m.spriteUrl}
                emoji={m.emoji}
                label={m.name}
                variant="building"
                onClick={handleMarkerClick}
              />
            ))}

            {Object.entries(FUTURE_SLOTS).map(([id, pos]) => (
              <BuildingMarker
                key={id}
                id={id}
                x={pos.x}
                y={pos.y}
                spriteUrl={null}
                emoji=""
                label="Reserved for a future building"
                variant="placeholder"
              />
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>

      <VillageHud points={groupPoints.points} money={groupPoints.money} />

      {active && (
        <BuildingUpgradePopover
          marker={active.marker}
          anchorRect={active.rect}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  );
}
