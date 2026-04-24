import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhoneE164 } from "@/lib/network/phone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const BodySchema = z.object({
  token: z.string().regex(UUID_REGEX, "Token non valido"),
  whatsapp: z.string().min(6).max(30),
});

export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { ok: false, error: "Dati non validi." },
      { status: 400 },
    );
  }

  const phone = normalizePhoneE164(parsed.whatsapp);
  if (!phone) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Numero WhatsApp non valido. Usa il formato +39 333 1234567.",
      },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("id, piva")
    .eq("survey_token", parsed.token)
    .maybeSingle();
  if (!lead) {
    return NextResponse.json(
      { ok: false, error: "Invito non trovato o scaduto." },
      { status: 404 },
    );
  }

  const { data: existingByPhone } = await supabase
    .from("network_members")
    .select("id, piva, revoked_at")
    .eq("phone", phone)
    .maybeSingle();

  if (existingByPhone) {
    if (existingByPhone.revoked_at) {
      return NextResponse.json(
        { ok: false, error: "Accesso revocato. Contatta l'admin." },
        { status: 403 },
      );
    }
    if (lead.piva && existingByPhone.piva === lead.piva) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json(
      {
        ok: false,
        error:
          "Questo numero WhatsApp risulta già registrato nel network per un'altra azienda. Usa un numero diverso oppure contatta l'admin.",
      },
      { status: 409 },
    );
  }

  if (lead.piva) {
    const { data: existingByPiva } = await supabase
      .from("network_members")
      .select("id, phone, revoked_at")
      .eq("piva", lead.piva)
      .is("revoked_at", null)
      .limit(1);
    if (existingByPiva && existingByPiva.length > 0) {
      const existing = existingByPiva[0];
      if (existing.phone === phone) {
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json(
        {
          ok: false,
          error:
            "Invito già attivato per questa azienda con un altro numero. Contatta l'admin.",
        },
        { status: 409 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
