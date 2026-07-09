"use client";

import { Navbar } from "@/features/public-site/components/navbar";
import { Hero } from "@/features/public-site/components/hero";
import { UserTypes } from "@/features/public-site/components/user-types";
import { HowItWorks } from "@/features/public-site/components/how-it-works";
import { BlueprintSpotlight } from "@/features/public-site/components/blueprint-spotlight";
import { Testimonials, CTA, Footer } from "@/features/public-site/components/cta-and-footer";
import { HashTracker } from "@/features/public-site/components/hash-tracker";

export function HomePage() {
  return (
    <main className="bg-dark min-h-screen">
      <HashTracker
        sectionIds={[
          "hero",
          "who-it-is-for",
          "how-it-works",
          "blueprint-spotlight",
          "testimonials",
        ]}
      />
      <Navbar />
      <Hero />
      <UserTypes />
      <HowItWorks />
      <BlueprintSpotlight />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
