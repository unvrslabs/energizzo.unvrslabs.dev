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
  referente: z.string().min(2).max(120).optional(),
});

const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX_PER_IP = 10;

function clientIp(req: NextRequest): string | null {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null
  );
}

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
  const ip = clientIp(req);

  // Rate limit per IP: max 10 tentativi/ora, protezione contro token enumeration
  if (ip) {
    const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    const { count } = await supabase
      .from("network_members")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since);
    if ((count ?? 0) >= RATE_MAX_PER_IP * 5) {
      return NextResponse.json(
        { ok: false, error: "Troppi tentativi. Riprova più tardi." },
        { status: 429 },
      );
    }
  }

  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .select("id, ragione_sociale, piva, survey_completed_at")
    .eq("survey_token", parsed.token)
    .maybeSingle();

  if (leadErr) {
    console.error("activate-invite lead lookup failed", leadErr);
    return NextResponse.json(
      { ok: false, error: "Errore temporaneo. Riprova." },
      { status: 500 },
    );
  }
  if (!lead) {
    return NextResponse.json(
      { ok: false, error: "Invito non trovato o scaduto." },
      { status: 404 },
    );
  }

  // Il token è valido SOLO se la survey è stata completata.
  // Blocca enumeration + accesso tramite token rubato/ereditato.
  if (!lead.survey_completed_at) {
    return NextResponse.json(
      { ok: false, error: "Completa prima la survey di invito." },
      { status: 403 },
    );
  }

  // Single-use per azienda: se esiste già un member attivo per questa P.IVA,
  // non permettere di aggiungerne altri (blocca hijack del token)
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
        return NextResponse.json({ ok: true, already: true });
      }
      return NextResponse.json(
        {
          ok: false,
          error:
            "Invito già attivato per questa azienda. Se il numero è cambiato, contatta l'admin.",
        },
        { status: 409 },
      );
    }
  }

  const { data: existingByPhone } = await supabase
    .from("network_members")
    .select("id, piva, revoked_at")
    .eq("phone", phone)
    .maybeSingle();

  if (existingByPhone) {
    if (existingByPhone.revoked_at) {
      // Member revocato → richiede re-approvazione admin, non auto-reinstatement.
      return NextResponse.json(
        { ok: false, error: "Accesso revocato. Contatta l'admin." },
        { status: 403 },
      );
    }
    // Stesso numero, stessa azienda: retry idempotente (in realtà il ramo PIVA
    // sopra lo gestisce già; qui è un fallback se lead.piva è nullo).
    if (lead.piva && existingByPhone.piva === lead.piva) {
      return NextResponse.json({ ok: true, already: true });
    }
    // Numero già registrato su ALTRA azienda → blocca.
    return NextResponse.json(
      {
        ok: false,
        error:
          "Questo numero WhatsApp risulta già registrato nel network per un'altra azienda. Usa un numero diverso oppure contatta l'admin.",
      },
      { status: 409 },
    );
  }

  const referente =
    parsed.referente?.replace(/\s+/g, " ").trim() ||
    (lead.ragione_sociale.split(/\s+/)[0] ?? "").trim() ||
    "Reseller";

  const { error: insertErr } = await supabase.from("network_members").insert({
    phone,
    ragione_sociale: lead.ragione_sociale,
    piva: lead.piva,
    referente,
    notes: `Attivato da invito lead (survey_token ${parsed.token})`,
  });

  if (insertErr) {
    console.error("activate-invite insert failed", insertErr);
    // Duplicate key (race condition): trattiamo come already-activated
    if (insertErr.code === "23505") {
      return NextResponse.json({ ok: true, already: true });
    }
    return NextResponse.json(
      { ok: false, error: "Errore attivazione accesso. Riprova." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, already: false });
}
