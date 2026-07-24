"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "@/components/Avatar";

export default function ProfileMenu({
  name,
  avatarPath,
  children,
}: {
  name: string;
  avatarPath: string | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full px-2 py-1 text-sm hover:bg-accent-soft"
      >
        <Avatar name={name} avatarPath={avatarPath} size="sm" />
        <span className="font-medium">{name}</span>
      </button>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="absolute right-0 top-full z-10 mt-2 flex w-44 flex-col gap-1 rounded-xl border border-border bg-card p-2 shadow-lg"
        >
          {children}
        </div>
      )}
    </div>
  );
}
