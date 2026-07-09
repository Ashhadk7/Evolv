"use client";

import Image from "next/image";
import Link from "next/link";
import { COMPANY_LINKS, PRODUCT_LINKS, LEGAL_LINKS } from "./cta-and-footer-data";
import { FooterColumn } from "./footer-links";
import { FooterLegalBar } from "./footer-legal";

export function Footer() {
  return (
    <footer className="relative" style={{ background: "#1a312c" }}>
      {/* Top hairline */}
      <div style={{ height: "1px", background: "rgba(137,215,183,0.1)", marginBottom: 50 }} />

      {/* ── Main grid ── */}
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-12 md:px-12">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {/* ── Col 1: Brand ── */}
          <div className="flex flex-col gap-5">
            {/* Logo */}
            <Link href="/" aria-label="Evolv home" className="flex items-center gap-2">
              <Image
                src="/evolv-logo-transparent.png"
                alt=""
                aria-hidden="true"
                width={48}
                height={32}
                className="h-8 w-12 shrink-0 object-contain"
              />
              <span
                className="text-[20px] leading-none font-bold tracking-tight"
                style={{ color: "#fff4e1" }}
              >
                Evolv
              </span>
            </Link>

            {/* Description */}
            <p
              className="text-[13px] leading-[1.75]"
              style={{ color: "rgba(255,244,225,0.38)", maxWidth: "240px" }}
            >
              Build the next big thing with AI.
              <br />
              Turn ideas into AI-powered product blueprints and connect with developers who can
              build them.
            </p>

            {/* Email */}
            <a
              href="mailto:hello@evolv.so"
              className="inline-flex items-center gap-2 text-[13px] transition-colors duration-200"
              style={{ color: "#89d7b7" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {/* Email icon */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 7 10-7" />
              </svg>
              hello@evolv.so
            </a>
          </div>

          {/* ── Nav columns ── */}
          <FooterColumn title="Product" links={PRODUCT_LINKS} />
          <FooterColumn title="Company" links={COMPANY_LINKS} />
          <FooterColumn title="Legal" links={LEGAL_LINKS} />
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <FooterLegalBar />
    </footer>
  );
}
