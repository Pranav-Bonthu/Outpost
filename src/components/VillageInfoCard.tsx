"use client";

import { useState } from "react";
import LeaveGroupButton from "@/components/LeaveGroupButton";

export default function VillageInfoCard({
  groupName,
  inviteCode,
}: {
  groupName: string;
  inviteCode: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <p className="text-sm text-foreground/60">
        Village: <span className="font-medium">{groupName}</span>
      </p>
      <label className="flex flex-col gap-1 text-sm">
        Invite code
        <div className="flex items-center gap-2">
          <span className="flex-1 rounded-lg border border-border bg-transparent px-3 py-2 font-mono tracking-widest">
            {inviteCode}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full border border-border px-3 py-2 text-sm hover:bg-accent-soft"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </label>
      <p className="text-sm text-foreground/60">
        Share this code so others can join your village.
      </p>
      <LeaveGroupButton />
    </div>
  );
}
