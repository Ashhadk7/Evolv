"use client";

import React from "react";
import { ClientIcon as Icon } from "@/components/ui/client-icon";

export interface DeveloperProfileMobileCardProps {
  name?: string;
  roleBadge?: string;
  title?: string;
  location?: string;
  experienceYears?: string;
  rating?: string;
  avatarUrl?: string;
  matchScore?: string;
  availability?: string;
  summaryText?: string;
  skills?: string[];
  onBack?: () => void;
  onConnect?: () => void;
  onMessage?: () => void;
}

export function DeveloperProfileMobileCard({
  name = "Jordan Diaz",
  roleBadge = "DEV",
  title = "Senior AI Engineer - Freelance",
  location = "Berlin",
  experienceYears = "8 yrs",
  rating = "4.9/5",
  avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  matchScore = "94%",
  availability = "Open",
  summaryText = "Senior AI engineer specialising in medical imaging and HIPAA-compliant ML pipelines. Shipped diagnostics models for three healthtech startups.",
  skills = ["PyTorch", "LLMs", "Medical Imaging", "HIPAA", "Python", "MLOps"],
  onBack,
  onConnect,
  onMessage,
}: DeveloperProfileMobileCardProps) {
  const safeAvatarUrl = avatarUrl.trim() || null;
  const initials =
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase() || "DV";

  return (
    <div className="block md:hidden w-full max-w-md mx-auto bg-[#f0f3f1] min-h-screen pb-12 font-sans text-[#15271f]">
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#e6ede9] sticky top-0 z-30 shadow-xs">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f4f8f6] text-[#1a312c] hover:bg-[#e6ede9] transition-colors"
          aria-label="Go back"
        >
          <Icon icon="solar:alt-arrow-left-bold" width={20} height={20} />
        </button>
        <h1 className="text-base font-bold text-[#1a312c] truncate">Developer profile</h1>
        <div className="w-9" />
      </div>

      <div className="p-4 space-y-4">
        {/* ── Header Banner Profile Card ── */}
        <div className="bg-white rounded-2xl overflow-hidden border border-[#e6ede9] mobile-card-shadow">
          {/* Dark Green Banner */}
          <div className="h-20 bg-[#1a312c] w-full" />
          
          <div className="px-4 pb-4 -mt-10 relative">
            <div className="flex items-end justify-between mb-3">
              {/* Profile Avatar */}
              {safeAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={safeAvatarUrl}
                  alt={name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md bg-white shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md bg-[#e7f4ed] text-[#2e7d5c] shrink-0 flex items-center justify-center text-xl font-black">
                  {initials}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#1a312c] leading-tight">{name}</h2>
                <span className="text-[10px] font-extrabold bg-[#e7f4ed] text-[#2e7d5c] px-2 py-0.5 rounded-md uppercase tracking-wider">
                  • {roleBadge}
                </span>
              </div>
              <p className="text-xs font-semibold text-[#4f6358]">{title}</p>
              
              <div className="flex items-center gap-3 text-[11px] font-medium text-[#8aa99c] pt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Icon icon="solar:map-point-bold" width={14} height={14} className="text-[#428475]" />
                  {location}
                </span>
                <span className="flex items-center gap-1">
                  <Icon icon="solar:suitcase-bold" width={14} height={14} className="text-[#428475]" />
                  {experienceYears}
                </span>
                <span className="flex items-center gap-1 text-[#b07d10] font-bold">
                  ★ {rating}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 mt-4 pt-2">
              <button
                onClick={onConnect}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1a312c] text-white font-bold text-xs hover:bg-[#244b42] transition-all shadow-xs"
              >
                <Icon icon="solar:user-plus-bold" width={16} height={16} />
                Connect
              </button>
              <button
                onClick={onMessage}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-[#e6ede9] text-[#1a312c] font-bold text-xs hover:bg-[#f4f8f6] transition-all"
              >
                <Icon icon="solar:chat-round-dots-bold" width={16} height={16} className="text-[#428475]" />
                Message
              </button>
            </div>
          </div>
        </div>

        {/* ── Metric Tiles Grid ── */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white rounded-2xl p-3 border border-[#e6ede9] text-center mobile-card-shadow">
            <span className="text-base font-black text-[#1a312c] block leading-tight">{matchScore}</span>
            <span className="text-[9px] font-bold text-[#8aa99c] uppercase tracking-wider block mt-1">AI Match</span>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-[#e6ede9] text-center mobile-card-shadow">
            <span className="text-base font-black text-[#1a312c] block leading-tight">{rating.split('/')[0]}</span>
            <span className="text-[9px] font-bold text-[#8aa99c] uppercase tracking-wider block mt-1">Rating</span>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-[#e6ede9] text-center mobile-card-shadow">
            <span className="text-base font-black text-[#2e7d5c] block leading-tight">{availability}</span>
            <span className="text-[9px] font-bold text-[#8aa99c] uppercase tracking-wider block mt-1">Availability</span>
          </div>
        </div>

        {/* ── Professional Summary Card ── */}
        <div className="bg-white rounded-2xl p-4 border border-[#e6ede9] mobile-card-shadow">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-[#8aa99c] mb-2 flex items-center gap-1.5">
            <span>&lt;/&gt;</span> PROFESSIONAL SUMMARY
          </h3>
          <p className="text-xs text-[#4f6358] leading-relaxed font-medium">{summaryText}</p>
        </div>

        {/* ── Skills & Domains Section ── */}
        <div className="bg-white rounded-2xl p-4 border border-[#e6ede9] mobile-card-shadow">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-[#8aa99c] mb-3">
            SKILLS & DOMAINS
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="text-xs font-bold bg-[#f4f8f6] text-[#1a312c] border border-[#e6ede9] px-3 py-1 rounded-xl"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
