import CommentForm from "@/components/CommentForm";
import ReactionBar from "@/components/ReactionBar";
import { POST_TAG_BADGE_STYLES, POST_TAG_CARD_STYLES } from "@/lib/postTags";

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
  reactions: { id: string; emoji: string; userId: string }[];
  comments: {
    id: string;
    text: string;
    createdAt: Date;
    author: { id: string; name: string };
  }[];
};

export default function PostCard({
  post,
  currentUserId,
}: {
  post: PostWithRelations;
  currentUserId: string;
}) {
  const cardStyle =
    POST_TAG_CARD_STYLES[post.tag as keyof typeof POST_TAG_CARD_STYLES] ??
    POST_TAG_CARD_STYLES.Other;
  const badgeStyle =
    POST_TAG_BADGE_STYLES[post.tag as keyof typeof POST_TAG_BADGE_STYLES] ??
    POST_TAG_BADGE_STYLES.Other;

  return (
    <article
      className={`flex flex-col gap-3 rounded-2xl border border-border p-4 ${cardStyle}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{post.author.name}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeStyle}`}
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

      <ReactionBar
        postId={post.id}
        reactions={post.reactions}
        currentUserId={currentUserId}
      />

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
