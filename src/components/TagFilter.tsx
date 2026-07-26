import Link from "next/link";
import { POST_TAGS } from "@/lib/postTags";

export default function TagFilter({ activeTag }: { activeTag?: string }) {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <Link
        href="/feed"
        className={`rounded-full border px-3 py-1 font-medium ${
          !activeTag
            ? "border-accent bg-accent text-white"
            : "border-border text-foreground/70 hover:bg-accent-soft"
        }`}
      >
        All
      </Link>
      {POST_TAGS.map((tag) => (
        <Link
          key={tag}
          href={`/feed?tag=${tag}`}
          className={`rounded-full border px-3 py-1 font-medium ${
            activeTag === tag
              ? "border-accent bg-accent text-white"
              : "border-border text-foreground/70 hover:bg-accent-soft"
          }`}
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
