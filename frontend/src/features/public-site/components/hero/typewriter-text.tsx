"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { WORDS } from "./constants";

export function TypewriterText() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState(WORDS[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = WORDS[wordIndex];
    let timeout: ReturnType<typeof setTimeout>;
    if (!isDeleting && displayed === word) {
      timeout = setTimeout(() => setIsDeleting(true), 1900);
    } else if (isDeleting && displayed === "") {
      queueMicrotask(() => {
        setIsDeleting(false);
        setWordIndex((i) => (i + 1) % WORDS.length);
      });
    } else {
      timeout = setTimeout(
        () =>
          setDisplayed(
            isDeleting ? word.slice(0, displayed.length - 1) : word.slice(0, displayed.length + 1)
          ),
        isDeleting ? 34 : 58
      );
    }
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, wordIndex]);

  return (
    <span className="text-mint inline-block min-w-[12.5ch] sm:min-w-[13.5ch]">
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
        className="bg-mint ml-1 inline-block h-[0.82em] w-0.5 align-middle"
      />
    </span>
  );
}
