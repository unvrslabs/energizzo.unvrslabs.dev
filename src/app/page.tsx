import type { Metadata } from "next";

import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { FreeNetworkSection } from "@/components/landing/FreeNetworkSection";
import { PlatformTabs } from "@/components/landing/PlatformTabs";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ReportSpotlight } from "@/components/landing/ReportSpotlight";
import { JoinSection } from "@/components/landing/JoinSection";
import { PodcastSection } from "@/components/landing/PodcastSection";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Il Dispaccio · Il network dei reseller energia in Italia",
  description:
    "Delibere ARERA decifrate, tariffe benchmark, podcast 'Il Reseller', eventi privati e un report indipendente. Il network dei reseller energia italiani.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen text-foreground mesh-gradient">
      <Navbar />
      <Hero />
      <FreeNetworkSection />
      <HowItWorks />
      <PlatformTabs />
      <ReportSpotlight />
      <JoinSection />
      <PodcastSection />
      <ComparisonTable />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
