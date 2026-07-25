export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const PALETTE = [
  "#d97845",
  "#4a7c59",
  "#3d6b8a",
  "#8a5a8f",
  "#b0763f",
  "#5f7a3d",
];

export function colorForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-20 w-20 text-xl",
} as const;

export default function Avatar({
  name,
  avatarPath,
  size = "sm",
}: {
  name: string;
  avatarPath?: string | null;
  size?: keyof typeof SIZES;
}) {
  const sizeClasses = SIZES[size];

  if (avatarPath) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarPath}
        alt={name}
        className={`${sizeClasses} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <span
      className={`${sizeClasses} flex shrink-0 items-center justify-center rounded-full font-medium text-white`}
      style={{ backgroundColor: colorForName(name) }}
    >
      {initials(name)}
    </span>
  );
}
