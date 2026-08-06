"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CaretRight } from "@phosphor-icons/react";

/**
 * Ongoing and closed projects are the same grid under different headings, on
 * both the founder and the developer side — the chrome lives here once.
 */
export function ProjectSection({
  title,
  count,
  collapsible = false,
  children,
}: {
  title: string;
  count: number;
  collapsible?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!collapsible);

  if (count === 0) return null;

  const heading = (
    <>
      <span className="text-bp-ink text-[13.5px] font-extrabold">{title}</span>
      <span className="text-bp-muted bg-bp-tint rounded-full px-2 py-0.5 text-[11.5px] font-bold tabular-nums">
        {count}
      </span>
    </>
  );

  return (
    <div className="flex flex-col gap-3.5">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex cursor-pointer items-center gap-2 self-start"
        >
          <CaretRight
            size={13}
            weight="bold"
            className={`text-bp-muted transition-transform ${open ? "rotate-90" : ""}`}
          />
          {heading}
        </button>
      ) : (
        <div className="flex items-center gap-2">{heading}</div>
      )}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
