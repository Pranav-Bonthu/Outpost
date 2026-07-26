export default function CollectionButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute left-4 top-4 z-40 flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 py-1.5 shadow-md backdrop-blur hover:bg-accent-soft"
      aria-label="Open collection"
    >
      <span className="text-base" aria-hidden>
        📖
      </span>
      <span className="text-sm font-semibold">Collection</span>
    </button>
  );
}
