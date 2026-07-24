"use client";

import { useState } from "react";
import Image from "next/image";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import BuildingMarker from "@/components/BuildingMarker";
import BuildingUpgradePopover from "@/components/BuildingUpgradePopover";
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  CLEARING_RECT,
  POND_RECT,
  BUILDING_SLOTS,
  FUTURE_SLOTS,
  PATH_SEGMENTS,
  pathSegmentStyle,
  type BuildingMarkerData,
} from "@/lib/villageMap";
import type { BuildingType } from "@/generated/prisma/client";

export default function VillageMap({
  markers,
}: {
  markers: BuildingMarkerData[];
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
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <TransformWrapper
        initialScale={0.5}
        minScale={0.3}
        maxScale={2}
        centerOnInit
        limitToBounds={false}
        onTransform={() => setActive(null)}
      >
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "70vh" }}
        >
          <div
            className="relative"
            style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'url("/sprites/village-map/forest-tile.png")',
                backgroundRepeat: "repeat",
                backgroundSize: "64px 64px",
                imageRendering: "pixelated",
              }}
            />

            <div
              className="absolute rounded-[80px]"
              style={{
                left: CLEARING_RECT.x,
                top: CLEARING_RECT.y,
                width: CLEARING_RECT.width,
                height: CLEARING_RECT.height,
                backgroundImage:
                  'url("/sprites/village-map/clearing-tile.png")',
                backgroundRepeat: "repeat",
                backgroundSize: "64px 64px",
                imageRendering: "pixelated",
              }}
            />

            {PATH_SEGMENTS.map((seg, i) => {
              const style = pathSegmentStyle(
                BUILDING_SLOTS[seg.from],
                BUILDING_SLOTS[seg.to]
              );
              return (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: style.left,
                    top: style.top,
                    width: style.width,
                    height: style.height,
                    transform: style.transform,
                    transformOrigin: style.transformOrigin,
                    backgroundImage:
                      'url("/sprites/village-map/path-tile.png")',
                    backgroundRepeat: "repeat",
                    imageRendering: "pixelated",
                  }}
                />
              );
            })}

            <Image
              src="/sprites/village-map/pond.png"
              alt="Village pond"
              width={POND_RECT.width}
              height={POND_RECT.height}
              className="absolute [image-rendering:pixelated]"
              style={{ left: POND_RECT.x, top: POND_RECT.y }}
            />

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
