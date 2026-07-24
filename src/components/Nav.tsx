import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { signOut } from "@/lib/auth";

export default async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-accent">
          🏕️ Outpost
        </Link>

        {user?.groupId && (
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            <Link
              href="/feed"
              className="rounded-full px-3 py-1.5 hover:bg-accent-soft"
            >
              Feed
            </Link>
            <Link
              href="/goals"
              className="rounded-full px-3 py-1.5 hover:bg-accent-soft"
            >
              Goals
            </Link>
            <Link
              href="/village"
              className="rounded-full px-3 py-1.5 hover:bg-accent-soft"
            >
              Village
            </Link>
          </nav>
        )}

        {user ? (
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="text-sm text-foreground/60 hover:text-foreground"
            >
              Sign out ({user.name})
            </button>
          </form>
        ) : (
          <div className="flex gap-3 text-sm">
            <Link href="/login" className="hover:text-accent">
              Log in
            </Link>
            <Link href="/signup" className="font-medium text-accent">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
