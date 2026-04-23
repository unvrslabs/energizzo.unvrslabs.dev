import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  ragione_sociale: z.string().min(2).max(200),
  piva: z
    .string()
    .min(5)
    .max(20)
    .regex(/^[A-Za-z0-9]+$/, "P.IVA non valida"),
  referente: z.string().min(2).max(200),
  whatsapp: z
    .string()
    .min(6)
    .max(50)
    .regex(/^[+\d\s().-]+$/, "Numero WhatsApp non valido"),
});

const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX_PER_IP = 5;

function clientIp(req: NextRequest): string | null {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null
  );
}

function escapeMd(s: string): string {
  return s.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

function notifyTelegram(payload: z.infer<typeof BodySchema>): Promise<void> {
  const botToken = process.env.TELEGRAM_PODCAST_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_PODCAST_CHAT_ID;
  if (!botToken || !chatId) return Promise.resolve();

  const waDigits = payload.whatsapp.replace(/\D/g, "");
  const lines = [
    "🔒 *Nuova richiesta network — Il Dispaccio*",
    "",
    `*Azienda*: ${escapeMd(payload.ragione_sociale)}`,
    `*P\\.IVA*: ${escapeMd(payload.piva)}`,
    `*Referente*: ${escapeMd(payload.referente)}`,
    `*WhatsApp*: [${escapeMd(payload.whatsapp)}](https://wa.me/${waDigits})`,
  ];

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 8000);
  return fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: lines.join("\n"),
      parse_mode: "MarkdownV2",
      disable_web_page_preview: true,
    }),
    signal: ctrl.signal,
  })
    .then(() => {})
    .catch((e) => {
      console.error("telegram notify failed", e);
    })
    .finally(() => clearTimeout(timeout));
}

export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { ok: false, error: "Compila correttamente tutti i campi." },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const ip = clientIp(req);
  const userAgent = req.headers.get("user-agent") ?? null;

  // Rate limit per IP: max 5 richieste/ora (anti-spam)
  if (ip) {
    const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    const { count, error: countErr } = await supabase
      .from("network_join_requests")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", since);
    if (countErr) {
      console.error("network_join rate-limit query failed", countErr);
    } else if ((count ?? 0) >= RATE_MAX_PER_IP) {
      return NextResponse.json(
        { ok: false, error: "Troppe richieste. Riprova più tardi." },
        { status: 429 },
      );
    }
  }

  const { error } = await supabase.from("network_join_requests").insert({
    ragione_sociale: parsed.ragione_sociale.trim(),
    piva: parsed.piva.trim().toUpperCase(),
    referente: parsed.referente.trim(),
    whatsapp: parsed.whatsapp.trim(),
    ip,
    user_agent: userAgent,
  });

  if (error) {
    console.error("network_join insert error", error);
    return NextResponse.json(
      { ok: false, error: "Impossibile registrare la richiesta." },
      { status: 500 },
    );
  }

  // fire-and-forget — non bloccare la response
  void notifyTelegram(parsed);

  return NextResponse.json({ ok: true });
}
