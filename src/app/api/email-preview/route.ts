import { NextResponse, type NextRequest } from "next/server";
import { render } from "@react-email/render";
import { createClient } from "@/lib/supabase/server";
import { getAdminMember } from "@/lib/admin/session";
import SurveyInviteEmail from "@/emails/SurveyInviteEmail";
import { getSurveyUrl } from "@/lib/public-urls";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  const admin = await getAdminMember();
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const leadId = searchParams.get("lead_id");
  const format = searchParams.get("format") || "html";
  if (!leadId || !UUID_REGEX.test(leadId)) {
    return NextResponse.json({ error: "lead_id mancante o non valido" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .select("id, ragione_sociale, survey_token")
    .eq("id", leadId)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!lead) {
    return NextResponse.json({ error: "Lead non trovato" }, { status: 404 });
  }

  const props = {
    companyName: lead.ragione_sociale,
    recipientName: searchParams.get("recipient_name") ?? undefined,
    customMessage: searchParams.get("custom_message") ?? undefined,
    senderName: searchParams.get("sender_name") ?? undefined,
    senderRole: searchParams.get("sender_role") ?? undefined,
    videoUrl: searchParams.get("video_url") ?? undefined,
    videoThumbnailUrl: searchParams.get("video_thumbnail_url") ?? undefined,
    surveyUrl: getSurveyUrl(lead.survey_token),
  };

  if (format === "text") {
    const text = await render(SurveyInviteEmail(props), { plainText: true });
    return new NextResponse(text, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const html = await render(SurveyInviteEmail(props));
  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
