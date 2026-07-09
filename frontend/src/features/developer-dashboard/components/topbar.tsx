"use client";

import { useEffect, useState } from "react";
import type { DeveloperTab } from "@/features/developer-dashboard/types";

interface TopbarProps {
  title?: string;
  subtitle?: string;
  profile?: { firstName?: string; lastName?: string; avatarUrl?: string };
  onNavigate?: (tab: DeveloperTab) => void;
  onNotifClick?: () => void;
}

const ACCENT = "#89d7b7";

export function Topbar({
  title,
  subtitle,
  profile: propProfile,
  onNavigate,
  onNotifClick,
}: TopbarProps) {
  const [localProfile, setLocalProfile] = useState({
    firstName: "Sarah",
    lastName: "Mitchell",
    avatarUrl: "",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("evolv_user");
      if (raw) {
        const user = JSON.parse(raw);
        queueMicrotask(() => {
          setLocalProfile({
            firstName: user.firstName || "Sarah",
            lastName: user.lastName || "Mitchell",
            avatarUrl: user.avatarUrl || user.photo || "",
          });
        });
      }
    } catch {}
  }, []);

  const activeProfile = propProfile || localProfile;
  const fullText = title || `Welcome back, ${activeProfile.firstName || "Developer"}`;

  const initials =
    `${activeProfile.firstName?.[0] ?? ""}${activeProfile.lastName?.[0] ?? ""}`.toUpperCase() ||
    "D";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem",
        gap: "1rem",
      }}
    >
      {/* Greeting */}
      <div>
        <h1
          style={{
            fontSize: "1.55rem",
            fontWeight: 800,
            color: "#1a2e26",
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {fullText}
        </h1>
        <p style={{ color: "#7a9e8e", fontSize: "0.85rem", marginTop: "0.15rem", marginBottom: 0 }}>
          {subtitle || "Here's your developer dashboard overview."}
        </p>
      </div>

      {/* Right side: profile avatar (notification bell moved to sidebar, legacy support if clicked) */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        {onNotifClick && (
          <button
            onClick={onNotifClick}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #dde5e0",
              background: "white",
              cursor: "pointer",
            }}
            title="Notifications"
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0f1c18"
              strokeWidth={2}
            >
              <path d="M18 10.7C18 7.2 15.7 5 12 5S6 7.2 6 10.7c0 2.4-.6 4.1-1.5 5.2-.5.6-.1 1.6.7 1.6h13.6c.8 0 1.2-1 .7-1.6-.9-1.1-1.5-2.8-1.5-5.2Z" />
              <path d="M9.8 18.5a2.3 2.3 0 0 0 4.4 0" />
            </svg>
          </button>
        )}

        <button
          onClick={() => onNavigate?.("settings")}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #c5ddd0",
            background: "white",
            cursor: "pointer",
            transition: "opacity 0.15s",
            flexShrink: 0,
          }}
          title="Open settings"
        >
          {activeProfile.avatarUrl ? (
            <span
              aria-label={`${activeProfile.firstName || "Developer"} profile`}
              role="img"
              style={{
                width: "100%",
                height: "100%",
                backgroundImage: `url(${activeProfile.avatarUrl})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            />
          ) : (
            <span
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                background: ACCENT,
                color: "#0f1c18",
              }}
            >
              {initials}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
