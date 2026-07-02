"use client";

import { useEffect, useRef } from "react";

export function HashTracker({ sectionIds }: { sectionIds: string[] }) {
  const isScrollingRef = useRef(false);

  useEffect(() => {
    // If the URL has a hash on load, scroll to it smoothly after a small delay
    // to let React hydration finish
    if (window.location.hash) {
      const targetId = window.location.hash.substring(1);
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        
        let mostVisible = entries[0];
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > mostVisible.intersectionRatio) {
            mostVisible = entry;
          }
        }

        if (mostVisible && mostVisible.isIntersecting) {
          const id = mostVisible.target.id;
          const currentHash = window.location.hash.substring(1);
          if (id && currentHash !== id) {
            window.history.replaceState(null, "", `#${id}`);
          }
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px", // adjust thresholds
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Detect manual scrolling vs auto-scrolling
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      isScrollingRef.current = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [sectionIds]);

  return null;
}
