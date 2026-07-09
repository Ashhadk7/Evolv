"use client";

import { FadeIn } from "@/components/ui/fade-in";
import { ScrollReelTestimonials } from "@/components/ui/scroll-reel-testimonials";
import { testimonialData } from "./cta-and-footer-data";

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="bg-dark relative overflow-hidden px-4 py-20 sm:px-6 md:px-12 lg:py-24"
    >
      <div className="bg-mint/10 absolute top-0 right-0 left-0 h-px" />
      <div className="mx-auto max-w-7xl">
        <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
          <div className="text-mint mb-3 text-xs uppercase">Early users</div>
          <h2 className="text-cream text-3xl leading-tight font-bold sm:text-4xl md:text-5xl">
            Founders, developers, and investors are already using the same source of truth
          </h2>
        </FadeIn>
        <FadeIn className="flex justify-center">
          <ScrollReelTestimonials testimonials={testimonialData} />
        </FadeIn>
      </div>
    </section>
  );
}
