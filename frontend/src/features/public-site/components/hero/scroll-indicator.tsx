"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "@phosphor-icons/react";

export function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.2, duration: 1 }}
      className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
    >
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowDown size={13} className="text-cream/18" />
      </motion.div>
    </motion.div>
  );
}
