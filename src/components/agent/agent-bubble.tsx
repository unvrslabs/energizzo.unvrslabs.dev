"use client";

import { useState } from "react";
import { Sparkles, X, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentChat } from "./agent-chat";

export function AgentBubble() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Apri assistente"
        className={cn(
          "fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all",
          "bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground",
          "hover:scale-110 active:scale-95",
          open && "scale-90 opacity-0 pointer-events-none",
        )}
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* Panel */}
      {open && (
        <div
          className={cn(
            "fixed z-50 liquid-glass rounded-2xl shadow-2xl border border-white/10 flex flex-col",
            expanded
              ? "inset-5 md:inset-10"
              : "bottom-5 right-5 w-[min(calc(100vw-2.5rem),440px)] h-[min(calc(100vh-2.5rem),640px)]",
          )}
        >
          <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">Assistente</span>
                <span className="text-[10px] text-muted-foreground">Claude Sonnet 4.6</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setExpanded((v) => !v)}
                aria-label={expanded ? "Minimizza" : "Espandi"}
                className="h-8 w-8 rounded-full hover:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                {expanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Chiudi"
                className="h-8 w-8 rounded-full hover:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>
          <div className="flex-1 min-h-0 p-3">
            <AgentChat compact />
          </div>
        </div>
      )}
    </>
  );
}
