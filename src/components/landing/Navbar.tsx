"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Sezioni", href: "#sezioni" },
  { label: "Come Funziona", href: "#come-funziona" },
  { label: "Report", href: "#report" },
  { label: "Podcast", href: "#podcast" },
  { label: "Confronto", href: "#confronto" },
];

const CTA_HREF =
  "mailto:emanuele@unvrslabs.dev?subject=Richiesta%20accesso%20Il%20Dispaccio";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("#");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (href: string) => {
    setActiveLink(href);
    setMobileOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4"
    >
      {/* Desktop - Floating Liquid Glass Pill */}
      <motion.div
        className={cn(
          "hidden lg:flex items-center gap-1 px-4 py-2.5 rounded-full transition-all duration-700",
          "liquid-glass-nav",
        )}
        style={{
          boxShadow: scrolled
            ? "0 8px 32px hsl(0 0% 0% / 0.25), inset 0 1px 0 0 hsl(0 0% 100% / 0.1)"
            : "0 4px 24px hsl(0 0% 0% / 0.15), inset 0 1px 0 0 hsl(0 0% 100% / 0.08)",
        }}
      >
        <a href="#" className="pr-4 pl-2">
          <span className="text-lg font-bold gradient-text">il dispaccio</span>
          <span className="text-sm text-muted-foreground ml-1">by UNVRS</span>
        </a>

        <div className="w-px h-5 bg-white/15 mx-1" />

        {navLinks.map((link) => (
          <motion.a
            key={link.href}
            href={link.href}
            onClick={() => handleLinkClick(link.href)}
            className={cn(
              "relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full",
              activeLink === link.href
                ? "text-primary"
                : "text-foreground/70 hover:text-foreground",
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {activeLink === link.href && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-full liquid-glass"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 100%)",
                  border: "1px solid hsl(var(--primary) / 0.25)",
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{link.label}</span>
          </motion.a>
        ))}

        <div className="w-px h-5 bg-white/15 mx-1" />

        <motion.a
          href={CTA_HREF}
          className="px-5 py-2 text-sm font-semibold text-primary-foreground bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
          whileHover={{
            scale: 1.05,
            boxShadow: "0 8px 24px hsl(var(--primary) / 0.4)",
          }}
          whileTap={{ scale: 0.98 }}
        >
          Entra nel network
        </motion.a>
      </motion.div>

      {/* Mobile Menu Toggle */}
      <motion.div
        className={cn(
          "lg:hidden flex items-center justify-between w-full px-5 py-3 rounded-full transition-all duration-500",
          "liquid-glass-nav",
        )}
      >
        <span className="gradient-text font-bold text-lg">il dispaccio</span>
        <motion.button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-foreground p-2 rounded-full liquid-glass"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={mobileOpen ? "Chiudi menu" : "Apri menu"}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </motion.button>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden fixed top-[6.5rem] left-4 right-4 z-50 rounded-[1.5rem] overflow-hidden liquid-glass-card"
          >
            <div className="flex flex-col p-4 gap-1">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => handleLinkClick(link.href)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "px-4 py-3 rounded-xl text-base font-medium transition-all duration-300",
                    activeLink === link.href
                      ? "text-primary bg-primary/10"
                      : "text-foreground/70 hover:text-foreground hover:bg-white/5",
                  )}
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="h-px bg-white/10 my-2" />
              <motion.a
                href={CTA_HREF}
                onClick={() => setMobileOpen(false)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="px-4 py-3 rounded-xl text-base font-semibold text-center text-primary-foreground bg-gradient-to-r from-primary to-accent w-full"
              >
                Entra nel network
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
