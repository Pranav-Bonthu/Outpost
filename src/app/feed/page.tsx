import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import PostForm from "@/components/PostForm";
import PostCard from "@/components/PostCard";
import TagFilter from "@/components/TagFilter";
import MemberList from "@/components/MemberList";
import GoalForm from "@/components/GoalForm";
import GoalPinBoard from "@/components/GoalPinBoard";

const VALID_TAGS = [
  "Application",
  "Referral",
  "Certification",
  "Project",
  "Networking",
  "Other",
];

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.groupId) redirect("/group/new");

  const { tag } = await searchParams;
  const activeTag = VALID_TAGS.includes(tag ?? "") ? tag : undefined;

  const [posts, members, goals] = await Promise.all([
    prisma.post.findMany({
      where: {
        groupId: user.groupId,
        ...(activeTag ? { tag: activeTag as never } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.user.findMany({
      where: { groupId: user.groupId },
      orderBy: { name: "asc" },
    }),
    prisma.goal.findMany({
      where: { groupId: user.groupId },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true } } },
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_minmax(0,1fr)_300px] lg:items-start">
        <aside className="order-2 lg:order-1 lg:sticky lg:top-20">
          <MemberList members={members} currentUserId={user.id} />
        </aside>

        <div className="order-1 flex flex-col gap-6 lg:order-2">
          <div>
            <h1 className="text-xl font-semibold">Group feed</h1>
            <p className="text-sm text-foreground/60">
              Every update here earns the village points. Show up for each
              other.
            </p>
          </div>

          <PostForm />

          <TagFilter activeTag={activeTag} />

          <div className="flex flex-col gap-4">
            {posts.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-foreground/50">
                No updates yet{activeTag ? ` tagged "${activeTag}"` : ""}. Be
                the first to share something.
              </p>
            )}
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        <aside className="order-3 lg:sticky lg:top-20">
          <GoalForm />
          <GoalPinBoard goals={goals} currentUserId={user.id} />
        </aside>
      </div>
    </main>
  );
}
