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

const DEFAULT_ADMIN_SUGGESTIONS = [
  "Mostrami le bozze social non schedulate",
  "Schedula tutti i post di oggi alle 09:00 e 15:00",
  "Crea un post educational sul PUN con hero AI",
  "Quante delibere alta importanza abbiamo in DB?",
  "Cancella le bozze auto più vecchie di 48h",
  "Genera un teaser podcast per il prossimo episodio",
];

function loadMessages(key: string): Msg[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as Msg[];
  } catch {
    return [];
  }
}
function saveMessages(key: string, m: Msg[]) {
  try {
    localStorage.setItem(key, JSON.stringify(m));
  } catch {
    /* noop */
  }
}

type MentionItem = {
  id: number;
  numero: string | null;
  titolo: string;
  data: string | null;
  settore: string | null;
  importanza: string | null;
  has_analysis: boolean;
};

export function AgentChatDrawer({
  open,
  onClose,
  endpoint = "/api/agent-chat",
  storageKey = "ild-agent-chat-v1",
  title = "Agente Il Dispaccio",
  subtitle = "Sonnet 4.5 · full DB + codebase",
  intro = "Chiedimi qualsiasi cosa. Posso creare/modificare/eliminare post social, leggere dati DB, generare contenuti con AI, schedulare pubblicazioni, eseguire SQL.",
  suggestions = DEFAULT_ADMIN_SUGGESTIONS,
  mentionEndpoint,
}: {
  open: boolean;
  onClose: () => void;
  endpoint?: string;
  storageKey?: string;
  title?: string;
  subtitle?: string;
  intro?: string;
  suggestions?: string[];
  /** Se presente, abilita menu @ per menzione delibere. */
  mentionEndpoint?: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Mention @ state
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionResults, setMentionResults] = useState<MentionItem[]>([]);
  const [mentionIdx, setMentionIdx] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);

  // Fetch mention quando query cambia
  useEffect(() => {
    if (!mentionOpen || !mentionEndpoint) return;
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const url = `${mentionEndpoint}?q=${encodeURIComponent(mentionQuery)}`;
        const res = await fetch(url, { signal: ctl.signal });
        const data = await res.json();
        if (data.ok && Array.isArray(data.items)) {
          setMentionResults(data.items as MentionItem[]);
          setMentionIdx(0);
        }
      } catch {
        /* noop */
      }
    }, 180);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [mentionQuery, mentionOpen, mentionEndpoint]);

  useEffect(() => {
    setMessages(loadMessages(storageKey));
  }, [storageKey]);

  useEffect(() => {
    saveMessages(storageKey, messages);
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, [messages, storageKey]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Gestisce typing: detect @query per mention mode
  const handleInputChange = (value: string, caret: number | null) => {
    setInput(value);
    if (!mentionEndpoint) return;
    // Trova l'ultimo @ prima del caret
    const pos = caret ?? value.length;
    const slice = value.slice(0, pos);
    const atIdx = slice.lastIndexOf("@");
    if (atIdx < 0) {
      setMentionOpen(false);
      return;
    }
    // @ deve essere inizio parola (o inizio stringa)
    const before = atIdx === 0 ? "" : slice[atIdx - 1];
    if (before && !/\s/.test(before)) {
      setMentionOpen(false);
      return;
    }
    const afterAt = slice.slice(atIdx + 1);
    // Se query contiene spazio dopo le prime parole chiudiamo
    if (/\s/.test(afterAt) && afterAt.length > 30) {
      setMentionOpen(false);
      return;
    }
    setMentionOpen(true);
    setMentionStart(atIdx);
    setMentionQuery(afterAt);
  };

  // Quando l'utente seleziona una delibera dal menu, sostituisce @... con chip testuale
  const pickMention = (m: MentionItem) => {
    if (mentionStart < 0) return;
    const chip = `@delibera:${m.id} (${m.numero ?? m.id})`;
    const before = input.slice(0, mentionStart);
    const after = input.slice(mentionStart + 1 + mentionQuery.length);
    const next = `${before}${chip}${after.startsWith(" ") ? "" : " "}${after}`;
    setInput(next);
    setMentionOpen(false);
    setMentionQuery("");
    setMentionStart(-1);
    // Focus back + position cursor dopo chip
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newPos = before.length + chip.length + 1;
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    });
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setError(null);
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
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
    localStorage.removeItem(storageKey);
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
                {title}
              </div>
              {subtitle ? (
                <div
                  className="v2-mono"
                  style={{
                    fontSize: 9.5,
                    color: "hsl(var(--v2-text-mute))",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                >
                  {subtitle}
                </div>
              ) : null}
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
                {intro}
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
                {suggestions.map((s) => (
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
            position: "relative",
          }}
        >
          {/* Menu mention @ */}
          {mentionOpen && mentionEndpoint && (
            <div
              role="listbox"
              style={{
                position: "absolute",
                left: 14,
                right: 14,
                bottom: "calc(100% - 6px)",
                background: "hsl(var(--v2-bg))",
                border: "1px solid hsl(var(--v2-border-strong))",
                borderRadius: 10,
                boxShadow: "0 -12px 32px hsl(0 0% 0% / 0.4)",
                maxHeight: 320,
                overflowY: "auto",
                zIndex: 5,
              }}
            >
              <div
                style={{
                  padding: "8px 12px",
                  borderBottom: "1px solid hsl(var(--v2-border))",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "hsl(var(--v2-text-mute))",
                  fontWeight: 700,
                }}
              >
                @ Cerca delibera · {mentionResults.length} match
              </div>
              {mentionResults.length === 0 ? (
                <div
                  style={{
                    padding: 14,
                    fontSize: 12,
                    color: "hsl(var(--v2-text-mute))",
                  }}
                >
                  Nessuna delibera trovata per &quot;{mentionQuery}&quot;
                </div>
              ) : (
                mentionResults.map((m, i) => {
                  const active = i === mentionIdx;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => pickMention(m)}
                      onMouseEnter={() => setMentionIdx(i)}
                      style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        padding: "9px 12px",
                        textAlign: "left",
                        background: active
                          ? "hsl(var(--v2-accent) / 0.14)"
                          : "transparent",
                        border: "none",
                        borderBottom: "1px solid hsl(var(--v2-border))",
                        cursor: "pointer",
                        color: "hsl(var(--v2-text))",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        <span className="v2-mono" style={{ color: "hsl(var(--v2-accent))" }}>
                          {m.numero ?? `#${m.id}`}
                        </span>
                        {!m.has_analysis && (
                          <span
                            className="v2-mono"
                            style={{
                              fontSize: 9,
                              padding: "1px 5px",
                              borderRadius: 3,
                              background: "hsl(var(--v2-warn) / 0.14)",
                              color: "hsl(var(--v2-warn))",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                            }}
                            title="Analisi AI non ancora generata — verrà creata al volo"
                          >
                            Nuova
                          </span>
                        )}
                        <span
                          className="v2-mono"
                          style={{
                            fontSize: 9.5,
                            color: "hsl(var(--v2-text-mute))",
                            marginLeft: "auto",
                          }}
                        >
                          {m.data ?? ""}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "hsl(var(--v2-text-dim))",
                          lineHeight: 1.35,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {m.titolo}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}

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
              onChange={(e) => handleInputChange(e.target.value, e.target.selectionStart)}
              onKeyDown={(e) => {
                if (mentionOpen && mentionResults.length > 0) {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setMentionIdx((i) => Math.min(mentionResults.length - 1, i + 1));
                    return;
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setMentionIdx((i) => Math.max(0, i - 1));
                    return;
                  }
                  if (e.key === "Enter" || e.key === "Tab") {
                    e.preventDefault();
                    const pick = mentionResults[mentionIdx];
                    if (pick) pickMention(pick);
                    return;
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setMentionOpen(false);
                    return;
                  }
                }
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder={
                mentionEndpoint
                  ? "Chiedi qualcosa… (@ per cercare una delibera, Enter per inviare)"
                  : "Chiedi qualcosa… (Enter per inviare, Shift+Enter = newline)"
              }
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

// Light markdown renderer per le risposte dell'agente.
// Supporta:
//  • **bold** → <strong>
//  • `code` inline → <code>
//  • righe che iniziano con "- ", "— ", "• ", "→ " → lista con bullet
//  • righe "## Titolo" → heading
//  • righe tutte MAIUSCOLE (4+ parole brevi) → mini heading
//  • paragrafi separati da righe vuote
function MarkdownLight({ text }: { text: string }) {
  const renderInline = (str: string, keyPrefix: string): React.ReactNode[] => {
    const out: React.ReactNode[] = [];
    // regex cattura **bold** o `code`
    const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let last = 0;
    let i = 0;
    for (const m of str.matchAll(regex)) {
      const idx = m.index ?? 0;
      if (idx > last) out.push(str.slice(last, idx));
      const piece = m[0];
      if (piece.startsWith("**")) {
        out.push(
          <strong key={`${keyPrefix}-b-${i++}`} style={{ fontWeight: 700, color: "hsl(var(--v2-text))" }}>
            {piece.slice(2, -2)}
          </strong>,
        );
      } else if (piece.startsWith("`")) {
        out.push(
          <code
            key={`${keyPrefix}-c-${i++}`}
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: "0.92em",
              padding: "1px 5px",
              borderRadius: 4,
              background: "hsl(var(--v2-bg-elev))",
              border: "1px solid hsl(var(--v2-border))",
              color: "hsl(var(--v2-accent))",
            }}
          >
            {piece.slice(1, -1)}
          </code>,
        );
      }
      last = idx + piece.length;
    }
    if (last < str.length) out.push(str.slice(last));
    return out;
  };

  // Split per blocchi separati da righe vuote
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let currentList: string[] | null = null;

  const flushList = () => {
    if (!currentList || currentList.length === 0) return;
    const items = [...currentList];
    currentList = null;
    blocks.push(
      <ul
        key={`ul-${blocks.length}`}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          margin: "2px 0",
          padding: 0,
          listStyle: "none",
        }}
      >
        {items.map((item, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              paddingLeft: 2,
            }}
          >
            <span
              aria-hidden
              style={{
                color: "hsl(var(--v2-accent))",
                flexShrink: 0,
                fontWeight: 700,
                lineHeight: 1.6,
              }}
            >
              ·
            </span>
            <span style={{ flex: 1 }}>{renderInline(item, `li-${i}`)}</span>
          </li>
        ))}
      </ul>,
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // Riga vuota → chiudi lista, spacer
    if (trimmed === "") {
      flushList();
      if (blocks.length > 0) {
        blocks.push(<div key={`sp-${i}`} style={{ height: 4 }} />);
      }
      continue;
    }

    // Heading "## Xxx"
    if (/^#{1,3}\s+/.test(trimmed)) {
      flushList();
      const lvl = trimmed.match(/^#+/)![0].length;
      const content = trimmed.replace(/^#+\s+/, "");
      blocks.push(
        <div
          key={`h-${i}`}
          style={{
            fontSize: lvl === 1 ? 15 : lvl === 2 ? 14 : 13,
            fontWeight: 700,
            color: "hsl(var(--v2-text))",
            marginTop: blocks.length > 0 ? 6 : 0,
            marginBottom: 2,
            letterSpacing: "-0.005em",
          }}
        >
          {renderInline(content, `h-${i}`)}
        </div>,
      );
      continue;
    }

    // Lista: - / — / • / →
    const listMatch = trimmed.match(/^(-|—|•|→)\s+(.+)$/);
    if (listMatch) {
      if (currentList == null) currentList = [];
      currentList.push(listMatch[2]);
      continue;
    }

    // Paragrafo normale
    flushList();
    blocks.push(
      <div key={`p-${i}`} style={{ whiteSpace: "pre-wrap" }}>
        {renderInline(raw, `p-${i}`)}
      </div>,
    );
  }
  flushList();
  return <>{blocks}</>;
}

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
                  lineHeight: 1.6,
                  color: "hsl(var(--v2-text))",
                  wordBreak: "break-word",
                }}
              >
                <MarkdownLight text={b.text} />
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
