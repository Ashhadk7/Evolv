"use client";

import type { RefObject } from "react";
import { UploadSimple } from "@phosphor-icons/react";
import type { DeveloperProfile } from "@/features/developer-dashboard/profile-utils";
import { FieldLabel } from "./onboarding-helpers";

interface DevStepIdentityProps {
  profile: DeveloperProfile;
  set: (key: keyof DeveloperProfile, value: string) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handlePhotoUpload: (file?: File) => void;
  initials: string;
  fullName: string;
  baseInput: string;
}

export function DevStepIdentity({
  profile,
  set,
  fileInputRef,
  handlePhotoUpload,
  initials,
  fullName,
  baseInput,
}: DevStepIdentityProps) {
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
            {profile.avatarUrl || profile.photo ? (
              <img
                src={profile.avatarUrl || profile.photo}
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
            value={profile.firstName ?? ""}
            onChange={(event) => set("firstName", event.target.value)}
            className={baseInput}
            placeholder="Sara"
          />
        </div>
        <div>
          <FieldLabel>Last name</FieldLabel>
          <input
            value={profile.lastName ?? ""}
            onChange={(event) => set("lastName", event.target.value)}
            className={baseInput}
            placeholder="Ahmed"
          />
        </div>
      </div>

      <div>
        <FieldLabel required>Professional role</FieldLabel>
        <input
          value={profile.jobTitle ?? profile.role ?? ""}
          onChange={(event) => set("jobTitle", event.target.value)}
          className={baseInput}
          placeholder="Full Stack Developer"
        />
      </div>

      <div>
        <FieldLabel>Professional summary</FieldLabel>
        <textarea
          value={profile.bio ?? ""}
          onChange={(event) => set("bio", event.target.value)}
          className={`${baseInput} resize-none min-h-[92px]`}
          placeholder="Summarize what you build, your strongest stack, and the startup environments you prefer."
        />
      </div>
    </div>
  );
}
