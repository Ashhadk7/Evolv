"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CaretDown, ListBullets } from "@phosphor-icons/react";

import { TOC_SECTIONS, scrollToSection } from "./blueprint-detail-data";

export function SectionNav() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const jumpTo = (id: string) => {
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="border-bp-border text-bp-teal flex cursor-pointer items-center gap-[7px] rounded-[10px] border bg-white/70 px-[13px] py-2 text-[13px] font-semibold"
      >
        <ListBullets size={15} weight="bold" />
        Sections
        <CaretDown
          size={12}
          weight="bold"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Jump to section"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="border-bp-border absolute top-[calc(100%+6px)] left-0 z-50 max-h-[60vh] w-[264px] overflow-y-auto rounded-xl border bg-white p-1.5 shadow-[0_18px_40px_rgba(16,42,33,0.16)]"
          >
            {TOC_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                role="menuitem"
                onClick={() => jumpTo(section.id)}
                className="text-bp-ink hover:bg-bp-page focus-visible:bg-bp-page block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-[12.5px] font-medium"
              >
                {section.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
