import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
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
        <header className="liquid-glass-nav mx-auto w-fit max-w-full rounded-full px-3 md:px-4 h-12 flex items-center justify-center gap-2 overflow-x-auto scroll-x-contained">
          <NavLinks
            items={[
              { href: "/dashboard", label: "Lead", icon: "users" },
              { href: "/dashboard/strategia", label: "Strategia", icon: "target" },
              { href: "/dashboard/podcast", label: "Podcast", icon: "mic" },
              { href: "/dashboard/agent", label: "Assistente", icon: "sparkles" },
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
