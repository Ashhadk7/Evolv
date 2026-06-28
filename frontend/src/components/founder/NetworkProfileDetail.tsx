"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  Buildings,
  ChatCircle,
  CheckCircle,
  Code,
  Handshake,
  MapPin,
  Star,
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
import { TypeBadge } from "./ui/TypeBadge";
import { SkillPill } from "./ui/SkillPill";
import { RatingStars, clampRating } from "./ui/RatingStars";

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
  messageLabel = "Message",
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
  messageLabel?: string;
}) {
  const canManagePending     = pending && onAccept && onIgnore;
  const canToggleConnection  = !pending && onToggleConnection;
  const isDeveloper          = profile.type === "Developer";
  const [customReviews, setCustomReviews] = useState<NetworkReview[]>(() => loadStoredReviews(profile.id));
  const [reviewRating, setReviewRating]   = useState(3);
  const [reviewText, setReviewText]       = useState("");
  const allReviews = isDeveloper ? [...customReviews, ...(profile.reviews ?? [])] : [];
  const averageReviewRating = allReviews.length
    ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
    : 0;
  const displayRating = isDeveloper ? clampRating(profile.rating ?? averageReviewRating) : 0;
  const reviewCount   = allReviews.length;

  const handleAddReview = () => {
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
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold cursor-pointer"
                      style={{ background: "#1a312c", color: "#89d7b7" }}
                    >
                      <UserPlus size={14} weight="bold" /> Accept
                    </motion.button>
                  </>
                )}
                {canToggleConnection && (
                  <motion.button
                    onClick={() => onToggleConnection(profile.id)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold cursor-pointer"
                    style={{
                      background: connected ? "#e8f5ef" : "#0f1c18",
                      color: connected ? "#2e7d5c" : "#89d7b7",
                      border: connected ? "1px solid #c5ddd0" : "1px solid #1a312c",
                    }}
                  >
                    {connected ? <CheckCircle size={14} weight="fill" /> : <UserPlus size={14} weight="bold" />}
                    {connected ? "Connected" : "Connect"}
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
              <DetailTile label="Connection" value={pending ? "Pending" : connected ? "Connected" : "Suggested"} />
            </div>
          </motion.section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 }}
              className="bg-white rounded-xl p-4"
              style={{ border: "1px solid #e8ede9" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Code size={14} weight="bold" style={{ color: "#428475" }} />
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
              style={{ border: "1px solid #e8ede9" }}
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

          {isDeveloper && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="bg-white rounded-xl p-4"
              style={{ border: "1px solid #e8ede9" }}
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
                  <RatingStars rating={reviewRating} size={16} interactive onChange={setReviewRating} />
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
                    className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-opacity disabled:opacity-40"
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
                Skills and domains
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill) => <SkillPill key={skill} label={skill} />)}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
