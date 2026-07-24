"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TAGS = [
  "Application",
  "Referral",
  "Certification",
  "Project",
  "Networking",
  "Other",
] as const;

export default function PostForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [tag, setTag] = useState<(typeof TAGS)[number]>("Application");
  const [optionalLink, setOptionalLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, tag, optionalLink }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    setText("");
    setOptionalLink("");
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
        placeholder="What did you do today? Applied somewhere, got a referral, finished a course…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <div className="flex flex-wrap gap-2">
        {TAGS.map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setTag(t)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              tag === t
                ? "border-accent bg-accent text-white"
                : "border-border text-foreground/70 hover:bg-accent-soft"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <input
        type="text"
        className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
        placeholder="Optional link (job posting, cert, project…)"
        value={optionalLink}
        onChange={(e) => setOptionalLink(e.target.value)}
      />
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
