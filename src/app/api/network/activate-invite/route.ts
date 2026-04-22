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

  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .select("id, ragione_sociale, piva")
    .eq("survey_token", parsed.token)
    .maybeSingle();

  if (leadErr || !lead) {
    return NextResponse.json(
      { ok: false, error: "Invito non trovato o scaduto." },
      { status: 404 },
    );
  }

  const { data: existingByPhone } = await supabase
    .from("network_members")
    .select("id, revoked_at")
    .eq("phone", phone)
    .maybeSingle();

  if (existingByPhone) {
    if (existingByPhone.revoked_at) {
      await supabase
        .from("network_members")
        .update({ revoked_at: null })
        .eq("id", existingByPhone.id);
    }
    return NextResponse.json({ ok: true, already: true });
  }

  const referente =
    (lead.ragione_sociale.split(/\s+/)[0] ?? "").trim() || "Reseller";

  const { error: insertErr } = await supabase.from("network_members").insert({
    phone,
    ragione_sociale: lead.ragione_sociale,
    piva: lead.piva,
    referente,
    notes: `Attivato da invito lead (survey_token ${parsed.token})`,
  });

  if (insertErr) {
    console.error("activate-invite insert failed", insertErr);
    return NextResponse.json(
      { ok: false, error: "Errore attivazione accesso. Riprova." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, already: false });
}
