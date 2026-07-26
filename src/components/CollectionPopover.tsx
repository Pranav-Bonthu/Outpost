"use client";

import Image from "next/image";
import { RARITY_LABEL, RARITY_BADGE_CLASS } from "@/lib/wildlife/shared";
import type { CollectionEntryData, VillageCollectionData } from "@/lib/villageMap";

export default function CollectionPopover({
  collection,
  onClose,
}: {
  collection: VillageCollectionData;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col gap-6 overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Collection</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-foreground/40 hover:text-foreground/60"
          >
            Close
          </button>
        </div>

        <section className="flex flex-col gap-3">
          <h3 className="text-base font-medium">🎣 Fish</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {collection.fish.map((entry) => (
              <CollectionEntry key={entry.species} entry={entry} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-base font-medium">🐦 Birds</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {collection.birds.map((entry) => (
              <CollectionEntry key={entry.species} entry={entry} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function CollectionEntry({ entry }: { entry: CollectionEntryData }) {
  if (!entry.caught) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-2xl border border-dashed border-border bg-card/50 p-3 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground/5 text-2xl text-foreground/30">
          ?
        </span>
        <p className="text-sm font-medium text-foreground/40">???</p>
        <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs text-foreground/30">
          {RARITY_LABEL[entry.rarity]}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
      <Image
        src={entry.spriteUrl}
        alt={entry.name}
        width={64}
        height={64}
        className="[image-rendering:pixelated]"
      />
      <p className="text-sm font-medium">{entry.name}</p>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${RARITY_BADGE_CLASS[entry.rarity]}`}
      >
        {RARITY_LABEL[entry.rarity]}
      </span>
      <p className="text-xs text-foreground/60">{entry.description}</p>
      {entry.catcherName && (
        <p className="text-[10px] text-foreground/40">
          Caught by {entry.catcherName}
        </p>
      )}
    </div>
  );
}
