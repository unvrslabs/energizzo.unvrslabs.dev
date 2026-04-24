"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Loader2,
  Send,
  Sparkles,
  Terminal,
  Wrench,
  X,
} from "lucide-react";

// Tipi minimali per i messaggi Anthropic
type TextBlock = { type: "text"; text: string };
type ToolUseBlock = {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
};
type ToolResultBlock = {
  type: "tool_result";
  tool_use_id: string;
  content: string;
};
type ContentBlock = TextBlock | ToolUseBlock | ToolResultBlock;

type Msg =
  | { role: "user"; content: string | ContentBlock[] }
  | { role: "assistant"; content: ContentBlock[] };

const STORAGE_KEY = "ild-agent-chat-v1";

function loadMessages(): Msg[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Msg[];
  } catch {
    return [];
  }
}
function saveMessages(m: Msg[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
  } catch {
    /* noop */
  }
}

const SUGGESTIONS = [
  "Mostrami le bozze social non schedulate",
  "Schedula tutti i post di oggi alle 09:00 e 15:00",
  "Crea un post educational sul PUN con hero AI",
  "Quante delibere alta importanza abbiamo in DB?",
  "Cancella le bozze auto più vecchie di 48h",
  "Genera un teaser podcast per il prossimo episodio",
];

export function AgentChatDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  useEffect(() => {
    saveMessages(messages);
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setError(null);
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/agent-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
      }
      if (Array.isArray(data.messages)) {
        setMessages(data.messages as Msg[]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore di rete");
    } finally {
      setLoading(false);
    }
  };

  const resetConversation = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        display: "flex",
        justifyContent: "flex-end",
        pointerEvents: "none",
      }}
    >
      {/* Backdrop cliccabile, ma non intercetta click fuori se si vuole lavorare in parallelo */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "hsl(0 0% 0% / 0.35)",
          backdropFilter: "blur(3px)",
          pointerEvents: "auto",
        }}
      />
      <div
        className="v2-agent-chat"
        style={{
          position: "relative",
          width: "min(480px, 100vw)",
          height: "100%",
          background: "hsl(var(--v2-bg))",
          borderLeft: "1px solid hsl(var(--v2-border))",
          boxShadow: "-24px 0 48px hsl(0 0% 0% / 0.4)",
          display: "flex",
          flexDirection: "column",
          pointerEvents: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid hsl(var(--v2-border))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                display: "grid",
                placeItems: "center",
                background: "hsl(var(--v2-accent) / 0.14)",
                border: "1px solid hsl(var(--v2-accent) / 0.32)",
                color: "hsl(var(--v2-accent))",
              }}
            >
              <Sparkles className="w-4 h-4" strokeWidth={2} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "hsl(var(--v2-text))",
                  lineHeight: 1.2,
                }}
              >
                Agente Il Dispaccio
              </div>
              <div
                className="v2-mono"
                style={{
                  fontSize: 9.5,
                  color: "hsl(var(--v2-text-mute))",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}
              >
                Sonnet 4.5 · full DB + codebase
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={resetConversation}
                style={{
                  fontSize: 10.5,
                  color: "hsl(var(--v2-text-mute))",
                  background: "transparent",
                  border: "1px solid hsl(var(--v2-border))",
                  padding: "5px 10px",
                  borderRadius: 7,
                  cursor: "pointer",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
                title="Nuova conversazione"
              >
                Nuova
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Chiudi"
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                display: "grid",
                placeItems: "center",
                background: "transparent",
                color: "hsl(var(--v2-text-mute))",
                border: "1px solid hsl(var(--v2-border))",
                cursor: "pointer",
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                padding: "8px 0",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "hsl(var(--v2-text-dim))",
                  lineHeight: 1.55,
                }}
              >
                Chiedimi qualsiasi cosa. Posso creare/modificare/eliminare post
                social, leggere dati DB, generare contenuti con AI, schedulare
                pubblicazioni, eseguire SQL.
              </div>
              <div
                className="v2-mono"
                style={{
                  fontSize: 9.5,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "hsl(var(--v2-text-mute))",
                  fontWeight: 600,
                }}
              >
                // Prova:
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    style={{
                      textAlign: "left",
                      fontSize: 12.5,
                      color: "hsl(var(--v2-text))",
                      background: "hsl(var(--v2-card))",
                      border: "1px solid hsl(var(--v2-border))",
                      padding: "10px 12px",
                      borderRadius: 9,
                      cursor: "pointer",
                      transition: "all 140ms",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "hsl(var(--v2-accent) / 0.4)";
                      e.currentTarget.style.background = "hsl(var(--v2-accent) / 0.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "hsl(var(--v2-border))";
                      e.currentTarget.style.background = "hsl(var(--v2-card))";
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <MessageBubble key={i} msg={m} />
          ))}

          {loading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "hsl(var(--v2-text-mute))",
                fontSize: 12,
              }}
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="v2-mono" style={{ letterSpacing: "0.1em" }}>
                Elaboro…
              </span>
            </div>
          )}

          {error && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "hsl(var(--v2-danger) / 0.1)",
                border: "1px solid hsl(var(--v2-danger) / 0.3)",
                color: "hsl(var(--v2-danger))",
                fontSize: 12,
              }}
            >
              Errore: {error}
            </div>
          )}
        </div>

        {/* Input */}
        <div
          style={{
            padding: "12px 14px 14px",
            borderTop: "1px solid hsl(var(--v2-border))",
            background: "hsl(var(--v2-bg))",
            flexShrink: 0,
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
              background: "hsl(var(--v2-card))",
              border: "1px solid hsl(var(--v2-border))",
              borderRadius: 10,
              padding: 8,
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Chiedi qualcosa… (Enter per inviare, Shift+Enter = newline)"
              rows={1}
              style={{
                flex: 1,
                resize: "none",
                background: "transparent",
                border: "none",
                color: "hsl(var(--v2-text))",
                fontSize: 13,
                fontFamily: "inherit",
                outline: "none",
                minHeight: 22,
                maxHeight: 160,
                lineHeight: 1.5,
              }}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                display: "grid",
                placeItems: "center",
                background: input.trim() && !loading ? "hsl(var(--v2-accent))" : "hsl(var(--v2-border))",
                color: input.trim() && !loading ? "hsl(215 30% 10%)" : "hsl(var(--v2-text-mute))",
                border: "none",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                transition: "all 140ms",
                flexShrink: 0,
              }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── MESSAGE BUBBLE ─────────────────────────────────────────

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";

  if (isUser) {
    const text =
      typeof msg.content === "string"
        ? msg.content
        : msg.content
            .filter((b): b is TextBlock => b.type === "text")
            .map((b) => b.text)
            .join("\n");
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingLeft: 48,
        }}
      >
        <div
          style={{
            background: "hsl(var(--v2-accent) / 0.12)",
            border: "1px solid hsl(var(--v2-accent) / 0.3)",
            borderRadius: 12,
            borderTopRightRadius: 4,
            padding: "9px 13px",
            fontSize: 13,
            lineHeight: 1.5,
            color: "hsl(var(--v2-text))",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            maxWidth: "100%",
          }}
        >
          {text}
        </div>
      </div>
    );
  }

  // Assistant: può avere text blocks + tool_use blocks
  const blocks = Array.isArray(msg.content) ? msg.content : [];
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 7,
          display: "grid",
          placeItems: "center",
          background: "hsl(var(--v2-accent) / 0.14)",
          border: "1px solid hsl(var(--v2-accent) / 0.32)",
          color: "hsl(var(--v2-accent))",
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <Bot className="w-3.5 h-3.5" />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
        {blocks.map((b, i) => {
          if (b.type === "text") {
            return (
              <div
                key={i}
                style={{
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: "hsl(var(--v2-text))",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {b.text}
              </div>
            );
          }
          if (b.type === "tool_use") {
            const isSql = b.name === "execute_sql";
            const isGen = b.name === "generate_social_post";
            const query = isSql ? String((b.input as { query?: string }).query ?? "") : "";
            return (
              <div
                key={i}
                style={{
                  fontSize: 11.5,
                  fontFamily: "var(--font-mono), monospace",
                  color: "hsl(var(--v2-text-dim))",
                  background: "hsl(var(--v2-bg-elev))",
                  border: "1px solid hsl(var(--v2-border))",
                  borderRadius: 7,
                  padding: "8px 10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "hsl(var(--v2-accent))",
                    fontWeight: 700,
                  }}
                >
                  {isSql ? <Terminal className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                  {b.name}
                </div>
                {isSql && (
                  <code
                    style={{
                      fontSize: 11,
                      color: "hsl(var(--v2-text))",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}
                  >
                    {query.slice(0, 400)}
                    {query.length > 400 ? "…" : ""}
                  </code>
                )}
                {isGen && (
                  <code
                    style={{ fontSize: 11, color: "hsl(var(--v2-text-dim))" }}
                  >
                    tipo={String((b.input as Record<string, unknown>).tipo ?? "?")}
                    {(b.input as Record<string, unknown>).force_ai
                      ? " · force_ai"
                      : ""}
                  </code>
                )}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
