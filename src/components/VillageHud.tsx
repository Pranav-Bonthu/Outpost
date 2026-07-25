import Image from "next/image";

export default function VillageHud({
  points,
  money,
}: {
  points: number;
  money: number;
}) {
  return (
    <div className="absolute right-4 top-4 z-40 flex gap-2">
      <div
        className="flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 py-1.5 shadow-md backdrop-blur"
        title="Points"
        aria-label={`${points} points`}
      >
        <Image
          src="/sprites/hud/points-icon.png"
          alt=""
          width={20}
          height={20}
          className="[image-rendering:pixelated]"
        />
        <span className="text-sm font-semibold">{points}</span>
      </div>
      <div
        className="flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 py-1.5 shadow-md backdrop-blur"
        title="Money"
        aria-label={`${money} money`}
      >
        <Image
          src="/sprites/hud/money-icon.png"
          alt=""
          width={20}
          height={20}
          className="[image-rendering:pixelated]"
        />
        <span className="text-sm font-semibold">{money}</span>
      </div>
    </div>
  );
}
