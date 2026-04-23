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
  metadataBase: new URL("https://ildispaccio.energy"),
  title: {
    default: "Il Dispaccio · Il network dei reseller energia in Italia",
    template: "%s · Il Dispaccio",
  },
  description:
    "Il primo network italiano dei reseller energia. Delibere ARERA decifrate dall'AI, benchmark tariffario live, podcast editoriale e report indipendente annuale.",
  applicationName: "Il Dispaccio",
  authors: [{ name: "UNVRS Labs" }],
  creator: "UNVRS Labs",
  publisher: "UNVRS Labs",
  keywords: [
    "reseller energia",
    "network reseller energia",
    "delibere ARERA",
    "benchmark tariffario",
    "PUN PSV TTF",
    "mercato energia Italia",
    "podcast reseller",
    "report energia",
    "ildispaccio",
    "energizzo",
  ],
  category: "Business",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Il Dispaccio · Il network dei reseller energia in Italia",
    description:
      "Delibere ARERA decifrate dall'AI, benchmark tariffario live, podcast editoriale e report indipendente annuale. 100 posti Anno I · €0 per sempre.",
    url: "https://ildispaccio.energy",
    type: "website",
    siteName: "Il Dispaccio",
    locale: "it_IT",
  },
  twitter: {
    card: "summary_large_image",
    title: "Il Dispaccio · Il network dei reseller energia in Italia",
    description:
      "Delibere ARERA decifrate, benchmark tariffario live, podcast editoriale, report annuale. 100 posti · €0.",
    site: "@il_dispaccio",
    creator: "@il_dispaccio",
  },
  formatDetection: {
    email: false,
    telephone: false,
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
