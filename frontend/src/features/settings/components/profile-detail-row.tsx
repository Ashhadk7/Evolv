"use client";

import type { ElementType } from "react";
import { motion } from "framer-motion";
import { MID, TEXT_BODY, TEXT_DIM } from "@/features/settings/lib/settings-theme";

export function ProfileDetailRow({
  Icon,
  label,
  value,
  href,
}: {
  Icon: ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  if (!value) return null;

  const content = (
    <>
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ background: "#edf5f1", color: MID }}
      >
        <Icon size={15} weight="bold" />
      </span>
      <span className="min-w-0">
        <span
          className="block text-[10px] font-bold tracking-widest uppercase"
          style={{ color: TEXT_DIM }}
        >
          {label}
        </span>
        <span className="block truncate text-[12px] font-semibold" style={{ color: TEXT_BODY }}>
          {value}
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noreferrer"
        whileHover={{ x: 2, backgroundColor: "#f8fbf9" }}
        className="flex items-center gap-3 px-3.5 py-2.5 transition-colors"
        style={{ borderRadius: 8 }}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.div
      whileHover={{ x: 2, backgroundColor: "#f8fbf9" }}
      className="flex items-center gap-3 px-3.5 py-2.5 transition-colors"
      style={{ borderRadius: 8 }}
    >
      {content}
    </motion.div>
  );
}
