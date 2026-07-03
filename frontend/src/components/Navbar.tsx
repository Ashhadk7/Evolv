"use client";

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

const NAV_LINKS = [
  { label: "Home",         href: "/"              },
  { label: "How it works", href: "/#how-it-works" },
  { label: "About",        href: "/about"         },
  { label: "Our Team",     href: "/our-team"      },
];

export function Navbar() {
  const { scrollY } = useScroll();
  const [menuOpen, setMenuOpen]       = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const bgOpacity     = useTransform(scrollY, [0, 90], [0.0,  0.92]);
  const borderOpacity = useTransform(scrollY, [0, 90], [0.06, 0.18]);
  const backgroundColor = useMotionTemplate`rgba(16, 34, 30, ${bgOpacity})`;
  const borderColor     = useMotionTemplate`rgba(137, 215, 183, ${borderOpacity})`;

  const compact   = useTransform(scrollY, [380, 720], [0, 1]);
  const outerPt   = useTransform(compact, [0, 1], [12,  4]);
  const outerPx   = useTransform(compact, [0, 1], [16, 28]);
  const innerPx   = useTransform(compact, [0, 1], [20, 14]);
  const innerPy   = useTransform(compact, [0, 1], [12,  6]);
  const innerMaxW = useTransform(compact, [0, 1], [1280, 940]);

  const onEnter = (label: string) => {
    clearTimeout(hideTimer.current);
    setHoveredLink(label);
  };
  const onLeave = () => {
    hideTimer.current = setTimeout(() => setHoveredLink(null), 80);
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50">
      <motion.div
        style={{
          paddingTop:    outerPt,
          paddingBottom: 0,
          paddingLeft:   outerPx,
          paddingRight:  outerPx,
        }}
      >
        <motion.div
          className="mx-auto flex items-center justify-between rounded-xl"
          style={{
            maxWidth:      innerMaxW,
            paddingLeft:   innerPx,
            paddingRight:  innerPx,
            paddingTop:    innerPy,
            paddingBottom: innerPy,
            backgroundColor,
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.18), 0 0 0 1px rgba(137,215,183,0.025) inset",
          }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5" aria-label="Evolv home">
            <Image
              src="/evolv-logo-transparent.png"
              alt=""
              aria-hidden="true"
              width={64}
              height={40}
              className="h-10 w-16 shrink-0 object-contain"
            />
            <span className="text-[20px] font-semibold tracking-tight text-cream">
              Ev<span className="text-mint">olv</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="relative rounded-full px-4 py-2 text-sm text-cream/50 transition-colors duration-150 hover:text-cream/90"
                onMouseEnter={() => onEnter(link.label)}
                onMouseLeave={onLeave}
              >
                {hoveredLink === link.label && (
                  <motion.span
                    layoutId="nav-lamp"
                    className="absolute inset-0 -z-10 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    style={{ background: "rgba(137,215,183,0.09)" }}
                  >
                    <span
                      className="absolute left-1/2 -translate-x-1/2"
                      style={{ top: "-5px" }}
                    >
                      <span
                        className="block h-[2.5px] w-6 rounded-full"
                        style={{ background: "rgba(137,215,183,0.72)" }}
                      />
                      <span
                        className="absolute -left-2 block h-5 w-10 rounded-full blur-md"
                        style={{ top: "-6px", background: "rgba(137,215,183,0.22)" }}
                      />
                      <span
                        className="absolute block h-4 w-6 rounded-full blur-sm"
                        style={{ top: "-4px", background: "rgba(137,215,183,0.16)" }}
                      />
                    </span>
                  </motion.span>
                )}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-1 md:flex">
            <Link
              href="/sign-in"
              className="px-4 py-2 text-sm text-cream/48 transition-colors hover:text-cream/75"
            >
              Sign in
            </Link>
            <motion.div whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/sign-up"
                className="rounded-lg bg-mint px-5 py-2 text-sm font-semibold text-dark inline-block"
                style={{
                  boxShadow: "0 0 20px rgba(137,215,183,0.22), 0 2px 8px rgba(137,215,183,0.1)",
                }}
              >
                Get started free
              </Link>
            </motion.div>
          </div>

          {/* Mobile toggle */}
          <button
            className="rounded-lg p-2 text-cream/55 transition-colors hover:bg-cream/5 hover:text-mint md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </motion.div>
      </motion.div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mx-4 mt-1 flex flex-col rounded-xl border border-mint/10 bg-[#0d1e1a]/96 px-4 py-4 backdrop-blur-2xl md:hidden"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm text-cream/58 transition-colors hover:bg-mint/5 hover:text-cream/88"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-mint/8 pt-3">
              <Link
                href="/sign-in"
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 text-left text-sm text-cream/55 transition-colors hover:text-cream/80"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg bg-mint px-4 py-2.5 text-sm font-semibold text-dark text-center"
              >
                Get started free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
