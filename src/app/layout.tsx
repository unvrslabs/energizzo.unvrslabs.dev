import type { Metadata } from "next";
import { Orbitron, Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Energizzo CRM",
    template: "%s · Energizzo CRM",
  },
  description: "CRM UNVRS per la vendita di Energizzo ai reseller di energia italiani.",
  applicationName: "Energizzo CRM",
  authors: [{ name: "UNVRS Labs" }],
  creator: "UNVRS Labs",
  publisher: "UNVRS Labs",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Energizzo CRM",
    description: "Dashboard 819 reseller energia italiani · UNVRS Labs",
    type: "website",
    siteName: "Energizzo CRM",
    locale: "it_IT",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="it"
      className={`${orbitron.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body>
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "hsl(215 30% 15%)",
              border: "1px solid hsl(215 25% 22%)",
              color: "hsl(0 0% 98%)",
            },
          }}
        />
      </body>
    </html>
  );
}
