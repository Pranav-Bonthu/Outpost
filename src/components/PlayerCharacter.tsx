"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PlayerMarkerData } from "@/lib/villageMap";
import {
  CHARACTER_FRAME_COUNT,
  CHARACTER_TINTS,
  type CharacterDirection,
} from "@/lib/villageCharacters";
import { colorForName, initials } from "@/components/Avatar";

const WALK_SPEED = 40; // world px/second
const ARRIVAL_EPSILON = 4;
const FRAME_INTERVAL_MS = 150;
const MIN_DWELL_MS = 500;
const MAX_DWELL_MS = 2000;

type Bounds = { minX: number; maxX: number; minY: number; maxY: number };

function randomPointIn(bounds: Bounds) {
  return {
    x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
    y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
  };
}

export default function PlayerCharacter({
  player,
  bounds,
}: {
  player: PlayerMarkerData;
  bounds: Bounds;
}) {
  const [pos, setPos] = useState(() => randomPointIn(bounds));
  const [direction, setDirection] = useState<CharacterDirection>("down");
  const [facing, setFacing] = useState<"left" | "right">("right");
  const [frame, setFrame] = useState(0);
  const [phase, setPhase] = useState<"walking" | "pausing">("walking");

  // Mutable per-tick state lives in a ref so the rAF loop can run every
  // frame without re-subscribing; the mirrored useState values above are
  // only what actually needs to trigger a re-render.
  const stateRef = useRef({
    x: pos.x,
    y: pos.y,
    target: randomPointIn(bounds),
    phase: "walking" as "walking" | "pausing",
    dwellUntil: 0,
    lastFrameAt: 0,
    frame: 0,
  });

  useEffect(() => {
    let raf: number;
    let lastTime = performance.now();

    function tick(now: number) {
      const dt = now - lastTime;
      lastTime = now;
      const s = stateRef.current;

      if (s.phase === "pausing") {
        if (now >= s.dwellUntil) {
          s.target = randomPointIn(bounds);
          s.phase = "walking";
          setPhase("walking");
        }
      } else {
        const dx = s.target.x - s.x;
        const dy = s.target.y - s.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= ARRIVAL_EPSILON) {
          s.phase = "pausing";
          s.dwellUntil =
            now + MIN_DWELL_MS + Math.random() * (MAX_DWELL_MS - MIN_DWELL_MS);
          setPhase("pausing");
        } else {
          const step = Math.min(dist, (WALK_SPEED * dt) / 1000);
          s.x += (dx / dist) * step;
          s.y += (dy / dist) * step;
          setPos({ x: s.x, y: s.y });

          if (Math.abs(dx) > Math.abs(dy)) {
            setDirection("side");
            setFacing(dx > 0 ? "right" : "left");
          } else {
            setDirection(dy > 0 ? "down" : "up");
          }

          if (now - s.lastFrameAt >= FRAME_INTERVAL_MS) {
            s.lastFrameAt = now;
            s.frame = (s.frame + 1) % CHARACTER_FRAME_COUNT;
            setFrame(s.frame);
          }
        }
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // `bounds` is the module-level WALKABLE_BOUNDS constant, stable across
    // renders — the loop intentionally starts once per mount, not per render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tint = player.characterColor
    ? CHARACTER_TINTS[player.characterColor]
    : null;
  const restFrame = phase === "pausing" ? 0 : frame;
  const spriteSrc = player.spriteBaseUrl
    ? `${player.spriteBaseUrl}/${direction}/frame-${restFrame + 1}.png`
    : null;

  return (
    <div
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
      style={{ left: pos.x, top: pos.y }}
    >
      {spriteSrc ? (
        <Image
          src={spriteSrc}
          alt={player.name}
          width={48}
          height={48}
          className="pointer-events-none [image-rendering:pixelated] drop-shadow-md"
          style={{
            filter: tint && tint.filter !== "none" ? tint.filter : undefined,
            transform:
              direction === "side" && facing === "left"
                ? "scaleX(-1)"
                : undefined,
          }}
        />
      ) : (
        <span
          className="pointer-events-none flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white shadow-md"
          style={{ backgroundColor: colorForName(player.name) }}
        >
          {initials(player.name)}
        </span>
      )}
      <span className="pointer-events-none rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-foreground/80 shadow-sm">
        {player.name}
      </span>
    </div>
  );
}
