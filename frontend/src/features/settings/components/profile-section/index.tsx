"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { FounderProfile } from "@/features/founder-dashboard/types";
import { getApiErrorMessage } from "@/lib/api";
import {
  formatFounderEducation,
  formatFounderEducations,
  getFounderEducationSummary,
  getFounderEducations,
  getMissingFounderProfileFields,
  normalizeFounderProfileForSave,
  type FounderEducation,
} from "@/features/founder-dashboard/profile-utils";
import { removeAvatar, uploadAvatar } from "@/features/profiles/profile-api";
import { AvatarCropModal } from "../avatar-crop-modal";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
import {
  getProfileName,
  getProfileInitials,
  normalizeUrl,
} from "@/features/settings/lib/profile-helpers";
import { ProfilePreview } from "./profile-preview";
import { ProfileEditor } from "./profile-editor";

export function ProfileSection({
  profile,
  onSave,
  startEditingSignal = 0,
}: {
  profile: FounderProfile;
  onSave: (p: FounderProfile) => Promise<void>;
  startEditingSignal?: number;
}) {
  const [local, setLocal] = useState<FounderProfile>(profile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeDomains = Array.isArray(local.domains) ? local.domains : [];
  const safeEducations = getFounderEducations(local);
  const educationItems = safeEducations.map(formatFounderEducation).filter(Boolean);
  const educationSummary = getFounderEducationSummary(local);
  const fullName = getProfileName(local);
  const initials = getProfileInitials(local);
  const headline = local.headline?.trim() || local.bio?.trim() || "Founder building on Evolv";
  const bioText =
    local.bio?.trim() || "Add a short bio to introduce yourself to developers and collaborators.";
  const cityCountryParts: string[] = [];
  [local.city, local.country].forEach((item) => {
    const value = item?.trim();
    if (value && !cityCountryParts.some((part) => part.toLowerCase() === value.toLowerCase())) {
      cityCountryParts.push(value);
    }
  });
  const cityCountry = cityCountryParts.join(", ");
  const locationText =
    cityCountry || local.location?.trim() || local.country?.trim() || "Evolv Network";
  const founderFocus = safeDomains[0]
    ? `${safeDomains[0]} founder`
    : local.primaryGoal?.trim() || "Startup founder";
  const normalizedLinkedin = normalizeUrl(local.linkedin);
  const completionItems = [
    local.firstName,
    local.lastName,
    local.headline,
    local.bio,
    safeDomains.length ? "domains" : "",
    educationSummary,
    local.phoneVerified ? "verified phone" : "",
  ];
  const completion = Math.round(
    (completionItems.filter(Boolean).length / completionItems.length) * 100
  );

  const set = (key: keyof FounderProfile, val: string) => setLocal((p) => ({ ...p, [key]: val }));

  useEffect(() => {
    if (editing) return;
    let active = true;
    queueMicrotask(() => {
      if (active) setLocal(profile);
    });
    return () => {
      active = false;
    };
  }, [editing, profile]);

  useEffect(() => {
    if (startEditingSignal <= 0) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setLocal(profile);
      setEditing(true);
    });
    return () => {
      active = false;
    };
  }, [profile, startEditingSignal]);

  const toggleDomain = (d: string) =>
    setLocal((p) => {
      const domains = Array.isArray(p.domains) ? p.domains : [];
      return {
        ...p,
        domains: domains.includes(d) ? domains.filter((x) => x !== d) : [...domains, d],
      };
    });

  const handleSave = async () => {
    setSaving(true);
    try {
      const normalized = normalizeFounderProfileForSave({
        ...local,
        domains: safeDomains,
        educations: safeEducations,
      }) as FounderProfile;
      await onSave(normalized);
      setEditing(false);
      const missing = getMissingFounderProfileFields(normalized);
      if (missing.length) {
        toast.warning(
          `Saved, but add ${missing.join(", ")} to complete your profile and appear in the network.`
        );
      } else {
        toast.success("Changes saved");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleEducationsChange = (next: FounderEducation[]) => {
    setLocal((current) => ({
      ...current,
      educations: next,
      education: formatFounderEducations(next),
    }));
  };

  const handleCancel = () => {
    setLocal(profile);
    setEditing(false);
  };

  // Validate before showing anything, so an oversized/invalid file is rejected
  // up front (like GitHub) instead of failing later on save.
  const handlePhotoSelect = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (PNG, JPEG, or WebP).");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("That image is over 2 MB. Please choose a smaller one.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setCropSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = async (blob: Blob) => {
    setUploadingPhoto(true);
    try {
      const url = await uploadAvatar(blob);
      setLocal((p) => ({ ...p, avatarUrl: url }));
      toast.success("Photo updated");
      setCropSrc(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await removeAvatar();
      setLocal((p) => ({ ...p, avatarUrl: "" }));
      toast.success("Photo removed");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <div className="relative flex flex-col gap-5 pb-10">

      <AnimatePresence mode="wait" initial={false}>
        {!editing ? (
          <ProfilePreview
            local={local}
            fullName={fullName}
            initials={initials}
            headline={headline}
            bioText={bioText}
            locationText={locationText}
            founderFocus={founderFocus}
            normalizedLinkedin={normalizedLinkedin}
            completion={completion}
            safeDomains={safeDomains}
            educationItems={educationItems}
            onEdit={() => setEditing(true)}
          />
        ) : (
          <ProfileEditor
            local={local}
            fullName={fullName}
            initials={initials}
            safeDomains={safeDomains}
            safeEducations={safeEducations}
            fileInputRef={fileInputRef}
            onFieldChange={set}
            onToggleDomain={toggleDomain}
            onEducationsChange={handleEducationsChange}
            onPhotoUpload={handlePhotoSelect}
            onRemovePhoto={local.avatarUrl ? () => void handleRemovePhoto() : undefined}
            onCancel={handleCancel}
            onSave={() => void handleSave()}
            saving={saving}
          />
        )}
      </AnimatePresence>

      {cropSrc && (
        <AvatarCropModal
          imageSrc={cropSrc}
          saving={uploadingPhoto}
          onCancel={() => setCropSrc(null)}
          onSave={(blob) => void handleCropSave(blob)}
        />
      )}
    </div>
  );
}
