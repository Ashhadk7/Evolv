"use client";

import { useEffect, useMemo, useState } from "react";
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
} from "@phosphor-icons/react";
import type { FounderContactProfile } from "@/features/network/types";
import { RatingStars } from "@/components/shared/rating-stars";
import { SkillPill } from "@/components/shared/skill-pill";
import { TypeBadge } from "@/components/shared/type-badge";
import { getApiErrorMessage } from "@/lib/api";
import {
  loadNetworkProfile,
  saveDeveloperReview,
} from "@/features/network/lib/network-api";
import { ProfileAvatar } from "./profile-avatar";
import { DetailTile } from "./profile-detail-tile";
import { DeveloperPublicProfileSections } from "./developer-public-profile-sections";
import { FounderPublicProfileSections } from "./founder-public-profile-sections";

export function NetworkProfileDetailScreen({
  profile: initialProfile,
  connected,
  pending = false,
  backLabel = "Back",
  connectionLabel,
  connectionDisabled = false,
  messageLabel = "Message",
  surface = "page",
  onBack,
  onAccept,
  onIgnore,
  onToggleConnection,
  onMessage,
  profileComplete = true,
  onRequireProfile,
}: {
  profile: FounderContactProfile;
  connected: boolean;
  pending?: boolean;
  backLabel?: string;
  connectionLabel?: string;
  connectionDisabled?: boolean;
  messageLabel?: string;
  surface?: "page" | "inbox";
  onBack: () => void;
  onAccept?: (id: string) => void;
  onIgnore?: (id: string) => void;
  onToggleConnection?: (id: string) => void;
  onMessage?: (person: FounderContactProfile) => void;
  profileComplete?: boolean;
  onRequireProfile?: (afterComplete?: () => void) => void;
}) {
  const isInboxSurface = surface === "inbox";
  const [profileDetails, setProfileDetails] = useState<FounderContactProfile | null>(null);
  const [profileError, setProfileError] = useState<{ id: string; message: string } | null>(null);
  const [savingReview, setSavingReview] = useState(false);
  const profile = profileDetails?.id === initialProfile.id ? profileDetails : initialProfile;
  const activeProfileError = profileError?.id === initialProfile.id ? profileError.message : "";
  const loadingProfile = profileDetails?.id !== initialProfile.id && !activeProfileError;
  const isDeveloper = profile.type === "Developer";

  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);

  useEffect(() => {
    let active = true;
    void loadNetworkProfile(initialProfile.id)
      .then((details) => {
        if (active) {
          setProfileDetails({ ...details, online: initialProfile.online });
          setProfileError(null);
        }
      })
      .catch((error) => {
        if (active) {
          setProfileError({ id: initialProfile.id, message: getApiErrorMessage(error) });
        }
      });
    return () => {
      active = false;
    };
  }, [initialProfile.id, initialProfile.online]);

  const allReviews = useMemo(() => {
    return profile.reviews ?? [];
  }, [profile.reviews]);

  const displayRating = useMemo(() => {
    if (allReviews.length === 0) return profile.rating ?? 0;
    const total = allReviews.reduce((sum, r) => sum + r.rating, 0);
    return Math.round((total / allReviews.length) * 10) / 10;
  }, [allReviews, profile.rating]);

  const reviewCount = allReviews.length;

  const publicDomains = useMemo(() => {
    return profile.skills;
  }, [profile.skills]);

  const canManagePending = pending && !connected && onAccept && onIgnore;
  const canToggleConnection = !pending && onToggleConnection;

  const requireProfileBeforeAction = (afterComplete?: () => void) => {
    if (profileComplete || !onRequireProfile) return false;
    onRequireProfile(afterComplete);
    return true;
  };

  const handleToggleConnection = () => {
    if (onToggleConnection) {
      if (requireProfileBeforeAction(() => onToggleConnection(profile.id))) return;
      onToggleConnection(profile.id);
    }
  };

  const handleAccept = () => {
    if (onAccept) {
      if (requireProfileBeforeAction(() => onAccept(profile.id))) return;
      onAccept(profile.id);
    }
  };

  const submitReview = async (trimmed: string) => {
    setSavingReview(true);
    try {
      await saveDeveloperReview(profile.id, { rating: reviewRating, comment: trimmed });
      const updatedProfile = await loadNetworkProfile(profile.id);
      setProfileDetails({ ...updatedProfile, online: profile.online });
      setReviewText("");
      setReviewRating(5);
    } catch (error) {
      setProfileError({ id: profile.id, message: getApiErrorMessage(error) });
    } finally {
      setSavingReview(false);
    }
  };

  const handleAddReview = async () => {
    const trimmed = reviewText.trim();
    if (!trimmed || savingReview) return;
    if (requireProfileBeforeAction(() => void submitReview(trimmed))) return;
    await submitReview(trimmed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 18 }}
      className={`h-full overflow-y-auto overflow-x-hidden ${
        isInboxSurface ? "bg-white px-7 py-6" : "bg-[#f5f6f4] py-6 px-[28px]"
      }`}
    >
      <div className="mb-5 flex min-w-0 items-center gap-3">
        <button
          onClick={onBack}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors hover:bg-[#e8ede9] text-[#428475]"
        >
          <ArrowLeft size={14} weight="bold" /> {backLabel}
        </button>
        <div className="h-4 w-px shrink-0 bg-[#dde5e0]" />
        <div className="truncate text-[12px] font-semibold text-[#7a9e8e]">
          {profile.type} profile
        </div>
        {loadingProfile && (
          <div className="ml-auto text-[11px] font-semibold text-[#7a9e8e]">
            Loading latest profile...
          </div>
        )}
      </div>

      {activeProfileError && (
        <div className="mb-4 rounded-xl border border-[#dce9e2] bg-[#f4f8f6] px-4 py-2 text-[12px] font-semibold text-[#365f52]">
          {activeProfileError}
        </div>
      )}

      <div
        className={`grid grid-cols-1 items-start gap-4 ${
          isInboxSurface ? "max-w-none" : "xl:grid-cols-[1fr_320px]"
        }`}
      >
        <div className="space-y-4">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl bg-white border border-[#e8ede9]"
          >
            <div
              className={`flex flex-col gap-4 p-5 border-b border-[#eaf0eb] ${
                isInboxSurface ? "lg:flex-row lg:items-start" : "md:flex-row md:items-start"
              }`}
            >
              <ProfileAvatar profile={profile} size={72} />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h2 className="text-[1.45rem] leading-tight font-bold text-[#1a2e26]">
                    {profile.name}
                  </h2>
                  {profile.online && (
                    <span className="h-2.5 w-2.5 rounded-full bg-[#2e7d5c]" />
                  )}
                  <TypeBadge type={profile.type} />
                </div>
                <div className="text-[13px] text-[#6b8e7e]">
                  {profile.company ? `${profile.role} at ${profile.company}` : profile.role}
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-[#6b8e7e]">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {profile.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={12} /> {profile.experience}
                  </span>
                  {profile.match > 0 && (
                    <span className="flex items-center gap-1">
                      <Star size={12} weight="fill" /> {profile.match}% AI Match
                    </span>
                  )}
                  {isDeveloper && (
                    <span className="flex items-center gap-1.5">
                      <RatingStars rating={displayRating} size={12} />
                      {displayRating}/5 rating
                    </span>
                  )}
                </div>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  isInboxSurface ? "lg:ml-auto" : "md:ml-auto"
                }`}
              >
                {canManagePending && (
                  <>
                    <button
                      onClick={() => onIgnore!(profile.id)}
                      className="rounded-lg px-3 py-2 text-[12px] font-semibold transition-colors hover:bg-[#f5f7f5] text-[#7a9e8e] border border-[#dde5e0]"
                    >
                      Ignore
                    </button>
                    <motion.button
                      onClick={handleAccept}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      className="bp-gradient-btn flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold"
                    >
                      <UserPlus size={14} weight="bold" /> Accept
                    </motion.button>
                  </>
                )}
                {canToggleConnection && (
                  <motion.button
                    onClick={handleToggleConnection}
                    disabled={connectionDisabled}
                    whileHover={connectionDisabled ? {} : { scale: 1.03 }}
                    whileTap={connectionDisabled ? {} : { scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold disabled:opacity-60 ${
                      connected || connectionDisabled
                        ? "bg-[#e8f5ef] text-[#2e7d5c] border border-[#c5ddd0]"
                        : "bp-gradient-btn"
                    }`}
                  >
                    {connected ? (
                      <CheckCircle size={14} weight="fill" />
                    ) : (
                      <UserPlus size={14} weight="bold" />
                    )}
                    {connectionLabel ?? (connected ? "Connected" : "Connect")}
                  </motion.button>
                )}
                {onMessage && (
                  <button
                    onClick={() => onMessage(profile)}
                    className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-semibold transition-colors hover:bg-[#e8ede9] text-[#0f1c18] border border-[#dde5e0]"
                  >
                    <ChatCircle size={14} /> {messageLabel}
                  </button>
                )}
              </div>
            </div>

            <div
              className={`grid grid-cols-1 gap-3 p-5 ${
                isDeveloper
                  ? isInboxSurface
                    ? "md:grid-cols-2"
                    : "lg:grid-cols-3"
                  : isInboxSurface
                    ? "md:grid-cols-2"
                    : "lg:grid-cols-2"
              }`}
            >
              {isDeveloper && (
                <DetailTile label="Rating" value={`${displayRating}/5 (${reviewCount} reviews)`} />
              )}
              <DetailTile
                label={profile.type === "Developer" ? "Availability" : "Status"}
                value={profile.availability}
              />
              <DetailTile
                label="Connection"
                value={
                  pending ? "Pending" : (connectionLabel ?? (connected ? "Connected" : "Suggested"))
                }
              />
            </div>
          </motion.section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 }}
              className="rounded-xl bg-white p-4 border border-[#e8ede9] mt-5 mb-5"
            >
              <div className="mb-2 flex items-center gap-2">
                <Code size={14} weight="bold" className="text-[#428475]" />
                <span className="text-[12px] font-bold tracking-wide uppercase text-[#7a9e8e]">
                  Professional summary
                </span>
              </div>
              <p className="text-[13px] leading-6 text-[#334d42]">
                {profile.bio}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="rounded-xl bg-white p-4 border border-[#e8ede9] mt-5 mb-5"
            >
              <div className="mb-2 flex items-center gap-2">
                {profile.type === "Founder" ? (
                  <Handshake size={14} weight="bold" className="text-[#428475]" />
                ) : (
                  <Buildings size={14} weight="bold" className="text-[#428475]" />
                )}
                <span className="text-[12px] font-bold tracking-wide uppercase text-[#7a9e8e]">
                  Core focus
                </span>
              </div>
              <div className="rounded-xl p-3 text-[13px] leading-6 bg-[#f5f7f5] text-[#1a2e26] border border-[#e8ede9]">
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
                className="rounded-xl bg-white p-4 border border-[#e8ede9] mt-5"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Star size={15} weight="fill" className="text-[#C4973A]" />
                    <span className="text-[12px] font-bold tracking-wide uppercase text-[#7a9e8e]">
                      Developer feedback
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-[#1a2e26]">
                    <RatingStars rating={displayRating} size={13} />
                    <span>
                      {displayRating}/5 from {reviewCount} reviews
                    </span>
                  </div>
                </div>

                <div className="mb-3 rounded-xl p-3 bg-[#f8faf8] border border-[#e8ede9]">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[12px] font-semibold text-[#1a2e26]">
                      Add your review
                    </div>
                    <RatingStars
                      rating={reviewRating}
                      size={16}
                      interactive
                      onChange={setReviewRating}
                    />
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(event) => setReviewText(event.target.value)}
                    placeholder="Share feedback about collaboration, communication, or delivery quality."
                    className="w-full resize-none rounded-lg px-3 py-2 text-[12px] outline-none min-h-[72px] bg-white text-[#1a2e26] border border-[#dde5e0]"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={!reviewText.trim() || savingReview}
                      onClick={handleAddReview}
                      className="bp-gradient-btn rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-opacity disabled:opacity-40"
                    >
                      {savingReview ? "Saving..." : "Submit review"}
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {allReviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-xl p-3 bg-white border border-[#edf2ef]"
                    >
                      <div className="mb-1 flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[12px] font-bold text-[#1a2e26]">
                            {review.reviewer}
                          </div>
                          <div className="text-[10px] text-[#9aaea5]">
                            {review.date}
                          </div>
                        </div>
                        <RatingStars rating={review.rating} size={12} />
                      </div>
                      <p className="text-[12px] leading-5 text-[#4c665b]">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.section>
            </>
          )}
        </div>

        <div className={`space-y-4 ${isInboxSurface ? "" : "xl:sticky xl:top-6"}`}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-white p-4 border border-[#e8ede9]"
          >
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle size={14} weight="fill" className="text-[#2e7d5c]" />
              <span className="text-[12px] font-bold tracking-wide uppercase text-[#7a9e8e]">
                Highlights
              </span>
            </div>
            <div className="space-y-2.5">
              {profile.highlights.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 text-[12px] text-[#1a2e26]"
                >
                  <CheckCircle
                    size={13}
                    weight="fill"
                    className="mt-0.5 shrink-0 text-[#2e7d5c]"
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="rounded-xl bg-white p-4 border border-[#e8ede9]"
          >
            <div className="mb-3 flex items-center gap-2">
              <Star size={14} weight="fill" className="text-[#C4973A]" />
              <span className="text-[12px] font-bold tracking-wide uppercase text-[#7a9e8e]">
                {isDeveloper ? "Skills and domains" : "Domains / interests"}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {publicDomains.map((skill) => (
                <SkillPill key={skill} label={skill} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
