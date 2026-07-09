"use client";

import { LEGAL_LINKS } from "./cta-and-footer-data";

export function FooterLegalBar() {
  return (
    <>
      <div style={{ height: "1px", background: "rgba(137,215,183,0.1)" }} />
      <div className="mx-auto max-w-6xl px-6 py-5 md:px-12">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Left: copyright */}
          <span className="text-[12px]" style={{ color: "rgba(255,244,225,0.25)" }}>
            © 2026 Evolv. All rights reserved.
          </span>

          {/* Center: made for founders */}
          <span
            className="flex items-center gap-1.5 text-[12px]"
            style={{ color: "rgba(255,244,225,0.25)" }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,244,225,0.3)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Made for founders
          </span>

          {/* Right: legal links */}
          <div className="flex items-center gap-6">
            {LEGAL_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-[12px] transition-colors duration-150"
                style={{ color: "rgba(255,244,225,0.25)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,244,225,0.65)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,244,225,0.25)")}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
