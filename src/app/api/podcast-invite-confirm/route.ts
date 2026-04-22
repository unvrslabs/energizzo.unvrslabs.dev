import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getGuestDashboardUrl } from "@/lib/public-urls";

const BodySchema = z.object({
  token: z.string().uuid(),
  name: z.string().min(1).max(200),
  whatsapp: z.string().min(5).max(50),
  availability: z.string().max(2000).nullable().optional(),
});

const EPISODE_LABELS: Record<string, string> = {
  "01-transizione-stg-mercato-libero": "01 · STG verso libero",
  "02-aste-stg-aggressive": "02 · Aste STG aggressive",
  "03-concentrazione-m-and-a": "03 · Concentrazione & M&A",
  "04-nuova-bolletta-2025": "04 · Nuova bolletta 2025",
  "05-ai-leva-di-margine": "05 · AI leva di margine",
  "06-recupero-crediti-post-2022": "06 · Recupero crediti post-2022",
  "07-cer-comunita-energetiche": "07 · CER",
  "08-telemarketing-teleselling": "08 · Telemarketing",
  "09-unbundling-marchio": "09 · Unbundling marchio",
  "10-smart-meter-gas": "10 · Smart meter gas",
};

type ConfirmResult = {
  ok: boolean;
  error?: string;
  guest_id?: string;
  guest_display?: string;
  piva?: string | null;
  episode_slug?: string | null;
  response_name?: string;
  response_whatsapp?: string;
  response_availability?: string | null;
};

function escapeMd(s: string): string {
  // Telegram MarkdownV2 escaping
  return s.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

async function notifyTelegram(r: ConfirmResult) {
  const botToken = process.env.TELEGRAM_PODCAST_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_PODCAST_CHAT_ID;
  if (!botToken || !chatId) return; // non bloccante se non configurato

  const waDigits = (r.response_whatsapp ?? "").replace(/\D/g, "");
  const episodeLabel = r.episode_slug ? EPISODE_LABELS[r.episode_slug] ?? r.episode_slug : "—";
  const guestUrl = r.guest_id ? getGuestDashboardUrl(r.guest_id) : "";

  const lines = [
    "🎙️ *Nuova conferma podcast*",
    "",
    `*Ospite*: ${escapeMd(r.response_name ?? "—")}`,
    `*Azienda*: ${escapeMd(r.guest_display ?? "—")}${
      r.piva ? ` \\(${escapeMd(r.piva)}\\)` : ""
    }`,
    `*WhatsApp*: [${escapeMd(r.response_whatsapp ?? "")}](https://wa.me/${waDigits})`,
    `*Episodio*: ${escapeMd(episodeLabel)}`,
  ];
  if (r.response_availability) {
    lines.push(`*Disponibilità*: ${escapeMd(r.response_availability)}`);
  }
  if (guestUrl) {
    lines.push("", `[Apri scheda ospite](${guestUrl})`);
  }

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
    return NextResponse.json({ ok: false, error: "Input non valido" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("confirm_podcast_invite", {
    p_token: parsed.token,
    p_name: parsed.name,
    p_whatsapp: parsed.whatsapp,
    p_availability: parsed.availability ?? null,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const result = data as ConfirmResult | null;
  if (!result || !result.ok) {
    return NextResponse.json(
      { ok: false, error: result?.error ?? "Errore" },
      { status: 400 },
    );
  }

  // fire-and-forget Telegram notification
  await notifyTelegram(result);

  return NextResponse.json({ ok: true });
}
