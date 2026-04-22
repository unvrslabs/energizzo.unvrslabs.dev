"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Calculator,
  Mic,
  Menu,
  X,
  LogOut,
  Building2,
  Phone,
  Loader2,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Member = {
  referente: string;
  ragione_sociale: string;
  piva: string;
  phone_masked: string;
};

const LINKS = [
  { href: "/network/delibere", label: "Delibere ARERA", icon: BookOpen },
  { href: "/network/price-engine", label: "Price Engine", icon: Calculator },
  { href: "/network/podcast", label: "Podcast", icon: Mic },
] as const;

export function NetworkNavbar({ member }: { member: Member }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initial = member.referente.trim().charAt(0).toUpperCase() || "?";

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4"
    >
      {/* Desktop pill */}
      <motion.div
        className="hidden lg:flex items-center gap-1 px-4 py-2.5 rounded-full liquid-glass-nav transition-all duration-500"
        style={{
          boxShadow: scrolled
            ? "0 12px 40px hsl(0 0% 0% / 0.35), inset 0 1px 0 0 hsl(0 0% 100% / 0.1)"
            : "0 4px 24px hsl(0 0% 0% / 0.15), inset 0 1px 0 0 hsl(0 0% 100% / 0.08)",
        }}
      >
        <Link href="/network" className="pr-4 pl-2">
          <span className="text-lg font-bold gradient-text">Il Dispaccio</span>
        </Link>

        <div className="w-px h-5 bg-white/15 mx-1" />

        {LINKS.map((link) => {
          const active = pathname?.startsWith(link.href) ?? false;
          const Icon = link.icon;
          return (
            <motion.div key={link.href} className="relative">
              <Link
                href={link.href}
                className={cn(
                  "relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                  active
                    ? "text-primary"
                    : "text-foreground/70 hover:text-foreground",
                )}
              >
                {active && (
                  <motion.div
                    layoutId="activeNetworkTab"
                    className="absolute inset-0 rounded-full liquid-glass"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 100%)",
                      border: "1px solid hsl(var(--primary) / 0.25)",
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{link.label}</span>
              </Link>
            </motion.div>
          );
        })}

        <div className="w-px h-5 bg-white/15 mx-1" />

        <ProfileMenu member={member} initial={initial} />
      </motion.div>

      {/* Mobile */}
      <motion.div className="lg:hidden flex items-center justify-between w-full px-5 py-3 rounded-full liquid-glass-nav transition-all duration-500">
        <Link href="/network" className="gradient-text font-bold text-lg">
          Il Dispaccio
        </Link>
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

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden fixed top-[6.5rem] left-4 right-4 z-50 rounded-[1.5rem] overflow-hidden dispaccio-card"
          >
            <div className="flex flex-col p-4 gap-1">
              <div className="mb-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/25 border border-primary/40 text-primary font-bold">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {member.referente}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.ragione_sociale}
                    </p>
                  </div>
                </div>
              </div>

              {LINKS.map((link, index) => {
                const Icon = link.icon;
                const active = pathname?.startsWith(link.href) ?? false;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "inline-flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium transition-all",
                        active
                          ? "text-primary bg-primary/10"
                          : "text-foreground/70 hover:text-foreground hover:bg-white/5",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}

              <div className="h-px bg-white/10 my-2" />

              <MobileLogoutButton onBeforeLogout={() => setMobileOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function ProfileMenu({
  member,
  initial,
}: {
  member: Member;
  initial: string;
}) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/network/auth/logout", { method: "POST" });
    } catch {
      // navigate anyway
    }
    window.location.href = "/";
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 text-primary font-bold hover:border-primary transition-colors"
          aria-label="Profilo"
        >
          {initial}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[280px] p-0 overflow-hidden border-primary/20 bg-card/40 backdrop-blur-xl dispaccio-card rounded-2xl"
      >
        <div className="p-4 border-b border-white/10 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 border border-primary/40 text-primary font-bold">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {member.referente}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                Membro network
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 space-y-2">
          <ProfileField
            icon={<Building2 className="h-3.5 w-3.5" />}
            label="Azienda"
            value={member.ragione_sociale}
            mono={false}
          />
          <ProfileField
            icon={<span className="text-[10px] font-mono">#</span>}
            label="P.IVA"
            value={member.piva}
            mono
          />
          <ProfileField
            icon={<Phone className="h-3.5 w-3.5" />}
            label="WhatsApp"
            value={member.phone_masked}
            mono
          />
        </div>

        <div className="border-t border-white/10 p-2">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-60"
          >
            {loggingOut ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="h-3.5 w-3.5" />
            )}
            Esci dal network
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ProfileField({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5 px-1 py-1">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "text-xs text-foreground truncate",
            mono && "font-mono",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function MobileLogoutButton({
  onBeforeLogout,
}: {
  onBeforeLogout?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  async function doLogout() {
    setLoading(true);
    try {
      onBeforeLogout?.();
      await fetch("/api/network/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    window.location.href = "/";
  }
  return (
    <button
      type="button"
      onClick={doLogout}
      disabled={loading}
      className="inline-flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      Esci dal network
    </button>
  );
}
