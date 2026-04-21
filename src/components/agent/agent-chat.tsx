"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Send, Loader2, Terminal, FileCode, Database, Search, User, Bot, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type ContentBlock =
  | { type: "text"; text: string }
  | {
      type: "tool_use";
      id: string;
      name: string;
      input: Record<string, unknown>;
    }
  | {
      type: "tool_result";
      tool_use_id: string;
      content: string;
    };

type Message = {
  role: "user" | "assistant";
  content: string | ContentBlock[];
};

function isToolUseBlock(b: ContentBlock): b is Extract<ContentBlock, { type: "tool_use" }> {
  return b.type === "tool_use";
}

function isTextBlock(b: ContentBlock): b is Extract<ContentBlock, { type: "text" }> {
  return b.type === "text";
}

function isToolResultBlock(b: ContentBlock): b is Extract<ContentBlock, { type: "tool_result" }> {
  return b.type === "tool_result";
}

function toolIcon(name: string) {
  switch (name) {
    case "execute_sql":
      return Database;
    case "read_file":
      return FileCode;
    case "grep_code":
      return Search;
    case "list_files":
      return Terminal;
    default:
      return Sparkles;
  }
}

function toolLabel(name: string) {
  switch (name) {
    case "execute_sql":
      return "SQL";
    case "read_file":
      return "Read";
    case "grep_code":
      return "Grep";
    case "list_files":
      return "List";
    default:
      return name;
  }
}

export function AgentChat({ compact = false }: { compact?: boolean } = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.ok) {
        toast.error(payload.error ?? "Errore agente");
        return;
      }
      setMessages(payload.messages as Message[]);
    } catch {
      toast.error("Errore di rete");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMessages([]);
    setInput("");
  }

  return (
    <div className="flex flex-col h-full gap-3">
      {!compact && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-display text-2xl tracking-wide flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Assistente Claude Sonnet 4.6
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Accesso completo a DB (SQL) + lettura codice.
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={reset}
              className="text-xs text-muted-foreground hover:text-foreground px-3 h-8 rounded-full bg-white/5"
            >
              Nuova chat
            </button>
          )}
        </div>
      )}
      {compact && messages.length > 0 && (
        <div className="flex items-center justify-end">
          <button
            onClick={reset}
            className="text-xs text-muted-foreground hover:text-foreground px-3 h-7 rounded-full bg-white/5"
          >
            Nuova chat
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto liquid-glass rounded-2xl p-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-10">
            Digita una richiesta. L&apos;agente può eseguire SQL, leggere i file del codice e
            cercare nel repo.
          </div>
        )}
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> L&apos;agente sta lavorando...
          </div>
        )}
      </div>

      <form onSubmit={send} className="liquid-glass rounded-2xl p-2 flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Chiedi all'agente..."
          rows={2}
          className="flex-1 bg-transparent outline-none resize-none px-3 py-2 text-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="inline-flex items-center gap-2 rounded-full px-4 h-10 text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  // User messages: string content
  if (isUser && typeof message.content === "string") {
    return (
      <div className="flex gap-3 justify-end">
        <div className="liquid-glass rounded-2xl px-4 py-2.5 max-w-[80%] bg-primary/10">
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        </div>
        <div className="shrink-0 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
          <User className="h-4 w-4" />
        </div>
      </div>
    );
  }

  // User messages with tool results (returned from API after tool loop)
  if (isUser && Array.isArray(message.content)) {
    const toolResults = message.content.filter(isToolResultBlock);
    if (toolResults.length === 0) return null;
    return (
      <div className="flex gap-3">
        <div className="shrink-0 h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
          <Terminal className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 space-y-2">
          {toolResults.map((tr, i) => (
            <details key={i} className="liquid-glass rounded-xl p-3 text-xs">
              <summary className="cursor-pointer text-muted-foreground">
                Tool result (click per espandere)
              </summary>
              <pre className="mt-2 whitespace-pre-wrap break-all text-[11px] font-mono max-h-96 overflow-auto">
                {tr.content}
              </pre>
            </details>
          ))}
        </div>
      </div>
    );
  }

  // Assistant messages: array of content blocks
  if (!isUser && Array.isArray(message.content)) {
    return (
      <div className="flex gap-3">
        <div className="shrink-0 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          {message.content.map((block, i) => {
            if (isTextBlock(block)) {
              return (
                <div
                  key={i}
                  className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-a:text-primary prose-table:text-xs prose-code:text-primary prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.text}</ReactMarkdown>
                </div>
              );
            }
            if (isToolUseBlock(block)) {
              const Icon = toolIcon(block.name);
              return (
                <details
                  key={i}
                  className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-xs"
                >
                  <summary className="cursor-pointer flex items-center gap-2 text-primary">
                    <Icon className="h-3.5 w-3.5" /> {toolLabel(block.name)}
                    <span className="text-muted-foreground truncate">
                      {summarizeInput(block.name, block.input)}
                    </span>
                  </summary>
                  <pre className="mt-2 text-[11px] font-mono whitespace-pre-wrap break-all text-muted-foreground">
                    {JSON.stringify(block.input, null, 2)}
                  </pre>
                </details>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}

function summarizeInput(name: string, input: Record<string, unknown>): string {
  if (name === "execute_sql") {
    const q = String(input.query ?? "").replace(/\s+/g, " ").trim();
    return q.length > 80 ? q.slice(0, 80) + "…" : q;
  }
  if (name === "read_file") return String(input.path ?? "");
  if (name === "list_files") return String(input.pattern ?? "");
  if (name === "grep_code")
    return `${input.pattern ?? ""}${input.glob ? ` in ${input.glob}` : ""}`;
  return "";
}
