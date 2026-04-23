import type { Metadata } from "next";

import { NavbarV2 } from "@/components/landing-v2/NavbarV2";
import { HeroV2 } from "@/components/landing-v2/HeroV2";
import { TickerBarV2 } from "@/components/landing-v2/TickerBarV2";
import { PillarsV2 } from "@/components/landing-v2/PillarsV2";
import { StatsV2 } from "@/components/landing-v2/StatsV2";
import { HowItWorksV2 } from "@/components/landing-v2/HowItWorksV2";
import { SponsorV2 } from "@/components/landing-v2/SponsorV2";
import { ReportV2 } from "@/components/landing-v2/ReportV2";
import { PodcastV2 } from "@/components/landing-v2/PodcastV2";
import { FAQV2 } from "@/components/landing-v2/FAQV2";
import { JoinFormV2 } from "@/components/landing-v2/JoinFormV2";
import { FooterV2 } from "@/components/landing-v2/FooterV2";

export const metadata: Metadata = {
  title: "Il Dispaccio · Il network dei reseller energia in Italia",
  description:
    "Delibere ARERA decifrate, benchmark tariffario live, podcast \"Il Reseller\" e report indipendente. Il primo network italiano dei reseller energia.",
  robots: { index: false, follow: false },
};

export default function LandingV2Page() {
  return (
    <div className="lv2">
      <NavbarV2 />
      <main>
        <HeroV2 />
        <TickerBarV2 />
        <PillarsV2 />
        <StatsV2 />
        <HowItWorksV2 />
        <SponsorV2 />
        <PodcastV2 />
        <ReportV2 />
        <FAQV2 />
        <JoinFormV2 />
      </main>
      <FooterV2 />
    </div>
  );
}
