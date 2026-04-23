import type { ReactNode } from "react";
import { NavbarV2 } from "@/components/landing-v2/NavbarV2";
import { FooterV2 } from "@/components/landing-v2/FooterV2";
import { CookieBanner } from "@/components/landing-v2/CookieBanner";

export function LegalLayout({
  kicker,
  title,
  updated,
  children,
}: {
  kicker: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="lv2">
      <NavbarV2 />
      <main className="lv2-section" style={{ paddingTop: "140px" }}>
        <div className="lv2-container max-w-3xl">
          <div className="lv2-kicker mb-4">{kicker}</div>
          <h1 className="lv2-h1 mb-3">{title}</h1>
          <p
            className="lv2-mono"
            style={{
              fontSize: "10.5px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "hsl(var(--lv2-text-mute))",
              marginBottom: "48px",
            }}
          >
            Ultimo aggiornamento: {updated}
          </p>
          <article className="lv2-legal-prose">{children}</article>
        </div>
      </main>
      <FooterV2 />
      <CookieBanner />
    </div>
  );
}
