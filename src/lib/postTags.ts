export const POST_TAGS = [
  "Application",
  "Referral",
  "Certification",
  "Project",
  "Networking",
  "Other",
] as const;

export type PostTagName = (typeof POST_TAGS)[number];

export const POST_TAG_BADGE_STYLES: Record<PostTagName, string> = {
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

export const POST_TAG_CARD_STYLES: Record<PostTagName, string> = {
  Application: "bg-blue-50 dark:bg-blue-950/30",
  Referral: "bg-purple-50 dark:bg-purple-950/30",
  Certification: "bg-emerald-50 dark:bg-emerald-950/30",
  Project: "bg-amber-50 dark:bg-amber-950/30",
  Networking: "bg-pink-50 dark:bg-pink-950/30",
  Other: "bg-zinc-50 dark:bg-zinc-900/30",
};
