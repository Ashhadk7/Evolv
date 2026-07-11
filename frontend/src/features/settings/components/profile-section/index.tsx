"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "@phosphor-icons/react";
import type { FounderProfile } from "@/features/founder-dashboard/types";
import {
  formatFounderEducation,
  formatFounderEducations,
  getFounderEducationSummary,
  getFounderEducations,
  normalizeFounderProfileForSave,
  type FounderEducation,
} from "@/features/founder-dashboard/profile-utils";
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
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
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
    local.linkedin,
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
    setSaveError("");
    try {
      await onSave(
        normalizeFounderProfileForSave({
        ...local,
        domains: safeDomains,
        educations: safeEducations,
        }) as FounderProfile
      );
      setEditing(false);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } catch {
      setSaveError("We could not save your profile. Please try again.");
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

  const handlePhotoUpload = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setLocal((p) => ({ ...p, avatarUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative flex flex-col gap-5 pb-10">
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="absolute top-0 right-0 z-20 flex items-center gap-2 px-3 py-2 text-[12px] font-bold"
            style={{
              background: "#e8f5ef",
              color: "#2e7d5c",
              border: "1px solid #cde8da",
              borderRadius: 8,
              boxShadow: "0 10px 26px rgba(15,28,24,0.10)",
            }}
          >
            <Check size={14} weight="bold" />
            Saved changes
          </motion.div>
        )}
      </AnimatePresence>

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
            onPhotoUpload={handlePhotoUpload}
            onCancel={handleCancel}
            onSave={() => void handleSave()}
            saving={saving}
            saveError={saveError}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
