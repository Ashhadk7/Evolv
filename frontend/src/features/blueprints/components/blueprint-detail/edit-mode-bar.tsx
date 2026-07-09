"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FloppyDisk, PencilSimple } from "@phosphor-icons/react";

export function EditModeBar({
  editing,
  onAddFeature,
  onCancel,
  onSave,
}: {
  editing: boolean;
  onAddFeature: () => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <AnimatePresence>
      {editing && (
        <motion.div
          className="blueprint-no-print bg-bp-forest fixed right-0 bottom-0 left-0 z-[55] flex items-center justify-between px-8 py-[15px] shadow-[0_-10px_34px_rgba(11,34,27,0.3)]"
          initial={{ y: 90 }}
          animate={{ y: 0 }}
          exit={{ y: 90 }}
          transition={{ type: "spring", stiffness: 340, damping: 30 }}
        >
          <div className="flex items-center gap-4">
            <span className="text-bp-mint flex items-center gap-[9px] text-[13px] font-bold">
              <PencilSimple size={16} /> Editing blueprint
            </span>
            <button
              onClick={onAddFeature}
              className="text-bp-mint-soft cursor-pointer rounded-[9px] border border-[rgba(137,215,183,0.2)] bg-[rgba(137,215,183,0.12)] px-[13px] py-[7px] text-xs font-semibold"
            >
              + Feature
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="text-bp-mint-soft cursor-pointer rounded-[11px] border border-[rgba(137,215,183,0.3)] bg-transparent px-5 py-2.5 text-[13px] font-semibold"
            >
              Cancel
            </button>
            <motion.button
              onClick={onSave}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-bp-mint text-bp-deep flex cursor-pointer items-center gap-2 rounded-[11px] border-none px-[22px] py-2.5 text-[13px] font-bold"
            >
              <FloppyDisk size={15} weight="fill" /> Save changes
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
