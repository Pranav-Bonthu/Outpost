import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import AvatarUploadForm from "@/components/AvatarUploadForm";
import ProfileForm from "@/components/ProfileForm";
import CharacterPicker from "@/components/CharacterPicker";
import EmailForm from "@/components/EmailForm";
import PasswordForm from "@/components/PasswordForm";
import VillageInfoCard from "@/components/VillageInfoCard";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-xl font-semibold">Your profile</h1>
        <p className="text-sm text-foreground/60">
          How you show up to the rest of your group.
        </p>
      </div>

      <AvatarUploadForm name={user.name} avatarPath={user.avatarPath} />
      <ProfileForm initialName={user.name} initialBio={user.bio} />
      <CharacterPicker
        initialCharacterId={user.characterId}
        initialCharacterColor={user.characterColor}
      />

      {user.group && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground/70">Village</h2>
          <VillageInfoCard
            groupName={user.group.name}
            inviteCode={user.group.inviteCode}
          />
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-foreground/70">Account</h2>
      </div>
      <EmailForm currentEmail={user.email} />
      <PasswordForm />
    </main>
  );
}
