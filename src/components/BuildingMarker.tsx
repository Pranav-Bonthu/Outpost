"use client";

import Image from "next/image";
import { useRef, useState } from "react";

const DRAG_THRESHOLD_PX = 5;

export default function BuildingMarker({
  id,
  x,
  y,
  spriteUrl,
  emoji,
  label,
  variant,
  onClick,
  onDragMove,
  onDragEnd,
  getScale,
}: {
  id: string;
  x: number;
  y: number;
  spriteUrl: string | null;
  emoji: string;
  label: string;
  variant: "building" | "placeholder";
  onClick?: (id: string, rect: DOMRect) => void;
  onDragMove?: (id: string, x: number, y: number) => void;
  onDragEnd?: (id: string, x: number, y: number) => void;
  getScale?: () => number;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    dragged: boolean;
  } | null>(null);
  // Outlives dragState (which is cleared on pointerup) so the click event
  // that fires right after pointerup can still tell a drag just happened.
  const justDraggedRef = useRef(false);

  if (variant === "placeholder") {
    return (
      <div
        className="absolute flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border-2 border-dashed border-foreground/25 bg-foreground/5 text-center text-[10px] text-foreground/40"
        style={{ left: x, top: y }}
        title="Reserved for a future building"
      >
        Coming soon
      </div>
    );
  }

  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    if (!onDragMove || !onDragEnd) return;
    justDraggedRef.current = false;
    dragState.current = {
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: x,
      startY: y,
      dragged: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    const state = dragState.current;
    if (!state || state.pointerId !== e.pointerId) return;

    const dxScreen = e.clientX - state.startClientX;
    const dyScreen = e.clientY - state.startClientY;

    if (!state.dragged) {
      if (Math.hypot(dxScreen, dyScreen) < DRAG_THRESHOLD_PX) return;
      state.dragged = true;
      setIsDragging(true);
    }

    const scale = getScale?.() ?? 1;
    onDragMove?.(id, state.startX + dxScreen / scale, state.startY + dyScreen / scale);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    const state = dragState.current;
    if (!state || state.pointerId !== e.pointerId) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragState.current = null;
    setIsDragging(false);

    if (state.dragged) {
      justDraggedRef.current = true;
      const dxScreen = e.clientX - state.startClientX;
      const dyScreen = e.clientY - state.startClientY;
      const scale = getScale?.() ?? 1;
      onDragEnd?.(id, state.startX + dxScreen / scale, state.startY + dyScreen / scale);
    }
  }

  function handleClick() {
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    if (buttonRef.current) {
      onClick?.(id, buttonRef.current.getBoundingClientRect());
    }
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`village-marker absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        isDragging
          ? "cursor-grabbing scale-105 touch-none"
          : "cursor-grab touch-none transition-transform hover:scale-105"
      }`}
      style={{ left: x, top: y }}
      aria-label={label}
    >
      {spriteUrl ? (
        <Image
          src={spriteUrl}
          alt={label}
          width={112}
          height={112}
          className="pointer-events-none [image-rendering:pixelated] drop-shadow-md"
        />
      ) : (
        <span className="pointer-events-none text-6xl drop-shadow-md">
          {emoji}
        </span>
      )}
    </button>
  );
}
