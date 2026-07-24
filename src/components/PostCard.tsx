import CommentForm from "@/components/CommentForm";

const TAG_STYLES: Record<string, string> = {
  Application: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  Referral:
    "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  Certification:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  Project:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  Networking: "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300",
  Other: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

function isSafeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const units: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [7, "d"],
    [4.345, "w"],
  ];
  let value = seconds;
  let unit = "s";
  for (const [size, label] of units) {
    if (value < size) {
      unit = label;
      break;
    }
    value = Math.floor(value / size);
    unit = label;
  }
  if (seconds < 60) return "just now";
  return `${value}${unit} ago`;
}

type PostWithRelations = {
  id: string;
  text: string;
  tag: string;
  optionalLink: string | null;
  createdAt: Date;
  author: { id: string; name: string };
  comments: {
    id: string;
    text: string;
    createdAt: Date;
    author: { id: string; name: string };
  }[];
};

export default function PostCard({ post }: { post: PostWithRelations }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{post.author.name}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${TAG_STYLES[post.tag] ?? TAG_STYLES.Other}`}
          >
            {post.tag}
          </span>
        </div>
        <span className="text-xs text-foreground/50">
          {timeAgo(post.createdAt)}
        </span>
      </div>

      <p className="whitespace-pre-wrap text-sm leading-relaxed">
        {post.text}
      </p>

      {post.optionalLink && isSafeHttpUrl(post.optionalLink) && (
        <a
          href={post.optionalLink}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-sm text-accent underline"
        >
          {post.optionalLink}
        </a>
      )}

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        {post.comments.map((comment) => (
          <div key={comment.id} className="text-sm">
            <span className="font-medium">{comment.author.name}</span>{" "}
            <span className="text-foreground/80">{comment.text}</span>
          </div>
        ))}
        <CommentForm postId={post.id} />
      </div>
    </article>
  );
}
