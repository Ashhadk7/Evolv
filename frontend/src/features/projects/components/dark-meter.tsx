"use client";

import { motion } from "framer-motion";
import { EASE } from "@/components/shared/card-style";

export function DarkMeter({ value, delay }: { value: number; delay: number }) {
  return (
    <div className="h-[3px] overflow-hidden rounded-full bg-[#fff4e1]/14">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true }}
        transition={{ delay, duration: 1.1, ease: EASE }}
        className="h-full rounded-full bg-gradient-to-r from-[#428475] to-[#89d7b7]"
      />
    </div>
  );
}
