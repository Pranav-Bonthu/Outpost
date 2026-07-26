import Avatar from "@/components/Avatar";

export default function MemberList({
  members,
  currentUserId,
}: {
  members: { id: string; name: string; avatarPath: string | null }[];
  currentUserId: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground/60">Group</h2>
      <div className="flex flex-col gap-1">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5"
          >
            <Avatar name={member.name} avatarPath={member.avatarPath} size="sm" />
            <span className="truncate text-sm font-medium">
              {member.name}
              {member.id === currentUserId && (
                <span className="ml-1 text-xs font-normal text-foreground/50">
                  (you)
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
