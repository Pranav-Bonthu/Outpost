import GoalCard from "@/components/GoalCard";

type GoalWithAuthor = {
  id: string;
  description: string;
  period: string;
  status: string;
  author: { id: string; name: string };
};

export default function GoalPinBoard({
  goals,
  currentUserId,
}: {
  goals: GoalWithAuthor[];
  currentUserId: string;
}) {
  return (
    <div
      className="mt-3 flex flex-col gap-6 rounded-2xl border border-border bg-amber-900/10 p-5 dark:bg-amber-100/5"
      style={{
        backgroundImage:
          "radial-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)",
        backgroundSize: "10px 10px",
      }}
    >
      {goals.length === 0 && (
        <p className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-center text-sm text-foreground/50">
          No goals yet. Pin one for this week or month.
        </p>
      )}
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} currentUserId={currentUserId} />
      ))}
    </div>
  );
}
