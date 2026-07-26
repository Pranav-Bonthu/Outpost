import GoalStatusButtons from "@/components/GoalStatusButtons";

const STATUS_STYLES: Record<string, string> = {
  in_progress:
    "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  hit: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  missed: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const STATUS_LABEL: Record<string, string> = {
  in_progress: "In progress",
  hit: "Hit 🎉",
  missed: "Missed",
};

const NOTE_STYLES = [
  "bg-yellow-100 dark:bg-yellow-900/40",
  "bg-pink-100 dark:bg-pink-900/40",
  "bg-sky-100 dark:bg-sky-900/40",
  "bg-lime-100 dark:bg-lime-900/40",
];

const ROTATIONS = [-3, -1.5, 1, 2.5, -2];

function hashId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash;
}

type GoalWithAuthor = {
  id: string;
  description: string;
  period: string;
  status: string;
  author: { id: string; name: string };
};

export default function GoalCard({
  goal,
  currentUserId,
}: {
  goal: GoalWithAuthor;
  currentUserId: string;
}) {
  const hash = hashId(goal.id);
  const rotation = ROTATIONS[hash % ROTATIONS.length];
  const noteStyle = NOTE_STYLES[hash % NOTE_STYLES.length];

  return (
    <div
      className={`relative flex flex-col gap-2 rounded-lg p-4 pt-5 shadow-md ${noteStyle}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <span
        className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl drop-shadow-sm"
        aria-hidden
      >
        📌
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-medium">{goal.author.name}</span>
        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium capitalize text-accent">
          {goal.period}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[goal.status]}`}
        >
          {STATUS_LABEL[goal.status]}
        </span>
      </div>
      <p className="text-sm leading-relaxed">{goal.description}</p>
      {goal.author.id === currentUserId && (
        <div className="pt-1">
          <GoalStatusButtons goalId={goal.id} status={goal.status} />
        </div>
      )}
    </div>
  );
}
