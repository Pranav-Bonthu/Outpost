import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import GoalForm from "@/components/GoalForm";
import GoalCard from "@/components/GoalCard";

export default async function GoalsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.groupId) redirect("/group/new");

  const goals = await prisma.goal.findMany({
    where: { groupId: user.groupId },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, name: true } } },
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-xl font-semibold">Group goals</h1>
        <p className="text-sm text-foreground/60">
          Set a goal and the whole group can see it right away — that&apos;s
          the point.
        </p>
      </div>

      <GoalForm />

      <div className="flex flex-col gap-4">
        {goals.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-foreground/50">
            No goals yet. Set one for this week or month.
          </p>
        )}
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} currentUserId={user.id} />
        ))}
      </div>
    </main>
  );
}
