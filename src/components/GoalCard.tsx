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
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{goal.author.name}</span>
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium capitalize text-accent">
            {goal.period}
          </span>
        </div>
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
