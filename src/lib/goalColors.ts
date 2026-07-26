// Selectable sticky-note colors for goals. Order matters: it matches the
// original hash-derived NOTE_STYLES order in GoalCard, so goals created
// before this catalog existed (goal.color === null) keep rendering with
// the exact same color they always had.
export const GOAL_COLOR_CATALOG: Record<
  string,
  { id: string; name: string; noteClass: string }
> = {
  YELLOW: {
    id: "YELLOW",
    name: "Yellow",
    noteClass: "bg-yellow-100 dark:bg-yellow-900/40",
  },
  PINK: {
    id: "PINK",
    name: "Pink",
    noteClass: "bg-pink-100 dark:bg-pink-900/40",
  },
  SKY: {
    id: "SKY",
    name: "Sky",
    noteClass: "bg-sky-100 dark:bg-sky-900/40",
  },
  LIME: {
    id: "LIME",
    name: "Lime",
    noteClass: "bg-lime-100 dark:bg-lime-900/40",
  },
};
