"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";

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

function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const steps = 60;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3);
            let current = value * eased;
            if (step >= steps) {
              current = value;
              clearInterval(timer);
            }
            setDisplayValue(current);
          }, duration / steps);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  const formatted =
    decimals > 0
      ? displayValue.toFixed(decimals).replace(".", ",")
      : Math.round(displayValue).toLocaleString("it-IT");

  return (
    <span ref={ref}>
      {prefix}
      {formatted}
      {suffix}
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
      className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24"
      aria-label="Il Dispaccio · Il network dei reseller energia in Italia"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12 xl:gap-16">
          {/* Left — Text content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 rounded-full liquid-glass border-primary/30 mb-6 md:mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs md:text-sm font-medium text-primary tracking-wide">
                Il network dei reseller energia in Italia
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.1] tracking-tight mb-6 md:mb-8"
            >
              Il primo network italiano per i{" "}
              <span className="gradient-text-emerald font-bold">
                protagonisti del settore energetico
              </span>
              .
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-[680px] mx-auto lg:mx-0 mb-8 md:mb-10 px-2 lg:px-0 space-y-2"
            >
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-balance">
                <TypingText text="Reseller, Dispacciatori, Trader, Produttori." />
              </p>
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
                <span className="shiny-text">La corrente passa da qui.</span>
              </p>
            </motion.div>

            {/* Sponsor badge */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex justify-center lg:justify-start mb-10 lg:mb-0"
            >
              <a
                href="https://www.energizzo.it"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group rounded-full border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur transition-all",
                )}
              >
                <AnimatedShinyText className="inline-flex items-center justify-center px-5 py-1.5 text-sm">
                  <span>✨ Sponsor Ufficiale · Energizzo</span>
                  <ArrowRight className="ml-2 size-3.5 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                </AnimatedShinyText>
              </a>
            </motion.div>
          </div>

          {/* Right — Stats cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="lg:w-[420px] xl:w-[480px] shrink-0"
          >
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {[
                {
                  value: <AnimatedNumber value={741} />,
                  label:
                    "Venditori attivi in Italia nel 2024. Erano 806 nel 2022.",
                  color: "text-primary",
                },
                {
                  value: (
                    <AnimatedNumber value={23.8} decimals={1} suffix="%" />
                  ),
                  label:
                    "Tasso di switching 2024. 1 cliente su 4 ha cambiato fornitore.",
                  color: "text-amber-400",
                },
                {
                  value: (
                    <AnimatedNumber value={30.5} decimals={1} suffix="M" />
                  ),
                  label: "Punti di prelievo domestici nel mercato italiano.",
                  color: "text-emerald-400",
                },
                {
                  value: <AnimatedNumber value={108.5} decimals={1} />,
                  label: "€/MWh il PUN medio 2024. Francia: 58. Spagna: 63.",
                  color: "text-blue-400",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="liquid-glass-card-sm p-4 md:p-6 text-center"
                >
                  <div
                    className={`text-2xl md:text-3xl font-black tracking-tight mb-2 ${stat.color}`}
                  >
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/50 mt-4 text-center">
              Fonte: ARERA — Relazione Annuale 2025
            </p>
          </motion.div>
        </div>

        {/* Scrolling service pills */}
        <div className="mt-10 md:mt-14 overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <motion.div
            className="flex gap-3 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, ease: "linear", repeat: Infinity }}
          >
            {[...servicePills, ...servicePills].map((pill, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl liquid-glass shrink-0"
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
