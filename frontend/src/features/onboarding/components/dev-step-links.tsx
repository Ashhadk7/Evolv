"use client";

import { GithubLogo, LinkedinLogo } from "@phosphor-icons/react";
import type { DeveloperProfile } from "@/features/developer-dashboard/profile-utils";
import { FieldLabel } from "./onboarding-helpers";

interface DevStepLinksProps {
  profile: DeveloperProfile;
  set: (key: keyof DeveloperProfile, value: string) => void;
  baseInput: string;
}

export function DevStepLinks({ profile, set, baseInput }: DevStepLinksProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel required>GitHub</FieldLabel>
          <div className="relative">
            <GithubLogo
              size={15}
              weight="bold"
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#428475]"
            />
            <input
              value={profile.github ?? ""}
              onChange={(event) => set("github", event.target.value)}
              className={`${baseInput} pl-[42px]`}
              placeholder="https://github.com/yourname"
            />
          </div>
        </div>
        <div>
          <FieldLabel required>LinkedIn</FieldLabel>
          <div className="relative">
            <LinkedinLogo
              size={15}
              weight="bold"
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#428475]"
            />
            <input
              value={profile.linkedin ?? profile.linkedIn ?? ""}
              onChange={(event) => set("linkedin", event.target.value)}
              className={`${baseInput} pl-[42px]`}
              placeholder="https://linkedin.com/in/yourname"
            />
          </div>
        </div>
      </div>

      <div>
        <FieldLabel>Portfolio link</FieldLabel>
        <input
          value={profile.portfolioLink ?? ""}
          onChange={(event) => set("portfolioLink", event.target.value)}
          className={baseInput}
          placeholder="https://yourportfolio.com"
        />
      </div>
    </div>
  );
}
