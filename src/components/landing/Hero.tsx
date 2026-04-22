"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Gauge,
  Mic,
  Calendar,
  BarChart3,
  Users,
  Shield,
  Activity,
  ArrowRightLeft,
  ShoppingCart,
  CreditCard,
  Zap,
  Building2,
  Handshake,
  List,
  Phone,
  Sparkles,
} from "lucide-react";
import { NetworkJoinCard } from "./NetworkJoinCard";

function ItalianFlag({ className }: { className?: string }) {
  return (
    <motion.span
      className="relative inline-block align-[-0.12em] mx-1 md:mx-2 will-change-transform"
      style={{
        transformOrigin: "left center",
        transformStyle: "preserve-3d",
        perspective: "600px",
      }}
      animate={{
        rotateY: [0, 14, -6, 10, 0],
        rotateZ: [0, -1.2, 1.2, -0.6, 0],
        y: [0, -1.5, 0.5, -1, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg
        viewBox="0 0 3 2"
        preserveAspectRatio="none"
        aria-label="Italia"
        role="img"
        className={className}
      >
        <defs>
          <linearGradient id="flag-shine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="55%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <rect width="1" height="2" x="0" fill="#008C45" />
        <rect width="1" height="2" x="1" fill="#F4F5F0" />
        <rect width="1" height="2" x="2" fill="#CD212A" />
        <motion.rect
          width="3"
          height="2"
          x="0"
          fill="url(#flag-shine)"
          animate={{ x: [-3, 3] }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            repeatDelay: 2.2,
            ease: "easeInOut",
          }}
        />
      </svg>
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-sm -z-10 blur-md"
        animate={{
          opacity: [0.25, 0.55, 0.25],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background:
            "linear-gradient(90deg, rgba(0,140,69,0.45), rgba(255,255,255,0.15), rgba(205,33,42,0.45))",
        }}
      />
    </motion.span>
  );
}

function TypingText({
  text,
  speed = 28,
  startDelay = 400,
}: {
  text: string;
  speed?: number;
  startDelay?: number;
}) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          const t = setTimeout(() => setStarted(true), startDelay);
          return () => clearTimeout(t);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started, startDelay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [started, text, speed]);

  return (
    <span ref={ref}>
      {displayed}
      <span
        aria-hidden
        className={`inline-block w-[2px] h-[1em] -mb-1 ml-[2px] align-baseline bg-primary ${done ? "opacity-0" : "animate-pulse"}`}
      />
    </span>
  );
}

const servicePills = [
  { icon: FileText, label: "Delibere ARERA" },
  { icon: Gauge, label: "Benchmark tariffario" },
  { icon: Mic, label: 'Podcast "Il Reseller"' },
  { icon: Calendar, label: "Eventi privati" },
  { icon: BarChart3, label: "Report indipendente" },
  { icon: Users, label: "Community CEO" },
  { icon: Shield, label: "Compliance ARERA" },
  { icon: Activity, label: "Monitoraggio PUN/PSV" },
  { icon: ArrowRightLeft, label: "Switching" },
  { icon: ShoppingCart, label: "Dispacciamento" },
  { icon: CreditCard, label: "Recupero crediti" },
  { icon: Zap, label: "CER" },
  { icon: Building2, label: "STG" },
  { icon: Handshake, label: "M&A & consolidamento" },
  { icon: List, label: "Aste GME" },
  { icon: Phone, label: "Telemarketing" },
];


export function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden pt-32 pb-16 md:pt-32 md:pb-24"
      aria-label="Il Dispaccio · Il network dei reseller energia in Italia"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12 xl:gap-16">
          {/* Left column */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-6 md:mb-8"
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 rounded-full liquid-glass border-primary/30">
                <Mic className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                <span className="text-xs md:text-sm font-semibold text-primary tracking-wide">
                  Il Reseller
                </span>
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 rounded-full liquid-glass border-primary/30">
                <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                <span className="text-xs md:text-sm font-semibold text-primary tracking-wide">
                  100% Gratuito
                </span>
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-3xl md:text-6xl lg:text-7xl font-black text-foreground leading-[1.1] tracking-tight mb-5 md:mb-7"
            >
              Il 1° Network{" "}
              <ItalianFlag className="h-[0.78em] w-auto rounded-sm shadow-[0_6px_18px_rgba(0,140,69,0.35)] ring-1 ring-white/15" />
              <br />
              per i <span className="gradient-text">Protagonisti del</span>
              <br />
              <span className="gradient-text">Settore Energetico</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-[680px] mx-auto lg:mx-0 mb-8 md:mb-10 px-2 lg:px-0 space-y-2"
            >
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-balance">
                <TypingText text="Reseller, Dispacciatori, Trader, Produttori" />
              </p>
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
                <span className="shiny-text">La corrente passa da qui</span>
              </p>
            </motion.div>

          </div>

          {/* Right column: join request card (nudged slightly left on large screens) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="lg:w-[440px] xl:w-[480px] shrink-0 lg:-translate-x-8 xl:-translate-x-12"
          >
            <NetworkJoinCard />
          </motion.div>
        </div>

        {/* Scrolling service pills */}
        <div
          className="mt-10 md:mt-14 overflow-hidden relative"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0, black 3rem, black calc(100% - 3rem), transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0, black 3rem, black calc(100% - 3rem), transparent 100%)",
          }}
        >
          <motion.div
            className="flex gap-3 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, ease: "linear", repeat: Infinity }}
          >
            {[...servicePills, ...servicePills].map((pill, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl shrink-0 border border-white/10 bg-white/[0.03]"
              >
                <pill.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground whitespace-nowrap">
                  {pill.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
