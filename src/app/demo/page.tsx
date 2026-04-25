import type { Metadata } from "next";

import { NavbarV2 } from "@/components/landing-v2/NavbarV2";
import { HeroV2 } from "@/components/landing-v2/HeroV2";
import { HomeVideoV2 } from "@/components/landing-v2/HomeVideoV2";
import { TickerBarV2 } from "@/components/landing-v2/TickerBarV2";
import { PillarsV2 } from "@/components/landing-v2/PillarsV2";
import { ModuliCockpitV2 } from "@/components/landing-v2/ModuliCockpitV2";
import { StatsV2 } from "@/components/landing-v2/StatsV2";
import { HowItWorksV2 } from "@/components/landing-v2/HowItWorksV2";
import { SponsorV2 } from "@/components/landing-v2/SponsorV2";
import { ReportV2 } from "@/components/landing-v2/ReportV2";
import { PodcastV2 } from "@/components/landing-v2/PodcastV2";
import { FAQV2 } from "@/components/landing-v2/FAQV2";
import { JoinFormV2 } from "@/components/landing-v2/JoinFormV2";
import { FooterV2 } from "@/components/landing-v2/FooterV2";
import { CookieBanner } from "@/components/landing-v2/CookieBanner";

export const metadata: Metadata = {
  title: "Demo · Il Dispaccio (con video home)",
  robots: { index: false, follow: false },
};

export const revalidate = 1800;

export default function DemoLandingPage() {
  return (
    <div className="lv2">
      <NavbarV2 />
      <main>
        <HeroV2 />
        <TickerBarV2 />
        <HomeVideoV2 />
        <PillarsV2 />
        <ModuliCockpitV2 />
        <StatsV2 />
        <HowItWorksV2 />
        <SponsorV2 />
        <PodcastV2 />
        <ReportV2 />
        <FAQV2 />
        <JoinFormV2 />
      </main>
      <FooterV2 />
      <CookieBanner />
    </div>
  );
}
