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
      <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl bg-background/70">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6 gap-6">
          <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-primary shadow-md shadow-primary/30">
              <Zap className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div className="hidden md:block">
              <h1 className="font-display text-lg font-bold tracking-wider gradient-text leading-tight">
                ENERGIZZO CRM
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Reseller Italia
              </p>
            </div>
          </Link>
          <NavLinks
            items={[
              { href: "/dashboard", label: "Lead", icon: "users" },
              { href: "/dashboard/strategia", label: "Strategia", icon: "target" },
            ]}
          />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden lg:block">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Esci</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1600px] px-6 py-6">{children}</main>
    </div>
  );
}
