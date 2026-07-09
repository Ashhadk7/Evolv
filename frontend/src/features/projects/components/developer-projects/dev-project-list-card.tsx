import { motion } from "framer-motion";
import { MeterBar } from "@/components/shared/meter-bar";

export function DevProjectListCard({
  name,
  industry,
  phaseName,
  progress,
  isActive,
  onClick,
}: {
  name: string;
  industry: string;
  phaseName: string;
  progress: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      className={`w-full text-left cursor-pointer border rounded-2xl p-[16px_20px] transition shadow-[0_1px_1px_rgba(19,36,29,0.03),0_2px_6px_rgba(19,36,29,0.03),0_16px_40px_-18px_rgba(19,36,29,0.14)] ${isActive ? "border-bp-mint bg-bp-tint" : "border-bp-border bg-bp-card"}`}
    >
      <div className="flex justify-between items-start mb-2.5">
        <div>
          <div className="text-bp-ink text-[16px] font-extrabold">
            {name}
          </div>
          <div className="text-bp-muted text-[11px] mt-1">
            {industry} · {phaseName}
          </div>
        </div>
        <div className="text-bp-teal text-[14px] font-bold tabular-nums font-feature-settings-[_tnum_1,_ss01_1]">
          {progress}%
        </div>
      </div>
      <MeterBar value={progress} />
    </motion.button>
  );
}
