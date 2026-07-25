"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import BuildingMarker from "@/components/BuildingMarker";
import BuildingUpgradePopover from "@/components/BuildingUpgradePopover";
import CatchPopover from "@/components/CatchPopover";
import PlayerCharacter from "@/components/PlayerCharacter";
import VillageHud from "@/components/VillageHud";
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  FUTURE_SLOTS,
  WALKABLE_BOUNDS,
  type ActivityMarkerData,
  type BuildingMarkerData,
  type PlayerMarkerData,
} from "@/lib/villageMap";
import type { BuildingType } from "@/generated/prisma/client";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function VillageMap({
  markers,
  groupPoints,
  players,
  activityMarkers,
}: {
  markers: BuildingMarkerData[];
  groupPoints: { points: number; money: number };
  players: PlayerMarkerData[];
  activityMarkers: ActivityMarkerData[];
}) {
  const router = useRouter();
  const [active, setActive] = useState<{
    marker: BuildingMarkerData;
    rect: DOMRect;
  } | null>(null);
  const [activeCatch, setActiveCatch] = useState<{
    activity: ActivityMarkerData;
    rect: DOMRect;
  } | null>(null);
  const [fitScale, setFitScale] = useState<number | null>(null);
  const [dragPositions, setDragPositions] = useState<
    Partial<Record<BuildingType, { x: number; y: number }>>
  >({});
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const scaleRef = useRef(1);

  const markerByType = new Map(markers.map((m) => [m.type, m]));

  const activityById = new Map(activityMarkers.map((a) => [a.id, a]));

  function handleMarkerClick(id: string, rect: DOMRect) {
    const marker = markerByType.get(id as BuildingType);
    if (marker) setActive({ marker, rect });
  }

  function handleActivityClick(id: string, rect: DOMRect) {
    const activity = activityById.get(id as ActivityMarkerData["id"]);
    if (activity) setActiveCatch({ activity, rect });
  }

  function handleMarkerDragMove(id: string, x: number, y: number) {
    const type = id as BuildingType;
    setDragPositions((prev) => ({
      ...prev,
      [type]: {
        x: clamp(x, 0, WORLD_WIDTH),
        y: clamp(y, 0, WORLD_HEIGHT),
      },
    }));
  }

  async function handleMarkerDragEnd(id: string, x: number, y: number) {
    const type = id as BuildingType;
    const marker = markerByType.get(type);
    if (!marker) return;

    const clampedX = clamp(x, 0, WORLD_WIDTH);
    const clampedY = clamp(y, 0, WORLD_HEIGHT);
    setDragPositions((prev) => ({
      ...prev,
      [type]: { x: clampedX, y: clampedY },
    }));

    await fetch(`/api/buildings/${marker.slug}/position`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ x: clampedX, y: clampedY }),
    });
    router.refresh();
  }

  function fitToScreen(ref: ReactZoomPanPinchRef) {
    const el = ref.instance.wrapperComponent;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    if (!width || !height) return;
    const scale = Math.min(width / WORLD_WIDTH, height / WORLD_HEIGHT);
    setFitScale(scale);
    scaleRef.current = scale;
    ref.centerView(scale, 0);
  }

  useEffect(() => {
    function handleResize() {
      if (transformRef.current) fitToScreen(transformRef.current);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative w-full flex-1 min-h-0 overflow-hidden bg-[var(--village-canvas)]">
      <TransformWrapper
        ref={transformRef}
        initialScale={0.5}
        minScale={fitScale ? fitScale * 0.6 : 0.3}
        maxScale={fitScale ? fitScale * 3 : 2}
        centerOnInit
        limitToBounds={false}
        panning={{ excluded: ["village-marker"] }}
        onInit={fitToScreen}
        onTransform={(_, state) => {
          scaleRef.current = state.scale;
          setActive(null);
          setActiveCatch(null);
        }}
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
            {markers.map((m) => {
              const pos = dragPositions[m.type];
              return (
                <BuildingMarker
                  key={m.type}
                  id={m.type}
                  x={pos?.x ?? m.x}
                  y={pos?.y ?? m.y}
                  spriteUrl={m.spriteUrl}
                  emoji={m.emoji}
                  label={m.name}
                  variant="building"
                  onClick={handleMarkerClick}
                  onDragMove={handleMarkerDragMove}
                  onDragEnd={handleMarkerDragEnd}
                  getScale={() => scaleRef.current}
                />
              );
            })}

            {activityMarkers.map((a) => (
              <BuildingMarker
                key={a.id}
                id={a.id}
                x={a.x}
                y={a.y}
                spriteUrl={null}
                emoji={a.emoji}
                label={a.name}
                variant="building"
                onClick={handleActivityClick}
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

            {players.map((player) => (
              <PlayerCharacter
                key={player.userId}
                player={player}
                bounds={WALKABLE_BOUNDS}
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

      {activeCatch && (
        <CatchPopover
          kind={activeCatch.activity.kind}
          activityName={activeCatch.activity.name}
          anchorRect={activeCatch.rect}
          money={groupPoints.money}
          onClose={() => setActiveCatch(null)}
        />
      )}
    </div>
  );
}
