"use client";

import Image from "next/image";
import {
  Certificate,
  Code,
  EnvelopeSimple,
  GithubLogo,
  GlobeHemisphereWest,
  GraduationCap,
  LinkedinLogo,
  LinkSimple,
  Tag,
} from "@phosphor-icons/react";
import type { FounderContactProfile } from "@/features/network/types";
import { SkillPill } from "@/components/shared/skill-pill";
import {
  formatDeveloperEducation,
  getDeveloperCertifications,
  getDeveloperEducations,
  getDeveloperLinkedIn,
  getDeveloperSkillEntries,
} from "@/features/developer-dashboard/profile-utils";
import { EmptyProfileValue } from "./profile-detail-tile";
import { DeveloperInfoSection } from "./developer-info-section";
import {
  formatProfileLink,
  getEmailUrl,
  getExternalUrl,
} from "@/features/network/lib/profile-link-helpers";

export function DeveloperPublicProfileSections({ profile }: { profile: FounderContactProfile }) {
  const tags = Array.isArray(profile.tags) ? profile.tags : [];
  const skillEntries = getDeveloperSkillEntries(profile).filter((entry) =>
    [entry.name, entry.kind, entry.experience].some((value) => value?.trim())
  );
  const educations = getDeveloperEducations(profile).filter((education) =>
    formatDeveloperEducation(education)
  );
  const certifications = getDeveloperCertifications(profile).filter(
    (certification) => certification.name?.trim() || certification.image?.trim()
  );
  const publicLinks = [
    {
      id: "email",
      label: "Email",
      value: profile.email?.trim() ?? "",
      href: getEmailUrl(profile.email?.trim() ?? ""),
      external: false,
      Icon: EnvelopeSimple,
    },
    {
      id: "github",
      label: "GitHub",
      value: profile.github?.trim() ?? "",
      href: getExternalUrl(profile.github?.trim() ?? ""),
      external: true,
      Icon: GithubLogo,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      value: getDeveloperLinkedIn(profile),
      href: getExternalUrl(getDeveloperLinkedIn(profile)),
      external: true,
      Icon: LinkedinLogo,
    },
    {
      id: "portfolio",
      label: "Portfolio",
      value: profile.portfolioLink?.trim() ?? "",
      href: getExternalUrl(profile.portfolioLink?.trim() ?? ""),
      external: true,
      Icon: LinkSimple,
    },
  ];

  return (
    <div className="space-y-4">
      <DeveloperInfoSection
        Icon={Tag}
        title="Profile tags"
        description="Public labels from the developer profile."
      >
        {tags.length ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <SkillPill key={tag} label={tag} />
            ))}
          </div>
        ) : (
          <EmptyProfileValue>No profile tags added yet.</EmptyProfileValue>
        )}
      </DeveloperInfoSection>

      <DeveloperInfoSection
        Icon={GlobeHemisphereWest}
        title="Public links"
        description="Founder-facing links from the developer settings profile."
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
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
        Icon={Code}
        title="Skills, tech stack & frameworks"
        description="Each public skill can include its type and experience level."
      >
        {skillEntries.length ? (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {skillEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 bg-[#f8faf8] border border-[#e8ede9]"
              >
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-bold text-[#1a2e26]">
                    {entry.name || "Untitled skill"}
                  </div>
                  <div className="text-[10px] text-[#7a9e8e]">
                    {entry.kind || "Skill"}
                  </div>
                </div>
                <span className="shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold bg-[#e8f5ef] text-[#2e7d5c] border border-[#c5ddd0]">
                  {entry.experience || "Experience not added"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyProfileValue>No skills added yet.</EmptyProfileValue>
        )}
      </DeveloperInfoSection>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DeveloperInfoSection
          Icon={GraduationCap}
          title="Education"
          description="Degrees and academic background."
        >
          {educations.length ? (
            <div className="space-y-2">
              {educations.map((education) => (
                <div
                  key={education.id}
                  className="rounded-xl px-3 py-2.5 bg-[#f8faf8] border border-[#e8ede9]"
                >
                  <div className="text-[12px] font-bold text-[#1a2e26]">
                    {formatDeveloperEducation(education)}
                  </div>
                  {education.school && (
                    <div className="mt-0.5 text-[10px] text-[#7a9e8e]">
                      {education.school}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyProfileValue>No education added yet.</EmptyProfileValue>
          )}
        </DeveloperInfoSection>

        <DeveloperInfoSection
          Icon={Certificate}
          title="Certifications"
          description="Optional credentials and certificate proof."
        >
          {certifications.length ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
              {certifications.map((certification) => (
                <div
                  key={certification.id}
                  className="overflow-hidden rounded-xl bg-[#f8faf8] border border-[#e8ede9]"
                >
                  {certification.image ? (
                    <div className="relative h-24 w-full">
                      <Image
                        src={certification.image}
                        alt={certification.name || "Certification"}
                        fill
                        unoptimized
                        sizes="(max-width: 1280px) 50vw, 160px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-24 items-center justify-center bg-[#eef6f2] text-[#428475]">
                      <Certificate size={24} weight="bold" />
                    </div>
                  )}
                  <div className="px-3 py-2 text-[12px] font-bold text-[#1a2e26]">
                    {certification.name || "Untitled certification"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyProfileValue>No certifications added yet.</EmptyProfileValue>
          )}
        </DeveloperInfoSection>
      </section>
    </div>
  );
}
