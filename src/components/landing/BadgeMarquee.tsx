"use client";

import {
  Scale,
  LineChart,
  Mic,
  Calendar,
  FileBarChart,
  Gauge,
  Users,
  ShieldCheck,
  ArrowLeftRight,
  Network,
  Wallet,
  Phone,
  Sun,
  Cpu,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Badge {
  label: string;
  Icon: LucideIcon;
}

const BADGES: Badge[] = [
  { label: "Delibere ARERA", Icon: Scale },
  { label: "PUN/PSV", Icon: LineChart },
  { label: 'Podcast "Il Reseller"', Icon: Mic },
  { label: "Eventi privati", Icon: Calendar },
  { label: "Report annuale", Icon: FileBarChart },
  { label: "Benchmark tariffario", Icon: Gauge },
  { label: "Community", Icon: Users },
  { label: "Compliance", Icon: ShieldCheck },
  { label: "Switching", Icon: ArrowLeftRight },
  { label: "Dispacciamento", Icon: Network },
  { label: "Recupero crediti", Icon: Wallet },
  { label: "Telemarketing", Icon: Phone },
  { label: "CER", Icon: Sun },
  { label: "Smart meter", Icon: Cpu },
];

function Row() {
  return (
    <>
      {BADGES.map((b, i) => (
        <div
          key={`${b.label}-${i}`}
          className="inline-flex items-center gap-2 rounded-full liquid-glass px-4 py-2 text-xs font-semibold text-muted-foreground whitespace-nowrap"
        >
          <b.Icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span>{b.label}</span>
        </div>
      ))}
    </>
  );
}

/**
 * BadgeMarquee — infinite horizontal scrolling strip of topic badges.
 * Uses CSS keyframes; content is duplicated so the loop is seamless.
 */
export function BadgeMarquee() {
  return (
    <div
      className="relative w-full overflow-hidden py-2"
      style={{
        maskImage:
          "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)",
      }}
    >
      <div className="flex gap-3 animate-marquee w-max">
        <Row />
        <Row />
      </div>
      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        :global(.animate-marquee) {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
