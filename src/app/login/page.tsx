"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Zap, LogIn, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Accesso effettuato");
        router.push("/dashboard");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Account creato. Verifica l'email se richiesto.");
        setMode("login");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Errore imprevisto";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="liquid-glass-card w-full max-w-md p-10 animate-pulse-glow">
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/50">
            <Zap className="h-8 w-8 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-semibold text-primary tracking-[0.15em] uppercase">
                Reseller Italia
              </span>
            </div>
            <h1 className="font-display text-4xl font-black tracking-tight gradient-text">
              ENERGIZZO CRM
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Accedi al pannello</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.it"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading} size="lg" className="w-full">
            {mode === "login" ? (
              <>
                <LogIn /> {loading ? "Accesso..." : "Accedi"}
              </>
            ) : (
              <>
                <UserPlus /> {loading ? "Creazione..." : "Crea account"}
              </>
            )}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-5 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {mode === "login" ? "Crea il tuo account" : "Hai già un account? Accedi"}
        </button>
      </div>
    </div>
  );
}
