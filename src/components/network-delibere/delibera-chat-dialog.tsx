"use client";

import { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sparkles, Send, Bot, User, Loader2 } from "lucide-react";
import type { Delibera } from "@/lib/delibere/mock";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTED: string[] = [
  "In due righe, cosa devo fare io reseller?",
  "Chi è impattato e da quando?",
  "Che sanzioni rischio se non mi adeguo?",
  "Come cambia rispetto alla versione precedente?",
];

export function DeliberaChatDialog({
  open,
  onOpenChange,
  delibera,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  delibera: Delibera | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setMessages([
      {
        role: "assistant",
        content: delibera
          ? `Ciao, sono l'agente del Dispaccio sulla delibera ${delibera.code}. Chiedimi qualsiasi cosa: cosa cambia, cosa devi fare, quando, come impatta i tuoi contratti. Provo a risponderti in italiano operativo.`
          : "Ciao, sono l'agente del Dispaccio.",
      },
    ]);
    setInput("");
  }, [open, delibera]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  // Track virtual keyboard height on iOS/Android via VisualViewport so the
  // input stays pinned just above the keyboard instead of being pushed off
  // screen.
  useEffect(() => {
    if (!open) return;
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!vv) return;
    const root = document.documentElement;
    const update = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      root.style.setProperty("--kb-offset", `${offset}px`);
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      root.style.removeProperty("--kb-offset");
    };
  }, [open]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setInput("");
    setPending(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "🛠️ Presto qui risponderà l'agente AI del Dispaccio, addestrato sui testi integrali di ogni delibera ARERA pubblicata dal 2020 in poi. Stiamo ancora fine-tuning il modello — ci vediamo fra poco.",
        },
      ]);
      setPending(false);
    }, 700);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="flex flex-col overflow-hidden p-0 !h-[100dvh] !max-h-[100dvh]"
      >
        {/* Header — fixed height */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-white/10 bg-primary/5">
          <div className="flex items-center gap-2 pr-8">
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 border border-primary/30 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate">
                Agente AI · {delibera?.code ?? ""}
              </p>
              <p className="text-[11px] font-normal text-muted-foreground truncate">
                {delibera?.title ?? ""}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable chat area */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-3"
        >
          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} content={m.content} />
          ))}
          {pending && (
            <div className="flex items-start gap-2">
              <div className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 border border-primary/30 text-primary">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}

          {messages.length === 1 && !pending && (
            <div className="pt-2 space-y-1.5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                Prova a chiedere
              </p>
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="block w-full text-left rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer input — translates up with keyboard via --kb-offset */}
        <div
          className="shrink-0 border-t border-white/10 p-3 bg-[hsl(215,30%,12%)]/95 backdrop-blur-xl transition-transform duration-150"
          style={{
            paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
            transform: "translateY(calc(-1 * var(--kb-offset, 0px)))",
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Chiedi qualcosa sulla delibera…"
              disabled={pending}
              enterKeyHint="send"
              autoComplete="off"
              autoCorrect="off"
              /* text-base (16px) prevents iOS auto-zoom on focus */
              className="flex-1 min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 focus:bg-white/[0.06] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MessageBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full border ${
          isUser
            ? "bg-white/[0.06] border-white/15 text-muted-foreground"
            : "bg-primary/15 border-primary/30 text-primary"
        }`}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div
        className={`rounded-2xl max-w-[80%] px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? "rounded-tr-sm bg-primary/15 border border-primary/25 text-foreground"
            : "rounded-tl-sm border border-white/10 bg-white/[0.03] text-foreground"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
