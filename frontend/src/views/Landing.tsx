import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/landing/Hero";
import { UserTypes } from "@/components/landing/UserTypes";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { BlueprintSpotlight } from "@/components/landing/BlueprintSpotlight";
import { Testimonials, CTA, Footer } from "@/components/landing/CtaAndFooter";

export default function Landing() {
  return (
    <main className="min-h-screen bg-dark">
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
