"use client";

import { AnimatePresence, motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { Menu, Rocket, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Founders", href: "#founders" },
  { label: "Developers", href: "#developers" },
  { label: "Investors", href: "#investors" },
  { label: "How it works", href: "#how-it-works" },
];

export function Navbar() {
  const { scrollY } = useScroll();
  const [menuOpen, setMenuOpen] = useState(false);

  const bgOpacity = useTransform(scrollY, [0, 80], [0.08, 0.94]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0.12, 0.2]);
  const backgroundColor = useMotionTemplate`rgba(26, 49, 44, ${bgOpacity})`;
  const borderColor = useMotionTemplate`rgba(137, 215, 183, ${borderOpacity})`;

  return (
    <motion.nav className="fixed left-0 right-0 top-0 z-50 px-4 py-3 sm:px-6 lg:px-8">
      <motion.div
        className="mx-auto flex max-w-7xl items-center justify-between rounded-lg px-4 py-3 sm:px-5"
        style={{
          backgroundColor,
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor,
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          boxShadow: "0 14px 40px rgba(0,0,0,0.18)",
        }}
      >
        <a href="#" className="flex items-center gap-2.5" aria-label="Evolv home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint">
            <Rocket size={16} className="text-dark" />
          </span>
          <span className="text-lg font-semibold text-cream">
            Ev<span className="text-mint">olv</span>
          </span>
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-cream/58 transition-colors duration-200 hover:text-mint"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button className="px-4 py-2 text-sm text-cream/68 transition-colors hover:text-mint">
            Sign in
          </button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-lg bg-mint px-5 py-2 text-sm font-semibold text-dark transition-colors hover:bg-mint/90"
            style={{
              boxShadow: "0 0 22px rgba(137,215,183,0.2), 0 2px 8px rgba(137,215,183,0.1)",
            }}
          >
            Get started free
          </motion.button>
        </div>

        <button
          className="rounded-lg p-2 text-cream/70 transition-colors hover:bg-cream/5 hover:text-mint md:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </motion.div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mx-auto mt-2 flex max-w-7xl flex-col gap-4 rounded-lg border border-mint/10 bg-dark/95 px-5 py-5 backdrop-blur-xl md:hidden"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-cream/65 transition-colors hover:text-mint"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 border-t border-mint/10 pt-4">
              <button className="text-left text-sm text-cream/70 transition-colors hover:text-mint">
                Sign in
              </button>
              <button className="rounded-lg bg-mint px-5 py-2.5 text-sm font-semibold text-dark transition-colors hover:bg-mint/90">
                Get started free
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
