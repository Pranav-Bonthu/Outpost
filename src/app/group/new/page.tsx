import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import GroupSetupForms from "@/components/GroupSetupForms";

export default async function GroupNewPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.groupId) redirect("/feed");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold">One group to call home</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Start a new group for your friends, or join one with an invite
          code someone already shared with you.
        </p>
      </div>

      <GroupSetupForms />

      <p className="text-center text-xs text-foreground/50">
        Not who you think? <Link href="/login" className="underline">Switch accounts</Link>
      </p>
    </main>
  );
}
