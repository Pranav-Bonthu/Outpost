"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { POST_TAGS, type PostTagName } from "@/lib/postTags";

export default function PostForm({
  goals = [],
}: {
  goals?: { id: string; description: string }[];
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [tag, setTag] = useState<PostTagName>("Application");
  const [optionalLink, setOptionalLink] = useState("");
  const [goalId, setGoalId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        tag,
        optionalLink,
        goalId: goalId || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    setText("");
    setOptionalLink("");
    setGoalId("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
    >
      <textarea
        className="min-h-20 resize-none rounded-lg border border-border bg-transparent px-3 py-2 outline-none focus:border-accent"
        placeholder="Share an update…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <select
        value={tag}
        onChange={(e) => setTag(e.target.value as PostTagName)}
        className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
      >
        {POST_TAGS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <input
        type="text"
        className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
        placeholder="Optional link"
        value={optionalLink}
        onChange={(e) => setOptionalLink(e.target.value)}
      />
      {goals.length > 0 && (
        <select
          value={goalId}
          onChange={(e) => setGoalId(e.target.value)}
          className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">No linked goal</option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>
              {g.description}
            </option>
          ))}
        </select>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="self-end rounded-full bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Posting…" : "Post update (+10 pts)"}
      </button>
    </form>
  );
}
