"use client";

import Link from "next/link";
import type { FooterColumnProps, NavLink } from "./cta-and-footer-data";

export function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: "#89d7b7" }}>
        {title}
      </p>
      <ul className="flex flex-col gap-3">
        {links.map((link: NavLink) => (
          <li key={link.label}>
            {link.href.startsWith("/") ? (
              <Link
                href={link.href}
                className="text-[13.5px] leading-snug transition-colors duration-200"
                style={{ color: "rgba(255,244,225,0.45)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,244,225,0.9)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,244,225,0.45)")}
              >
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                className="text-[13.5px] leading-snug transition-colors duration-200"
                style={{ color: "rgba(255,244,225,0.45)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,244,225,0.9)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,244,225,0.45)")}
              >
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
