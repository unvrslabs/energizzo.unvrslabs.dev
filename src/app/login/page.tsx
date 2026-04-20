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
      <div className="glass w-full max-w-md rounded-lg p-8 glow-primary">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary shadow-lg shadow-primary/40">
            <Zap className="h-7 w-7 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-3xl font-bold gradient-text">ENERGIZZO CRM</h1>
          <p className="text-sm text-muted-foreground">Accedi al pannello reseller</p>
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
          <Button type="submit" disabled={loading} className="w-full">
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
          className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {mode === "login" ? "Crea il tuo account" : "Hai già un account? Accedi"}
        </button>
      </div>
    </div>
  );
}
