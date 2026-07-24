import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();

  if (user?.groupId) {
    redirect("/feed");
  }
  if (user) {
    redirect("/group/new");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <span className="text-5xl">🏕️</span>
      <h1 className="text-3xl font-semibold">Outpost</h1>
      <p className="max-w-md text-foreground/70">
        A quiet, low-pressure place for a small group of friends to cheer
        each other on through the job search — post updates, set goals
        everyone can see, and grow one shared village together.
      </p>
      <div className="flex gap-3">
        <Link
          href="/signup"
          className="rounded-full bg-accent px-5 py-2.5 font-medium text-white"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-border px-5 py-2.5 font-medium hover:bg-accent-soft"
        >
          Log in
        </Link>
      </div>
    </main>
  );
}
