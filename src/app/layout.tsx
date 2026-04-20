import type { Metadata } from "next";
import { Orbitron, Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Energizzo CRM",
  description: "CRM per la vendita di Energizzo ai reseller di energia italiani.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${orbitron.variable} ${inter.variable} ${jetbrains.variable}`}>
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
