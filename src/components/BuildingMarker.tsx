"use client";

import Image from "next/image";
import { useRef } from "react";

export default function BuildingMarker({
  id,
  x,
  y,
  spriteUrl,
  emoji,
  label,
  variant,
  onClick,
}: {
  id: string;
  x: number;
  y: number;
  spriteUrl: string | null;
  emoji: string;
  label: string;
  variant: "building" | "placeholder";
  onClick?: (id: string, rect: DOMRect) => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => {
        if (buttonRef.current) {
          onClick?.(id, buttonRef.current.getBoundingClientRect());
        }
      }}
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-full outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-accent"
      style={{ left: x, top: y }}
      aria-label={label}
    >
      {spriteUrl ? (
        <Image
          src={spriteUrl}
          alt={label}
          width={96}
          height={96}
          className="pointer-events-none [image-rendering:pixelated] drop-shadow-md"
        />
      ) : (
        <span className="pointer-events-none text-5xl drop-shadow-md">
          {emoji}
        </span>
      )}
    </button>
  );
}
