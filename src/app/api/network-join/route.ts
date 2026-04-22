import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient as createSupabaseBrowserClient } from "@supabase/supabase-js";

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

function escapeMd(s: string): string {
  return s.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

async function notifyTelegram(payload: z.infer<typeof BodySchema>) {
  const botToken = process.env.TELEGRAM_PODCAST_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_PODCAST_CHAT_ID;
  if (!botToken || !chatId) return;

  const waDigits = payload.whatsapp.replace(/\D/g, "");
  const lines = [
    "🔒 *Nuova richiesta network — Il Dispaccio*",
    "",
    `*Azienda*: ${escapeMd(payload.ragione_sociale)}`,
    `*P\\.IVA*: ${escapeMd(payload.piva)}`,
    `*Referente*: ${escapeMd(payload.referente)}`,
    `*WhatsApp*: [${escapeMd(payload.whatsapp)}](https://wa.me/${waDigits})`,
  ];

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "MarkdownV2",
        disable_web_page_preview: true,
      }),
    });
  } catch (e) {
    console.error("telegram notify failed", e);
  }
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return NextResponse.json(
      { ok: false, error: "Configurazione server mancante." },
      { status: 500 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null;
  const userAgent = req.headers.get("user-agent") ?? null;

  const supabase = createSupabaseBrowserClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
  });

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

  await notifyTelegram(parsed);

  return NextResponse.json({ ok: true });
}
