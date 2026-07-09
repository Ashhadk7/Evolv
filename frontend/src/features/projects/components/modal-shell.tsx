"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "@phosphor-icons/react";

export function ModalShell({
  icon,
  title,
  subtitle,
  onClose,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-[#0f1c18]/45 backdrop-blur-[3px] flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-bp-card border border-bp-border rounded-2xl shadow-[0_1px_1px_rgba(19,36,29,0.03),0_2px_6px_rgba(19,36,29,0.03),0_16px_40px_-18px_rgba(19,36,29,0.14)] p-[26px_26px_22px] w-full max-w-[420px]"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-bp-tint w-[34px] h-[34px] rounded-lg border border-bp-border-soft flex items-center justify-center">
              {icon}
            </div>
            <div>
              <div className="text-bp-ink text-[15px] font-extrabold">
                {title}
              </div>
              {subtitle && (
                <div className="text-bp-muted text-[11px]">
                  {subtitle}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-bp-tint w-[30px] h-[30px] flex items-center justify-center rounded-lg border border-bp-border-soft cursor-pointer shrink-0"
          >
            <X size={13} className="text-bp-muted" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
