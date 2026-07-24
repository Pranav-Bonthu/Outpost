import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Avatar from "@/components/Avatar";

export default async function MembersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.groupId) redirect("/group/new");

  const members = await prisma.user.findMany({
    where: { groupId: user.groupId },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-xl font-semibold">Your group</h1>
        <p className="text-sm text-foreground/60">
          Everyone you&apos;re doing this with.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <Avatar name={member.name} avatarPath={member.avatarPath} size="md" />
            <div className="flex flex-col">
              <span className="font-medium">
                {member.name}
                {member.id === user.id && (
                  <span className="ml-1 text-xs font-normal text-foreground/50">
                    (you)
                  </span>
                )}
              </span>
              {member.bio && (
                <span className="text-sm text-foreground/60">{member.bio}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
