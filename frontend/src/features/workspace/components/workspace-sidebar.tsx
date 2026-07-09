"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Clock, Lightbulb, PencilSimple } from "@phosphor-icons/react";
import {
  WORKSPACE_ACTIVITY,
  WORKSPACE_GUIDANCE,
  WORKSPACE_INSIGHTS,
} from "@/features/workspace/data/workspace-data";

interface SidebarSectionProps {
  icon: ReactNode;
  title: string;
  badge?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  delay: number;
}

function SidebarSection({ icon, title, badge, action, children, delay }: SidebarSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 26 }}
      className="rounded-[18px] border border-[#e4ece7] bg-white px-[22px] py-5 shadow-[0_2px_10px_rgba(26,49,44,0.04)]"
    >
      <div className="mb-[18px] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-[#e8f5ef]">
            {icon}
          </div>
          <span className="text-[13px] font-extrabold tracking-[-0.01em] text-[#1a2e26]">
            {title}
          </span>
        </div>
        {badge ?? action}
      </div>
      {children}
    </motion.div>
  );
}

export function WorkspaceSidebar() {
  return (
    <div className="flex h-full max-w-[298px] min-w-[278px] flex-col gap-4 overflow-y-auto">
      <SidebarSection
        icon={<Lightbulb size={15} weight="fill" className="text-[#2e7d5c]" />}
        title="Founder Insights"
        badge={
          <span className="rounded-full bg-[#dcf0e6] px-[9px] py-[3px] text-[10px] font-bold tracking-[0.05em] text-[#1d6e47]">
            AI
          </span>
        }
        delay={0.15}
      >
        <div className="flex flex-col gap-3.5">
          {WORKSPACE_INSIGHTS.map((ins, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="flex items-start gap-2.5"
            >
              <div className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#89d7b7]" />
              <p className="m-0 text-xs leading-[1.6] text-[#4a6a5a]">
                {ins.bold
                  ? ins.text.split(ins.bold).map((part, pi, arr) => (
                      <span key={pi}>
                        {part}
                        {pi < arr.length - 1 && (
                          <strong className="text-[#1a2e26]">{ins.bold}</strong>
                        )}
                      </span>
                    ))
                  : ins.text}
              </p>
            </motion.div>
          ))}
        </div>
      </SidebarSection>

      <SidebarSection
        icon={<PencilSimple size={15} className="text-[#2e7d5c]" />}
        title="Founder Guidance"
        action={
          <button className="cursor-pointer border-none bg-none text-[11px] font-bold text-[#428475] hover:underline">
            View all
          </button>
        }
        delay={0.22}
      >
        <div className="flex flex-col gap-3.5">
          {WORKSPACE_GUIDANCE.map((g, i) => (
            <motion.div
              key={g.name}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 + i * 0.04 }}
              className="flex items-start gap-2.5"
            >
              <div className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#89d7b7]" />
              <p className="m-0 text-xs leading-[1.6] text-[#4a6a5a]">
                <strong className="text-[#1a2e26]">{g.name}: </strong>
                {g.tip}
              </p>
            </motion.div>
          ))}
        </div>
      </SidebarSection>

      <SidebarSection
        icon={<Clock size={15} className="text-[#2e7d5c]" />}
        title="Recent Activity"
        action={
          <button className="cursor-pointer border-none bg-none text-[11px] font-bold text-[#428475] hover:underline">
            All
          </button>
        }
        delay={0.3}
      >
        <div className="flex flex-col gap-[13px]">
          {WORKSPACE_ACTIVITY.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34 + i * 0.04 }}
              className="flex items-center gap-2.5"
            >
              <div style={{ background: a.dot }} className="h-2 w-2 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <div className="overflow-hidden text-xs font-semibold text-ellipsis whitespace-nowrap text-[#1a2e26]">
                  {a.text}
                </div>
              </div>
              <div className="shrink-0 text-[10px] text-[#9ab4a4]">{a.time}</div>
            </motion.div>
          ))}
        </div>
      </SidebarSection>
    </div>
  );
}
