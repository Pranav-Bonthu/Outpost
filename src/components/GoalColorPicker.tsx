"use client";

import { GOAL_COLOR_CATALOG } from "@/lib/goalColors";

export default function GoalColorPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (colorId: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.values(GOAL_COLOR_CATALOG).map((color) => {
        const selected = value === color.id;
        return (
          <button
            key={color.id}
            type="button"
            title={color.name}
            aria-label={color.name}
            onClick={() => onChange(color.id)}
            className={`h-7 w-7 rounded-full border-2 ${color.noteClass} ${
              selected ? "border-accent" : "border-border"
            }`}
          />
        );
      })}
    </div>
  );
}
