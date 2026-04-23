import type { Metadata, Viewport } from "next";
import {
  Orbitron,
  Plus_Jakarta_Sans,
  Inter,
  JetBrains_Mono,
  Newsreader,
} from "next/font/google";
import { Toaster } from "sonner";
import { ThemeScript } from "@/components/v2/theme-script";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});
// Inter serves as the 900-weight fallback for Plus Jakarta Sans (same stack as energizzo.it)
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-serif",
});

export const viewport: Viewport = {
  themeColor: "#122434",
  viewportFit: "cover",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: {
    default: "Il Dispaccio",
    template: "%s · Il Dispaccio",
  },
  description: "Il primo network italiano dei reseller energia.",
  applicationName: "Il Dispaccio",
  authors: [{ name: "UNVRS Labs" }],
  creator: "UNVRS Labs",
  publisher: "UNVRS Labs",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Il Dispaccio",
    description: "Il primo network italiano dei reseller energia.",
    type: "website",
    siteName: "Il Dispaccio",
    locale: "it_IT",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="it"
      className={`${orbitron.variable} ${jakarta.variable} ${inter.variable} ${jetbrains.variable} ${newsreader.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        {children}
        {/* Toaster: stili in globals.css via [data-theme] override per adattarsi al tema */}
        <Toaster position="top-right" className="ild-toaster" />
      </body>
    </html>
  );
}
