"use client";

import { motion } from "framer-motion";
import { Briefcase, CodeBlock } from "@phosphor-icons/react";
import { cardStyle, NUM } from "@/components/shared/card-style";
import { Reveal } from "@/components/shared/reveal";
import { SectionHead } from "@/components/shared/section-head";
import { Chip } from "@/components/shared/chip";
import { Avatar } from "@/components/shared/avatar";
import type { FounderContactProfile } from "@/features/network/types";
import {
  developerProfiles,
  developerRoleText,
  devsForRole,
  isDeveloperAvailable,
} from "./blueprint-detail-data";

interface Role {
  role: string;
  count: number;
  skills: string;
  lead: boolean;
}

export function TeamTalentSection({
  roles,
  developerConnections,
  activeRoleFilter,
  onRoleFilterChange,
  onSelectDeveloper,
}: {
  roles: Role[];
  developerConnections: Record<string, boolean>;
  activeRoleFilter: string;
  onRoleFilterChange: (role: string) => void;
  onSelectDeveloper: (profile: FounderContactProfile) => void;
}) {
  const visibleMatchedRoles =
    activeRoleFilter === "all" ? roles : roles.filter((role) => role.role === activeRoleFilter);

  return (
    <Reveal>
      <div className="grid grid-cols-[1fr_1.4fr] items-start gap-[22px]">
        <div style={cardStyle({ padding: "26px 28px", alignSelf: "start" })}>
          <SectionHead
            icon={<Briefcase size={18} weight="duotone" className="text-bp-teal" />}
            kicker="Team"
            title="Roles Needed"
          />
          <div className="flex flex-col gap-2.5">
            {roles.map((r) => (
              <div
                key={r.role}
                className="border-bp-border-soft bg-bp-tint rounded-xl border px-[15px] py-[13px]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-bp-ink text-[13.5px] font-bold">{r.role}</span>
                  {r.lead ? <Chip tone="mint">Lead</Chip> : <Chip>x{r.count}</Chip>}
                </div>
                <div className="font-mono-app text-bp-muted mt-1 text-xs">{r.skills}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={cardStyle({ padding: "26px 28px", alignSelf: "start" })}>
          <SectionHead
            icon={<CodeBlock size={18} weight="duotone" className="text-bp-success" />}
            kicker="AI Suggested"
            title="Matched Developers"
            right={<Chip tone="mint">{developerProfiles.length} profiles</Chip>}
          />
          <div className="mb-3.5 flex flex-wrap gap-2">
            {[
              { role: "all", label: "All roles" },
              ...roles.map((role) => ({ role: role.role, label: role.role })),
            ].map((item) => {
              const active = activeRoleFilter === item.role;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => onRoleFilterChange(item.role)}
                  className={`cursor-pointer rounded-full border px-[11px] py-1.5 text-[11px] font-bold ${
                    active
                      ? "border-bp-forest bg-bp-forest text-bp-mint"
                      : "border-bp-border-soft bg-bp-tint text-bp-teal"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="blueprint-scroll flex max-h-[430px] flex-col gap-3 overflow-y-auto pr-1.5">
            {visibleMatchedRoles.map((r) => (
              <div
                key={r.role}
                className="border-bp-border-soft bg-bp-tint rounded-xl border px-[15px] py-[13px]"
              >
                <div className="mb-2.5 flex items-center justify-between gap-2.5">
                  <div className="text-bp-ink text-[12.5px] font-extrabold">{r.role}</div>
                  <Chip tone={r.lead ? "mint" : "neutral"}>
                    {r.lead ? "Priority hire" : "Suggested"}
                  </Chip>
                </div>
                <div className="flex flex-col gap-2">
                  {devsForRole(r).map((d) => {
                    const avail = isDeveloperAvailable(d);
                    const connected = developerConnections[d.id];
                    return (
                      <motion.button
                        key={`${r.role}-${d.id}`}
                        type="button"
                        whileHover={{
                          y: -2,
                          borderColor: "#c5ddd0",
                          boxShadow: "0 8px 22px rgba(15,28,24,0.06)",
                        }}
                        onClick={() => onSelectDeveloper(d)}
                        className="border-bp-border-soft bg-bp-card flex w-full cursor-pointer items-center gap-3 rounded-[10px] border px-3 py-2.5 text-left"
                      >
                        <Avatar initials={d.initials} size={32} />
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-[7px]">
                            <span className="text-bp-ink overflow-hidden text-[13px] font-bold text-ellipsis whitespace-nowrap">
                              {d.name}
                            </span>
                            {d.online && (
                              <span className="bg-bp-success h-[7px] w-[7px] shrink-0 rounded-full" />
                            )}
                          </div>
                          <div className="text-bp-muted mt-0.5 overflow-hidden text-[11.5px] text-ellipsis whitespace-nowrap">
                            {developerRoleText(d)}
                          </div>
                        </div>
                        <Chip tone={avail ? "mint" : "amber"}>
                          {avail ? "Available" : d.availability}
                        </Chip>
                        {connected && <Chip tone="neutral">Connected</Chip>}
                        <span
                          style={NUM}
                          className="rounded-full bg-[#e8f5ef] px-2.5 py-1 text-xs font-extrabold text-[#1d6e47]"
                        >
                          {d.match}%
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
