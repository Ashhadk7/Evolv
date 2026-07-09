"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "@phosphor-icons/react";
import type { FAQItem } from "./cta-and-footer-data";

export function FAQAccordionItem({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {/* Top divider */}
      <div
        style={{
          height: "1px",
          background: "rgba(12,26,20,0.13)",
        }}
      />

      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-8 py-9 text-left"
        aria-expanded={isOpen}
      >
        {/* Question */}
        <span
          className="text-[21px] leading-snug font-semibold tracking-tight sm:text-[23px]"
          style={{
            color: isOpen ? "#0c1a14" : "rgba(12,26,20,0.7)",
            transition: "color 0.2s",
            fontSize: 18,
            padding: 10,
          }}
        >
          {item.question}
        </span>

        {/* Toggle */}
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{
            background: isOpen ? "#428475" : "transparent",
            border: `1.5px solid ${isOpen ? "#428475" : "rgba(12,26,20,0.18)"}`,
            transition: "background 0.2s, border-color 0.2s",
          }}
        >
          <Plus
            size={13}
            weight="bold"
            style={{ color: isOpen ? "#fff" : "rgba(12,26,20,0.45)" }}
          />
        </motion.div>
      </button>

      {/* Answer */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="overflow-hidden"
          >
            <p
              className="max-w-2xl pr-16 pb-10 text-[15.5px] leading-[1.9]"
              style={{ color: "rgba(12,26,20,0.52)" }}
            >
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
