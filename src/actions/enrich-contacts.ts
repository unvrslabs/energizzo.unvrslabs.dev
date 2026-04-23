"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/session";

const Input = z.object({ lead_id: z.string().uuid(), piva: z.string().min(8) });

type Manager = {
  name?: string | null;
  surname?: string | null;
  taxCode?: string | null;
  birthDate?: string | null;
  birthTown?: string | null;
  age?: number | null;
  gender?: { code?: string | null; description?: string | null } | null;
  isLegalRepresentative?: boolean | null;
  roles?: {
    role?: { code?: string | null; description?: string | null } | null;
    roleStartDate?: string | null;
  }[];
};

type ShareholderInfo = {
  name?: string | null;
  surname?: string | null;
  companyName?: string | null;
  taxCode?: string | null;
  town?: string | null;
  sinceDate?: string | null;
};

type Shareholder = {
  shareholdersInformation?: ShareholderInfo[];
  percentShare?: number | null;
};

type ContactRow = {
  lead_id: string;
  full_name: string;
  role: string | null;
  role_code: string | null;
  role_start: string | null;
  birth_date: string | null;
  birth_place: string | null;
  tax_code: string | null;
  is_legal_rep: boolean;
  gender: string | null;
  percent_share: number | null;
  linkedin_url: string | null;
  source: string;
  raw: Manager | Shareholder;
};

export async function enrichContacts(input: unknown) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  const parsed = Input.parse(input);
  const token = process.env.OPENAPI_COMPANY_TOKEN || process.env.OPENAPI_TOKEN;
  if (!token) {
    return { ok: false as const, error: "OPENAPI_COMPANY_TOKEN mancante in .env.local" };
  }

  const supabase = await createClient();
  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .select("ragione_sociale")
    .eq("id", parsed.lead_id)
    .maybeSingle();
  if (leadErr) {
    return { ok: false as const, error: `Errore lettura lead: ${leadErr.message}` };
  }
  if (!lead) {
    return { ok: false as const, error: "Lead non trovato." };
  }
  const company = lead.ragione_sociale ?? "";

  try {
    const resp = await fetch(
      `https://company.openapi.com/IT-full/${encodeURIComponent(parsed.piva)}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } },
    );
    if (!resp.ok) {
      const body = await resp.text();
      const { error: updErr } = await supabase
        .from("leads")
        .update({ contacts_error: `HTTP ${resp.status}: ${body.slice(0, 200)}` })
        .eq("id", parsed.lead_id);
      if (updErr) console.error("enrich-contacts: failed to record OpenAPI error", updErr);
      return { ok: false as const, error: `OpenAPI HTTP ${resp.status}` };
    }
    const json = await resp.json();
    const root = Array.isArray(json?.data) ? json.data[0] : json?.data;
    if (!root) {
      return { ok: false as const, error: "Risposta OpenAPI vuota" };
    }

    const managers: Manager[] = Array.isArray(root.managers) ? root.managers : [];
    const shareholders: Shareholder[] = Array.isArray(root.shareholders) ? root.shareholders : [];

    const contacts: ContactRow[] = [];

    for (const m of managers) {
      const fullName = buildName(m.name, m.surname);
      if (!fullName) continue;
      const primaryRole = m.roles?.[0]?.role;
      contacts.push({
        lead_id: parsed.lead_id,
        full_name: fullName,
        role: primaryRole?.description ?? null,
        role_code: primaryRole?.code ?? null,
        role_start: isoDate(m.roles?.[0]?.roleStartDate),
        birth_date: isoDate(m.birthDate),
        birth_place: m.birthTown ?? null,
        tax_code: m.taxCode ?? null,
        is_legal_rep: Boolean(m.isLegalRepresentative),
        gender: m.gender?.code ?? null,
        percent_share: null,
        linkedin_url: linkedInSearchUrl(fullName, company),
        source: "manager",
        raw: m,
      });
    }

    for (const s of shareholders) {
      for (const info of s.shareholdersInformation ?? []) {
        const fullName = buildName(info.name, info.surname);
        if (!fullName) continue;
        if (contacts.some((c) => c.tax_code && c.tax_code === info.taxCode)) continue;
        contacts.push({
          lead_id: parsed.lead_id,
          full_name: fullName,
          role: "Socio",
          role_code: "SOC",
          role_start: isoDate(info.sinceDate),
          birth_date: null,
          birth_place: info.town ?? null,
          tax_code: info.taxCode ?? null,
          is_legal_rep: false,
          gender: null,
          percent_share: typeof s.percentShare === "number" ? s.percentShare : null,
          linkedin_url: linkedInSearchUrl(fullName, company),
          source: "shareholder",
          raw: s,
        });
      }
    }

    // Delete + insert non sono atomiche: se l'insert fallisce dopo il delete,
    // i vecchi contatti sono persi. Se non ci sono nuovi contatti validi, saltiamo
    // del tutto l'operazione per evitare wipe accidentale.
    if (contacts.length === 0) {
      return { ok: false as const, error: "Nessun contatto estratto dall'API. Contatti esistenti preservati." };
    }
    const { error: delErr } = await supabase
      .from("lead_contacts")
      .delete()
      .eq("lead_id", parsed.lead_id);
    if (delErr) {
      return { ok: false as const, error: `Delete vecchi contatti fallito: ${delErr.message}` };
    }
    const { error: insErr } = await supabase.from("lead_contacts").insert(contacts);
    if (insErr) {
      return { ok: false as const, error: insErr.message };
    }

    await supabase
      .from("leads")
      .update({ contacts_enriched_at: new Date().toISOString(), contacts_error: null })
      .eq("id", parsed.lead_id);

    revalidatePath("/dashboard");
    return { ok: true as const, count: contacts.length };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "errore sconosciuto";
    const { error: updErr } = await supabase
      .from("leads")
      .update({ contacts_error: msg })
      .eq("id", parsed.lead_id);
    if (updErr) console.error("enrich-contacts: failed to record error", updErr);
    return { ok: false as const, error: msg };
  }
}

function buildName(first?: string | null, last?: string | null): string {
  const f = (first ?? "").trim();
  const l = (last ?? "").trim();
  return `${f} ${l}`.trim();
}

function isoDate(s: string | null | undefined): string | null {
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) {
    const [, d, mo, y] = m;
    const yyyy = y.length === 2 ? `19${y}` : y;
    return `${yyyy}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

function linkedInSearchUrl(fullName: string, company: string): string {
  const q = `${fullName} ${company}`.trim();
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(q)}&origin=GLOBAL_SEARCH_HEADER`;
}
