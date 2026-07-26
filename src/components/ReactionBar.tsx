"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REACTION_EMOJIS } from "@/lib/reactions";

export default function ReactionBar({
  postId,
  reactions,
  currentUserId,
}: {
  postId: string;
  reactions: { id: string; emoji: string; userId: string }[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const counts: Record<string, number> = {};
  for (const r of reactions) {
    counts[r.emoji] = (counts[r.emoji] ?? 0) + 1;
  }
  const myEmoji = reactions.find((r) => r.userId === currentUserId)?.emoji;

  async function react(emoji: string) {
    setLoading(true);
    const res = await fetch(`/api/posts/${postId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    });
    if (res.ok) {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {REACTION_EMOJIS.map((emoji) => {
        const count = counts[emoji] ?? 0;
        const active = myEmoji === emoji;
        return (
          <button
            key={emoji}
            type="button"
            disabled={loading}
            onClick={() => react(emoji)}
            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm disabled:opacity-60 ${
              active
                ? "border-accent bg-accent-soft"
                : "border-border hover:bg-accent-soft"
            }`}
          >
            <span>{emoji}</span>
            {count > 0 && (
              <span className="text-xs text-foreground/70">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
