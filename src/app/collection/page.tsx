import { redirect } from "next/navigation";
import Image from "next/image";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { FISH_INFO, fishSpritePath } from "@/lib/wildlife/fish";
import { BIRD_INFO, birdSpritePath } from "@/lib/wildlife/birds";
import { RARITY_LABEL, RARITY_BADGE_CLASS } from "@/lib/wildlife/shared";
import type { FishSpecies, BirdSpecies } from "@/generated/prisma/client";

export default async function CollectionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.groupId) redirect("/group/new");

  const [fishCatches, birdSightings] = await Promise.all([
    prisma.fishCatch.findMany({
      where: { groupId: user.groupId },
      include: { catcher: { select: { name: true } } },
    }),
    prisma.birdSighting.findMany({
      where: { groupId: user.groupId },
      include: { catcher: { select: { name: true } } },
    }),
  ]);

  const caughtFish = new Map(
    fishCatches.map((c) => [c.species, { catcherName: c.catcher.name }])
  );
  const caughtBirds = new Map(
    birdSightings.map((c) => [c.species, { catcherName: c.catcher.name }])
  );

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Collection</h1>
        <p className="text-sm text-foreground/60">
          Every fish and bird your group has ever caught, shared village-wide.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">🎣 Fish</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(Object.entries(FISH_INFO) as [FishSpecies, (typeof FISH_INFO)[FishSpecies]][]).map(
            ([species, info]) => {
              const caught = caughtFish.get(species);
              return (
                <CollectionEntry
                  key={species}
                  caught={!!caught}
                  catcherName={caught?.catcherName}
                  name={info.name}
                  description={info.description}
                  rarity={info.rarity}
                  spriteUrl={fishSpritePath(species)}
                />
              );
            }
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">🐦 Birds</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(Object.entries(BIRD_INFO) as [BirdSpecies, (typeof BIRD_INFO)[BirdSpecies]][]).map(
            ([species, info]) => {
              const caught = caughtBirds.get(species);
              return (
                <CollectionEntry
                  key={species}
                  caught={!!caught}
                  catcherName={caught?.catcherName}
                  name={info.name}
                  description={info.description}
                  rarity={info.rarity}
                  spriteUrl={birdSpritePath(species)}
                />
              );
            }
          )}
        </div>
      </section>
    </main>
  );
}

function CollectionEntry({
  caught,
  catcherName,
  name,
  description,
  rarity,
  spriteUrl,
}: {
  caught: boolean;
  catcherName?: string;
  name: string;
  description: string;
  rarity: keyof typeof RARITY_LABEL;
  spriteUrl: string;
}) {
  if (!caught) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-2xl border border-dashed border-border bg-card/50 p-3 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground/5 text-2xl text-foreground/30">
          ?
        </span>
        <p className="text-sm font-medium text-foreground/40">???</p>
        <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs text-foreground/30">
          {RARITY_LABEL[rarity]}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
      <Image
        src={spriteUrl}
        alt={name}
        width={64}
        height={64}
        className="[image-rendering:pixelated]"
      />
      <p className="text-sm font-medium">{name}</p>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${RARITY_BADGE_CLASS[rarity]}`}
      >
        {RARITY_LABEL[rarity]}
      </span>
      <p className="text-xs text-foreground/60">{description}</p>
      {catcherName && (
        <p className="text-[10px] text-foreground/40">
          Caught by {catcherName}
        </p>
      )}
    </div>
  );
}
