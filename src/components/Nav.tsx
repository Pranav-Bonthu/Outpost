import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { signOut } from "@/lib/auth";
import ProfileMenu from "@/components/ProfileMenu";
import ThemeToggle from "@/components/ThemeToggle";

export default async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-accent">
          🏕️ Outpost
        </Link>

        {user && (
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {user.groupId ? (
              <>
                <Link
                  href="/feed"
                  className="rounded-full px-3 py-1.5 hover:bg-accent-soft"
                >
                  Feed
                </Link>
                <Link
                  href="/resume-check"
                  className="rounded-full px-3 py-1.5 hover:bg-accent-soft"
                >
                  Resume check
                </Link>
                <Link
                  href="/village"
                  className="rounded-full px-3 py-1.5 hover:bg-accent-soft"
                >
                  Village
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/resume-check"
                  className="rounded-full px-3 py-1.5 hover:bg-accent-soft"
                >
                  Resume check
                </Link>
                <Link
                  href="/group/new"
                  className="rounded-full px-3 py-1.5 font-medium text-accent hover:bg-accent-soft"
                >
                  Join a village
                </Link>
              </>
            )}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <ProfileMenu name={user.name} avatarPath={user.avatarPath}>
              <Link
                href="/profile"
                className="rounded-lg px-3 py-2 text-sm hover:bg-accent-soft"
              >
                Profile
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground/60 hover:bg-accent-soft"
                >
                  Sign out
                </button>
              </form>
            </ProfileMenu>
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
      </div>
    </header>
  );
}
