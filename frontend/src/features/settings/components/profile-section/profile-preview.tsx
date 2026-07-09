"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  CheckCircle,
  EnvelopeSimple,
  GlobeHemisphereWest,
  GraduationCap,
  LinkedinLogo,
  LinkSimple,
  MapPin,
  PencilSimple,
  Phone,
  Sparkle,
} from "@phosphor-icons/react";
import type { FounderProfile } from "@/features/founder-dashboard/types";
import { isFounderProfileComplete } from "@/features/founder-dashboard/profile-utils";
import {
  INK,
  MID,
  MINT,
  TEXT_BODY,
  TEXT_DIM,
  TEXT_MUTED,
  BORDER,
} from "@/features/settings/lib/settings-theme";
import { ProfileDetailRow } from "../profile-detail-row";
import { ProfileAvatar } from "../settings-profile-avatar";

export function ProfilePreview({
  local,
  fullName,
  initials,
  headline,
  bioText,
  locationText,
  founderFocus,
  normalizedLinkedin,
  completion,
  safeDomains,
  educationItems,
  onEdit,
}: {
  local: FounderProfile;
  fullName: string;
  initials: string;
  headline: string;
  bioText: string;
  locationText: string;
  founderFocus: string;
  normalizedLinkedin: string | undefined;
  completion: number;
  safeDomains: string[];
  educationItems: string[];
  onEdit: () => void;
}) {
  return (
    <motion.div
      key="profile-preview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex flex-col gap-6 pb-2"
    >
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ boxShadow: "0 20px 48px rgba(15,28,24,0.10)" }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        className="overflow-hidden bg-white"
        style={{ border: "1.5px solid #d4e4db", borderRadius: 8 }}
      >
        <div
          className="relative h-36"
          style={{
            background: `linear-gradient(135deg, ${INK} 0%, ${MID} 58%, ${MINT} 140%)`,
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute bottom-5 left-8 flex max-w-[calc(100%-4rem)] items-center gap-2 rounded-full bg-white/12 px-5 py-2.5 backdrop-blur">
            <Sparkle size={13} weight="fill" style={{ color: MINT }} />
            <span
              className="text-[11px] font-bold tracking-[0.08em] whitespace-nowrap uppercase"
              style={{ color: "#e8f4ef" }}
            >
              Public Founder Profile
            </span>
          </div>
        </div>

        <div className="relative px-9 pb-10">
          <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="pl-6" style={{ marginTop: "1rem", marginBottom: "1rem" }}>
              <ProfileAvatar avatarUrl={local.avatarUrl} fullName={fullName} initials={initials} />
            </div>

            <div className="flex flex-wrap gap-2 sm:pb-2">
              {normalizedLinkedin && (
                <motion.a
                  href={normalizedLinkedin}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 rounded-lg border bg-white px-3.5 py-2 text-[12px] font-bold"
                  style={{
                    borderColor: BORDER,
                    color: MID,
                    paddingLeft: "1rem",
                    paddingRight: "1rem",
                  }}
                >
                  <LinkedinLogo size={15} weight="bold" />
                  LinkedIn
                </motion.a>
              )}
              <motion.button
                type="button"
                onClick={onEdit}
                whileHover={{ y: -2, boxShadow: "0 8px 18px rgba(26,49,44,0.18)" }}
                whileTap={{ scale: 0.98 }}
                className="bp-gradient-btn flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-bold"
                style={{ marginRight: "1rem" }}
              >
                <PencilSimple size={15} weight="bold" />
                Edit Profile
              </motion.button>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className="pl-6 text-[1.55rem] leading-tight font-extrabold"
                style={{ color: TEXT_BODY }}
              >
                {fullName}
              </h3>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase"
                style={{ background: "#edf5f1", color: MID }}
              >
                <CheckCircle size={12} weight="fill" />
                Founder
              </span>
            </div>
            <p
              className="mt-2 pl-6 text-[12px] font-bold tracking-widest uppercase"
              style={{ color: TEXT_MUTED }}
            >
              Professional Role
            </p>
            <p className="mt-1 pl-6 text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>
              Founder
            </p>
            <p
              className="mt-2 max-w-2xl pl-6 text-[14px] leading-6 font-semibold"
              style={{ color: "#334d42" }}
            >
              {headline}
            </p>
            <div
              className="mt-5 mb-4 flex flex-wrap items-center gap-x-6 gap-y-3 py-1.5 text-[12px]"
              style={{ color: TEXT_MUTED }}
            >
              <span className="flex items-center gap-1.5 pl-6 leading-5">
                <Briefcase size={13} weight="bold" />
                {founderFocus}
              </span>
              <span className="flex items-center gap-1.5 leading-5">
                <MapPin size={13} weight="bold" />
                {locationText}
              </span>
              {local.email && (
                <span className="flex items-center gap-1.5 leading-5">
                  <EnvelopeSimple size={13} weight="bold" />
                  {local.email}
                </span>
              )}
            </div>
          </div>

          <div className="mt-8 mb-6 grid gap-2 pl-6 sm:grid-cols-3">
            {[
              {
                label: "Profile strength",
                value: `${completion}%`,
                detail: "Public readiness",
              },
              {
                label: "Focus areas",
                value: `${safeDomains.length}`,
                detail: safeDomains.slice(0, 2).join(" / ") || "Add domains",
              },
              {
                label: "Visibility",
                value: isFounderProfileComplete(local) ? "Live" : "Draft",
                detail: "Founder network",
              },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2, borderColor: "#c5ddd0" }}
                className="bg-[#f8faf8] px-5 py-5"
                style={{
                  border: "1.5px solid #d8e7df",
                  marginRight: "1.5rem",
                  borderRadius: 8,
                  boxShadow: "0 8px 20px rgba(15,28,24,0.04)",
                }}
              >
                <p
                  className="text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: TEXT_DIM }}
                >
                  {item.label}
                </p>
                <p
                  className="mt-2 text-[20px] leading-none font-extrabold"
                  style={{ color: TEXT_BODY }}
                >
                  {item.value}
                </p>
                <p className="mt-2 truncate text-[11px]" style={{ color: TEXT_MUTED }}>
                  {item.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="bg-white p-7"
          style={{ border: "1.5px solid #d4e4db", borderRadius: 8, marginBottom: 30 }}
        >
          <div className="mb-2 flex items-center justify-between gap-5">
            <div>
              <h4 className="text-[14px] font-extrabold" style={{ color: TEXT_BODY }}>
                Bio
              </h4>
              <p className="text-[11px]" style={{ color: TEXT_MUTED }}>
                The short intro people see on your profile.
              </p>
            </div>
            <motion.button
              type="button"
              onClick={onEdit}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ background: "#edf5f1", color: MID }}
              aria-label="Edit bio section"
            >
              <PencilSimple size={14} weight="bold" />
            </motion.button>
          </div>
          <p className="text-[13px] leading-7" style={{ color: "#334d42" }}>
            {bioText}
          </p>

          <div
            className="my-7"
            style={{ height: 1, marginBottom: "1rem", background: "#dfe9e3" }}
          />

          <div>
            <h4 className="text-[14px] font-extrabold" style={{ color: TEXT_BODY }}>
              Interested Domains
            </h4>
            <div className="mt-4 flex flex-wrap gap-2.5 pb-1">
              {safeDomains.length > 0 ? (
                safeDomains.map((domain) => (
                  <motion.span
                    key={domain}
                    whileHover={{ y: -2, backgroundColor: "#e8f5ef" }}
                    className="rounded-full px-3 py-1.5 text-[12px] font-bold"
                    style={{
                      background: "#f0f5f2",
                      color: MID,
                      border: "1px solid #dce9e2",
                      marginTop: "0.5rem",
                    }}
                  >
                    {domain}
                  </motion.span>
                ))
              ) : (
                <span className="block py-2 text-[12px]" style={{ color: TEXT_DIM }}>
                  Add domains to show your focus areas.
                </span>
              )}
            </div>
          </div>

          <div
            className="my-7"
            style={{
              height: 1,
              background: "#dfe9e3",
              marginBottom: "1rem",
              marginTop: "0.5rem",
            }}
          />

          <div>
            <h4
              className="text-[14px] font-extrabold"
              style={{ color: TEXT_BODY, marginBottom: "1rem" }}
            >
              Education
            </h4>
            <div className="mt-5 flex gap-4">
              <span
                className="mt-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "#edf5f1", color: MID }}
              >
                <GraduationCap size={17} weight="bold" />
              </span>
              <div className="min-w-0 flex-1">
                {educationItems.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {educationItems.map((education) => (
                      <div
                        key={education}
                        className="rounded-lg px-3.5 py-2.5"
                        style={{ background: "#f8faf8", border: "1px solid #dfe9e3" }}
                      >
                        <p
                          className="p-3 text-[13px] leading-5 font-bold"
                          style={{ color: TEXT_BODY }}
                        >
                          {education}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="text-[13px] font-bold" style={{ color: TEXT_BODY }}>
                      Add education
                    </p>
                    <p className="mt-1 text-[12px] leading-5" style={{ color: TEXT_MUTED }}>
                      Your education helps others understand your credibility.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-5"
        >
          <section
            className="bg-white p-6"
            style={{ border: "1.5px solid #d4e4db", borderRadius: 8 }}
          >
            <h4 className="mb-4 text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>
              Contact
            </h4>
            <div className="flex flex-col gap-2">
              <ProfileDetailRow
                Icon={EnvelopeSimple}
                label="Email"
                value={local.email}
                href={local.email ? `mailto:${local.email}` : undefined}
              />
              <ProfileDetailRow
                Icon={Phone}
                label="Phone"
                value={local.phone}
                href={local.phone ? `tel:${local.phone}` : undefined}
              />
              <ProfileDetailRow
                Icon={LinkedinLogo}
                label="LinkedIn"
                value={local.linkedin}
                href={normalizedLinkedin || undefined}
              />
              {!local.email && !local.phone && !local.linkedin && (
                <p className="px-3.5 py-2.5 text-[12px]" style={{ color: TEXT_DIM }}>
                  Add contact links in edit mode.
                </p>
              )}
            </div>
          </section>

          <section
            className="bg-white p-6"
            style={{ border: "1.5px solid #d4e4db", borderRadius: 8, marginBottom: 30 }}
          >
            <h4 className="mb-4 text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>
              Profile Details
            </h4>
            <div className="flex flex-col gap-2">
              <ProfileDetailRow
                Icon={GlobeHemisphereWest}
                label="Network"
                value="Founder on Evolv"
              />
              <ProfileDetailRow Icon={Briefcase} label="Role" value="Founder" />
              <ProfileDetailRow
                Icon={LinkSimple}
                label="Top domain"
                value={safeDomains[0] || "Add a domain"}
              />
            </div>
          </section>
        </motion.aside>
      </div>
    </motion.div>
  );
}
