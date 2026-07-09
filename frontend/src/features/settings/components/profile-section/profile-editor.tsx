"use client";

import type { RefObject } from "react";
import { motion } from "framer-motion";
import { CalendarBlank, Check, UploadSimple } from "@phosphor-icons/react";
import type { FounderProfile } from "@/features/founder-dashboard/types";
import type { FounderEducation } from "@/features/founder-dashboard/profile-utils";
import {
  MID,
  MINT,
  TEXT_BODY,
  TEXT_DIM,
  TEXT_MUTED,
  BORDER,
} from "@/features/settings/lib/settings-theme";
import { Field } from "../field";
import { DomainSearch } from "../domain-search";
import { EducationEditor } from "../education-editor";
import { ProfileAvatar } from "../settings-profile-avatar";

export function ProfileEditor({
  local,
  fullName,
  initials,
  safeDomains,
  safeEducations,
  fileInputRef,
  onFieldChange,
  onToggleDomain,
  onEducationsChange,
  onPhotoUpload,
  onCancel,
  onSave,
}: {
  local: FounderProfile;
  fullName: string;
  initials: string;
  safeDomains: string[];
  safeEducations: FounderEducation[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFieldChange: (key: keyof FounderProfile, value: string) => void;
  onToggleDomain: (domain: string) => void;
  onEducationsChange: (next: FounderEducation[]) => void;
  onPhotoUpload: (file?: File) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <motion.div
      key="profile-edit"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex flex-col gap-4 pb-10"
    >
      <section className="bg-white p-5" style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <ProfileAvatar
                avatarUrl={local.avatarUrl}
                fullName={fullName}
                initials={initials}
                size={74}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  background: "linear-gradient(180deg, #244b42 0%, #18382f 55%, #102b24 100%)",
                  border: "3px solid #fff",
                  color: MINT,
                  boxShadow: "0 8px 18px -12px rgba(9,32,26,0.72)",
                }}
                title="Upload photo"
              >
                <UploadSimple size={13} weight="bold" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPhotoUpload(e.target.files?.[0])}
              />
            </div>
            <div>
              <p
                className="text-[10px] font-bold tracking-widest uppercase"
                style={{ color: TEXT_DIM }}
              >
                Profile Editor
              </p>
              <h3 className="mt-1 text-[1.05rem] font-extrabold" style={{ color: TEXT_BODY }}>
                {fullName}
              </h3>
              <p className="text-[12px]" style={{ color: TEXT_MUTED }}>
                Edit each section, then save to refresh the public view.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border bg-white p-6 px-3.5 py-2 text-[12px] font-bold transition hover:bg-[#f8faf8]"
            style={{ borderColor: BORDER, color: TEXT_MUTED }}
          >
            Cancel
          </button>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section
          className="bg-white p-5"
          style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}
        >
          <h4 className="mb-4 text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>
            Public Identity
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="First Name"
              value={local.firstName}
              onChange={(v) => onFieldChange("firstName", v)}
              placeholder="Sara"
            />
            <Field
              label="Last Name"
              value={local.lastName}
              onChange={(v) => onFieldChange("lastName", v)}
              placeholder="Ahmed"
            />
          </div>
          <div className="mt-4" style={{ marginTop: 10 }}>
            <Field
              label="Founder Headline"
              value={local.headline ?? ""}
              onChange={(v) => onFieldChange("headline", v)}
              placeholder="Building the future of healthcare"
            />
          </div>
          <div className="mt-4" style={{ marginTop: 10 }}>
            <Field
              label="Short Bio"
              value={local.bio}
              onChange={(v) => onFieldChange("bio", v)}
              placeholder="Tell collaborators what you are building and why it matters."
            />
          </div>
          <div className="mt-4" style={{ marginTop: 10 }}>
            <Field
              label="Email"
              type="email"
              value={local.email}
              onChange={(v) => onFieldChange("email", v)}
              placeholder="you@example.com"
            />
          </div>
        </section>

        <section
          className="bg-white p-5"
          style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}
        >
          <h4 className="mb-4 text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>
            Domains
          </h4>
          <DomainSearch selected={safeDomains} onToggle={onToggleDomain} />
        </section>

        <section
          className="bg-white p-5"
          style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}
        >
          <h4 className="mb-4 text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>
            Links & Background
          </h4>
          <div className="flex flex-col gap-4">
            <Field
              label="LinkedIn Profile"
              value={local.linkedin}
              onChange={(v) => onFieldChange("linkedin", v)}
              placeholder="https://linkedin.com/in/yourname"
              optional
            />
            <Field
              label="Phone Number"
              value={local.phone}
              onChange={(v) => onFieldChange("phone", v)}
              placeholder="+92 300 0000000"
            />
            <EducationEditor educations={safeEducations} onChange={onEducationsChange} />
          </div>
        </section>

        <section
          className="bg-white p-5"
          style={{ border: `1px solid ${BORDER}`, borderRadius: 8 }}
        >
          <h4 className="mb-4 text-[13px] font-extrabold" style={{ color: TEXT_BODY }}>
            Private Details
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Date of Birth"
              type="date"
              value={local.dob}
              onChange={(v) => onFieldChange("dob", v)}
            />
            <Field
              label="Gender"
              type="select"
              value={local.gender}
              onChange={(v) => onFieldChange("gender", v)}
              optional
            />
          </div>
          <div
            className="mt-4 flex items-start gap-3 rounded-lg px-3 py-3"
            style={{ background: "#f8faf8", border: "1px solid #edf1ee", marginTop: 10 }}
          >
            <CalendarBlank size={15} weight="bold" style={{ color: MID, marginTop: 1 }} />
            <p className="text-[11px] leading-5" style={{ color: TEXT_MUTED }}>
              Birthday and gender help account context, but they are not shown on the public profile
              preview.
            </p>
          </div>
        </section>
      </div>

      <motion.button
        type="button"
        onClick={onSave}
        whileHover={{ y: -2, boxShadow: "0 10px 26px rgba(26,49,44,0.22)" }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        className="bp-gradient-btn mb-2 flex items-center justify-center gap-2 rounded-lg py-3 text-[13px] font-extrabold"
        style={{ marginBottom: 35 }}
      >
        <Check size={15} weight="bold" />
        Save Changes
      </motion.button>
    </motion.div>
  );
}
