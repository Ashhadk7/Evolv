import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/landing/Hero";
import { UserTypes } from "@/components/landing/UserTypes";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { BlueprintSpotlight } from "@/components/landing/BlueprintSpotlight";
import { Testimonials, CTA, Footer } from "@/components/landing/CtaAndFooter";
import { HashTracker } from "@/components/landing/HashTracker";

export default function Landing() {
  return (
    <main className="min-h-screen bg-dark">
      <HashTracker sectionIds={["hero", "who-it-is-for", "how-it-works", "blueprint-spotlight", "testimonials"]} />
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
