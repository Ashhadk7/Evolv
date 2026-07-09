"use client";

import type { RefObject } from "react";
import { UploadSimple } from "@phosphor-icons/react";
import type { FounderProfile } from "@/features/founder-dashboard/types";
import { FieldLabel } from "./onboarding-helpers";
import { DomainPicker } from "./domain-picker";

interface FounderStepIdentityProps {
  profile: FounderProfile;
  set: (key: keyof FounderProfile, value: string) => void;
  toggleDomain: (domain: string) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handlePhotoUpload: (file?: File) => void;
  initials: string;
  fullName: string;
  baseInput: string;
}

export function FounderStepIdentity({
  profile,
  set,
  toggleDomain,
  fileInputRef,
  handlePhotoUpload,
  initials,
  fullName,
  baseInput,
}: FounderStepIdentityProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full transition hover:opacity-90 bg-[#f0f5f2] border-2 border-dashed border-[#89d7b7] text-[#1a312c] font-extrabold"
            aria-label="Upload profile image"
          >
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={`${fullName} profile`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-[1.2rem] font-extrabold">{initials}</span>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handlePhotoUpload(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-[11px] font-bold text-[#428475]"
          >
            <UploadSimple size={13} weight="bold" />
            Upload photo
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel>First name</FieldLabel>
          <input
            value={profile.firstName}
            onChange={(event) => set("firstName", event.target.value)}
            className={baseInput}
            placeholder="Sara"
          />
        </div>
        <div>
          <FieldLabel>Last name</FieldLabel>
          <input
            value={profile.lastName}
            onChange={(event) => set("lastName", event.target.value)}
            className={baseInput}
            placeholder="Ahmed"
          />
        </div>
      </div>

      <div>
        <FieldLabel>Founder headline</FieldLabel>
        <input
          value={profile.headline ?? ""}
          onChange={(event) => set("headline", event.target.value)}
          className={baseInput}
          placeholder="Building AI diagnostics for rural hospitals"
        />
      </div>

      <div>
        <FieldLabel>Short bio</FieldLabel>
        <textarea
          value={profile.bio}
          onChange={(event) => set("bio", event.target.value)}
          className={`${baseInput} resize-none min-h-[92px]`}
          placeholder="Tell developers what you are building and why it matters."
        />
      </div>

      <DomainPicker
        selected={Array.isArray(profile.domains) ? profile.domains : []}
        onToggle={toggleDomain}
      />
    </div>
  );
}
