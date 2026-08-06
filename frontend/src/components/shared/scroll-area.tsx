"use client";

import type { ReactNode } from "react";

/**
 * Grows with its content up to a ceiling, then scrolls in place so a phase with
 * thirty deliverables takes no more vertical room than one with three.
 *
 * Heights are named rather than passed as numbers because Tailwind only emits
 * classes it can read as complete strings.
 */
const MAX_HEIGHT = {
  sm: "max-h-[220px]",
  md: "max-h-[320px]",
  lg: "max-h-[420px]",
} as const;

export function ScrollArea({
  size = "md",
  children,
}: {
  size?: keyof typeof MAX_HEIGHT;
  children: ReactNode;
}) {
  return (
    <div className={`blueprint-scroll overflow-y-auto overscroll-contain pr-1 ${MAX_HEIGHT[size]}`}>
      {children}
    </div>
  );
}
