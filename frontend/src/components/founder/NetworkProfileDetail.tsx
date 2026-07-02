"use client";

import { useState, type ElementType, type ReactNode } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeft,
  Briefcase,
  Buildings,
  Certificate,
  ChatCircle,
  CheckCircle,
  Code,
  EnvelopeSimple,
  GithubLogo,
  GlobeHemisphereWest,
  GraduationCap,
  Handshake,
  LinkedinLogo,
  LinkSimple,
  MapPin,
  Star,
  Tag,
  UserPlus,
  Users,
} from "@phosphor-icons/react";
import {
  type FounderContactProfile,
  type NetworkReview,
  type NetworkType,
  FOUNDER_NETWORK_PROFILES,
  INITIAL_PENDING_IDS,
  buildProfileFromContact,
  getFounderNetworkProfile,
} from "./founderData";
import {
  formatFounderEducation,
  getFounderEducations,
} from "./profileUtils";
import { TypeBadge } from "./ui/TypeBadge";
import { SkillPill } from "./ui/SkillPill";
import { RatingStars, clampRating } from "./ui/RatingStars";
import {
  formatDeveloperEducation,
  getDeveloperCertifications,
  getDeveloperEducations,
  getDeveloperLinkedIn,
  getDeveloperSkillEntries,
} from "../developer/profileUtils";

// Re-export everything consumers expect from this module
export type { FounderContactProfile, NetworkReview, NetworkType };
export {
  FOUNDER_NETWORK_PROFILES,
  INITIAL_PENDING_IDS,
  buildProfileFromContact,
  getFounderNetworkProfile,
  TypeBadge,
  SkillPill,
  RatingStars,
};

const REVIEW_STORAGE_KEY = "evolv_founder_network_reviews";

function loadStoredReviews(profileId: string): NetworkReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw    = localStorage.getItem(REVIEW_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) as Record<string, NetworkReview[]> : {};
    return Array.isArray(parsed[profileId]) ? parsed[profileId] : [];
  } catch {
    return [];
  }
}

function saveStoredReviews(profileId: string, reviews: NetworkReview[]) {
  if (typeof window === "undefined") return;
  try {
    const raw    = localStorage.getItem(REVIEW_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) as Record<string, NetworkReview[]> : {};
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify({ ...parsed, [profileId]: reviews }));
  } catch { /* ignore storage errors */ }
}

function ProfileAvatar({ profile, size = 64 }: { profile: FounderContactProfile; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{
        width: size,
        height: size,
        background: profile.avatarColor,
        color: "#fff",
        fontSize: size > 56 ? 18 : 12,
      }}
    >
      {profile.initials}
    </div>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl px-3 py-2.5" style={{ background: "#f5f7f5", border: "1px solid #e8ede9" }}>
      <div className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: "#7a9e8e" }}>
        {label}
      </div>
      <div className="text-[12px] font-bold" style={{ color: "#1a2e26" }}>
        {value}
      </div>
    </div>
  );
}

function EmptyProfileValue({ children }: { children: string }) {
  return (
    <div className="rounded-xl px-3 py-3 text-[12px]" style={{ background: "#f8faf8", color: "#7a9e8e", border: "1px dashed #d7e5dd" }}>
      {children}
    </div>
  );
}

function DeveloperInfoSection({
  Icon,
  title,
  description,
  children,
}: {
  Icon: ElementType;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-4"
      style={{ border: "1px solid #e8ede9" , marginTop: 20}}
    >
      <div className="flex items-start gap-2.5 mb-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "#f0f5f2", color: "#428475" }}>
          <Icon size={16} weight="bold" />
        </span>
        <div>
          <div className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "#7a9e8e" }}>
            {title}
          </div>
          <p className="mt-0.5 text-[11px] leading-5" style={{ color: "#8ca99d" }}>
            {description}
          </p>
        </div>
      </div>
      {children}
    </motion.section>
  );
}

function formatProfileLink(value: string) {
  return value.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

function getEmailUrl(value: string) {
  return value ? `mailto:${value}` : "";
}

function getExternalUrl(value: string) {
  if (!value) return "";
  return value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
}

function getProfileLinkedIn(profile: FounderContactProfile) {
  return profile.linkedin?.trim() || profile.linkedIn?.trim() || "";
}

function getPublicProfileDomains(profile: FounderContactProfile) {
  const domains = Array.isArray(profile.domains)
    ? profile.domains.map((domain) => domain.trim()).filter(Boolean)
    : [];

  return domains.length ? domains : profile.skills;
}

function DeveloperPublicProfileSections({ profile }: { profile: FounderContactProfile }) {
  const tags = Array.isArray(profile.tags) ? profile.tags : [];
  const skillEntries = getDeveloperSkillEntries(profile).filter((entry) =>
    [entry.name, entry.kind, entry.experience].some((value) => value?.trim())
  );
  const educations = getDeveloperEducations(profile).filter((education) => formatDeveloperEducation(education));
  const certifications = getDeveloperCertifications(profile).filter((certification) =>
    certification.name?.trim() || certification.image?.trim()
  );
  const publicLinks = [
    { id: "email", label: "Email", value: profile.email?.trim() ?? "", href: getEmailUrl(profile.email?.trim() ?? ""), external: false, Icon: EnvelopeSimple },
    { id: "github", label: "GitHub", value: profile.github?.trim() ?? "", href: getExternalUrl(profile.github?.trim() ?? ""), external: true, Icon: GithubLogo },
    { id: "linkedin", label: "LinkedIn", value: getDeveloperLinkedIn(profile), href: getExternalUrl(getDeveloperLinkedIn(profile)), external: true, Icon: LinkedinLogo },
    { id: "portfolio", label: "Portfolio", value: profile.portfolioLink?.trim() ?? "", href: getExternalUrl(profile.portfolioLink?.trim() ?? ""), external: true, Icon: LinkSimple },
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
            {tags.map((tag) => <SkillPill key={tag} label={tag} />)}
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
            <div key={id} className="rounded-xl px-3 py-3" style={{ background: "#f8faf8", border: "1px solid #e8ede9" }}>
              <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide" style={{ color: "#7a9e8e" }}>
                <Icon size={12} weight="bold" />
                {label}
              </div>
              {value ? (
                <a
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                  className="block truncate text-[12px] font-bold underline decoration-[#c5ddd0] underline-offset-4"
                  style={{ color: "#1a2e26" }}
                >
                  {id === "email" ? value : formatProfileLink(value)}
                </a>
              ) : (
                <div className="text-[12px]" style={{ color: "#9aaea5" }}>Not added yet</div>
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
              <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5" style={{ background: "#f8faf8", border: "1px solid #e8ede9" }}>
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-bold" style={{ color: "#1a2e26" }}>{entry.name || "Untitled skill"}</div>
                  <div className="text-[10px]" style={{ color: "#7a9e8e" }}>{entry.kind || "Skill"}</div>
                </div>
                <span className="shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold" style={{ background: "#e8f5ef", color: "#2e7d5c", border: "1px solid #c5ddd0" }}>
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
                <div key={education.id} className="rounded-xl px-3 py-2.5" style={{ background: "#f8faf8", border: "1px solid #e8ede9" }}>
                  <div className="text-[12px] font-bold" style={{ color: "#1a2e26" }}>{formatDeveloperEducation(education)}</div>
                  {education.school && <div className="mt-0.5 text-[10px]" style={{ color: "#7a9e8e" }}>{education.school}</div>}
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
                <div key={certification.id} className="overflow-hidden rounded-xl" style={{ background: "#f8faf8", border: "1px solid #e8ede9" }}>
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
                    <div className="flex h-24 items-center justify-center" style={{ background: "#eef6f2", color: "#428475" }}>
                      <Certificate size={24} weight="bold" />
                    </div>
                  )}
                  <div className="px-3 py-2 text-[12px] font-bold" style={{ color: "#1a2e26" }}>
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

function FounderPublicProfileSections({ profile }: { profile: FounderContactProfile }) {
  const email = profile.email?.trim() ?? "";
  const linkedin = getProfileLinkedIn(profile);
  const educations = getFounderEducations(profile).filter((education) => formatFounderEducation(education));
  const educationFallback = profile.education?.trim() ?? "";
  const publicLinks = [
    { id: "email", label: "Email", value: email, href: getEmailUrl(email), external: false, Icon: EnvelopeSimple },
    { id: "linkedin", label: "LinkedIn", value: linkedin, href: getExternalUrl(linkedin), external: true, Icon: LinkedinLogo },
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
            <div key={id} className="rounded-xl px-3 py-3" style={{ background: "#f8faf8", border: "1px solid #e8ede9" }}>
              <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide" style={{ color: "#7a9e8e" }}>
                <Icon size={12} weight="bold" />
                {label}
              </div>
              {value ? (
                <a
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                  className="block truncate text-[12px] font-bold underline decoration-[#c5ddd0] underline-offset-4"
                  style={{ color: "#1a2e26" }}
                >
                  {id === "email" ? value : formatProfileLink(value)}
                </a>
              ) : (
                <div className="text-[12px]" style={{ color: "#9aaea5" }}>Not added yet</div>
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
              <div key={education.id} className="rounded-xl px-3 py-2.5" style={{ background: "#f8faf8", border: "1px solid #e8ede9" }}>
                <div className="text-[12px] font-bold" style={{ color: "#1a2e26" }}>{formatFounderEducation(education)}</div>
              </div>
            ))}
          </div>
        ) : educationFallback ? (
          <div className="rounded-xl px-3 py-2.5 text-[12px] font-bold" style={{ background: "#f8faf8", color: "#1a2e26", border: "1px solid #e8ede9" }}>
            {educationFallback}
          </div>
        ) : (
          <EmptyProfileValue>No education added yet.</EmptyProfileValue>
        )}
      </DeveloperInfoSection>
    </section>
  );
}

export function NetworkProfileDetailScreen({
  profile,
  connected = profile.connected,
  pending = false,
  backLabel = "Back",
  onBack,
  onAccept,
  onIgnore,
  onToggleConnection,
  onMessage,
  profileComplete = true,
  onRequireProfile,
  messageLabel = "Message",
  connectionLabel,
  connectionDisabled = false,
}: {
  profile: FounderContactProfile;
  connected?: boolean;
  pending?: boolean;
  backLabel?: string;
  onBack: () => void;
  onAccept?: (id: string) => void;
  onIgnore?: (id: string) => void;
  onToggleConnection?: (id: string) => void;
  onMessage?: (profile: FounderContactProfile) => void;
  profileComplete?: boolean;
  onRequireProfile?: (afterComplete?: () => void) => void;
  messageLabel?: string;
  connectionLabel?: string;
  connectionDisabled?: boolean;
}) {
  const canManagePending     = pending && onAccept && onIgnore;
  const canToggleConnection  = !pending && onToggleConnection;
  const isDeveloper          = profile.type === "Developer";
  const publicDomains        = getPublicProfileDomains(profile);
  const [customReviews, setCustomReviews] = useState<NetworkReview[]>(() => loadStoredReviews(profile.id));
  const [reviewRating, setReviewRating]   = useState(3);
  const [reviewText, setReviewText]       = useState("");
  const allReviews = isDeveloper ? [...customReviews, ...(profile.reviews ?? [])] : [];
  const averageReviewRating = allReviews.length
    ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
    : 0;
  const displayRating = isDeveloper ? clampRating(profile.rating ?? averageReviewRating) : 0;
  const reviewCount   = allReviews.length;

  const requireProfileBeforeAction = (afterComplete?: () => void) => {
    if (profileComplete || !onRequireProfile) return false;
    onRequireProfile(afterComplete);
    return true;
  };

  const handleReviewRatingChange = (rating: number) => {
    if (requireProfileBeforeAction(() => setReviewRating(rating))) return;
    setReviewRating(rating);
  };

  const saveReview = () => {
    const comment = reviewText.trim();
    if (!comment) return;
    const nextReview: NetworkReview = {
      id: `review-${profile.id}-${Date.now()}`,
      reviewer: "You",
      rating: reviewRating,
      comment,
      date: "Just now",
    };
    const nextReviews = [nextReview, ...customReviews];
    setCustomReviews(nextReviews);
    saveStoredReviews(profile.id, nextReviews);
    setReviewText("");
    setReviewRating(3);
  };

  const handleAddReview = () => {
    if (requireProfileBeforeAction(saveReview)) return;
    saveReview();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 18 }}
      className="h-full overflow-y-auto"
      style={{ background: "#f5f6f4", padding: "24px 28px" }}
    >
      <div className="flex items-center gap-3 min-w-0 mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors hover:bg-[#e8ede9] shrink-0"
          style={{ color: "#428475" }}
        >
          <ArrowLeft size={14} weight="bold" /> {backLabel}
        </button>
        <div className="h-4 w-px shrink-0" style={{ background: "#dde5e0" }} />
        <div className="text-[12px] font-semibold truncate" style={{ color: "#7a9e8e" }}>
          {profile.type} profile
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4 items-start">
        <div className="space-y-4">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border: "1px solid #e8ede9" }}
          >
            <div className="p-5 flex flex-col md:flex-row md:items-start gap-4" style={{ borderBottom: "1px solid #eaf0eb" }}>
              <ProfileAvatar profile={profile} size={72} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-[1.45rem] font-bold leading-tight" style={{ color: "#1a2e26" }}>
                    {profile.name}
                  </h2>
                  {profile.online && <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#2e7d5c" }} />}
                  <TypeBadge type={profile.type} />
                </div>
                <div className="text-[13px]" style={{ color: "#6b8e7e" }}>
                  {profile.role} at {profile.company}
                </div>
                <div className="flex flex-wrap gap-3 mt-3 text-[11px]" style={{ color: "#6b8e7e" }}>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {profile.location}</span>
                  <span className="flex items-center gap-1"><Briefcase size={12} /> {profile.experience}</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {profile.mutual} mutual</span>
                  <span className="flex items-center gap-1"><Star size={12} weight="fill" /> {profile.match}% match</span>
                  {isDeveloper && (
                    <span className="flex items-center gap-1.5">
                      <RatingStars rating={displayRating} size={12} />
                      {displayRating}/5 rating
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 md:ml-auto">
                {canManagePending && (
                  <>
                    <button
                      onClick={() => onIgnore(profile.id)}
                      className="px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors hover:bg-[#f5f7f5]"
                      style={{ color: "#7a9e8e", border: "1px solid #dde5e0" }}
                    >
                      Ignore
                    </button>
                    <motion.button
                      onClick={() => onAccept(profile.id)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      className="bp-gradient-btn flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold cursor-pointer"
                      style={{ background: "#1a312c", color: "#89d7b7" }}
                    >
                      <UserPlus size={14} weight="bold" /> Accept
                    </motion.button>
                  </>
                )}
                {canToggleConnection && (
                  <motion.button
                    onClick={() => onToggleConnection(profile.id)}
                    disabled={connectionDisabled}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold cursor-pointer disabled:opacity-60 ${!connected && !connectionDisabled ? "bp-gradient-btn" : ""}`}
                    style={{
                      background: connected || connectionDisabled ? "#e8f5ef" : "#0f1c18",
                      color: connected || connectionDisabled ? "#2e7d5c" : "#89d7b7",
                      border: connected || connectionDisabled ? "1px solid #c5ddd0" : "1px solid #1a312c",
                    }}
                  >
                    {connected ? <CheckCircle size={14} weight="fill" /> : <UserPlus size={14} weight="bold" />}
                    {connectionLabel ?? (connected ? "Connected" : "Connect")}
                  </motion.button>
                )}
                {onMessage && (
                  <button
                    onClick={() => onMessage(profile)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors hover:bg-[#e8ede9]"
                    style={{ color: "#0f1c18", border: "1px solid #dde5e0" }}
                  >
                    <ChatCircle size={14} /> {messageLabel}
                  </button>
                )}
              </div>
            </div>

            <div className={`p-5 grid grid-cols-1 gap-3 ${isDeveloper ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
              <DetailTile label="Match" value={`${profile.match}%`} />
              {isDeveloper && <DetailTile label="Rating" value={`${displayRating}/5 (${reviewCount} reviews)`} />}
              <DetailTile label={profile.type === "Developer" ? "Availability" : "Status"} value={profile.availability} />
              <DetailTile label="Connection" value={pending ? "Pending" : connectionLabel ?? (connected ? "Connected" : "Suggested")} />
            </div>
          </motion.section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 }}
              className="bg-white rounded-xl p-4"
              style={{ border: "1px solid #e8ede9", marginTop: 20, marginBottom: 20 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Code size={14} weight="bold" style={{ color: "#428475"}} />
                <span className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "#7a9e8e" }}>
                  Professional summary
                </span>
              </div>
              <p className="text-[13px] leading-6" style={{ color: "#334d42" }}>{profile.bio}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="bg-white rounded-xl p-4"
              style={{ border: "1px solid #e8ede9", marginTop: 20, marginBottom: 20  }}
            >
              <div className="flex items-center gap-2 mb-2">
                {profile.type === "Founder" ? (
                  <Handshake size={14} weight="bold" style={{ color: "#428475" }} />
                ) : (
                  <Buildings size={14} weight="bold" style={{ color: "#428475" }} />
                )}
                <span className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "#7a9e8e" }}>
                  Core focus
                </span>
              </div>
              <div className="rounded-xl p-3 text-[13px] leading-6" style={{ background: "#f5f7f5", color: "#1a2e26", border: "1px solid #e8ede9" }}>
                {profile.focus}
              </div>
            </motion.div>
          </section>

          {!isDeveloper && <FounderPublicProfileSections profile={profile} />}

          {isDeveloper && (
            <>
              <DeveloperPublicProfileSections profile={profile} />

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="bg-white rounded-xl p-4"
              style={{ border: "1px solid #e8ede9", marginTop: 20}}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Star size={15} weight="fill" style={{ color: "#C4973A" }} />
                  <span className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "#7a9e8e" }}>
                    Developer feedback
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold" style={{ color: "#1a2e26" }}>
                  <RatingStars rating={displayRating} size={13} />
                  <span>{displayRating}/5 from {reviewCount} reviews</span>
                </div>
              </div>

              <div className="rounded-xl p-3 mb-3" style={{ background: "#f8faf8", border: "1px solid #e8ede9" }}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="text-[12px] font-semibold" style={{ color: "#1a2e26" }}>Add your review</div>
                  <RatingStars rating={reviewRating} size={16} interactive onChange={handleReviewRatingChange} />
                </div>
                <textarea
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  placeholder="Share feedback about collaboration, communication, or delivery quality."
                  className="w-full rounded-lg px-3 py-2 text-[12px] outline-none resize-none"
                  style={{ minHeight: 72, background: "#fff", color: "#1a2e26", border: "1px solid #dde5e0" }}
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    disabled={!reviewText.trim()}
                    onClick={handleAddReview}
                    className="bp-gradient-btn px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-opacity disabled:opacity-40"
                    style={{ background: "#1a312c", color: "#89d7b7" }}
                  >
                    Submit review
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {allReviews.map((review) => (
                  <div key={review.id} className="rounded-xl p-3" style={{ background: "#fff", border: "1px solid #edf2ef" }}>
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div>
                        <div className="text-[12px] font-bold" style={{ color: "#1a2e26" }}>{review.reviewer}</div>
                        <div className="text-[10px]" style={{ color: "#9aaea5" }}>{review.date}</div>
                      </div>
                      <RatingStars rating={review.rating} size={12} />
                    </div>
                    <p className="text-[12px] leading-5" style={{ color: "#4c665b" }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            </motion.section>
            </>
          )}
        </div>

        <div className="space-y-4 xl:sticky xl:top-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4"
            style={{ border: "1px solid #e8ede9" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={14} weight="fill" style={{ color: "#2e7d5c" }} />
              <span className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "#7a9e8e" }}>
                Highlights
              </span>
            </div>
            <div className="space-y-2.5">
              {profile.highlights.map((item) => (
                <div key={item} className="flex items-start gap-2 text-[12px]" style={{ color: "#1a2e26" }}>
                  <CheckCircle size={13} weight="fill" className="mt-0.5 shrink-0" style={{ color: "#2e7d5c" }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="bg-white rounded-xl p-4"
            style={{ border: "1px solid #e8ede9" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Star size={14} weight="fill" style={{ color: "#C4973A" }} />
              <span className="text-[12px] font-bold uppercase tracking-wide" style={{ color: "#7a9e8e" }}>
                {isDeveloper ? "Skills and domains" : "Domains / interests"}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {publicDomains.map((skill) => <SkillPill key={skill} label={skill} />)}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
