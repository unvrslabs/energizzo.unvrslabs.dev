import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Zap, LogOut, Users2, Target } from "lucide-react";
import { signOut } from "@/actions/auth";
import { NavLinks } from "@/components/nav-links";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <div className="sticky top-4 z-40 px-4 md:px-6 pt-4 pb-2">
        <header className="liquid-glass-nav mx-auto max-w-[1600px] rounded-full px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 shadow-md shadow-primary/40">
              <Zap className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div className="hidden md:block">
              <h1 className="font-display text-sm font-black tracking-[0.1em] gradient-text leading-none">
                ENERGIZZO
              </h1>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground leading-none mt-1">
                CRM Reseller
              </p>
            </div>
          </Link>
          <NavLinks
            items={[
              { href: "/dashboard", label: "Lead", icon: "users" },
              { href: "/dashboard/strategia", label: "Strategia", icon: "target" },
            ]}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden lg:block">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-full px-3 h-9 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Esci</span>
              </button>
            </form>
          </div>
        </header>
      </div>
      <main className="mx-auto max-w-[1600px] px-4 md:px-6 py-4">{children}</main>
    </div>
  );
}
