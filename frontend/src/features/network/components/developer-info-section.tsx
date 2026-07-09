"use client";

import type { ElementType, ReactNode } from "react";
import { motion } from "framer-motion";

export function DeveloperInfoSection({
  Icon,
  title,
  description,
  children,
}: {
  Icon: ElementType;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-white p-4 border border-[#e8ede9] mt-5"
    >
      <div className="mb-3 flex items-start gap-2.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0f5f2] text-[#428475]">
          <Icon size={16} weight="bold" />
        </span>
        <div>
          <div className="text-[12px] font-bold tracking-wide uppercase text-[#7a9e8e]">
            {title}
          </div>
          <p className="mt-0.5 text-[11px] leading-5 text-[#8ca99d]">
            {description}
          </p>
        </div>
      </div>
      {children}
    </motion.section>
  );
}
