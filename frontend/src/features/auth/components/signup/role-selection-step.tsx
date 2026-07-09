"use client";

import { motion } from "framer-motion";
import { Code, Lightbulb } from "@phosphor-icons/react";
import type { Role } from "./types";
import { BRAND_INK, BRAND_MID, BRAND_MINT } from "./constants";

const ROLE_OPTIONS = [
  {
    id: "founder" as const,
    title: "Founder",
    icon: Lightbulb,
    desc: "I want to turn an idea into a blueprint, find builders, and publish once ready.",
    meta: "Blueprints, profile gating, developer matching",
  },
  {
    id: "developer" as const,
    title: "Developer",
    icon: Code,
    desc: "I want founders to discover me and apply to scoped startup opportunities.",
    meta: "Skills, portfolio signal, applications",
  },
];

export function RoleSelectionStep({
  role,
  onRoleChange,
}: {
  role: Role | "";
  onRoleChange: (role: Role) => void;
}) {
  return (
    <motion.div
      key="role"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="grid gap-6 md:grid-cols-2"
    >
      {ROLE_OPTIONS.map(({ id, title, icon: Icon, desc, meta }) => {
        const active = role === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onRoleChange(id)}
            className="rounded-[8px] border bg-white p-5 text-left transition hover:-translate-y-0.5"
            style={{
              borderColor: active ? BRAND_MID : "rgba(15,28,24,0.1)",
              boxShadow: active
                ? "0 16px 34px rgba(66,132,117,0.14)"
                : "0 10px 26px rgba(15,28,24,0.05)",
            }}
          >
            <div className="mb-5 flex items-center justify-between">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-lg"
                style={{
                  background: active ? BRAND_INK : "#f0f5f2",
                  color: active ? BRAND_MINT : BRAND_MID,
                }}
              >
                <Icon size={22} weight={active ? "fill" : "regular"} />
              </span>
              <span
                className="h-5 w-5 rounded-full border"
                style={{
                  borderColor: active ? BRAND_MID : "rgba(15,28,24,0.18)",
                  background: active ? BRAND_MINT : "#fff",
                }}
              />
            </div>
            <h2 className="text-[18px] font-bold" style={{ color: BRAND_INK }}>
              {title}
            </h2>
            <p className="mt-2 text-[13px] leading-5" style={{ color: "rgba(15,28,24,0.58)" }}>
              {desc}
            </p>
            <div className="mt-4 text-[11px] font-bold uppercase" style={{ color: BRAND_MID }}>
              {meta}
            </div>
          </button>
        );
      })}
    </motion.div>
  );
}
