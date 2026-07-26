"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CHARACTER_CATALOG, CHARACTER_TINTS } from "@/lib/villageCharacters";

export default function CharacterPicker({
  initialCharacterId,
  initialCharacterColor,
}: {
  initialCharacterId: string | null;
  initialCharacterColor: string | null;
}) {
  const router = useRouter();
  const [characterId, setCharacterId] = useState(initialCharacterId);
  const [characterColor, setCharacterColor] = useState(initialCharacterColor);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save(next: {
    characterId?: string | null;
    characterColor?: string | null;
  }) {
    setError(null);
    setLoading(true);

    const res = await fetch("/api/profile/character", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      return;
    }

    router.refresh();
  }

  function handlePickCharacter(id: string) {
    setCharacterId(id);
    save({ characterId: id, characterColor });
  }

  function handlePickColor(colorId: string) {
    setCharacterColor(colorId);
    save({ characterId, characterColor: colorId });
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground/70">
          Your village character
        </h2>
        <p className="text-xs text-foreground/50">
          Pick who wanders the village map for you.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {Object.values(CHARACTER_CATALOG).map((character) => {
          const selected = characterId === character.id;
          const tint = characterColor ? CHARACTER_TINTS[characterColor] : null;
          return (
            <button
              key={character.id}
              type="button"
              disabled={loading}
              onClick={() => handlePickCharacter(character.id)}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition-colors disabled:opacity-60 ${
                selected
                  ? "border-accent bg-accent-soft"
                  : "border-border hover:bg-accent-soft"
              }`}
            >
              <Image
                src={`/sprites/characters/${character.slug}/down/frame-1.png`}
                alt={character.name}
                width={48}
                height={48}
                className="[image-rendering:pixelated]"
                style={{
                  filter: tint && tint.filter !== "none" ? tint.filter : undefined,
                }}
              />
              <span className="text-xs">{character.name}</span>
            </button>
          );
        })}
      </div>

      <div>
        <span className="text-xs font-medium text-foreground/60">Color</span>
        <div className="mt-1 flex flex-wrap gap-2">
          {Object.values(CHARACTER_TINTS).map((tint) => {
            const selected = (characterColor ?? "DEFAULT") === tint.id;
            return (
              <button
                key={tint.id}
                type="button"
                disabled={loading}
                onClick={() => handlePickColor(tint.id)}
                title={tint.name}
                aria-label={tint.name}
                className={`h-7 w-7 rounded-full border-2 disabled:opacity-60 ${
                  selected ? "border-accent" : "border-border"
                }`}
                style={{
                  backgroundColor: "#d97845",
                  filter: tint.filter !== "none" ? tint.filter : undefined,
                }}
              />
            );
          })}
        </div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
