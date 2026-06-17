import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { UserTypes } from "@/components/sections/UserTypes";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { BlueprintSpotlight } from "@/components/sections/BlueprintSpotlight";
import { Testimonials, CTA, Footer } from "@/components/sections/CtaAndFooter";

export default function Home() {
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
