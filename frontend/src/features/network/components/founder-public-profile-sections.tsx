"use client";

import {
  EnvelopeSimple,
  GlobeHemisphereWest,
  GraduationCap,
  LinkedinLogo,
} from "@phosphor-icons/react";
import type { FounderContactProfile } from "@/features/network/types";
import {
  formatFounderEducation,
  getFounderEducations,
} from "@/features/founder-dashboard/profile-utils";
import { EmptyProfileValue } from "./profile-detail-tile";
import { DeveloperInfoSection } from "./developer-info-section";
import {
  formatProfileLink,
  getEmailUrl,
  getExternalUrl,
  getProfileLinkedIn,
} from "@/features/network/lib/profile-link-helpers";

export function FounderPublicProfileSections({ profile }: { profile: FounderContactProfile }) {
  const email = profile.email?.trim() ?? "";
  const linkedin = getProfileLinkedIn(profile);
  const educations = getFounderEducations(profile).filter((education) =>
    formatFounderEducation(education)
  );
  const educationFallback = profile.education?.trim() ?? "";
  const publicLinks = [
    {
      id: "email",
      label: "Email",
      value: email,
      href: getEmailUrl(email),
      external: false,
      Icon: EnvelopeSimple,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      value: linkedin,
      href: getExternalUrl(linkedin),
      external: true,
      Icon: LinkedinLogo,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <DeveloperInfoSection
        Icon={GlobeHemisphereWest}
        title="Public contact"
        description="Email and founder profile link."
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {publicLinks.map(({ id, label, value, href, external, Icon }) => (
            <div
              key={id}
              className="rounded-xl px-3 py-3 bg-[#f8faf8] border border-[#e8ede9]"
            >
              <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold tracking-wide uppercase text-[#7a9e8e]">
                <Icon size={12} weight="bold" />
                {label}
              </div>
              {value ? (
                <a
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                  className="block truncate text-[12px] font-bold underline decoration-[#c5ddd0] underline-offset-4 text-[#1a2e26]"
                >
                  {id === "email" ? value : formatProfileLink(value)}
                </a>
              ) : (
                <div className="text-[12px] text-[#9aaea5]">
                  Not added yet
                </div>
              )}
            </div>
          ))}
        </div>
      </DeveloperInfoSection>

      <DeveloperInfoSection
        Icon={GraduationCap}
        title="Education"
        description="Education added in the founder profile."
      >
        {educations.length ? (
          <div className="space-y-2">
            {educations.map((education) => (
              <div
                key={education.id}
                className="rounded-xl px-3 py-2.5 bg-[#f8faf8] border border-[#e8ede9]"
              >
                <div className="text-[12px] font-bold text-[#1a2e26]">
                  {formatFounderEducation(education)}
                </div>
              </div>
            ))}
          </div>
        ) : educationFallback ? (
          <div className="rounded-xl px-3 py-2.5 text-[12px] font-bold bg-[#f8faf8] text-[#1a2e26] border border-[#e8ede9]">
            {educationFallback}
          </div>
        ) : (
          <EmptyProfileValue>No education added yet.</EmptyProfileValue>
        )}
      </DeveloperInfoSection>
    </section>
  );
}
